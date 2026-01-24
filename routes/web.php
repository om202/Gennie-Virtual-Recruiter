<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Web\VoiceClientController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Web\OnboardingController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\InterviewController;
use App\Http\Controllers\CandidateController;
use App\Http\Controllers\JobDescriptionController;
use App\Http\Controllers\PublicInterviewController;
use Inertia\Inertia;

Route::get('/', [VoiceClientController::class, 'landing']);

// Public Try Gennie Demo (no login required)
Route::get('/try-gennie', fn() => Inertia::render('TryGennie'))->name('try-gennie');
Route::get('/try-gennie/{session}', fn($session) => Inertia::render('TryGennieResult', ['sessionId' => $session]))->name('try-gennie.result');

// Public Interview Access (Magic Links - no login required)
Route::get('/i/{company}/{job}/{token}', [PublicInterviewController::class, 'showInterview'])->name('public.interview');
Route::get('/s/{company}/{job}/{token}', [PublicInterviewController::class, 'showScheduledInterview'])->name('public.scheduled');
Route::post('/public/start/{token}', [PublicInterviewController::class, 'startSession'])->name('public.start');

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
    Route::get('/interviews/logs', [InterviewController::class, 'allLogs'])->name('interviews.all-logs');
    Route::get('/interviews/create', [InterviewController::class, 'create'])->name('interviews.create');
    Route::post('/interviews', [InterviewController::class, 'store'])->name('interviews.store');
    Route::get('/interviews/{interview}', [InterviewController::class, 'show'])->name('interviews.show');
    Route::get('/interviews/{interview}/edit', [InterviewController::class, 'edit'])->name('interviews.edit');
    Route::put('/interviews/{interview}', [InterviewController::class, 'update'])->name('interviews.update');
    Route::delete('/interviews/{interview}', [InterviewController::class, 'destroy'])->name('interviews.destroy');
    Route::get('/interviews/{interview}/logs', [InterviewController::class, 'logs'])->name('interviews.logs');
    Route::get('/interviews/{interview}/sessions', [InterviewController::class, 'getSessions'])->name('interviews.sessions');
    Route::post('/interviews/{interview}/enable-public-link', [InterviewController::class, 'enablePublicLink'])->name('interviews.enable-public-link');

    // Job Description Management
    Route::get('/job-descriptions', [JobDescriptionController::class, 'index'])->name('job-descriptions.index');
    Route::get('/job-descriptions/create', [JobDescriptionController::class, 'create'])->name('job-descriptions.create');
    Route::post('/job-descriptions', [JobDescriptionController::class, 'store'])->name('job-descriptions.store');
    Route::post('/job-descriptions/parse', [JobDescriptionController::class, 'parseJobDescription'])->name('job-descriptions.parse');
    Route::get('/job-descriptions/list', [JobDescriptionController::class, 'list'])->name('job-descriptions.list');
    Route::get('/job-descriptions/{jobDescription}/edit', [JobDescriptionController::class, 'edit'])->name('job-descriptions.edit');
    Route::put('/job-descriptions/{jobDescription}', [JobDescriptionController::class, 'update'])->name('job-descriptions.update');
    Route::delete('/job-descriptions/{jobDescription}', [JobDescriptionController::class, 'destroy'])->name('job-descriptions.destroy');

    // Candidate Management
    Route::post('/candidates/parse-resume', [CandidateController::class, 'parseResume'])->name('candidates.parse');
    Route::get('/candidates/{candidate}/resume', [CandidateController::class, 'downloadResume'])->name('candidates.download');
    Route::get('/candidates/{candidate}/sessions', [CandidateController::class, 'sessions'])->name('candidates.sessions');
    Route::resource('candidates', CandidateController::class);

    // Interview Scheduling
    Route::get('/schedules', [\App\Http\Controllers\ScheduleController::class, 'index'])->name('schedules.index');
    Route::get('/schedules/create', [\App\Http\Controllers\ScheduleController::class, 'create'])->name('schedules.create');
    Route::post('/schedules', [\App\Http\Controllers\ScheduleController::class, 'store'])->name('schedules.store');
    Route::get('/schedules/{schedule}/edit', [\App\Http\Controllers\ScheduleController::class, 'edit'])->name('schedules.edit');
    Route::put('/schedules/{schedule}', [\App\Http\Controllers\ScheduleController::class, 'update'])->name('schedules.update');
    Route::delete('/schedules/{scheduledInterview}', [\App\Http\Controllers\ScheduleController::class, 'destroy'])->name('schedules.destroy');
});