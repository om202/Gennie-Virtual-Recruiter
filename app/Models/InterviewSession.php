<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class InterviewSession extends Model
{
    use HasUuids;

    protected $fillable = [
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
     * Check if the session has a job description.
     */
    public function hasJobDescription(): bool
    {
        return !empty($this->job_description);
    }

    /**
     * Check if the session has a resume.
     */
    public function hasResume(): bool
    {
        return !empty($this->resume);
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
            $context .= "**Candidate Resume:**\n{$this->resume}\n\n";
        }

        return $context;
    }
}
