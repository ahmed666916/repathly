import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Web fallback using localStorage
const webStorage = {
    getItem: (key: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage.getItem(key);
        }
        return null;
    },
    setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(key, value);
        }
    },
    deleteItem: (key: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem(key);
        }
    },
};

// Use SecureStore for native, localStorage for web
const isWeb = Platform.OS === 'web';

export interface User {
    id: string;
    name: string;
    email: string;
    profilePhoto?: string;
    isEmailVerified: boolean;
    authProvider?: 'email' | 'google' | 'apple';
    hasCompletedProfile: boolean;
    hasCompletedTasteDna: boolean;
    hasSelectedExperiences: boolean;
    isOnboardingCompleted: boolean;
    createdAt?: string;
}

// Token functions
export async function saveToken(token: string): Promise<void> {
    try {
        if (isWeb) {
            webStorage.setItem(TOKEN_KEY, token);
        } else {
            await SecureStore.setItemAsync(TOKEN_KEY, token);
        }
    } catch (error) {
        console.error('Error saving token:', error);
        throw error;
    }
}

export async function getToken(): Promise<string | null> {
    try {
        if (isWeb) {
            return webStorage.getItem(TOKEN_KEY);
        }
        return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
        console.error('Error getting token:', error);
        return null;
    }
}

export async function deleteToken(): Promise<void> {
    try {
        if (isWeb) {
            webStorage.deleteItem(TOKEN_KEY);
        } else {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
        }
    } catch (error) {
        console.error('Error deleting token:', error);
    }
}

// Refresh token functions
export async function saveRefreshToken(token: string): Promise<void> {
    try {
        if (isWeb) {
            webStorage.setItem(REFRESH_TOKEN_KEY, token);
        } else {
            await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
        }
    } catch (error) {
        console.error('Error saving refresh token:', error);
        throw error;
    }
}

export async function getRefreshToken(): Promise<string | null> {
    try {
        if (isWeb) {
            return webStorage.getItem(REFRESH_TOKEN_KEY);
        }
        return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
        console.error('Error getting refresh token:', error);
        return null;
    }
}

// User functions
export async function saveUser(user: User): Promise<void> {
    try {
        const userJson = JSON.stringify(user);
        if (isWeb) {
            webStorage.setItem(USER_KEY, userJson);
        } else {
            await SecureStore.setItemAsync(USER_KEY, userJson);
        }
    } catch (error) {
        console.error('Error saving user:', error);
        throw error;
    }
}

export async function getUser(): Promise<User | null> {
    try {
        let userJson: string | null;
        if (isWeb) {
            userJson = webStorage.getItem(USER_KEY);
        } else {
            userJson = await SecureStore.getItemAsync(USER_KEY);
        }

        if (userJson) {
            return JSON.parse(userJson) as User;
        }
        return null;
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
}

export async function deleteUser(): Promise<void> {
    try {
        if (isWeb) {
            webStorage.deleteItem(USER_KEY);
        } else {
            await SecureStore.deleteItemAsync(USER_KEY);
        }
    } catch (error) {
        console.error('Error deleting user:', error);
    }
}

// Clear all auth data
export async function clearAll(): Promise<void> {
    try {
        await Promise.all([
            deleteToken(),
            deleteUser(),
            isWeb
                ? webStorage.deleteItem(REFRESH_TOKEN_KEY)
                : SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
        ]);
    } catch (error) {
        console.error('Error clearing all auth data:', error);
    }
}

export default {
    saveToken,
    getToken,
    deleteToken,
    saveRefreshToken,
    getRefreshToken,
    saveUser,
    getUser,
    deleteUser,
    clearAll,
};
