<?php

namespace App\Services;

use OpenAI\Laravel\Facades\OpenAI;
use Illuminate\Support\Facades\Log;

class AnalysisService
{
    private array $measures;

    public function __construct()
    {
        // Load analysis measures configuration
        $measuresPath = config_path('analysis_measures.json');
        $this->measures = json_decode(file_get_contents($measuresPath), true);
    }

    /**
     * Generate an analysis for a given interview session transcript.
     *
     * @param string $transcript
     * @param string|null $jobDescription
     * @param string|null $resume
     * @param string $interviewType
     * @param string $difficultyLevel
     * @return array
     */
    public function analyzeSession(
        string $transcript,
        ?string $jobDescription,
        ?string $resume,
        string $interviewType = 'screening',
        string $difficultyLevel = 'mid'
    ): array {
        $typeConfig = $this->measures['interview_types'][$interviewType] ?? $this->measures['interview_types']['screening'];
        $levelConfig = $this->measures['difficulty_levels'][$difficultyLevel] ?? $this->measures['difficulty_levels']['mid'];

        $prompt = $this->buildPrompt($transcript, $jobDescription, $resume, $typeConfig, $levelConfig);

        try {
            $response = OpenAI::chat()->create([
                'model' => 'gpt-4o',
                'messages' => [
                    ['role' => 'system', 'content' => $this->getSystemPrompt($typeConfig, $levelConfig)],
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
                                    'description' => 'Overall weighted score from 0 to 100 representing the candidate fit.',
                                ],
                                'criterion_scores' => [
                                    'type' => 'array',
                                    'description' => 'Detailed breakdown of scores for each evaluation criterion.',
                                    'items' => [
                                        'type' => 'object',
                                        'properties' => [
                                            'category' => [
                                                'type' => 'string',
                                                'description' => 'Name of the evaluation criterion category.',
                                            ],
                                            'score' => [
                                                'type' => 'integer',
                                                'description' => 'Score for this criterion (0-100).',
                                            ],
                                            'weight' => [
                                                'type' => 'integer',
                                                'description' => 'Weight percentage of this criterion.',
                                            ],
                                            'assessment' => [
                                                'type' => 'string',
                                                'description' => 'Brief assessment noting what was met and what was lacking.',
                                            ],
                                            'evidence' => [
                                                'type' => 'array',
                                                'items' => ['type' => 'string'],
                                                'description' => 'Specific examples from the transcript supporting this score.',
                                            ],
                                        ],
                                        'required' => ['category', 'score', 'weight', 'assessment', 'evidence'],
                                        'additionalProperties' => false,
                                    ],
                                ],
                                'summary' => [
                                    'type' => 'string',
                                    'description' => 'A concise 2-3 sentence executive summary of the interview performance.',
                                ],
                                'key_pros' => [
                                    'type' => 'array',
                                    'items' => ['type' => 'string'],
                                    'description' => 'List of 3-5 key strengths demonstrated, mapped to evaluation criteria.',
                                ],
                                'key_cons' => [
                                    'type' => 'array',
                                    'items' => ['type' => 'string'],
                                    'description' => 'List of 3-5 key weaknesses or areas for improvement, mapped to evaluation criteria.',
                                ],
                                'recommendation' => [
                                    'type' => 'string',
                                    'enum' => ['Strong Hire', 'Hire', 'Weak Hire', 'Reject'],
                                    'description' => 'Final recommendation based on scoring rubric.',
                                ],
                            ],
                            'required' => ['score', 'criterion_scores', 'summary', 'key_pros', 'key_cons', 'recommendation'],
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

    private function getSystemPrompt(array $typeConfig, array $levelConfig): string
    {
        return "You are an expert technical recruiter conducting a {$typeConfig['name']} for a {$levelConfig['name']} candidate.

CRITICAL INSTRUCTION - TRANSCRIPT-ONLY ASSESSMENT:
Your evaluation must be based EXCLUSIVELY on the candidate's actual responses in the interview transcript.
- You may ONLY score what the candidate actually said and demonstrated during the interview
- DO NOT infer, assume, or score based on resume claims or job description requirements
- The job description and resume are provided ONLY as context to understand what was expected
- If the candidate did not discuss a topic, that criterion should be scored as 0 or very low
- If the transcript shows only a greeting or minimal exchange, this is NOT a valid interview

EVIDENCE REQUIREMENT:
- Every score MUST be supported by direct quotes or paraphrased content from the transcript
- If you cannot cite specific transcript evidence for a score, the score must be 0
- Do NOT generate evidence - only report what was actually said

SCORING GUIDELINES:
- 90-100: Exceptional - Rare top-tier candidate, exceeds all expectations (with clear transcript evidence)
- 80-89: Strong Hire - Clearly exceeds expectations in most areas (with clear transcript evidence)
- 70-79: Hire - Solidly meets expectations with minor gaps (with clear transcript evidence)
- 60-69: Weak Hire - Borderline, meets minimum bar but has concerns
- 0-59: Reject - Significant gaps in critical areas OR insufficient demonstration in transcript

RECOMMENDATION MAPPING:
- Strong Hire: Score >= 80, demonstrated excellence with clear evidence
- Hire: Score 70-79, meets expectations with evidence
- Weak Hire: Score 60-69, borderline performance
- Reject: Score < 60, insufficient evidence or poor performance

Focus Areas for {$levelConfig['name']}: " . implode(', ', $levelConfig['focus_areas']) . "

Be calibrated for the level. If the candidate did not provide enough responses to assess properly, reflect that in a low score with explanation.";
    }

    private function buildPrompt(
        string $transcript,
        ?string $jobDescription,
        ?string $resume,
        array $typeConfig,
        array $levelConfig
    ): string {
        $prompt = "EVALUATION FRAMEWORK:\n\n";
        $prompt .= "Interview Type: {$typeConfig['name']}\n";
        $prompt .= "Description: {$typeConfig['description']}\n\n";

        $prompt .= "EVALUATION CRITERIA (weighted):\n\n";
        foreach ($typeConfig['evaluation_criteria'] as $criterion) {
            $prompt .= "• {$criterion['category']} ({$criterion['weight']}%)\n";
            foreach ($criterion['sub_criteria'] as $sub) {
                $prompt .= "  - {$sub}\n";
            }
            $prompt .= "\n";
        }

        $prompt .= "REFERENCE MATERIALS (for context only - DO NOT use to score):\n\n";

        if ($jobDescription) {
            $prompt .= "JOB DESCRIPTION (to understand expectations, NOT for scoring):\n$jobDescription\n\n";
        }

        if ($resume) {
            $prompt .= "CANDIDATE RESUME (for reference only, NOT evidence for scoring):\n$resume\n\n";
        }

        $prompt .= "INTERVIEW TRANSCRIPT (PRIMARY SOURCE - score ONLY based on this):\n$transcript\n\n";

        $prompt .= "INSTRUCTIONS:\n";
        $prompt .= "1. Evaluate the candidate ONLY based on what they said in the transcript above\n";
        $prompt .= "2. For EACH criterion, provide:\n";
        $prompt .= "   - A score (0-100) based ONLY on transcript evidence\n";
        $prompt .= "   - The weight percentage (as shown above)\n";
        $prompt .= "   - A brief assessment citing what the candidate ACTUALLY SAID\n";
        $prompt .= "   - Specific quotes or paraphrased evidence from the transcript (NOT from resume)\n";
        $prompt .= "3. If a criterion was NOT discussed in the interview, score it LOW (0-20)\n";
        $prompt .= "4. Calculate the overall score as: Σ(criterion_score × weight / 100)\n";
        $prompt .= "5. Every strength and weakness MUST reference something the candidate said\n";
        $prompt .= "6. Calibrate for {$levelConfig['name']} expectations\n";
        $prompt .= "7. Do NOT give credit for resume claims that were not verified in the interview\n";

        return $prompt;
    }
}
