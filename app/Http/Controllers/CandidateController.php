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
            'phone' => 'nullable|string|max:20',
            'linkedin_url' => 'nullable|url|max:255',
            'skills' => 'nullable|array',
            'experience_summary' => 'nullable|string',
            'location' => 'nullable|string',
            'resume_file' => 'nullable|file|mimes:pdf,doc,docx|max:10240', // 10MB
            'resume_text' => 'nullable|string', // Allow creating with pre-parsed text
        ]);

        $resumePath = null;
        $resumeText = $validated['resume_text'] ?? null;

        // Handle file upload if present (overrides text if we want to re-parse, or just store it)
        if ($request->hasFile('resume_file')) {
            $path = $request->file('resume_file')->store('resumes'); // storage/app/resumes
            $resumePath = $path;

            // If text wasn't provided (manual upload without pre-parse), extract it now
            if (empty($resumeText)) {
                try {
                    $resumeText = $this->resumeParser->extractText($request->file('resume_file'));
                } catch (\Exception $e) {
                    // Log error but continue
                }
            }
        }

        $candidate = Candidate::create([
            'user_id' => $request->user()->id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'linkedin_url' => $validated['linkedin_url'],
            'skills' => $validated['skills'],
            'experience_summary' => $validated['experience_summary'],
            'location' => $validated['location'],
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
