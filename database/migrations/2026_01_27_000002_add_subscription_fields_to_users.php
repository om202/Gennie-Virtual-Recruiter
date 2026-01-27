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
            $table->foreignId('subscription_plan_id')->nullable()->constrained('subscription_plans')->nullOnDelete();
            $table->timestamp('subscription_started_at')->nullable();
            $table->timestamp('subscription_ends_at')->nullable();
            $table->decimal('minutes_used_this_period', 10, 2)->default(0);
            $table->timestamp('period_started_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['subscription_plan_id']);
            $table->dropColumn([
                'subscription_plan_id',
                'subscription_started_at',
                'subscription_ends_at',
                'minutes_used_this_period',
                'period_started_at',
            ]);
        });
    }
};
