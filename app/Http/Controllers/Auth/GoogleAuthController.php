<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Http\RedirectResponse;
use Inertia\Response;

class GoogleAuthController extends Controller
{
    /**
     * Redirect to Google OAuth page
     */
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle Google OAuth callback
     */
    public function callback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            // Check if this is a new user
            $existingUser = User::where('email', $googleUser->email)->first();
            $isNewUser = !$existingUser;

            // Find or create user
            $user = User::updateOrCreate(
                ['email' => $googleUser->email],
                [
                    'name' => $googleUser->name,
                    'google_id' => $googleUser->id,
                    'avatar' => $googleUser->avatar,
                ]
            );

            // Assign free trial to new users
            if ($isNewUser) {
                $freeTrial = \App\Models\SubscriptionPlan::where('slug', 'free_trial')->first();
                if ($freeTrial) {
                    $now = now();
                    $user->update([
                        'subscription_plan_id' => $freeTrial->id,
                        'subscription_started_at' => $now,
                        'period_started_at' => $now,
                        'minutes_used_this_period' => 0,
                    ]);
                }
            }

            // Log the user in
            Auth::login($user, true);

            // Redirect based on onboarding status
            if ($user->is_onboarded) {
                return redirect()->intended('/dashboard');
            }

            return redirect('/onboarding');

        } catch (\Exception $e) {
            return redirect('/')->with('error', 'Failed to authenticate with Google');
        }
    }

    /**
     * Logout user
     */
    public function logout(): RedirectResponse
    {
        Auth::logout();
        return redirect('/');
    }
}
