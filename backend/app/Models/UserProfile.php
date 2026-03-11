<?php

namespace App\Models;

use App\Enums\BudgetSensitivity;
use App\Enums\DetourTolerance;
use App\Enums\GroupType;
use App\Enums\StopIntensity;
use App\Enums\TravelStyle;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProfile extends Model
{
    protected $fillable = [
        'user_id',
        'travel_style',
        'detour_tolerance',
        'budget_sensitivity',
        'preferred_group_type',
        'stop_intensity',
        'has_completed_taste_dna',
    ];

    protected $casts = [
        'travel_style' => TravelStyle::class,
        'detour_tolerance' => DetourTolerance::class,
        'budget_sensitivity' => BudgetSensitivity::class,
        'preferred_group_type' => GroupType::class,
        'stop_intensity' => StopIntensity::class,
        'has_completed_taste_dna' => 'boolean',
    ];

    /**
     * The user this profile belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Create a default profile for a user.
     */
    public static function createDefault(int $userId): self
    {
        return self::create([
            'user_id' => $userId,
            'travel_style' => TravelStyle::default()->value,
            'detour_tolerance' => DetourTolerance::default()->value,
            'budget_sensitivity' => BudgetSensitivity::default()->value,
            'preferred_group_type' => GroupType::default()->value,
            'stop_intensity' => StopIntensity::default()->value,
        ]);
    }
}
