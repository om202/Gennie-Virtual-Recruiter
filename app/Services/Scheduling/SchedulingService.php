<?php

namespace App\Services\Scheduling;

use Carbon\Carbon;
use App\Models\User;
use App\Models\ScheduledInterview;

/**
 * SchedulingService - Centralized scheduling and timezone handling.
 * 
 * Standard: Store UTC, Display Local.
 * 
 * Usage:
 *   app(SchedulingService::class)->formatForUser($utcDateTime, $user);
 *   app(SchedulingService::class)->getTimezones();
 */
class SchedulingService
{
    protected array $config;

    public function __construct()
    {
        $this->config = require __DIR__ . '/config.php';
    }

    /*
    |--------------------------------------------------------------------------
    | Timezone Conversion
    |--------------------------------------------------------------------------
    */

    /**
     * Convert UTC datetime to user's timezone.
     */
    public function toUserTimezone(Carbon $utc, User|string|null $userOrTimezone = null): Carbon
    {
        $timezone = $this->resolveTimezone($userOrTimezone);
        return $utc->copy()->setTimezone($timezone);
    }

    /**
     * Convert local datetime to UTC for storage.
     */
    public function toUTC(Carbon $local, string $timezone): Carbon
    {
        return $local->copy()->shiftTimezone($timezone)->setTimezone('UTC');
    }

    /**
     * Get the current time in user's timezone.
     */
    public function nowForUser(User|string|null $userOrTimezone = null): Carbon
    {
        $timezone = $this->resolveTimezone($userOrTimezone);
        return Carbon::now($timezone);
    }

    /*
    |--------------------------------------------------------------------------
    | Display Formatting
    |--------------------------------------------------------------------------
    */

    /**
     * Format a UTC datetime for display in user's timezone.
     * 
     * @param Carbon $utc The UTC datetime
     * @param User|string|null $userOrTimezone User object or timezone string
     * @param string $format Format preset key or custom format string
     */
    public function formatForUser(
        Carbon $utc,
        User|string|null $userOrTimezone = null,
        string $format = 'full'
    ): string {
        $local = $this->toUserTimezone($utc, $userOrTimezone);
        $formatString = $this->config['formats'][$format] ?? $format;
        return $local->format($formatString);
    }

    /**
     * Format date and time separately for emails.
     * Returns array with 'date' and 'time' keys.
     */
    public function formatForEmail(Carbon $utc, User|string|null $userOrTimezone = null): array
    {
        $local = $this->toUserTimezone($utc, $userOrTimezone);

        return [
            'date' => $local->format($this->config['formats']['email_date']),
            'time' => $local->format($this->config['formats']['email_time']),
            'timezone' => $local->format('T'), // EST, PST, etc.
            'timezone_full' => $local->getTimezone()->getName(),
        ];
    }

    /**
     * Format as relative time (e.g., "in 2 hours", "tomorrow at 3 PM").
     */
    public function formatRelative(Carbon $utc, User|string|null $userOrTimezone = null): string
    {
        $local = $this->toUserTimezone($utc, $userOrTimezone);
        return $local->diffForHumans();
    }

    /*
    |--------------------------------------------------------------------------
    | Scheduling Helpers
    |--------------------------------------------------------------------------
    */

    /**
     * Check if a proposed time conflicts with existing schedules for a candidate.
     * Considers a buffer window (default: 30 minutes before/after).
     */
    public function hasConflict(
        string $candidateId,
        Carbon $proposedTime,
        int $bufferMinutes = 30,
        ?string $excludeScheduleId = null
    ): bool {
        $query = ScheduledInterview::where('candidate_id', $candidateId)
            ->where('status', 'scheduled')
            ->whereBetween('scheduled_at', [
                $proposedTime->copy()->subMinutes($bufferMinutes),
                $proposedTime->copy()->addMinutes($bufferMinutes),
            ]);

        if ($excludeScheduleId) {
            $query->where('id', '!=', $excludeScheduleId);
        }

        return $query->exists();
    }

    /**
     * Check if a time is in the past.
     */
    public function isPast(Carbon $datetime): bool
    {
        return $datetime->isPast();
    }

    /**
     * Get upcoming schedules for a user, grouped by date.
     */
    public function getUpcomingGroupedByDate(User $user): array
    {
        $schedules = ScheduledInterview::whereHas('interview', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
            ->with(['interview:id,job_title,company_name', 'candidate:id,name,email'])
            ->where('scheduled_at', '>=', now())
            ->where('status', 'scheduled')
            ->orderBy('scheduled_at', 'asc')
            ->get();

        $grouped = [];
        $timezone = $user->timezone ?? $this->config['default_timezone'];

        foreach ($schedules as $schedule) {
            $localDate = $this->toUserTimezone($schedule->scheduled_at, $timezone);
            $dateKey = $localDate->format('Y-m-d');
            $dateLabel = $localDate->format('l, F j'); // Monday, January 27

            if (!isset($grouped[$dateKey])) {
                $grouped[$dateKey] = [
                    'label' => $dateLabel,
                    'schedules' => [],
                ];
            }

            $grouped[$dateKey]['schedules'][] = [
                'id' => $schedule->id,
                'time' => $localDate->format('g:i A'),
                'candidate' => $schedule->candidate,
                'interview' => $schedule->interview,
                'public_url' => $schedule->getPublicUrl(),
            ];
        }

        return $grouped;
    }

    /*
    |--------------------------------------------------------------------------
    | Configuration Access
    |--------------------------------------------------------------------------
    */

    /**
     * Get all available timezones for UI dropdowns.
     */
    public function getTimezones(): array
    {
        return $this->config['timezones'];
    }

    /**
     * Get the default timezone.
     */
    public function getDefaultTimezone(): string
    {
        return $this->config['default_timezone'];
    }

    /**
     * Get all format presets.
     */
    public function getFormats(): array
    {
        return $this->config['formats'];
    }

    /*
    |--------------------------------------------------------------------------
    | Internal Helpers
    |--------------------------------------------------------------------------
    */

    /**
     * Resolve timezone from various input types.
     */
    protected function resolveTimezone(User|string|null $userOrTimezone): string
    {
        if ($userOrTimezone instanceof User) {
            return $userOrTimezone->timezone ?? $this->config['default_timezone'];
        }

        if (is_string($userOrTimezone) && !empty($userOrTimezone)) {
            return $userOrTimezone;
        }

        // Fallback: try to get from authenticated user
        $authUser = auth()->user();
        if ($authUser && $authUser->timezone) {
            return $authUser->timezone;
        }

        return $this->config['default_timezone'];
    }
}
