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
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique(); // e.g., 'free_trial', 'starter'
            $table->string('name'); // e.g., 'Free Trial', 'Starter'
            $table->text('description')->nullable();
            $table->integer('price_monthly')->default(0); // in cents
            $table->integer('minutes_included')->default(0);
            $table->integer('overage_rate')->default(0); // cents per minute
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_plans');
    }
};
