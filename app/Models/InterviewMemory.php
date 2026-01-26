<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InterviewMemory extends Model
{
    use HasUuids;

    protected $table = 'interview_memory';

    protected $fillable = [
        'interview_session_id',
        'topic',
        'content',
        'source_message',
        'embedding',
    ];

    /**
     * Get the session this memory belongs to.
     */
    public function session(): BelongsTo
    {
        return $this->belongsTo(InterviewSession::class, 'interview_session_id');
    }
}
