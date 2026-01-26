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
            ->with('jobDescription')
            ->first();

        if (!$interview) {
            abort(404, 'Interview not found or no longer available.');
        }

        // Check if current user is the interview owner (self-preview)
        $isSelfPreview = Auth::check() && Auth::id() === $interview->user_id;

        // Get job description from linked JD or legacy field
        $jobDescription = null;
        if ($interview->jobDescription && $interview->jobDescription->description) {
            $jobDescription = $interview->jobDescription->description;
        } elseif ($interview->job_description) {
            $jobDescription = $interview->job_description;
        }

        return Inertia::render('PublicInterview', [
            'interview' => [
                'id' => $interview->id,
                'job_title' => $interview->job_title,
                'company_name' => $interview->company_name,
                'duration_minutes' => $interview->duration_minutes,
                'interview_type' => $interview->interview_type,
                'difficulty_level' => $interview->difficulty_level,
                'candidate_instructions' => $interview->candidate_instructions,
                'job_description' => $jobDescription,
                'required_questions' => $interview->required_questions ?? [],
            ],
            'token' => $token,
            'type' => 'interview',
            'isSelfPreview' => $isSelfPreview,
        ]);
    }

    public function showScheduledInterview(string $company, string $job, string $token)
    {
        $schedule = ScheduledInterview::where('public_token', $token)
            ->with(['interview.jobDescription', 'candidate:id,name,email'])
            ->first();

        if (!$schedule) {
            abort(404, 'Scheduled interview not found.');
        }

        $accessStatus = $schedule->getAccessStatus();
        $interview = $schedule->interview;

        // For non-accessible states, return limited info
        if (!in_array($accessStatus, ['accessible', 'in_progress'])) {
            return Inertia::render('PublicInterview', [
                'accessStatus' => $accessStatus,
                'scheduledAt' => $schedule->scheduled_at->toIso8601String(),
                'windowOpensAt' => $schedule->getWindowOpensAt()?->toIso8601String(),
                'candidateName' => $schedule->candidate?->name,
                'interviewTitle' => $interview->job_title,
                'companyName' => $interview->company_name,
                'durationMinutes' => $interview->duration_minutes,
                'type' => 'scheduled',
            ]);
        }

        // Get job description from linked JD or legacy field
        $jobDescription = null;
        if ($interview->jobDescription && $interview->jobDescription->description) {
            $jobDescription = $interview->jobDescription->description;
        } elseif ($interview->job_description) {
            $jobDescription = $interview->job_description;
        }

        return Inertia::render('PublicInterview', [
            'interview' => [
                'id' => $interview->id,
                'job_title' => $interview->job_title,
                'company_name' => $interview->company_name,
                'duration_minutes' => $interview->duration_minutes,
                'interview_type' => $interview->interview_type,
                'difficulty_level' => $interview->difficulty_level,
                'job_description' => $jobDescription,
                'required_questions' => $interview->required_questions ?? [],
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
            'accessStatus' => $accessStatus,
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
                'required_questions' => $interview->required_questions ?? [],
            ],
        ]);
    }

    // =========================================================================
    // OTP Verification Methods
    // =========================================================================

    /**
     * Request OTP for scheduled interview access.
     */
    public function requestOtp(string $token)
    {
        $schedule = ScheduledInterview::where('public_token', $token)
            ->with(['candidate', 'interview'])
            ->first();

        if (!$schedule) {
            return response()->json(['success' => false, 'error' => 'Interview not found.'], 404);
        }

        // Check if within access window
        $accessStatus = $schedule->getAccessStatus();
        if (!in_array($accessStatus, ['accessible', 'in_progress'])) {
            return response()->json(['success' => false, 'error' => 'Interview is not currently accessible.'], 403);
        }

        // Generate OTP and send email
        $otp = $schedule->generateOtp();

        try {
            app(\App\Services\Email\EmailService::class)->sendInterviewOtp($schedule, $otp);
        } catch (\Exception $e) {
            \Log::error('Failed to send OTP email', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'error' => 'Failed to send access code. Please try again.'], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Access code sent to your email.',
            'email' => $this->maskEmail($schedule->candidate->email),
        ]);
    }

    /**
     * Verify OTP for scheduled interview access.
     */
    public function verifyOtp(Request $request, string $token)
    {
        $schedule = ScheduledInterview::where('public_token', $token)->first();

        if (!$schedule) {
            return response()->json(['success' => false, 'error' => 'Interview not found.'], 404);
        }

        $code = $request->input('code');
        if (!$code || strlen($code) !== 6) {
            return response()->json(['success' => false, 'error' => 'Please enter a valid 6-digit code.'], 422);
        }

        $result = $schedule->verifyOtp($code);

        return response()->json($result, $result['success'] ? 200 : 422);
    }

    /**
     * Mask email for privacy (e.g., j***@example.com)
     */
    private function maskEmail(string $email): string
    {
        $parts = explode('@', $email);
        if (count($parts) !== 2)
            return '***@***.***';

        $local = $parts[0];
        $domain = $parts[1];

        $maskedLocal = strlen($local) > 2
            ? substr($local, 0, 1) . str_repeat('*', strlen($local) - 1)
            : $local[0] . '*';

        return $maskedLocal . '@' . $domain;
    }
}

