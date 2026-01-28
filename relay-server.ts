import express, { Request, Response } from "express";
import { createClient, AgentEvents } from "@deepgram/sdk";
import { WebSocket, WebSocketServer } from "ws";
import dotenv from "dotenv";
import http from "http";
import { generateGreeting, generatePrompt, getInterviewCategories, type InterviewConfig, type InterviewTemplateType } from "./resources/js/shared/interviewConfig";

dotenv.config();

const app = express();
const port = 8080;
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

if (!DEEPGRAM_API_KEY) {
    console.error("Error: DEEPGRAM_API_KEY is not set in .env");
    process.exit(1);
}

// Laravel API URL for internal calls (NOT the ngrok URL which points to this relay server)
// The relay server runs on port 8080, Laravel runs on port 8000
const LARAVEL_API_URL = process.env.LARAVEL_INTERNAL_URL || "http://127.0.0.1:8000";

// Session context type from Laravel API
interface SessionContext {
    success: boolean;
    context?: string;
    candidateName?: string;  // Candidate's name for personalized greeting
    metadata?: {
        job_title?: string;
        company_name?: string;
        stt_model?: string;
        voice_id?: string;
        stt_config?: {
            endpointing?: number;
            utterance_end_ms?: number;
            smart_format?: boolean;
            keywords?: string[];
        };
    };
    interview?: {
        interview_type?: string;
        difficulty_level?: string;
        duration_minutes?: number;
        custom_instructions?: string;
    };
}

// HTTP Endpoint for TwiML
app.post("/twilio/voice", (req: Request, res: Response) => {
    const host = req.headers.host;
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const wsProtocol = protocol === "https" ? "wss" : "ws";

    // Get session ID from query params
    const sessionId = (req.query.session || req.body.session || '') as string;
    const streamUrl = `${wsProtocol}://${host}/streams`;

    // TwiML to connect to the stream - use Parameter element to pass session ID
    // Twilio strips query params from WebSocket URLs, so we use Parameter instead
    const twiml = `
    <Response>
        <Connect>
            <Stream url="${streamUrl}">
                <Parameter name="sessionId" value="${sessionId}" />
            </Stream>
        </Connect>
    </Response>
    `;

    console.log("TwiML Generated with session:", sessionId);
    res.type("text/xml");
    res.send(twiml);
});

// Proxy Twilio callbacks to Laravel API
// Twilio sends callbacks to ngrok (this relay server on port 8080)
// but the actual API routes are in Laravel (port 8000)
app.post("/api/twilio/call-status", async (req: Request, res: Response) => {
    console.log("📞 Received Twilio call status callback, forwarding to Laravel...");
    try {
        const response = await fetch(`${LARAVEL_API_URL}/api/twilio/call-status`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(req.body).toString(),
        });
        const data = await response.text();
        res.status(response.status).send(data);
        console.log("✅ Call status forwarded successfully");
    } catch (err) {
        console.error("❌ Failed to forward call status:", err);
        res.status(500).send("Error forwarding request");
    }
});

app.post("/api/twilio/recording-status", async (req: Request, res: Response) => {
    console.log("🎤 Received Twilio recording status callback, forwarding to Laravel...");
    console.log("Recording data:", req.body);
    try {
        const response = await fetch(`${LARAVEL_API_URL}/api/twilio/recording-status`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(req.body).toString(),
        });
        const data = await response.text();
        res.status(response.status).send(data);
        console.log("✅ Recording status forwarded successfully");
    } catch (err) {
        console.error("❌ Failed to forward recording status:", err);
        res.status(500).send("Error forwarding request");
    }
});


