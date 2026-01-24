<?php

namespace App\Http\Controllers;

use App\Models\Interview;
use App\Models\ScheduledInterview;
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

        return Inertia::render('Schedules/Index', [
            'activeTab' => 'schedules',
            'scheduledInterviews' => \App\Models\ScheduledInterview::whereHas('interview', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
                ->with(['interview:id,job_title,company_name', 'candidate:id,name,email'])
                ->where('scheduled_at', '>=', now())
                ->orderBy('scheduled_at', 'asc')
                ->get(),
            'candidates' => $user->candidates()
                ->select('id', 'name', 'email')
                ->orderBy('name')
                ->get(),
            'interviews' => $user->interviews()
                ->select('id', 'job_title')
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

        return Inertia::render('ScheduleInterview', [
            'candidates' => $user->candidates()
                ->select('id', 'name', 'email')
                ->orderBy('name')
                ->get(),
            'interviews' => $user->interviews()
                ->select('id', 'job_title')
                ->where('status', 'active')
                ->orderBy('updated_at', 'desc')
                ->get(),
            'interview' => $interviewId
                ? Interview::where('id', $interviewId)
                    ->where('user_id', $user->id)
                    ->select('id', 'job_title')
                    ->first()
                : null,
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

        // TODO: Send email notification

        return redirect()->back()->with('success', 'Interview scheduled successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ScheduledInterview $scheduledInterview)
    {
        $scheduledInterview->delete();

        return redirect()->back()->with('success', 'Scheduled interview cancelled.');
    }
}
