<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Interview extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'job_title',
        'job_description',
        'candidate_resume',
        'company_name',
        'duration_minutes',
        'interview_type',
        'difficulty_level',
        'custom_instructions',
        'language',
        'ai_model',
        'voice_id',
        'status',
        'total_sessions',
        'last_session_at',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'last_session_at' => 'datetime',
        'duration_minutes' => 'integer',
        'total_sessions' => 'integer',
    ];

    /**
     * Get the user that owns this interview.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all sessions for this interview.
     */
    public function sessions(): HasMany
    {
        return $this->hasMany(InterviewSession::class);
    }

    /**
     * Check if the interview has a job description.
     */
    public function hasJobDescription(): bool
    {
        return !empty($this->job_description);
    }

    /**
     * Check if the interview has a resume.
     */
    public function hasResume(): bool
    {
        return !empty($this->candidate_resume);
    }

    /**
     * Get context for AI agent prompt.
     */
    public function getContextForAgent(): string
    {
        $context = '';

        if ($this->hasJobDescription()) {
            $context .= "**Job Description:**\n{$this->job_description}\n\n";
        }

        if ($this->hasResume()) {
            $context .= "**Candidate Resume:**\n{$this->candidate_resume}\n\n";
        }

        if (!empty($this->custom_instructions)) {
            $context .= "**Special Instructions:**\n{$this->custom_instructions}\n\n";
        }

        return $context;
    }

    /**
     * Get the interview configuration for the AI agent.
     */
    public function getAgentConfig(): array
    {
        return [
            'job_title' => $this->job_title,
            'company_name' => $this->company_name,
            'duration_minutes' => $this->duration_minutes,
            'interview_type' => $this->interview_type,
            'difficulty_level' => $this->difficulty_level,
            'language' => $this->language,
            'ai_model' => $this->ai_model,
            'voice_id' => $this->voice_id,
            'stt_model' => $this->metadata['stt_model'] ?? 'nova-2',
        ];
    }

    /**
     * Increment session count and update last session timestamp.
     */
    public function recordSession(): void
    {
        $this->increment('total_sessions');
        $this->update(['last_session_at' => now()]);
    }

    /**
     * Scope to get only active interviews.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope to get interviews ready for use (has JD).
     */
    public function scopeReady($query)
    {
        return $query->whereNotNull('job_description');
    }
}
