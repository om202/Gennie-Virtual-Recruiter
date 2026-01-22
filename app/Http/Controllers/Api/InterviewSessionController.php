<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InterviewSession;
use App\Services\DocumentParserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
        $session = InterviewSession::with('interview')->findOrFail($id);
        $interview = $session->interview;

        // Merge interview metadata with session metadata
        $metadata = array_merge(
            $interview ? $interview->getAgentConfig() : [],
            $session->metadata ?? []
        );

        return response()->json([
            'success' => true,
            'context' => $session->getContextForAgent(),
            'hasJd' => $session->hasJobDescription(),
            'hasResume' => $session->hasResume(),
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

        $session->update([
            'status' => 'completed',
        ]);

        // Dispatch Analysis Job
        \App\Jobs\GenerateSessionAnalysis::dispatch($session);

        return response()->json([
            'success' => true,
            'message' => 'Session ended and analysis queued',
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
}
