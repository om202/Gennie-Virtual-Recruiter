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

            $result = $analysisService->analyzeSession(
                $transcript,
                $this->session->getJobDescription(),
                $this->session->getResume()
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
