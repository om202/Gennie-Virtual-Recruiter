import express, { Request, Response } from "express";
import { createClient, AgentEvents } from "@deepgram/sdk";
import { WebSocket, WebSocketServer } from "ws";
import dotenv from "dotenv";
import http from "http";
import { generateGreeting, generatePrompt, type InterviewConfig } from "./resources/js/shared/interviewConfig";

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

// Session context type from Laravel API
interface SessionContext {
    success: boolean;
    context?: string;
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
    const streamUrl = sessionId
        ? `${wsProtocol}://${host}/streams?session=${sessionId}`
        : `${wsProtocol}://${host}/streams`;

    // TwiML to connect to the stream
    const twiml = `
    <Response>
        <Connect>
            <Stream url="${streamUrl}" />
        </Connect>
    </Response>
    `;

    console.log("TwiML Generated with session:", sessionId);
    res.type("text/xml");
    res.send(twiml);
});


wss.on("connection", async (ws, req) => {
    // Check if the path is /streams
    if (!req.url?.startsWith("/streams")) {
        console.log("Rejected connection to:", req.url);
        ws.close();
        return;
    }

    // Extract session ID from query params (e.g., /streams?session=uuid)
    const urlParams = new URLSearchParams(req.url.split('?')[1] || '');
    const sessionId = urlParams.get('session');
    console.log("Twilio Media Stream Connected, Session ID:", sessionId);

    let deepgram: ReturnType<ReturnType<typeof createClient>['agent']> | null = null;
    let streamSid: string | null = null;
    let deepgramReady = false;
    let audioBuffer: Buffer[] = [];
    let sessionContext: SessionContext | null = null;

    // Fetch session context from Laravel if we have a session ID
    if (sessionId) {
        try {
            const appUrl = "http://127.0.0.1:8000";
            const response = await fetch(`${appUrl}/api/sessions/${sessionId}/context`);
            sessionContext = await response.json() as SessionContext;
            console.log("Session context loaded:", sessionContext);
        } catch (err) {
            console.error("Failed to fetch session context:", err);
        }
    }

    const deepgramClient = createClient(DEEPGRAM_API_KEY);

    // Connect to Deepgram
    console.log("Connecting to Deepgram Agent...");
    deepgram = deepgramClient.agent();

    // Log all events for debugging
    console.log("AgentEvents available:", AgentEvents);

    // Build config object for shared functions
    const buildInterviewConfig = (): InterviewConfig => ({
        jobTitle: sessionContext?.metadata?.job_title,
        companyName: sessionContext?.metadata?.company_name,
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
                    provider: { type: "open_ai", model: "gpt-4o-mini" },
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
                            name: "end_interview",
                            description: "End the interview call gracefully. Use this when: 1) You have completed all screening questions, 2) The candidate explicitly asks to end the call, 3) The candidate says goodbye or thanks you for your time. Always thank the candidate before ending.",
                            parameters: {
                                type: "object",
                                properties: {
                                    reason: { type: "string", description: "Brief reason for ending (e.g., 'screening_complete', 'candidate_request', 'goodbye')" },
                                    summary: { type: "string", description: "Brief summary of the interview outcome" },
                                },
                            },
                        },
                    ],
                },
                speak: {
                    provider: { type: "deepgram", model: interviewConfig.voiceId || "aura-asteria-en" },
                },
            },
        });

        console.log("Deepgram configured. Sending buffered audio...");
        // Send any buffered audio
        for (const audio of audioBuffer) {
            deepgram!.send(audio as any);
        }
        audioBuffer = [];
    });

    // Also try string 'open' as fallback
    deepgram.on("open", () => {
        console.log("Connected to Deepgram (string 'open')!");
    });

    deepgram.on(AgentEvents.Close, () => {
        console.log("Deepgram Connection Closed");
        deepgramReady = false;
    });

    deepgram.on(AgentEvents.Error, (error: any) => {
        console.error("Deepgram Error:", error);
    });

    // Handle Audio from Deepgram -> Twilio
    deepgram.on(AgentEvents.Audio, (data: Buffer) => {
        console.log("Received audio from Deepgram, length:", data.length);
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
                    const appUrl = "http://127.0.0.1:8000";
                    const response = await fetch(`${appUrl}/api/agent/context`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ query: input?.query }),
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

    // Log other events
    deepgram.on(AgentEvents.ConversationText, (data: any) => {
        console.log("Conversation text:", data);
    });

    deepgram.on(AgentEvents.UserStartedSpeaking, () => {
        console.log("User started speaking");
    });

    deepgram.on(AgentEvents.AgentStartedSpeaking, () => {
        console.log("Agent started speaking");
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
                streamSid = msg.start.streamSid;
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
