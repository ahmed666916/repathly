<?php

namespace App\Enums;

enum StopIntensity: string
{
    case Minimal = 'minimal';
    case Moderate = 'moderate';
    case Frequent = 'frequent';

    public function label(): string
    {
        return match ($this) {
            self::Minimal => 'Minimal',
            self::Moderate => 'Moderate',
            self::Frequent => 'Frequent',
        };
    }

    public function labelTr(): string
    {
        return match ($this) {
            self::Minimal => 'Minimum',
            self::Moderate => 'Orta',
            self::Frequent => 'Sık',
        };
    }

    /**
     * Get the maximum number of suggested stops per hour.
     */
    public function stopsPerHour(): float
    {
        return match ($this) {
            self::Minimal => 0.5,
            self::Moderate => 1.0,
            self::Frequent => 2.0,
        };
    }

    public static function default(): self
    {
        return self::Moderate;
    }
}
