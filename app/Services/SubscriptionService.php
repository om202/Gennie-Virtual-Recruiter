<?php

namespace App\Services;

use App\Models\User;
use App\Models\InterviewSession;
use App\Models\SubscriptionPlan;
use App\Models\UsageRecord;
use Illuminate\Support\Facades\DB;

class SubscriptionService
{
    /**
     * Record usage for a completed interview session.
     */
    public function recordUsage(InterviewSession $session): ?UsageRecord
    {
        // Get the interview owner
        $interview = $session->interview;
        if (!$interview) {
            return null;
        }

        $user = $interview->user;
        if (!$user) {
            return null;
        }

        // Calculate duration in minutes
        $durationSeconds = $session->duration_seconds ?? 0;
        if ($durationSeconds === 0) {
            return null;
        }

        $minutes = round($durationSeconds / 60, 2);

        // Calculate cost
        $costCents = $this->calculateCost($user, $minutes);

        // Create usage record
        $usageRecord = UsageRecord::create([
            'user_id' => $user->id,
            'interview_session_id' => $session->id,
            'minutes_used' => $minutes,
            'cost_cents' => $costCents,
            'plan_slug' => $user->getCurrentPlan()?->slug,
            'recorded_at' => now(),
        ]);

        // Update session cost
        $session->update(['cost_cents' => $costCents]);

        // Update user's period usage
        $user->increment('minutes_used_this_period', $minutes);

        return $usageRecord;
    }

    /**
     * Calculate cost for given minutes based on user's plan.
     */
    public function calculateCost(User $user, float $minutes): int
    {
        $plan = $user->getCurrentPlan();
        if (!$plan) {
            return 0;
        }

        // Enterprise: flat rate
        if ($plan->slug === 'enterprise') {
            return (int) round($minutes * $plan->overage_rate);
        }

        // Free trial: no cost
        if ($plan->isFreeTrial()) {
            return 0;
        }

        // Paid plans: check if within included minutes
        $used = (float) ($user->minutes_used_this_period ?? 0);
        $included = $plan->minutes_included;

        // If we're already over, everything is overage
        if ($used >= $included) {
            return (int) round($minutes * $plan->overage_rate);
        }

        // Split between included and overage
        $remainingIncluded = $included - $used;

        if ($minutes <= $remainingIncluded) {
            // All within included minutes - no additional cost
            return 0;
        }

        // Some overage
        $overageMinutes = $minutes - $remainingIncluded;
        return (int) round($overageMinutes * $plan->overage_rate);
    }

    /**
     * Check if user can start a new interview.
     */
    public function canStartInterview(User $user): array
    {
        $plan = $user->getCurrentPlan();

        if (!$plan) {
            return [
                'allowed' => false,
                'reason' => 'No subscription plan found.',
            ];
        }

        // Enterprise always can
        if ($plan->slug === 'enterprise') {
            return [
                'allowed' => true,
                'reason' => 'Enterprise plan - unlimited interviews.',
            ];
        }

        // Free trial: check if minutes remaining
        if ($plan->isFreeTrial()) {
            $remaining = $user->getMinutesRemaining();
            if ($remaining <= 0) {
                return [
                    'allowed' => false,
                    'reason' => 'Free trial minutes exhausted. Please upgrade to continue.',
                    'minutes_remaining' => 0,
                ];
            }
            return [
                'allowed' => true,
                'reason' => "{$remaining} minutes remaining in free trial.",
                'minutes_remaining' => $remaining,
            ];
        }

        // Paid plans: can always start (will charge overage)
        $remaining = $user->getMinutesRemaining();
        return [
            'allowed' => true,
            'reason' => $remaining > 0
                ? "{$remaining} minutes remaining in plan."
                : "Overage charges will apply at {$plan->overage_rate_formatted}.",
            'minutes_remaining' => max(0, $remaining),
        ];
    }

    /**
     * Get usage statistics for a user.
     */
    public function getUsageStats(User $user): array
    {
        $plan = $user->getCurrentPlan();
        $used = (float) ($user->minutes_used_this_period ?? 0);
        $included = $plan?->minutes_included ?? 0;
        $remaining = max(0, $included - $used);

        // Calculate overage
        $overageMinutes = max(0, $used - $included);
        $overageCost = $plan ? (int) round($overageMinutes * $plan->overage_rate) : 0;

        // Get current period usage records
        $periodStart = $user->period_started_at ?? $user->created_at;
        $recentUsage = $user->usageRecords()
            ->where('recorded_at', '>=', $periodStart)
            ->orderBy('recorded_at', 'desc')
            ->limit(10)
            ->with('interviewSession:id,candidate_id')
            ->get();

        return [
            'plan' => $plan ? [
                'slug' => $plan->slug,
                'name' => $plan->name,
                'price_formatted' => $plan->price_formatted,
                'minutes_included' => $plan->minutes_included,
                'overage_rate' => $plan->overage_rate,
                'overage_rate_formatted' => $plan->overage_rate_formatted,
            ] : null,
            'usage' => [
                'minutes_used' => round($used, 1),
                'minutes_included' => $included,
                'minutes_remaining' => round($remaining, 1),
                'percentage_used' => $included > 0 ? min(100, round(($used / $included) * 100)) : 0,
                'overage_minutes' => round($overageMinutes, 1),
                'overage_cost_cents' => $overageCost,
                'overage_cost_formatted' => '$' . number_format($overageCost / 100, 2),
            ],
            'period' => [
                'started_at' => $periodStart?->toISOString(),
                'ends_at' => $user->subscription_ends_at?->toISOString(),
            ],
            'recent_usage' => $recentUsage->map(fn($r) => [
                'id' => $r->id,
                'minutes' => $r->minutes_formatted,
                'cost' => $r->cost_formatted,
                'recorded_at' => $r->recorded_at->toISOString(),
            ]),
        ];
    }

    /**
     * Upgrade user to a new plan (mocked payment).
     */
    public function upgradePlan(User $user, string $planSlug): array
    {
        $plan = SubscriptionPlan::where('slug', $planSlug)->where('is_active', true)->first();

        if (!$plan) {
            return [
                'success' => false,
                'message' => 'Plan not found.',
            ];
        }

        if ($plan->slug === 'enterprise') {
            return [
                'success' => false,
                'message' => 'Please contact sales for Enterprise pricing.',
            ];
        }

        // Mock payment - in production, integrate Stripe here
        DB::transaction(function () use ($user, $plan) {
            $now = now();
            $user->update([
                'subscription_plan_id' => $plan->id,
                'subscription_started_at' => $now,
                'subscription_ends_at' => $now->copy()->addMonth(),
                'minutes_used_this_period' => 0,
                'period_started_at' => $now,
            ]);
        });

        return [
            'success' => true,
            'message' => "Upgraded to {$plan->name} plan!",
            'plan' => $plan,
        ];
    }

    /**
     * Get all available plans for display.
     */
    public function getAvailablePlans(): array
    {
        return SubscriptionPlan::active()
            ->ordered()
            ->get()
            ->map(fn($p) => [
                'slug' => $p->slug,
                'name' => $p->name,
                'description' => $p->description,
                'price_monthly' => $p->price_monthly,
                'price_formatted' => $p->price_formatted,
                'minutes_included' => $p->minutes_included,
                'overage_rate' => $p->overage_rate,
                'overage_rate_formatted' => $p->overage_rate_formatted,
                'is_free_trial' => $p->isFreeTrial(),
                'is_enterprise' => $p->slug === 'enterprise',
            ])
            ->toArray();
    }
}
