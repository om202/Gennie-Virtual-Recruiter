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
            // Channel: web or phone (twilio)
            $table->enum('channel', ['web', 'phone'])->default('web')->after('status');

            // Twilio Call SID (e.g., CAxxxxxxx...)
            $table->string('call_sid', 34)->nullable()->after('channel');

            // All Twilio call metadata (duration, recording URL, etc.)
            $table->jsonb('twilio_data')->nullable()->after('call_sid');
        });

        // Add index for call_sid lookups (used by Twilio callbacks)
        Schema::table('interview_sessions', function (Blueprint $table) {
            $table->index('call_sid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('interview_sessions', function (Blueprint $table) {
            $table->dropIndex(['call_sid']);
            $table->dropColumn(['channel', 'call_sid', 'twilio_data']);
        });
    }
};
