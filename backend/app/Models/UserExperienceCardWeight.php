<?php

namespace App\Models;

use App\Enums\WeightSource;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserExperienceCardWeight extends Model
{
    protected $fillable = [
        'user_id',
        'experience_card_id',
        'weight',
        'source',
    ];

    protected $casts = [
        'weight' => 'integer',
        'source' => WeightSource::class,
    ];

    protected $appends = [
        'experienceCardId',
    ];

    /**
     * Weight scale constants.
     */
    public const MIN_WEIGHT = 1;
    public const MAX_WEIGHT = 5;
    public const DEFAULT_WEIGHT = 3;

    /**
     * Weight multipliers for scoring.
     */
    public const WEIGHT_MULTIPLIERS = [
        1 => 0.25,  // Rarely interested
        2 => 0.5,   // Occasionally
        3 => 1.0,   // Neutral positive
        4 => 1.5,   // Often interested
        5 => 2.0,   // Always interested
    ];

    /**
     * The user who set this weight.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The experience card this weight is for.
     */
    public function experienceCard(): BelongsTo
    {
        return $this->belongsTo(ExperienceCard::class);
    }

    // Accessors for camelCase (frontend compatibility)

    public function getExperienceCardIdAttribute(): int
    {
        return (int) $this->attributes['experience_card_id'];
    }

    /**
     * Get the scoring multiplier for this weight.
     */
    public function getMultiplier(): float
    {
        return self::WEIGHT_MULTIPLIERS[$this->weight] ?? 1.0;
    }

    /**
     * Check if weight is within valid range.
     */
    public static function isValidWeight(int $weight): bool
    {
        return $weight >= self::MIN_WEIGHT && $weight <= self::MAX_WEIGHT;
    }
}
