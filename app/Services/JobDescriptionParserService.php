<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use OpenAI\Laravel\Facades\OpenAI;
use Smalot\PdfParser\Parser as PdfParser;
use PhpOffice\PhpWord\IOFactory;

class JobDescriptionParserService
{
    /**
     * Extract raw text from an uploaded file (PDF or DOCX).
     */
    public function extractText(UploadedFile $file): string
    {
        $extension = $file->getClientOriginalExtension();

        if (strtolower($extension) === 'pdf') {
            $parser = new PdfParser();
            $pdf = $parser->parseFile($file->getPathname());
            return $pdf->getText();
        }

        if (in_array(strtolower($extension), ['doc', 'docx'])) {
            $phpWord = IOFactory::load($file->getPathname());
            $text = '';
            foreach ($phpWord->getSections() as $section) {
                foreach ($section->getElements() as $element) {
                    if (method_exists($element, 'getText')) {
                        $text .= $element->getText() . "\n";
                    }
                }
            }
            return $text;
        }

        throw new \Exception("Unsupported file type: {$extension}");
    }

    /**
     * Use OpenAI to extract structured data from raw job description text.
     */
    public function extractStructuredData(string $text): array
    {
        $systemPrompt = <<<SYS
You are an ATS (Applicant Tracking System) job description parser. Your job is to extract structured information from job postings with MAXIMUM ACCURACY.

## CRITICAL RULES:
1. **EXTRACT EXACTLY** - Copy text exactly as it appears, do not summarize
2. **If information is missing** - Use null, NEVER fabricate data
3. **Skills** - Extract each required skill as a separate item
4. **Salary** - Extract numeric values if stated, otherwise null
5. **Remote type** - Infer from context: "onsite", "hybrid", or "remote"
6. **Employment type** - Infer: "full-time", "part-time", "contract", or "internship"

You must return ONLY valid JSON.
SYS;

        $prompt = <<<EOT
Extract the following fields from this job description. Remember: EXTRACT EXACTLY, DO NOT FABRICATE.

## Required Fields:
- title (string|null) - Job title exactly as stated
- company_name (string|null) - Company name if mentioned
- description (string|null) - FULL job description text, preserve formatting
- location (string|null) - City, State or address as written
- remote_type (string) - Must be one of: "onsite", "hybrid", "remote". Infer from context.
- salary_min (number|null) - Minimum salary if stated, numeric only
- salary_max (number|null) - Maximum salary if stated, numeric only
- salary_currency (string) - Currency code, default "USD"
- salary_period (string) - Must be one of: "hourly", "monthly", "yearly". Infer from context.
- experience_years_min (number|null) - Minimum years of experience if stated
- experience_years_max (number|null) - Maximum years of experience if stated
- education_level (string|null) - Required education level if stated
- skills (array) - Array of required skills as strings
- employment_type (string) - Must be one of: "full-time", "part-time", "contract", "internship"
- benefits (string|null) - Perks and benefits as written

## Examples:
If JD says "5+ years of experience" → experience_years_min: 5, experience_years_max: null
If JD says "3-5 years" → experience_years_min: 3, experience_years_max: 5
If JD says "\$100k-\$150k/year" → salary_min: 100000, salary_max: 150000, salary_period: "yearly"
If JD says "Remote OK" or "Work from anywhere" → remote_type: "remote"
If JD says "On-site required" → remote_type: "onsite"

---
JOB DESCRIPTION TEXT:
{$text}
EOT;

        $response = OpenAI::chat()->create([
            'model' => 'gpt-4o-mini',
            'messages' => [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => $prompt],
            ],
            'response_format' => ['type' => 'json_object'],
            'temperature' => 0.1,
        ]);

        $content = $response->choices[0]->message->content;
        $data = json_decode($content, true) ?? [];

        // Normalize and validate extracted data
        return $this->normalizeData($data);
    }

    /**
     * Normalize extracted data to ensure proper types and defaults.
     */
    private function normalizeData(array $data): array
    {
        return [
            'title' => $data['title'] ?? null,
            'company_name' => $data['company_name'] ?? null,
            'description' => $data['description'] ?? null,
            'location' => $data['location'] ?? null,
            'remote_type' => in_array($data['remote_type'] ?? '', ['onsite', 'hybrid', 'remote'])
                ? $data['remote_type']
                : 'onsite',
            'salary_min' => is_numeric($data['salary_min'] ?? null) ? (float) $data['salary_min'] : null,
            'salary_max' => is_numeric($data['salary_max'] ?? null) ? (float) $data['salary_max'] : null,
            'salary_currency' => $data['salary_currency'] ?? 'USD',
            'salary_period' => in_array($data['salary_period'] ?? '', ['hourly', 'monthly', 'yearly'])
                ? $data['salary_period']
                : 'yearly',
            'experience_years_min' => is_numeric($data['experience_years_min'] ?? null)
                ? (int) $data['experience_years_min']
                : null,
            'experience_years_max' => is_numeric($data['experience_years_max'] ?? null)
                ? (int) $data['experience_years_max']
                : null,
            'education_level' => $data['education_level'] ?? null,
            'skills' => is_array($data['skills'] ?? null) ? $data['skills'] : [],
            'employment_type' => in_array($data['employment_type'] ?? '', ['full-time', 'part-time', 'contract', 'internship'])
                ? $data['employment_type']
                : 'full-time',
            'benefits' => $data['benefits'] ?? null,
        ];
    }
}
