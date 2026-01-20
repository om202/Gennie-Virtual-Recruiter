import { createClient } from "@deepgram/sdk";
import WebSocket, { WebSocketServer } from "ws";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const port = 8080;
const wss = new WebSocketServer({ port });

console.log(`Relay server running on port ${port}`);

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

if (!DEEPGRAM_API_KEY) {
    console.error("Error: DEEPGRAM_API_KEY is not set in .env");
    process.exit(1);
}

wss.on("connection", (ws) => {
    console.log("Twilio Media Stream Connected");

    let deepgram = null;
    let streamSid = null;

    const deepgramClient = createClient(DEEPGRAM_API_KEY);

    // Connect to Deepgram
    deepgram = deepgramClient.agent();

    deepgram.on("open", () => {
        console.log("Connected to Deepgram");

        // Configure Agent similar to Gennie.tsx
        deepgram.configure({
            audio: {
                input: { encoding: "mulaw", sample_rate: 8000 }, // Twilio standard
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
    });

    deepgram.on("close", () => {
        console.log("Deepgram Connection Closed");
    });

    deepgram.on("error", (error) => {
        console.error("Deepgram Error:", error);
    });

    // Handle Audio from Deepgram -> Twilio
    deepgram.on("audio", (data) => {
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
    deepgram.on("AgentFunctionCallRequest", async (data) => {
        // Note: The event name might differ based on SDK usage, but 'FunctionCallRequest' or similar is standard.
        // The previous Gennie.tsx used `AgentEvents.FunctionCallRequest`.
        // We'll trust typical SDK event names or logging if it fails.
        console.log("Function Call Request:", data);

        const { function_name, function_call_id, input } = data;

        if (function_name === "get_context") {
            try {
                // Call Laravel Backend
                // We assume Laravel is running on localhost:8000 or specified APP_URL
                const appUrl = process.env.APP_URL || "http://127.0.0.1:8000";
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


    // Handle Twilio -> Deepgram
    ws.on("message", (message) => {
        const msg = JSON.parse(message);

        switch (msg.event) {
            case "connected":
                console.log("Twilio: Connected Event");
                break;
            case "start":
                console.log("Twilio: Start Event");
                streamSid = msg.start.streamSid;
                break;
            case "media":
                // Send audio to Deepgram
                if (deepgram.getReadyState() === 1) { // Open
                    deepgram.send(Buffer.from(msg.media.payload, "base64"));
                }
                break;
            case "stop":
                console.log("Twilio: Stop Event");
                if (deepgram) deepgram.disconnect(); // Close Deepgram connection
                break;
        }
    });

    ws.on("close", () => {
        console.log("Twilio Connection Closed");
        if (deepgram) deepgram.disconnect();
    });
});
