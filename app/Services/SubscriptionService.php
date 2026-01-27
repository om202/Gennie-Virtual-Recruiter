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
     * Idempotent: calling multiple times for same session returns existing record.
     */
    public function recordUsage(InterviewSession $session): ?UsageRecord
    {
        // Idempotency: Check if already recorded
        $existing = UsageRecord::where('interview_session_id', $session->id)->first();
        if ($existing) {
            return $existing;
        }

        // Get the interview owner
        $interview = $session->interview;
        if (!$interview) {
            return null;
        }

        // Calculate duration in minutes
        $durationSeconds = $session->duration_seconds ?? 0;
        if ($durationSeconds === 0) {
            return null;
        }

        $minutes = round($durationSeconds / 60, 2);

        // Use transaction with row lock for atomic operation
        return DB::transaction(function () use ($session, $interview, $minutes) {
            // Lock user row to prevent concurrent modifications
            $user = User::lockForUpdate()->find($interview->user_id);
            if (!$user) {
                return null;
            }

            // Calculate cost (uses current usage state)
            $costCents = $this->calculateCostForUser($user, $minutes);

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
        });
    }

    /**
     * Calculate cost for given minutes based on user's plan.
     * Internal helper that takes a pre-fetched user to avoid extra queries.
     */
    private function calculateCostForUser(User $user, float $minutes): int
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

        // Get current period usage records with interview details
        $periodStart = $user->period_started_at ?? $user->created_at;
        $recentUsage = $user->usageRecords()
            ->where('recorded_at', '>=', $periodStart)
            ->orderBy('recorded_at', 'desc')
            ->limit(10)
            ->with([
                'interviewSession.candidate:id,name,email',
                'interviewSession.interview:id,job_title'
            ])
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
            ],
            'period' => [
                'started_at' => $periodStart?->toISOString(),
                'ends_at' => $user->subscription_ends_at?->toISOString(),
            ],
            'recent_usage' => $recentUsage->map(fn($r) => [
                'id' => $r->id,
                'minutes' => $r->minutes_formatted,
                'recorded_at' => $r->recorded_at->toISOString(),
                'candidate_name' => $r->interviewSession?->candidate?->name ?? 'Unknown',
                'job_title' => $r->interviewSession?->interview?->job_title ?? 'Interview',
            ]),
            'scheduled_downgrade' => $user->hasPendingDowngrade() ? [
                'plan_slug' => $user->scheduledPlan->slug,
                'plan_name' => $user->scheduledPlan->name,
                'effective_date' => $user->subscription_ends_at?->toISOString(),
                'effective_date_formatted' => $user->subscription_ends_at?->format('M j, Y'),
            ] : null,
        ];
    }

    /**
     * Get full usage history for a user with pagination and monthly summaries.
     * Optimized for large datasets (1000+ records).
     */
    public function getUsageHistory(User $user, int $page = 1, int $perPage = 20): array
    {
        // Eager load relationships upfront to avoid N+1 queries
        $records = $user->usageRecords()
            ->with([
                'interviewSession:id,candidate_id,interview_id',
                'interviewSession.candidate:id,name',
                'interviewSession.interview:id,job_title'
            ])
            ->orderBy('recorded_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        // Transform records efficiently (no additional queries)
        $recordsWithDetails = $records->getCollection()->map(fn($r) => [
            'id' => $r->id,
            'minutes' => $r->minutes_formatted,
            'recorded_at' => $r->recorded_at->toISOString(),
            'candidate_name' => $r->interviewSession?->candidate?->name ?? 'Unknown',
            'job_title' => $r->interviewSession?->interview?->job_title ?? 'Interview',
        ]);

        // Only fetch aggregates on first page (they don't change per page)
        // This significantly reduces load on subsequent page requests
        $monthlySummary = [];
        $allTime = ['total_minutes' => 0, 'total_sessions' => 0];

        if ($page === 1) {
            // Get monthly summaries - PostgreSQL uses index on (user_id, recorded_at)
            $monthlySummary = $user->usageRecords()
                ->selectRaw("DATE_TRUNC('month', recorded_at) as month")
                ->selectRaw('SUM(minutes_used) as total_minutes')
                ->selectRaw('COUNT(*) as session_count')
                ->groupByRaw("DATE_TRUNC('month', recorded_at)")
                ->orderBy('month', 'desc')
                ->limit(12)
                ->get()
                ->map(fn($row) => [
                    'month' => $row->month,
                    'month_label' => \Carbon\Carbon::parse($row->month)->format('M Y'),
                    'total_minutes' => round((float) $row->total_minutes, 1),
                    'session_count' => (int) $row->session_count,
                ]);

            // All-time totals - single aggregate query
            $allTimeTotals = $user->usageRecords()
                ->selectRaw('SUM(minutes_used) as total_minutes')
                ->selectRaw('COUNT(*) as total_sessions')
                ->first();

            $allTime = [
                'total_minutes' => round((float) ($allTimeTotals->total_minutes ?? 0), 1),
                'total_sessions' => (int) ($allTimeTotals->total_sessions ?? 0),
            ];
        }

        return [
            'records' => $recordsWithDetails,
            'pagination' => [
                'current_page' => $records->currentPage(),
                'last_page' => $records->lastPage(),
                'per_page' => $records->perPage(),
                'total' => $records->total(),
            ],
            'monthly_summary' => $monthlySummary,
            'all_time' => $allTime,
        ];
    }

    /**
     * Change user's plan - upgrades are immediate, downgrades are scheduled.
     */
    public function changePlan(User $user, string $planSlug): array
    {
        $newPlan = SubscriptionPlan::where('slug', $planSlug)->where('is_active', true)->first();

        if (!$newPlan) {
            return [
                'success' => false,
                'message' => 'Plan not found.',
            ];
        }

        if ($newPlan->slug === 'enterprise') {
            return [
                'success' => false,
                'message' => 'Please contact sales for Enterprise pricing.',
            ];
        }

        $currentPlan = $user->getCurrentPlan();

        // Same plan - no change needed
        if ($currentPlan && $currentPlan->id === $newPlan->id) {
            return [
                'success' => false,
                'message' => 'You are already on this plan.',
            ];
        }

        // Determine if this is an upgrade or downgrade based on price
        $currentPrice = $currentPlan ? $currentPlan->price_monthly : 0;
        $newPrice = $newPlan->price_monthly;
        $isUpgrade = $newPrice > $currentPrice;

        if ($isUpgrade) {
            // Upgrades are immediate - apply now
            return $this->applyPlanChange($user, $newPlan, true);
        } else {
            // Downgrades are scheduled for next billing period
            return $this->scheduleDowngrade($user, $newPlan);
        }
    }

    /**
     * Apply a plan change immediately (for upgrades).
     */
    private function applyPlanChange(User $user, SubscriptionPlan $plan, bool $isUpgrade): array
    {
        DB::transaction(function () use ($user, $plan) {
            $now = now();
            $user->update([
                'subscription_plan_id' => $plan->id,
                'scheduled_plan_id' => null, // Clear any scheduled downgrade
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
            'type' => 'upgrade',
        ];
    }

    /**
     * Schedule a downgrade for the next billing period.
     */
    private function scheduleDowngrade(User $user, SubscriptionPlan $plan): array
    {
        $user->update(['scheduled_plan_id' => $plan->id]);

        $endsAt = $user->subscription_ends_at ?? now()->addMonth();

        return [
            'success' => true,
            'message' => "Downgrade to {$plan->name} scheduled. Takes effect on {$endsAt->format('M j, Y')}.",
            'plan' => $plan,
            'type' => 'scheduled_downgrade',
            'effective_date' => $endsAt->toISOString(),
        ];
    }

    /**
     * Cancel a scheduled downgrade.
     * 
     * Edge cases handled:
     * - No scheduled downgrade exists
     * - Billing period has already ended (too late to cancel)
     * - Race condition (downgrade applied between check and cancel)
     */
    public function cancelScheduledDowngrade(User $user): array
    {
        // Edge case 1: No scheduled downgrade
        if (!$user->hasPendingDowngrade()) {
            return [
                'success' => false,
                'message' => 'No scheduled downgrade to cancel.',
            ];
        }

        // Edge case 2: Billing period has already ended - downgrade may have been applied
        $endsAt = $user->subscription_ends_at;
        if ($endsAt && $endsAt->isPast()) {
            // Refresh user to check if downgrade was already applied
            $user->refresh();

            if (!$user->hasPendingDowngrade()) {
                return [
                    'success' => false,
                    'message' => 'Your billing period has ended and the downgrade has already been applied.',
                ];
            }
        }

        // Edge case 3: Race condition - use transaction with lock
        return DB::transaction(function () use ($user) {
            // Re-fetch with lock to prevent race condition
            $lockedUser = User::lockForUpdate()->find($user->id);

            if (!$lockedUser->hasPendingDowngrade()) {
                return [
                    'success' => false,
                    'message' => 'The scheduled downgrade has already been processed.',
                ];
            }

            $scheduledPlan = $lockedUser->scheduledPlan;
            $lockedUser->update(['scheduled_plan_id' => null]);

            return [
                'success' => true,
                'message' => "Scheduled downgrade to {$scheduledPlan->name} has been cancelled. You will remain on your current plan.",
            ];
        });
    }

    /**
     * Apply all scheduled downgrades (run via cron at billing period end).
     */
    public function applyScheduledDowngrades(): int
    {
        $count = 0;
        $now = now();

        // Find users whose billing period has ended and have a scheduled downgrade
        $users = User::whereNotNull('scheduled_plan_id')
            ->where('subscription_ends_at', '<=', $now)
            ->with(['scheduledPlan'])
            ->get();

        foreach ($users as $user) {
            if ($user->scheduledPlan) {
                DB::transaction(function () use ($user, $now) {
                    $user->update([
                        'subscription_plan_id' => $user->scheduled_plan_id,
                        'scheduled_plan_id' => null,
                        'subscription_started_at' => $now,
                        'subscription_ends_at' => $now->copy()->addMonth(),
                        'minutes_used_this_period' => 0,
                        'period_started_at' => $now,
                    ]);
                });
                $count++;
            }
        }

        return $count;
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
