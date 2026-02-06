<?php

namespace App\Models;

use App\Enums\StopType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RouteStop extends Model
{
    protected $fillable = [
        'route_id',
        'order_index',
        'place_id',
        'place_name',
        'place_address',
        'lat',
        'lng',
        'stop_type',
        'experience_card_id',
        'relevance_score',
        'estimated_duration_minutes',
        'is_skipped',
    ];

    protected $casts = [
        'order_index' => 'integer',
        'lat' => 'float',
        'lng' => 'float',
        'stop_type' => StopType::class,
        'relevance_score' => 'float',
        'estimated_duration_minutes' => 'integer',
        'is_skipped' => 'boolean',
    ];

    protected $appends = [
        'orderIndex',
        'placeId',
        'placeName',
        'placeAddress',
        'stopType',
        'experienceCardId',
        'relevanceScore',
        'estimatedDurationMinutes',
        'isSkipped',
    ];

    /**
     * The route this stop belongs to.
     */
    public function route(): BelongsTo
    {
        return $this->belongsTo(Route::class);
    }

    /**
     * The experience card associated with this stop.
     */
    public function experienceCard(): BelongsTo
    {
        return $this->belongsTo(ExperienceCard::class);
    }

    /**
     * Scope to get only non-skipped stops.
     */
    public function scopeActive($query)
    {
        return $query->where('is_skipped', false);
    }

    /**
     * Scope to get only suggested stops.
     */
    public function scopeSuggested($query)
    {
        return $query->where('stop_type', StopType::Suggested->value);
    }

    // Accessors for camelCase (frontend compatibility)

    public function getOrderIndexAttribute(): int
    {
        return (int) $this->attributes['order_index'];
    }

    public function getPlaceIdAttribute(): string
    {
        return $this->attributes['place_id'];
    }

    public function getPlaceNameAttribute(): string
    {
        return $this->attributes['place_name'];
    }

    public function getPlaceAddressAttribute(): string
    {
        return $this->attributes['place_address'];
    }

    public function getStopTypeAttribute(): string
    {
        return $this->attributes['stop_type'];
    }

    public function getExperienceCardIdAttribute(): ?int
    {
        return isset($this->attributes['experience_card_id'])
            ? (int) $this->attributes['experience_card_id']
            : null;
    }

    public function getRelevanceScoreAttribute(): ?float
    {
        return isset($this->attributes['relevance_score'])
            ? (float) $this->attributes['relevance_score']
            : null;
    }

    public function getEstimatedDurationMinutesAttribute(): ?int
    {
        return isset($this->attributes['estimated_duration_minutes'])
            ? (int) $this->attributes['estimated_duration_minutes']
            : null;
    }

    public function getIsSkippedAttribute(): bool
    {
        return (bool) ($this->attributes['is_skipped'] ?? false);
    }
}
