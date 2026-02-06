<?php

namespace App\Services;

use App\Enums\DetourTolerance;
use App\Enums\RouteMode;
use App\Models\Route;
use App\Models\User;
use App\Models\UserExperienceCardWeight;

class PlaceScoringService
{
    /**
     * Default place quality score (0-1 scale).
     */
    private const DEFAULT_PLACE_QUALITY = 0.7;

    /**
     * Time bonus factor for places open during departure time.
     */
    private const TIME_BONUS = 0.1;

    /**
     * Calculate the relevance score for a place based on user preferences.
     *
     * Formula: FinalScore = (PlaceQuality × CardMatchScore) - DetourPenalty + TimeBonus
     *
     * @param array $place Place data with 'types', 'rating', 'detour_minutes'
     * @param array $userWeights User's experience card weights {card_id => weight}
     * @param array $cardTypeMap Map of experience card IDs to Google Place types
     * @param RouteMode $routeMode The route mode affecting detour tolerance
     * @param DetourTolerance $detourTolerance User's detour tolerance
     * @param bool $isOpenNow Whether the place is open during the trip
     * @return float Relevance score (0-1 scale, can go slightly above 1 with bonuses)
     */
    public function calculateScore(
        array $place,
        array $userWeights,
        array $cardTypeMap,
        RouteMode $routeMode,
        DetourTolerance $detourTolerance,
        bool $isOpenNow = true
    ): float {
        // 1. Calculate place quality (Google rating normalized to 0-1)
        $placeQuality = $this->calculatePlaceQuality($place);

        // 2. Calculate card match score (highest matching weight)
        $cardMatchScore = $this->calculateCardMatchScore($place, $userWeights, $cardTypeMap);

        // 3. Calculate detour penalty
        $detourPenalty = $this->calculateDetourPenalty(
            $place['detour_minutes'] ?? 0,
            $routeMode,
            $detourTolerance
        );

        // 4. Calculate time bonus
        $timeBonus = $isOpenNow ? self::TIME_BONUS : 0;

        // Final score calculation
        $finalScore = ($placeQuality * $cardMatchScore) - $detourPenalty + $timeBonus;

        // Normalize to 0-1 range (with possible slight overshoot from time bonus)
        return max(0, min(1.2, $finalScore));
    }

    /**
     * Score multiple places and return sorted by relevance.
     *
     * @param array $places Array of place data
     * @param User $user The user for whom to score
     * @param RouteMode $routeMode The route mode
     * @param array $cardTypeMap Map of experience card IDs to Google Place types
     * @return array Places sorted by relevance score (descending)
     */
    public function scorePlaces(
        array $places,
        User $user,
        RouteMode $routeMode,
        array $cardTypeMap = []
    ): array {
        $userWeights = $user->getExperienceWeightsArray();
        $detourTolerance = $user->profile?->detour_tolerance ?? DetourTolerance::default();

        $scoredPlaces = [];

        foreach ($places as $place) {
            $score = $this->calculateScore(
                $place,
                $userWeights,
                $cardTypeMap,
                $routeMode,
                $detourTolerance,
                $place['is_open_now'] ?? true
            );

            $scoredPlaces[] = array_merge($place, ['relevance_score' => $score]);
        }

        // Sort by relevance score descending
        usort($scoredPlaces, fn($a, $b) => $b['relevance_score'] <=> $a['relevance_score']);

        return $scoredPlaces;
    }

    /**
     * Filter places that meet minimum relevance threshold for a route mode.
     *
     * @param array $places Scored places
     * @param RouteMode $routeMode The route mode
     * @return array Filtered places
     */
    public function filterByRouteMode(array $places, RouteMode $routeMode): array
    {
        $minScore = match ($routeMode) {
            RouteMode::PassThrough => 0.7,  // Only high-relevance stops
            RouteMode::Casual => 0.4,       // Moderate threshold
            RouteMode::Flexible => 0.2,     // Include most relevant places
        };

        return array_filter($places, fn($p) => ($p['relevance_score'] ?? 0) >= $minScore);
    }

    /**
     * Calculate place quality from Google rating.
     *
     * @param array $place Place data with optional 'rating' (1-5 scale)
     * @return float Quality score (0-1 scale)
     */
    private function calculatePlaceQuality(array $place): float
    {
        if (!isset($place['rating'])) {
            return self::DEFAULT_PLACE_QUALITY;
        }

        // Normalize Google rating (1-5) to 0-1 scale
        return ($place['rating'] - 1) / 4;
    }

