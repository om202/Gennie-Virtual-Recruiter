<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InterviewSession;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AnalysisStreamController extends Controller
{
    /**
     * Stream analysis status updates via Server-Sent Events.
     * 
     * Usage: EventSource('/api/sessions/{id}/analysis-stream')
     * 
     * Events sent:
     *   - status: {status: 'pending|processing|completed|failed', result?: {...}}
     *   - done: Stream ends after completed/failed
     */
    public function stream(string $id): StreamedResponse
    {
        $session = InterviewSession::findOrFail($id);

        return new StreamedResponse(function () use ($session, $id) {
            // Allow long-running SSE stream (up to 3 minutes)
            set_time_limit(0);

            // Disable output buffering for real-time streaming
            if (ob_get_level())
                ob_end_clean();

            // Send initial status immediately
            $this->sendEvent('status', [
                'status' => $session->analysis_status,
                'result' => $session->analysis_result,
            ]);

            // If already completed or failed, end stream immediately
            if (in_array($session->analysis_status, ['completed', 'failed'])) {
                $this->sendEvent('done', ['status' => $session->analysis_status]);
                return;
            }

            // Poll database and stream updates (max 3 minutes)
            $maxIterations = 90; // 90 × 2s = 3 minutes max
            $lastStatus = $session->analysis_status;

            for ($i = 0; $i < $maxIterations; $i++) {
                sleep(2);

                // Refresh session from database
                $session = InterviewSession::find($id);

                if (!$session) {
                    $this->sendEvent('error', ['message' => 'Session not found']);
                    break;
                }

                // Only send update if status changed
                if ($session->analysis_status !== $lastStatus) {
                    $this->sendEvent('status', [
                        'status' => $session->analysis_status,
                        'result' => $session->analysis_result,
                    ]);
                    $lastStatus = $session->analysis_status;
                }

                // End stream on completion or failure
                if (in_array($session->analysis_status, ['completed', 'failed'])) {
                    $this->sendEvent('done', ['status' => $session->analysis_status]);
                    break;
                }

                // Send heartbeat to keep connection alive
                if ($i % 5 === 0) {
                    $this->sendEvent('heartbeat', ['time' => now()->toIso8601String()]);
                }
            }

            // Timeout - stream ended without completion
            if ($i >= $maxIterations) {
                $this->sendEvent('timeout', ['message' => 'Stream timeout after 3 minutes']);
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no', // Disable nginx buffering
        ]);
    }

    /**
     * Send an SSE event.
     */
    private function sendEvent(string $event, array $data): void
    {
        echo "event: {$event}\n";
        echo "data: " . json_encode($data) . "\n\n";

        if (ob_get_level())
            ob_flush();
        flush();
    }
}
