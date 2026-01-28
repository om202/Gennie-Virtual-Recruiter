<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InterviewSession;
use App\Services\DocumentParserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class InterviewSessionController extends Controller
{
    protected DocumentParserService $parser;

    public function __construct(DocumentParserService $parser)
    {
        $this->parser = $parser;
    }

    /**
     * Create a new interview session.
     */
    public function store(Request $request)
    {
        $session = InterviewSession::create([
            'metadata' => $request->input('metadata', []),
            'status' => 'setup',
        ]);

        return response()->json([
            'success' => true,
            'session' => $session,
        ]);
    }

    /**
     * Get session details.
     */
    public function show(string $id)
    {
        $session = InterviewSession::findOrFail($id);

        return response()->json([
            'success' => true,
            'session' => $session,
        ]);
    }

    /**
     * Upload or paste Job Description.
     */
    public function updateJobDescription(Request $request, string $id)
    {
        $session = InterviewSession::findOrFail($id);

        // Handle file upload
        if ($request->hasFile('file')) {
            $request->validate([
                'file' => 'required|file|mimes:pdf,doc,docx,txt|max:5120',
            ]);

            try {
                $rawText = $this->parser->parseFile($request->file('file'));
                $session->update([
                    'job_description' => $rawText,
                    'job_description_raw' => $rawText,
                    'metadata' => array_merge($session->metadata ?? [], [
                        'jd_filename' => $request->file('file')->getClientOriginalName(),
                        'jd_uploaded_at' => now()->toIso8601String(),
                    ]),
                ]);
            } catch (\Exception $e) {
                Log::error("JD file parsing failed: " . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to parse file: ' . $e->getMessage(),
                ], 422);
            }
        }
        // Handle pasted text
        elseif ($request->has('text')) {
            $request->validate([
                'text' => 'required|string|min:50|max:50000',
            ]);

            $session->update([
                'job_description' => $request->input('text'),
                'job_description_raw' => $request->input('text'),
                'metadata' => array_merge($session->metadata ?? [], [
                    'jd_pasted_at' => now()->toIso8601String(),
                ]),
            ]);
        } else {
            return response()->json([
                'success' => false,
                'error' => 'Either file or text is required',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'session' => $session->fresh(),
            'preview' => substr($session->job_description, 0, 500) . '...',
        ]);
    }

    /**
     * Upload or paste Resume.
     */
    public function updateResume(Request $request, string $id)
    {
        $session = InterviewSession::findOrFail($id);

        // Handle file upload
        if ($request->hasFile('file')) {
            $request->validate([
                'file' => 'required|file|mimes:pdf,doc,docx,txt|max:5120',
            ]);

            try {
                $rawText = $this->parser->parseFile($request->file('file'));
                $session->update([
                    'resume' => $rawText,
                    'resume_raw' => $rawText,
                    'metadata' => array_merge($session->metadata ?? [], [
                        'resume_filename' => $request->file('file')->getClientOriginalName(),
                        'resume_uploaded_at' => now()->toIso8601String(),
                    ]),
                ]);
            } catch (\Exception $e) {
                Log::error("Resume file parsing failed: " . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to parse file: ' . $e->getMessage(),
                ], 422);
            }
        }
        // Handle pasted text
        elseif ($request->has('text')) {
            $request->validate([
                'text' => 'required|string|min:50|max:50000',
            ]);

            $session->update([
                'resume' => $request->input('text'),
                'resume_raw' => $request->input('text'),
                'metadata' => array_merge($session->metadata ?? [], [
                    'resume_pasted_at' => now()->toIso8601String(),
                ]),
            ]);
        } else {
            return response()->json([
                'success' => false,
                'error' => 'Either file or text is required',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'session' => $session->fresh(),
            'preview' => substr($session->resume, 0, 500) . '...',
        ]);
    }

    /**
     * Start the interview (change status to active).
     */
    public function start(Request $request, string $id)
    {
        $session = InterviewSession::findOrFail($id);

        if (!$session->hasJobDescription()) {
            return response()->json([
                'success' => false,
                'error' => 'Job description is required to start interview',
            ], 422);
        }

        // Store job title and company name in metadata
        $metadata = $session->metadata ?? [];
        if ($request->has('job_title')) {
            $metadata['job_title'] = $request->input('job_title');
        }
        if ($request->has('company_name')) {
            $metadata['company_name'] = $request->input('company_name');
        }

        $session->update([
            'status' => 'active',
            'metadata' => $metadata,
        ]);

        return response()->json([
            'success' => true,
            'session' => $session->fresh(),
            'context' => $session->getContextForAgent(),
        ]);
    }

    /**
     * Get context for AI agent (called by useDeepgramAgent hook).
     */
    public function getContext(string $id)
    {
        $session = InterviewSession::with(['interview', 'candidate'])->findOrFail($id);
        $interview = $session->interview;

        // Merge interview metadata with session metadata
        $metadata = array_merge(
            $interview ? $interview->getAgentConfig() : [],
            $session->metadata ?? []
        );

        // Get candidate name for personalized greeting
        $candidateName = $session->candidate?->name
            ?? $session->candidate_name
            ?? null;

        return response()->json([
            'success' => true,
            'context' => $session->getContextForAgent(),
            'hasJd' => $session->hasJobDescription(),
            'hasResume' => $session->hasResume(),
            'candidateName' => $candidateName,  // For personalized greeting
            'metadata' => $metadata,
            'interview' => $interview ? [
                'id' => $interview->id,
                'duration_minutes' => $interview->duration_minutes,
                'interview_type' => $interview->interview_type,
                'difficulty_level' => $interview->difficulty_level,
                'custom_instructions' => $interview->custom_instructions,
            ] : null,
        ]);
    }
    /**
     * Update interview progress via Agent Tool.
     */
    public function updateProgress(Request $request, string $id)
    {
        $session = InterviewSession::findOrFail($id);

        $request->validate([
            'action' => 'required|string',
            'payload' => 'nullable|array',
        ]);

        $currentProgress = $session->progress_state ?? [];
        $action = $request->input('action');
        $payload = $request->input('payload', []);

        // Logic for specific actions
        if ($action === 'mark_question_complete') {
            $completed = $currentProgress['completed_questions'] ?? [];
            if (!empty($payload['question_text'])) {
                $completed[] = $payload['question_text'];
            }
            $currentProgress['completed_questions'] = array_unique($completed);
        }

        if ($action === 'update_stage') {
            $currentProgress['current_stage'] = $payload['stage'] ?? 'unknown';
        }

        $session->update(['progress_state' => $currentProgress]);

        return response()->json([
            'success' => true,
            'progress' => $currentProgress
        ]);
    }

    /**
     * Store the AI's interview plan created via plan_interview tool.
     * This captures how the AI analyzed the candidate and plans to conduct the interview.
     */
    public function savePlan(Request $request, string $id)
    {
        $session = InterviewSession::findOrFail($id);

        $plan = $request->only([
            'candidate_level',
            'candidate_yoe',
            'key_skills',
            'skill_gaps',
            'focus_areas',
            'approach_notes',
            'created_at'
        ]);

        // Store plan in progress_state
        $progressState = $session->progress_state ?? [];
        $progressState['interview_plan'] = $plan;
        $session->progress_state = $progressState;
        $session->save();

        Log::info("Interview plan saved for session {$id}", $plan);

        return response()->json([
            'success' => true,
            'plan' => $plan
        ]);
    }

    /**
     * Log interaction from Agent to DB.
     * This allows full transcript persistence.
     */
    public function logInteraction(Request $request, string $id)
    {
        $session = InterviewSession::findOrFail($id);

        $request->validate([
            'speaker' => 'required|in:agent,candidate,system',
            'message' => 'required|string',
            'metadata' => 'nullable|array',
        ]);

        $session->logs()->create([
            'speaker' => $request->input('speaker'),
            'message' => $request->input('message'),
            'metadata' => $request->input('metadata'),
        ]);

        // Extract and store memory when candidate speaks
        if ($request->input('speaker') === 'candidate') {
            try {
                app(\App\Services\InterviewMemoryService::class)
                    ->extractAndStore($id, $request->input('message'));
            } catch (\Exception $e) {
                Log::warning("Memory extraction failed: " . $e->getMessage());
            }
        }

        return response()->json(['success' => true]);
    }

    /**
     * End the interview session and trigger analysis.
     */
    public function end(Request $request, string $id)
    {
        $session = InterviewSession::findOrFail($id);

        if ($session->status === 'completed') {
            return response()->json(['success' => true, 'message' => 'Session already completed']);
        }

        // Calculate duration from logs (first to last message)
        $firstLog = $session->logs()->orderBy('created_at', 'asc')->first();
        $lastLog = $session->logs()->orderBy('created_at', 'desc')->first();

        $durationSeconds = 0;
        if ($firstLog && $lastLog) {
            // Note: diffInSeconds can return negative if order is wrong, use abs() for safety
            $durationSeconds = abs($firstLog->created_at->diffInSeconds($lastLog->created_at));
        }

        $session->update([
            'status' => 'completed',
            'duration_seconds' => $durationSeconds,
        ]);

        // Record usage for billing
        if ($durationSeconds > 0) {
            try {
                app(\App\Services\SubscriptionService::class)->recordUsage($session);
            } catch (\Exception $e) {
                Log::warning("Usage recording failed for session {$id}: " . $e->getMessage());
            }
        }

        // Dispatch Analysis Job
        \App\Jobs\GenerateSessionAnalysis::dispatch($session);

        return response()->json([
            'success' => true,
            'message' => 'Session ended and analysis queued',
            'duration_seconds' => $durationSeconds,
        ]);
    }

    /**
     * Get logs for this session.
     */
    public function getLogs(string $id)
    {
        $session = InterviewSession::findOrFail($id);

        $logs = $session->logs()
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'logs' => $logs,
        ]);
    }

    /**
     * Delete an entire session.
     */
    public function deleteSession(string $id)
    {
        $session = InterviewSession::findOrFail($id);

        // Delete associated recording file if it exists (for web recordings)
        if (
            !empty($session->twilio_data['recording_url']) &&
            $session->twilio_data['recording_url'] === 'local'
        ) {
            Storage::disk('public')->delete("recordings/session_{$id}.webm");
        }

        // Delete the session (logs will cascade delete due to foreign key)
        $session->delete();

        return response()->json([
            'success' => true,
            'message' => 'Session deleted successfully',
        ]);
    }

    /**
     * Manually trigger analysis for a session.
     */
    public function analyze(string $id)
    {
        $session = InterviewSession::findOrFail($id);

        if ($session->analysis_status === 'processing' || $session->analysis_status === 'completed') {
            return response()->json(['success' => false, 'message' => 'Analysis already in progress or completed']);
        }

        // Check for content
        $hasContent = !empty($session->transcript) || $session->logs()->exists();

        if (!$hasContent) {
            return response()->json(['success' => false, 'message' => 'Cannot analyze empty session']);
        }

        // Update status to processing
        $session->update(['analysis_status' => 'processing']);

        // Dispatch Analysis Job
        \App\Jobs\GenerateSessionAnalysis::dispatch($session);

        return response()->json([
            'success' => true,
            'message' => 'Analysis queued',
        ]);
    }

    /**
     * Reset analysis status for a session.
     * TODO: TEMPORARY - Remove this method later
     */
    public function resetAnalysis(string $id)
    {
        $session = InterviewSession::findOrFail($id);

        $session->update([
            'analysis_status' => 'pending',
            'analysis_result' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Analysis reset',
        ]);
    }
    /**
     * Upload recording file for web interviews.
     */
    public function uploadRecording(Request $request, string $id)
    {
        $session = InterviewSession::findOrFail($id);

        if (!$request->hasFile('file')) {
            return response()->json(['success' => false, 'error' => 'No file uploaded'], 400);
        }

        $file = $request->file('file');
        $path = $file->storeAs('recordings', "session_{$id}.webm", 'public');

        // Update session with recording metadata
        // We use twilio_data structure to maintain compatibility with existing UI
        $twilioData = $session->twilio_data ?? [];
        $twilioData['recording_url'] = 'local'; // Indicator that it's a local file
        $twilioData['recording_status'] = 'completed';
        $twilioData['recording_duration'] = $request->input('duration', 0); // Client should send duration

        $session->update([
            'twilio_data' => $twilioData,
            'channel' => 'web',
        ]);

        return response()->json([
            'success' => true,
            'path' => $path
        ]);
    }

    /**
     * Get or stream the recording for a session.
     * Handles both local web recordings and Twilio proxied recordings.
     */
    public function getRecording(string $id)
    {
        $session = InterviewSession::findOrFail($id);
        $twilioData = $session->twilio_data ?? [];

        if (empty($twilioData['recording_url'])) {
            abort(404, 'No recording available');
        }

        // Case 1: Local Web Recording
        if ($twilioData['recording_url'] === 'local') {
            $path = "recordings/session_{$id}.webm";

            if (!Storage::disk('public')->exists($path)) {
                abort(404, 'Recording file not found');
            }

            if (!Storage::disk('public')->exists($path)) {
                abort(404, 'Recording file not found');
            }

            $fullPath = storage_path('app/public/' . $path);
            return response()->download($fullPath, "interview_{$id}.webm", [
                'Content-Type' => 'audio/webm',
                'Content-Disposition' => 'inline', // Stream instead of download
            ]);
        }

        // Case 2: Twilio Recording (Delegate to Twilio Controller logic)
        // We can reproduce the logic here to avoid circular dependencies or redirect

        $recordingUrl = $twilioData['recording_url'];
        // Ensure it has an extension if missing (Twilio usually keeps it clean but we add .mp3 for browser compatibility if needed)
        // But the stored URL usually is without extension. Twilio supports .mp3 append.
        if (!str_ends_with($recordingUrl, '.mp3')) {
            $recordingUrl .= '.mp3';
        }

        $sid = env('TWILIO_ACCOUNT_SID');
        $token = env('TWILIO_ACCOUNT_AUTH_TOKEN');

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

