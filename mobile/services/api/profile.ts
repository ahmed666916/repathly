const API_BASE_URL = 'http://192.168.100.23:8000/api';

const USE_MOCK = false;

// Taste DNA Profile Types
export type TravelStyle = 'fast' | 'balanced' | 'experience_first';
export type DetourTolerance = 'low' | 'medium' | 'high';
export type BudgetSensitivity = 'budget' | 'moderate' | 'premium' | 'any';
export type GroupType = 'solo' | 'couple' | 'friends' | 'family';
export type StopIntensity = 'minimal' | 'moderate' | 'frequent';
export type WeightSource = 'onboarding' | 'manual' | 'behavioral';

export interface TasteDNAProfile {
    travelStyle: TravelStyle;
    detourTolerance: DetourTolerance;
    budgetSensitivity: BudgetSensitivity;
    preferredGroupType: GroupType;
    stopIntensity: StopIntensity;
    bio?: string; // Optional user biography
}

export interface ExperienceWeight {
    cardId: number;
    cardSlug?: string;
    cardName?: string;
    cardNameTr?: string;
    weight: number; // 1-5
    source: WeightSource;
}

export interface ExperienceWeightsResponse {
    weights: ExperienceWeight[];
    count: number;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
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

        console.log(`[Profile] ${method} ${API_BASE_URL}${endpoint}`);
        if (body) console.log('[Profile] Request body:', body);

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        console.log(`[Profile] Response status: ${response.status}`);

        const responseText = await response.text();

        if (!response.ok) {
            console.error('[Profile] Error response:', responseText);
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
            console.log('[Profile] Response data:', data);
            return data;
        } catch (parseError) {
            console.error('[Profile] JSON Parse Error:', parseError);
            return {
                success: false,
                message: 'Sunucu gecersiz yanit dondurdu.',
                error: 'Response is not valid JSON',
            };
        }
    } catch (error) {
        console.error('[Profile] API call error:', error);
        return {
            success: false,
            message: 'Baglanti hatasi. Lutfen internet baglantinizi kontrol edin.',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Mock data for development
const MOCK_PROFILE: TasteDNAProfile = {
    travelStyle: 'balanced',
    detourTolerance: 'medium',
    budgetSensitivity: 'moderate',
    preferredGroupType: 'solo',
    stopIntensity: 'moderate',
};

function mockDelay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get user's taste DNA profile
 */
export async function getProfile(token: string): Promise<ApiResponse<TasteDNAProfile>> {
    if (USE_MOCK) {
        await mockDelay();
        return {
            success: true,
            message: 'Profil bilgileri alindi.',
            data: MOCK_PROFILE,
        };
    }

    return apiCall<TasteDNAProfile>('/profile', 'GET', undefined, token);
}

/**
 * Update user's taste DNA profile
 */
export async function updateProfile(
    token: string,
    updates: Partial<TasteDNAProfile>
): Promise<ApiResponse<TasteDNAProfile>> {
    if (USE_MOCK) {
        await mockDelay();
        return {
            success: true,
            message: 'Profil guncellendi.',
            data: { ...MOCK_PROFILE, ...updates },
        };
    }

    return apiCall<TasteDNAProfile>('/profile', 'PUT', updates, token);
}

/**
 * Get user's experience card weights
 */
export async function getExperienceWeights(token: string): Promise<ApiResponse<ExperienceWeightsResponse>> {
    if (USE_MOCK) {
        await mockDelay();
        return {
            success: true,
            message: 'Deneyim agirliklari alindi.',
            data: {
                weights: [],
                count: 0,
            },
        };
    }

    return apiCall<ExperienceWeightsResponse>('/profile/experience-weights', 'GET', undefined, token);
}

/**
 * Update multiple experience card weights at once
 */
export async function updateExperienceWeights(
    token: string,
    weights: Array<{ cardId: number; weight: number }>
): Promise<ApiResponse<ExperienceWeightsResponse>> {
    if (USE_MOCK) {
        await mockDelay();
        return {
            success: true,
            message: 'Deneyim agirliklari guncellendi.',
            data: {
                weights: weights.map(w => ({
                    cardId: w.cardId,
                    weight: w.weight,
                    source: 'manual' as WeightSource,
                })),
                count: weights.length,
            },
        };
    }

    return apiCall<ExperienceWeightsResponse>('/profile/experience-weights', 'PUT', { weights }, token);
}

/**
 * Update a single experience card weight
 */
export async function updateSingleWeight(
    token: string,
    cardId: number,
    weight: number
): Promise<ApiResponse<ExperienceWeight>> {
    if (USE_MOCK) {
        await mockDelay();
        return {
            success: true,
            message: 'Deneyim agirligi guncellendi.',
            data: {
                cardId,
                weight,
                source: 'manual',
            },
        };
    }

    return apiCall<ExperienceWeight>(`/profile/experience-weights/${cardId}`, 'PUT', { weight }, token);
}

/**
 * Remove an experience card weight
 */
export async function removeWeight(
    token: string,
    cardId: number
): Promise<ApiResponse<{ removedCardId: number; remainingCount: number }>> {
    if (USE_MOCK) {
        await mockDelay();
        return {
            success: false,
            message: 'En az 4 deneyim karti secili olmalidir.',
        };
    }

    return apiCall<{ removedCardId: number; remainingCount: number }>(
        `/profile/experience-weights/${cardId}`,
        'DELETE',
        undefined,
        token
    );
}

// Label helpers for display
export const travelStyleLabels: Record<TravelStyle, { en: string; tr: string }> = {
    fast: { en: 'Fast', tr: 'Hızlı' },
    balanced: { en: 'Balanced', tr: 'Dengeli' },
    experience_first: { en: 'Experience First', tr: 'Deneyim Odaklı' },
};

export const detourToleranceLabels: Record<DetourTolerance, { en: string; tr: string }> = {
    low: { en: 'Low', tr: 'Düşük' },
    medium: { en: 'Medium', tr: 'Orta' },
    high: { en: 'High', tr: 'Yüksek' },
};

export const budgetSensitivityLabels: Record<BudgetSensitivity, { en: string; tr: string }> = {
    budget: { en: 'Budget', tr: 'Ekonomik' },
    moderate: { en: 'Moderate', tr: 'Orta' },
    premium: { en: 'Premium', tr: 'Premium' },
    any: { en: 'Any', tr: 'Farketmez' },
};

export const groupTypeLabels: Record<GroupType, { en: string; tr: string }> = {
    solo: { en: 'Solo', tr: 'Tek Başına' },
    couple: { en: 'Couple', tr: 'Çift' },
    friends: { en: 'Friends', tr: 'Arkadaşlar' },
    family: { en: 'Family', tr: 'Aile' },
};

export const stopIntensityLabels: Record<StopIntensity, { en: string; tr: string }> = {
    minimal: { en: 'Minimal', tr: 'Minimum' },
    moderate: { en: 'Moderate', tr: 'Orta' },
    frequent: { en: 'Frequent', tr: 'Sık' },
};

export const weightLabels: Record<number, { en: string; tr: string }> = {
    1: { en: 'Rarely interested', tr: 'Nadiren ilgilenirim' },
    2: { en: 'Occasionally', tr: 'Bazen' },
    3: { en: 'Neutral positive', tr: 'Nötr pozitif' },
    4: { en: 'Often interested', tr: 'Sık ilgilenirim' },
    5: { en: 'Always interested', tr: 'Her zaman ilgilenirim' },
};

export default {
    getProfile,
    updateProfile,
    getExperienceWeights,
    updateExperienceWeights,
    updateSingleWeight,
    removeWeight,
};
