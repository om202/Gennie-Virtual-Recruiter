<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class GenerateSessionAnalysis implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    protected $session;

    /**
     * Create a new job instance.
     */
    public function __construct(\App\Models\InterviewSession $session)
    {
        $this->session = $session;
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

            // Extract interview metadata for analysis context
            $metadata = $this->session->metadata ?? [];
            $interviewType = $metadata['interview_type'] ?? 'screening';
            $difficultyLevel = $metadata['difficulty_level'] ?? 'mid';

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

        } catch (\Exception $e) {
            $this->session->update([
                'analysis_status' => 'failed',
                'analysis_result' => ['error' => $e->getMessage()],
            ]);
            throw $e;
        }
    }
}
