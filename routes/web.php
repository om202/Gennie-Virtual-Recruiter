<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Web\VoiceClientController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Web\OnboardingController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\InterviewController;
use Inertia\Inertia;

Route::get('/', [VoiceClientController::class, 'landing']);

// Public Try Gennie Demo (no login required)
Route::get('/try-gennie', fn() => Inertia::render('TryGennie'))->name('try-gennie');

// Guest Routes (redirect to dashboard if already authenticated)
Route::middleware(['guest'])->group(function () {
    Route::get('/login', fn() => redirect()->route('auth.google'))->name('login');
    Route::get('/auth/google', [GoogleAuthController::class, 'redirect'])->name('auth.google');
});

// OAuth callback (must be accessible always)
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);
Route::post('/logout', [GoogleAuthController::class, 'logout'])->name('logout');

// Gennie API endpoint for voice client (needs to be accessible for demo too)
Route::get('/gennie/token', [VoiceClientController::class, 'getToken']);

// Protected Routes
Route::middleware(['auth'])->group(function () {
    Route::get('/onboarding', [OnboardingController::class, 'show'])->name('onboarding.show');
    Route::post('/onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/profile', fn() => Inertia::render('Profile', ['auth' => ['user' => Auth::user()]]))->name('profile');

    // Interview Management
    Route::get('/interviews', [InterviewController::class, 'index'])->name('interviews.index');
    Route::post('/interviews', [InterviewController::class, 'store'])->name('interviews.store');
    Route::get('/interviews/{interview}', [InterviewController::class, 'show'])->name('interviews.show');
    Route::put('/interviews/{interview}', [InterviewController::class, 'update'])->name('interviews.update');
    Route::delete('/interviews/{interview}', [InterviewController::class, 'destroy'])->name('interviews.destroy');
    Route::get('/interviews/{interview}/start', [InterviewController::class, 'startSession'])->name('interviews.start');
});