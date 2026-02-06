<?php

namespace App\Http\Requests\Profile;

use App\Enums\BudgetSensitivity;
use App\Enums\DetourTolerance;
use App\Enums\GroupType;
use App\Enums\StopIntensity;
use App\Enums\TravelStyle;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
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
            'travelStyle' => ['sometimes', Rule::enum(TravelStyle::class)],
            'detourTolerance' => ['sometimes', Rule::enum(DetourTolerance::class)],
            'budgetSensitivity' => ['sometimes', Rule::enum(BudgetSensitivity::class)],
            'preferredGroupType' => ['sometimes', Rule::enum(GroupType::class)],
            'stopIntensity' => ['sometimes', Rule::enum(StopIntensity::class)],
        ];
    }

    /**
     * Get custom messages for validation errors.
     */
    public function messages(): array
    {
        return [
            'travelStyle.Illuminate\Validation\Rules\Enum' => 'Geçersiz seyahat stili.',
            'detourTolerance.Illuminate\Validation\Rules\Enum' => 'Geçersiz sapma toleransı.',
            'budgetSensitivity.Illuminate\Validation\Rules\Enum' => 'Geçersiz bütçe hassasiyeti.',
            'preferredGroupType.Illuminate\Validation\Rules\Enum' => 'Geçersiz grup tipi.',
            'stopIntensity.Illuminate\Validation\Rules\Enum' => 'Geçersiz durak yoğunluğu.',
        ];
    }
}
