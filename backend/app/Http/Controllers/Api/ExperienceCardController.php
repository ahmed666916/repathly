<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExperienceCard;
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
     * Get user's selected experience cards
     */
    public function getUserCards()
    {
        $user = Auth::user();
        $cards = $user->experienceCards()->ordered()->get();

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

        // Sync the experience cards (replaces all existing selections)
        $user->experienceCards()->sync($request->card_ids);

        $cards = $user->experienceCards()->ordered()->get();

        return $this->success(
            [
                'cards' => $cards,
                'count' => $cards->count(),
                'hasCompletedOnboarding' => true,
            ],
            'Deneyim kartlari basariyla kaydedildi'
        );
    }

    /**
     * Update user's experience card selections
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
        $user->experienceCards()->sync($request->card_ids);

        $cards = $user->experienceCards()->ordered()->get();

        return $this->success(
            [
                'cards' => $cards,
                'count' => $cards->count(),
            ],
            'Deneyim kartlari basariyla guncellendi'
        );
    }

    /**
     * Add a single card to user's selections
     */
    public function addCard(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'card_id' => 'required|exists:experience_cards,id',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 422);
        }

        $user = Auth::user();

        // Check if already selected
        if ($user->experienceCards()->where('experience_card_id', $request->card_id)->exists()) {
            return $this->error('Bu deneyim karti zaten secili', 409);
        }

        $user->experienceCards()->attach($request->card_id);

        return $this->success(
            ['count' => $user->experienceCards()->count()],
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
        $currentCount = $user->experienceCards()->count();

        // Prevent removing if it would go below minimum
        if ($currentCount <= self::MIN_CARDS_REQUIRED) {
            return $this->error(
                'En az ' . self::MIN_CARDS_REQUIRED . ' deneyim karti secili olmalidir',
                422
            );
        }

        $user->experienceCards()->detach($request->card_id);

        return $this->success(
            ['count' => $user->experienceCards()->count()],
            'Deneyim karti basariyla kaldirildi'
        );
    }

    /**
     * Check if user has completed onboarding (selected minimum cards)
     */
    public function checkOnboardingStatus()
    {
        $user = Auth::user();
        $count = $user->experienceCards()->count();

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
