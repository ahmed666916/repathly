<?php

namespace App\Enums;

enum TravelStyle: string
{
    case Fast = 'fast';
    case Balanced = 'balanced';
    case ExperienceFirst = 'experience_first';

    public function label(): string
    {
        return match ($this) {
            self::Fast => 'Fast',
            self::Balanced => 'Balanced',
            self::ExperienceFirst => 'Experience First',
        };
    }

    public function labelTr(): string
    {
        return match ($this) {
            self::Fast => 'Hızlı',
            self::Balanced => 'Dengeli',
            self::ExperienceFirst => 'Deneyim Odaklı',
        };
    }

    public static function default(): self
    {
        return self::Balanced;
    }
}
