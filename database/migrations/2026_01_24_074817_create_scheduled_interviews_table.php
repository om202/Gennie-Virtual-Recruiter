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
        Schema::create('scheduled_interviews', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('interview_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('candidate_id')->constrained()->cascadeOnDelete();
            $table->dateTime('scheduled_at');
            $table->string('status')->default('scheduled'); // scheduled, completed, cancelled
            $table->string('meeting_link')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scheduled_interviews');
    }
};
