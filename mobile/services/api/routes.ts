const API_BASE_URL = 'http://37.60.245.127:8080/api';

const USE_MOCK = false;

// Route Types
export type RouteMode = 'pass_through' | 'casual' | 'flexible';
export type RouteStatus = 'draft' | 'generated' | 'active' | 'completed' | 'archived';
export type StopType = 'waypoint' | 'suggested' | 'user_added';
export type DetourTolerance = 'low' | 'medium' | 'high';
export type StopIntensity = 'minimal' | 'moderate' | 'frequent';

export interface RouteStop {
    id?: number;
    orderIndex: number;
    placeId: string;
    placeName: string;
    placeAddress: string;
    lat: number;
    lng: number;
    stopType: StopType;
    experienceCardId?: number | null;
    relevanceScore?: number | null;
    estimatedDurationMinutes?: number | null;
    isSkipped: boolean;
}

export interface Route {
    uuid: string;
    name?: string | null;
    originAddress: string;
    originLat: number;
    originLng: number;
    destinationAddress: string;
    destinationLat: number;
    destinationLng: number;
    routeMode: RouteMode;
    departureTime?: string | null;
    maxDurationMinutes?: number | null;
    stopIntensityOverride?: StopIntensity | null;
    detourToleranceOverride?: DetourTolerance | null;
    isSaved: boolean;
    status: RouteStatus;
    totalDistanceMeters?: number | null;
    totalDurationMinutes?: number | null;
    generatedAt?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
}

export interface ProfileSnapshot {
    travelStyle: string;
    detourTolerance: string;
    budgetSensitivity?: string;
    groupType?: string;
    stopIntensity: string;
    experienceWeights: Record<string, number>;
}

export interface RouteWithDetails {
    route: Route;
    stops: RouteStop[];
    profileSnapshot?: ProfileSnapshot | null;
}

export interface RouteListItem {
    uuid: string;
    name?: string | null;
    originAddress: string;
    destinationAddress: string;
    routeMode: RouteMode;
    status: RouteStatus;
    totalDistanceMeters?: number | null;
    totalDurationMinutes?: number | null;
    stopsCount: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface RouteListResponse {
    routes: RouteListItem[];
    pagination: {
        currentPage: number;
        lastPage: number;
        perPage: number;
        total: number;
    };
}

export interface CreateRouteInput {
    name?: string;
    originAddress: string;
    originLat: number;
    originLng: number;
    destinationAddress: string;
    destinationLat: number;
    destinationLng: number;
    routeMode: RouteMode;
    departureTime?: string;
    maxDurationMinutes?: number;
    stopIntensityOverride?: StopIntensity;
    detourToleranceOverride?: DetourTolerance;
    waypoints?: Array<{
        placeId: string;
        placeName: string;
        placeAddress: string;
        lat: number;
        lng: number;
    }>;
    save?: boolean;
}

export interface UpdateRouteInput {
    name?: string;
    routeMode?: RouteMode;
    departureTime?: string | null;
    maxDurationMinutes?: number | null;
    stopIntensityOverride?: StopIntensity | null;
    detourToleranceOverride?: DetourTolerance | null;
    isSaved?: boolean;
    status?: RouteStatus;
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

        console.log(`[Routes] ${method} ${API_BASE_URL}${endpoint}`);
        if (body) console.log('[Routes] Request body:', JSON.stringify(body).substring(0, 500));

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        console.log(`[Routes] Response status: ${response.status}`);

        const responseText = await response.text();

