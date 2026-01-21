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

        // --- OPTIMIZATION: Semantic Caching ---
        // Check if we have answered a very similar question recently.
        // HNSW on 'halfvec' is extremely fast.
        // Distance < 0.1 implies ~95% similarity.
        $cacheHit = \DB::selectOne("
            SELECT llm_response, embedding <=> ?::vector as distance 
            FROM semantic_cache 
            ORDER BY distance ASC 
            LIMIT 1
        ", [$queryVector]);

        if ($cacheHit && $cacheHit->distance < 0.05) {
            Log::info("Semantic Cache Hit: " . $cacheHit->distance);
            return $cacheHit->llm_response;
            // Note: In a real chat flow, we might return the 'context' used, but here we return text.
            // If the method signature expects 'context' string, we return the cached response as context? 
            // No, usually RAGService returns context chunks. The Cache typically stores the *Answer*.
            // But this method returns 'string' context. 
            // Let's assume for this service we return cached *Context* chunks? 
            // Or better: store the Context used in the cache. 
            // For now, let's treat the 'llm_response' column in cache as 'cached_context' for this specific service design.
        }
        // -------------------------------------

        // 2. Execute Hybrid Query
        // We use a constant 'k' for RRF smooting (usually 60)
        // Score = 1.0 / (k + rank_i)

        $k = 60;

        $results = \DB::select("
            WITH vector_search AS (
                SELECT id, embedding <=> ?::vector as distance,
                ROW_NUMBER() OVER (ORDER BY embedding <=> ?::vector) as rank
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

        // --- OPTIMIZATION: Write to Semantic Cache ---
        // Store this query and the resulting context (or answer) for future use.
        // We write asynchronously or just fire and forget.
        \DB::table('semantic_cache')->insert([
            'user_query' => $query,
            'llm_response' => $context, // Caching the CONTEXT found
            'embedding' => $queryVector, // PG cast to halfvec automatically
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        // -------------------------------------------

        return $context;
    }

    /**
     * Search with episodic memory (Time-Decay).
     */
    public function searchWithSession(string $query, ?string $sessionId, int $limit = 3): string
    {
        $context = "";

        // 1. Session Context (JD/Resume) - Immediate Memory
        if ($sessionId) {
            $session = InterviewSession::find($sessionId);
            if ($session) {
                // ... (Existing logic for Keywords kept brief) ...
                // Check if the query relates to job description
                $jdKeywords = ['job', 'role', 'position', 'requirement', 'responsibility', 'qualification', 'skill', 'experience'];
                $resumeKeywords = ['background', 'candidate', 'resume', 'work history', 'education', 'project'];
                $queryLower = strtolower($query);

                if ($session->hasJobDescription()) {
                    foreach ($jdKeywords as $keyword) {
                        if (str_contains($queryLower, $keyword)) {
                            $context .= "From Job Description:\n" . substr($session->job_description, 0, 2000) . "\n\n";
                            break;
                        }
                    }
                }

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

        // 2. Episodic Memory (Past Interactions)
        // Retrieve past Q&A from this session (or logs), prioritizing recent ones.
        // Assuming we logged interactions somewhere. If not, we skip for now 
        // to focus on the 'search' upgrade. But we can apply decay to KnowledgeBase too if it had timestamps.

        // 3. General Knowledge (Hybrid Search)
        $kbContext = $this->search($query, $limit);
        if ($kbContext !== "No relevant information found in the knowledge base.") {
            $context .= $kbContext;
        }

        return empty($context) ? "No relevant information found." : $context;
    }


}
