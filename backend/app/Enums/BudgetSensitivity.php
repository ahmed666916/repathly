<?php

namespace App\Enums;

enum BudgetSensitivity: string
{
    case Budget = 'budget';
    case Moderate = 'moderate';
    case Premium = 'premium';
    case Any = 'any';

    public function label(): string
    {
        return match ($this) {
            self::Budget => 'Budget',
            self::Moderate => 'Moderate',
            self::Premium => 'Premium',
            self::Any => 'Any',
        };
    }

    public function labelTr(): string
    {
        return match ($this) {
            self::Budget => 'Ekonomik',
            self::Moderate => 'Orta',
            self::Premium => 'Premium',
            self::Any => 'Farketmez',
        };
    }

    public static function default(): self
    {
        return self::Moderate;
    }
}
