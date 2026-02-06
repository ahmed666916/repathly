<?php

namespace App\Http\Requests\Route;

use App\Enums\DetourTolerance;
use App\Enums\RouteMode;
use App\Enums\RouteStatus;
use App\Enums\StopIntensity;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRouteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'routeMode' => ['sometimes', Rule::enum(RouteMode::class)],
            'departureTime' => ['sometimes', 'nullable', 'date'],
            'maxDurationMinutes' => ['sometimes', 'nullable', 'integer', 'min:15', 'max:1440'],
            'stopIntensityOverride' => ['sometimes', 'nullable', Rule::enum(StopIntensity::class)],
            'detourToleranceOverride' => ['sometimes', 'nullable', Rule::enum(DetourTolerance::class)],
            'isSaved' => ['sometimes', 'boolean'],
            'status' => ['sometimes', Rule::enum(RouteStatus::class)],
        ];
    }

    /**
     * Get custom messages for validation errors.
     */
    public function messages(): array
    {
        return [
            'name.string' => 'Rota adı metin olmalıdır.',
            'name.max' => 'Rota adı en fazla 255 karakter olabilir.',
            'routeMode.Illuminate\Validation\Rules\Enum' => 'Geçersiz rota modu.',
            'departureTime.date' => 'Kalkış zamanı geçerli bir tarih olmalıdır.',
            'maxDurationMinutes.integer' => 'Maksimum süre bir tamsayı olmalıdır.',
            'maxDurationMinutes.min' => 'Maksimum süre en az 15 dakika olmalıdır.',
            'maxDurationMinutes.max' => 'Maksimum süre en fazla 1440 dakika (24 saat) olmalıdır.',
            'stopIntensityOverride.Illuminate\Validation\Rules\Enum' => 'Geçersiz durak yoğunluğu.',
            'detourToleranceOverride.Illuminate\Validation\Rules\Enum' => 'Geçersiz sapma toleransı.',
            'isSaved.boolean' => 'Kaydetme durumu boolean olmalıdır.',
            'status.Illuminate\Validation\Rules\Enum' => 'Geçersiz rota durumu.',
        ];
    }
}
