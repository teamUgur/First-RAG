<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {

        Schema::ensureVectorExtensionExists();

        Schema::create('document_chunks', function (Blueprint $table) {
            $table->id();
            $table->string('source');
            $table->text('chunk_text');
            $table->json('metadat')->nullable();

            $table->vector('embedding', dimensions: 1536)->vectorIndex();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_chunks');
    }
};
