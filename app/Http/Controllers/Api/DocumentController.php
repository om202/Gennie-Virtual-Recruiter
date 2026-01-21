<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DocumentParserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DocumentController extends Controller
{
    protected DocumentParserService $parser;

    public function __construct(DocumentParserService $parser)
    {
        $this->parser = $parser;
    }

    /**
     * Parse a document and return its text content.
     */
    public function parse(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,doc,docx,txt|max:5120',
        ]);

        try {
            $rawText = $this->parser->parseFile($request->file('file'));

            return response()->json([
                'success' => true,
                'text' => $rawText,
                'filename' => $request->file('file')->getClientOriginalName(),
            ]);
        } catch (\Exception $e) {
            Log::error("Document parsing failed: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to parse file: ' . $e->getMessage(),
            ], 422);
        }
    }
}
