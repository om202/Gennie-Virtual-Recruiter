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
     * Store a newly created interview.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'job_title' => 'required|string|max:255',
            'job_description' => 'nullable|string|max:100000',
            'candidate_resume' => 'nullable|string|max:100000',
            'company_name' => 'nullable|string|max:255',
            'duration_minutes' => 'nullable|integer|in:15,30,45,60',
            'interview_type' => 'nullable|in:screening,technical,behavioral,final',
            'difficulty_level' => 'nullable|in:entry,mid,senior,executive',
            'custom_instructions' => 'nullable|string|max:5000',
            'voice_id' => 'nullable|string',
            'stt_model' => 'nullable|string|in:nova-2,nova-3',
        ]);

        // Default company name to user's company
        if (empty($validated['company_name'])) {
            $validated['company_name'] = Auth::user()->company_name ?? 'Company';
        }

        // Set status based on whether JD is provided
        $validated['status'] = !empty($validated['job_description']) ? 'active' : 'draft';

        // Store STT model in metadata
        $metadata = [
            'stt_model' => $validated['stt_model'] ?? 'nova-2'
        ];
        unset($validated['stt_model']);
        $validated['metadata'] = $metadata;

        $interview = Auth::user()->interviews()->create($validated);

        return response()->json([
            'success' => true,
            'interview' => $interview,
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
     * Update the specified interview.
     */
    public function update(Request $request, Interview $interview)
    {
        $this->authorize('update', $interview);

        $validated = $request->validate([
            'job_title' => 'sometimes|string|max:255',
            'job_description' => 'nullable|string|max:100000',
            'candidate_resume' => 'nullable|string|max:100000',
            'company_name' => 'sometimes|string|max:255',
            'duration_minutes' => 'nullable|integer|in:15,30,45,60',
            'interview_type' => 'nullable|in:screening,technical,behavioral,final',
            'difficulty_level' => 'nullable|in:entry,mid,senior,executive',
            'custom_instructions' => 'nullable|string|max:5000',
            'voice_id' => 'nullable|string',
            'stt_model' => 'nullable|string|in:nova-2,nova-3',
            'status' => 'nullable|in:draft,active,archived',
        ]);

        // Handle metadata updates
        if (isset($validated['stt_model'])) {
            $metadata = $interview->metadata ?? [];
            $metadata['stt_model'] = $validated['stt_model'];
            $validated['metadata'] = $metadata;
            unset($validated['stt_model']);
        }

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
     * Start a new session for an interview.
     */
    public function startSession(Interview $interview)
    {
        $this->authorize('view', $interview);

        // Create a new session linked to this interview
        $session = $interview->sessions()->create([
            'status' => 'active',
            'metadata' => [
                'job_title' => $interview->job_title,
                'company_name' => $interview->company_name,
                'started_at' => now()->toIso8601String(),
            ],
        ]);

        // Update interview tracking
        $interview->recordSession();

        return Inertia::render('Gennie', [
            'sessionId' => $session->id,
            'interview' => $interview,
        ]);
    }
}
