import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '../../locales/en.json';
import tr from '../../locales/tr.json';

const translations = {
    en,
    tr,
};

const i18n = new I18n(translations);

// Set the locale once at the beginning of your app
i18n.defaultLocale = 'tr';
i18n.locale = getLocales()[0].languageCode ?? 'tr';
i18n.enableFallback = true;

const LANGUAGE_KEY = '@user_language';

export const initI18n = async () => {
    try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (savedLanguage) {
            i18n.locale = savedLanguage;
        } else {
            const deviceLanguage = getLocales()[0].languageCode;
            i18n.locale = deviceLanguage === 'tr' ? 'tr' : 'en';
        }
    } catch (error) {
        console.error('Failed to load language', error);
    }
};

export const setLanguage = async (language: 'tr' | 'en') => {
    try {
        await AsyncStorage.setItem(LANGUAGE_KEY, language);
        i18n.locale = language;
    } catch (error) {
        console.error('Failed to save language', error);
    }
};

export const t = (key: string, options?: any) => i18n.t(key, options);

export const getLanguage = () => i18n.locale;

export default i18n;
