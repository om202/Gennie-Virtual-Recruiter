<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InterviewSession;
use Illuminate\Http\Request;
use Twilio\Rest\Client;
use Twilio\TwiML\VoiceResponse;

class TwilioController extends Controller
{
    /**
     * Initiate an outbound call via Twilio.
     * Requires a valid session_id to prevent abuse.
     */
    public function startCall(Request $request)
    {
        $to = $request->input('phone');
        $sessionId = $request->input('session_id');

        // Session ID is required to prevent abuse
        if (!$sessionId) {
            return response()->json(['error' => 'Session ID is required'], 400);
        }

        // Validate the session exists and is active
        $session = InterviewSession::find($sessionId);
        if (!$session) {
            return response()->json(['error' => 'Invalid session'], 404);
        }

        // Prevent duplicate calls to the same session
        if ($session->channel === 'phone' && !empty($session->call_sid)) {
            return response()->json(['error' => 'Call already initiated for this session'], 400);
        }

        // Validate phone number
        if (!$to || !preg_match('/^\+?[1-9]\d{6,14}$/', $to)) {
            return response()->json(['error' => 'Invalid phone number format'], 400);
        }

        $sid = env('TWILIO_ACCOUNT_SID');
        $token = env('TWILIO_ACCOUNT_AUTH_TOKEN');
        $from = env('TWILIO_FROM_NUMBER');
        $relayUrl = env('RELAY_SERVER_URL'); // Ngrok public URL

        if (!$sid || !$token || !$from) {
            return response()->json(['error' => 'Twilio credentials not configured'], 500);
        }

        try {
            $client = new Client($sid, $token);

            // Build TwiML URL with session ID
            $twimlUrl = $relayUrl . '/twilio/voice?session=' . urlencode($sessionId);

            // Create call with recording and status callbacks
            $call = $client->calls->create(
                $to,
                $from,
                [
                    'url' => $twimlUrl,
                    'method' => 'POST',
                    // Enable automatic call recording
                    'record' => true,
                    // Callback when call completes - use RELAY_SERVER_URL (ngrok) so Twilio can reach it
                    'statusCallback' => $relayUrl . '/api/twilio/call-status',
                    'statusCallbackEvent' => ['completed'],
                    'statusCallbackMethod' => 'POST',
                    // Callback when recording is ready - use RELAY_SERVER_URL (ngrok) so Twilio can reach it
                    'recordingStatusCallback' => $relayUrl . '/api/twilio/recording-status',
                    'recordingStatusCallbackEvent' => ['completed'],
                    'recordingStatusCallbackMethod' => 'POST',
                ]
            );

            // Update the session to mark it as a phone interview
            $session->update([
                'channel' => 'phone',
                'call_sid' => $call->sid,
                'twilio_data' => [
                    'status' => 'initiated',
                    'to' => $to,
                    'from' => $from,
                    'initiated_at' => now()->toIso8601String(),
                ],
            ]);

            return response()->json([
                'success' => true,
                'call_sid' => $call->sid,
                'message' => 'Call process initiated'
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Twilio callback when call status changes.
     * Called when call completes with duration and other metadata.
     */
    public function callStatus(Request $request)
    {
        $callSid = $request->input('CallSid');

        if (!$callSid) {
            return response('Missing CallSid', 400);
        }

        $session = InterviewSession::where('call_sid', $callSid)->first();

        if ($session) {
            $existingData = $session->twilio_data ?? [];
            $durationSeconds = (int) $request->input('CallDuration');

            $session->update([
                'twilio_data' => array_merge($existingData, [
                    'status' => $request->input('CallStatus'),
                    'duration' => $durationSeconds,
                    'direction' => $request->input('Direction'),
                    'from' => $request->input('From'),
                    'to' => $request->input('To'),
                    'start_time' => $request->input('StartTime'),
                    'end_time' => $request->input('EndTime'),
                    'answered_by' => $request->input('AnsweredBy'),
                ]),
                'duration_seconds' => $durationSeconds,
                'status' => 'completed',
            ]);

            // Record usage for billing
            if ($durationSeconds > 0) {
                try {
                    app(\App\Services\SubscriptionService::class)->recordUsage($session->fresh());
                } catch (\Exception $e) {
                    \Log::warning("Usage recording failed for session {$session->id}: " . $e->getMessage());
                }
            }

            \Log::info('Twilio call status received', [
                'call_sid' => $callSid,
                'status' => $request->input('CallStatus'),
                'duration' => $durationSeconds,
            ]);
        }

        return response('OK', 200);
    }

    /**
     * Twilio callback when recording is ready.
     */
    public function recordingStatus(Request $request)
    {
        $callSid = $request->input('CallSid');

        if (!$callSid) {
            return response('Missing CallSid', 400);
        }

        $session = InterviewSession::where('call_sid', $callSid)->first();

        if ($session) {
            $existingData = $session->twilio_data ?? [];

            $session->update([
                'twilio_data' => array_merge($existingData, [
                    'recording_sid' => $request->input('RecordingSid'),
                    'recording_url' => $request->input('RecordingUrl'),
                    'recording_duration' => (int) $request->input('RecordingDuration'),
                    'recording_status' => $request->input('RecordingStatus'),
                ]),
            ]);

            \Log::info('Twilio recording status received', [
                'call_sid' => $callSid,
                'recording_sid' => $request->input('RecordingSid'),
                'recording_duration' => $request->input('RecordingDuration'),
            ]);
        }

        return response('OK', 200);
    }

    /**
     * Legacy voice hook (kept for backwards compatibility).
     */
    public function voiceHook(Request $request)
    {
        $response = new VoiceResponse();
        $connect = $response->connect();
        $stream = $connect->stream();

        $relayUrl = env('RELAY_SERVER_URL');

        if (!$relayUrl) {
            $relayUrl = 'wss://' . parse_url(env('APP_URL'), PHP_URL_HOST);
        }

        $stream->setName('Deepgram Media Stream');
        $stream->setUrl($relayUrl);

        return response($response->asXML())->header('Content-Type', 'text/xml');
    }

    /**
     * Proxy endpoint to stream Twilio recordings with authentication.
     * Streams directly from Twilio - no local caching to avoid disk fill.
     */
    public function streamRecording(string $id)
    {
        $session = InterviewSession::findOrFail($id);

        if (!$session->twilio_data || empty($session->twilio_data['recording_url'])) {
            abort(404, 'No recording available for this session');
        }

        $recordingUrl = $session->twilio_data['recording_url'] . '.mp3';
        $sid = env('TWILIO_ACCOUNT_SID');
        $token = env('TWILIO_ACCOUNT_AUTH_TOKEN');

        // Stream directly from Twilio with authentication
        return response()->stream(function () use ($recordingUrl, $sid, $token) {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $recordingUrl);
            curl_setopt($ch, CURLOPT_USERPWD, "$sid:$token");
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_WRITEFUNCTION, function ($ch, $data) {
                echo $data;
                flush();
                return strlen($data);
            });
            curl_exec($ch);
            curl_close($ch);
        }, 200, [
            'Content-Type' => 'audio/mpeg',
        ]);
    }
}
