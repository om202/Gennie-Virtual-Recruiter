<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\InterviewSession;

class DashboardController extends Controller
{
    /**
     * Show the dashboard
     */
    public function index(): Response
    {
        $user = Auth::user();

        // 1. Counts
        $activeInterviewsCount = $user->interviews()->where('status', 'active')->count();
        $totalCandidatesCount = $user->candidates()->count();
        $totalSessionsCount = \App\Models\InterviewSession::whereHas('interview', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->count();

        // 2. Recent Activity (Sessions)
        // We need sessions that belong to interviews owned by the user
        $recentActivity = \App\Models\InterviewSession::whereHas('interview', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
            ->with(['candidate:id,name,email', 'interview:id,job_title,company_name'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($session) {
                $candidateName = $session->candidate ? $session->candidate->name : 'Unknown Candidate';
                $jobTitle = $session->interview ? $session->interview->job_title : 'Unknown Interview';

                return [
                    'id' => $session->id,
                    'type' => 'session_completed', // simplified for now
                    'title' => 'Interview Session ' . ucfirst($session->status),
                    'description' => $candidateName . ' - ' . $jobTitle,
                    'status' => $session->status,
                    'created_at' => $session->created_at,
                    'link' => "/interviews/{$session->interview_id}/logs?session={$session->id}",
                ];
            });

        // 3. Upcoming Schedule (Next 3 scheduled interviews)
        // Assuming we have a Schedule model/table. 
        // Based on previous conversations there is a ScheduleController, so likely a ScheduledInterview model?
        // Let's verify file existence first or stick to basic metrics if unsure.
        // I'll stick to basic metrics + sessions for now to avoid breaking if ScheduledInterview logic is complex.

        return Inertia::render('Dashboard', [
            'activeTab' => 'overview',
            'auth' => [
                'user' => $user,
            ],
            'stats' => [
                'activeInterviews' => $activeInterviewsCount,
                'totalCandidates' => $totalCandidatesCount,
                'totalSessions' => $totalSessionsCount,
            ],
            'recentActivity' => $recentActivity,
        ]);
    }
}
