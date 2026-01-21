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
        return Inertia::render('Dashboard', [
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }
}
