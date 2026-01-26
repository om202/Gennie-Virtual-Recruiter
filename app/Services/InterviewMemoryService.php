<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use OpenAI\Laravel\Facades\OpenAI;

/**
 * InterviewMemoryService
 * 
 * Extracts key facts from candidate responses and stores them with embeddings
 * for semantic retrieval. This prevents the AI from re-asking questions.
 */
class InterviewMemoryService
{
    /**
     * Topic patterns for fast fact extraction (no LLM call needed).
     * Covers: Screening, Technical, Behavioral, and Final interview types.
     */
    private array $topicPatterns = [
        // ═══════════════════════════════════════════════════════════════════
        // SCREENING INTERVIEW TOPICS
        // ═══════════════════════════════════════════════════════════════════
        'experience' => [
            'patterns' => ['/(\d+)\s*years?\s*(of\s*)?(experience|developer|engineer|working)/i'],
            'keywords' => ['years of experience', 'worked for', 'been a developer', 'been working as'],
        ],
        'work_history' => [
            'patterns' => [],
            'keywords' => ['worked at', 'was with', 'my last role', 'previous company', 'currently at', 'current employer'],
        ],
        'intro' => [
            'patterns' => [],
            'keywords' => ['my name is', 'i am a', "i'm a", 'my background', 'about myself', 'let me introduce'],
        ],
        'work_authorization' => [
            'patterns' => ['/green\s*card|citizen|h1b|h-1b|visa|ead|opt|cpt|permanent\s*resident/i'],
            'keywords' => ['authorized to work', 'sponsorship', 'work permit'],
        ],
        'location' => [
            'patterns' => ['/located in|based in|live in|living in|from\s+(\w+)|currently in\s+(\w+)/i'],
            'keywords' => ['i live', 'my location', 'working from', 'remote from'],
        ],
        'relocation' => [
            'patterns' => [],
            'keywords' => ['open to relocate', 'willing to move', 'can relocate', 'not willing to relocate', 'prefer remote'],
        ],
        'availability' => [
            'patterns' => ['/start\s*(immediately|right away|asap)|(\d+)\s*weeks?\s*notice|notice\s*period/i'],
            'keywords' => ['can start', 'available to start', 'notice period', 'two weeks', 'one month'],
        ],
        'salary' => [
            'patterns' => ['/\$?\s*(\d{2,3})[,\s]?(\d{3})?\s*k?\s*(per\s*year)?|hundred\s*(and\s*\w+)?\s*thousand/i'],
            'keywords' => ['salary', 'compensation', 'expecting', 'looking for around', 'base pay', 'total comp'],
        ],
        'timeline' => [
            'patterns' => [],
            'keywords' => ['decision', 'timeline', 'making a decision', 'need to decide', 'by next week'],
        ],
        'other_interviews' => [
            'patterns' => [],
            'keywords' => ['interviewing', 'other companies', 'other interviews', 'talking to', 'offer from'],
        ],

        // ═══════════════════════════════════════════════════════════════════
        // TECHNICAL INTERVIEW TOPICS
        // ═══════════════════════════════════════════════════════════════════
        'technologies' => [
            'patterns' => ['/react|angular|vue|node|python|java|typescript|javascript|aws|azure|gcp|docker|kubernetes|sql|mongodb|graphql|rest\s*api/i'],
            'keywords' => ['tech stack', 'programming', 'framework', 'language', 'database', 'cloud'],
        ],
        'architecture' => [
            'patterns' => ['/microservices|monolith|serverless|event\s*driven|distributed/i'],
            'keywords' => ['architecture', 'system design', 'scaling', 'designed the', 'architected'],
        ],
        'projects' => [
            'patterns' => [],
            'keywords' => ['project', 'built', 'developed', 'implemented', 'created', 'worked on a', 'my biggest'],
        ],
        'problem_solving' => [
            'patterns' => [],
            'keywords' => ['solved', 'debugged', 'fixed', 'optimized', 'improved', 'reduced', 'approach to'],
        ],
        'best_practices' => [
            'patterns' => ['/ci\s*\/?\s*cd|unit\s*test|tdd|code\s*review|agile|scrum/i'],
            'keywords' => ['testing', 'deployment', 'version control', 'git', 'code quality', 'documentation'],
        ],

        // ═══════════════════════════════════════════════════════════════════
        // BEHAVIORAL INTERVIEW TOPICS
        // ═══════════════════════════════════════════════════════════════════
        'teamwork' => [
            'patterns' => [],
            'keywords' => ['team', 'collaborated', 'worked with', 'together', 'group project', 'cross-functional'],
        ],
        'conflict' => [
            'patterns' => [],
            'keywords' => ['disagreement', 'conflict', 'difficult situation', 'tension', 'resolved', 'compromise'],
        ],
        'leadership' => [
            'patterns' => [],
            'keywords' => ['led', 'managed', 'mentored', 'coached', 'supervised', 'took ownership', 'initiated'],
        ],
        'failure' => [
            'patterns' => [],
            'keywords' => ['failed', 'mistake', 'learned', 'lesson', 'wrong', 'setback', 'challenge'],
        ],
        'achievement' => [
            'patterns' => [],
            'keywords' => ['proud of', 'accomplished', 'achievement', 'succeeded', 'award', 'recognition'],
        ],

        // ═══════════════════════════════════════════════════════════════════
        // FINAL INTERVIEW TOPICS
        // ═══════════════════════════════════════════════════════════════════
        'motivation' => [
            'patterns' => [],
            'keywords' => ['passionate about', 'enjoy', 'love', 'motivates me', 'excited about', 'interested in'],
        ],
        'career_goals' => [
            'patterns' => [],
            'keywords' => ['career', 'long term', 'five years', 'goal', 'aspiration', 'grow', 'future'],
        ],
        'culture_fit' => [
            'patterns' => [],
            'keywords' => ['culture', 'values', 'work environment', 'team dynamics', 'company mission'],
        ],
        'why_company' => [
            'patterns' => [],
            'keywords' => ['why this company', 'attracted to', 'researched', 'impressed by', 'read about'],
        ],
        'questions_asked' => [
            'patterns' => [],
            'keywords' => ['can i ask', 'want to know', 'wondering about', 'my question is'],
        ],
    ];

