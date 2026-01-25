<?php

namespace App\Http\Controllers;

use App\Models\JobDescription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PublicCareersController extends Controller
{
    /**
     * Display the public careers page for a company.
     */
    public function show(string $token)
    {
        $user = User::where('careers_token', $token)->first();

        if (!$user) {
            return Inertia::render('PublicCareers', [
                'error' => 'This careers page is not available.',
            ]);
        }

        $jobs = JobDescription::where('user_id', $user->id)
            ->where('public_link_enabled', true)
            ->whereNotNull('public_token')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($job) {
                $companySlug = Str::slug($job->company_name);
                $jobSlug = Str::slug($job->title);

                return [
                    'id' => $job->id,
                    'title' => $job->title,
                    'company_name' => $job->company_name,
                    'location' => $job->location,
                    'remote_type' => $job->remote_type,
                    'employment_type' => $job->employment_type,
                    'salary_range' => $job->salary_range,
                    'description' => Str::limit(strip_tags($job->description ?? ''), 200),
                    'apply_url' => url("/apply/{$companySlug}/{$jobSlug}/{$job->public_token}"),
                    'created_at' => $job->created_at->format('M d, Y'),
                ];
            });

        return Inertia::render('PublicCareers', [
            'company' => [
                'name' => $user->company_name ?? $user->name,
            ],
            'jobs' => $jobs,
        ]);
    }

    /**
     * Enable careers page for the authenticated user.
     */
    public function enable(Request $request)
    {
        $user = $request->user();

        if (!$user->careers_token) {
            $user->careers_token = Str::random(16);
        }
        $user->careers_page_enabled = true;
        $user->save();

        $careersUrl = url("/careers/{$user->careers_token}");

        return response()->json([
            'success' => true,
            'careers_url' => $careersUrl,
            'careers_token' => $user->careers_token,
        ]);
    }

    /**
     * Disable careers page for the authenticated user.
     */
    public function disable(Request $request)
    {
        $user = $request->user();
        $user->careers_page_enabled = false;
        $user->save();

        return response()->json([
            'success' => true,
        ]);
    }
}
