<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AgentToolController;
use App\Http\Controllers\Api\InterviewSessionController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Tool Endpoint called by Deepgram
Route::post('/agent/context', [AgentToolController::class, 'getContext']);

// Document Parsing
Route::post('/documents/parse', [\App\Http\Controllers\Api\DocumentController::class, 'parse']);

// Interview Session Routes
Route::post('/sessions', [InterviewSessionController::class, 'store']);
Route::get('/sessions/{id}', [InterviewSessionController::class, 'show']);
Route::post('/sessions/{id}/jd', [InterviewSessionController::class, 'updateJobDescription']);
Route::post('/sessions/{id}/resume', [InterviewSessionController::class, 'updateResume']);
Route::post('/sessions/{id}/start', [InterviewSessionController::class, 'start']);
Route::get('/sessions/{id}/context', [InterviewSessionController::class, 'getContext']);
Route::post('/sessions/{id}/progress', [InterviewSessionController::class, 'updateProgress']);
Route::post('/sessions/{id}/log', [InterviewSessionController::class, 'logInteraction']);
Route::get('/sessions/{id}/logs', [InterviewSessionController::class, 'getLogs']);
Route::post('/sessions/{id}/analyze', [InterviewSessionController::class, 'analyze']);
Route::post('/sessions/{id}/end', [InterviewSessionController::class, 'end']);

// Twilio Routes
Route::post('/twilio/call', [\App\Http\Controllers\Api\TwilioController::class, 'startCall']);
Route::post('/twilio/voice', [\App\Http\Controllers\Api\TwilioController::class, 'voiceHook']);

