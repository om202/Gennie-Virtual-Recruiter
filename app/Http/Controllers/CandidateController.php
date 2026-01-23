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
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:30',
            'linkedin_url' => 'nullable|url|max:255',
            'skills' => 'nullable|string',
            'experience_summary' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:50',
            'zip' => 'nullable|string|max:20',
            'work_authorization' => 'nullable|string|max:50',
            'authorized_to_work' => 'nullable',
            'sponsorship_needed' => 'nullable',
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
            'skills' => $validated['skills'] ?? null,
            'experience_summary' => $validated['experience_summary'] ?? null,
            'address' => $validated['address'] ?? null,
            'city' => $validated['city'] ?? null,
            'state' => $validated['state'] ?? null,
            'zip' => $validated['zip'] ?? null,
            'work_authorization' => $validated['work_authorization'] ?? null,
            'authorized_to_work' => filter_var($validated['authorized_to_work'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'sponsorship_needed' => filter_var($validated['sponsorship_needed'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'salary_expectation' => $salaryExpectation,
            'work_history' => $validated['work_history'] ?? [],
            'education' => $validated['education'] ?? [],
            'certificates' => $validated['certificates'] ?? [],
            'resume_path' => $resumePath,
            'resume_text' => $resumeText,
        ]);

        return redirect()->back()->with('success', 'Candidate added successfully.');
    }

    public function edit(Candidate $candidate)
    {
        if ($candidate->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Candidates/CreateCandidate', [
            'candidate' => $candidate,
        ]);
    }

    public function update(Request $request, Candidate $candidate)
    {
        if ($candidate->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:30',
            'linkedin_url' => 'nullable|url|max:255',
            'skills' => 'nullable|string',
            'experience_summary' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:50',
            'zip' => 'nullable|string|max:20',
            'work_authorization' => 'nullable|string|max:50',
            'authorized_to_work' => 'nullable',
            'sponsorship_needed' => 'nullable',
            'salary_type' => 'nullable|string|in:hourly,yearly',
            'salary_min' => 'nullable|numeric|min:0',
            'salary_max' => 'nullable|numeric|min:0',
            'work_history' => 'nullable|array',
            'education' => 'nullable|array',
            'certificates' => 'nullable|array',
        ]);

        // Build salary expectation (same format as store)
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

        $candidate->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'linkedin_url' => $validated['linkedin_url'] ?? null,
            'skills' => $validated['skills'] ?? null,
            'experience_summary' => $validated['experience_summary'] ?? null,
            'address' => $validated['address'] ?? null,
            'city' => $validated['city'] ?? null,
            'state' => $validated['state'] ?? null,
            'zip' => $validated['zip'] ?? null,
            'work_authorization' => $validated['work_authorization'] ?? null,
            'authorized_to_work' => filter_var($validated['authorized_to_work'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'sponsorship_needed' => filter_var($validated['sponsorship_needed'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'salary_expectation' => $salaryExpectation,
            'work_history' => $validated['work_history'] ?? [],
            'education' => $validated['education'] ?? [],
            'certificates' => $validated['certificates'] ?? [],
        ]);

        return redirect()->route('candidates.index')->with('success', 'Candidate updated successfully.');
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
