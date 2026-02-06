import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Image,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../../contexts/AuthContext';
import { setProfileCompleted, getNextOnboardingStep } from '../../utils/onboardingManager';
import { t } from '../../services/api/i18n';

export default function BasicInfoScreen() {
    const router = useRouter();
    const { user, updateUser } = useAuthContext();

    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleContinue = async () => {
        if (!name.trim()) {
            Alert.alert(t('common.error'), t('auth.nameRequired'));
            return;
        }

        try {
            setIsLoading(true);
            // In a real app, this would call an API to update the profile
            // For now, we update local state which simulates persistence
            await updateUser({
                name: name.trim(),
                hasCompletedProfile: true, // Mark step as done
            });

            // Mark profile completion in persistent storage
            await setProfileCompleted(true);

            // Redirect to next onboarding step using async storage-based check
            const nextStep = await getNextOnboardingStep();
            router.replace(nextStep as any);
        } catch (error) {
            Alert.alert(t('common.error'), 'Profil güncellenirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>{t('profile.userProfile')}</Text>
                    <Text style={styles.subtitle}>Bize biraz kendinden bahset</Text>
                </View>

                <TouchableOpacity style={styles.photoContainer}>
                    <View style={styles.photoPlaceholder}>
                        <FontAwesome5 name="camera" size={32} color="#999" />
                    </View>
                    <Text style={styles.photoText}>Fotoğraf Ekle</Text>
                </TouchableOpacity>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('auth.name')}</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder={t('auth.name')}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Hakkımda (Opsiyonel)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={bio}
                            onChangeText={setBio}
                            placeholder="Hobilerin, sevdiğin seyahat rotaları..."
                            multiline
                            numberOfLines={4}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleContinue}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>{t('common.next')}</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        padding: 24,
        flexGrow: 1,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    photoContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    photoPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderStyle: 'dashed',
    },
    photoText: {
        color: '#007AFF',
        fontWeight: '600',
    },
    form: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F2F2F7',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#333',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        marginTop: 24,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
