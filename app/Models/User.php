<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'avatar',
        'company_name',
        'phone',
        'is_onboarded',
        // Company Settings
        'company_logo',
        'company_description',
        'company_industry',
        'company_website',
        // Interview Preferences
        'default_voice_id',
        'default_interview_duration',
        'default_greeting_message',
        'timezone',
        // Notification Settings
        'notify_interview_completed',
        'notify_high_score',
        'high_score_threshold',
        'notification_frequency',
        'notify_scheduled_reminders',
        // Branding
        'brand_color',
        'thank_you_message',
        // Subscription
        'subscription_plan_id',
        'subscription_started_at',
        'subscription_ends_at',
        'minutes_used_this_period',
        'period_started_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_onboarded' => 'boolean',
            'notify_interview_completed' => 'boolean',
            'notify_high_score' => 'boolean',
            'notify_scheduled_reminders' => 'boolean',
            'default_interview_duration' => 'integer',
            'high_score_threshold' => 'integer',
            'subscription_started_at' => 'datetime',
            'subscription_ends_at' => 'datetime',
            'minutes_used_this_period' => 'decimal:2',
            'period_started_at' => 'datetime',
        ];
    }

    /**
     * Get all interviews created by this user.
     */
    public function interviews()
    {
        return $this->hasMany(\App\Models\Interview::class);
    }

    /**
     * Get all candidates created by this user.
     */
    public function candidates()
    {
        return $this->hasMany(\App\Models\Candidate::class);
    }

    /**
     * Get the user's subscription plan.
     */
    public function subscriptionPlan()
    {
        return $this->belongsTo(\App\Models\SubscriptionPlan::class);
    }

    /**
     * Get usage records for this user.
     */
    public function usageRecords()
    {
        return $this->hasMany(\App\Models\UsageRecord::class);
    }

    /**
     * Get the current plan or default to free trial.
     * Falls back to free trial if subscription has expired.
     */
    public function getCurrentPlan(): ?\App\Models\SubscriptionPlan
    {
        // Check if subscription has expired
        if ($this->subscription_ends_at && $this->subscription_ends_at->isPast()) {
            // Expired - fall back to free trial
            return \App\Models\SubscriptionPlan::where('slug', 'free_trial')->first();
        }

        if ($this->subscriptionPlan) {
            return $this->subscriptionPlan;
        }
        return \App\Models\SubscriptionPlan::where('slug', 'free_trial')->first();
    }

    /**
     * Get minutes remaining in current period.
     * Auto-resets period if more than 1 month has passed.
     */
    public function getMinutesRemaining(): float
    {
        // Auto-reset period if expired (more than 1 month)
        if ($this->period_started_at && $this->period_started_at->lt(now()->subMonth())) {
            $this->update([
                'minutes_used_this_period' => 0,
                'period_started_at' => now(),
            ]);
        }

        $plan = $this->getCurrentPlan();
        if (!$plan || $plan->minutes_included === 0) {
            return 0;
        }
        $used = (float) ($this->minutes_used_this_period ?? 0);
        return max(0, $plan->minutes_included - $used);
    }

    /**
     * Check if user is over their limit.
     */
    public function isOverLimit(): bool
    {
        $plan = $this->getCurrentPlan();
        if (!$plan)
            return true;
        if ($plan->slug === 'enterprise')
            return false; // Unlimited
        if ($plan->isFreeTrial() && $this->getMinutesRemaining() <= 0)
            return true;
        return false;
    }

    /**
     * Check if user can start a new interview.
     */
    public function canStartInterview(): bool
    {
        $plan = $this->getCurrentPlan();
        if (!$plan)
            return false;

        // Enterprise always can
        if ($plan->slug === 'enterprise')
            return true;

        // Free trial: check if minutes remaining
        if ($plan->isFreeTrial()) {
            return $this->getMinutesRemaining() > 0;
        }

        // Paid plans: can always start (will charge overage)
        return true;
    }
}

