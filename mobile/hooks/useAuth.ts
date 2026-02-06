import { useContext, useState, useCallback } from 'react';
import AuthContext from '../contexts/AuthContext';
import * as authApi from '../services/api/auth';
import * as secureStorage from '../utils/secureStorage';
import { syncOnboardingState, getNextOnboardingStep } from '../utils/onboardingManager';

/**
 * Custom hook for accessing auth state and actions
 * Works both with and without AuthProvider (for auth screens)
 */
export function useAuth() {
    const context = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);

    // If context is available, use it
    if (context !== undefined) {
        return context;
    }

    // Fallback for when used outside AuthProvider (e.g., login/register screens)
    // This allows auth screens to work without being wrapped in AuthProvider
    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            const response = await authApi.login(email, password);

            if (response.success && response.data) {
                await secureStorage.saveToken(response.data.token);
                if (response.data.refreshToken) {
                    await secureStorage.saveRefreshToken(response.data.refreshToken);
                }
                await secureStorage.saveUser(response.data.user);
                
                // Sync local onboarding state with backend user data
                await syncOnboardingState(
                    response.data.user.hasCompletedProfile,
                    response.data.user.hasCompletedTasteDna || false,
                    response.data.user.hasSelectedExperiences
                );

                return { success: true, message: response.message };
            }

            return { success: false, message: response.message || 'Giriş başarısız.' };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Bağlantı hatası. Lütfen tekrar deneyin.' };
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string) => {
        try {
            setIsLoading(true);
            const response = await authApi.register(name, email, password);

            if (response.success && response.data) {
                await secureStorage.saveToken(response.data.token);
                if (response.data.refreshToken) {
                    await secureStorage.saveRefreshToken(response.data.refreshToken);
                }
                await secureStorage.saveUser(response.data.user);
                
                // Sync local onboarding state with backend user data
                await syncOnboardingState(
                    response.data.user.hasCompletedProfile,
                    response.data.user.hasCompletedTasteDna || false,
                    response.data.user.hasSelectedExperiences
                );

                return { success: true, message: response.message };
            }

            return { success: false, message: response.message || 'Kayıt başarısız.' };
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, message: 'Bağlantı hatası. Lütfen tekrar deneyin.' };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            const token = await secureStorage.getToken();
            if (token) {
                await authApi.logout(token);
            }
            await secureStorage.clearAll();
        } catch (error) {
            console.error('Logout error:', error);
            await secureStorage.clearAll();
        }
    };

    const checkAuth = async () => { };
    const updateUser = async () => { };
    const resendVerificationEmail = async () => ({ success: false, message: 'Not available' });

    // Use the onboarding manager for the fallback implementation
    const getOnboardingStep = useCallback(async () => {
        return await getNextOnboardingStep();
    }, []);

    return {
        user: null,
        isAuthenticated: false,
        isLoading,
        isEmailVerified: false,
        login,
        register,
        logout,
        checkAuth,
        updateUser,
        resendVerificationEmail,
        getOnboardingStep,
    };
}

export default useAuth;
