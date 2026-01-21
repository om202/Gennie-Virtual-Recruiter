<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Web\VoiceClientController;
use App\Http\Controllers\Auth\GoogleAuthController;

Route::get('/', [VoiceClientController::class, 'landing']);
Route::get('/gennie', [VoiceClientController::class, 'index']);
Route::get('/gennie/token', [VoiceClientController::class, 'getToken']);

// Google OAuth routes
Route::get('/auth/google', [GoogleAuthController::class, 'redirect'])->name('auth.google');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);
Route::post('/logout', [GoogleAuthController::class, 'logout'])->name('logout');
