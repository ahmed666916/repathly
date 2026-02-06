<?php

namespace App\Enums;

enum WeightSource: string
{
    case Onboarding = 'onboarding';
    case Manual = 'manual';
    case Behavioral = 'behavioral';

    public function label(): string
    {
        return match ($this) {
            self::Onboarding => 'Onboarding',
            self::Manual => 'Manual',
            self::Behavioral => 'Behavioral',
        };
    }

    public function labelTr(): string
    {
        return match ($this) {
            self::Onboarding => 'İlk Kurulum',
            self::Manual => 'Manuel',
            self::Behavioral => 'Davranışsal',
        };
    }

    public static function default(): self
    {
        return self::Manual;
    }
}
