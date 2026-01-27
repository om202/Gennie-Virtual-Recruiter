<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class DocsController extends Controller
{
    public function index()
    {
        return Inertia::render('Docs/Index');
    }

    public function gettingStarted()
    {
        return Inertia::render('Docs/GettingStarted');
    }

    public function faq()
    {
        return Inertia::render('Docs/FAQ');
    }

    public function jobs()
    {
        return Inertia::render('Docs/Jobs');
    }

    public function interviews()
    {
        return Inertia::render('Docs/Interviews');
    }

    public function candidates()
    {
        return Inertia::render('Docs/Candidates');
    }

    public function candidateExperience()
    {
        return Inertia::render('Docs/CandidateExperience');
    }

    public function analytics()
    {
        return Inertia::render('Docs/Analytics');
    }

    public function settings()
    {
        return Inertia::render('Docs/Settings');
    }

    public function dashboard()
    {
        return Inertia::render('Docs/DashboardDoc');
    }

    public function scheduling()
    {
        return Inertia::render('Docs/Scheduling');
    }

    public function publicPages()
    {
        return Inertia::render('Docs/PublicPages');
    }

    public function emails()
    {
        return Inertia::render('Docs/Emails');
    }

    public function aiFeatures()
    {
        return Inertia::render('Docs/AIFeatures');
    }
}
