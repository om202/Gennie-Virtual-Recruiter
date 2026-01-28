<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\RAGService;
use App\Services\InterviewMemoryService;
use Illuminate\Support\Facades\Log;

class AgentToolController extends Controller
{
    protected RAGService $rag;
    protected InterviewMemoryService $memory;

    public function __construct(RAGService $rag, InterviewMemoryService $memory)
    {
        $this->rag = $rag;
        $this->memory = $memory;
    }

    /**
     * Tool: get_context
     * Deepgram calls this when it needs info.
     * Expected Input: { "query": "What is the job about?", "session_id": "optional-uuid" }
     */
    public function getContext(Request $request)
    {
        $query = $request->input('query');
        $sessionId = $request->input('session_id');
        Log::info("Agent asked: " . $query . ($sessionId ? " (session: $sessionId)" : ""));

        if (!$query) {
            return response()->json(['error' => 'Query required'], 400);
        }

        try {
            // Use session-aware search when session_id is provided
            // This includes JD/resume context from the interview session
            if ($sessionId) {
                $context = $this->rag->searchWithSession($query, $sessionId);
            } else {
                $context = $this->rag->search($query);
            }
            return response()->json(['context' => $context]);
        } catch (\Exception $e) {
            Log::error("RAG Error: " . $e->getMessage());
            return response()->json(['context' => 'I am having trouble accessing my memory right now.']);
        }
    }

    /**
     * Tool: recall_interview_memory
     * Returns what the candidate has already told us in this session.
     * Expected Input: { "session_id": "uuid", "query": "optional semantic search" }
     */
    public function recallMemory(Request $request)
    {
        $sessionId = $request->input('session_id');
        $query = $request->input('query');

        if (!$sessionId) {
            return response()->json(['error' => 'Session ID required'], 400);
        }

        Log::info("🧠 Memory recall requested for session: $sessionId" . ($query ? " (query: $query)" : ""));

        try {
            // If query provided, do semantic search
            if ($query) {
                $result = $this->memory->recallByQuery($sessionId, $query);
                return response()->json([
                    'found' => $result !== null,
                    'recall' => $result,
                    'instruction' => $result
                        ? "The candidate already mentioned this. Do NOT ask again."
                        : "No matching memory found. You may ask about this.",
                ]);
            }

            // Return all stored facts
            $facts = $this->memory->getSessionMemory($sessionId);
            $coveredTopics = array_keys($facts);

            return response()->json([
                'covered_topics' => $coveredTopics,
                'facts' => $facts,
                'instruction' => empty($coveredTopics)
                    ? 'No topics covered yet.'
                    : 'Do NOT ask about: ' . implode(', ', $coveredTopics) . '. These are already covered.',
            ]);
        } catch (\Exception $e) {
            Log::error("Memory recall error: " . $e->getMessage());
            return response()->json([
                'covered_topics' => [],
                'facts' => [],
                'instruction' => 'Memory system unavailable.',
            ]);
        }
    }
}

