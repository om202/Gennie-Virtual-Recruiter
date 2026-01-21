<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Ensure Extension is enabled (redundant but safe)
        DB::statement('CREATE EXTENSION IF NOT EXISTS vector;');

        // 2. Re-architect Knowledge Base for Hybrid Search
        Schema::dropIfExists('knowledge_bases');

        Schema::create('knowledge_bases', function (Blueprint $table) {
            $table->id();
            $table->text('content');
            $table->jsonb('metadata')->nullable();

            // Vector Column (1536 dim for text-embedding-3-small)
            $table->vector('embedding', 1536)->nullable();

            // Full Text Search Column (tsvector) - Generated Column logic would be ideal if supported by Laravel schema builder,
            // but for now we create the column and will populate it via code or trigger.
            // Postgres 12+ supports generated columns.
            // Let's use raw SQL to add it as a GENERATED ALWAYS column for zero-maintenance.
        });

        // Add Generated tsvector column
        DB::statement("ALTER TABLE knowledge_bases ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED");

        // 3. Advanced Indexing

        // GIN Index for Keyword Search (High Speed Filter)
        DB::statement('CREATE INDEX knowledge_bases_search_vector_index ON knowledge_bases USING GIN (search_vector)');

        // HNSW Index for Vector Search (High Speed / High Recall)
        // Using 'halfvec' (pgvector 0.7+) or just 'vector_cosine_ops' on standard vector.
        // User asked for "Latest Knowledge" -> pgvector 0.7 supports halfvec/binary quantization.
        // However, 'halfvec' is a data type, not just an index op. To treat standard float32 vector as halfvec for indexing requires casting or specific ops.
        // For reliability with standard valid 'vector' column, we use HNSW with vector_cosine_ops.
        // If we wanted to use halfvec storage, we would rename the column type to 'halfvec(1536)'.
        // Let's stick to standard 'vector' storage for full precision, but if performance is key later, we can switch.
        // Optimization: m=16, ef_construction=64
        DB::statement('CREATE INDEX knowledge_bases_embedding_index ON knowledge_bases USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64)');

        // 4. Optimize Interview Sessions for Metadata
        // Ensure metadata is jsonb (if not already)
        DB::statement('ALTER TABLE interview_sessions ALTER COLUMN metadata TYPE jsonb USING metadata::jsonb');
        DB::statement('CREATE INDEX IF NOT EXISTS interview_sessions_metadata_gin ON interview_sessions USING gin (metadata)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('knowledge_bases');

        // Recreate simple version if needed, or just leave dropped.
    }
};
