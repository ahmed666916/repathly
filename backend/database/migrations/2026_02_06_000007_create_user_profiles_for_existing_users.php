<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Create user_profiles for all existing users with default values.
     */
    public function up(): void
    {
        $existingUsers = DB::table('users')->pluck('id');

        foreach ($existingUsers as $userId) {
            // Check if profile already exists
            $exists = DB::table('user_profiles')->where('user_id', $userId)->exists();

            if (!$exists) {
                DB::table('user_profiles')->insert([
                    'user_id' => $userId,
                    'travel_style' => 'balanced',
                    'detour_tolerance' => 'medium',
                    'budget_sensitivity' => 'moderate',
                    'preferred_group_type' => 'solo',
                    'stop_intensity' => 'moderate',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This is a data migration, we don't reverse it
    }
};
