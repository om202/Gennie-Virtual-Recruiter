<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     * Creates interview_memory table for semantic memory storage.
     * Part of the RAG-based interview memory system.
     */
    public function up(): void
    {
        Schema::create('interview_memory', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('interview_session_id');
            $table->string('topic', 50);       // 'intro', 'salary', 'location', etc.
            $table->text('content');           // The extracted fact
            $table->text('source_message');    // Original message it came from
            $table->timestamps();

            $table->foreign('interview_session_id')
                ->references('id')->on('interview_sessions')
                ->onDelete('cascade');

            // Composite unique: one topic per session
            $table->unique(['interview_session_id', 'topic']);
        });

        // Add vector column for semantic search (halfvec for efficiency)
        DB::statement('ALTER TABLE interview_memory ADD COLUMN embedding halfvec(1536)');

        // Create HNSW index for fast similarity search
        DB::statement('CREATE INDEX interview_memory_embedding_idx ON interview_memory USING hnsw (embedding halfvec_cosine_ops) WITH (m = 16, ef_construction = 64)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interview_memory');
    }
};
