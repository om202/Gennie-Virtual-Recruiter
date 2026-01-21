<?php

use App\Models\KnowledgeBase;
use App\Services\RAGService;
use OpenAI\Laravel\Facades\OpenAI;

// 1. Seed some dummy data (auto-converted to halfvec by DB)
echo "Seeding data...\n";
\DB::table('knowledge_bases')->truncate();
\DB::table('semantic_cache')->truncate();

$documents = [
    "Laravel is a web application framework with expressive, elegant syntax.",
    "PostgreSQL is a powerful, open source object-relational database system.",
    "pgvector with halfvec saves 50% memory by using 16-bit storage.",
    "Semantic caching stores recent queries to save costs.",
    "Agentic AI uses episodic memory to remember past interactions.",
];

foreach ($documents as $doc) {
    $embedding = OpenAI::embeddings()->create([
        'model' => 'text-embedding-3-small',
        'input' => $doc,
    ])->embeddings[0]->embedding;

    \DB::table('knowledge_bases')->insert([
        'content' => $doc,
        'embedding' => json_encode($embedding), // Postgres will cast json array to halfvec
    ]);
}

echo "Data seeded.\n";

// 2. Test Search & Cache
$rag = app(RAGService::class);

$queries = [
    "What prevents context overflow?",
    "Tell me about halfvec memory savings", // Should match doc #3
    "Tell me about halfvec memory savings", // EXACT REPEAT - Should hit cache
];

foreach ($queries as $i => $q) {
    echo "\nQuery #$i: $q\n";
    $start = microtime(true);
    $result = $rag->search($q, 2);
    $end = microtime(true);
    $duration = round(($end - $start) * 1000, 2);

    echo "Time: {$duration}ms\n";
    echo "Content Preview: " . substr(str_replace("\n", " ", $result), 0, 80) . "...\n";
}

// Check if cache row exists
$cacheCount = \DB::table('semantic_cache')->count();
echo "\nCache Entries: $cacheCount\n";

