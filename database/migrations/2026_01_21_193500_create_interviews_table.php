<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('interviews', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Core Details
            $table->string('job_title');
            $table->text('job_description')->nullable();
            $table->text('candidate_resume')->nullable();
            $table->string('company_name');

            // Interview Configuration
            $table->integer('duration_minutes')->default(15);
            $table->enum('interview_type', ['screening', 'technical', 'behavioral', 'final'])->default('screening');
            $table->enum('difficulty_level', ['entry', 'mid', 'senior', 'executive'])->default('mid');
            $table->text('custom_instructions')->nullable();
            $table->string('language')->default('en');

            // AI Configuration
            $table->string('ai_model')->default('gpt-4o-mini');
            $table->string('voice_id')->default('aura-asteria-en');

            // Status & Tracking
            $table->enum('status', ['draft', 'active', 'archived'])->default('draft');
            $table->integer('total_sessions')->default(0);
            $table->timestamp('last_session_at')->nullable();

            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interviews');
    }
};
