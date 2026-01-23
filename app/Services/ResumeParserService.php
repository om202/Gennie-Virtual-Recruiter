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

    // Character threshold for chunking (roughly 3000 chars ≈ 750 tokens)
    private const CHUNK_THRESHOLD = 4000;
    private const CHUNK_SIZE = 3000;

    /**
     * Use OpenAI to extract structured data from raw resume text.
     * 
     * For large resumes, splits into chunks and processes each with context.
     */
    public function extractStructuredData(string $text): array
    {
        $textLength = strlen($text);

        // If resume is small enough, process in one shot
        if ($textLength <= self::CHUNK_THRESHOLD) {
            return $this->extractFromChunk($text, 'complete');
        }

        // Large resume: split into chunks and process each
        $chunks = $this->splitIntoChunks($text);
        $totalChunks = count($chunks);

        $allResults = [];
        foreach ($chunks as $index => $chunk) {
            $position = $this->getChunkPosition($index, $totalChunks);
            $chunkResult = $this->extractFromChunk($chunk, $position, $index + 1, $totalChunks);
            $allResults[] = $chunkResult;
        }

        // Merge all chunk results intelligently
        return $this->mergeChunkResults($allResults);
    }

    /**
     * Split resume text into logical chunks, trying to break at section boundaries.
     */
    private function splitIntoChunks(string $text): array
    {
        $chunks = [];
        $currentPos = 0;
        $textLength = strlen($text);

        while ($currentPos < $textLength) {
            $endPos = min($currentPos + self::CHUNK_SIZE, $textLength);

            // If not at the end, try to find a good break point
            if ($endPos < $textLength) {
                // Look for section headers or double newlines to break at
                $searchStart = max($currentPos + (self::CHUNK_SIZE * 0.7), $currentPos);
                $segment = substr($text, (int) $searchStart, $endPos - (int) $searchStart);

                // Try to break at section headers (EXPERIENCE, EDUCATION, etc.)
                if (preg_match('/\n\s*(EXPERIENCE|EDUCATION|SKILLS|CERTIFICATIONS?|PROJECTS?|WORK HISTORY|EMPLOYMENT|PROFESSIONAL|SUMMARY|OBJECTIVE)\s*\n/i', $segment, $matches, PREG_OFFSET_CAPTURE)) {
                    $endPos = (int) $searchStart + $matches[0][1];
                }
                // Fallback: break at paragraph (double newline)
                elseif (($breakPos = strrpos($segment, "\n\n")) !== false) {
                    $endPos = (int) $searchStart + $breakPos;
                }
                // Last resort: break at single newline
                elseif (($breakPos = strrpos($segment, "\n")) !== false) {
                    $endPos = (int) $searchStart + $breakPos;
                }
            }

            $chunk = trim(substr($text, $currentPos, $endPos - $currentPos));
            if (!empty($chunk)) {
                $chunks[] = $chunk;
            }
            $currentPos = $endPos;
        }

        return $chunks;
    }

    /**
     * Get a human-readable position indicator for the chunk.
     */
    private function getChunkPosition(int $index, int $total): string
    {
        if ($total === 1)
            return 'complete';
        if ($index === 0)
            return 'beginning';
        if ($index === $total - 1)
            return 'end';
        return 'middle';
    }

    /**
     * Extract data from a single chunk with context about its position.
     */
    private function extractFromChunk(string $text, string $position, int $chunkNum = 1, int $totalChunks = 1): array
    {
        $contextNote = '';
        if ($totalChunks > 1) {
            $contextNote = <<<CTX

## IMPORTANT CONTEXT:
This is PART {$chunkNum} of {$totalChunks} of a resume. This is the {$position} section.
- Extract ONLY what you see in this chunk
- Use null for fields not present in THIS chunk
- Do NOT guess or infer from missing context
CTX;
        }

        $systemPrompt = <<<SYS
You are an ATS (Applicant Tracking System) data extractor. Your job is to extract information from resumes with MAXIMUM ACCURACY and ZERO MODIFICATION.

## CRITICAL RULES:
1. **NEVER SUMMARIZE** - Copy text exactly as it appears in the resume
2. **PRESERVE ORIGINAL FORMATTING** - Keep bullet points, line breaks as they appear
3. **EXTRACT DATES EXACTLY** - If resume says "Jan 2020", output "Jan 2020". If it says "2020-01", output "2020-01". If it says "January 2020", output "January 2020". DO NOT NORMALIZE.
4. **For descriptions** - Copy the FULL original text, including all bullet points. Do NOT condense or summarize.
5. **If information is missing** - Use null, never fabricate data
6. **Skills** - Extract each skill as a separate item, exactly as written

You must return ONLY valid JSON.
SYS;

        $prompt = <<<EOT
Extract the following from this resume. Remember: COPY EXACTLY, DO NOT SUMMARIZE OR MODIFY.
{$contextNote}

## Required Fields:
- name (string|null)
- email (string|null)  
- phone (string|null) - Include country code if present
- linkedin_url (string|null) - Full URL
- location (string|null) - City, State as written
- address (string|null) - Full street address if available
- city (string|null)
- state (string|null)
- zip (string|null)
- skills (string[]) - Each skill as separate array item, exactly as written
- experience_summary (string|null) - ONLY if explicitly written in resume as "Summary" or "Objective". Otherwise null.

## Work History (EXTRACT VERBATIM):
work_history: array of objects with:
- company: Exact company name
- title: Exact job title
- start_date: EXACTLY as written (e.g., "Mar 2019", "2019-03", "March 2019")
- end_date: EXACTLY as written (e.g., "Present", "Current", "Dec 2023", "2023-12")
- description: FULL TEXT of all bullet points and descriptions. COPY EVERYTHING, do not summarize.

Example of CORRECT extraction:
Resume says: "• Led team of 5 engineers • Implemented CI/CD pipeline reducing deploy time by 40% • Mentored junior developers"
Your output: "• Led team of 5 engineers • Implemented CI/CD pipeline reducing deploy time by 40% • Mentored junior developers"

Example of WRONG extraction (DO NOT DO THIS):
"Led engineering team, implemented CI/CD, and mentored juniors" ← This is summarized, WRONG!

## Education:
education: array of objects with:
- institution: School/University name exactly
- degree: Degree type exactly (e.g., "Bachelor of Science", "B.S.", "MBA")
- field: Field of study exactly  
- start_date: As written (year or month-year)
- end_date: As written (year or month-year)

## Certifications:
certificates: array of objects with:
- name: Certificate name exactly
- issuer: Issuing organization exactly
- date: As written

## Additional Fields:
- work_authorization (string|null) - ONLY if explicitly stated (e.g., "US Citizen", "Authorized to work in US")
- salary_expectation (string|null) - ONLY if explicitly stated

---
RESUME TEXT:
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
        return json_decode($content, true) ?? [];
    }

    /**
     * Intelligently merge results from multiple chunks.
     * - Scalar fields: use first non-null value
     * - Arrays: concatenate and deduplicate
     */
    private function mergeChunkResults(array $results): array
    {
        $merged = [
            'name' => null,
            'email' => null,
            'phone' => null,
            'linkedin_url' => null,
            'location' => null,
            'address' => null,
            'city' => null,
            'state' => null,
            'zip' => null,
            'experience_summary' => null,
            'work_authorization' => null,
            'salary_expectation' => null,
            'skills' => [],
            'work_history' => [],
            'education' => [],
            'certificates' => [],
        ];

        foreach ($results as $result) {
            // Scalar fields: first non-null wins
            foreach (['name', 'email', 'phone', 'linkedin_url', 'location', 'address', 'city', 'state', 'zip', 'experience_summary', 'work_authorization', 'salary_expectation'] as $field) {
                if (empty($merged[$field]) && !empty($result[$field])) {
                    $merged[$field] = $result[$field];
                }
            }

            // Array fields: concatenate
            foreach (['skills', 'work_history', 'education', 'certificates'] as $field) {
                if (!empty($result[$field]) && is_array($result[$field])) {
                    $merged[$field] = array_merge($merged[$field], $result[$field]);
                }
            }
        }

        // Deduplicate skills (case-insensitive)
        $merged['skills'] = array_values(array_unique($merged['skills'], SORT_REGULAR));

        // Deduplicate work_history by company+title
        $merged['work_history'] = $this->deduplicateByKeys($merged['work_history'], ['company', 'title']);

        // Deduplicate education by institution+degree
        $merged['education'] = $this->deduplicateByKeys($merged['education'], ['institution', 'degree']);

        // Deduplicate certificates by name
        $merged['certificates'] = $this->deduplicateByKeys($merged['certificates'], ['name']);

        return $merged;
    }

    /**
     * Deduplicate array of objects by specific keys.
     */
    private function deduplicateByKeys(array $items, array $keys): array
    {
        $seen = [];
        $unique = [];

        foreach ($items as $item) {
            $key = '';
            foreach ($keys as $k) {
                $key .= strtolower($item[$k] ?? '') . '|';
            }

            if (!isset($seen[$key])) {
                $seen[$key] = true;
                $unique[] = $item;
            }
        }

        return $unique;
    }
}
