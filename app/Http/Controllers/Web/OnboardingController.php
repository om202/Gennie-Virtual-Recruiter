<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;

class OnboardingController extends Controller
{
    /**
     * Show the onboarding form
     */
    public function show(): Response|RedirectResponse
    {
        $user = Auth::user();

        // If user is already onboarded, redirect to dashboard
        if ($user->is_onboarded) {
            return redirect()->intended('/dashboard');
        }

        return Inertia::render('Onboarding', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
            ]
        ]);
    }

    /**
     * Save onboarding details
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'phone' => 'required|string|max:20',
            'company_name' => 'required|string|max:255',
        ]);

        $user = Auth::user();

        $user->update([
            'phone' => $validated['phone'],
            'company_name' => $validated['company_name'],
            'is_onboarded' => true,
        ]);

        return redirect('/dashboard');
    }
}