    /**
     * Calculate card match score based on matching experience cards.
     *
     * @param array $place Place data with 'types' array
     * @param array $userWeights User's experience card weights {card_id => weight}
     * @param array $cardTypeMap Map of experience card IDs to Google Place types
     * @return float Match score (multiplier based on best matching card weight)
     */
    private function calculateCardMatchScore(
        array $place,
        array $userWeights,
        array $cardTypeMap
    ): float {
        if (empty($userWeights) || empty($cardTypeMap)) {
            return 1.0; // Neutral score if no preferences set
        }

        $placeTypes = $place['types'] ?? [];
        $maxMultiplier = 0.5; // Base multiplier if no match

        foreach ($userWeights as $cardId => $weight) {
            $cardTypes = $cardTypeMap[$cardId] ?? [];

            // Check if any card type matches any place type
            if (array_intersect($cardTypes, $placeTypes)) {
                $multiplier = UserExperienceCardWeight::WEIGHT_MULTIPLIERS[$weight] ?? 1.0;
                $maxMultiplier = max($maxMultiplier, $multiplier);
            }
        }

        return $maxMultiplier;
    }

    /**
     * Calculate detour penalty based on detour time and tolerance.
     *
     * @param int $detourMinutes Detour time in minutes
     * @param RouteMode $routeMode The route mode
     * @param DetourTolerance $detourTolerance User's detour tolerance
     * @return float Penalty score (0-1 scale)
     */
    private function calculateDetourPenalty(
        int $detourMinutes,
        RouteMode $routeMode,
        DetourTolerance $detourTolerance
    ): float {
        $maxDetour = $routeMode->maxDetourMinutes();

        // If detour exceeds max for route mode, return max penalty
        if ($detourMinutes > $maxDetour) {
            return 1.0;
        }

        // Calculate base penalty (0-1 based on % of max detour)
        $basePenalty = $detourMinutes / max(1, $maxDetour);

        // Apply tolerance factor (lower tolerance = higher penalty)
        $toleranceFactor = match ($detourTolerance) {
            DetourTolerance::Low => 1.5,
            DetourTolerance::Medium => 1.0,
            DetourTolerance::High => 0.5,
        };

        return min(1.0, $basePenalty * $toleranceFactor);
    }

    /**
     * Get the default card type mapping for experience cards to Google Place types.
     *
     * @return array Map of experience card slugs to Google Place types
     */
    public static function getDefaultCardTypeMap(): array
    {
        return [
            // Food & Dining
            'local_cuisine' => ['restaurant', 'food', 'meal_takeaway'],
            'street_food' => ['restaurant', 'food', 'bakery', 'cafe'],
            'fine_dining' => ['restaurant'],
            'cafes' => ['cafe', 'bakery'],
            'bars_nightlife' => ['bar', 'night_club'],
            'breweries_wineries' => ['bar', 'liquor_store'],

            // Activities
            'hiking' => ['park', 'natural_feature', 'campground'],
            'beach' => ['natural_feature'],
            'photography' => ['tourist_attraction', 'point_of_interest'],
            'museums' => ['museum', 'art_gallery'],
            'shopping' => ['shopping_mall', 'store', 'clothing_store'],
            'sports' => ['stadium', 'gym', 'sports_complex'],

            // Lifestyle
            'wellness_spa' => ['spa', 'gym', 'beauty_salon'],
            'pet_friendly' => ['park', 'pet_store', 'veterinary_care'],
            'family_activities' => ['amusement_park', 'zoo', 'aquarium', 'park'],
            'romantic' => ['restaurant', 'spa', 'lodging'],
            'budget_travel' => ['hostel', 'campground'],
            'luxury' => ['lodging', 'spa', 'restaurant'],

            // Special Interest
            'architecture' => ['church', 'mosque', 'hindu_temple', 'synagogue', 'city_hall'],
            'history' => ['museum', 'library', 'city_hall'],
            'art' => ['art_gallery', 'museum'],
            'music' => ['night_club', 'bar', 'movie_theater'],
            'festivals' => ['stadium', 'park'],
            'eco_tourism' => ['park', 'natural_feature', 'campground'],
        ];
    }
}
