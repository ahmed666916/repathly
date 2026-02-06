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
        Schema::create('routes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->uuid('uuid')->unique();
            $table->string('name')->nullable();

            // Origin
            $table->string('origin_address');
            $table->decimal('origin_lat', 10, 7);
            $table->decimal('origin_lng', 10, 7);

            // Destination
            $table->string('destination_address');
            $table->decimal('destination_lat', 10, 7);
            $table->decimal('destination_lng', 10, 7);

            // Route settings
            $table->enum('route_mode', ['pass_through', 'casual', 'flexible'])->default('casual');
            $table->dateTime('departure_time')->nullable();
            $table->integer('max_duration_minutes')->nullable()->unsigned();
            $table->enum('stop_intensity_override', ['minimal', 'moderate', 'frequent'])->nullable();
            $table->enum('detour_tolerance_override', ['low', 'medium', 'high'])->nullable();

            // Status
            $table->boolean('is_saved')->default(false);
            $table->enum('status', ['draft', 'generated', 'active', 'completed', 'archived'])->default('draft');

            // Computed data
            $table->integer('total_distance_meters')->nullable()->unsigned();
            $table->integer('total_duration_minutes')->nullable()->unsigned();
            $table->timestamp('generated_at')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'is_saved']);
            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('routes');
    }
};
