<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Web\VoiceClientController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Web\OnboardingController;
use App\Http\Controllers\Web\DashboardController;

Route::get('/', [VoiceClientController::class, 'landing']);

// Auth Routes
Route::get('/auth/google', [GoogleAuthController::class, 'redirect'])->name('auth.google');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);
Route::post('/logout', [GoogleAuthController::class, 'logout'])->name('logout');

// Protected Routes
Route::middleware(['auth'])->group(function () {
    Route::get('/onboarding', [OnboardingController::class, 'show'])->name('onboarding.show');
    Route::post('/onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Gennie Route - Now protected
    Route::get('/gennie', [VoiceClientController::class, 'index'])->name('gennie');
    Route::get('/gennie/token', [VoiceClientController::class, 'getToken']);
});