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
        Schema::create('candidates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('email')->index();
            $table->string('phone')->nullable();

            // Resume Storage & RAG
            $table->string('resume_path')->nullable();
            $table->longText('resume_text')->nullable(); // Parsed text for RAG

            // Metadata
            $table->string('linkedin_url')->nullable();
            $table->json('skills')->nullable(); // ["PHP", "React", "AWS"]
            $table->text('experience_summary')->nullable(); // AI Generated summary
            $table->string('location')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('candidates');
    }
};
