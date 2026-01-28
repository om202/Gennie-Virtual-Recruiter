<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AgentToolController;
use App\Http\Controllers\Api\InterviewSessionController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:web');

// Tool Endpoint called by Deepgram
Route::post('/agent/context', [AgentToolController::class, 'getContext']);
Route::post('/agent/recall', [AgentToolController::class, 'recallMemory']);


// Document Parsing
Route::post('/documents/parse', [\App\Http\Controllers\Api\DocumentController::class, 'parse']);

// =============================================================================
// PUBLIC INTERVIEW ROUTES (used by candidates during public/scheduled interviews)
// These must be accessible without auth since candidates are not logged in
// =============================================================================
Route::post('/sessions/{id}/log', [InterviewSessionController::class, 'logInteraction']);
Route::post('/sessions/{id}/progress', [InterviewSessionController::class, 'updateProgress']);
Route::post('/sessions/{id}/end', [InterviewSessionController::class, 'end']);
Route::get('/sessions/{id}/context', [InterviewSessionController::class, 'getContext']);
Route::post('/sessions/{id}/plan', [InterviewSessionController::class, 'savePlan']);
Route::post('/sessions/{id}/upload-recording', [InterviewSessionController::class, 'uploadRecording']);
Route::get('/sessions/{id}/recording', [InterviewSessionController::class, 'getRecording']);
Route::get('/sessions/{id}/analysis-stream', [\App\Http\Controllers\Api\AnalysisStreamController::class, 'stream']);

// =============================================================================
// DASHBOARD ROUTES - Read operations (no middleware needed since pages are auth protected)
// =============================================================================
Route::get('/sessions/{id}', [InterviewSessionController::class, 'show']);
Route::get('/sessions/{id}/logs', [InterviewSessionController::class, 'getLogs']);

// =============================================================================
// DASHBOARD ROUTES - Analysis (pages are auth protected, API calls from those pages)
// =============================================================================
Route::post('/sessions/{id}/analyze', [InterviewSessionController::class, 'analyze']);
Route::post('/sessions/{id}/reset-analysis', [InterviewSessionController::class, 'resetAnalysis']);
Route::delete('/sessions/{id}', [InterviewSessionController::class, 'deleteSession']);

// =============================================================================
// DASHBOARD ROUTES - Session management (pages are auth protected via Inertia)
// =============================================================================
Route::post('/sessions', [InterviewSessionController::class, 'store']);
Route::post('/sessions/{id}/jd', [InterviewSessionController::class, 'updateJobDescription']);
Route::post('/sessions/{id}/resume', [InterviewSessionController::class, 'updateResume']);
Route::post('/sessions/{id}/start', [InterviewSessionController::class, 'start']);

// =============================================================================
// TWILIO ROUTES (external callbacks - no auth, validated by Twilio signature)
// =============================================================================
Route::post('/twilio/call', [\App\Http\Controllers\Api\TwilioController::class, 'startCall']);
Route::post('/twilio/voice', [\App\Http\Controllers\Api\TwilioController::class, 'voiceHook']);
Route::post('/twilio/call-status', [\App\Http\Controllers\Api\TwilioController::class, 'callStatus']);
Route::post('/twilio/recording-status', [\App\Http\Controllers\Api\TwilioController::class, 'recordingStatus']);

// =============================================================================
// JOB APPLICATIONS (pages are auth protected via Inertia)
// =============================================================================
Route::patch('/applications/{application}/status', function (Request $request, \App\Models\JobApplication $application) {
    $request->validate([
        'status' => 'required|in:applied,under_review,shortlisted,rejected',
    ]);

    $application->update(['status' => $request->status]);

    return response()->json([
        'success' => true,
        'status_label' => $application->status_label,
        'status_color' => $application->status_color,
    ]);
});
