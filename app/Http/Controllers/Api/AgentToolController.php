<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\RAGService;
use Illuminate\Support\Facades\Log;

class AgentToolController extends Controller
{
    protected $rag;

    public function __construct(RAGService $rag)
    {
        $this->rag = $rag;
    }

    /**
     * Tool: get_context
     * Deepgram calls this when it needs info.
     * Expected Input: { "query": "What is the job about?" }
     */
    public function getContext(Request $request)
    {
        $query = $request->input('query');
        Log::info("Agent asked: " . $query);

        if (!$query) {
            return response()->json(['error' => 'Query required'], 400);
        }

        try {
            $context = $this->rag->search($query);
            return response()->json(['context' => $context]);
        } catch (\Exception $e) {
            Log::error("RAG Error: " . $e->getMessage());
            return response()->json(['context' => 'I am having trouble accessing my memory right now.']);
        }
    }
}
