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
        Schema::table('scheduled_interviews', function (Blueprint $table) {
            $table->string('otp_code', 6)->nullable()->after('public_token');
            $table->timestamp('otp_expires_at')->nullable()->after('otp_code');
            $table->boolean('otp_verified')->default(false)->after('otp_expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('scheduled_interviews', function (Blueprint $table) {
            $table->dropColumn(['otp_code', 'otp_expires_at', 'otp_verified']);
        });
    }
};
