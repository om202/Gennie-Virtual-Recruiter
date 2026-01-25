<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Display the profile settings page.
     */
    public function index()
    {
        $user = Auth::user();

        // Available voices (you can expand this list)
        $voices = [
            ['id' => 'alloy', 'name' => 'Alloy', 'description' => 'Neutral, balanced'],
            ['id' => 'echo', 'name' => 'Echo', 'description' => 'Male, warm'],
            ['id' => 'fable', 'name' => 'Fable', 'description' => 'British, expressive'],
            ['id' => 'onyx', 'name' => 'Onyx', 'description' => 'Male, deep'],
            ['id' => 'nova', 'name' => 'Nova', 'description' => 'Female, friendly'],
            ['id' => 'shimmer', 'name' => 'Shimmer', 'description' => 'Female, warm'],
        ];

        // Common industries
        $industries = [
            'Technology',
            'Healthcare',
            'Finance',
            'Retail',
            'Manufacturing',
            'Education',
            'Consulting',
            'Marketing',
            'Real Estate',
            'Legal',
            'Non-profit',
            'Government',
            'Other',
        ];

        // Common timezones
        $timezones = [
            'America/New_York' => 'Eastern Time (ET)',
            'America/Chicago' => 'Central Time (CT)',
            'America/Denver' => 'Mountain Time (MT)',
            'America/Los_Angeles' => 'Pacific Time (PT)',
            'America/Anchorage' => 'Alaska Time (AKT)',
            'Pacific/Honolulu' => 'Hawaii Time (HT)',
            'Europe/London' => 'London (GMT)',
            'Europe/Paris' => 'Paris (CET)',
            'Asia/Tokyo' => 'Tokyo (JST)',
            'Asia/Shanghai' => 'Shanghai (CST)',
            'Asia/Kolkata' => 'India (IST)',
            'Australia/Sydney' => 'Sydney (AEST)',
        ];

        return Inertia::render('Profile', [
            'auth' => ['user' => $user],
            'voices' => $voices,
            'industries' => $industries,
            'timezones' => $timezones,
        ]);
    }

    /**
     * Update account information.
     */
    public function updateAccount(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
        ]);

        $user = Auth::user();
        $user->update($request->only(['name', 'phone']));

        return back()->with('success', 'Account information updated successfully.');
    }

    /**
     * Update company settings.
     */
    public function updateCompany(Request $request)
    {
        $request->validate([
            'company_name' => 'required|string|max:255',
            'company_description' => 'nullable|string|max:1000',
            'company_industry' => 'nullable|string|max:100',
            'company_website' => 'nullable|url|max:255',
        ]);

        $user = Auth::user();
        $user->update($request->only([
            'company_name',
            'company_description',
            'company_industry',
            'company_website',
        ]));

        return back()->with('success', 'Company settings updated successfully.');
    }

    /**
     * Upload company logo.
     */
    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $user = Auth::user();

        // Delete old logo if exists
        if ($user->company_logo) {
            Storage::disk('public')->delete($user->company_logo);
        }

        // Store new logo
        $path = $request->file('logo')->store('company-logos', 'public');
        $user->update(['company_logo' => $path]);

        return back()->with('success', 'Company logo updated successfully.');
    }

    /**
     * Update interview preferences.
     */
    public function updateInterviewPreferences(Request $request)
    {
        $request->validate([
            'default_voice_id' => 'nullable|string|max:50',
            'default_interview_duration' => 'required|integer|min:5|max:120',
            'default_greeting_message' => 'nullable|string|max:500',
            'timezone' => 'required|string|max:100',
        ]);

        $user = Auth::user();
        $user->update($request->only([
            'default_voice_id',
            'default_interview_duration',
            'default_greeting_message',
            'timezone',
        ]));

        return back()->with('success', 'Interview preferences updated successfully.');
    }

    /**
     * Update notification settings.
     */
    public function updateNotifications(Request $request)
    {
        $request->validate([
            'notify_interview_completed' => 'boolean',
            'notify_high_score' => 'boolean',
            'high_score_threshold' => 'required|integer|min:0|max:100',
            'notification_frequency' => 'required|in:instant,daily,weekly',
            'notify_scheduled_reminders' => 'boolean',
        ]);

        $user = Auth::user();
        $user->update([
            'notify_interview_completed' => $request->boolean('notify_interview_completed'),
            'notify_high_score' => $request->boolean('notify_high_score'),
            'high_score_threshold' => $request->high_score_threshold,
            'notification_frequency' => $request->notification_frequency,
            'notify_scheduled_reminders' => $request->boolean('notify_scheduled_reminders'),
        ]);

        return back()->with('success', 'Notification settings updated successfully.');
    }

    /**
     * Update branding settings.
     */
    public function updateBranding(Request $request)
    {
        $request->validate([
            'brand_color' => 'required|string|regex:/^#[a-fA-F0-9]{6}$/',
            'thank_you_message' => 'nullable|string|max:1000',
        ]);

        $user = Auth::user();
        $user->update($request->only([
            'brand_color',
            'thank_you_message',
        ]));

        return back()->with('success', 'Branding settings updated successfully.');
    }
}
