<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use OpenAI\Laravel\Facades\OpenAI;
use Smalot\PdfParser\Parser as PdfParser;
use PhpOffice\PhpWord\IOFactory;

class ResumeParserService
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
     * Use OpenAI to extract structured data from raw resume text.
     */
    public function extractStructuredData(string $text): array
    {
        $prompt = <<<EOT
You are an expert recruiter AI. Extract the following candidate details from the resume text below.
Return a valid JSON object ONLY, with these precise keys:

- name (string|null)
- email (string|null)
- phone (string|null)
- linkedin_url (string|null)
- location (string|null) - City, State mainly
- address (string|null) - Full street address if available
- city (string|null)
- state (string|null)
- zip (string|null)
- skills (string[]|[])
- experience_summary (string|null) - 2-3 sentence summary

# Complex Lists (Extract as arrays of objects)
- work_history (array):
  [{ "company": "...", "title": "...", "start_date": "YYYY-MM", "end_date": "YYYY-MM" or "Present", "description": "..." }]
- education (array):
  [{ "institution": "...", "degree": "...", "field": "...", "start_date": "YYYY", "end_date": "YYYY" }]
- certificates (array):
  [{ "name": "...", "issuer": "...", "date": "YYYY-MM" }]

# ATS Questions
- work_authorization (string|null) - e.g. "US Citizen", "Green Card" - Infer from context if explicitly stated
- salary_expectation (string|null) - Only if explicitly stated

Resume Text:
{$text}
EOT;

        $response = OpenAI::chat()->create([
            'model' => 'gpt-4o-mini',
            'messages' => [
                ['role' => 'system', 'content' => 'You are a helpful JSON extractor.'],
                ['role' => 'user', 'content' => $prompt],
            ],
            'response_format' => ['type' => 'json_object'],
        ]);

        $content = $response->choices[0]->message->content;
        return json_decode($content, true) ?? [];
    }
}
