import { getToken } from '../../utils/secureStorage';

const API_BASE_URL = 'http://37.60.245.127:8080/api';

const USE_MOCK = false;

export interface ExperienceCard {
    id: number;
    slug: string;
    name_en: string;
    name_tr: string;
    nameEn: string;
    nameTr: string;
    description_en: string | null;
    description_tr: string | null;
    descriptionEn: string | null;
    descriptionTr: string | null;
    icon: string;
    category: string;
    priority: number;
    is_active: boolean;
    isActive: boolean;
}

export interface GroupedExperienceCards {
    [category: string]: {
        title_en: string;
        title_tr: string;
        cards: ExperienceCard[];
    };
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

interface UserCardsResponse {
    cards: ExperienceCard[];
    count: number;
    hasCompletedOnboarding: boolean;
}

interface OnboardingStatusResponse {
    hasCompletedOnboarding: boolean;
    selectedCount: number;
    minimumRequired: number;
}

// Helper function for API calls
async function apiCall<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: object,
    token?: string
): Promise<ApiResponse<T>> {
    try {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        console.log(`[ExperienceCards] ${method} ${API_BASE_URL}${endpoint}`);
        if (body) console.log('[ExperienceCards] Request body:', body);

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        console.log(`[ExperienceCards] Response status: ${response.status}`);

        const responseText = await response.text();

        if (!response.ok) {
            console.error('[ExperienceCards] Error response:', responseText);
            try {
                const errorData = JSON.parse(responseText);
                return {
                    success: false,
                    message: errorData.message || 'Bir hata olustu.',
                    error: errorData.error || responseText,
                };
            } catch {
                return {
                    success: false,
                    message: 'Sunucu hatasi olustu.',
                    error: responseText.substring(0, 200),
                };
            }
        }

        try {
            const data = JSON.parse(responseText);
            console.log('[ExperienceCards] Response data:', data);
            return data;
        } catch (parseError) {
            console.error('[ExperienceCards] JSON Parse Error:', parseError);
            return {
                success: false,
                message: 'Sunucu gecersiz yanit dondurdu.',
                error: 'Response is not valid JSON',
            };
        }
    } catch (error) {
        console.error('[ExperienceCards] API call error:', error);
        return {
            success: false,
            message: 'Baglanti hatasi. Lutfen internet baglantinizi kontrol edin.',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Mock data for development
const MOCK_CARDS: ExperienceCard[] = [
    { id: 1, slug: 'coffee-cafes', name_en: 'Coffee & Cafes', name_tr: 'Kahve & Kafeler', nameEn: 'Coffee & Cafes', nameTr: 'Kahve & Kafeler', description_en: 'Discover the best coffee shops', description_tr: 'En iyi kahve dukkanlarini kesfet', descriptionEn: 'Discover the best coffee shops', descriptionTr: 'En iyi kahve dukkanlarini kesfet', icon: 'coffee', category: 'food_dining', priority: 100, is_active: true, isActive: true },
    { id: 2, slug: 'local-cuisine', name_en: 'Local Cuisine', name_tr: 'Yerel Mutfak', nameEn: 'Local Cuisine', nameTr: 'Yerel Mutfak', description_en: 'Authentic local flavors', description_tr: 'Otantik yerel lezzetler', descriptionEn: 'Authentic local flavors', descriptionTr: 'Otantik yerel lezzetler', icon: 'utensils', category: 'food_dining', priority: 99, is_active: true, isActive: true },
    { id: 3, slug: 'fine-dining', name_en: 'Fine Dining', name_tr: 'Fine Dining', nameEn: 'Fine Dining', nameTr: 'Fine Dining', description_en: 'Upscale restaurants', description_tr: 'Lux restoranlar', descriptionEn: 'Upscale restaurants', descriptionTr: 'Lux restoranlar', icon: 'wine-glass-alt', category: 'food_dining', priority: 98, is_active: true, isActive: true },
    { id: 4, slug: 'street-food', name_en: 'Street Food', name_tr: 'Sokak Lezzetleri', nameEn: 'Street Food', nameTr: 'Sokak Lezzetleri', description_en: 'Popular street eats', description_tr: 'Populer sokak yemekleri', descriptionEn: 'Popular street eats', descriptionTr: 'Populer sokak yemekleri', icon: 'hamburger', category: 'food_dining', priority: 97, is_active: true, isActive: true },
    { id: 5, slug: 'breakfast-brunch', name_en: 'Breakfast & Brunch', name_tr: 'Kahvalti & Brunch', nameEn: 'Breakfast & Brunch', nameTr: 'Kahvalti & Brunch', description_en: 'Morning favorites', description_tr: 'Sabah favorileri', descriptionEn: 'Morning favorites', descriptionTr: 'Sabah favorileri', icon: 'egg', category: 'food_dining', priority: 96, is_active: true, isActive: true },
    { id: 6, slug: 'bars-nightlife', name_en: 'Bars & Nightlife', name_tr: 'Barlar & Gece Hayati', nameEn: 'Bars & Nightlife', nameTr: 'Barlar & Gece Hayati', description_en: 'Evening entertainment', description_tr: 'Aksam eglencesi', descriptionEn: 'Evening entertainment', descriptionTr: 'Aksam eglencesi', icon: 'cocktail', category: 'food_dining', priority: 95, is_active: true, isActive: true },
    { id: 7, slug: 'historical-sites', name_en: 'Historical Sites', name_tr: 'Tarihi Mekanlar', nameEn: 'Historical Sites', nameTr: 'Tarihi Mekanlar', description_en: 'Ancient ruins and monuments', description_tr: 'Antik kalintilar ve anitlar', descriptionEn: 'Ancient ruins and monuments', descriptionTr: 'Antik kalintilar ve anitlar', icon: 'landmark', category: 'activities', priority: 90, is_active: true, isActive: true },
    { id: 8, slug: 'nature-parks', name_en: 'Nature & Parks', name_tr: 'Doga & Parklar', nameEn: 'Nature & Parks', nameTr: 'Doga & Parklar', description_en: 'Green spaces and trails', description_tr: 'Yesil alanlar ve parkurlar', descriptionEn: 'Green spaces and trails', descriptionTr: 'Yesil alanlar ve parkurlar', icon: 'tree', category: 'activities', priority: 89, is_active: true, isActive: true },
    { id: 9, slug: 'shopping', name_en: 'Shopping', name_tr: 'Alisveris', nameEn: 'Shopping', nameTr: 'Alisveris', description_en: 'Markets and boutiques', description_tr: 'Pazarlar ve butikler', descriptionEn: 'Markets and boutiques', descriptionTr: 'Pazarlar ve butikler', icon: 'shopping-bag', category: 'activities', priority: 88, is_active: true, isActive: true },
    { id: 10, slug: 'art-museums', name_en: 'Art & Museums', name_tr: 'Sanat & Muzeler', nameEn: 'Art & Museums', nameTr: 'Sanat & Muzeler', description_en: 'Galleries and exhibitions', description_tr: 'Galeriler ve sergiler', descriptionEn: 'Galleries and exhibitions', descriptionTr: 'Galeriler ve sergiler', icon: 'palette', category: 'activities', priority: 87, is_active: true, isActive: true },
    { id: 11, slug: 'local-markets', name_en: 'Local Markets', name_tr: 'Yerel Pazarlar', nameEn: 'Local Markets', nameTr: 'Yerel Pazarlar', description_en: 'Authentic bazaars', description_tr: 'Otantik pazarlar', descriptionEn: 'Authentic bazaars', descriptionTr: 'Otantik pazarlar', icon: 'store', category: 'activities', priority: 86, is_active: true, isActive: true },
    { id: 12, slug: 'family-friendly', name_en: 'Family-Friendly', name_tr: 'Aile Dostu', nameEn: 'Family-Friendly', nameTr: 'Aile Dostu', description_en: 'Kid-friendly places', description_tr: 'Cocuk dostu mekanlar', descriptionEn: 'Kid-friendly places', descriptionTr: 'Cocuk dostu mekanlar', icon: 'child', category: 'lifestyle', priority: 80, is_active: true, isActive: true },
    { id: 13, slug: 'hidden-gems', name_en: 'Hidden Gems', name_tr: 'Gizli Hazineler', nameEn: 'Hidden Gems', nameTr: 'Gizli Hazineler', description_en: 'Off-the-beaten-path', description_tr: 'Bilinen yollarin disinda', descriptionEn: 'Off-the-beaten-path', descriptionTr: 'Bilinen yollarin disinda', icon: 'gem', category: 'lifestyle', priority: 79, is_active: true, isActive: true },
    { id: 14, slug: 'photo-spots', name_en: 'Photo Spots', name_tr: 'Fotograf Noktalari', nameEn: 'Photo Spots', nameTr: 'Fotograf Noktalari', description_en: 'Instagram-worthy locations', description_tr: 'Instagramlik mekanlar', descriptionEn: 'Instagram-worthy locations', descriptionTr: 'Instagramlik mekanlar', icon: 'camera', category: 'lifestyle', priority: 78, is_active: true, isActive: true },
    { id: 15, slug: 'scenic-views', name_en: 'Scenic Views', name_tr: 'Manzara Noktalari', nameEn: 'Scenic Views', nameTr: 'Manzara Noktalari', description_en: 'Breathtaking viewpoints', description_tr: 'Nefes kesici seyir teraslari', descriptionEn: 'Breathtaking viewpoints', descriptionTr: 'Nefes kesici seyir teraslari', icon: 'mountain', category: 'lifestyle', priority: 77, is_active: true, isActive: true },
    { id: 16, slug: 'live-music-events', name_en: 'Live Music & Events', name_tr: 'Canli Muzik & Etkinlikler', nameEn: 'Live Music & Events', nameTr: 'Canli Muzik & Etkinlikler', description_en: 'Concerts and performances', description_tr: 'Konserler ve performanslar', descriptionEn: 'Concerts and performances', descriptionTr: 'Konserler ve performanslar', icon: 'music', category: 'special_interest', priority: 70, is_active: true, isActive: true },
    { id: 17, slug: 'wellness-spa', name_en: 'Wellness & Spa', name_tr: 'Saglik & Spa', nameEn: 'Wellness & Spa', nameTr: 'Saglik & Spa', description_en: 'Relaxation and spas', description_tr: 'Rahatlama ve spalar', descriptionEn: 'Relaxation and spas', descriptionTr: 'Rahatlama ve spalar', icon: 'spa', category: 'special_interest', priority: 69, is_active: true, isActive: true },
    { id: 18, slug: 'pet-friendly', name_en: 'Pet-Friendly', name_tr: 'Evcil Hayvan Dostu', nameEn: 'Pet-Friendly', nameTr: 'Evcil Hayvan Dostu', description_en: 'Places for furry friends', description_tr: 'Tuylu dostlar icin mekanlar', descriptionEn: 'Places for furry friends', descriptionTr: 'Tuylu dostlar icin mekanlar', icon: 'paw', category: 'special_interest', priority: 68, is_active: true, isActive: true },
];

function mockDelay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get all active experience cards
 */
export async function getExperienceCards(): Promise<ApiResponse<ExperienceCard[]>> {
    if (USE_MOCK) {
        await mockDelay();
        return {
            success: true,
            message: 'Deneyim kartlari basariyla getirildi',
            data: MOCK_CARDS,
        };
    }

    const result = await apiCall<ExperienceCard[]>('/experience-cards', 'GET');

    // Fallback: if API succeeds but returns empty array, use built-in cards
    // This keeps the app working while the server DB is being seeded
    if (result.success && Array.isArray(result.data) && result.data.length === 0) {
        console.warn('[ExperienceCards] API returned empty array — using built-in card list');
        return {
            success: true,
            message: 'Deneyim kartlari yuklendi',
            data: MOCK_CARDS,
        };
    }

    // Fallback: if API call fails entirely, use built-in cards
    if (!result.success) {
        console.warn('[ExperienceCards] API call failed — using built-in card list. Error:', result.message);
        return {
            success: true,
            message: 'Deneyim kartlari yuklendi',
            data: MOCK_CARDS,
        };
    }

    return result;
}

/**
 * Get experience cards grouped by category
 */
export async function getGroupedExperienceCards(): Promise<ApiResponse<GroupedExperienceCards>> {
    if (USE_MOCK) {
        await mockDelay();
        const grouped: GroupedExperienceCards = {
            food_dining: {
                title_en: 'Food & Dining',
                title_tr: 'Yeme & Icme',
                cards: MOCK_CARDS.filter(c => c.category === 'food_dining'),
            },
            activities: {
                title_en: 'Activities & Experiences',
                title_tr: 'Aktiviteler & Deneyimler',
                cards: MOCK_CARDS.filter(c => c.category === 'activities'),
            },
            lifestyle: {
                title_en: 'Lifestyle',
                title_tr: 'Yasam Tarzi',
                cards: MOCK_CARDS.filter(c => c.category === 'lifestyle'),
            },
            special_interest: {
                title_en: 'Special Interest',
                title_tr: 'Ozel Ilgi Alanlari',
                cards: MOCK_CARDS.filter(c => c.category === 'special_interest'),
            },
        };
        return {
            success: true,
            message: 'Deneyim kartlari kategorilere gore basariyla getirildi',
            data: grouped,
        };
    }

    return apiCall<GroupedExperienceCards>('/experience-cards/grouped', 'GET');
}

/**
 * Get user's selected experience cards
 */
export async function getUserExperienceCards(token: string): Promise<ApiResponse<UserCardsResponse>> {
    if (USE_MOCK) {
        await mockDelay();
        return {
            success: true,
            message: 'Kullanici deneyim kartlari basariyla getirildi',
            data: {
                cards: [],
                count: 0,
                hasCompletedOnboarding: false,
            },
        };
    }

    return apiCall<UserCardsResponse>('/user/experience-cards', 'GET', undefined, token);
}

/**
 * Save user's experience card selections (for onboarding)
 */
export async function saveUserExperienceCards(
    token: string,
    cardIds: number[]
): Promise<ApiResponse<UserCardsResponse>> {
    if (USE_MOCK) {
        await mockDelay(1000);
        if (cardIds.length < 4) {
            return {
                success: false,
                message: 'En az 4 deneyim karti secmelisiniz',
            };
        }
        const selectedCards = MOCK_CARDS.filter(c => cardIds.includes(c.id));
        return {
            success: true,
            message: 'Deneyim kartlari basariyla kaydedildi',
            data: {
                cards: selectedCards,
                count: selectedCards.length,
                hasCompletedOnboarding: true,
            },
        };
    }

    return apiCall<UserCardsResponse>('/user/experience-cards', 'POST', { card_ids: cardIds }, token);
}

/**
 * Update user's experience card selections
 */
export async function updateUserExperienceCards(
    token: string,
    cardIds: number[]
): Promise<ApiResponse<UserCardsResponse>> {
    if (USE_MOCK) {
        await mockDelay(1000);
        if (cardIds.length < 4) {
            return {
                success: false,
                message: 'En az 4 deneyim karti secmelisiniz',
            };
        }
        const selectedCards = MOCK_CARDS.filter(c => cardIds.includes(c.id));
        return {
            success: true,
            message: 'Deneyim kartlari basariyla guncellendi',
            data: {
                cards: selectedCards,
                count: selectedCards.length,
                hasCompletedOnboarding: true,
            },
        };
    }

    return apiCall<UserCardsResponse>('/user/experience-cards', 'PUT', { card_ids: cardIds }, token);
}

/**
 * Check if user has completed onboarding
 */
export async function checkOnboardingStatus(token: string): Promise<ApiResponse<OnboardingStatusResponse>> {
    if (USE_MOCK) {
        await mockDelay(300);
        return {
            success: true,
            message: 'Onboarding durumu kontrol edildi',
            data: {
                hasCompletedOnboarding: false,
                selectedCount: 0,
                minimumRequired: 4,
            },
        };
    }

    return apiCall<OnboardingStatusResponse>('/user/experience-cards/onboarding-status', 'GET', undefined, token);
}

export default {
    getExperienceCards,
    getGroupedExperienceCards,
    getUserExperienceCards,
    saveUserExperienceCards,
    updateUserExperienceCards,
    checkOnboardingStatus,
};
