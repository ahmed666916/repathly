<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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
        'profile_photo',
        'auth_provider',
        'is_email_verified',
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
     * Check if user has completed onboarding (selected minimum experience cards)
     */
    public function hasCompletedOnboarding(): bool
    {
        return $this->experienceCards()->count() >= 4;
    }
}
