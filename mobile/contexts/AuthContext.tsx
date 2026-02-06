import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as authApi from '../services/api/auth';
import * as secureStorage from '../utils/secureStorage';
import * as onboardingManager from '../utils/onboardingManager';
import { User } from '../utils/secureStorage';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isEmailVerified: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
    register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    updateUser: (updates: Partial<User>) => Promise<void>;
    resendVerificationEmail: () => Promise<{ success: boolean; message: string }>;
    languageSelected: boolean;
    setLanguageSelected: (selected: boolean) => void;
    getOnboardingStep: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [languageSelected, setLanguageSelected] = useState(false);

    // Check auth status on app start
    const checkAuth = useCallback(async () => {
        try {
            setIsLoading(true);
            const token = await secureStorage.getToken();
            const savedUser = await secureStorage.getUser();

            if (token && savedUser) {
                setUser(savedUser);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Error checking auth:', error);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Login function
    const login = useCallback(async (email: string, password: string) => {
        try {
            setIsLoading(true);
            const response = await authApi.login(email, password);

            if (response.success && response.data) {
                await secureStorage.saveToken(response.data.token);
                if (response.data.refreshToken) {
                    await secureStorage.saveRefreshToken(response.data.refreshToken);
                }
                await secureStorage.saveUser(response.data.user);
                
                // Sync onboarding state from backend user data
                await onboardingManager.syncOnboardingState(
                    response.data.user.hasCompletedProfile,
                    response.data.user.hasCompletedTasteDna || false,
                    response.data.user.hasSelectedExperiences
                );

                setUser(response.data.user);
                setIsAuthenticated(true);

                return { success: true, message: response.message };
            }

            return { success: false, message: response.message || 'Giriş başarısız.' };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Bağlantı hatası. Lütfen tekrar deneyin.' };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Register function
    const register = useCallback(async (name: string, email: string, password: string) => {
        try {
            setIsLoading(true);
            const response = await authApi.register(name, email, password);

            if (response.success && response.data) {
                await secureStorage.saveToken(response.data.token);
                if (response.data.refreshToken) {
                    await secureStorage.saveRefreshToken(response.data.refreshToken);
                }
                await secureStorage.saveUser(response.data.user);
                
                // Sync onboarding state from backend user data
                await onboardingManager.syncOnboardingState(
                    response.data.user.hasCompletedProfile,
                    response.data.user.hasCompletedTasteDna || false,
                    response.data.user.hasSelectedExperiences
                );

                setUser(response.data.user);
                setIsAuthenticated(true);

                return { success: true, message: response.message };
            }

            return { success: false, message: response.message || 'Kayıt başarısız.' };
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, message: 'Bağlantı hatası. Lütfen tekrar deneyin.' };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Logout function
    const logout = useCallback(async () => {
        try {
            setIsLoading(true);
            const token = await secureStorage.getToken();

            // Call logout API
            if (token) {
                await authApi.logout(token);
            }

            // Clear local storage and onboarding state
            await secureStorage.clearAll();
            await onboardingManager.clearOnboardingState();

            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear local data even if API call fails
            await secureStorage.clearAll();
            await onboardingManager.clearOnboardingState();
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Update user locally
    const updateUser = useCallback(async (updates: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...updates };
            await secureStorage.saveUser(updatedUser);
            setUser(updatedUser);
        }
    }, [user]);

    // Resend verification email
    const resendVerificationEmail = useCallback(async () => {
        if (!user?.email) {
            return { success: false, message: 'Kullanıcı bulunamadı.' };
        }

        try {
            const response = await authApi.resendVerificationEmail(user.email);
            return { success: response.success, message: response.message };
        } catch (error) {
            return { success: false, message: 'Bağlantı hatası.' };
        }
    }, [user]);

    const getOnboardingStep = useCallback(() => {
        if (!languageSelected) return '/(auth)/language-selection';
        if (!user) return '/(auth)/login';

        if (!user.hasCompletedProfile) return '/(onboarding)/basic-info';
        if (!user.hasCompletedTasteDna) return '/(onboarding)/taste-dna';
        if (!user.hasSelectedExperiences) return '/(onboarding)/experience-cards';

        return '/(app)';
    }, [user, languageSelected]);

    const value: AuthContextType = {
        user,
        isAuthenticated,
        isLoading,
        isEmailVerified: user?.isEmailVerified ?? false,
        login,
        register,
        logout,
        checkAuth,
        updateUser,
        resendVerificationEmail,
        languageSelected,
        setLanguageSelected,
        getOnboardingStep,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
