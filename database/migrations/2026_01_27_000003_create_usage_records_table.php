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
        Schema::create('usage_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->uuid('interview_session_id');
            $table->decimal('minutes_used', 10, 2);
            $table->integer('cost_cents')->default(0);
            $table->string('plan_slug')->nullable(); // plan at time of usage
            $table->timestamp('recorded_at');
            $table->timestamps();

            $table->foreign('interview_session_id')
                ->references('id')
                ->on('interview_sessions')
                ->cascadeOnDelete();

            $table->index(['user_id', 'recorded_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usage_records');
    }
};
