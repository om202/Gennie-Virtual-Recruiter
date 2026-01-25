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
        Schema::table('users', function (Blueprint $table) {
            // Company Settings
            $table->string('company_logo')->nullable();
            $table->text('company_description')->nullable();
            $table->string('company_industry')->nullable();
            $table->string('company_website')->nullable();

            // Interview Preferences
            $table->string('default_voice_id')->nullable();
            $table->integer('default_interview_duration')->default(30); // minutes
            $table->text('default_greeting_message')->nullable();
            $table->string('timezone')->default('America/New_York');

            // Notification Settings
            $table->boolean('notify_interview_completed')->default(true);
            $table->boolean('notify_high_score')->default(true);
            $table->integer('high_score_threshold')->default(80);
            $table->string('notification_frequency')->default('instant'); // instant, daily, weekly
            $table->boolean('notify_scheduled_reminders')->default(true);

            // Branding
            $table->string('brand_color')->default('#6366f1'); // Default primary color
            $table->text('thank_you_message')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'company_logo',
                'company_description',
                'company_industry',
                'company_website',
                'default_voice_id',
                'default_interview_duration',
                'default_greeting_message',
                'timezone',
                'notify_interview_completed',
                'notify_high_score',
                'high_score_threshold',
                'notification_frequency',
                'notify_scheduled_reminders',
                'brand_color',
                'thank_you_message',
            ]);
        });
    }
};
