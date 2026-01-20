import express from "express";
import { createClient, AgentEvents } from "@deepgram/sdk";
import { WebSocket, WebSocketServer } from "ws";
import dotenv from "dotenv";
import fetch from "node-fetch";
import http from "http";

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

// HTTP Endpoint for TwiML
app.post("/twilio/voice", (req, res) => {
    const host = req.headers.host;
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const wsProtocol = protocol === "https" ? "wss" : "ws";

    // TwiML to connect to the stream
    const twiml = `
    <Response>
        <Connect>
            <Stream url="${wsProtocol}://${host}/streams" />
        </Connect>
    </Response>
    `;

    console.log("TwiML Generated:", twiml);
    res.type("text/xml");
    res.send(twiml);
});


wss.on("connection", (ws, req) => {
    // Check if the path is /streams
    if (req.url !== "/streams") {
        console.log("Rejected connection to:", req.url);
        ws.close();
        return;
    }

    console.log("Twilio Media Stream Connected");

    let deepgram = null;
    let streamSid = null;
    let deepgramReady = false;
    let audioBuffer = []; // Buffer audio until Deepgram is ready

    const deepgramClient = createClient(DEEPGRAM_API_KEY);

    // Connect to Deepgram
    console.log("Connecting to Deepgram Agent...");
    deepgram = deepgramClient.agent();

    // Log all events for debugging
    console.log("AgentEvents available:", AgentEvents);

    // Use AgentEvents enum like the browser SDK does
    deepgram.on(AgentEvents.Open, () => {
        console.log("Connected to Deepgram (AgentEvents.Open)!");
        deepgramReady = true;

        // Configure Agent similar to Gennie.tsx
        deepgram.configure({
            audio: {
                input: { encoding: "mulaw", sample_rate: 8000 },
                output: { encoding: "mulaw", sample_rate: 8000, container: "none" },
            },
            agent: {
                language: "en",
                greeting: "Hi there! I'm Gennie. I'm excited to learn more about you. Shall we start?",
                listen: {
                    provider: { type: "deepgram", model: "nova-2" },
                },
                think: {
                    provider: { type: "open_ai", model: "gpt-4o-mini" },
                    prompt: "You are Gennie, a professional and friendly recruiter for a Tech Company. You are screening a candidate for a Senior React Developer role. Ask about their experience, management style, and salary expectations. Keep answers concise. Use the 'get_context' function if you need information about the company benefits or role details. Do not make up info.",
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
                    ],
                },
                speak: {
                    provider: { type: "deepgram", model: "aura-asteria-en" },
                },
            },
        });

        console.log("Deepgram configured. Sending buffered audio...");
        // Send any buffered audio
        for (const audio of audioBuffer) {
            deepgram.send(audio);
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

    deepgram.on(AgentEvents.Error, (error) => {
        console.error("Deepgram Error:", error);
    });

    // Handle Audio from Deepgram -> Twilio
    deepgram.on(AgentEvents.Audio, (data) => {
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
    deepgram.on(AgentEvents.FunctionCallRequest, async (data) => {
        console.log("Function Call Request:", data);

        const { function_name, function_call_id, input } = data;

        if (function_name === "get_context") {
            try {
                const appUrl = "http://127.0.0.1:8000";
                const response = await fetch(`${appUrl}/api/agent/context`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query: input?.query }),
                });
                const apiData = await response.json();

                deepgram.functionCallResponse({
                    id: function_call_id,
                    name: function_name,
                    content: apiData.context || "No context found.",
                });

            } catch (err) {
                console.error("Error calling backend tool:", err);
                deepgram.functionCallResponse({
                    id: function_call_id,
                    name: function_name,
                    content: "Error retrieving context.",
                });
            }
        }
    });

    // Log other events
    deepgram.on(AgentEvents.ConversationText, (data) => {
        console.log("Conversation text:", data);
    });

    deepgram.on(AgentEvents.UserStartedSpeaking, () => {
        console.log("User started speaking");
    });

    deepgram.on(AgentEvents.AgentStartedSpeaking, () => {
        console.log("Agent started speaking");
    });


    // Handle Twilio -> Deepgram
    ws.on("message", (message) => {
        const msg = JSON.parse(message);

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
                if (deepgramReady && deepgram.getReadyState() === 1) {
                    deepgram.send(audioData);
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
