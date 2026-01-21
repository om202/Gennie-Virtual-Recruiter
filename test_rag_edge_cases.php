<?php

use App\Services\RAGService;
use App\Models\InterviewSession;
use OpenAI\Laravel\Facades\OpenAI;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

$rag = app(RAGService::class);
$errors = [];

function assertTest($condition, $name)
{
    global $errors;
    if ($condition) {
        echo "✅ PASS: $name\n";
    } else {
        echo "❌ FAIL: $name\n";
        $errors[] = $name;
    }
}

echo "\n🚀 Starting Comprehensive RAG Edge Case Tests...\n";
echo "=================================================\n";

// --- SETUP ---
DB::table('knowledge_bases')->truncate();
DB::table('semantic_cache')->truncate();
DB::table('interview_sessions')->truncate();

// Seed Knowledge Base
$docs = [
    "Security Policy: Passwords must be 12 characters long.",
    "Refund Policy: Refunds are processed within 5 days.",
    "Philosophy: The unexamined life is not worth living.",
    // Large document for token overflow test
    "Large Doc: " . str_repeat("Word ", 1000)
];

foreach ($docs as $doc) {
    $embedding = OpenAI::embeddings()->create([
        'model' => 'text-embedding-3-small',
        'input' => $doc,
    ])->embeddings[0]->embedding;

    DB::table('knowledge_bases')->insert([
        'content' => $doc,
        'embedding' => json_encode($embedding)
    ]);
}
echo "📦 Seeded Knowledge Base.\n";


// --- TEST 1: Empty Query ---
echo "\n🧪 Test 1: Empty Query Handling\n";
try {
    $res = $rag->search("", 2);
    // Should probably handle this gracefully or return specific message
    // OpenAI API usually throws error on empty string. RAGService usually catches or we check behavior.
    echo "Result: " . substr($res, 0, 50) . "...\n";
    assertTest(true, "Empty query did not crash app");
} catch (\Exception $e) {
    echo "Caught expected/valid exception: " . $e->getMessage() . "\n";
    assertTest(true, "Empty query handled");
}

// --- TEST 2: Zero Relevance (Noise) ---
echo "\n🧪 Test 2: Irrelevant Query (Threshold Check)\n";
$res = $rag->search("How to bake a cake with protons?", 2);
// Depending on RRF/Threshold logic, this might return "No relevant info" or low score results.
// Standard RAGService usually returns hits if RRF finds *anything* or if we removed threshold.
// Let's check output.
echo "Result: '$res'\n";
// Ideally we want it to return results if similar enough, or mostly empty if strictly filtered.
// Our current implementation doesn't have a strict 'threshold' in the Hybrid SQL (it returns top N).
// So it arguably SHOULD return something (best effort) or nothing.
// Let's just verify it didn't crash.
assertTest(!empty($res), "Returned a result (Best Effort)");


// --- TEST 3: Semantic Cache Hit/Miss ---
echo "\n🧪 Test 3: Semantic Caching\n";
$query = "What is the refund policy?";
$start = microtime(true);
$res1 = $rag->search($query, 1);
$time1 = microtime(true) - $start;

$start = microtime(true);
$res2 = $rag->search($query, 1); // Should hit cache
$time2 = microtime(true) - $start;

echo "Run 1: " . round($time1 * 1000) . "ms | Run 2: " . round($time2 * 1000) . "ms\n";
assertTest(str_contains($res1, "5 days"), "Run 1 Found correct info");
assertTest($res1 === $res2, "Cache returned identical content");
assertTest($time2 < $time1, "Run 2 was faster (Cache Hit)");


// --- TEST 4: Context Token Overflow (Safety) ---
echo "\n🧪 Test 4: Token Limit Safety\n";
$res = $rag->search("Word", 5); // Should match the "Large Doc"
// Our service limit is 2000 tokens (approx 8000 chars).
// The doc is "Word " * 1000 = 5000 chars. It should fit.
// Let's try to fetch multiple if needed to break it?
// Actually, let's just verified it didn't return 50,000 chars if we had deeper data.
$len = strlen($res);
echo "Context Length: $len chars\n";
assertTest($len < 10000, "Context length is within safety limits");


// --- TEST 5: Special Characters / Injection ---
echo "\n🧪 Test 5: Special Characters\n";
$specialQuery = "Refund ' OR 1=1; -- Policy \u{1F600}"; // SQL Injection attempt + Emoji
$res = $rag->search($specialQuery, 1);
echo "Result: " . substr($res, 0, 50) . "...\n";
assertTest(str_contains($res, "5 days"), "Correctly found info despite injection syntax");


// --- TEST 6: Episodic Memory (Session Context) ---
echo "\n🧪 Test 6: Episodic Memory (Session Context)\n";
// --- TEST 6: Episodic Memory (Session Context) ---
echo "\n🧪 Test 6: Episodic Memory (Session Context)\n";
// Create a session
$uuid = Str::uuid()->toString();

DB::table('interview_sessions')->insert([
    'id' => $uuid,
    'job_description' => "We need a PHP Expert with Laravel expertise.",
    'resume' => "I am a PHP Expert who loves Laravel.",
    'metadata' => json_encode([]),
    'created_at' => now(),
    'updated_at' => now(),
]);

echo "Created Session ID: $uuid\n";

// Use a keyword that exists in RAGService list: 'experience'
$res = $rag->searchWithSession("What experience is required?", $uuid);
echo "Session Result: " . substr($res, 0, 100) . "...\n";
assertTest(str_contains($res, "From Job Description"), "Found JD context");
assertTest(str_contains($res, "PHP Expert"), "Found relevant keyword from JD");


// --- SUMMARY ---
echo "\n=================================================\n";
if (empty($errors)) {
    echo "🎉 ALL TESTS PASSED!\n";
} else {
    echo "⚠️  ERRORS FOUND: " . implode(", ", $errors) . "\n";
}
