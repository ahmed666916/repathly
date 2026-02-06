<?php

namespace App\Enums;

enum DetourTolerance: string
{
    case Low = 'low';
    case Medium = 'medium';
    case High = 'high';

    public function label(): string
    {
        return match ($this) {
            self::Low => 'Low',
            self::Medium => 'Medium',
            self::High => 'High',
        };
    }

    public function labelTr(): string
    {
        return match ($this) {
            self::Low => 'Düşük',
            self::Medium => 'Orta',
            self::High => 'Yüksek',
        };
    }

    /**
     * Get the detour factor multiplier for route scoring.
     */
    public function factor(): float
    {
        return match ($this) {
            self::Low => 0.25,
            self::Medium => 0.5,
            self::High => 1.0,
        };
    }

    public static function default(): self
    {
        return self::Medium;
    }
}
