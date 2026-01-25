<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobApplication extends Model
{
    use HasUuids;

    protected $fillable = [
        'job_description_id',
        'candidate_id',
        'resume_path',
        'resume_text',
        'cover_letter',
        'status',
        'source',
        'metadata',
        'applied_at',
        'reviewed_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'applied_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    /**
     * Get the job description this application is for.
     */
    public function jobDescription(): BelongsTo
    {
        return $this->belongsTo(JobDescription::class);
    }

    /**
     * Get the candidate who submitted this application.
     */
    public function candidate(): BelongsTo
    {
        return $this->belongsTo(Candidate::class);
    }

    /**
     * Mark application as under review.
     */
    public function markAsUnderReview(): void
    {
        $this->update([
            'status' => 'under_review',
            'reviewed_at' => now(),
        ]);
    }

    /**
     * Mark application as shortlisted.
     */
    public function markAsShortlisted(): void
    {
        $this->update(['status' => 'shortlisted']);
    }

    /**
     * Mark application as rejected.
     */
    public function markAsRejected(): void
    {
        $this->update(['status' => 'rejected']);
    }

    /**
     * Get status badge color.
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'applied' => 'bg-blue-500/10 text-blue-700',
            'under_review' => 'bg-yellow-500/10 text-yellow-700',
            'shortlisted' => 'bg-green-500/10 text-green-700',
            'rejected' => 'bg-red-500/10 text-red-700',
            default => 'bg-gray-500/10 text-gray-700',
        };
    }

    /**
     * Get status label.
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'applied' => 'Applied',
            'under_review' => 'Under Review',
            'shortlisted' => 'Shortlisted',
            'rejected' => 'Rejected',
            default => ucfirst($this->status),
        };
    }
}
