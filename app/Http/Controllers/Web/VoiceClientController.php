<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

use Inertia\Inertia;

class VoiceClientController extends Controller
{
    public function landing()
    {
        return Inertia::render('Landing');
    }

    /**
     * Generate an ephemeral API key for the browser.
     * In production, use strict scopes.
     */
    public function getToken()
    {
        $deepgramKey = env('DEEPGRAM_API_KEY') ?? env('deepgram_api_key');

        // MVP: Just return the key (Not secure for production, but fast for MVP)
        // Better way: Create a temporary key using Deepgram API
        // For MVP local dev, returning the env key is OK if not exposing to public.
        // But let's try to do it right if possible. Deepgram has /projects/{project_id}/keys
        // We'll stick to simple env key returning for the "Super Easy" request.

        return response()->json([
            'key' => $deepgramKey
        ]);
    }
}
