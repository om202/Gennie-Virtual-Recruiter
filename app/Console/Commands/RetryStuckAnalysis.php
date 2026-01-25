<?php

namespace App\Console\Commands;

use App\Jobs\GenerateSessionAnalysis;
use App\Models\InterviewSession;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class RetryStuckAnalysis extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'analysis:retry-stuck 
                            {--minutes=10 : Minutes before considering a job stuck}
                            {--dry-run : Show what would be retried without actually retrying}';

    /**
     * The console command description.
     */
    protected $description = 'Detect and retry interview analysis jobs stuck in processing state';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $minutes = (int) $this->option('minutes');
        $dryRun = $this->option('dry-run');

        $this->info("Finding analysis jobs stuck in 'processing' for more than {$minutes} minutes...");

        // Find sessions stuck in "processing" for too long
        $stuckProcessing = InterviewSession::where('analysis_status', 'processing')
            ->where('updated_at', '<', now()->subMinutes($minutes))
            ->get();

        $this->info("Found {$stuckProcessing->count()} stuck in 'processing'");

        if ($dryRun) {
            foreach ($stuckProcessing as $session) {
                $this->line("  [DRY RUN] Would reset: {$session->id} (stuck since {$session->updated_at})");
            }
        } else {
            foreach ($stuckProcessing as $session) {
                $session->update(['analysis_status' => 'pending']);
                GenerateSessionAnalysis::dispatch($session);
                $this->line("  Reset and re-queued: {$session->id}");

                Log::info('RetryStuckAnalysis: Re-queued stuck session', [
                    'session_id' => $session->id,
                    'was_stuck_since' => $session->updated_at,
                ]);
            }
        }

        // Also find old "pending" jobs that never got picked up (optional recovery)
        $oldPending = InterviewSession::where('analysis_status', 'pending')
            ->where('status', 'completed') // Interview is done
            ->where('updated_at', '<', now()->subMinutes($minutes * 2)) // Twice the stuck threshold
            ->limit(10) // Process in batches to avoid overwhelming queue
            ->get();

        $this->info("Found {$oldPending->count()} old 'pending' jobs to re-queue");

        if (!$dryRun) {
            foreach ($oldPending as $session) {
                GenerateSessionAnalysis::dispatch($session);
                $this->line("  Re-queued pending: {$session->id}");
            }
        }

        $total = $stuckProcessing->count() + $oldPending->count();

        if ($total > 0) {
            $action = $dryRun ? 'would be processed' : 'processed';
            $this->info("✅ {$total} sessions {$action}");
        } else {
            $this->info("✅ No stuck jobs found");
        }

        return Command::SUCCESS;
    }
}
