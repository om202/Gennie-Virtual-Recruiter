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
        Schema::create('job_descriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Core Details
            $table->string('title');
            $table->string('company_name');
            $table->text('description')->nullable();

            // Location & Work Type
            $table->string('location')->nullable();
            $table->enum('remote_type', ['onsite', 'hybrid', 'remote'])->default('onsite');

            // Compensation
            $table->decimal('salary_min', 12, 2)->nullable();
            $table->decimal('salary_max', 12, 2)->nullable();
            $table->string('salary_currency', 3)->default('USD');
            $table->enum('salary_period', ['hourly', 'monthly', 'yearly'])->default('yearly');

            // Requirements
            $table->integer('experience_years_min')->nullable();
            $table->integer('experience_years_max')->nullable();
            $table->string('education_level')->nullable();
            $table->json('skills')->nullable();

            // Additional Details
            $table->enum('employment_type', ['full-time', 'part-time', 'contract', 'internship'])->default('full-time');
            $table->text('benefits')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_descriptions');
    }
};
