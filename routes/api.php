<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AgentToolController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Tool Endpoint called by Deepgram
Route::post('/agent/context', [AgentToolController::class, 'getContext']);
