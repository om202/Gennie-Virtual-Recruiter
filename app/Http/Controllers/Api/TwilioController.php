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
     */
    public function startCall(Request $request)
    {
        $to = $request->input('phone') ?? '+17204870145';
        $sessionId = $request->input('session_id');

        $sid = env('TWILIO_ACCOUNT_SID');
        $token = env('TWILIO_ACCOUNT_AUTH_TOKEN');
        $from = env('TWILIO_FROM_NUMBER');
        $appUrl = env('APP_URL');
        $relayUrl = env('RELAY_SERVER_URL');

        if (!$sid || !$token || !$from) {
            return response()->json(['error' => 'Twilio credentials or From number not configured'], 500);
        }

        try {
            $client = new Client($sid, $token);

            // Build TwiML URL with session ID
            $twimlUrl = $relayUrl . '/twilio/voice';
            if ($sessionId) {
                $twimlUrl .= '?session=' . urlencode($sessionId);
            }

            // Create call with recording and status callbacks
            $call = $client->calls->create(
                $to,
                $from,
                [
                    'url' => $twimlUrl,
                    'method' => 'POST',
                    // Enable automatic call recording
                    'record' => true,
                    // Callback when call completes
                    'statusCallback' => $appUrl . '/api/twilio/call-status',
                    'statusCallbackEvent' => ['completed'],
                    'statusCallbackMethod' => 'POST',
                    // Callback when recording is ready
                    'recordingStatusCallback' => $appUrl . '/api/twilio/recording-status',
                    'recordingStatusCallbackEvent' => ['completed'],
                    'recordingStatusCallbackMethod' => 'POST',
                ]
            );

            // Update the session to mark it as a phone interview
            if ($sessionId) {
                $session = InterviewSession::find($sessionId);
                if ($session) {
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
                }
            }

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

            $session->update([
                'twilio_data' => array_merge($existingData, [
                    'status' => $request->input('CallStatus'),
                    'duration' => (int) $request->input('CallDuration'),
                    'direction' => $request->input('Direction'),
                    'from' => $request->input('From'),
                    'to' => $request->input('To'),
                    'start_time' => $request->input('StartTime'),
                    'end_time' => $request->input('EndTime'),
                    'answered_by' => $request->input('AnsweredBy'),
                ]),
            ]);

            \Log::info('Twilio call status received', [
                'call_sid' => $callSid,
                'status' => $request->input('CallStatus'),
                'duration' => $request->input('CallDuration'),
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
}
