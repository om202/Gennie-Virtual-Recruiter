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
        // Fallback: Using text column to store JSON embeddings
        // This avoids needing 'pgvector' extension installed on the system.
        Schema::create('knowledge_bases', function (Blueprint $table) {
            $table->id();
            $table->text('content');
            $table->jsonb('metadata')->nullable();
            $table->text('embedding')->nullable(); // Storing JSON array of floats
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('knowledge_bases');
    }
};
