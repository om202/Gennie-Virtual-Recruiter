<?php

namespace App\Console\Commands;

use App\Services\SubscriptionService;
use Illuminate\Console\Command;

class ApplyScheduledDowngrades extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscription:apply-downgrades';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Apply scheduled plan downgrades for users whose billing period has ended';

    /**
     * Execute the console command.
     */
    public function handle(SubscriptionService $subscriptionService)
    {
        $count = $subscriptionService->applyScheduledDowngrades();

        if ($count > 0) {
            $this->info("Applied {$count} scheduled downgrade(s).");
        } else {
            $this->info('No scheduled downgrades to apply.');
        }

        return Command::SUCCESS;
    }
}
