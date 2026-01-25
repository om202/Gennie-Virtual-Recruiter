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
        Schema::create('job_applications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('job_description_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('candidate_id')->constrained()->onDelete('cascade');

            // Application-specific resume (may differ from candidate's current resume)
            $table->string('resume_path')->nullable();
            $table->text('resume_text')->nullable();

            // Cover letter
            $table->text('cover_letter')->nullable();

            // Status workflow
            $table->enum('status', ['applied', 'under_review', 'shortlisted', 'rejected'])->default('applied');

            // Source tracking
            $table->string('source')->default('public_link'); // public_link, manual, referral

            // Metadata
            $table->json('metadata')->nullable();

            // Timestamps
            $table->timestamp('applied_at')->useCurrent();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            // Ensure unique applications per candidate per job
            $table->unique(['job_description_id', 'candidate_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_applications');
    }
};
