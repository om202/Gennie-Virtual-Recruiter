<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Web\VoiceClientController;

Route::get('/', [VoiceClientController::class, 'landing']);
Route::get('/gennie', [VoiceClientController::class, 'index']);
Route::get('/gennie/token', [VoiceClientController::class, 'getToken']);
