<?php

namespace App\Enums;

enum RouteStatus: string
{
    case Draft = 'draft';
    case Generated = 'generated';
    case Active = 'active';
    case Completed = 'completed';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Generated => 'Generated',
            self::Active => 'Active',
            self::Completed => 'Completed',
            self::Archived => 'Archived',
        };
    }

    public function labelTr(): string
    {
        return match ($this) {
            self::Draft => 'Taslak',
            self::Generated => 'Oluşturuldu',
            self::Active => 'Aktif',
            self::Completed => 'Tamamlandı',
            self::Archived => 'Arşivlendi',
        };
    }

    public static function default(): self
    {
        return self::Draft;
    }
}
