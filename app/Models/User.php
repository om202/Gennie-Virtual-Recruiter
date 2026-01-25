<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'avatar',
        'company_name',
        'phone',
        'is_onboarded',
        // Company Settings
        'company_logo',
        'company_description',
        'company_industry',
        'company_website',
        // Interview Preferences
        'default_voice_id',
        'default_interview_duration',
        'default_greeting_message',
        'timezone',
        // Notification Settings
        'notify_interview_completed',
        'notify_high_score',
        'high_score_threshold',
        'notification_frequency',
        'notify_scheduled_reminders',
        // Branding
        'brand_color',
        'thank_you_message',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_onboarded' => 'boolean',
            'notify_interview_completed' => 'boolean',
            'notify_high_score' => 'boolean',
            'notify_scheduled_reminders' => 'boolean',
            'default_interview_duration' => 'integer',
            'high_score_threshold' => 'integer',
        ];
    }

    /**
     * Get all interviews created by this user.
     */
    public function interviews()
    {
        return $this->hasMany(\App\Models\Interview::class);
    }

    /**
     * Get all candidates created by this user.
     */
    public function candidates()
    {
        return $this->hasMany(\App\Models\Candidate::class);
    }
}
