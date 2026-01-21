import { User } from '../../app/utils/secureStorage';

// TODO: Replace with your actual API base URL when backend is ready
const API_BASE_URL = 'http://192.168.100.23:8000/api';

// For development/testing - set to true to use mock responses
const USE_MOCK = false;

interface AuthResponse {
    success: boolean;
    message: string;
    data?: {
        user: User;
        token: string;
        refreshToken?: string;
    };
    error?: string;
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
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API call error:', error);
        return {
            success: false,
            message: 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Mock responses for development
function mockDelay(ms: number = 1000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// LOGIN
export async function login(email: string, password: string): Promise<AuthResponse> {
    if (USE_MOCK) {
        await mockDelay(1500);

        // Mock validation
        if (!email || !password) {
            return {
                success: false,
                message: 'Email ve şifre gereklidir.',
            };
        }

        if (password.length < 6) {
            return {
                success: false,
                message: 'Geçersiz email veya şifre.',
            };
        }

        // Mock successful login
        return {
            success: true,
            message: 'Giriş başarılı!',
            data: {
                user: {
                    id: 'mock-user-123',
                    name: email.split('@')[0],
                    email: email,
                    isEmailVerified: true,
                    authProvider: 'email',
                    createdAt: new Date().toISOString(),
                },
                token: 'mock-jwt-token-' + Date.now(),
                refreshToken: 'mock-refresh-token-' + Date.now(),
            },
        };
    }

    return apiCall<AuthResponse['data']>('/auth/login', 'POST', { email, password });
}

// REGISTER
export async function register(
    name: string,
    email: string,
    password: string
): Promise<AuthResponse> {
    if (USE_MOCK) {
        await mockDelay(1500);

        // Mock validation
        if (!name || !email || !password) {
            return {
                success: false,
                message: 'Tüm alanlar gereklidir.',
            };
        }

        if (password.length < 6) {
            return {
                success: false,
                message: 'Şifre en az 6 karakter olmalıdır.',
            };
        }

        if (!email.includes('@')) {
            return {
                success: false,
                message: 'Geçerli bir email adresi girin.',
            };
        }

        // Mock successful registration
        return {
            success: true,
            message: 'Kayıt başarılı! Email adresinize doğrulama bağlantısı gönderildi.',
            data: {
                user: {
                    id: 'mock-user-' + Date.now(),
                    name: name,
                    email: email,
                    isEmailVerified: false, // Email verification required
                    authProvider: 'email',
                    createdAt: new Date().toISOString(),
                },
                token: 'mock-jwt-token-' + Date.now(),
                refreshToken: 'mock-refresh-token-' + Date.now(),
            },
        };
    }

    return apiCall<AuthResponse['data']>('/auth/register', 'POST', { name, email, password });
}

// LOGOUT
export async function logout(token?: string): Promise<ApiResponse<null>> {
    if (USE_MOCK) {
        await mockDelay(500);
        return {
            success: true,
            message: 'Çıkış yapıldı.',
        };
    }

    return apiCall<null>('/auth/logout', 'POST', {}, token);
}

// FORGOT PASSWORD
export async function forgotPassword(email: string): Promise<ApiResponse<null>> {
    if (USE_MOCK) {
        await mockDelay(1500);

        if (!email || !email.includes('@')) {
            return {
                success: false,
                message: 'Geçerli bir email adresi girin.',
            };
        }

        return {
            success: true,
            message: 'Şifre sıfırlama bağlantısı email adresinize gönderildi.',
        };
    }

    return apiCall<null>('/auth/forgot-password', 'POST', { email });
}

// RESET PASSWORD
export async function resetPassword(
    token: string,
    newPassword: string
): Promise<ApiResponse<null>> {
    if (USE_MOCK) {
        await mockDelay(1500);

        if (!token) {
            return {
                success: false,
                message: 'Geçersiz veya süresi dolmuş bağlantı.',
            };
        }

        if (!newPassword || newPassword.length < 6) {
            return {
                success: false,
                message: 'Şifre en az 6 karakter olmalıdır.',
            };
        }

        return {
            success: true,
            message: 'Şifreniz başarıyla değiştirildi. Yeni şifrenizle giriş yapabilirsiniz.',
        };
    }

    return apiCall<null>('/auth/reset-password', 'POST', { token, newPassword });
}

// VERIFY EMAIL
export async function verifyEmail(token: string): Promise<ApiResponse<null>> {
    if (USE_MOCK) {
        await mockDelay(1000);

        if (!token) {
            return {
                success: false,
                message: 'Geçersiz doğrulama bağlantısı.',
            };
        }

        return {
            success: true,
            message: 'Email adresiniz doğrulandı!',
        };
    }

    return apiCall<null>('/auth/verify-email', 'POST', { token });
}

// RESEND VERIFICATION EMAIL
export async function resendVerificationEmail(email: string): Promise<ApiResponse<null>> {
    if (USE_MOCK) {
        await mockDelay(1000);

        return {
            success: true,
            message: 'Doğrulama emaili tekrar gönderildi.',
        };
    }

    return apiCall<null>('/auth/resend-verification', 'POST', { email });
}

// GET PROFILE
export async function getProfile(token: string): Promise<ApiResponse<User>> {
    if (USE_MOCK) {
        await mockDelay(500);

        return {
            success: true,
            message: 'Profil bilgileri alındı.',
            data: {
                id: 'mock-user-123',
                name: 'Test Kullanıcı',
                email: 'test@example.com',
                isEmailVerified: true,
                authProvider: 'email',
                createdAt: new Date().toISOString(),
            },
        };
    }

    return apiCall<User>('/auth/profile', 'GET', undefined, token);
}

// UPDATE PROFILE
export async function updateProfile(
    token: string,
    updates: Partial<User>
): Promise<ApiResponse<User>> {
    if (USE_MOCK) {
        await mockDelay(1000);

        return {
            success: true,
            message: 'Profil güncellendi.',
            data: {
                id: 'mock-user-123',
                name: updates.name || 'Test Kullanıcı',
                email: updates.email || 'test@example.com',
                profilePhoto: updates.profilePhoto,
                isEmailVerified: true,
                authProvider: 'email',
                createdAt: new Date().toISOString(),
            },
        };
    }

    return apiCall<User>('/auth/profile', 'PUT', updates, token);
}

// CHANGE PASSWORD
export async function changePassword(
    token: string,
    currentPassword: string,
    newPassword: string
): Promise<ApiResponse<null>> {
    if (USE_MOCK) {
        await mockDelay(1000);

        if (newPassword.length < 6) {
            return {
                success: false,
                message: 'Yeni şifre en az 6 karakter olmalıdır.',
            };
        }

        return {
            success: true,
            message: 'Şifreniz başarıyla değiştirildi.',
        };
    }

    return apiCall<null>('/auth/change-password', 'POST', { currentPassword, newPassword }, token);
}

export default {
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
    getProfile,
    updateProfile,
    changePassword,
};
