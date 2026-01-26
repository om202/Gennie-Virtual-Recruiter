<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use App\Models\Interview;
use App\Models\JobDescription;
use App\Models\ScheduledInterview;
use App\Services\Email\EmailService;
use App\Services\SMS\SmsService;
use App\Services\Scheduling\SchedulingService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicScheduleController extends Controller
{
    /**
     * Show public scheduling page for a candidate.
     * Token is the candidate's scheduling_token.
     */
    public function show(string $company, string $job, string $token)
    {
        $candidate = Candidate::where('scheduling_token', $token)->first();

        if (!$candidate) {
            abort(404, 'Invalid scheduling link.');
        }

        // Get the most recent job application for this candidate
        $application = $candidate->jobApplications()
            ->with(['jobDescription.defaultInterview', 'jobDescription.user'])
            ->latest('applied_at')
            ->first();

        if (!$application || !$application->jobDescription) {
            abort(404, 'Application not found.');
        }

        $jobDescription = $application->jobDescription;

        // Check if self-scheduling is enabled
        if (!$jobDescription->canSelfSchedule()) {
            return Inertia::render('PublicSchedule', [
                'error' => 'Self-scheduling is not available for this position.',
            ]);
        }

        // Get existing scheduled interview if any
        $existingSchedule = ScheduledInterview::where('candidate_id', $candidate->id)
            ->where('interview_id', $jobDescription->default_interview_id)
            ->whereIn('status', ['scheduled', 'in_progress'])
            ->first();

        $scheduler = app(SchedulingService::class);
        $timezones = $scheduler->getTimezones();

        return Inertia::render('PublicSchedule', [
            'candidate' => [
                'id' => $candidate->id,
                'name' => $candidate->name,
                'email' => $candidate->email,
            ],
            'job' => [
                'title' => $jobDescription->title,
                'company_name' => $jobDescription->company_name,
                'location' => $jobDescription->location,
            ],
            'interview' => [
                'id' => $jobDescription->defaultInterview->id,
                'duration_minutes' => $jobDescription->defaultInterview->duration_minutes,
                'interview_type' => $jobDescription->defaultInterview->interview_type,
            ],
            'existingSchedule' => $existingSchedule ? [
                'id' => $existingSchedule->id,
                'scheduled_at' => $existingSchedule->scheduled_at->toISOString(),
                'status' => $existingSchedule->status,
            ] : null,
            'token' => $token,
            'timezones' => $timezones,
            'recruiterTimezone' => $jobDescription->user->timezone ?? 'America/New_York',
        ]);
    }

    /**
     * Store a new scheduled interview from public scheduling.
     */
    public function store(Request $request, string $token)
    {
        $candidate = Candidate::where('scheduling_token', $token)->first();

        if (!$candidate) {
            return response()->json(['error' => 'Invalid scheduling link.'], 404);
        }

        $request->validate([
            'scheduled_at' => 'required|date|after:now',
        ]);

        // Get the most recent job application
        $application = $candidate->jobApplications()
            ->with(['jobDescription.defaultInterview'])
            ->latest('applied_at')
            ->first();

        if (!$application || !$application->jobDescription?->canSelfSchedule()) {
            return response()->json(['error' => 'Self-scheduling is not available.'], 422);
        }

        $jobDescription = $application->jobDescription;
        $interview = $jobDescription->defaultInterview;

        // Check for existing scheduled interview
        $existingSchedule = ScheduledInterview::where('candidate_id', $candidate->id)
            ->where('interview_id', $interview->id)
            ->whereIn('status', ['scheduled', 'in_progress'])
            ->first();

        if ($existingSchedule) {
            // Update existing schedule
            $existingSchedule->update([
                'scheduled_at' => $request->scheduled_at,
            ]);
            $schedule = $existingSchedule;

            // Send reschedule notification
            app(EmailService::class)->sendInterviewRescheduled($schedule);
            app(SmsService::class)->sendInterviewRescheduled($schedule);
        } else {
            // Create new scheduled interview
            $schedule = ScheduledInterview::create([
                'interview_id' => $interview->id,
                'candidate_id' => $candidate->id,
                'scheduled_at' => $request->scheduled_at,
                'status' => 'scheduled',
            ]);

            // Send scheduled notification
            app(EmailService::class)->sendInterviewScheduled($schedule);
            app(SmsService::class)->sendInterviewScheduled($schedule);
        }

        return response()->json([
            'success' => true,
            'message' => 'Interview scheduled successfully! Check your email for confirmation.',
            'schedule' => [
                'id' => $schedule->id,
                'scheduled_at' => $schedule->scheduled_at->toISOString(),
            ],
        ]);
    }
}
