<?php

namespace App\Http\Controllers\Api;

use App\Enums\WeightSource;
use App\Http\Controllers\Controller;
use App\Models\ExperienceCard;
use App\Models\UserExperienceCardWeight;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ExperienceCardController extends Controller
{
    use ApiResponse;

    /**
     * Minimum number of experience cards required during onboarding
     */
    const MIN_CARDS_REQUIRED = 4;

    /**
     * Get all active experience cards
     */
    public function index()
    {
        $cards = ExperienceCard::active()
            ->ordered()
            ->get();

        return $this->success(
            $cards,
            'Deneyim kartlari basariyla getirildi'
        );
    }

    /**
     * Get experience cards grouped by category
     */
    public function grouped()
    {
        $cards = ExperienceCard::active()
            ->ordered()
            ->get()
            ->groupBy('category');

        $grouped = [
            'food_dining' => [
                'title_en' => 'Food & Dining',
                'title_tr' => 'Yeme & Icme',
                'cards' => $cards->get('food_dining', collect())->values(),
            ],
            'activities' => [
                'title_en' => 'Activities & Experiences',
                'title_tr' => 'Aktiviteler & Deneyimler',
                'cards' => $cards->get('activities', collect())->values(),
            ],
            'lifestyle' => [
                'title_en' => 'Lifestyle',
                'title_tr' => 'Yasam Tarzi',
                'cards' => $cards->get('lifestyle', collect())->values(),
            ],
            'special_interest' => [
                'title_en' => 'Special Interest',
                'title_tr' => 'Ozel Ilgi Alanlari',
                'cards' => $cards->get('special_interest', collect())->values(),
            ],
        ];

        return $this->success(
            $grouped,
            'Deneyim kartlari kategorilere gore basariyla getirildi'
        );
    }

    /**
     * Get user's selected experience cards with weights
     */
    public function getUserCards()
    {
        $user = Auth::user();
        $weights = $user->experienceCardWeights()
            ->with('experienceCard')
            ->get();

        $cards = $weights->map(function ($weight) {
            $card = $weight->experienceCard;
            return [
                'id' => $card->id,
                'slug' => $card->slug,
                'nameEn' => $card->name_en,
                'nameTr' => $card->name_tr,
                'descriptionEn' => $card->description_en,
                'descriptionTr' => $card->description_tr,
                'icon' => $card->icon,
                'category' => $card->category,
                'weight' => $weight->weight,
                'source' => $weight->source->value,
            ];
        });

        return $this->success(
            [
                'cards' => $cards,
                'count' => $cards->count(),
                'hasCompletedOnboarding' => $cards->count() >= self::MIN_CARDS_REQUIRED,
            ],
            'Kullanici deneyim kartlari basariyla getirildi'
        );
    }

    /**
     * Save user's experience card selections (for onboarding)
     * Creates weighted preferences with default weight of 3
     */
    public function saveUserCards(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'card_ids' => 'required|array|min:' . self::MIN_CARDS_REQUIRED,
            'card_ids.*' => 'exists:experience_cards,id',
        ], [
            'card_ids.required' => 'Deneyim kartlari secimi zorunludur',
            'card_ids.array' => 'Deneyim kartlari dizi formatinda olmalidir',
            'card_ids.min' => 'En az ' . self::MIN_CARDS_REQUIRED . ' deneyim karti secmelisiniz',
            'card_ids.*.exists' => 'Gecersiz deneyim karti secimi',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 422);
        }

        $user = Auth::user();

        // Delete existing weights and create new ones with default weight
        $user->experienceCardWeights()->delete();

        foreach ($request->card_ids as $cardId) {
            UserExperienceCardWeight::create([
                'user_id' => $user->id,
                'experience_card_id' => $cardId,
                'weight' => UserExperienceCardWeight::DEFAULT_WEIGHT,
                'source' => WeightSource::Onboarding,
            ]);
        }

        // Also sync to the old pivot table for backwards compatibility
        $user->experienceCards()->sync($request->card_ids);

        $count = $user->experienceCardWeights()->count();

        return $this->success(
            [
                'count' => $count,
                'hasCompletedOnboarding' => true,
            ],
            'Deneyim kartlari basariyla kaydedildi'
        );
    }

    /**
     * Update user's experience card selections
     * Preserves existing weights for cards that remain selected
     */
    public function updateUserCards(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'card_ids' => 'required|array|min:' . self::MIN_CARDS_REQUIRED,
            'card_ids.*' => 'exists:experience_cards,id',
        ], [
            'card_ids.required' => 'Deneyim kartlari secimi zorunludur',
            'card_ids.array' => 'Deneyim kartlari dizi formatinda olmalidir',
            'card_ids.min' => 'En az ' . self::MIN_CARDS_REQUIRED . ' deneyim karti secmelisiniz',
            'card_ids.*.exists' => 'Gecersiz deneyim karti secimi',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 422);
        }

        $user = Auth::user();
        $newCardIds = collect($request->card_ids);

        // Get current weights
        $existingWeights = $user->experienceCardWeights()
            ->pluck('weight', 'experience_card_id');

        // Remove cards that are no longer selected
        $user->experienceCardWeights()
            ->whereNotIn('experience_card_id', $newCardIds)
            ->delete();

        // Add or update weights for selected cards
        foreach ($newCardIds as $cardId) {
            UserExperienceCardWeight::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'experience_card_id' => $cardId,
                ],
                [
                    'weight' => $existingWeights->get($cardId, UserExperienceCardWeight::DEFAULT_WEIGHT),
                    'source' => WeightSource::Manual,
                ]
            );
        }

        // Sync to old pivot table for backwards compatibility
        $user->experienceCards()->sync($request->card_ids);

        $count = $user->experienceCardWeights()->count();

        return $this->success(
            [
                'count' => $count,
            ],
            'Deneyim kartlari basariyla guncellendi'
        );
    }

    /**
     * Add a single card to user's selections with default weight
     */
    public function addCard(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'card_id' => 'required|exists:experience_cards,id',
            'weight' => 'nullable|integer|min:' . UserExperienceCardWeight::MIN_WEIGHT . '|max:' . UserExperienceCardWeight::MAX_WEIGHT,
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 422);
        }

        $user = Auth::user();

        // Check if already selected
        if ($user->experienceCardWeights()->where('experience_card_id', $request->card_id)->exists()) {
            return $this->error('Bu deneyim karti zaten secili', 409);
        }

        $weight = $request->weight ?? UserExperienceCardWeight::DEFAULT_WEIGHT;

        UserExperienceCardWeight::create([
            'user_id' => $user->id,
            'experience_card_id' => $request->card_id,
            'weight' => $weight,
            'source' => WeightSource::Manual,
        ]);

        // Also add to old pivot table for backwards compatibility
        $user->experienceCards()->attach($request->card_id);

        return $this->success(
            [
                'count' => $user->experienceCardWeights()->count(),
                'weight' => $weight,
            ],
            'Deneyim karti basariyla eklendi'
        );
    }

    /**
     * Remove a single card from user's selections
     */
    public function removeCard(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'card_id' => 'required|exists:experience_cards,id',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 422);
        }

        $user = Auth::user();
        $currentCount = $user->experienceCardWeights()->count();

        // Prevent removing if it would go below minimum
        if ($currentCount <= self::MIN_CARDS_REQUIRED) {
            return $this->error(
                'En az ' . self::MIN_CARDS_REQUIRED . ' deneyim karti secili olmalidir',
                422
            );
        }

        $user->experienceCardWeights()->where('experience_card_id', $request->card_id)->delete();

        // Also remove from old pivot table for backwards compatibility
        $user->experienceCards()->detach($request->card_id);

        return $this->success(
            ['count' => $user->experienceCardWeights()->count()],
            'Deneyim karti basariyla kaldirildi'
        );
    }

    /**
     * Check if user has completed onboarding (selected minimum cards)
     */
    public function checkOnboardingStatus()
    {
        $user = Auth::user();
        $count = $user->experienceCardWeights()->count();

        return $this->success(
            [
                'hasCompletedOnboarding' => $count >= self::MIN_CARDS_REQUIRED,
                'selectedCount' => $count,
                'minimumRequired' => self::MIN_CARDS_REQUIRED,
            ],
            'Onboarding durumu kontrol edildi'
        );
    }
}
