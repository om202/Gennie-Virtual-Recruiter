# Gennie: System Architecture "Source of Truth"

**Version**: 1.0 (Live Code Analysis)
**Core Design**: Hybrid High-Speed Stack

## 1. High-Level Concept
Gennie is a real-time Voice AI Recruiter. It achieves human-like latency (<500ms) by using **Deepgram** as the central orchestrator for the audio loop, while offloading "Intelligence" and "Memory" to **OpenAI** and **Laravel** respectively.

---

## 2. The "Hybrid" Stack Breakdown

| Component | Provider | Role | Integration Method |
| :--- | :--- | :--- | :--- |
| **Orchestrator** | **Deepgram** | Manages WebSocket, Audio Streaming, VAD | Native SDK (`@deepgram/sdk`) |
| **Ears (STT)** | **Deepgram Nova-2** | Transcribes user speech instantly | Native (Internal to Deepgram) |
| **Brain (LLM)** | **OpenAI GPT-4o-mini** | Generates intelligent responses | **Proxied** (Deepgram backend calls OpenAI) |
| **Mouth (TTS)** | **Deepgram Aura** | Converts text to speech (Asteria voice) | Native (Internal to Deepgram) |
| **Memory (RAG)**| **Laravel + OpenAI** | Retrieves company facts/JD info | **Direct** (Laravel calls OpenAI Embeddings) |

---

## 3. The Audio Pipeline (The Fast Lane)
*Why is it so fast?* Because audio stays in one continuous stream.

1.  **Input (Microphone)**:
    - Browser captures audio via `AudioContext`.
    - `AudioWorklet` (in `audio-processor.js`) converts raw float32 audio to **Linear16 (Int16)**.
    - Chunks are sent over a **WebSocket** directly to Deepgram `wss://agent.deepgram.com`.

2.  **Processing (The Black Box)**:
    - Deepgram detects speech (VAD).
    - Deepgram transcribes it (Nova-2).
    - **Deepgram sends text to OpenAI** (GPT-4o-mini) to get a response.
    - OpenAI returns text.
    - Deepgram converts text to audio (Aura).

3.  **Output (Speakers)**:
    - Deepgram streams Audio Chunks (Linear16) back to the browser.
    - Browser receives chunks via WebSocket.
    - `useDeepgramAgent.ts` converts Int16 back to Float32.
    - Audio is played immediately (Streaming Playback), so the user hears the start of the sentence before the end is even generated.

---

## 4. The Intelligence Pipeline (RAG)
*How does it know things?*

When the Agent (OpenAI) is asked a question like *"What are the benefits?"*, it doesn't hallucinate. It uses a **Tool Call**.

1.  **Trigger**: Agent recognizes it needs data. It sends a `FunctionCallRequest` event via the WebSocket.
2.  **Frontend Relay**: The React frontend (`useDeepgramAgent.ts`) catches this event.
3.  **API Request**: Frontend calls your Laravel backend: `POST /api/agent/context`.
4.  **Vector Search (Laravel)**:
    - `RAGService.php` receives the query.
    - It calls **OpenAI** (`text-embedding-3-small`) to turn the query into numbers (vector).
    - It compares this vector against your Postgres database (Cosine Similarity).
5.  **Return**: The most relevant text is sent back to the Agent.
6.  **Response**: The Agent incorporates the facts into its spoken answer.

---

## 5. Billing & Infrastructure Model
*Who pays whom?*

1.  **Deepgram Bill**: usage of STT (Nova), TTS (Aura), and the Agent API uptime.
2.  **OpenAI Bill**:
    - **Agent Brain**: You pay for GPT-4o input/output tokens (passed through Deepgram or via your key configured in Deepgram console).
    - **RAG Embeddings**: You pay OpenAI directly via the `OPENAI_API_KEY` in your Laravel `.env` file.
3.  **Server Bill**: Your standard Laravel hosting (database, web server).

## 6. Directory Map (Key Files)
- **Frontend Logic**: `resources/js/hooks/useDeepgramAgent.ts` (Agent Config, WebSocket, Tool Handling)
- **Audio Processing**: `public/audio-processor.js` (Raw Microphone worklet)
- **RAG Service**: `app/Services/RAGService.php` (Vector Search, OpenAI Call)
- **Tool Controller**: `app/Http/Controllers/AgentToolController.php` (API Endpoints for RAG)
