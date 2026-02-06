import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import * as profileApi from '../../services/api/profile';
import * as secureStorage from '../utils/secureStorage';
import {
    TasteDNAProfile,
    ExperienceWeight,
    TravelStyle,
    DetourTolerance,
    BudgetSensitivity,
    GroupType,
    StopIntensity,
} from '../../services/api/profile';

interface ProfileContextType {
    profile: TasteDNAProfile | null;
    experienceWeights: ExperienceWeight[];
    isLoading: boolean;
    error: string | null;
    fetchProfile: () => Promise<void>;
    updateProfile: (updates: Partial<TasteDNAProfile>) => Promise<{ success: boolean; message: string }>;
    fetchExperienceWeights: () => Promise<void>;
    updateExperienceWeights: (weights: Array<{ cardId: number; weight: number }>) => Promise<{ success: boolean; message: string }>;
    updateSingleWeight: (cardId: number, weight: number) => Promise<{ success: boolean; message: string }>;
    removeWeight: (cardId: number) => Promise<{ success: boolean; message: string }>;
    clearError: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
    children: ReactNode;
}

export function ProfileProvider({ children }: ProfileProviderProps) {
    const [profile, setProfile] = useState<TasteDNAProfile | null>(null);
    const [experienceWeights, setExperienceWeights] = useState<ExperienceWeight[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Fetch user's taste DNA profile
    const fetchProfile = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const token = await secureStorage.getToken();
            if (!token) {
                setError('Oturum bulunamadı.');
                return;
            }

            const response = await profileApi.getProfile(token);

            if (response.success && response.data) {
                setProfile(response.data);
            } else {
                setError(response.message || 'Profil alınamadı.');
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Profil alınırken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Update user's taste DNA profile
    const updateProfile = useCallback(async (updates: Partial<TasteDNAProfile>) => {
        try {
            setIsLoading(true);
            setError(null);

            const token = await secureStorage.getToken();
            if (!token) {
                return { success: false, message: 'Oturum bulunamadı.' };
            }

            const response = await profileApi.updateProfile(token, updates);

            if (response.success && response.data) {
                setProfile(response.data);
                return { success: true, message: response.message };
            }

            return { success: false, message: response.message || 'Profil güncellenemedi.' };
        } catch (err) {
            console.error('Error updating profile:', err);
            return { success: false, message: 'Profil güncellenirken bir hata oluştu.' };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch user's experience card weights
    const fetchExperienceWeights = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const token = await secureStorage.getToken();
            if (!token) {
                setError('Oturum bulunamadı.');
                return;
            }

            const response = await profileApi.getExperienceWeights(token);

            if (response.success && response.data) {
                setExperienceWeights(response.data.weights);
            } else {
                setError(response.message || 'Deneyim ağırlıkları alınamadı.');
            }
        } catch (err) {
            console.error('Error fetching experience weights:', err);
            setError('Deneyim ağırlıkları alınırken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Update multiple experience card weights
    const updateExperienceWeights = useCallback(async (weights: Array<{ cardId: number; weight: number }>) => {
        try {
            setIsLoading(true);
            setError(null);

            const token = await secureStorage.getToken();
            if (!token) {
                return { success: false, message: 'Oturum bulunamadı.' };
            }

            const response = await profileApi.updateExperienceWeights(token, weights);

            if (response.success && response.data) {
                setExperienceWeights(response.data.weights);
                return { success: true, message: response.message };
            }

            return { success: false, message: response.message || 'Ağırlıklar güncellenemedi.' };
        } catch (err) {
            console.error('Error updating experience weights:', err);
            return { success: false, message: 'Ağırlıklar güncellenirken bir hata oluştu.' };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Update a single experience card weight
    const updateSingleWeight = useCallback(async (cardId: number, weight: number) => {
        try {
            setIsLoading(true);
            setError(null);

            const token = await secureStorage.getToken();
            if (!token) {
                return { success: false, message: 'Oturum bulunamadı.' };
            }

            const response = await profileApi.updateSingleWeight(token, cardId, weight);

            if (response.success && response.data) {
                // Update local state
                setExperienceWeights(prev => {
                    const existing = prev.find(w => w.cardId === cardId);
                    if (existing) {
                        return prev.map(w => w.cardId === cardId ? { ...w, weight, source: 'manual' as const } : w);
                    }
                    return [...prev, response.data!];
                });
                return { success: true, message: response.message };
            }

            return { success: false, message: response.message || 'Ağırlık güncellenemedi.' };
        } catch (err) {
            console.error('Error updating single weight:', err);
            return { success: false, message: 'Ağırlık güncellenirken bir hata oluştu.' };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Remove an experience card weight
    const removeWeight = useCallback(async (cardId: number) => {
        try {
            setIsLoading(true);
            setError(null);

            const token = await secureStorage.getToken();
            if (!token) {
                return { success: false, message: 'Oturum bulunamadı.' };
            }

            const response = await profileApi.removeWeight(token, cardId);

            if (response.success && response.data) {
                // Update local state
                setExperienceWeights(prev => prev.filter(w => w.cardId !== cardId));
                return { success: true, message: response.message };
            }

            return { success: false, message: response.message || 'Kart kaldırılamadı.' };
        } catch (err) {
            console.error('Error removing weight:', err);
            return { success: false, message: 'Kart kaldırılırken bir hata oluştu.' };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const value: ProfileContextType = {
        profile,
        experienceWeights,
        isLoading,
        error,
        fetchProfile,
        updateProfile,
        fetchExperienceWeights,
        updateExperienceWeights,
        updateSingleWeight,
        removeWeight,
        clearError,
    };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfileContext(): ProfileContextType {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error('useProfileContext must be used within a ProfileProvider');
    }
    return context;
}

// Re-export types for convenience
export type {
    TasteDNAProfile,
    ExperienceWeight,
    TravelStyle,
    DetourTolerance,
    BudgetSensitivity,
    GroupType,
    StopIntensity,
};

export default ProfileContext;
