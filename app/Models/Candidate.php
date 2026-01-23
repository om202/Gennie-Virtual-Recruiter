<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Candidate extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'name',
        'email',
        'phone',
        'resume_path',
        'resume_text',
        'linkedin_url',
        'skills',
        'experience_summary',
        'location',
        // ATS Data
        'work_history',
        'education',
        'certificates',
        'work_authorization',
        'authorized_to_work',
        'sponsorship_needed',
        'salary_expectation',
        'address',
        'city',
        'state',
        'zip',
    ];

    protected $casts = [
        'skills' => 'array',
        'work_history' => 'array',
        'education' => 'array',
        'certificates' => 'array',
        'authorized_to_work' => 'boolean',
        'sponsorship_needed' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function interviewSessions(): HasMany
    {
        return $this->hasMany(InterviewSession::class);
    }
}