wss.on("connection", async (ws, req) => {
    // Check if the path is /streams
    if (!req.url?.startsWith("/streams")) {
        console.log("Rejected connection to:", req.url);
        ws.close();
        return;
    }

    console.log("Twilio Media Stream Connected");

    let deepgram: ReturnType<ReturnType<typeof createClient>['agent']> | null = null;
    let streamSid: string | null = null;
    let deepgramReady = false;
    let audioBuffer: Buffer[] = [];
    let sessionContext: SessionContext | null = null;
    // Session ID will be extracted from Twilio's start event custom parameters
    let sessionId: string | null = null;
    // Time-aware pacing
    let interviewStartTime: number | null = null;
    let timeInjectionInterval: NodeJS.Timeout | null = null;

    // Category progress tracking for structured interviews
    type CategoryStatus = 'not_started' | 'completed' | 'partially_covered' | 'skipped';
    const categoryProgress: Map<string, CategoryStatus> = new Map();

    // Flag to prevent double-configuration
    let isConfigured = false;

    // Helper to fetch session context once we have the session ID
    const fetchSessionContext = async (sid: string) => {
        try {
            const response = await fetch(`${LARAVEL_API_URL}/api/sessions/${sid}/context`);
            sessionContext = await response.json() as SessionContext;
            console.log("✅ Session context loaded for session:", sid);
            console.log("   Job Title:", sessionContext?.metadata?.job_title);
            console.log("   Company:", sessionContext?.metadata?.company_name);

            // NOW that context is loaded, configure Deepgram if it's ready
            if (deepgramReady && !isConfigured) {
                configureDeepgramAgent();
            }
        } catch (err) {
            console.error("❌ Failed to fetch session context:", err);
        }
    };

    const deepgramClient = createClient(DEEPGRAM_API_KEY);

    // Connect to Deepgram
    console.log("Connecting to Deepgram Agent...");
    deepgram = deepgramClient.agent();

    // Log all events for debugging
    console.log("AgentEvents available:", AgentEvents);

    // CRITICAL DEBUG: Catch ALL events to see what's being emitted
    // This helps identify the correct event name for transcripts
    const originalEmit = deepgram.emit.bind(deepgram);
    deepgram.emit = function (event: string, ...args: any[]) {
        // Don't log Audio events (too many) or binary data
        if (event !== 'Audio' && event !== AgentEvents.Audio) {
            console.log(`[DEEPGRAM EVENT] ${event}:`, JSON.stringify(args).substring(0, 500));
        }
        return originalEmit(event, ...args);
    };

    // Build config object for shared functions
    const buildInterviewConfig = (): InterviewConfig => ({
        jobTitle: sessionContext?.metadata?.job_title,
        companyName: sessionContext?.metadata?.company_name,
        candidateName: sessionContext?.candidateName,  // For personalized greeting
        interviewType: (sessionContext?.interview?.interview_type as InterviewConfig['interviewType']) || 'screening',
        difficultyLevel: (sessionContext?.interview?.difficulty_level as InterviewConfig['difficultyLevel']) || 'mid',
        durationMinutes: sessionContext?.interview?.duration_minutes || 15,
        customInstructions: sessionContext?.interview?.custom_instructions || '',
        jobDescription: sessionContext?.context || '',
        sttModel: sessionContext?.metadata?.stt_model,
        voiceId: sessionContext?.metadata?.voice_id,
        sttConfig: {
            endpointing: sessionContext?.metadata?.stt_config?.endpointing,
            utteranceEndMs: sessionContext?.metadata?.stt_config?.utterance_end_ms,
            smartFormat: sessionContext?.metadata?.stt_config?.smart_format,
            keywords: sessionContext?.metadata?.stt_config?.keywords,
        }
    });

    // Use AgentEvents enum like the browser SDK does
    deepgram.on(AgentEvents.Open, () => {
        console.log("Connected to Deepgram (AgentEvents.Open)!");
        deepgramReady = true;

        // If session context is already loaded (unlikely but possible), configure now
        // Otherwise, wait for fetchSessionContext to complete
        if (sessionContext && !isConfigured) {
            configureDeepgramAgent();
        } else {
            console.log("⏳ Waiting for session context before configuring agent...");
        }
    });

    // Helper function to configure Deepgram agent with full context
    const configureDeepgramAgent = () => {
        if (isConfigured || !deepgram || !deepgramReady) {
            console.log("⚠️ Cannot configure: isConfigured=", isConfigured, "deepgramReady=", deepgramReady);
            return;
        }
        isConfigured = true;
        console.log("🚀 Configuring Deepgram agent with session context...");

        // Build config and use shared functions
        const interviewConfig = buildInterviewConfig();

        // Configure Agent with dynamic context
        deepgram!.configure({
            audio: {
                input: { encoding: "mulaw", sample_rate: 8000 },
                output: { encoding: "mulaw", sample_rate: 8000, container: "none" },
            },
            agent: {
                language: "en",
                greeting: generateGreeting(interviewConfig),
                listen: (() => {
                    const selectedModel = interviewConfig.sttModel || "flux-general-en";
                    const isFlux = selectedModel.startsWith("flux");
                    return {
                        provider: {
                            type: "deepgram",
                            model: selectedModel,
                            // Flux requires version: v2, and cannot use smart_format
                            ...(isFlux
                                ? { version: "v2" }
                                : {
                                    smart_format: interviewConfig.sttConfig?.smartFormat ?? false,
                                    keyterms: interviewConfig.sttConfig?.keywords,
                                }),
                        },
                    };
                })(),
                think: {
                    provider: { type: "open_ai", model: "gpt-5.1-chat-latest" },
                    prompt: generatePrompt(interviewConfig),
                    functions: [
                        {
                            name: "get_context",
                            description: "Retrieve information about the company, benefits, or job description.",
                            parameters: {
                                type: "object",
                                properties: {
                                    query: { type: "string", description: "The question or topic to search for." },
                                },
                            },
                        },
                        {
                            name: "update_interview_progress",
                            description: "Mark an interview CATEGORY as completed. You MUST call this for each category after covering its questions. Categories: intro, logistics, qualifications, interest (screening), core_knowledge, problem_solving, experience (technical), etc.",
                            parameters: {
                                type: "object",
                                properties: {
                                    category_id: { type: "string", description: 'Category ID (e.g., "logistics", "intro")' },
                                    status: { type: "string", enum: ["completed", "partially_covered", "skipped"] },
                                    notes: { type: "string", description: "Brief notes on what was covered" }
                                },
                                required: ["category_id", "status"],
                            },
                        },
                        {
                            name: "get_interview_checklist",
                            description: "Get required categories and their completion status. CRITICAL: Call this BEFORE end_interview to verify all required categories are complete.",
                            parameters: {
                                type: "object",
                                properties: {},
                            },
                        },
                        {
                            name: "end_interview",
                            description: "End the interview. IMPORTANT: First call get_interview_checklist() to verify all required categories are completed. Only proceed if ready_to_end is true.",
                            parameters: {
                                type: "object",
                                properties: {
                                    reason: { type: "string", description: "Values: 'all_categories_complete', 'candidate_request', 'time_limit_reached'" },
                                    summary: { type: "string", description: "Brief summary of the interview outcome" },
                                },
                            },
                        },
                        {
                            name: "recall_interview_memory",
                            description: "CRITICAL: Call this BEFORE asking questions to check what the candidate has ALREADY told you. Returns facts they shared (experience, salary, location, visa status, etc). If a topic is covered, DO NOT ask about it again.",
                            parameters: {
                                type: "object",
                                properties: {
                                    query: { type: "string", description: "Optional: semantic search query" },
                                },
                            },
                        },
                    ],
                },
                speak: {
                    provider: { type: "deepgram", model: interviewConfig.voiceId || "aura-2-asteria-en" },
                },
            },
        });

        console.log("Deepgram configured. Sending buffered audio...");
        // Send any buffered audio
        for (const audio of audioBuffer) {
            deepgram!.send(audio as any);
        }
        audioBuffer = [];

        // Start time-aware pacing: inject time updates periodically
        const durationMinutes = interviewConfig.durationMinutes || 15;
        interviewStartTime = Date.now();

        // Calculate injection interval: every 25% of interview or every 3 mins, whichever is smaller
        const injectionIntervalMs = Math.min(durationMinutes * 60 * 1000 * 0.25, 3 * 60 * 1000);

        timeInjectionInterval = setInterval(() => {
            if (!deepgram || !deepgramReady || !interviewStartTime) return;

            const elapsedMs = Date.now() - interviewStartTime;
            const elapsedMinutes = Math.floor(elapsedMs / 60000);
            const remainingMinutes = Math.max(0, durationMinutes - elapsedMinutes);

            // Build time context prompt addition
            let timeUpdate = `\n\n[TIME UPDATE: ${elapsedMinutes} minutes elapsed, approximately ${remainingMinutes} minutes remaining.]`;

            if (remainingMinutes <= 2) {
                timeUpdate += ` URGENT: Time is almost up! Wrap up with final questions and conclude the interview.`;
            } else if (remainingMinutes <= 5) {
                timeUpdate += ` Start preparing to wrap up. Ask any final essential questions.`;
            } else if (elapsedMinutes < 2) {
                timeUpdate += ` Interview just started. Take time to build rapport.`;
            } else {
                // Calculate pacing guidance
                const progressPercent = Math.round((elapsedMinutes / durationMinutes) * 100);
                timeUpdate += ` Progress: ${progressPercent}%. Pace your questions to use the full interview time.`;
            }

            console.log('⏱️ Injecting time context:', timeUpdate);
            deepgram!.updatePrompt(timeUpdate);
        }, injectionIntervalMs);
    };  // End of configureDeepgramAgent function

    // Also try string 'open' as fallback
    deepgram.on("open", () => {
        console.log("Connected to Deepgram (string 'open')!");
    });

    deepgram.on(AgentEvents.Close, () => {
        console.log("Deepgram Connection Closed");
        deepgramReady = false;
        // Clean up time injection interval
        if (timeInjectionInterval) {
            clearInterval(timeInjectionInterval);
            timeInjectionInterval = null;
        }
    });

    deepgram.on(AgentEvents.Error, (error: any) => {
        console.error("Deepgram Error:", error);
    });

    // Handle Audio from Deepgram -> Twilio
    deepgram.on(AgentEvents.Audio, (data: Buffer) => {
        // Audio data received - forwarding to Twilio
        if (ws.readyState === WebSocket.OPEN && streamSid) {
            const message = {
                event: "media",
                streamSid: streamSid,
                media: {
                    payload: Buffer.from(data).toString("base64"),
                },
            };
            ws.send(JSON.stringify(message));
        }
    });

    // Handle Function Calls (Tool Usage)
    deepgram.on(AgentEvents.FunctionCallRequest, async (data: any) => {
        console.log("Function Call Request:", data);

        // The event data has a `functions` array with each function call
        const functions = data.functions || [];

        for (const func of functions) {
            const { id: functionCallId, name: functionName, arguments: argsString } = func;

            // Parse the arguments JSON string
            let input: Record<string, any> = {};
            try {
                input = JSON.parse(argsString || '{}');
            } catch (parseErr) {
                console.error("Failed to parse function arguments:", parseErr);
            }

            console.log(`Processing function: ${functionName}, id: ${functionCallId}, input:`, input);

            if (functionName === "get_context") {
                try {
                    const response = await fetch(`${LARAVEL_API_URL}/api/agent/context`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            query: input?.query,
                            session_id: sessionId  // Pass session_id for context-aware RAG
                        }),
                    });
                    const apiData = await response.json() as { context?: string };

                    console.log("Sending function call response:", {
                        id: functionCallId,
                        name: functionName,
                        content: apiData.context || "No context found.",
                    });

                    deepgram!.functionCallResponse({
                        id: functionCallId,
                        name: functionName,
                        content: apiData.context || "No context found.",
                    });

                } catch (err) {
                    console.error("Error calling backend tool:", err);
                    deepgram!.functionCallResponse({
                        id: functionCallId,
                        name: functionName,
                        content: "Error retrieving context.",
                    });
                }
            } else if (functionName === "end_interview") {
                // Handle interview termination
                console.log("🔴 AI requested to end interview:", {
                    reason: input?.reason,
                    summary: input?.summary,
                });

                // Acknowledge the function call
                deepgram!.functionCallResponse({
                    id: functionCallId,
                    name: functionName,
                    content: "Interview ended successfully. Goodbye!",
                });

                // Notify Backend to end session and start analysis
                if (sessionId) {
                    try {
                        await fetch(`${LARAVEL_API_URL}/api/sessions/${sessionId}/end`, {
                            method: "POST",
                        });
                        console.log("Backend notified of session end.");
                    } catch (err) {
                        console.error("Failed to notify backend of session end:", err);
                    }
                }

                // Give the AI time to say goodbye, then disconnect
                setTimeout(() => {
                    console.log("Disconnecting call after AI goodbye...");
                    if (deepgram) {
                        deepgram.disconnect();
                    }
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.close();
                    }
                }, 5000); // 5 seconds for goodbye message to play

            } else if (functionName === "update_interview_progress") {
                // Handle category progress tracking
                const categoryId = input?.category_id;
                const status = input?.status || "completed";
                const notes = input?.notes || "";

                console.log("📋 Updating category progress:", { categoryId, status, notes });

                // Update local tracking
                categoryProgress.set(categoryId, status);

                // Save to backend
                if (sessionId) {
                    fetch(`${LARAVEL_API_URL}/api/sessions/${sessionId}/progress`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            action: "mark_category_complete",
                            payload: { category_id: categoryId, status, notes }
                        })
                    }).catch(err => console.error("Failed to save progress:", err));
                }

                deepgram!.functionCallResponse({
                    id: functionCallId,
                    name: functionName,
                    content: `✓ Category "${categoryId}" marked as ${status}. Continue with remaining categories.`,
                });

            } else if (functionName === "get_interview_checklist") {
                // Handle checklist query
                console.log("📋 Getting interview checklist");

                const interviewType = (buildInterviewConfig().interviewType || "screening") as InterviewTemplateType;
                const categories = getInterviewCategories(interviewType);

                // Build checklist with current status
                const checklist = categories.map(cat => {
                    const status = categoryProgress.get(cat.id) || "not_started";
                    return {
                        id: cat.id,
                        name: cat.name,
                        required: cat.required,
                        status
                    };
                });

                // Find missing required categories
                const missingRequired = checklist
                    .filter(c => c.required && c.status === "not_started")
                    .map(c => c.id);

                const readyToEnd = missingRequired.length === 0;

                const result = {
                    categories: checklist,
                    ready_to_end: readyToEnd,
                    missing_required: missingRequired,
                    message: readyToEnd
                        ? "All required categories completed. You may end the interview."
                        : `STOP! You still need to cover: ${missingRequired.join(", ")}. Ask those questions before ending.`
                };

                console.log("📋 Checklist result:", result);

                deepgram!.functionCallResponse({
                    id: functionCallId,
                    name: functionName,
                    content: JSON.stringify(result),
                });

            } else if (functionName === "recall_interview_memory") {
                // Handle interview memory recall
                console.log("🧠 Recalling interview memory");

                if (sessionId) {
                    try {
                        const response = await fetch(`${LARAVEL_API_URL}/api/agent/recall`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                session_id: sessionId,
                                query: input?.query || null
                            }),
                        });
                        const memory = await response.json();

                        console.log("🧠 Memory recall result:", memory);

                        deepgram!.functionCallResponse({
                            id: functionCallId,
                            name: functionName,
                            content: JSON.stringify(memory),
                        });
                    } catch (err) {
                        console.error("Memory recall failed:", err);
                        deepgram!.functionCallResponse({
                            id: functionCallId,
                            name: functionName,
                            content: JSON.stringify({ covered_topics: [], facts: {}, instruction: "Memory unavailable" }),
                        });
                    }
                } else {
                    deepgram!.functionCallResponse({
                        id: functionCallId,
                        name: functionName,
                        content: JSON.stringify({ covered_topics: [], facts: {}, instruction: "No session" }),
                    });
                }

            } else {
                // Unknown function - respond with error to not leave it hanging
                console.warn(`Unknown function called: ${functionName}`);
                deepgram!.functionCallResponse({
                    id: functionCallId,
                    name: functionName,
                    content: "Function not implemented.",
                });
            }
        }
    });

    // Log conversation text events and persist to database
    deepgram.on(AgentEvents.ConversationText, async (data: any) => {
        console.log("Conversation text:", data);

        // Persist to database (same as web frontend does)
        if (sessionId && data.role && data.content) {
            const logUrl = `${LARAVEL_API_URL}/api/sessions/${sessionId}/log`;
            try {
                await fetch(logUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        speaker: data.role === "user" ? "candidate" : "agent",
                        message: data.content,
                        metadata: { timestamp: Date.now(), channel: "phone" },
                    }),
                });
            } catch (err) {
                console.error("Failed to persist conversation log:", err);
            }
        }
    });

    deepgram.on(AgentEvents.UserStartedSpeaking, () => {
        console.log("User started speaking");
    });

    deepgram.on(AgentEvents.AgentStartedSpeaking, () => {
        console.log("Agent started speaking");
    });

    // DEBUG: Catch unhandled events
    deepgram.on(AgentEvents.Unhandled, (data: any) => {
        console.log("UNHANDLED EVENT:", JSON.stringify(data).substring(0, 500));
    });

    // DEBUG: Log all other events
    deepgram.on(AgentEvents.Welcome, (data: any) => {
        console.log("Welcome event:", data);
    });

    deepgram.on(AgentEvents.SettingsApplied, (data: any) => {
        console.log("SettingsApplied event:", data);
    });

    deepgram.on(AgentEvents.AgentThinking, (data: any) => {
        console.log("AgentThinking event:", data);
    });

    deepgram.on(AgentEvents.AgentAudioDone, (data: any) => {
        console.log("AgentAudioDone event:", data);
    });


    // Handle Twilio -> Deepgram
    ws.on("message", (message: Buffer) => {
        const msg = JSON.parse(message.toString());

        switch (msg.event) {
            case "connected":
                console.log("Twilio: Connected Event");
                break;
            case "start":
                console.log("Twilio: Start Event, StreamSid:", msg.start.streamSid);
                console.log("Twilio: Custom Parameters:", JSON.stringify(msg.start.customParameters));
                streamSid = msg.start.streamSid;

                // Extract sessionId from custom parameters (passed via TwiML <Parameter>)
                if (msg.start.customParameters?.sessionId) {
                    sessionId = msg.start.customParameters.sessionId;
                    console.log("📍 Session ID extracted from Twilio:", sessionId);

                    // Fetch session context now that we have the sessionId
                    fetchSessionContext(sessionId!).catch((err) => {
                        console.error("❌ Failed to load session context:", err);
                    });
                } else {
                    console.warn("⚠️ No sessionId in Twilio custom parameters!");
                }
                break;
            case "media":
                // Buffer or send audio to Deepgram
                const audioData = Buffer.from(msg.media.payload, "base64");
                if (deepgramReady && deepgram?.getReadyState() === 1) {
                    deepgram.send(audioData as any);
                } else {
                    // Buffer audio until Deepgram is ready
                    audioBuffer.push(audioData);
                    if (audioBuffer.length % 100 === 0) {
                        console.log("Buffered audio chunks:", audioBuffer.length);
                    }
                }
                break;
            case "stop":
                console.log("Twilio: Stop Event");
                if (deepgram) deepgram.disconnect();
                break;
        }
    });

    ws.on("close", () => {
        console.log("Twilio Connection Closed");
        if (deepgram) deepgram.disconnect();
    });
});

server.listen(port, () => {
    console.log(`Relay server running on port ${port}`);
});
