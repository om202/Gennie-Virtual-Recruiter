<?php

namespace App\Services;

use OpenAI\Laravel\Facades\OpenAI;
use App\Models\KnowledgeBase;
use App\Models\InterviewSession;
use Illuminate\Support\Facades\Log;

class RAGService
{
    /**
     * Search the knowledge base using PHP-side Cosine Similarity.
     * Efficient for < 1000 records.
     */
    public function search(string $query, int $limit = 3): string
    {
        // 1. Generate Embedding
        $response = OpenAI::embeddings()->create([
            'model' => 'text-embedding-3-small',
            'input' => $query,
        ]);

        $queryVector = $response->embeddings[0]->embedding;

        // 2. Fetch all candidates (MVP Scale)
        // In production, use pgvector. For now, we load all and sort in PHP.
        $allKnowledge = \DB::table('knowledge_bases')->select('id', 'content', 'embedding')->get();

        $scored = $allKnowledge->map(function ($item) use ($queryVector) {
            $itemVector = json_decode($item->embedding);
            if (!$itemVector)
                return ['score' => -1, 'content' => ''];

            $score = $this->cosineSimilarity($queryVector, $itemVector);
            return [
                'score' => $score,
                'content' => $item->content
            ];
        })->sortByDesc('score')->take($limit);

        if ($scored->isEmpty() || $scored->first()['score'] < 0.7) {
            // Threshold to avoid hallucinations
            return "No relevant information found in the knowledge base.";
        }

        // 3. Format Context
        $context = "";
        foreach ($scored as $item) {
            $context .= $item['content'] . "\n\n";
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

    /**
     * Calculate Cosine Similarity between two vectors.
     */
    private function cosineSimilarity(array $vecA, array $vecB)
    {
        $dotProduct = 0;
        $normA = 0;
        $normB = 0;

        foreach ($vecA as $i => $a) {
            $b = $vecB[$i] ?? 0;
            $dotProduct += $a * $b;
            $normA += $a * $a;
            $normB += $b * $b;
        }

        if ($normA == 0 || $normB == 0)
            return 0;

        return $dotProduct / (sqrt($normA) * sqrt($normB));
    }
}
