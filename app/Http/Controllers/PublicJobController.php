<?php

namespace App\Http\Controllers;

use App\Models\JobDescription;
use App\Models\Candidate;
use App\Services\Email\EmailService;
use App\Services\SMS\SmsService;
use App\Services\ResumeParserService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicJobController extends Controller
{
    public function __construct(
        private ResumeParserService $resumeParser
    ) {
    }

    /**
     * Show public job application page.
     * Company and job slugs are for SEO-friendly URLs, lookup is done by token only.
     */
    public function show(string $company, string $job, string $token)
    {
        $jobDescription = JobDescription::where('public_token', $token)
            ->where('public_link_enabled', true)
            ->with('user:id,company_name')
            ->first();

        if (!$jobDescription) {
            abort(404, 'Job not found or no longer accepting applications.');
        }

        // Check if deadline has passed
        if ($jobDescription->application_deadline && $jobDescription->application_deadline->isPast()) {
            return Inertia::render('PublicJobApplication', [
                'error' => 'The application deadline for this position has passed.',
                'token' => $token,
            ]);
        }

        return Inertia::render('PublicJobApplication', [
            'job' => [
                'id' => $jobDescription->id,
                'title' => $jobDescription->title,
                'company_name' => $jobDescription->company_name,
                'description' => $jobDescription->description,
                'location' => $jobDescription->location,
                'remote_type' => $jobDescription->remote_type,
                'salary_range' => $jobDescription->salary_range,
                'experience_range' => $jobDescription->experience_range,
                'education_level' => $jobDescription->education_level,
                'skills' => $jobDescription->skills,
                'employment_type' => $jobDescription->employment_type,
                'benefits' => $jobDescription->benefits,
                'application_deadline' => $jobDescription->application_deadline?->toDateString(),
            ],
            'token' => $token,
        ]);
    }

    /**
     * Process job application submission.
     */
    public function apply(Request $request, string $token)
    {
        $jobDescription = JobDescription::where('public_token', $token)
            ->where('public_link_enabled', true)
            ->first();

        if (!$jobDescription) {
            return response()->json(['error' => 'Job not found or no longer accepting applications.'], 404);
        }

        // Check deadline
        if ($jobDescription->application_deadline && $jobDescription->application_deadline->isPast()) {
            return response()->json(['error' => 'The application deadline has passed.'], 422);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:50',
            'resume' => 'required|file|mimes:pdf,doc,docx|max:10240',
            'linkedin_url' => 'nullable|url|max:255',
            'cover_letter' => 'nullable|string|max:5000',
        ]);

        // Find or create candidate (email-based deduplication scoped to recruiter)
        $candidate = Candidate::where('email', $request->email)
            ->where('user_id', $jobDescription->user_id)
            ->first();

        // Extract resume text
        $resumeText = null;
        $resumePath = null;
        try {
            $resumeText = $this->resumeParser->extractText($request->file('resume'));
            $resumePath = $request->file('resume')->store('resumes');
        } catch (\Exception $e) {
            // Continue without text extraction
            $resumePath = $request->file('resume')->store('resumes');
        }

        if ($candidate) {
            // Update existing candidate with new info
            $updateData = [
                'name' => $request->name,
                'phone' => $request->phone,
            ];

            // Update resume if provided
            if ($resumePath) {
                $updateData['resume_path'] = $resumePath;
            }
            if ($resumeText) {
                $updateData['resume_text'] = $resumeText;
            }
            if ($request->filled('linkedin_url')) {
                $updateData['linkedin_url'] = $request->linkedin_url;
            }

            $candidate->update($updateData);
        } else {
            // Create new candidate
            $candidate = Candidate::create([
                'user_id' => $jobDescription->user_id,
                'email' => $request->email,
                'name' => $request->name,
                'phone' => $request->phone,
                'resume_path' => $resumePath,
                'resume_text' => $resumeText,
                'linkedin_url' => $request->linkedin_url,
            ]);
        }

        // Check if already applied (duplicate protection)
        $existingApplication = \App\Models\JobApplication::where('job_description_id', $jobDescription->id)
            ->where('candidate_id', $candidate->id)
            ->first();

        if ($existingApplication) {
            // Update existing application with new resume/cover letter
            $existingApplication->update([
                'resume_path' => $resumePath,
                'resume_text' => $resumeText,
                'cover_letter' => $request->cover_letter,
            ]);
        } else {
            // Create new job application
            \App\Models\JobApplication::create([
                'job_description_id' => $jobDescription->id,
                'candidate_id' => $candidate->id,
                'resume_path' => $resumePath,
                'resume_text' => $resumeText,
                'cover_letter' => $request->cover_letter,
                'status' => 'applied',
                'source' => 'public_link',
                'metadata' => [
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ],
                'applied_at' => now(),
            ]);
        }

        // Send confirmation to candidate (Email + SMS)
        app(EmailService::class)->sendApplicationReceived($jobDescription, $candidate);
        app(SmsService::class)->sendApplicationReceived($jobDescription, $candidate);

        return response()->json([
            'success' => true,
            'message' => 'Your application has been submitted successfully!',
        ]);
    }

    /**
     * Parse resume for auto-fill (AJAX endpoint).
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
                'raw_text' => $text,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
