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
            // For scheduled downgrades - plan takes effect at next period
            $table->unsignedBigInteger('scheduled_plan_id')->nullable()->after('subscription_plan_id');
            $table->foreign('scheduled_plan_id')->references('id')->on('subscription_plans')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['scheduled_plan_id']);
            $table->dropColumn('scheduled_plan_id');
        });
    }
};