    /**
     * Extract facts from a candidate message and store them.
     */
    public function extractAndStore(string $sessionId, string $message): array
    {
        $extracted = [];
        $msgLower = strtolower($message);

        foreach ($this->topicPatterns as $topic => $config) {
            $matched = false;

            // Check regex patterns
            foreach ($config['patterns'] as $pattern) {
                if (preg_match($pattern, $message)) {
                    $matched = true;
                    break;
                }
            }

            // Check keywords
            if (!$matched) {
                foreach ($config['keywords'] as $keyword) {
                    if (str_contains($msgLower, $keyword)) {
                        $matched = true;
                        break;
                    }
                }
            }

            if ($matched) {
                $extracted[$topic] = $message;
            }
        }

        // Store extracted facts
        foreach ($extracted as $topic => $content) {
            $this->storeFact($sessionId, $topic, $content, $message);
        }

        if (!empty($extracted)) {
            Log::info("🧠 Extracted memory topics: " . implode(', ', array_keys($extracted)));
        }

        return $extracted;
    }

    /**
     * Store a fact with its embedding.
     * Optimized: skips re-embedding if topic already exists (content is similar).
     */
    private function storeFact(string $sessionId, string $topic, string $content, string $sourceMessage): void
    {
        try {
            // Check if record already exists
            $existing = DB::table('interview_memory')
                ->where('interview_session_id', $sessionId)
                ->where('topic', $topic)
                ->first(['id']);

            if ($existing) {
                // Topic already tracked - skip re-embedding to save API calls
                // The first mention is usually the most informative
                Log::debug("Memory topic '$topic' already exists, skipping update");
                return;
            }

            // Generate embedding only for new topics
            $embedding = $this->createEmbedding($content);

            // Insert new record with UUID
            DB::table('interview_memory')->insert([
                'id' => Str::uuid()->toString(),
                'interview_session_id' => $sessionId,
                'topic' => $topic,
                'content' => Str::limit($content, 500),
                'source_message' => Str::limit($sourceMessage, 1000),
                'embedding' => $embedding,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to store interview memory: " . $e->getMessage());
        }
    }

    /**
     * Get all stored facts for a session.
     */
    public function getSessionMemory(string $sessionId): array
    {
        $memories = DB::table('interview_memory')
            ->where('interview_session_id', $sessionId)
            ->get(['topic', 'content', 'updated_at']);

        $result = [];
        foreach ($memories as $mem) {
            $result[$mem->topic] = $mem->content;
        }

        return $result;
    }

    /**
     * Semantic search: find if candidate mentioned something similar to query.
     */
    public function recallByQuery(string $sessionId, string $query): ?array
    {
        try {
            $embedding = $this->createEmbedding($query);

            $result = DB::selectOne("
                SELECT topic, content, embedding <=> ?::vector as distance
                FROM interview_memory
                WHERE interview_session_id = ?
                ORDER BY distance ASC
                LIMIT 1
            ", [$embedding, $sessionId]);

            if ($result && $result->distance < 0.5) {
                return [
                    'topic' => $result->topic,
                    'content' => $result->content,
                    'relevance' => round(1 - $result->distance, 2),
                ];
            }

            return null;
        } catch (\Exception $e) {
            Log::error("Memory recall failed: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Create embedding using OpenAI.
     */
    private function createEmbedding(string $text): string
    {
        $response = OpenAI::embeddings()->create([
            'model' => 'text-embedding-3-small',
            'input' => $text,
        ]);

        return json_encode($response->embeddings[0]->embedding);
    }
}
