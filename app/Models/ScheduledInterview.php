<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class ScheduledInterview extends Model
{
    protected $fillable = [
        'interview_id',
        'candidate_id',
        'scheduled_at',
        'status',
        'meeting_link',
        'public_token',
        'otp_code',
        'otp_expires_at',
        'otp_verified',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'otp_expires_at' => 'datetime',
        'otp_verified' => 'boolean',
    ];

    /**
     * Boot method to auto-generate public token on creation.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($schedule) {
            if (!$schedule->public_token) {
                $schedule->public_token = Str::random(32);
            }
        });
    }

    public function interview(): BelongsTo
    {
        return $this->belongsTo(Interview::class);
    }

    public function candidate(): BelongsTo
    {
        return $this->belongsTo(Candidate::class);
    }

    /**
     * Get the public URL for this scheduled interview.
     */
    public function getPublicUrl(): string
    {
        $interview = $this->interview;
        $companySlug = Str::slug($interview?->company_name ?: 'company');
        $jobSlug = Str::slug($interview?->job_title ?: 'interview');

        return url("/s/{$companySlug}/{$jobSlug}/{$this->public_token}");
    }

    /**
     * Get the access status for this scheduled interview.
     * 
     * Time window: scheduled_at - 5 min early to scheduled_at + duration + 10 min late
     * 
     * @return string One of: too_early, accessible, expired, completed, cancelled, in_progress
     */
    public function getAccessStatus(): string
    {
        // Check completion states first (these override time-based checks)
        if ($this->status === 'completed') {
            return 'completed';
        }
        if ($this->status === 'cancelled') {
            return 'cancelled';
        }
        if ($this->status === 'in_progress') {
            return 'in_progress';
        }

        $now = now();
        $windowStart = $this->scheduled_at->copy()->subMinutes(5);
        $interviewDuration = $this->interview?->duration_minutes ?? 15;
        $windowEnd = $this->scheduled_at->copy()->addMinutes($interviewDuration + 10);

        if ($now->lt($windowStart)) {
            return 'too_early';
        }

        if ($now->gt($windowEnd)) {
            return 'expired';
        }

        return 'accessible';
    }

    /**
     * Get when the access window opens (for "too early" state).
     */
    public function getWindowOpensAt(): ?\Carbon\Carbon
    {
        return $this->scheduled_at->copy()->subMinutes(5);
    }

    // =========================================================================
    // OTP Methods
    // =========================================================================

    /**
     * Generate a new 6-digit OTP code with 10-minute expiry.
     */
    public function generateOtp(): string
    {
        $this->otp_code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $this->otp_expires_at = now()->addMinutes(10);
        $this->otp_verified = false;
        $this->save();

        return $this->otp_code;
    }

    /**
     * Verify the provided OTP code.
     * 
     * @return array{success: bool, error?: string}
     */
    public function verifyOtp(string $code): array
    {
        if (!$this->otp_code || !$this->otp_expires_at) {
            return ['success' => false, 'error' => 'No access code has been requested. Please request a new code.'];
        }

        if (now()->gt($this->otp_expires_at)) {
            return ['success' => false, 'error' => 'Access code has expired. Please request a new one.'];
        }

        if ($this->otp_code !== $code) {
            return ['success' => false, 'error' => 'Invalid access code. Please check and try again.'];
        }

        // Mark as verified
        $this->otp_verified = true;
        $this->save();

        return ['success' => true];
    }

    /**
     * Check if OTP has been verified for this schedule.
     */
    public function isOtpVerified(): bool
    {
        return $this->otp_verified === true;
    }

    /**
     * Reset OTP (for when interview is rescheduled).
     */
    public function resetOtp(): void
    {
        $this->otp_code = null;
        $this->otp_expires_at = null;
        $this->otp_verified = false;
        $this->save();
    }
}

