<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     * 
     * Fix: Change foreign key from cascadeOnDelete to nullOnDelete.
     * Usage records are IMMUTABLE billing anchors and must survive session deletion.
     */
    public function up(): void
    {
        Schema::table('usage_records', function (Blueprint $table) {
            // Drop the existing foreign key constraint
            $table->dropForeign(['interview_session_id']);

            // Re-add with nullOnDelete instead of cascadeOnDelete
            // This makes the session_id nullable on deletion but preserves the usage record
            $table->foreign('interview_session_id')
                ->references('id')
                ->on('interview_sessions')
                ->nullOnDelete();
        });

        // Make the column nullable to allow orphaned records
        Schema::table('usage_records', function (Blueprint $table) {
            $table->uuid('interview_session_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('usage_records', function (Blueprint $table) {
            $table->dropForeign(['interview_session_id']);

            $table->uuid('interview_session_id')->nullable(false)->change();

            $table->foreign('interview_session_id')
                ->references('id')
                ->on('interview_sessions')
                ->cascadeOnDelete();
        });
    }
};
