import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { setLanguage, t } from '../../services/api/i18n';
import { setLanguageSelected as setLanguageSelectedInStorage } from '../../utils/onboardingManager';
import { useAuthContext } from '../../contexts/AuthContext';

export default function LanguageSelectionScreen() {
    const { setLanguageSelected } = useAuthContext();

    const handleLanguageSelect = async (lang: 'tr' | 'en') => {
        await setLanguage(lang);
        setLanguageSelected(true);
        // Also mark language as selected in persistent storage
        await setLanguageSelectedInStorage(true);
        router.replace('/(auth)/login');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../assets/images/icon.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.appName}>Repathly</Text>
                </View>

                <View style={styles.selectionContainer}>
                    <Text style={styles.title}>Choose your language</Text>
                    <Text style={styles.subtitle}>Dilinizi seçin</Text>

                    <View style={styles.buttonGrid}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => handleLanguageSelect('tr')}
                        >
                            <Text style={styles.flag}>🇹🇷</Text>
                            <Text style={styles.buttonText}>Türkçe</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => handleLanguageSelect('en')}
                        >
                            <Text style={styles.flag}>🇬🇧</Text>
                            <Text style={styles.buttonText}>English</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 60,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 16,
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    selectionContainer: {
        width: '100%',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        marginBottom: 32,
    },
    buttonGrid: {
        width: '100%',
        gap: 16,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
        padding: 20,
        borderRadius: 16,
        width: '100%',
    },
    flag: {
        fontSize: 32,
        marginRight: 16,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#333',
    },
});
