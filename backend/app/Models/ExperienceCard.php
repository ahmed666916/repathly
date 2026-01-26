<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ExperienceCard extends Model
{
    protected $fillable = [
        'slug',
        'name_en',
        'name_tr',
        'description_en',
        'description_tr',
        'icon',
        'category',
        'priority',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'priority' => 'integer',
    ];

    protected $appends = [
        'nameEn',
        'nameTr',
        'descriptionEn',
        'descriptionTr',
        'isActive',
    ];

    /**
     * Users who have selected this experience card
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_experience_cards')
            ->withTimestamps();
    }

    /**
     * Scope to get only active cards
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to order by priority
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('priority', 'desc')->orderBy('name_en');
    }

    // Accessors for camelCase (frontend compatibility)

    public function getNameEnAttribute(): string
    {
        return $this->attributes['name_en'];
    }

    public function getNameTrAttribute(): string
    {
        return $this->attributes['name_tr'];
    }

    public function getDescriptionEnAttribute(): ?string
    {
        return $this->attributes['description_en'] ?? null;
    }

    public function getDescriptionTrAttribute(): ?string
    {
        return $this->attributes['description_tr'] ?? null;
    }

    public function getIsActiveAttribute(): bool
    {
        return (bool) $this->attributes['is_active'];
    }
}