        if (!response.ok) {
            console.error('[Routes] Error response:', responseText);
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
            console.log('[Routes] Response data:', JSON.stringify(data).substring(0, 500));
            return data;
        } catch (parseError) {
            console.error('[Routes] JSON Parse Error:', parseError);
            return {
                success: false,
                message: 'Sunucu gecersiz yanit dondurdu.',
                error: 'Response is not valid JSON',
            };
        }
    } catch (error) {
        console.error('[Routes] API call error:', error);
        return {
            success: false,
            message: 'Baglanti hatasi. Lutfen internet baglantinizi kontrol edin.',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

function mockDelay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate a route preview without saving
 */
export async function previewRoute(
    token: string,
    input: CreateRouteInput
): Promise<ApiResponse<RouteWithDetails>> {
    if (USE_MOCK) {
        await mockDelay(1000);
        return {
            success: true,
            message: 'Rota onizlemesi olusturuldu.',
            data: {
                route: {
                    uuid: 'preview-' + Date.now(),
                    originAddress: input.originAddress,
                    originLat: input.originLat,
                    originLng: input.originLng,
                    destinationAddress: input.destinationAddress,
                    destinationLat: input.destinationLat,
                    destinationLng: input.destinationLng,
                    routeMode: input.routeMode,
                    isSaved: false,
                    status: 'draft',
                },
                stops: [],
            },
        };
    }

    return apiCall<RouteWithDetails>('/routes/preview', 'POST', input, token);
}

/**
 * Create and save a new route
 */
export async function createRoute(
    token: string,
    input: CreateRouteInput
): Promise<ApiResponse<RouteWithDetails>> {
    if (USE_MOCK) {
        await mockDelay(1500);
        return {
            success: true,
            message: 'Rota olusturuldu.',
            data: {
                route: {
                    uuid: 'route-' + Date.now(),
                    name: input.name,
                    originAddress: input.originAddress,
                    originLat: input.originLat,
                    originLng: input.originLng,
                    destinationAddress: input.destinationAddress,
                    destinationLat: input.destinationLat,
                    destinationLng: input.destinationLng,
                    routeMode: input.routeMode,
                    isSaved: true,
                    status: 'generated',
                    createdAt: new Date().toISOString(),
                },
                stops: [],
            },
        };
    }

    return apiCall<RouteWithDetails>('/routes', 'POST', input, token);
}

/**
 * Get list of saved routes
 */
export async function getRoutes(token: string): Promise<ApiResponse<RouteListResponse>> {
    if (USE_MOCK) {
        await mockDelay();
        return {
            success: true,
            message: 'Rotalar listelendi.',
            data: {
                routes: [],
                pagination: {
                    currentPage: 1,
                    lastPage: 1,
                    perPage: 20,
                    total: 0,
                },
            },
        };
    }

    return apiCall<RouteListResponse>('/routes', 'GET', undefined, token);
}

/**
 * Get a specific route by UUID
 */
export async function getRoute(token: string, uuid: string): Promise<ApiResponse<RouteWithDetails>> {
    if (USE_MOCK) {
        await mockDelay();
        return {
            success: false,
            message: 'Rota bulunamadi.',
        };
    }

    return apiCall<RouteWithDetails>(`/routes/${uuid}`, 'GET', undefined, token);
}

/**
 * Update a route
 */
export async function updateRoute(
    token: string,
    uuid: string,
    updates: UpdateRouteInput
): Promise<ApiResponse<RouteWithDetails>> {
    if (USE_MOCK) {
        await mockDelay();
        return {
            success: false,
            message: 'Rota bulunamadi.',
        };
    }

    return apiCall<RouteWithDetails>(`/routes/${uuid}`, 'PUT', updates, token);
}

/**
 * Archive (soft delete) a route
 */
export async function deleteRoute(
    token: string,
    uuid: string
): Promise<ApiResponse<{ uuid: string; status: string }>> {
    if (USE_MOCK) {
        await mockDelay();
        return {
            success: true,
            message: 'Rota arsivlendi.',
            data: { uuid, status: 'archived' },
        };
    }

    return apiCall<{ uuid: string; status: string }>(`/routes/${uuid}`, 'DELETE', undefined, token);
}

/**
 * Regenerate a route with current profile settings
 */
export async function regenerateRoute(
    token: string,
    uuid: string
): Promise<ApiResponse<RouteWithDetails>> {
    if (USE_MOCK) {
        await mockDelay(1500);
        return {
            success: false,
            message: 'Rota bulunamadi.',
        };
    }

    return apiCall<RouteWithDetails>(`/routes/${uuid}/regenerate`, 'POST', undefined, token);
}

// Label helpers for display
export const routeModeLabels: Record<RouteMode, { en: string; tr: string; description: string; descriptionTr: string }> = {
    pass_through: {
        en: 'Pass Through',
        tr: 'Hızlı Geçiş',
        description: 'Time-first, minimal detours, experiences only if very close',
        descriptionTr: 'Zaman öncelikli, minimum sapmalar, sadece çok yakın deneyimler',
    },
    casual: {
        en: 'Casual',
        tr: 'Rahat',
        description: 'Balanced route with moderate detours and experience diversity',
        descriptionTr: 'Dengeli rota, orta sapmalar ve deneyim çeşitliliği',
    },
    flexible: {
        en: 'Flexible',
        tr: 'Esnek',
        description: 'Experience-first, destination is secondary, time is soft constraint',
        descriptionTr: 'Deneyim öncelikli, varış noktası ikincil, zaman esnek',
    },
};

export const routeStatusLabels: Record<RouteStatus, { en: string; tr: string }> = {
    draft: { en: 'Draft', tr: 'Taslak' },
    generated: { en: 'Generated', tr: 'Oluşturuldu' },
    active: { en: 'Active', tr: 'Aktif' },
    completed: { en: 'Completed', tr: 'Tamamlandı' },
    archived: { en: 'Archived', tr: 'Arşivlendi' },
};

export default {
    previewRoute,
    createRoute,
    getRoutes,
    getRoute,
    updateRoute,
    deleteRoute,
    regenerateRoute,
};
