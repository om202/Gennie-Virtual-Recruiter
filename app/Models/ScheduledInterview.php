<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScheduledInterview extends Model
{
    protected $fillable = [
        'interview_id',
        'candidate_id',
        'scheduled_at',
        'status',
        'meeting_link',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
    ];

    public function interview(): BelongsTo
    {
        return $this->belongsTo(Interview::class);
    }

    public function candidate(): BelongsTo
    {
        return $this->belongsTo(Candidate::class);
    }
}
