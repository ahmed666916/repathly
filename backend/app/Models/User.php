<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'bio',
        'profile_photo',
        'auth_provider',
        'is_email_verified',
        'has_completed_profile',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'isEmailVerified',
        'authProvider',
        'profilePhoto',
        'hasCompletedProfile',
        'hasCompletedTasteDna',
        'hasSelectedExperiences',
        'isOnboardingCompleted',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_email_verified' => 'boolean',
            'has_completed_profile' => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    /**
     * Accessor for camelCase isEmailVerified (frontend compatibility)
     */
    public function getIsEmailVerifiedAttribute(): bool
    {
        return (bool) $this->attributes['is_email_verified'];
    }

    /**
     * Accessor for camelCase authProvider (frontend compatibility)
     */
    public function getAuthProviderAttribute(): string
    {
        return $this->attributes['auth_provider'] ?? 'email';
    }

    /**
     * Accessor for camelCase profilePhoto (frontend compatibility)
     */
    public function getProfilePhotoAttribute(): ?string
    {
        return $this->attributes['profile_photo'] ?? null;
    }

    /**
     * Experience cards selected by the user
     */
    public function experienceCards(): BelongsToMany
    {
        return $this->belongsToMany(ExperienceCard::class, 'user_experience_cards')
            ->withTimestamps();
    }

    /**
     * Accessor for hasCompletedProfile (frontend compatibility)
     */
    public function getHasCompletedProfileAttribute(): bool
    {
        return (bool) ($this->attributes['has_completed_profile'] ?? false);
    }

    /**
     * Accessor for hasCompletedTasteDna (frontend compatibility)
     * User has completed taste DNA if they have explicitly completed the taste DNA step
     */
    public function getHasCompletedTasteDnaAttribute(): bool
    {
        return (bool) ($this->profile?->has_completed_taste_dna ?? false);
    }

    /**
     * Accessor for hasSelectedExperiences (frontend compatibility)
     */
    public function getHasSelectedExperiencesAttribute(): bool
    {
        return $this->experienceCardWeights()->count() >= 4;
    }

    /**
     * Accessor for isOnboardingCompleted (frontend compatibility)
     */
    public function getIsOnboardingCompletedAttribute(): bool
    {
        return $this->hasCompletedOnboarding();
    }

    /**
     * Check if user has completed onboarding (selected minimum experience cards)
     */
    public function hasCompletedOnboarding(): bool
    {
        return $this->has_selected_experiences && $this->has_completed_profile;
    }

    /**
     * User's taste DNA profile
     */
    public function profile(): HasOne
    {
        return $this->hasOne(UserProfile::class);
    }

    /**
     * User's routes
     */
    public function routes(): HasMany
    {
        return $this->hasMany(Route::class);
    }

    /**
     * User's experience card weights (weighted preferences)
     */
    public function experienceCardWeights(): HasMany
    {
        return $this->hasMany(UserExperienceCardWeight::class);
    }

    /**
     * Get experience weights as an associative array {card_id: weight}
     */
    public function getExperienceWeightsArray(): array
    {
        return $this->experienceCardWeights()
            ->pluck('weight', 'experience_card_id')
            ->toArray();
    }
}
