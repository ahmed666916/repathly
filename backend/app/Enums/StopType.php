<?php

namespace App\Enums;

enum StopType: string
{
    case Waypoint = 'waypoint';
    case Suggested = 'suggested';
    case UserAdded = 'user_added';

    public function label(): string
    {
        return match ($this) {
            self::Waypoint => 'Waypoint',
            self::Suggested => 'Suggested',
            self::UserAdded => 'User Added',
        };
    }

    public function labelTr(): string
    {
        return match ($this) {
            self::Waypoint => 'Ara Nokta',
            self::Suggested => 'Önerilen',
            self::UserAdded => 'Kullanıcı Ekledi',
        };
    }

    public static function default(): self
    {
        return self::Waypoint;
    }
}
