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
        Schema::table('job_descriptions', function (Blueprint $table) {
            $table->uuid('default_interview_id')->nullable()->after('application_deadline');
            $table->boolean('allow_self_scheduling')->default(true)->after('default_interview_id');

            $table->foreign('default_interview_id')
                ->references('id')
                ->on('interviews')
                ->onDelete('set null');
        });

        Schema::table('candidates', function (Blueprint $table) {
            $table->string('scheduling_token', 32)->nullable()->unique()->after('ai_profile_data');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_descriptions', function (Blueprint $table) {
            $table->dropForeign(['default_interview_id']);
            $table->dropColumn(['default_interview_id', 'allow_self_scheduling']);
        });

        Schema::table('candidates', function (Blueprint $table) {
            $table->dropColumn('scheduling_token');
        });
    }
};

