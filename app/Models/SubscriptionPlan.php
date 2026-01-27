<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubscriptionPlan extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'description',
        'price_monthly',
        'minutes_included',
        'overage_rate',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price_monthly' => 'integer',
        'minutes_included' => 'integer',
        'overage_rate' => 'integer',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Get all users on this plan.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'subscription_plan_id');
    }

    /**
     * Scope for active plans.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for ordering by sort_order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }

    /**
     * Get price formatted as dollars.
     */
    public function getPriceFormattedAttribute(): string
    {
        if ($this->price_monthly === 0) {
            return 'Free';
        }
        return '$' . number_format($this->price_monthly / 100, 0);
    }

    /**
     * Get overage rate formatted as dollars per minute.
     */
    public function getOverageRateFormattedAttribute(): string
    {
        if ($this->overage_rate === 0) {
            return '—';
        }
        return '$' . number_format($this->overage_rate / 100, 2) . '/min';
    }

    /**
     * Check if this is the free trial plan.
     */
    public function isFreeTrial(): bool
    {
        return $this->slug === 'free_trial';
    }

    /**
     * Get the effective rate per minute (price / minutes).
     */
    public function getEffectiveRateAttribute(): ?float
    {
        if ($this->minutes_included === 0) {
            return null;
        }
        return $this->price_monthly / $this->minutes_included;
    }
}
