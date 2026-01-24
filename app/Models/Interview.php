<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Interview extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'job_description_id',
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
        'required_questions',
        'public_token',
        'public_link_enabled',
    ];

    protected $casts = [
        'metadata' => 'array',
        'required_questions' => 'array',
        'last_session_at' => 'datetime',
        'duration_minutes' => 'integer',
        'total_sessions' => 'integer',
        'public_link_enabled' => 'boolean',
    ];

    /**
     * Get the user that owns this interview.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the job description for this interview.
     */
    public function jobDescription(): BelongsTo
    {
        return $this->belongsTo(JobDescription::class);
    }

    /**
     * Get all sessions for this interview.
     */
    public function sessions(): HasMany
    {
        return $this->hasMany(InterviewSession::class);
    }

    /**
     * Get all scheduled interviews for this template.
     */
    public function scheduledInterviews(): HasMany
    {
        return $this->hasMany(ScheduledInterview::class);
    }

    /**
     * Check if the interview has a linked job description.
     */
    public function hasLinkedJobDescription(): bool
    {
        return !empty($this->job_description_id);
    }

    /**
     * Check if the interview has a job description (legacy or linked).
     */
    public function hasJobDescription(): bool
    {
        // Check linked JD first, then fall back to legacy embedded JD
        if ($this->hasLinkedJobDescription() && $this->jobDescription) {
            return !empty($this->jobDescription->description);
        }
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

        // Use linked JD if available, otherwise use legacy embedded JD
        if ($this->hasLinkedJobDescription() && $this->jobDescription) {
            $jd = $this->jobDescription;
            $context .= "**Job Description:**\n";
            $context .= "Title: {$jd->title}\n";
            $context .= "Company: {$jd->company_name}\n";
            if ($jd->location) {
                $context .= "Location: {$jd->location} ({$jd->remote_type})\n";
            }
            if ($jd->description) {
                $context .= "\n{$jd->description}\n\n";
            }
        } elseif (!empty($this->job_description)) {
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
            'stt_config' => $this->metadata['stt_config'] ?? [],
            'required_questions' => $this->required_questions ?? [],
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

    /**
     * Generate a public token for this interview.
     */
    public function generatePublicToken(): string
    {
        if (!$this->public_token) {
            $this->public_token = Str::random(32);
            $this->save();
        }
        return $this->public_token;
    }

    /**
     * Get the public URL for this interview.
     */
    public function getPublicUrl(): ?string
    {
        if (!$this->public_token) {
            return null;
        }
        return url("/i/{$this->public_token}");
    }

    /**
     * Enable public link access for this interview.
     */
    public function enablePublicLink(): string
    {
        $token = $this->generatePublicToken();
        $this->update(['public_link_enabled' => true]);
        return $this->getPublicUrl();
    }

    /**
     * Disable public link access for this interview.
     */
    public function disablePublicLink(): void
    {
        $this->update(['public_link_enabled' => false]);
    }

    /**
     * Check if public link is accessible.
     */
    public function isPubliclyAccessible(): bool
    {
        return $this->public_link_enabled && !empty($this->public_token) && $this->status === 'active';
    }
}

