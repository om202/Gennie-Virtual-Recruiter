<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use App\Services\ResumeParserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CandidateController extends Controller
{
    protected $resumeParser;

    public function __construct(ResumeParserService $resumeParser)
    {
        $this->resumeParser = $resumeParser;
    }

    public function index(Request $request)
    {
        $query = Candidate::where('user_id', $request->user()->id);

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%")
                    ->orWhere('skills', 'ilike', "%{$search}%");
            });
        }

        $candidates = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Candidates/Index', [
            'candidates' => $candidates,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Candidates/CreateCandidate');
    }

    public function store(Request $request)
    {
        \Log::info('CandidateController::store called', [
            'all_input' => $request->all(),
            'user_id' => $request->user()?->id,
        ]);

        // Preprocess: convert skills string to array if needed
        if (is_string($request->input('skills'))) {
            $skillsArray = array_map('trim', explode(',', $request->input('skills')));
            $skillsArray = array_filter($skillsArray); // Remove empty values
            $request->merge(['skills' => $skillsArray]);
        }

        // Preprocess: normalize boolean fields (they come as '1'/'0' strings from forms)
        $request->merge([
            'authorized_to_work' => filter_var($request->input('authorized_to_work'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
            'sponsorship_needed' => filter_var($request->input('sponsorship_needed'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
        ]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:30',
            'linkedin_url' => 'nullable|url|max:255',
            'skills' => 'nullable|array',
            'experience_summary' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:50',
            'zip' => 'nullable|string|max:20',
            'work_authorization' => 'nullable|string|max:50',
            'authorized_to_work' => 'nullable|boolean',
            'sponsorship_needed' => 'nullable|boolean',
            'salary_type' => 'nullable|string|in:hourly,yearly',
            'salary_min' => 'nullable|numeric|min:0',
            'salary_max' => 'nullable|numeric|min:0',
            'work_history' => 'nullable|array',
            'education' => 'nullable|array',
            'certificates' => 'nullable|array',
            'resume_file' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
            'resume_text' => 'nullable|string',
        ]);

        $resumePath = null;
        $resumeText = $validated['resume_text'] ?? null;

        // Handle file upload if present
        if ($request->hasFile('resume_file')) {
            $path = $request->file('resume_file')->store('resumes');
            $resumePath = $path;

            if (empty($resumeText)) {
                try {
                    $resumeText = $this->resumeParser->extractText($request->file('resume_file'));
                } catch (\Exception $e) {
                    // Log error but continue
                }
            }
        }

        // Build salary expectation string from structured data
        $salaryExpectation = null;
        if (!empty($validated['salary_min']) || !empty($validated['salary_max'])) {
            $type = $validated['salary_type'] ?? 'yearly';
            $min = $validated['salary_min'] ?? '';
            $max = $validated['salary_max'] ?? '';
            $suffix = $type === 'hourly' ? '/hr' : '/yr';

            if ($min && $max) {
                $salaryExpectation = "\${$min} - \${$max} {$suffix}";
            } elseif ($min) {
                $salaryExpectation = "\${$min}+ {$suffix}";
            } elseif ($max) {
                $salaryExpectation = "Up to \${$max} {$suffix}";
            }
        }

        $candidate = Candidate::create([
            'user_id' => $request->user()->id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'linkedin_url' => $validated['linkedin_url'] ?? null,
            'skills' => $validated['skills'] ?? [],
            'experience_summary' => $validated['experience_summary'] ?? null,
            'location' => $validated['location'] ?? null,
            'address' => $validated['address'] ?? null,
            'city' => $validated['city'] ?? null,
            'state' => $validated['state'] ?? null,
            'zip' => $validated['zip'] ?? null,
            'work_authorization' => $validated['work_authorization'] ?? null,
            'authorized_to_work' => $validated['authorized_to_work'] ?? false,
            'sponsorship_needed' => $validated['sponsorship_needed'] ?? false,
            'salary_expectation' => $salaryExpectation,
            'work_history' => $validated['work_history'] ?? [],
            'education' => $validated['education'] ?? [],
            'certificates' => $validated['certificates'] ?? [],
            'resume_path' => $resumePath,
            'resume_text' => $resumeText,
        ]);

        return redirect()->back()->with('success', 'Candidate added successfully.');
    }

    public function destroy(Candidate $candidate)
    {
        if ($candidate->user_id !== auth()->id()) {
            abort(403);
        }

        $candidate->delete();

        return redirect()->back()->with('success', 'Candidate deleted.');
    }

    /**
     * Parsing endpoint for the frontend "Upload to Auto-fill" feature.
     */
    public function parseResume(Request $request)
    {
        $request->validate([
            'resume' => 'required|file|mimes:pdf,doc,docx|max:10240',
        ]);

        try {
            $file = $request->file('resume');
            $text = $this->resumeParser->extractText($file);
            $data = $this->resumeParser->extractStructuredData($text);

            return response()->json([
                'status' => 'success',
                'data' => $data,
                'raw_text' => $text
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
