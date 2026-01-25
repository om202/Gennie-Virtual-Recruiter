<?php

namespace App\Http\Controllers;

use App\Models\JobApplication;
use App\Models\JobDescription;
use App\Services\JobDescriptionParserService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JobDescriptionController extends Controller
{
    public function __construct(
        private JobDescriptionParserService $parser
    ) {
    }

    /**
     * Parse an uploaded JD file and extract structured data.
     */
    public function parseJobDescription(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,doc,docx|max:10240',
        ]);

        try {
            $file = $request->file('file');
            $text = $this->parser->extractText($file);
            $data = $this->parser->extractStructuredData($text);

            return response()->json([
                'status' => 'success',
                'data' => $data,
                'raw_text' => $text,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display all applications across all job descriptions.
     */
    public function allApplications(Request $request)
    {
        $jobDescriptionIds = JobDescription::where('user_id', $request->user()->id)
            ->pluck('id');

        $applications = JobApplication::whereIn('job_description_id', $jobDescriptionIds)
            ->with(['candidate:id,name,email,phone', 'jobDescription:id,title,company_name'])
            ->orderBy('applied_at', 'desc')
            ->get()
            ->map(fn($app) => [
                'id' => $app->id,
                'candidate' => $app->candidate,
                'job_description' => $app->jobDescription,
                'status' => $app->status,
                'status_label' => $app->status_label,
                'status_color' => $app->status_color,
                'cover_letter' => $app->cover_letter,
                'applied_at' => $app->applied_at->format('M d, Y'),
                'source' => $app->source,
            ]);

        return Inertia::render('Applications/Index', [
            'applications' => $applications,
            'auth' => [
                'user' => $request->user(),
            ],
        ]);
    }

    /**
     * Display a listing of job descriptions.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Auto-generate careers token (company slug) if not set
        if (!$user->careers_token && $user->company_name) {
            $baseSlug = \Illuminate\Support\Str::slug($user->company_name);
            $slug = $baseSlug;
            $counter = 1;
            // Ensure uniqueness
            while (\App\Models\User::where('careers_token', $slug)->exists()) {
                $slug = $baseSlug . '-' . $counter++;
            }
            $user->careers_token = $slug;
            $user->careers_page_enabled = true;
            $user->save();
        }

        $jobDescriptions = JobDescription::where('user_id', $user->id)
            ->withCount(['interviews', 'applications'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('JobDescriptions/Index', [
            'activeTab' => 'job-descriptions',
            'jobDescriptions' => $jobDescriptions,
            'auth' => [
                'user' => $user,
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
            'public_token' => \Illuminate\Support\Str::random(32),
            'public_link_enabled' => true,
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

    /**
     * Enable public application link for a job description.
     */
    public function enablePublicLink(Request $request, JobDescription $jobDescription)
    {
        $this->authorize('update', $jobDescription);

        $url = $jobDescription->enablePublicLink();

        return response()->json([
            'success' => true,
            'public_url' => $url,
            'public_token' => $jobDescription->public_token,
        ]);
    }

    /**
     * Display applications for a job description.
     */
    public function applications(Request $request, JobDescription $jobDescription)
    {
        $this->authorize('view', $jobDescription);

        $applications = $jobDescription->applications()
            ->with('candidate:id,name,email,phone')
            ->orderBy('applied_at', 'desc')
            ->get();

        return Inertia::render('JobDescriptions/Applications', [
            'jobDescription' => [
                'id' => $jobDescription->id,
                'title' => $jobDescription->title,
                'company_name' => $jobDescription->company_name,
            ],
            'applications' => $applications->map(fn($app) => [
                'id' => $app->id,
                'candidate' => $app->candidate,
                'status' => $app->status,
                'status_label' => $app->status_label,
                'status_color' => $app->status_color,
                'cover_letter' => $app->cover_letter,
                'applied_at' => $app->applied_at->format('M d, Y'),
                'source' => $app->source,
            ]),
            'auth' => [
                'user' => $request->user(),
            ],
        ]);
    }
}
