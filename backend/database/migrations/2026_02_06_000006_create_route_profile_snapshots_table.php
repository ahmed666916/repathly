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
        Schema::create('route_profile_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('route_id')->unique()->constrained()->cascadeOnDelete();
            $table->enum('travel_style', ['fast', 'balanced', 'experience_first']);
            $table->enum('detour_tolerance', ['low', 'medium', 'high']);
            $table->enum('budget_sensitivity', ['budget', 'moderate', 'premium', 'any']);
            $table->enum('group_type', ['solo', 'couple', 'friends', 'family']);
            $table->enum('stop_intensity', ['minimal', 'moderate', 'frequent']);
            $table->json('experience_weights'); // {"card_id": weight, ...}
            $table->timestamp('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('route_profile_snapshots');
    }
};
