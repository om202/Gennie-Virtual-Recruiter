<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InterviewSession extends Model
{
    use HasUuids;

    protected $fillable = [
        'interview_id',
        'job_description',
        'job_description_raw',
        'resume',
        'resume_raw',
        'metadata',
        'status',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    /**
     * Get the parent interview.
     */
    public function interview(): BelongsTo
    {
        return $this->belongsTo(Interview::class);
    }

    /**
     * Check if the session has a job description (directly or from parent interview).
     */
    public function hasJobDescription(): bool
    {
        return !empty($this->job_description) || $this->interview?->hasJobDescription();
    }

    /**
     * Check if the session has a resume (directly or from parent interview).
     */
    public function hasResume(): bool
    {
        return !empty($this->resume) || $this->interview?->hasResume();
    }

    /**
     * Get the effective job description (session overrides interview).
     */
    public function getJobDescription(): ?string
    {
        return $this->job_description ?? $this->interview?->job_description;
    }

    /**
     * Get the effective resume (session overrides interview).
     */
    public function getResume(): ?string
    {
        return $this->resume ?? $this->interview?->candidate_resume;
    }

    /**
     * Get context for AI agent prompt.
     * Priority: Session-level > Interview-level
     */
    public function getContextForAgent(): string
    {
        $context = '';

        // Get interview-level context first
        if ($this->interview) {
            $context .= $this->interview->getContextForAgent();
        }

        // Override with session-specific content if present
        if (!empty($this->job_description)) {
            $context = "**Job Description:**\n{$this->job_description}\n\n";
        }

        if (!empty($this->resume)) {
            // Append or replace resume section
            if (strpos($context, '**Candidate Resume:**') === false) {
                $context .= "**Candidate Resume:**\n{$this->resume}\n\n";
            } else {
                $context = preg_replace(
                    '/\*\*Candidate Resume:\*\*\n.*?\n\n/s',
                    "**Candidate Resume:**\n{$this->resume}\n\n",
                    $context
                );
            }
        }

        return $context;
    }
}
