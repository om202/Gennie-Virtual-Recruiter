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
        // Remove excessive whitespace
        $text = preg_replace('/\s+/', ' ', $text);
        // Preserve paragraph breaks
        $text = preg_replace('/\n\s*\n/', "\n\n", $text);
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
}
