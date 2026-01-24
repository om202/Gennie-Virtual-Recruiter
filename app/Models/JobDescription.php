<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
    ];

    protected $casts = [
        'skills' => 'array',
        'salary_min' => 'decimal:2',
        'salary_max' => 'decimal:2',
        'experience_years_min' => 'integer',
        'experience_years_max' => 'integer',
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
