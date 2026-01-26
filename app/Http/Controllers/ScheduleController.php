<?php

namespace App\Http\Controllers;

use App\Models\Interview;
use App\Models\ScheduledInterview;
use App\Services\Email\EmailService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ScheduleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();

        $schedules = \App\Models\ScheduledInterview::whereHas('interview', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
            ->with(['interview:id,job_title,company_name', 'candidate:id,name,email'])
            ->where('scheduled_at', '>=', now())
            ->orderBy('scheduled_at', 'asc')
            ->get()
            ->map(function ($schedule) {
                $schedule->public_url = $schedule->getPublicUrl();
                return $schedule;
            });

        return Inertia::render('Schedules/Index', [
            'activeTab' => 'schedules',
            'scheduledInterviews' => $schedules,
            'userTimezone' => $user->timezone ?? 'America/New_York',
            'candidates' => $user->candidates()
                ->select('id', 'name', 'email')
                ->orderBy('name')
                ->get(),
            'interviews' => $user->interviews()
                ->select('id', 'job_title', 'interview_type', 'company_name')
                ->orderBy('updated_at', 'desc')
                ->get(),
        ]);
    }


    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $user = auth()->user();
        $interviewId = $request->query('interview_id');
        $scheduler = app(\App\Services\Scheduling\SchedulingService::class);
        $timezones = $scheduler->getTimezones();

        return Inertia::render('ScheduleInterview', [
            'candidates' => $user->candidates()
                ->select('id', 'name', 'email')
                ->orderBy('name')
                ->get(),
            'interviews' => $user->interviews()
                ->select('id', 'job_title', 'interview_type', 'company_name')
                ->where('status', 'active')
                ->orderBy('updated_at', 'desc')
                ->get(),
            'interview' => $interviewId
                ? Interview::where('id', $interviewId)
                    ->where('user_id', $user->id)
                    ->select('id', 'job_title')
                    ->first()
                : null,
            'userTimezone' => $user->timezone ?? 'America/New_York',
            'userTimezoneLabel' => $timezones[$user->timezone ?? 'America/New_York'] ?? 'Eastern Time',
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, ScheduledInterview $schedule)
    {
        $user = auth()->user();

        // Authorization check
        if ($schedule->interview->user_id !== $user->id) {
            abort(403);
        }

        $scheduler = app(\App\Services\Scheduling\SchedulingService::class);
        $timezones = $scheduler->getTimezones();

        return Inertia::render('ScheduleInterview', [
            'schedule' => $schedule->load(['interview:id,job_title', 'candidate:id,name,email']),
            'candidates' => $user->candidates()
                ->select('id', 'name', 'email')
                ->orderBy('name')
                ->get(),
            'interviews' => $user->interviews()
                ->select('id', 'job_title', 'interview_type', 'company_name')
                ->where('status', 'active')
                ->orderBy('updated_at', 'desc')
                ->get(),
            'userTimezone' => $user->timezone ?? 'America/New_York',
            'userTimezoneLabel' => $timezones[$user->timezone ?? 'America/New_York'] ?? 'Eastern Time',
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'interview_id' => 'required|exists:interviews,id',
            'candidate_id' => 'required|exists:candidates,id',
            'scheduled_at' => 'required|date|after:now',
        ]);

        $schedule = ScheduledInterview::create([
            'interview_id' => $validated['interview_id'],
            'candidate_id' => $validated['candidate_id'],
            'scheduled_at' => $validated['scheduled_at'],
            'status' => 'scheduled',
        ]);

        // Send email notification to candidate
        app(EmailService::class)->sendInterviewScheduled($schedule);

        return redirect()->back()->with('success', 'Interview scheduled successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ScheduledInterview $schedule)
    {
        // Authorization check
        if ($schedule->interview->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'interview_id' => 'required|exists:interviews,id',
            'candidate_id' => 'required|exists:candidates,id',
            'scheduled_at' => 'required|date|after:now',
        ]);

        $schedule->update([
            'interview_id' => $validated['interview_id'],
            'candidate_id' => $validated['candidate_id'],
            'scheduled_at' => $validated['scheduled_at'],
        ]);

        // Send reschedule notification to candidate
        app(EmailService::class)->sendInterviewRescheduled($schedule);

        return redirect()->route('schedules.index')->with('success', 'Interview schedule updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ScheduledInterview $scheduledInterview)
    {
        // Send cancellation notification before deleting
        app(EmailService::class)->sendInterviewCancelled($scheduledInterview);

        $scheduledInterview->delete();

        return redirect()->back()->with('success', 'Scheduled interview cancelled.');
    }
}
