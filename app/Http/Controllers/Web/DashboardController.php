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
            'candidates' => $user->candidates()
                ->select('id', 'name', 'email')
                ->orderBy('name')
                ->get(),
        ]);
    }
}
