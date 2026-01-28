<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Migration to add user isolation to knowledge_bases and optimize interview_memory queries.
 * 
 * Fixes:
 * - Issue 1: Adds user_id to knowledge_bases for data isolation between companies
 * - Issue 2: Adds B-tree index on interview_memory.interview_session_id for faster filtered queries
 */
return new class extends Migration {
    public function up(): void
    {
        // 1. Add user_id to knowledge_bases for data isolation
        // This allows filtering knowledge base entries by user/company
        Schema::table('knowledge_bases', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained()->onDelete('cascade');
        });

        // Create index for user_id filtering
        Schema::table('knowledge_bases', function (Blueprint $table) {
            $table->index('user_id', 'knowledge_bases_user_id_index');
        });

        // 2. Add B-tree index on interview_memory.interview_session_id
        // This optimizes queries that filter by session before doing vector similarity search
        // Check if index already exists before creating
        $indexExists = DB::selectOne("
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'interview_memory' 
            AND indexname = 'interview_memory_session_idx'
        ");

        if (!$indexExists) {
            DB::statement('CREATE INDEX interview_memory_session_idx ON interview_memory(interview_session_id)');
        }
    }

    public function down(): void
    {
        // Remove session index
        DB::statement('DROP INDEX IF EXISTS interview_memory_session_idx');

        // Remove user_id from knowledge_bases
        Schema::table('knowledge_bases', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropIndex('knowledge_bases_user_id_index');
            $table->dropColumn('user_id');
        });
    }
};
