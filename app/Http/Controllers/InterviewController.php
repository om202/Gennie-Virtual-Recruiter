<?php

namespace App\Http\Controllers;

use App\Models\Interview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class InterviewController extends Controller
{
    /**
     * Display a listing of the interviews.
     */
    public function index()
    {
        $interviews = Auth::user()->interviews()
            ->orderBy('updated_at', 'desc')
            ->get();

        return Inertia::render('Interviews/Index', [
            'interviews' => $interviews,
        ]);
    }

    /**
     * Show the form for creating a new interview.
     */
    public function create()
    {
        return Inertia::render('CreateInterview');
    }

    /**
     * Store a newly created interview.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'job_description_id' => 'required|uuid|exists:job_descriptions,id',
            'duration_minutes' => 'nullable|integer|in:15,30,45,60',
            'interview_type' => 'nullable|in:screening,technical,behavioral,final',
            'difficulty_level' => 'nullable|in:entry,mid,senior,executive',
            'custom_instructions' => 'nullable|string|max:5000',
            'voice_id' => 'nullable|string',
            'stt_model' => 'nullable|string|in:nova-2,nova-3,flux-general-en',
            'endpointing' => 'nullable|integer|min:10|max:5000',
            'utterance_end_ms' => 'nullable|integer|min:500|max:5000',
            'smart_format' => 'nullable|boolean',
            'keywords' => 'nullable|array',
            'required_questions' => 'nullable|array',
        ]);

        // Load the job description for denormalized fields
        $jobDescription = \App\Models\JobDescription::findOrFail($validated['job_description_id']);

        // Verify ownership
        if ($jobDescription->user_id !== Auth::id()) {
            abort(403, 'You do not own this job description.');
        }

        // Set derived fields from JD
        $validated['job_title'] = $jobDescription->title;
        $validated['company_name'] = $jobDescription->company_name;
        $validated['job_description'] = $jobDescription->description;
        $validated['status'] = 'active';

        // Prepare STT Config
        $sttConfig = [
            'endpointing' => $request->input('endpointing', 300),
            'utterance_end_ms' => $request->input('utterance_end_ms', 1000),
            'smart_format' => $request->boolean('smart_format', true),
            'keywords' => $request->input('keywords', []),
        ];

        // Store STT model and config in metadata
        $metadata = [
            'stt_model' => $validated['stt_model'] ?? 'nova-2',
            'stt_config' => $sttConfig,
        ];
        unset($validated['stt_model']);
        $validated['metadata'] = $metadata;

        $interview = Auth::user()->interviews()->create($validated);

        return response()->json([
            'success' => true,
            'interview' => $interview->load('jobDescription'),
        ]);
    }

    /**
     * Display the specified interview.
     */
    public function show(Interview $interview)
    {
        $this->authorize('view', $interview);

        return response()->json([
            'success' => true,
            'interview' => $interview->load('sessions'),
        ]);
    }

    /**
     * Show the form for editing the specified interview.
     */
    public function edit(Interview $interview)
    {
        $this->authorize('update', $interview);

        return Inertia::render('EditInterview', [
            'interview' => $interview,
        ]);
    }

    /**
     * Update the specified interview.
     */
    public function update(Request $request, Interview $interview)
    {
        $this->authorize('update', $interview);

        $validated = $request->validate([
            'job_description_id' => 'nullable|uuid|exists:job_descriptions,id',
            'job_title' => 'sometimes|string|max:255',
            'job_description' => 'nullable|string|max:100000',
            'candidate_resume' => 'nullable|string|max:100000',
            'company_name' => 'sometimes|string|max:255',
            'duration_minutes' => 'nullable|integer|in:15,30,45,60',
            'interview_type' => 'nullable|in:screening,technical,behavioral,final',
            'difficulty_level' => 'nullable|in:entry,mid,senior,executive',
            'custom_instructions' => 'nullable|string|max:5000',
            'voice_id' => 'nullable|string',
            'stt_model' => 'nullable|string|in:nova-2,nova-3,flux-general-en',
            'status' => 'nullable|in:draft,active,archived',
            'endpointing' => 'nullable|integer|min:10|max:5000',
            'utterance_end_ms' => 'nullable|integer|min:500|max:5000',
            'smart_format' => 'nullable|boolean',
            'keywords' => 'nullable|array',
            'required_questions' => 'nullable|array',
        ]);

        // If linking a new JD, update denormalized fields
        if (isset($validated['job_description_id'])) {
            $jobDescription = \App\Models\JobDescription::findOrFail($validated['job_description_id']);
            if ($jobDescription->user_id !== Auth::id()) {
                abort(403, 'You do not own this job description.');
            }
            $validated['job_title'] = $jobDescription->title;
            $validated['company_name'] = $jobDescription->company_name;
            $validated['job_description'] = $jobDescription->description;
        }

        // Handle metadata updates
        $metadata = $interview->metadata ?? [];

        if (isset($validated['stt_model'])) {
            $metadata['stt_model'] = $validated['stt_model'];
            unset($validated['stt_model']);
        }

        // Update STT Config if any field is present
        if ($request->hasAny(['endpointing', 'utterance_end_ms', 'smart_format', 'keywords'])) {
            $currentConfig = $metadata['stt_config'] ?? [];
            $newConfig = array_merge($currentConfig, [
                'endpointing' => $request->input('endpointing', $currentConfig['endpointing'] ?? 300),
                'utterance_end_ms' => $request->input('utterance_end_ms', $currentConfig['utterance_end_ms'] ?? 1000),
                'smart_format' => $request->boolean('smart_format', $currentConfig['smart_format'] ?? true),
                'keywords' => $request->input('keywords', $currentConfig['keywords'] ?? []),
            ]);
            $metadata['stt_config'] = $newConfig;
        }

        $validated['metadata'] = $metadata;

        $interview->update($validated);

        return response()->json([
            'success' => true,
            'interview' => $interview->fresh(),
        ]);
    }

    /**
     * Remove the specified interview.
     */
    public function destroy(Interview $interview)
    {
        $this->authorize('delete', $interview);

        $interview->delete();

        return response()->json([
            'success' => true,
        ]);
    }

    /**
     * Display all logs across all interviews for the user
     */
    public function allLogs(Request $request)
    {
        $candidateId = $request->query('candidate');

        $interviews = Auth::user()->interviews()
            ->with([
                'sessions' => function ($query) use ($candidateId) {
                    $query->has('logs')
                        ->with('candidate:id,name,email,phone')
                        ->orderBy('created_at', 'desc')
                        ->select('id', 'interview_id', 'candidate_id', 'status', 'created_at', 'updated_at', 'metadata', 'progress_state', 'analysis_status', 'analysis_result', 'channel', 'twilio_data');

                    if ($candidateId) {
                        $query->where('candidate_id', $candidateId);
                    }
                }
            ])
            ->orderBy('updated_at', 'desc')
            ->get();

        // If filtering by candidate, remove interviews with no matching sessions
        if ($candidateId) {
            $interviews = $interviews->filter(fn($i) => $i->sessions->isNotEmpty())->values();
        }

        // Get candidate name for display if filtering
        $candidateName = null;
        if ($candidateId) {
            $candidate = \App\Models\Candidate::where('id', $candidateId)
                ->where('user_id', Auth::id())
                ->first();
            $candidateName = $candidate?->name;
        }

        return Inertia::render('InterviewLogs', [
            'activeTab' => 'logs',
            'interviews' => $interviews,
            'interview' => null, // No specific interview filter
            'candidateFilter' => $candidateId,
            'candidateName' => $candidateName,
        ]);
    }

    /**
     * Display logs for the interview
     */
    public function logs(Interview $interview)
    {
        $this->authorize('view', $interview);

        $sessions = $interview->sessions()
            ->has('logs')
            ->with('candidate:id,name,email,phone')
            ->orderBy('created_at', 'desc')
            ->select('id', 'interview_id', 'candidate_id', 'status', 'created_at', 'updated_at', 'metadata', 'progress_state', 'channel', 'twilio_data', 'analysis_status', 'analysis_result')
            ->get();

        // Load sessions relationship for consistency
        $interview->setRelation('sessions', $sessions);

        return Inertia::render('InterviewLogs', [
            'activeTab' => 'logs',
            'interviews' => collect([$interview]),
            'interview' => $interview, // Specific interview filter
        ]);
    }

    /**
     * Get sessions for this interview.
     */
    public function getSessions(Interview $interview)
    {
        $this->authorize('view', $interview);

        $sessions = $interview->sessions()
            ->orderBy('created_at', 'desc')
            ->with('candidate:id,name,email,phone')
            ->select('id', 'interview_id', 'candidate_id', 'status', 'created_at', 'updated_at', 'metadata', 'progress_state', 'channel', 'twilio_data')
            ->get();

        return response()->json([
            'success' => true,
            'sessions' => $sessions,
        ]);
    }

    /**
     * Enable public link for an interview.
     */
    public function enablePublicLink(Interview $interview)
    {
        $this->authorize('update', $interview);

        $url = $interview->enablePublicLink();

        return response()->json([
            'success' => true,
            'url' => $url,
            'token' => $interview->public_token,
        ]);
    }
}

