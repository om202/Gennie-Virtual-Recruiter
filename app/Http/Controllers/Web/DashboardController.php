<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show the dashboard
     */
    public function index(): Response
    {
        $user = Auth::user();

        return Inertia::render('Dashboard', [
            'activeTab' => 'interviews',
            'auth' => [
                'user' => $user,
            ],
            'interviews' => $user->interviews()
                ->with('jobDescription:id,title,company_name,location,remote_type')
                ->orderBy('updated_at', 'desc')
                ->get(),
            'scheduledInterviews' => \App\Models\ScheduledInterview::whereHas('interview', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
                ->with(['interview:id,job_title', 'candidate:id,name,email'])
                ->where('scheduled_at', '>=', now())
                ->orderBy('scheduled_at', 'asc')
                ->get(),
            'candidates' => $user->candidates()
                ->select('id', 'name', 'email')
                ->orderBy('name')
                ->get(),
        ]);
    }
}
