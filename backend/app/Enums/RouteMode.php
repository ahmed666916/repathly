<?php

namespace App\Enums;

enum RouteMode: string
{
    case PassThrough = 'pass_through';
    case Casual = 'casual';
    case Flexible = 'flexible';

    public function label(): string
    {
        return match ($this) {
            self::PassThrough => 'Pass Through',
            self::Casual => 'Casual',
            self::Flexible => 'Flexible',
        };
    }

    public function labelTr(): string
    {
        return match ($this) {
            self::PassThrough => 'Hızlı Geçiş',
            self::Casual => 'Rahat',
            self::Flexible => 'Esnek',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::PassThrough => 'Time-first, minimal detours, experiences only if very close',
            self::Casual => 'Balanced route with moderate detours and experience diversity',
            self::Flexible => 'Experience-first, destination is secondary, time is soft constraint',
        };
    }

    public function descriptionTr(): string
    {
        return match ($this) {
            self::PassThrough => 'Zaman öncelikli, minimum sapmalar, sadece çok yakın deneyimler',
            self::Casual => 'Dengeli rota, orta sapmalar ve deneyim çeşitliliği',
            self::Flexible => 'Deneyim öncelikli, varış noktası ikincil, zaman esnek',
        };
    }

    /**
     * Get the detour factor multiplier for this route mode.
     */
    public function detourFactor(): float
    {
        return match ($this) {
            self::PassThrough => 0.1,
            self::Casual => 0.5,
            self::Flexible => 1.0,
        };
    }

    /**
     * Get maximum acceptable detour in minutes for suggested stops.
     */
    public function maxDetourMinutes(): int
    {
        return match ($this) {
            self::PassThrough => 5,
            self::Casual => 20,
            self::Flexible => 60,
        };
    }

    public static function default(): self
    {
        return self::Casual;
    }
}
