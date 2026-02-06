<?php

namespace App\Models;

use App\Enums\DetourTolerance;
use App\Enums\RouteMode;
use App\Enums\RouteStatus;
use App\Enums\StopIntensity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Route extends Model
{
    protected $fillable = [
        'user_id',
        'uuid',
        'name',
        'origin_address',
        'origin_lat',
        'origin_lng',
        'destination_address',
        'destination_lat',
        'destination_lng',
        'route_mode',
        'departure_time',
        'max_duration_minutes',
        'stop_intensity_override',
        'detour_tolerance_override',
        'is_saved',
        'status',
        'total_distance_meters',
        'total_duration_minutes',
        'generated_at',
    ];

    protected $casts = [
        'origin_lat' => 'float',
        'origin_lng' => 'float',
        'destination_lat' => 'float',
        'destination_lng' => 'float',
        'route_mode' => RouteMode::class,
        'departure_time' => 'datetime',
        'max_duration_minutes' => 'integer',
        'stop_intensity_override' => StopIntensity::class,
        'detour_tolerance_override' => DetourTolerance::class,
        'is_saved' => 'boolean',
        'status' => RouteStatus::class,
        'total_distance_meters' => 'integer',
        'total_duration_minutes' => 'integer',
        'generated_at' => 'datetime',
    ];

    protected $appends = [
        'originLat',
        'originLng',
        'originAddress',
        'destinationLat',
        'destinationLng',
        'destinationAddress',
        'routeMode',
        'departureTime',
        'maxDurationMinutes',
        'stopIntensityOverride',
        'detourToleranceOverride',
        'isSaved',
        'totalDistanceMeters',
        'totalDurationMinutes',
        'generatedAt',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($route) {
            if (empty($route->uuid)) {
                $route->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * The user who created this route.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The stops on this route.
     */
    public function stops(): HasMany
    {
        return $this->hasMany(RouteStop::class)->orderBy('order_index');
    }

    /**
     * The profile snapshot for this route.
     */
    public function profileSnapshot(): HasOne
    {
        return $this->hasOne(RouteProfileSnapshot::class);
    }

    /**
     * Scope to get only saved routes.
     */
    public function scopeSaved($query)
    {
        return $query->where('is_saved', true);
    }

    /**
     * Scope to get routes by status.
     */
    public function scopeWithStatus($query, RouteStatus $status)
    {
        return $query->where('status', $status->value);
    }

    /**
     * Scope to exclude archived routes.
     */
    public function scopeNotArchived($query)
    {
        return $query->where('status', '!=', RouteStatus::Archived->value);
    }

    /**
     * Get effective stop intensity (override or from user profile).
     */
    public function getEffectiveStopIntensity(): StopIntensity
    {
        if ($this->stop_intensity_override) {
            return $this->stop_intensity_override;
        }

        return $this->user->profile?->stop_intensity ?? StopIntensity::default();
    }

    /**
     * Get effective detour tolerance (override or from user profile).
     */
    public function getEffectiveDetourTolerance(): DetourTolerance
    {
        if ($this->detour_tolerance_override) {
            return $this->detour_tolerance_override;
        }

        return $this->user->profile?->detour_tolerance ?? DetourTolerance::default();
    }

    // Accessors for camelCase (frontend compatibility)

    public function getOriginLatAttribute(): float
    {
        return (float) $this->attributes['origin_lat'];
    }

    public function getOriginLngAttribute(): float
    {
        return (float) $this->attributes['origin_lng'];
    }

    public function getOriginAddressAttribute(): string
    {
        return $this->attributes['origin_address'];
    }

    public function getDestinationLatAttribute(): float
    {
        return (float) $this->attributes['destination_lat'];
    }

    public function getDestinationLngAttribute(): float
    {
        return (float) $this->attributes['destination_lng'];
    }

    public function getDestinationAddressAttribute(): string
    {
        return $this->attributes['destination_address'];
    }

    public function getRouteModeAttribute(): string
    {
        return $this->attributes['route_mode'];
    }

    public function getDepartureTimeAttribute(): ?string
    {
        return $this->attributes['departure_time'] ?? null;
    }

    public function getMaxDurationMinutesAttribute(): ?int
    {
        return isset($this->attributes['max_duration_minutes'])
            ? (int) $this->attributes['max_duration_minutes']
            : null;
    }

    public function getStopIntensityOverrideAttribute(): ?string
    {
        return $this->attributes['stop_intensity_override'] ?? null;
    }

    public function getDetourToleranceOverrideAttribute(): ?string
    {
        return $this->attributes['detour_tolerance_override'] ?? null;
    }

    public function getIsSavedAttribute(): bool
    {
        return (bool) $this->attributes['is_saved'];
    }

    public function getTotalDistanceMetersAttribute(): ?int
    {
        return isset($this->attributes['total_distance_meters'])
            ? (int) $this->attributes['total_distance_meters']
            : null;
    }

    public function getTotalDurationMinutesAttribute(): ?int
    {
        return isset($this->attributes['total_duration_minutes'])
            ? (int) $this->attributes['total_duration_minutes']
            : null;
    }

    public function getGeneratedAtAttribute(): ?string
    {
        return $this->attributes['generated_at'] ?? null;
    }
}
