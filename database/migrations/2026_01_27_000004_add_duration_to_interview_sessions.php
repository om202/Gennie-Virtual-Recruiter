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
            $table->integer('duration_seconds')->nullable();
            $table->integer('cost_cents')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('interview_sessions', function (Blueprint $table) {
            $table->dropColumn(['duration_seconds', 'cost_cents']);
        });
    }
};
