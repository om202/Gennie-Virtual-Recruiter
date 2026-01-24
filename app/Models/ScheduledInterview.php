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
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
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
        return url("/s/{$this->public_token}");
    }

    /**
     * Check if the scheduled interview is accessible.
     */
    public function isAccessible(): bool
    {
        return $this->status === 'scheduled' && $this->scheduled_at->isFuture();
    }
}
