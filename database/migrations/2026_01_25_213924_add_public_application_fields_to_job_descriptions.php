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
            $table->string('public_token', 32)->nullable()->unique()->after('benefits');
            $table->boolean('public_link_enabled')->default(false)->after('public_token');
            $table->timestamp('application_deadline')->nullable()->after('public_link_enabled');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_descriptions', function (Blueprint $table) {
            $table->dropColumn(['public_token', 'public_link_enabled', 'application_deadline']);
        });
    }
};
