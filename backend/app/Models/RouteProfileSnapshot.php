<?php

namespace App\Models;

use App\Enums\BudgetSensitivity;
use App\Enums\DetourTolerance;
use App\Enums\GroupType;
use App\Enums\StopIntensity;
use App\Enums\TravelStyle;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RouteProfileSnapshot extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'route_id',
        'travel_style',
        'detour_tolerance',
        'budget_sensitivity',
        'group_type',
        'stop_intensity',
        'experience_weights',
        'created_at',
    ];

    protected $casts = [
        'travel_style' => TravelStyle::class,
        'detour_tolerance' => DetourTolerance::class,
        'budget_sensitivity' => BudgetSensitivity::class,
        'group_type' => GroupType::class,
        'stop_intensity' => StopIntensity::class,
        'experience_weights' => 'array',
        'created_at' => 'datetime',
    ];

    protected $appends = [
        'travelStyle',
        'detourTolerance',
        'budgetSensitivity',
        'groupType',
        'stopIntensity',
        'experienceWeights',
    ];

    /**
     * The route this snapshot belongs to.
     */
    public function route(): BelongsTo
    {
        return $this->belongsTo(Route::class);
    }

    /**
     * Create a snapshot from a user's current profile and experience weights.
     */
    public static function createFromUser(int $routeId, User $user): self
    {
        $profile = $user->profile;

        // Get experience weights as {card_id: weight} array
        $weights = $user->experienceCardWeights()
            ->pluck('weight', 'experience_card_id')
            ->toArray();

        return self::create([
            'route_id' => $routeId,
            'travel_style' => $profile?->travel_style ?? TravelStyle::default()->value,
            'detour_tolerance' => $profile?->detour_tolerance ?? DetourTolerance::default()->value,
            'budget_sensitivity' => $profile?->budget_sensitivity ?? BudgetSensitivity::default()->value,
            'group_type' => $profile?->preferred_group_type ?? GroupType::default()->value,
            'stop_intensity' => $profile?->stop_intensity ?? StopIntensity::default()->value,
            'experience_weights' => $weights,
            'created_at' => now(),
        ]);
    }

    // Accessors for camelCase (frontend compatibility)

    public function getTravelStyleAttribute(): string
    {
        return $this->attributes['travel_style'];
    }

    public function getDetourToleranceAttribute(): string
    {
        return $this->attributes['detour_tolerance'];
    }

    public function getBudgetSensitivityAttribute(): string
    {
        return $this->attributes['budget_sensitivity'];
    }

    public function getGroupTypeAttribute(): string
    {
        return $this->attributes['group_type'];
    }

    public function getStopIntensityAttribute(): string
    {
        return $this->attributes['stop_intensity'];
    }

    public function getExperienceWeightsAttribute(): array
    {
        $value = $this->attributes['experience_weights'] ?? '{}';
        return is_string($value) ? json_decode($value, true) : $value;
    }
}
