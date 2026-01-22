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
        Schema::table('interview_sessions', function (Blueprint $table) {
            $table->enum('analysis_status', ['pending', 'processing', 'completed', 'failed'])
                ->default('pending')
                ->after('status');
            $table->json('analysis_result')->nullable()->after('analysis_status');
            $table->text('transcript')->nullable()->after('analysis_result');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('interview_sessions', function (Blueprint $table) {
            $table->dropColumn(['analysis_status', 'analysis_result', 'transcript']);
        });
    }
};
