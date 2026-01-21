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
        Schema::create('interview_logs', function (Blueprint $table) {
            $table->id();
            $table->uuid('interview_session_id');
            $table->string('speaker'); // 'agent', 'candidate', 'system'
            $table->text('message');
            $table->json('metadata')->nullable(); // For tool calls payload etc.
            $table->timestamps();

            $table->foreign('interview_session_id')->references('id')->on('interview_sessions')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interview_logs');
    }
};
