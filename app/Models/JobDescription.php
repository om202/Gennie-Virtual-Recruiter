<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class JobDescription extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'title',
        'company_name',
        'description',
        'location',
        'remote_type',
        'salary_min',
        'salary_max',
        'salary_currency',
        'salary_period',
        'experience_years_min',
        'experience_years_max',
        'education_level',
        'skills',
        'employment_type',
        'benefits',
        'public_token',
        'public_link_enabled',
        'application_deadline',
    ];

    protected $casts = [
        'skills' => 'array',
        'salary_min' => 'decimal:2',
        'salary_max' => 'decimal:2',
        'experience_years_min' => 'integer',
        'experience_years_max' => 'integer',
        'public_link_enabled' => 'boolean',
        'application_deadline' => 'datetime',
    ];

    /**
     * Get the user that owns this job description.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all interviews using this job description.
     */
    public function interviews(): HasMany
    {
        return $this->hasMany(Interview::class);
    }

    /**
     * Get all applications for this job description.
     */
    public function applications(): HasMany
    {
        return $this->hasMany(JobApplication::class);
    }

    /**
     * Generate a public token for this job description.
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
     * Get the public URL for applications.
     */
    public function getPublicUrl(): ?string
    {
        if (!$this->public_token) {
            return null;
        }

        $companySlug = Str::slug($this->company_name);
        $jobSlug = Str::slug($this->title);

        return url("/apply/{$companySlug}/{$jobSlug}/{$this->public_token}");
    }

    /**
     * Enable the public application link.
     */
    public function enablePublicLink(): string
    {
        $this->generatePublicToken();
        $this->public_link_enabled = true;
        $this->save();

        return $this->getPublicUrl();
    }

    /**
     * Disable the public application link.
     */
    public function disablePublicLink(): void
    {
        $this->public_link_enabled = false;
        $this->save();
    }

    /**
     * Check if the job is accepting applications.
     */
    public function isAcceptingApplications(): bool
    {
        if (!$this->public_link_enabled) {
            return false;
        }

        if ($this->application_deadline && $this->application_deadline->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * Get formatted salary range.
     */
    public function getSalaryRangeAttribute(): ?string
    {
        if (!$this->salary_min && !$this->salary_max) {
            return null;
        }

        $currency = $this->salary_currency ?? 'USD';
        $period = $this->salary_period ?? 'yearly';
        $periodLabel = match ($period) {
            'hourly' => '/hr',
            'monthly' => '/mo',
            'yearly' => '/yr',
        };

        if ($this->salary_min && $this->salary_max) {
            return "{$currency} " . number_format((float) $this->salary_min) . " - " . number_format((float) $this->salary_max) . $periodLabel;
        }

        if ($this->salary_min) {
            return "{$currency} " . number_format((float) $this->salary_min) . "+ {$periodLabel}";
        }

        return "Up to {$currency} " . number_format((float) $this->salary_max) . $periodLabel;
    }

    /**
     * Get formatted experience range.
     */
    public function getExperienceRangeAttribute(): ?string
    {
        if (!$this->experience_years_min && !$this->experience_years_max) {
            return null;
        }

        if ($this->experience_years_min && $this->experience_years_max) {
            return "{$this->experience_years_min}-{$this->experience_years_max} years";
        }

        if ($this->experience_years_min) {
            return "{$this->experience_years_min}+ years";
        }

        return "Up to {$this->experience_years_max} years";
    }
}
