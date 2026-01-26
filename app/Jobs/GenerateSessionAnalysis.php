<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class GenerateSessionAnalysis implements ShouldQueue
{
    use Queueable;

    /**
     * The session to analyze.
     */
    protected $session;

    /**
     * Job timeout in seconds (3 minutes for AI processing).
     */
    public $timeout = 180;

    /**
     * Maximum number of attempts.
     */
    public $tries = 3;

    /**
     * Exponential backoff delays in seconds (30s, 60s, 120s).
     */
    public $backoff = [30, 60, 120];

    /**
     * Maximum exceptions before marking as failed.
     */
    public $maxExceptions = 2;

    /**
     * Create a new job instance.
     */
    public function __construct(\App\Models\InterviewSession $session)
    {
        $this->session = $session;
    }

    /**
     * Handle job failure after all retries exhausted.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('GenerateSessionAnalysis job failed permanently', [
            'session_id' => $this->session->id,
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts(),
        ]);

        $this->session->update([
            'analysis_status' => 'failed',
            'analysis_result' => [
                'error' => 'Analysis failed after ' . $this->attempts() . ' attempts',
                'reason' => $exception->getMessage(),
                'failed_at' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * Execute the job.
     */
    public function handle(\App\Services\AnalysisService $analysisService): void
    {
        if ($this->session->analysis_status === 'completed') {
            return;
        }

        $this->session->update(['analysis_status' => 'processing']);

        try {
            $transcript = $this->session->transcript;

            // Fallback to logs if transcript is empty
            if (empty($transcript)) {
                $transcript = $this->session->logs()
                    ->orderBy('created_at')
                    ->get()
                    ->map(fn($log) => "{$log->speaker}: {$log->message}")
                    ->implode("\n");

                // Save the aggregated transcript for future reference
                $this->session->update(['transcript' => $transcript]);
            }

            if (empty($transcript)) {
                $this->session->update(['analysis_status' => 'failed', 'analysis_result' => ['error' => 'No transcript available']]);
                return;
            }

            // Validate minimum interview content - require actual candidate participation
            $lines = array_filter(explode("\n", $transcript), fn($line) => !empty(trim($line)));
            $candidateResponses = array_filter(
                $lines,
                fn($line) =>
                stripos($line, 'candidate:') === 0 ||
                stripos($line, 'user:') === 0 ||
                stripos($line, 'human:') === 0
            );

            // Require at least 3 candidate responses for a valid assessment
            if (count($candidateResponses) < 3) {
                $this->session->update([
                    'analysis_status' => 'failed',
                    'analysis_result' => [
                        'error' => 'Insufficient interview data',
                        'reason' => 'The interview requires at least 3 candidate responses to generate a valid assessment. Only ' . count($candidateResponses) . ' response(s) found.',
                    ]
                ]);
                return;
            }

            // Also require minimum transcript length (at least 500 characters of actual content)
            if (strlen($transcript) < 500) {
                $this->session->update([
                    'analysis_status' => 'failed',
                    'analysis_result' => [
                        'error' => 'Insufficient interview content',
                        'reason' => 'The interview transcript is too short to generate a meaningful assessment.',
                    ]
                ]);
                return;
            }

            // Get interview type and difficulty from parent Interview model (primary source)
            // Fall back to session metadata if parent interview not available
            $interview = $this->session->interview;
            if ($interview) {
                $interviewType = $interview->interview_type ?? 'screening';
                $difficultyLevel = $interview->difficulty_level ?? 'mid';
            } else {
                // Legacy fallback: read from session metadata
                $metadata = $this->session->metadata ?? [];
                $interviewType = $metadata['interview_type'] ?? 'screening';
                $difficultyLevel = $metadata['difficulty_level'] ?? 'mid';
            }

            Log::info('Analysis using criteria', [
                'session_id' => $this->session->id,
                'interview_type' => $interviewType,
                'difficulty_level' => $difficultyLevel,
            ]);

            $result = $analysisService->analyzeSession(
                $transcript,
                $this->session->getJobDescription(),
                $this->session->getResume(),
                $interviewType,
                $difficultyLevel
            );

            $this->session->update([
                'analysis_status' => 'completed',
                'analysis_result' => $result,
            ]);

            // Extract and update candidate profile from interview transcript
            $this->extractCandidateProfile($transcript);

        } catch (\Exception $e) {
            $this->session->update([
                'analysis_status' => 'failed',
                'analysis_result' => ['error' => $e->getMessage()],
            ]);
            throw $e;
        }
    }

    /**
     * Extract candidate profile data from transcript and update empty fields.
     */
    private function extractCandidateProfile(string $transcript): void
    {
        try {
            // Check if session has a candidate
            $candidate = $this->session->candidate;

            if (!$candidate) {
                return;
            }

            $extractor = app(\App\Services\InterviewProfileExtractorService::class);
            $updatedFields = $extractor->extractAndUpdate($candidate, $transcript);

            if (!empty($updatedFields)) {
                Log::info('Candidate profile enriched from interview', [
                    'session_id' => $this->session->id,
                    'candidate_id' => $candidate->id,
                    'fields' => $updatedFields,
                ]);
            }
        } catch (\Exception $e) {
            // Don't fail the job if profile extraction fails
            Log::warning('Failed to extract candidate profile from interview', [
                'session_id' => $this->session->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
