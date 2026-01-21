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
        // 1. Optimize Knowledge Base
        Schema::dropIfExists('knowledge_bases');

        Schema::create('knowledge_bases', function (Blueprint $table) {
            $table->id();
            $table->text('content');
            $table->jsonb('metadata')->nullable();
        });

        // Add Vector Column via Raw SQL
        DB::statement('ALTER TABLE knowledge_bases ADD COLUMN embedding halfvec(1536)');

        // Add Generated tsvector column
        DB::statement("ALTER TABLE knowledge_bases ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED");

        // Indexes
        DB::statement('CREATE INDEX knowledge_bases_search_vector_index ON knowledge_bases USING GIN (search_vector)');
        DB::statement('CREATE INDEX knowledge_bases_embedding_index ON knowledge_bases USING hnsw (embedding halfvec_cosine_ops) WITH (m = 16, ef_construction = 64)');


        // 2. Create Semantic Cache Table
        Schema::dropIfExists('semantic_cache');
        Schema::create('semantic_cache', function (Blueprint $table) {
            $table->id();
            $table->text('user_query');
            $table->text('llm_response');
            $table->timestamps();
        });

        DB::statement('ALTER TABLE semantic_cache ADD COLUMN embedding halfvec(1536)');
        DB::statement('CREATE INDEX semantic_cache_embedding_index ON semantic_cache USING hnsw (embedding halfvec_cosine_ops) WITH (m = 16, ef_construction = 64)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('semantic_cache');
        Schema::dropIfExists('knowledge_bases');
    }
};
