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
}
