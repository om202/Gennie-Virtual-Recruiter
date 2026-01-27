<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Web\VoiceClientController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Web\OnboardingController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\DocsController;
use App\Http\Controllers\InterviewController;
use App\Http\Controllers\CandidateController;
use App\Http\Controllers\JobDescriptionController;
use App\Http\Controllers\PublicInterviewController;
use App\Http\Controllers\ProfileController;
use Inertia\Inertia;

Route::get('/', [VoiceClientController::class, 'landing']);

// Public Try Gennie Demo - redirect to demo interview
Route::get('/try-gennie', fn() => redirect('/i/acme-inc/senior-react-developer/uuSTjzPMSZsncAKQyiJyWsEbpptDLrmm'))->name('try-gennie');

// Public Interview Access (Magic Links - no login required)
Route::get('/i/{company}/{job}/{token}', [PublicInterviewController::class, 'showInterview'])->name('public.interview');
Route::get('/s/{company}/{job}/{token}', [PublicInterviewController::class, 'showScheduledInterview'])->name('public.scheduled');
Route::post('/public/start/{token}', [PublicInterviewController::class, 'startSession'])->name('public.start');

// OTP verification for scheduled interviews
Route::post('/s/otp/request/{token}', [PublicInterviewController::class, 'requestOtp'])->name('public.otp.request');
Route::post('/s/otp/verify/{token}', [PublicInterviewController::class, 'verifyOtp'])->name('public.otp.verify');

// Public Job Application (no auth required)
Route::get('/apply/{company}/{job}/{token}', [\App\Http\Controllers\PublicJobController::class, 'show'])->name('public.job.show');
Route::post('/apply/{token}', [\App\Http\Controllers\PublicJobController::class, 'apply'])->name('public.job.apply');
Route::post('/apply/parse-resume', [\App\Http\Controllers\PublicJobController::class, 'parseResume'])->name('public.job.parse');

// Public Careers Page (no auth required)
Route::get('/careers/{token}', [\App\Http\Controllers\PublicCareersController::class, 'show'])->name('public.careers');

// Public Self-Scheduling (no auth required)
Route::get('/schedule/{company}/{job}/{token}', [\App\Http\Controllers\PublicScheduleController::class, 'show'])->name('public.schedule.show');
Route::post('/schedule/{token}', [\App\Http\Controllers\PublicScheduleController::class, 'store'])->name('public.schedule.store');

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

    // Documentation
    Route::get('/docs', [DocsController::class, 'index'])->name('docs.index');
    Route::get('/docs/getting-started', [DocsController::class, 'gettingStarted'])->name('docs.getting-started');
    Route::get('/docs/jobs', [DocsController::class, 'jobs'])->name('docs.jobs');
    Route::get('/docs/interviews', [DocsController::class, 'interviews'])->name('docs.interviews');
    Route::get('/docs/candidates', [DocsController::class, 'candidates'])->name('docs.candidates');
    Route::get('/docs/candidate-experience', [DocsController::class, 'candidateExperience'])->name('docs.candidate-experience');
    Route::get('/docs/analytics', [DocsController::class, 'analytics'])->name('docs.analytics');
    Route::get('/docs/settings', [DocsController::class, 'settings'])->name('docs.settings');
    Route::get('/docs/faq', [DocsController::class, 'faq'])->name('docs.faq');

    // Profile Settings
    Route::get('/profile', [ProfileController::class, 'index'])->name('profile');
    Route::put('/profile/account', [ProfileController::class, 'updateAccount'])->name('profile.account');
    Route::put('/profile/company', [ProfileController::class, 'updateCompany'])->name('profile.company');
    Route::post('/profile/logo', [ProfileController::class, 'uploadLogo'])->name('profile.logo');
    Route::put('/profile/interview-preferences', [ProfileController::class, 'updateInterviewPreferences'])->name('profile.interview-preferences');
    Route::put('/profile/notifications', [ProfileController::class, 'updateNotifications'])->name('profile.notifications');
    Route::put('/profile/branding', [ProfileController::class, 'updateBranding'])->name('profile.branding');

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
    Route::get('/applications', [JobDescriptionController::class, 'allApplications'])->name('applications.index');
    Route::get('/job-descriptions', [JobDescriptionController::class, 'index'])->name('job-descriptions.index');
    Route::get('/job-descriptions/create', [JobDescriptionController::class, 'create'])->name('job-descriptions.create');
    Route::post('/job-descriptions', [JobDescriptionController::class, 'store'])->name('job-descriptions.store');
    Route::post('/job-descriptions/parse', [JobDescriptionController::class, 'parseJobDescription'])->name('job-descriptions.parse');
    Route::get('/job-descriptions/list', [JobDescriptionController::class, 'list'])->name('job-descriptions.list');
    Route::get('/job-descriptions/{jobDescription}/edit', [JobDescriptionController::class, 'edit'])->name('job-descriptions.edit');
    Route::put('/job-descriptions/{jobDescription}', [JobDescriptionController::class, 'update'])->name('job-descriptions.update');
    Route::delete('/job-descriptions/{jobDescription}', [JobDescriptionController::class, 'destroy'])->name('job-descriptions.destroy');
    Route::post('/job-descriptions/{jobDescription}/enable-public-link', [JobDescriptionController::class, 'enablePublicLink'])->name('job-descriptions.enable-public-link');
    Route::post('/job-descriptions/{jobDescription}/toggle-public', [JobDescriptionController::class, 'togglePublic'])->name('job-descriptions.toggle-public');
    Route::get('/job-descriptions/{jobDescription}/applications', [JobDescriptionController::class, 'applications'])->name('job-descriptions.applications');

    // Careers Page Management
    Route::post('/careers/enable', [\App\Http\Controllers\PublicCareersController::class, 'enable'])->name('careers.enable');
    Route::post('/careers/disable', [\App\Http\Controllers\PublicCareersController::class, 'disable'])->name('careers.disable');

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