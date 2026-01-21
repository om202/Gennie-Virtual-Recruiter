<?php

namespace App\Services;

use OpenAI\Laravel\Facades\OpenAI;
use App\Models\KnowledgeBase;
use App\Models\InterviewSession;
use Illuminate\Support\Facades\Log;

class RAGService
{
    /**
     * Advanced Hybrid Search (Vector + Keyword) using Reciprocal Rank Fusion (RRF).
     * This minimizes hallucinations by requiring both semantic and exact matches to rank high.
     */
    public function search(string $query, int $limit = 5): string
    {
        // 1. Generate Embedding
        $response = OpenAI::embeddings()->create([
            'model' => 'text-embedding-3-small',
            'input' => $query,
        ]);

        $queryVector = json_encode($response->embeddings[0]->embedding);

        // 2. Execute Hybrid Query
        // We use a constant 'k' for RRF smooting (usually 60)
        // Score = 1.0 / (k + rank_i)

        $k = 60;

        $results = \DB::select("
            WITH vector_search AS (
                SELECT id, embedding <=> ? as distance,
                ROW_NUMBER() OVER (ORDER BY embedding <=> ?) as rank
                FROM knowledge_bases
                ORDER BY distance ASC
                LIMIT ?
            ),
            keyword_search AS (
                SELECT id, ts_rank(search_vector, websearch_to_tsquery('english', ?)) as rank_score,
                ROW_NUMBER() OVER (ORDER BY ts_rank(search_vector, websearch_to_tsquery('english', ?)) DESC) as rank
                FROM knowledge_bases
                WHERE search_vector @@ websearch_to_tsquery('english', ?)
                LIMIT ?
            )
            SELECT kb.content,
                   COALESCE(1.0 / (? + v.rank), 0.0) + COALESCE(1.0 / (? + k.rank), 0.0) as rrf_score
            FROM knowledge_bases kb
            LEFT JOIN vector_search v ON kb.id = v.id
            LEFT JOIN keyword_search k ON kb.id = k.id
            WHERE v.id IS NOT NULL OR k.id IS NOT NULL
            ORDER BY rrf_score DESC
            LIMIT ?
        ", [
            $queryVector,
            $queryVector,
            $limit * 2, // Vector bindings
            $query,
            $query,
            $query,
            $limit * 2,     // Keyword bindings
            $k,
            $k,                                 // RRF constants
            $limit                                  // Final limit
        ]);

        if (empty($results)) {
            return "No relevant information found in the knowledge base.";
        }

        // 3. Format Context with Token Safety
        // (Re-using the safety logic from before)
        $context = "";
        $estimatedTokens = 0;
        $maxTokens = 2000;

        foreach ($results as $item) {
            $content = $item->content;
            $tokens = strlen($content) / 4;

            if ($estimatedTokens + $tokens > $maxTokens) {
                break;
            }

            $context .= $content . "\n\n";
            $estimatedTokens += $tokens;
        }

        return $context;
    }

    /**
     * Search with session context - prioritizes JD and Resume before knowledge base.
     */
    public function searchWithSession(string $query, ?string $sessionId, int $limit = 3): string
    {
        $context = "";

        // 1. First, check if we have session-specific context
        if ($sessionId) {
            $session = InterviewSession::find($sessionId);
            if ($session) {
                // Check if the query relates to job description
                $jdKeywords = ['job', 'role', 'position', 'requirement', 'responsibility', 'qualification', 'skill', 'experience'];
                $resumeKeywords = ['background', 'candidate', 'resume', 'work history', 'education', 'project'];

                $queryLower = strtolower($query);

                // Add JD context if relevant
                if ($session->hasJobDescription()) {
                    foreach ($jdKeywords as $keyword) {
                        if (str_contains($queryLower, $keyword)) {
                            $context .= "From Job Description:\n" . substr($session->job_description, 0, 2000) . "\n\n";
                            break;
                        }
                    }
                }

                // Add Resume context if relevant
                if ($session->hasResume()) {
                    foreach ($resumeKeywords as $keyword) {
                        if (str_contains($queryLower, $keyword)) {
                            $context .= "From Candidate Resume:\n" . substr($session->resume, 0, 2000) . "\n\n";
                            break;
                        }
                    }
                }
            }
        }

        // 2. Then search the general knowledge base
        $kbContext = $this->search($query, $limit);
        if ($kbContext !== "No relevant information found in the knowledge base.") {
            $context .= $kbContext;
        }

        if (empty($context)) {
            return "No relevant information found.";
        }

        return $context;
    }


}
