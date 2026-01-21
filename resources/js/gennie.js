import { createClient, AgentEvents } from "@deepgram/sdk";

document.addEventListener("DOMContentLoaded", async () => {
    const startBtn = document.getElementById("start-btn");
    const stopBtn = document.getElementById("stop-btn");
    const statusText = document.getElementById("status-text");
    const transcriptBox = document.getElementById("transcript-box");
    const visualizerRing = document.getElementById("visualizer-ring");

    let connection = null;
    let audioProcessor = null;

    startBtn.addEventListener("click", startConversation);
    stopBtn.addEventListener("click", stopConversation);

    async function startConversation() {
        startBtn.disabled = true;
        startBtn.textContent = "Connecting...";
        statusText.textContent = "Initializing Gennie...";

        try {
            // 1. Get API Key from backend
            const response = await fetch("/gennie/token");
            const data = await response.json();
            const apiKey = data.key;

            if (!apiKey) {
                alert("API Key not found!");
                resetUI();
                return;
            }

            // 2. Initialize Deepgram Client using SDK v4
            const deepgram = createClient(apiKey);

            // 3. Create Agent Connection using the SDK
            connection = deepgram.agent();

            // Event: Connection Open
            connection.on(AgentEvents.Open, () => {
                console.log("Agent WebSocket Connected");
                statusText.textContent = "Configuring Gennie...";
                showActiveButtons();

                // Configure the agent with correct V1 API Schema
                // See: node_modules/@deepgram/sdk/src/lib/types/AgentLiveSchema.ts
                connection.configure({
                    audio: {
                        input: { encoding: "linear16", sample_rate: 16000 },
                        output: { encoding: "linear16", sample_rate: 16000, container: "none" }
                    },
                    agent: {
                        language: "en",
                        greeting: "Hi there! I'm Gennie. I'm excited to learn more about you. Shall we start?",
                        listen: {
                            provider: { type: "deepgram", model: "nova-2" }
                        },
                        think: {
                            provider: { type: "open_ai", model: "gpt-4o-mini" },
                            // IMPORTANT: Use 'prompt' not 'instructions' per AgentLiveSchema
                            prompt: "You are Gennie, a professional and friendly recruiter for a Tech Company. You are screening a candidate for a Senior React Developer role. Ask about their experience, management style, and salary expectations. Keep answers concise. Use the 'get_context' function if you need information about the company benefits or role details. Do not make up info.",
                            functions: [
                                {
                                    name: "get_context",
                                    description: "Retrieve information about the company, benefits, or job description.",
                                    parameters: {
                                        type: "object",
                                        properties: {
                                            query: { type: "string", description: "The question or topic to search for." }
                                        }
                                    }
                                }
                            ]
                        },
                        speak: {
                            provider: { type: "deepgram", model: "aura-asteria-en" }
                        }
                    }
                });

                statusText.textContent = "Gennie is listening...";
                visualizerRing.classList.add("animate-pulse");

                // Start capturing microphone audio
                startMicrophone();
            });

            // Event: Connection Close
            connection.on(AgentEvents.Close, () => {
                console.log("Agent Connection Closed");
                statusText.textContent = "Connection Closed";
                stopMicrophone();
                resetUI();
            });

            // Event: Error
            connection.on(AgentEvents.Error, (error) => {
                console.error("Agent Error:", error);
                statusText.textContent = "Error occurred";
                addTranscript(`Error: ${JSON.stringify(error)}`);
            });

            // Event: User Started Speaking
            connection.on(AgentEvents.UserStartedSpeaking, () => {
                statusText.textContent = "User Speaking...";
                visualizerRing.style.borderColor = "rgba(59, 130, 246, 0.8)";
            });

            // Event: Agent Started Speaking
            connection.on(AgentEvents.AgentStartedSpeaking, () => {
                statusText.textContent = "Gennie Speaking...";
                visualizerRing.style.borderColor = "rgba(16, 185, 129, 0.8)";
            });

            // Event: Conversation Text (transcripts)
            connection.on(AgentEvents.ConversationText, (data) => {
                if (data.role && data.content) {
                    addTranscript(`${data.role}: ${data.content}`);
                }
            });

            // Event: Function Call Request
            connection.on(AgentEvents.FunctionCallRequest, async (data) => {
                console.log("Function call request:", data);

                // The event data has a `functions` array with each function call
                const functions = data.functions || [];

                for (const func of functions) {
                    const { id: functionCallId, name: functionName, arguments: argsString } = func;

                    // Parse the arguments JSON string
                    let input = {};
                    try {
                        input = JSON.parse(argsString || '{}');
                    } catch (parseErr) {
                        console.error("Failed to parse function arguments:", parseErr);
                    }

                    console.log(`Processing function: ${functionName}, id: ${functionCallId}, input:`, input);

                    if (functionName === "get_context") {
                        addTranscript(`System: Searching knowledge base for "${input?.query}"...`);
                        try {
                            const apiRes = await fetch("/api/agent/context", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ query: input?.query })
                            });
                            const apiData = await apiRes.json();

                            console.log("Sending function call response:", {
                                id: functionCallId,
                                name: functionName,
                                content: apiData.context || "No context found."
                            });

                            // Send Response back to Agent (correct field names: id, name, content)
                            connection.functionCallResponse({
                                id: functionCallId,
                                name: functionName,
                                content: apiData.context || "No context found."
                            });
                        } catch (err) {
                            console.error("Error calling backend tool:", err);
                            connection.functionCallResponse({
                                id: functionCallId,
                                name: functionName,
                                content: "Error retrieving context."
                            });
                        }
                    } else {
                        // Unknown function - respond with error to not leave it hanging
                        console.warn(`Unknown function called: ${functionName}`);
                        connection.functionCallResponse({
                            id: functionCallId,
                            name: functionName,
                            content: "Function not implemented."
                        });
                    }
                }
            });

            // Event: Audio Data from Agent
            connection.on(AgentEvents.Audio, (audioData) => {
                playAudio(audioData);
            });

            // Handle unhandled events (including History for transcript)
            connection.on(AgentEvents.Unhandled, (data) => {
                // Handle History events for transcript
                if (data.type === 'History' && data.role && data.content) {
                    addTranscript(`${data.role}: ${data.content}`);
                } else {
                    console.log("Unhandled agent event:", data);
                }
            });

        } catch (error) {
            console.error("Connection error:", error);
            alert("Failed to connect: " + error.message);
            resetUI();
        }
    }

    async function startMicrophone() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });

            const audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 16000
            });

            const source = audioContext.createMediaStreamSource(stream);

            // Create a ScriptProcessorNode for audio capture
            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            audioProcessor = { audioContext, processor, stream, source };

            processor.onaudioprocess = (e) => {
                if (connection && connection.getReadyState && connection.getReadyState() === 1) {
                    const inputData = e.inputBuffer.getChannelData(0);
                    // Convert float32 to int16 (linear16)
                    const int16Data = new Int16Array(inputData.length);
                    for (let i = 0; i < inputData.length; i++) {
                        int16Data[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
                    }
                    connection.send(int16Data.buffer);
                }
            };

            source.connect(processor);
            processor.connect(audioContext.destination);

        } catch (err) {
            console.error("Microphone error:", err);
            addTranscript("Error: Could not access microphone");
        }
    }

    function stopMicrophone() {
        if (audioProcessor) {
            audioProcessor.processor.disconnect();
            audioProcessor.audioContext.close();
            audioProcessor.stream.getTracks().forEach(track => track.stop());
            audioProcessor = null;
        }
    }

    function stopConversation() {
        if (connection) {
            connection.finish();
        }
        stopMicrophone();
        resetUI();
        addTranscript("System: Interview stopped by user");
    }

    function resetUI() {
        startBtn.disabled = false;
        startBtn.textContent = "Start Interview";
        startBtn.classList.remove("hidden");
        stopBtn.classList.add("hidden");
        visualizerRing.classList.remove("animate-pulse");
        visualizerRing.style.borderColor = "";
        statusText.textContent = "Ready to Connect...";
    }

    function showActiveButtons() {
        startBtn.classList.add("hidden");
        stopBtn.classList.remove("hidden");
    }

    // Gapless Audio Player with scheduled playback
    let playbackAudioCtx = null;
    let nextPlayTime = 0;
    const SAMPLE_RATE = 16000;

    async function playAudio(audioData) {
        if (!playbackAudioCtx) {
            playbackAudioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SAMPLE_RATE });
            nextPlayTime = playbackAudioCtx.currentTime;
        }

        if (playbackAudioCtx.state === 'suspended') {
            await playbackAudioCtx.resume();
            nextPlayTime = playbackAudioCtx.currentTime;
        }

        try {
            // audioData is a Buffer/ArrayBuffer of linear16 audio
            const buffer = audioData instanceof ArrayBuffer ? audioData :
                (audioData.buffer ? audioData.buffer.slice(audioData.byteOffset, audioData.byteOffset + audioData.byteLength) : new Uint8Array(audioData).buffer);

            const int16Array = new Int16Array(buffer);
            const float32Array = new Float32Array(int16Array.length);

            for (let i = 0; i < int16Array.length; i++) {
                float32Array[i] = int16Array[i] / 32768;
            }

            const audioBuffer = playbackAudioCtx.createBuffer(1, float32Array.length, SAMPLE_RATE);
            audioBuffer.copyToChannel(float32Array, 0);

            const source = playbackAudioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(playbackAudioCtx.destination);

            // Schedule this chunk to play immediately after the previous one
            const currentTime = playbackAudioCtx.currentTime;
            if (nextPlayTime < currentTime) {
                nextPlayTime = currentTime;
            }

            source.start(nextPlayTime);
            nextPlayTime += audioBuffer.duration;

        } catch (error) {
            console.error("Audio playback error:", error);
        }
    }

    // Reset playback timing when agent stops speaking
    function resetAudioPlayback() {
        if (playbackAudioCtx) {
            nextPlayTime = playbackAudioCtx.currentTime;
        }
    }

    function addTranscript(text) {
        const p = document.createElement("p");
        p.textContent = text;
        transcriptBox.appendChild(p);
        transcriptBox.scrollTop = transcriptBox.scrollHeight;
        transcriptBox.classList.remove("hidden");
    }
});
