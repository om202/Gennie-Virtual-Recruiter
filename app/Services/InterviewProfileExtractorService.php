<?php

namespace App\Services;

use App\Models\Candidate;
use OpenAI\Laravel\Facades\OpenAI;
use Illuminate\Support\Facades\Log;

class InterviewProfileExtractorService
{
    /**
     * Fields that can be extracted from interview transcripts.
     */
    private const EXTRACTABLE_FIELDS = [
        'skills',
        'experience_summary',
        'work_history',
        'education',
        'certificates',
        'work_authorization',
        'salary_expectation',
        'city',
        'state',
        'linkedin_url',
    ];

    // Character threshold for chunking (8000 chars ≈ 2000 tokens, leaving room for prompt)
    private const CHUNK_THRESHOLD = 10000;
    private const CHUNK_SIZE = 8000;

    /**
     * Extract candidate profile data from an interview transcript.
     * For large transcripts, splits into chunks and merges results.
     */
    public function extractFromTranscript(string $transcript): array
    {
        if (strlen($transcript) < 100) {
            return [];
        }

        // If transcript is small enough, process in one shot
        if (strlen($transcript) <= self::CHUNK_THRESHOLD) {
            return $this->extractFromChunk($transcript);
        }

        // Large transcript: split into chunks and process each
        $chunks = $this->splitIntoChunks($transcript);
        $allResults = [];

        foreach ($chunks as $chunk) {
            $result = $this->extractFromChunk($chunk);
            if (!empty($result)) {
                $allResults[] = $result;
            }
        }

        // Merge results from all chunks
        return $this->mergeResults($allResults);
    }

    /**
     * Split transcript into chunks, trying to break at speaker turns.
     */
    private function splitIntoChunks(string $text): array
    {
        $chunks = [];
        $currentPos = 0;
        $textLength = strlen($text);

        while ($currentPos < $textLength) {
            $endPos = min($currentPos + self::CHUNK_SIZE, $textLength);

            // If not at the end, try to find a good break point (speaker turn)
            if ($endPos < $textLength) {
                $searchStart = max($currentPos + (self::CHUNK_SIZE * 0.7), $currentPos);
                $segment = substr($text, (int) $searchStart, $endPos - (int) $searchStart);

                // Try to break at speaker turn (Candidate: or Agent:)
                if (preg_match('/\n(Candidate|Agent|User|Human|Assistant):/i', $segment, $matches, PREG_OFFSET_CAPTURE)) {
                    $endPos = (int) $searchStart + $matches[0][1];
                }
                // Fallback: break at double newline
                elseif (($breakPos = strrpos($segment, "\n\n")) !== false) {
                    $endPos = (int) $searchStart + $breakPos;
                }
                // Last resort: break at single newline
                elseif (($breakPos = strrpos($segment, "\n")) !== false) {
                    $endPos = (int) $searchStart + $breakPos;
                }
            }

            $chunk = trim(substr($text, $currentPos, $endPos - $currentPos));
            if (!empty($chunk)) {
                $chunks[] = $chunk;
            }
            $currentPos = $endPos;
        }

        return $chunks;
    }

