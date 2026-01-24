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
