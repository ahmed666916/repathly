<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ExperienceCard;

class ExperienceCardSeeder extends Seeder
{
    /**
     * Genesis 18 Experience Cards for MVP
     * Data-driven selection based on Google Search + Google Business demand
     */
    public function run(): void
    {
        $cards = [
            // Tier 1: High-Traffic Food & Dining (Priority 100-95)
            [
                'slug' => 'coffee-cafes',
                'name_en' => 'Coffee & Cafes',
                'name_tr' => 'Kahve & Kafeler',
                'description_en' => 'Discover the best coffee shops and cozy cafes',
                'description_tr' => 'En iyi kahve dukkanlarini ve sicak kafeleri kesfet',
                'icon' => 'coffee',
                'category' => 'food_dining',
                'priority' => 100,
            ],
            [
                'slug' => 'local-cuisine',
                'name_en' => 'Local Cuisine',
                'name_tr' => 'Yerel Mutfak',
                'description_en' => 'Authentic local flavors and traditional dishes',
                'description_tr' => 'Otantik yerel lezzetler ve geleneksel yemekler',
                'icon' => 'utensils',
                'category' => 'food_dining',
                'priority' => 99,
            ],
            [
                'slug' => 'fine-dining',
                'name_en' => 'Fine Dining',
                'name_tr' => 'Fine Dining',
                'description_en' => 'Upscale restaurants and gourmet experiences',
                'description_tr' => 'Lux restoranlar ve gurme deneyimler',
                'icon' => 'wine-glass-alt',
                'category' => 'food_dining',
                'priority' => 98,
            ],
            [
                'slug' => 'street-food',
                'name_en' => 'Street Food',
                'name_tr' => 'Sokak Lezzetleri',
                'description_en' => 'Popular street eats and food vendors',
                'description_tr' => 'Populer sokak yemekleri ve seyyar saticilar',
                'icon' => 'hamburger',
                'category' => 'food_dining',
                'priority' => 97,
            ],
            [
                'slug' => 'breakfast-brunch',
                'name_en' => 'Breakfast & Brunch',
                'name_tr' => 'Kahvalti & Brunch',
                'description_en' => 'Morning favorites and brunch spots',
                'description_tr' => 'Sabah favorileri ve brunch mekanlari',
                'icon' => 'egg',
                'category' => 'food_dining',
                'priority' => 96,
            ],
            [
                'slug' => 'bars-nightlife',
                'name_en' => 'Bars & Nightlife',
                'name_tr' => 'Barlar & Gece Hayati',
                'description_en' => 'Evening entertainment and vibrant nightlife',
                'description_tr' => 'Aksam eglencesi ve canli gece hayati',
                'icon' => 'cocktail',
                'category' => 'food_dining',
                'priority' => 95,
            ],

            // Tier 2: Activities & Experiences (Priority 90-86)
            [
                'slug' => 'historical-sites',
                'name_en' => 'Historical Sites',
                'name_tr' => 'Tarihi Mekanlar',
                'description_en' => 'Ancient ruins, monuments and heritage sites',
                'description_tr' => 'Antik kalintilar, anitlar ve miras alanlari',
                'icon' => 'landmark',
                'category' => 'activities',
                'priority' => 90,
            ],
            [
                'slug' => 'nature-parks',
                'name_en' => 'Nature & Parks',
                'name_tr' => 'Doga & Parklar',
                'description_en' => 'Green spaces, hiking trails and natural beauty',
                'description_tr' => 'Yesil alanlar, yuruyus parkurlari ve dogal guzellikler',
                'icon' => 'tree',
                'category' => 'activities',
                'priority' => 89,
            ],
            [
                'slug' => 'shopping',
                'name_en' => 'Shopping',
                'name_tr' => 'Alisveris',
                'description_en' => 'Markets, malls and unique boutiques',
                'description_tr' => 'Pazarlar, AVM\'ler ve butik dukkanlar',
                'icon' => 'shopping-bag',
                'category' => 'activities',
                'priority' => 88,
            ],
            [
                'slug' => 'art-museums',
                'name_en' => 'Art & Museums',
                'name_tr' => 'Sanat & Muzeler',
                'description_en' => 'Galleries, museums and cultural exhibitions',
                'description_tr' => 'Galeriler, muzeler ve kulturel sergiler',
                'icon' => 'palette',
                'category' => 'activities',
                'priority' => 87,
            ],
            [
                'slug' => 'local-markets',
                'name_en' => 'Local Markets',
                'name_tr' => 'Yerel Pazarlar',
                'description_en' => 'Authentic bazaars and farmers markets',
                'description_tr' => 'Otantik pazarlar ve semt pazarlari',
                'icon' => 'store',
                'category' => 'activities',
                'priority' => 86,
            ],

            // Tier 3: Practical & Lifestyle (Priority 80-77)
            [
                'slug' => 'family-friendly',
                'name_en' => 'Family-Friendly',
                'name_tr' => 'Aile Dostu',
                'description_en' => 'Kid-friendly places and family activities',
                'description_tr' => 'Cocuk dostu mekanlar ve aile aktiviteleri',
                'icon' => 'child',
                'category' => 'lifestyle',
                'priority' => 80,
            ],
            [
                'slug' => 'hidden-gems',
                'name_en' => 'Hidden Gems',
                'name_tr' => 'Gizli Hazineler',
                'description_en' => 'Off-the-beaten-path discoveries',
                'description_tr' => 'Bilinen yollarin disinda kesifler',
                'icon' => 'gem',
                'category' => 'lifestyle',
                'priority' => 79,
            ],
            [
                'slug' => 'photo-spots',
                'name_en' => 'Photo Spots',
                'name_tr' => 'Fotograf Noktalari',
                'description_en' => 'Instagram-worthy locations and scenic views',
                'description_tr' => 'Instagram\'lik mekanlar ve manzaralar',
                'icon' => 'camera',
                'category' => 'lifestyle',
                'priority' => 78,
            ],
            [
                'slug' => 'scenic-views',
                'name_en' => 'Scenic Views',
                'name_tr' => 'Manzara Noktalari',
                'description_en' => 'Breathtaking viewpoints and panoramas',
                'description_tr' => 'Nefes kesici seyir teraslari ve panoramalar',
                'icon' => 'mountain',
                'category' => 'lifestyle',
                'priority' => 77,
            ],

            // Tier 4: Special Interest (Priority 70-68)
            [
                'slug' => 'live-music-events',
                'name_en' => 'Live Music & Events',
                'name_tr' => 'Canli Muzik & Etkinlikler',
                'description_en' => 'Concerts, performances and local events',
                'description_tr' => 'Konserler, performanslar ve yerel etkinlikler',
                'icon' => 'music',
                'category' => 'special_interest',
                'priority' => 70,
            ],
            [
                'slug' => 'wellness-spa',
                'name_en' => 'Wellness & Spa',
                'name_tr' => 'Saglik & Spa',
                'description_en' => 'Relaxation, spas and wellness centers',
                'description_tr' => 'Rahatlama, spa\'lar ve saglik merkezleri',
                'icon' => 'spa',
                'category' => 'special_interest',
                'priority' => 69,
            ],
            [
                'slug' => 'pet-friendly',
                'name_en' => 'Pet-Friendly',
                'name_tr' => 'Evcil Hayvan Dostu',
                'description_en' => 'Places that welcome your furry friends',
                'description_tr' => 'Tuylu dostlarinizi kabul eden mekanlar',
                'icon' => 'paw',
                'category' => 'special_interest',
                'priority' => 68,
            ],
        ];

        foreach ($cards as $card) {
            ExperienceCard::updateOrCreate(
                ['slug' => $card['slug']],
                $card
            );
        }
    }
}
