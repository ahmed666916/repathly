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
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->enum('travel_style', ['fast', 'balanced', 'experience_first'])->default('balanced');
            $table->enum('detour_tolerance', ['low', 'medium', 'high'])->default('medium');
            $table->enum('budget_sensitivity', ['budget', 'moderate', 'premium', 'any'])->default('moderate');
            $table->enum('preferred_group_type', ['solo', 'couple', 'friends', 'family'])->default('solo');
            $table->enum('stop_intensity', ['minimal', 'moderate', 'frequent'])->default('moderate');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};
