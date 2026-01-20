<?php

namespace App\Services;

use OpenAI\Laravel\Facades\OpenAI;
use App\Models\KnowledgeBase;
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
