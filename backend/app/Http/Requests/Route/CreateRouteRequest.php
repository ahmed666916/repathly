<?php

namespace App\Http\Requests\Route;

use App\Enums\DetourTolerance;
use App\Enums\RouteMode;
use App\Enums\StopIntensity;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateRouteRequest extends FormRequest
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
            'name' => ['nullable', 'string', 'max:255'],

            // Origin
            'originAddress' => ['required', 'string', 'max:500'],
            'originLat' => ['required', 'numeric', 'between:-90,90'],
            'originLng' => ['required', 'numeric', 'between:-180,180'],

            // Destination
            'destinationAddress' => ['required', 'string', 'max:500'],
            'destinationLat' => ['required', 'numeric', 'between:-90,90'],
            'destinationLng' => ['required', 'numeric', 'between:-180,180'],

            // Route settings
            'routeMode' => ['required', Rule::enum(RouteMode::class)],
            'departureTime' => ['nullable', 'date'],
            'maxDurationMinutes' => ['nullable', 'integer', 'min:15', 'max:1440'],
            'stopIntensityOverride' => ['nullable', Rule::enum(StopIntensity::class)],
            'detourToleranceOverride' => ['nullable', Rule::enum(DetourTolerance::class)],

            // Waypoints (optional, for user-added intermediate stops)
            'waypoints' => ['nullable', 'array', 'max:10'],
            'waypoints.*.placeId' => ['required', 'string'],
            'waypoints.*.placeName' => ['required', 'string', 'max:255'],
            'waypoints.*.placeAddress' => ['required', 'string', 'max:500'],
            'waypoints.*.lat' => ['required', 'numeric', 'between:-90,90'],
            'waypoints.*.lng' => ['required', 'numeric', 'between:-180,180'],

            // Whether to save the route
            'save' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Get custom messages for validation errors.
     */
    public function messages(): array
    {
        return [
            'originAddress.required' => 'Başlangıç adresi gereklidir.',
            'originLat.required' => 'Başlangıç enlemi gereklidir.',
            'originLat.numeric' => 'Başlangıç enlemi sayısal olmalıdır.',
            'originLat.between' => 'Başlangıç enlemi -90 ile 90 arasında olmalıdır.',
            'originLng.required' => 'Başlangıç boylamı gereklidir.',
            'originLng.numeric' => 'Başlangıç boylamı sayısal olmalıdır.',
            'originLng.between' => 'Başlangıç boylamı -180 ile 180 arasında olmalıdır.',
            'destinationAddress.required' => 'Varış adresi gereklidir.',
            'destinationLat.required' => 'Varış enlemi gereklidir.',
            'destinationLat.numeric' => 'Varış enlemi sayısal olmalıdır.',
            'destinationLat.between' => 'Varış enlemi -90 ile 90 arasında olmalıdır.',
            'destinationLng.required' => 'Varış boylamı gereklidir.',
            'destinationLng.numeric' => 'Varış boylamı sayısal olmalıdır.',
            'destinationLng.between' => 'Varış boylamı -180 ile 180 arasında olmalıdır.',
            'routeMode.required' => 'Rota modu gereklidir.',
            'routeMode.Illuminate\Validation\Rules\Enum' => 'Geçersiz rota modu.',
            'departureTime.date' => 'Kalkış zamanı geçerli bir tarih olmalıdır.',
            'maxDurationMinutes.integer' => 'Maksimum süre bir tamsayı olmalıdır.',
            'maxDurationMinutes.min' => 'Maksimum süre en az 15 dakika olmalıdır.',
            'maxDurationMinutes.max' => 'Maksimum süre en fazla 1440 dakika (24 saat) olmalıdır.',
            'stopIntensityOverride.Illuminate\Validation\Rules\Enum' => 'Geçersiz durak yoğunluğu.',
            'detourToleranceOverride.Illuminate\Validation\Rules\Enum' => 'Geçersiz sapma toleransı.',
            'waypoints.array' => 'Ara noktalar bir dizi olmalıdır.',
            'waypoints.max' => 'En fazla 10 ara nokta eklenebilir.',
        ];
    }
}
