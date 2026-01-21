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
        Schema::create('interview_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->text('job_description')->nullable();
            $table->text('job_description_raw')->nullable(); // Original text before processing
            $table->text('resume')->nullable();
            $table->text('resume_raw')->nullable(); // Original text before processing
            $table->json('metadata')->nullable(); // job_title, company, candidate_name, etc.
            $table->enum('status', ['setup', 'active', 'completed'])->default('setup');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interview_sessions');
    }
};
