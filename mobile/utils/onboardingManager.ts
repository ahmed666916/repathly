/**
 * Onboarding Manager
 * 
 * Single source of truth for onboarding state.
 * Manages local persistent storage of onboarding completion flags.
 * Syncs with backend user data.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
    HAS_SELECTED_LANGUAGE: '@onboarding_language_selected',
    HAS_COMPLETED_PROFILE: '@onboarding_profile_completed',
    HAS_COMPLETED_TASTE_DNA: '@onboarding_taste_dna_completed',
    HAS_SELECTED_EXPERIENCES: '@onboarding_experiences_selected',
};

export interface OnboardingState {
    hasSelectedLanguage: boolean;
    hasCompletedProfile: boolean;
    hasCompletedTasteDna: boolean;
    hasSelectedExperiences: boolean;
    isComplete: boolean;
}

/**
 * Get the current onboarding state from persistent storage
 */
export async function getOnboardingState(): Promise<OnboardingState> {
    try {
        const [language, profile, tasteDna, experiences] = await Promise.all([
            AsyncStorage.getItem(STORAGE_KEYS.HAS_SELECTED_LANGUAGE),
            AsyncStorage.getItem(STORAGE_KEYS.HAS_COMPLETED_PROFILE),
            AsyncStorage.getItem(STORAGE_KEYS.HAS_COMPLETED_TASTE_DNA),
            AsyncStorage.getItem(STORAGE_KEYS.HAS_SELECTED_EXPERIENCES),
        ]);

        const state: OnboardingState = {
            hasSelectedLanguage: language === 'true',
            hasCompletedProfile: profile === 'true',
            hasCompletedTasteDna: tasteDna === 'true',
            hasSelectedExperiences: experiences === 'true',
            isComplete: false,
        };

        // Onboarding is complete when all steps are done
        state.isComplete = state.hasSelectedLanguage &&
                          state.hasCompletedProfile &&
                          state.hasCompletedTasteDna &&
                          state.hasSelectedExperiences;

        return state;
    } catch (error) {
        console.error('Error getting onboarding state:', error);
        return {
            hasSelectedLanguage: false,
            hasCompletedProfile: false,
            hasCompletedTasteDna: false,
            hasSelectedExperiences: false,
            isComplete: false,
        };
    }
}

/**
 * Mark language as selected
 */
export async function setLanguageSelected(selected: boolean): Promise<void> {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.HAS_SELECTED_LANGUAGE, String(selected));
    } catch (error) {
        console.error('Error setting language selected:', error);
    }
}

/**
 * Mark profile as completed
 */
export async function setProfileCompleted(completed: boolean): Promise<void> {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.HAS_COMPLETED_PROFILE, String(completed));
    } catch (error) {
        console.error('Error setting profile completed:', error);
    }
}

/**
 * Mark taste DNA as completed
 */
export async function setTasteDnaCompleted(completed: boolean): Promise<void> {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.HAS_COMPLETED_TASTE_DNA, String(completed));
    } catch (error) {
        console.error('Error setting taste DNA completed:', error);
    }
}

/**
 * Mark experiences as selected
 */
export async function setExperiencesSelected(selected: boolean): Promise<void> {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.HAS_SELECTED_EXPERIENCES, String(selected));
    } catch (error) {
        console.error('Error setting experiences selected:', error);
    }
}

/**
 * Sync local onboarding state with backend user data
 *
 * This is called after login/register to ensure local state matches backend
 */
export async function syncOnboardingState(
    hasCompletedProfile: boolean,
    hasCompletedTasteDna: boolean,
    hasSelectedExperiences: boolean,
): Promise<void> {
    try {
        await Promise.all([
            setProfileCompleted(hasCompletedProfile),
            setTasteDnaCompleted(hasCompletedTasteDna),
            setExperiencesSelected(hasSelectedExperiences),
        ]);
    } catch (error) {
        console.error('Error syncing onboarding state:', error);
    }
}

/**
 * Get the next onboarding step based on current state
 */
export async function getNextOnboardingStep(): Promise<string> {
    const state = await getOnboardingState();

    // Language must be selected first
    if (!state.hasSelectedLanguage) {
        return '/(auth)/language-selection';
    }

    // Then profile must be completed
    if (!state.hasCompletedProfile) {
        return '/(onboarding)/basic-info';
    }

    // Then taste DNA must be completed
    if (!state.hasCompletedTasteDna) {
        return '/(onboarding)/taste-dna';
    }

    // Then experiences must be selected
    if (!state.hasSelectedExperiences) {
        return '/(onboarding)/experience-cards';
    }

    // All onboarding complete - go to app
    return '/(app)';
}

/**
 * Clear all onboarding state (on logout)
 */
export async function clearOnboardingState(): Promise<void> {
    try {
        await AsyncStorage.multiRemove([
            STORAGE_KEYS.HAS_SELECTED_LANGUAGE,
            STORAGE_KEYS.HAS_COMPLETED_PROFILE,
            STORAGE_KEYS.HAS_COMPLETED_TASTE_DNA,
            STORAGE_KEYS.HAS_SELECTED_EXPERIENCES,
        ]);
    } catch (error) {
        console.error('Error clearing onboarding state:', error);
    }
}
