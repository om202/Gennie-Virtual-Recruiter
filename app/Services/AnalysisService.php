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
     * @param array|null $aiContext AI's interview plan and memory facts
     * @return array
     */
    public function analyzeSession(
        string $transcript,
        ?string $jobDescription,
        ?string $resume,
        string $interviewType = 'screening',
        string $difficultyLevel = 'mid',
        ?array $aiContext = null
    ): array {
        $typeConfig = $this->measures['interview_types'][$interviewType] ?? $this->measures['interview_types']['screening'];
        $levelConfig = $this->measures['difficulty_levels'][$difficultyLevel] ?? $this->measures['difficulty_levels']['mid'];

        $prompt = $this->buildPrompt($transcript, $jobDescription, $resume, $typeConfig, $levelConfig, $aiContext);

        try {
            $response = OpenAI::chat()->create([
                'model' => 'gpt-4o-mini',  // Fast, cheap, proven
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
        array $levelConfig,
        ?array $aiContext = null
    ): string {
        $prompt = "EVALUATION FRAMEWORK:\n\n";
        $prompt .= "Interview Type: {$typeConfig['name']}\n";
        $prompt .= "Description: {$typeConfig['description']}\n";
        $prompt .= "Candidate Level: {$levelConfig['name']}\n\n";

        // If JD provided, make it the primary evaluation source
        if ($jobDescription) {
            $prompt .= "═══════════════════════════════════════════════════════════════\n";
            $prompt .= "JOB REQUIREMENTS (PRIMARY EVALUATION SOURCE):\n";
            $prompt .= "═══════════════════════════════════════════════════════════════\n";
            $prompt .= "$jobDescription\n\n";
            $prompt .= "CRITICAL: Extract the KEY REQUIREMENTS from the job description above.\n";
            $prompt .= "For each evaluation criterion below, assess how well the candidate demonstrated\n";
            $prompt .= "skills/experience RELEVANT TO THIS SPECIFIC ROLE, not generic skills.\n\n";
        }

        // Include AI's interview context if available
        if ($aiContext) {
            $prompt .= "═══════════════════════════════════════════════════════════════\n";
            $prompt .= "AI INTERVIEWER'S CONTEXT (Pre-Interview Analysis)\n";
            $prompt .= "═══════════════════════════════════════════════════════════════\n";

            if (!empty($aiContext['interview_plan'])) {
                $plan = $aiContext['interview_plan'];
                $prompt .= "**AI's Candidate Assessment:**\n";
                if (!empty($plan['candidate_level'])) {
                    $prompt .= "- Assessed Level: {$plan['candidate_level']}\n";
                }
                if (!empty($plan['candidate_yoe'])) {
                    $prompt .= "- Estimated YOE: {$plan['candidate_yoe']} years\n";
                }
                if (!empty($plan['key_skills'])) {
                    $prompt .= "- Key Skills Identified: " . implode(', ', $plan['key_skills']) . "\n";
                }
                if (!empty($plan['skill_gaps'])) {
                    $prompt .= "- Skill Gaps to Probe: " . implode(', ', $plan['skill_gaps']) . "\n";
                    $prompt .= "  → IMPORTANT: Evaluate how well these gaps were addressed in the transcript\n";
                }
                if (!empty($plan['focus_areas'])) {
                    $prompt .= "- Focus Areas: " . implode(', ', $plan['focus_areas']) . "\n";
                }
                $prompt .= "\n";
            }

            if (!empty($aiContext['memory_facts'])) {
                $prompt .= "**Facts Extracted During Interview:**\n";
                foreach ($aiContext['memory_facts'] as $fact) {
                    $topic = $fact['topic'] ?? 'general';
                    $content = $fact['fact'] ?? '';
                    $prompt .= "- [{$topic}]: {$content}\n";
                }
                $prompt .= "→ Use these facts to validate transcript accuracy and completeness\n\n";
            }
        }

        $prompt .= "EVALUATION CRITERIA (weighted):\n\n";
        foreach ($typeConfig['evaluation_criteria'] as $criterion) {
            $prompt .= "• {$criterion['category']} ({$criterion['weight']}%)\n";
            foreach ($criterion['sub_criteria'] as $sub) {
                $prompt .= "  - {$sub}";
                if ($jobDescription) {
                    $prompt .= " (evaluate in context of the JD requirements)";
                }
                $prompt .= "\n";
            }
            $prompt .= "\n";
        }

        if ($resume) {
            $prompt .= "CANDIDATE RESUME (for reference only, NOT evidence for scoring):\n$resume\n\n";
        }

        $prompt .= "═══════════════════════════════════════════════════════════════\n";
        $prompt .= "INTERVIEW TRANSCRIPT (PRIMARY EVIDENCE SOURCE):\n";
        $prompt .= "═══════════════════════════════════════════════════════════════\n";
        $prompt .= "$transcript\n\n";

        $prompt .= "EVALUATION INSTRUCTIONS:\n";
        $prompt .= "1. FIRST: Identify the 3-5 MUST-HAVE skills from the job description\n";
        $prompt .= "2. Evaluate the candidate ONLY based on what they said in the transcript\n";
        $prompt .= "3. For EACH criterion, assess how the candidate's responses relate to JD requirements:\n";
        $prompt .= "   - Did they demonstrate the SPECIFIC technologies/skills mentioned in the JD?\n";
        $prompt .= "   - Did they show experience at the RIGHT LEVEL for this role?\n";
        $prompt .= "   - Did they address the KEY RESPONSIBILITIES from the JD?\n";
        $prompt .= "4. Score (0-100) based on how well transcript evidence matches JD requirements\n";
        $prompt .= "5. If a MUST-HAVE skill from JD was NOT discussed, note it as a gap\n";
        $prompt .= "6. Calibrate for {$levelConfig['name']} expectations\n";
        $prompt .= "7. In key_pros/key_cons, reference SPECIFIC JD requirements met or missed\n";

        // Add AI context-specific instructions
        if ($aiContext && !empty($aiContext['interview_plan']['skill_gaps'])) {
            $prompt .= "8. SPECIFICALLY evaluate how the candidate performed on identified skill gaps: "
                . implode(', ', $aiContext['interview_plan']['skill_gaps']) . "\n";
        }

        return $prompt;
    }
}
