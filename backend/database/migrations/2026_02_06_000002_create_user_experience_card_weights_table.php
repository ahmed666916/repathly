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
        Schema::create('user_experience_card_weights', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('experience_card_id')->constrained()->cascadeOnDelete();
            $table->tinyInteger('weight')->default(3)->unsigned();
            $table->enum('source', ['onboarding', 'manual', 'behavioral'])->default('manual');
            $table->timestamps();

            $table->unique(['user_id', 'experience_card_id']);
            $table->index(['user_id', 'weight']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_experience_card_weights');
    }
};
