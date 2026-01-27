<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UsageRecord extends Model
{
    protected $fillable = [
        'user_id',
        'interview_session_id',
        'minutes_used',
        'cost_cents',
        'plan_slug',
        'recorded_at',
    ];

    protected $casts = [
        'minutes_used' => 'decimal:2',
        'cost_cents' => 'integer',
        'recorded_at' => 'datetime',
    ];

    /**
     * Get the user this usage belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the interview session this usage is for.
     */
    public function interviewSession(): BelongsTo
    {
        return $this->belongsTo(InterviewSession::class);
    }

    /**
     * Get cost formatted as dollars.
     */
    public function getCostFormattedAttribute(): string
    {
        return '$' . number_format($this->cost_cents / 100, 2);
    }

    /**
     * Get minutes formatted with label.
     */
    public function getMinutesFormattedAttribute(): string
    {
        return number_format((float) $this->minutes_used, 1) . ' min';
    }
}
