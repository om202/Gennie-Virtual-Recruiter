<?php

namespace App\Services;

use OpenAI\Laravel\Facades\OpenAI;
use Illuminate\Support\Facades\Log;

class AnalysisService
{
    /**
     * Generate an analysis for a given interview session transcript.
     *
     * @param string $transcript
     * @param string|null $jobDescription
     * @param string|null $resume
     * @return array
     */
    public function analyzeSession(string $transcript, ?string $jobDescription, ?string $resume): array
    {
        $prompt = "You are an expert technical recruiter. Analyze the following interview transcript against the job description and candidate resume.\n\n";

        if ($jobDescription) {
            $prompt .= "JOB DESCRIPTION:\n$jobDescription\n\n";
        }

        if ($resume) {
            $prompt .= "CANDIDATE RESUME:\n$resume\n\n";
        }

        $prompt .= "TRANSCRIPT:\n$transcript\n\n";
        $prompt .= "Provide a structured assessment of the candidate.";

        try {
            $response = OpenAI::chat()->create([
                'model' => 'gpt-4o-mini',
                'messages' => [
                    ['role' => 'system', 'content' => 'You are a strict and fair recruitment AI. Output ONLY JSON.'],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'response_format' => [
                    'type' => 'json_schema',
                    'json_schema' => [
                        'name' => 'recruitment_analysis',
                        'strict' => true,
                        'schema' => [
                            'type' => 'object',
                            'properties' => [
                                'score' => [
                                    'type' => 'integer',
                                    'description' => 'A score from 0 to 100 representing the candidate fit.',
                                ],
                                'summary' => [
                                    'type' => 'string',
                                    'description' => 'A concise 2-3 sentence summary of the interview.',
                                ],
                                'key_pros' => [
                                    'type' => 'array',
                                    'items' => ['type' => 'string'],
                                    'description' => 'List of 3-5 key strengths demonstrated.',
                                ],
                                'key_cons' => [
                                    'type' => 'array',
                                    'items' => ['type' => 'string'],
                                    'description' => 'List of 3-5 key weaknesses or missing skills.',
                                ],
                                'recommendation' => [
                                    'type' => 'string',
                                    'enum' => ['Strong Hire', 'Hire', 'Weak Hire', 'Reject'],
                                    'description' => 'Final recommendation.',
                                ],
                            ],
                            'required' => ['score', 'summary', 'key_pros', 'key_cons', 'recommendation'],
                            'additionalProperties' => false,
                        ],
                    ],
                ],
            ]);

            $content = $response->choices[0]->message->content;
            return json_decode($content, true);

        } catch (\Exception $e) {
            Log::error('AnalysisService Error: ' . $e->getMessage());
            throw $e;
        }
    }
}
