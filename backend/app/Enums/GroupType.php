<?php

namespace App\Enums;

enum GroupType: string
{
    case Solo = 'solo';
    case Couple = 'couple';
    case Friends = 'friends';
    case Family = 'family';

    public function label(): string
    {
        return match ($this) {
            self::Solo => 'Solo',
            self::Couple => 'Couple',
            self::Friends => 'Friends',
            self::Family => 'Family',
        };
    }

    public function labelTr(): string
    {
        return match ($this) {
            self::Solo => 'Tek Başına',
            self::Couple => 'Çift',
            self::Friends => 'Arkadaşlar',
            self::Family => 'Aile',
        };
    }

    public static function default(): self
    {
        return self::Solo;
    }
}
