<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Migrate existing card selections from user_experience_cards to user_experience_card_weights.
     * Sets default weight of 3 (neutral positive) for all existing selections.
     */
    public function up(): void
    {
        // Check if old table exists
        if (!DB::getSchemaBuilder()->hasTable('user_experience_cards')) {
            return;
        }

        // Migrate existing selections with default weight
        $existingSelections = DB::table('user_experience_cards')->get();

        foreach ($existingSelections as $selection) {
            DB::table('user_experience_card_weights')->insertOrIgnore([
                'user_id' => $selection->user_id,
                'experience_card_id' => $selection->experience_card_id,
                'weight' => 3,
                'source' => 'onboarding',
                'created_at' => $selection->created_at ?? now(),
                'updated_at' => $selection->updated_at ?? now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This is a data migration, we don't reverse it
        // The data in user_experience_card_weights will remain
    }
};
