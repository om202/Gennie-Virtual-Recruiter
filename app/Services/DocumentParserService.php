<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Smalot\PdfParser\Parser as PdfParser;
use PhpOffice\PhpWord\IOFactory as WordIOFactory;
use Illuminate\Support\Facades\Log;

class DocumentParserService
{
    /**
     * Parse an uploaded file and extract text content.
     */
    public function parseFile(UploadedFile $file): string
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $path = $file->getRealPath();

        return match ($extension) {
            'pdf' => $this->parsePdf($path),
            'doc', 'docx' => $this->parseDocx($path),
            'txt' => file_get_contents($path),
            default => throw new \InvalidArgumentException("Unsupported file type: {$extension}"),
        };
    }

    /**
     * Parse a PDF file and extract text.
     */
    public function parsePdf(string $path): string
    {
        try {
            $parser = new PdfParser();
            $pdf = $parser->parseFile($path);
            $text = $pdf->getText();

            // Clean up the extracted text
            return $this->cleanText($text);
        } catch (\Exception $e) {
            Log::error("PDF parsing failed: " . $e->getMessage());
            throw new \RuntimeException("Failed to parse PDF: " . $e->getMessage());
        }
    }

    /**
     * Parse a DOCX file and extract text.
     */
    public function parseDocx(string $path): string
    {
        try {
            $phpWord = WordIOFactory::load($path);
            $text = '';

            foreach ($phpWord->getSections() as $section) {
                foreach ($section->getElements() as $element) {
                    $text .= $this->extractTextFromElement($element) . "\n";
                }
            }

            return $this->cleanText($text);
        } catch (\Exception $e) {
            Log::error("DOCX parsing failed: " . $e->getMessage());
            throw new \RuntimeException("Failed to parse DOCX: " . $e->getMessage());
        }
    }

    /**
     * Recursively extract text from PhpWord elements.
     */
    private function extractTextFromElement($element): string
    {
        $text = '';

        if (method_exists($element, 'getText')) {
            $result = $element->getText();
            if (is_string($result)) {
                $text .= $result;
            }
        }

        if (method_exists($element, 'getElements')) {
            foreach ($element->getElements() as $childElement) {
                $text .= $this->extractTextFromElement($childElement) . ' ';
            }
        }

        return $text;
    }

    /**
     * Clean extracted text.
     */
    private function cleanText(string $text): string
    {
        // specific cleanup for known issues
        $text = str_replace(["\r\n", "\r"], "\n", $text);

        // Replace multiple horizontal spaces with a single space
        $text = preg_replace('/[ \t]+/', ' ', $text);

        // Replace 3+ newlines with 2
        $text = preg_replace('/\n{3,}/', "\n\n", $text);

        // Trim
        return trim($text);
    }

    /**
     * Get supported file extensions.
     */
    public function getSupportedExtensions(): array
    {
        return ['pdf', 'doc', 'docx', 'txt'];
    }

    /**
     * Get max file size in bytes (5MB).
     */
    public function getMaxFileSize(): int
    {
        return 5 * 1024 * 1024;
    }

    /**
     * Parse and Chunk file.
     * Returns an array of chunks (strings).
     */
    public function parseAndChunk(UploadedFile $file, int $tokensPerChunk = 500): array
    {
        $text = $this->parseFile($file);
        return $this->chunkText($text, $tokensPerChunk);
    }

    /**
     * Chunk text into semantic segments (~500 tokens).
     * Uses recursive splitting strategy: Paragraphs -> Sentences -> Words.
     */
    public function chunkText(string $text, int $targetTokens = 500): array
    {
        // Approximation: 1 token ~= 4 chars
        $targetChars = $targetTokens * 4;
        $chunks = [];

        // Split by double newline (paragraphs) first
        $paragraphs = explode("\n\n", $text);

        $currentChunk = "";

        foreach ($paragraphs as $paragraph) {
            $paragraph = trim($paragraph);
            if (empty($paragraph))
                continue;

            // If adding this paragraph exceeds limit, push current chunk and start new
            if (strlen($currentChunk) + strlen($paragraph) > $targetChars) {
                if (!empty($currentChunk)) {
                    $chunks[] = trim($currentChunk);
                    $currentChunk = "";
                }

                // If paragraph itself is too large, split by sentence
                if (strlen($paragraph) > $targetChars) {
                    $sentences = preg_split('/(?<=[.?!])\s+/', $paragraph);
                    foreach ($sentences as $sentence) {
                        if (strlen($currentChunk) + strlen($sentence) > $targetChars) {
                            if (!empty($currentChunk)) {
                                $chunks[] = trim($currentChunk);
                                $currentChunk = "";
                            }
                            // If sentence is ridiculously long, just hard cut it (unlikely but safe)
                            if (strlen($sentence) > $targetChars) {
                                $chunks[] = substr($sentence, 0, $targetChars);
                                continue;
                            }
                        }
                        $currentChunk .= $sentence . " ";
                    }
                } else {
                    $currentChunk = $paragraph . "\n\n";
                }
            } else {
                $currentChunk .= $paragraph . "\n\n";
            }
        }

        if (!empty($currentChunk)) {
            $chunks[] = trim($currentChunk);
        }

        return $chunks;
    }
}
