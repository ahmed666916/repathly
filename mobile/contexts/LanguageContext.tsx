import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { I18n } from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';

import en from '../locales/en.json';
import tr from '../locales/tr.json';

const LANGUAGE_KEY = '@user_language';

const i18n = new I18n({ en, tr });
i18n.defaultLocale = 'tr';
i18n.enableFallback = true;

interface LanguageContextType {
    locale: string;
    t: (key: string, options?: any) => string;
    setLanguage: (lang: 'tr' | 'en') => Promise<void>;
    isReady: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
    children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
    const [locale, setLocale] = useState<string>('tr');
    const [isReady, setIsReady] = useState(false);

    // Initialize language on mount
    useEffect(() => {
        const init = async () => {
            try {
                const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
                if (savedLanguage) {
                    i18n.locale = savedLanguage;
                    setLocale(savedLanguage);
                } else {
                    const deviceLanguage = getLocales()[0]?.languageCode;
                    const lang = deviceLanguage === 'tr' ? 'tr' : 'en';
                    i18n.locale = lang;
                    setLocale(lang);
                }
            } catch (error) {
                console.error('Failed to load language', error);
                i18n.locale = 'tr';
                setLocale('tr');
            } finally {
                setIsReady(true);
            }
        };
        init();
    }, []);

    const setLanguage = useCallback(async (lang: 'tr' | 'en') => {
        try {
            await AsyncStorage.setItem(LANGUAGE_KEY, lang);
            i18n.locale = lang;
            setLocale(lang); // This triggers re-renders across all consumers
        } catch (error) {
            console.error('Failed to save language', error);
        }
    }, []);

    // The t function depends on locale state, so it re-evaluates on language change
    const t = useCallback((key: string, options?: any) => {
        return i18n.t(key, options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locale]);

    const value: LanguageContextType = {
        locale,
        t,
        setLanguage,
        isReady,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage(): LanguageContextType {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

export default LanguageContext;
