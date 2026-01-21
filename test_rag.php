<?php

use App\Models\KnowledgeBase;
use App\Services\RAGService;
use OpenAI\Laravel\Facades\OpenAI;

// 1. Seed some dummy data
echo "Seeding data...\n";
\DB::table('knowledge_bases')->truncate();

$documents = [
    "Laravel is a web application framework with expressive, elegant syntax.",
    "PostgreSQL is a powerful, open source object-relational database system.",
    "pgvector is an open-source vector similarity search for PostgreSQL.",
    "Hybrid search combines full-text search and vector search for better results.",
    "RAG stands for Retrieval-Augmented Generation.",
];

foreach ($documents as $doc) {
    $embedding = OpenAI::embeddings()->create([
        'model' => 'text-embedding-3-small',
        'input' => $doc,
    ])->embeddings[0]->embedding;

    \DB::table('knowledge_bases')->insert([
        'content' => $doc,
        'embedding' => json_encode($embedding), // pgvector handles the cast from json string to vector
        // search_vector is generated automatically
    ]);
}

echo "Data seeded.\n";

// 2. Test Search
$rag = app(RAGService::class);

$queries = [
    "What is Laravel?",
    "How does hybrid search work?",
    "Tell me about vector database",
];

foreach ($queries as $q) {
    echo "\nQuery: $q\n";
    echo "-------------------\n";
    $result = $rag->search($q, 2);
    echo $result . "\n";
}
