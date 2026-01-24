<?php

namespace App\Http\Controllers;

use App\Models\Interview;
use App\Models\ScheduledInterview;
use App\Models\InterviewSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PublicInterviewController extends Controller
{
    /**
     * Show public interview page for generic interview links.
     * Company and job slugs are for SEO-friendly URLs, lookup is done by token only.
     */
    public function showInterview(string $company, string $job, string $token)
    {
        $interview = Interview::where('public_token', $token)
            ->where('public_link_enabled', true)
            ->where('status', 'active')
            ->first();

        if (!$interview) {
            abort(404, 'Interview not found or no longer available.');
        }

        // Check if current user is the interview owner (self-preview)
        $isSelfPreview = Auth::check() && Auth::id() === $interview->user_id;

        return Inertia::render('PublicInterview', [
            'interview' => [
                'id' => $interview->id,
                'job_title' => $interview->job_title,
                'company_name' => $interview->company_name,
                'duration_minutes' => $interview->duration_minutes,
                'interview_type' => $interview->interview_type,
                'difficulty_level' => $interview->difficulty_level,
                'candidate_instructions' => $interview->candidate_instructions,
            ],
            'token' => $token,
            'type' => 'interview',
            'isSelfPreview' => $isSelfPreview,
        ]);
    }

    /**
     * Show public interview page for scheduled interview links.
     * Company and job slugs are for SEO-friendly URLs, lookup is done by token only.
     */
    public function showScheduledInterview(string $company, string $job, string $token)
    {
        $schedule = ScheduledInterview::where('public_token', $token)
            ->with(['interview', 'candidate:id,name,email'])
            ->first();

        if (!$schedule) {
            abort(404, 'Scheduled interview not found.');
        }

        // Check if schedule is still valid
        if ($schedule->status !== 'scheduled') {
            return Inertia::render('PublicInterview', [
                'error' => 'This interview has already been completed or cancelled.',
                'type' => 'scheduled',
            ]);
        }

        $interview = $schedule->interview;

        return Inertia::render('PublicInterview', [
            'interview' => [
                'id' => $interview->id,
                'job_title' => $interview->job_title,
                'company_name' => $interview->company_name,
                'duration_minutes' => $interview->duration_minutes,
                'interview_type' => $interview->interview_type,
                'difficulty_level' => $interview->difficulty_level,
            ],
            'candidate' => $schedule->candidate ? [
                'id' => $schedule->candidate->id,
                'name' => $schedule->candidate->name,
                'email' => $schedule->candidate->email,
            ] : null,
            'scheduledAt' => $schedule->scheduled_at->toIso8601String(),
            'scheduleId' => $schedule->id,
            'token' => $token,
            'type' => 'scheduled',
        ]);
    }

    /**
     * Start a public interview session.
     */
    public function startSession(Request $request, string $token)
    {
        // Try to find by interview token first
        $interview = Interview::where('public_token', $token)
            ->where('public_link_enabled', true)
            ->where('status', 'active')
            ->first();

        $candidateId = null;
        $scheduleId = null;

        if (!$interview) {
            // Try scheduled interview token
            $schedule = ScheduledInterview::where('public_token', $token)
                ->with('interview')
                ->first();

            if (!$schedule || $schedule->status !== 'scheduled') {
                return response()->json(['error' => 'Invalid or expired link'], 404);
            }

            $interview = $schedule->interview;
            $candidateId = $schedule->candidate_id;
            $scheduleId = $schedule->id;
        } else {
            // Generic Interview Link - Check for candidate info
            if ($request->has('email')) {
                // Check self preview
                $isSelfPreview = Auth::check() && Auth::id() === $interview->user_id;

                if (!$isSelfPreview) {
                    $request->validate([
                        'name' => 'required|string|max:255',
                        'email' => 'required|email|max:255',
                        'phone' => 'nullable|string|max:50',
                    ]);

                    // Find existing candidate
                    $candidate = \App\Models\Candidate::where('email', $request->email)
                        ->where('user_id', $interview->user_id)
                        ->first();

                    if ($candidate) {
                        // Update existing candidate
                        $updateData = ['name' => $request->name];
                        if ($request->filled('phone')) {
                            $updateData['phone'] = $request->phone;
                        }
                        $candidate->update($updateData);
                    } else {
                        // Create new candidate
                        $candidate = \App\Models\Candidate::create([
                            'email' => $request->email,
                            'user_id' => $interview->user_id,
                            'name' => $request->name,
                            'phone' => $request->phone,
                        ]);
                    }

                    $candidateId = $candidate->id;
                }
            }
        }

        // Check if current user is the interview owner (self-preview)
        $isSelfPreview = Auth::check() && Auth::id() === $interview->user_id;

        // Create a new session
        $session = $interview->sessions()->create([
            'candidate_id' => $candidateId,
            'status' => 'active',
            'channel' => 'web',
            'metadata' => [
                'job_title' => $interview->job_title,
                'company_name' => $interview->company_name,
                'source' => $isSelfPreview ? 'self_preview' : 'public_link',
                'is_self_preview' => $isSelfPreview,
                'public_token' => $token,
                'started_at' => now()->toIso8601String(),
            ],
        ]);

        // Update interview tracking
        $interview->recordSession();

        // Update schedule status if this was a scheduled interview
        if ($scheduleId) {
            ScheduledInterview::where('id', $scheduleId)->update(['status' => 'in_progress']);
        }

        return response()->json([
            'success' => true,
            'session' => [
                'id' => $session->id,
            ],
            'interview' => [
                'id' => $interview->id,
                'job_title' => $interview->job_title,
                'company_name' => $interview->company_name,
                'job_description' => $interview->job_description,
                'duration_minutes' => $interview->duration_minutes,
                'interview_type' => $interview->interview_type,
            ],
        ]);
    }
}
