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
        Schema::create('route_stops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('route_id')->constrained()->cascadeOnDelete();
            $table->integer('order_index')->unsigned();
            $table->string('place_id'); // Google Places ID
            $table->string('place_name');
            $table->string('place_address');
            $table->decimal('lat', 10, 7);
            $table->decimal('lng', 10, 7);
            $table->enum('stop_type', ['waypoint', 'suggested', 'user_added'])->default('waypoint');
            $table->foreignId('experience_card_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('relevance_score', 5, 4)->nullable();
            $table->integer('estimated_duration_minutes')->nullable()->unsigned();
            $table->boolean('is_skipped')->default(false);
            $table->timestamps();

            $table->index(['route_id', 'order_index']);
            $table->index(['route_id', 'stop_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('route_stops');
    }
};
