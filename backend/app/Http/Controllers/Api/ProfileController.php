<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Requests\Profile\UpdateExperienceWeightsRequest;
use App\Models\UserExperienceCardWeight;
use App\Models\UserProfile;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    use ApiResponse;

    /**
     * Get the authenticated user's taste DNA profile.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function show(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $profile = $user->profile;

            // Create default profile if it doesn't exist
            if (!$profile) {
                $profile = UserProfile::createDefault($user->id);
            }

            return $this->success([
                'travelStyle' => $profile->travel_style->value,
                'detourTolerance' => $profile->detour_tolerance->value,
                'budgetSensitivity' => $profile->budget_sensitivity->value,
                'preferredGroupType' => $profile->preferred_group_type->value,
                'stopIntensity' => $profile->stop_intensity->value,
            ], 'Profil bilgileri alındı.');

        } catch (\Exception $e) {
            return $this->error('Profil bilgileri alınırken bir hata oluştu.', 500, $e->getMessage());
        }
    }

    /**
     * Update the authenticated user's taste DNA profile.
     *
     * @param UpdateProfileRequest $request
     * @return JsonResponse
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $profile = $user->profile;

            // Create default profile if it doesn't exist
            if (!$profile) {
                $profile = UserProfile::createDefault($user->id);
            }

            // Update only provided fields (map camelCase to snake_case)
            $mappings = [
                'travelStyle' => 'travel_style',
                'detourTolerance' => 'detour_tolerance',
                'budgetSensitivity' => 'budget_sensitivity',
                'preferredGroupType' => 'preferred_group_type',
                'stopIntensity' => 'stop_intensity',
            ];

            foreach ($mappings as $camelCase => $snakeCase) {
                if ($request->has($camelCase)) {
                    $profile->$snakeCase = $request->$camelCase;
                }
            }

            $profile->save();

            return $this->success([
                'travelStyle' => $profile->travel_style->value,
                'detourTolerance' => $profile->detour_tolerance->value,
                'budgetSensitivity' => $profile->budget_sensitivity->value,
                'preferredGroupType' => $profile->preferred_group_type->value,
                'stopIntensity' => $profile->stop_intensity->value,
            ], 'Profil güncellendi.');

        } catch (\Exception $e) {
            return $this->error('Profil güncellenirken bir hata oluştu.', 500, $e->getMessage());
        }
    }

    /**
     * Get the authenticated user's experience card weights.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getExperienceWeights(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $weights = $user->experienceCardWeights()
                ->with('experienceCard')
                ->get()
                ->map(function ($weight) {
                    return [
                        'cardId' => $weight->experience_card_id,
                        'cardSlug' => $weight->experienceCard?->slug,
                        'cardName' => $weight->experienceCard?->name_en,
                        'cardNameTr' => $weight->experienceCard?->name_tr,
                        'weight' => $weight->weight,
                        'source' => $weight->source->value,
                    ];
                });

            return $this->success([
                'weights' => $weights,
                'count' => $weights->count(),
            ], 'Deneyim ağırlıkları alındı.');

        } catch (\Exception $e) {
            return $this->error('Deneyim ağırlıkları alınırken bir hata oluştu.', 500, $e->getMessage());
        }
    }

    /**
     * Update the authenticated user's experience card weights (bulk).
     *
     * @param UpdateExperienceWeightsRequest $request
     * @return JsonResponse
     */
    public function updateExperienceWeights(UpdateExperienceWeightsRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $weights = $request->weights;

            foreach ($weights as $weightData) {
                UserExperienceCardWeight::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'experience_card_id' => $weightData['cardId'],
                    ],
                    [
                        'weight' => $weightData['weight'],
                        'source' => 'manual',
                    ]
                );
            }

            // Return updated weights
            $updatedWeights = $user->experienceCardWeights()
                ->with('experienceCard')
                ->get()
                ->map(function ($weight) {
                    return [
                        'cardId' => $weight->experience_card_id,
                        'cardSlug' => $weight->experienceCard?->slug,
                        'weight' => $weight->weight,
                        'source' => $weight->source->value,
                    ];
                });

            return $this->success([
                'weights' => $updatedWeights,
                'count' => $updatedWeights->count(),
            ], 'Deneyim ağırlıkları güncellendi.');

        } catch (\Exception $e) {
            return $this->error('Deneyim ağırlıkları güncellenirken bir hata oluştu.', 500, $e->getMessage());
        }
    }

    /**
     * Update a single experience card weight.
     *
     * @param Request $request
     * @param int $cardId
     * @return JsonResponse
     */
    public function updateSingleWeight(Request $request, int $cardId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'weight' => [
                    'required',
                    'integer',
                    'min:' . UserExperienceCardWeight::MIN_WEIGHT,
                    'max:' . UserExperienceCardWeight::MAX_WEIGHT,
                ],
            ], [
                'weight.required' => 'Ağırlık değeri gereklidir.',
                'weight.integer' => 'Ağırlık değeri bir tamsayı olmalıdır.',
                'weight.min' => 'Ağırlık değeri en az ' . UserExperienceCardWeight::MIN_WEIGHT . ' olmalıdır.',
                'weight.max' => 'Ağırlık değeri en fazla ' . UserExperienceCardWeight::MAX_WEIGHT . ' olmalıdır.',
            ]);

            if ($validator->fails()) {
                return $this->validationError($validator->errors()->toArray(), 'Doğrulama hatası.');
            }

            $user = $request->user();

            // Check if card exists
            $cardExists = \App\Models\ExperienceCard::where('id', $cardId)->exists();
            if (!$cardExists) {
                return $this->error('Deneyim kartı bulunamadı.', 404);
            }

            $weight = UserExperienceCardWeight::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'experience_card_id' => $cardId,
                ],
                [
                    'weight' => $request->weight,
                    'source' => 'manual',
                ]
            );

            return $this->success([
                'cardId' => $weight->experience_card_id,
                'weight' => $weight->weight,
                'source' => $weight->source->value,
            ], 'Deneyim ağırlığı güncellendi.');

        } catch (\Exception $e) {
            return $this->error('Deneyim ağırlığı güncellenirken bir hata oluştu.', 500, $e->getMessage());
        }
    }

    /**
     * Remove an experience card weight.
     *
     * @param Request $request
     * @param int $cardId
     * @return JsonResponse
     */
    public function removeWeight(Request $request, int $cardId): JsonResponse
    {
        try {
            $user = $request->user();

            // Check minimum cards requirement
            $currentCount = $user->experienceCardWeights()->count();
            if ($currentCount <= 4) {
                return $this->error('En az 4 deneyim kartı seçili olmalıdır.', 400);
            }

            $deleted = $user->experienceCardWeights()
                ->where('experience_card_id', $cardId)
                ->delete();

            if (!$deleted) {
                return $this->error('Deneyim kartı zaten seçili değil.', 404);
            }

            return $this->success([
                'removedCardId' => $cardId,
                'remainingCount' => $currentCount - 1,
            ], 'Deneyim kartı kaldırıldı.');

        } catch (\Exception $e) {
            return $this->error('Deneyim kartı kaldırılırken bir hata oluştu.', 500, $e->getMessage());
        }
    }
}