    /**
     * Extract data from a single chunk.
     */
    private function extractFromChunk(string $transcript): array
    {
        $systemPrompt = <<<SYS
You are extracting candidate profile information from an interview transcript. 
Extract ONLY information explicitly stated by the candidate. Do NOT infer or guess.
Return JSON only.
SYS;

        $prompt = <<<EOT
Extract candidate information from this interview transcript. 
ONLY extract what the candidate explicitly states about themselves.

## Fields to Extract:
- skills (string|null): Technical and soft skills mentioned, comma-separated
- experience_summary (string|null): Brief summary of their experience if they describe it
- work_history (array|null): Jobs mentioned with company, title, dates if stated
- education (array|null): Degrees/schools mentioned
- certificates (array|null): Certifications mentioned
- work_authorization (string|null): Only if explicitly discussed (e.g., "I'm a US citizen")
- salary_expectation (string|null): Only if explicitly stated
- city (string|null): City they live in if mentioned
- state (string|null): State they live in if mentioned
- linkedin_url (string|null): Only if they explicitly share it

## Rules:
1. ONLY extract what the CANDIDATE says, not the interviewer
2. If information is not explicitly stated, use null
3. For work_history array: [{company, title, start_date, end_date, description}]
4. For education array: [{institution, degree, field, end_date}]
5. For certificates array: [{name, issuer}]

## Transcript:
{$transcript}
EOT;

        try {
            $response = OpenAI::chat()->create([
                'model' => 'gpt-4o-mini',
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'response_format' => ['type' => 'json_object'],
                'temperature' => 0.1,
            ]);

            $content = $response->choices[0]->message->content;
            return json_decode($content, true) ?? [];
        } catch (\Exception $e) {
            Log::error('InterviewProfileExtractor chunk failed', [
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    /**
     * Merge results from multiple chunks.
     * - Scalar fields: use first non-null value
     * - Arrays: concatenate and deduplicate
     */
    private function mergeResults(array $results): array
    {
        if (empty($results)) {
            return [];
        }

        if (count($results) === 1) {
            return $results[0];
        }

        $merged = [
            'skills' => null,
            'experience_summary' => null,
            'work_authorization' => null,
            'salary_expectation' => null,
            'city' => null,
            'state' => null,
            'linkedin_url' => null,
            'work_history' => [],
            'education' => [],
            'certificates' => [],
        ];

        foreach ($results as $result) {
            // Scalar fields: first non-null wins
            foreach (['skills', 'experience_summary', 'work_authorization', 'salary_expectation', 'city', 'state', 'linkedin_url'] as $field) {
                if (empty($merged[$field]) && !empty($result[$field])) {
                    $merged[$field] = $result[$field];
                }
            }

            // Array fields: concatenate
            foreach (['work_history', 'education', 'certificates'] as $field) {
                if (!empty($result[$field]) && is_array($result[$field])) {
                    $merged[$field] = array_merge($merged[$field], $result[$field]);
                }
            }
        }

        // Deduplicate arrays
        $merged['work_history'] = $this->deduplicateByKeys($merged['work_history'], ['company', 'title']);
        $merged['education'] = $this->deduplicateByKeys($merged['education'], ['institution', 'degree']);
        $merged['certificates'] = $this->deduplicateByKeys($merged['certificates'], ['name']);

        return $merged;
    }

    /**
     * Deduplicate array of objects by specific keys.
     */
    private function deduplicateByKeys(array $items, array $keys): array
    {
        $seen = [];
        $unique = [];

        foreach ($items as $item) {
            if (!is_array($item))
                continue;

            $key = '';
            foreach ($keys as $k) {
                $key .= strtolower($item[$k] ?? '') . '|';
            }

            if (!isset($seen[$key])) {
                $seen[$key] = true;
                $unique[] = $item;
            }
        }

        return $unique;
    }

    /**
     * Store AI-extracted profile data separately from manual/resume data.
     * Data is stored in ai_profile_data field, not merged into main fields.
     */
    public function updateCandidateProfile(Candidate $candidate, array $extractedData): array
    {
        if (empty($extractedData)) {
            return [];
        }

        // Normalize skills to array if needed
        if (!empty($extractedData['skills']) && is_string($extractedData['skills'])) {
            $extractedData['skills'] = array_map('trim', explode(',', $extractedData['skills']));
        }

        // Store all extracted data in ai_profile_data
        $candidate->ai_profile_data = [
            'skills' => $extractedData['skills'] ?? null,
            'experience_summary' => $extractedData['experience_summary'] ?? null,
            'work_history' => $extractedData['work_history'] ?? [],
            'education' => $extractedData['education'] ?? [],
            'certificates' => $extractedData['certificates'] ?? [],
            'work_authorization' => $extractedData['work_authorization'] ?? null,
            'salary_expectation' => $extractedData['salary_expectation'] ?? null,
            'city' => $extractedData['city'] ?? null,
            'state' => $extractedData['state'] ?? null,
            'linkedin_url' => $extractedData['linkedin_url'] ?? null,
            'extracted_at' => now()->toIso8601String(),
            'source' => 'interview',
        ];

        $candidate->save();

        Log::info('AI profile data extracted from interview', [
            'candidate_id' => $candidate->id,
        ]);

        return array_keys(array_filter($extractedData));
    }

    /**
     * Full extraction and update flow.
     */
    public function extractAndUpdate(Candidate $candidate, string $transcript): array
    {
        $extracted = $this->extractFromTranscript($transcript);

        if (empty($extracted)) {
            return [];
        }

        return $this->updateCandidateProfile($candidate, $extracted);
    }
}
