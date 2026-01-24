<?php

namespace App\Http\Controllers;

use App\Models\JobDescription;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JobDescriptionController extends Controller
{
    /**
     * Display a listing of job descriptions.
     */
    public function index(Request $request)
    {
        $jobDescriptions = JobDescription::where('user_id', $request->user()->id)
            ->withCount('interviews')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('JobDescriptions/Index', [
            'jobDescriptions' => $jobDescriptions,
            'auth' => [
                'user' => $request->user(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new job description.
     */
    public function create(Request $request)
    {
        return Inertia::render('JobDescriptions/CreateJobDescription', [
            'defaultCompanyName' => $request->user()->company_name ?? '',
            'auth' => [
                'user' => $request->user(),
            ],
        ]);
    }

    /**
     * Store a newly created job description.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'company_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'remote_type' => 'in:onsite,hybrid,remote',
            'salary_min' => 'nullable|numeric|min:0',
            'salary_max' => 'nullable|numeric|min:0',
            'salary_currency' => 'string|size:3',
            'salary_period' => 'in:hourly,monthly,yearly',
            'experience_years_min' => 'nullable|integer|min:0',
            'experience_years_max' => 'nullable|integer|min:0',
            'education_level' => 'nullable|string|max:100',
            'skills' => 'nullable|array',
            'employment_type' => 'in:full-time,part-time,contract,internship',
            'benefits' => 'nullable|string',
        ]);

        $jobDescription = JobDescription::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'jobDescription' => $jobDescription,
        ]);
    }

    /**
     * Show the form for editing a job description.
     */
    public function edit(Request $request, JobDescription $jobDescription)
    {
        $this->authorize('update', $jobDescription);

        return Inertia::render('JobDescriptions/EditJobDescription', [
            'jobDescription' => $jobDescription,
            'auth' => [
                'user' => $request->user(),
            ],
        ]);
    }

    /**
     * Update the specified job description.
     */
    public function update(Request $request, JobDescription $jobDescription)
    {
        $this->authorize('update', $jobDescription);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'company_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'remote_type' => 'in:onsite,hybrid,remote',
            'salary_min' => 'nullable|numeric|min:0',
            'salary_max' => 'nullable|numeric|min:0',
            'salary_currency' => 'string|size:3',
            'salary_period' => 'in:hourly,monthly,yearly',
            'experience_years_min' => 'nullable|integer|min:0',
            'experience_years_max' => 'nullable|integer|min:0',
            'education_level' => 'nullable|string|max:100',
            'skills' => 'nullable|array',
            'employment_type' => 'in:full-time,part-time,contract,internship',
            'benefits' => 'nullable|string',
        ]);

        $jobDescription->update($validated);

        return response()->json([
            'success' => true,
            'jobDescription' => $jobDescription,
        ]);
    }

    /**
     * Remove the specified job description.
     */
    public function destroy(Request $request, JobDescription $jobDescription)
    {
        $this->authorize('delete', $jobDescription);

        // Check if any interviews are using this JD
        if ($jobDescription->interviews()->count() > 0) {
            return response()->json([
                'success' => false,
                'error' => 'Cannot delete a job description that is linked to interviews.',
            ], 422);
        }

        $jobDescription->delete();

        return response()->json([
            'success' => true,
        ]);
    }

    /**
     * Get all job descriptions for selection dropdown.
     */
    public function list(Request $request)
    {
        $jobDescriptions = JobDescription::where('user_id', $request->user()->id)
            ->select('id', 'title', 'company_name', 'location', 'remote_type')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'jobDescriptions' => $jobDescriptions,
        ]);
    }
}
