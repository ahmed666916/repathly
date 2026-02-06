<?php

namespace App\Http\Requests\Profile;

use App\Models\UserExperienceCardWeight;
use Illuminate\Foundation\Http\FormRequest;

class UpdateExperienceWeightsRequest extends FormRequest
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
        $minWeight = UserExperienceCardWeight::MIN_WEIGHT;
        $maxWeight = UserExperienceCardWeight::MAX_WEIGHT;

        return [
            'weights' => ['required', 'array', 'min:1'],
            'weights.*.cardId' => ['required', 'integer', 'exists:experience_cards,id'],
            'weights.*.weight' => ['required', 'integer', "min:{$minWeight}", "max:{$maxWeight}"],
        ];
    }

    /**
     * Get custom messages for validation errors.
     */
    public function messages(): array
    {
        $minWeight = UserExperienceCardWeight::MIN_WEIGHT;
        $maxWeight = UserExperienceCardWeight::MAX_WEIGHT;

        return [
            'weights.required' => 'Ağırlık listesi gereklidir.',
            'weights.array' => 'Ağırlıklar bir dizi olmalıdır.',
            'weights.min' => 'En az bir ağırlık belirtmelisiniz.',
            'weights.*.cardId.required' => 'Deneyim kartı ID\'si gereklidir.',
            'weights.*.cardId.integer' => 'Deneyim kartı ID\'si bir tamsayı olmalıdır.',
            'weights.*.cardId.exists' => 'Deneyim kartı bulunamadı.',
            'weights.*.weight.required' => 'Ağırlık değeri gereklidir.',
            'weights.*.weight.integer' => 'Ağırlık değeri bir tamsayı olmalıdır.',
            'weights.*.weight.min' => "Ağırlık değeri en az {$minWeight} olmalıdır.",
            'weights.*.weight.max' => "Ağırlık değeri en fazla {$maxWeight} olmalıdır.",
        ];
    }
}
