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
        Schema::table('candidates', function (Blueprint $table) {
            // ATS Data
            $table->json('work_history')->nullable(); // [{ company, title, start_date, end_date, description }]
            $table->json('education')->nullable(); // [{ institution, degree, field, start_date, end_date }]
            $table->json('certificates')->nullable(); // [{ name, issuer, date }]

            // Work Authorization & Logistics
            $table->string('work_authorization')->nullable(); // e.g. "US Citizen", "Green Card"
            $table->boolean('authorized_to_work')->default(false);
            $table->boolean('sponsorship_needed')->default(false);
            $table->string('salary_expectation')->nullable();

            // Detailed Location
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('zip')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
