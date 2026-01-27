<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SubscriptionPlan;

class SubscriptionPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'slug' => 'free_trial',
                'name' => 'Free Trial',
                'description' => 'Try Gennie with 30 minutes free. No credit card required.',
                'price_monthly' => 0, // cents
                'minutes_included' => 30,
                'overage_rate' => 0, // No overage on free trial
                'is_active' => true,
                'sort_order' => 0,
            ],
            [
                'slug' => 'starter',
                'name' => 'Starter',
                'description' => 'Perfect for solo recruiters and small teams getting started.',
                'price_monthly' => 4900, // $49
                'minutes_included' => 150,
                'overage_rate' => 35, // $0.35/min
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'slug' => 'growth',
                'name' => 'Growth',
                'description' => 'For growing teams with moderate hiring volume.',
                'price_monthly' => 14900, // $149
                'minutes_included' => 600,
                'overage_rate' => 28, // $0.28/min
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'slug' => 'pro',
                'name' => 'Pro',
                'description' => 'High-volume recruiting with the best per-minute rates.',
                'price_monthly' => 34900, // $349
                'minutes_included' => 1600,
                'overage_rate' => 22, // $0.22/min
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'slug' => 'enterprise',
                'name' => 'Enterprise',
                'description' => 'Custom volume pricing for large organizations.',
                'price_monthly' => 0, // Custom
                'minutes_included' => 0, // Unlimited
                'overage_rate' => 20, // $0.20/min base rate
                'is_active' => true,
                'sort_order' => 4,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(
                ['slug' => $plan['slug']],
                $plan
            );
        }
    }
}
