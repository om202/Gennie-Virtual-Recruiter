<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Web\VoiceClientController;

Route::get('/', function () {
    return redirect('/gennie');
});

Route::get('/gennie', [VoiceClientController::class, 'index']);
Route::get('/gennie/token', [VoiceClientController::class, 'getToken']);
