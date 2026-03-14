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
import * as ImagePicker from 'expo-image-picker';
import { useAuthContext } from '../../contexts/AuthContext';
import { setProfileCompleted, getNextOnboardingStep } from '../../utils/onboardingManager';
import * as authApi from '../../services/api/auth';
import * as secureStorage from '../../utils/secureStorage';
import { t } from '../../services/api/i18n';

export default function BasicInfoScreen() {
    const router = useRouter();
    const { user, updateUser } = useAuthContext();

    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [profilePhoto, setProfilePhoto] = useState<string | null>(user?.profilePhoto || null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handlePhotoUpload = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert(t('common.error'), t('settings.photoPermissionDenied'));
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (result.canceled || !result.assets?.[0]) return;

            const imageUri = result.assets[0].uri;
            setProfilePhoto(imageUri);

            setIsUploading(true);
            const token = await secureStorage.getToken();
            if (!token) return;

            const response = await authApi.uploadProfilePhoto(token, imageUri);
            if (response.success && response.data) {
                const photoUrl = response.data.profilePhoto;
                setProfilePhoto(photoUrl);
                await updateUser({ profilePhoto: photoUrl });
            } else {
                setProfilePhoto(user?.profilePhoto || null);
                Alert.alert(t('common.error'), response.message || t('settings.photoUploadFailed'));
            }
        } catch (error) {
            setProfilePhoto(user?.profilePhoto || null);
            Alert.alert(t('common.error'), t('settings.photoUploadFailed'));
        } finally {
            setIsUploading(false);
        }
    };

    const handleContinue = async () => {
        if (!name.trim()) {
            Alert.alert(t('common.error'), t('auth.nameRequired'));
            return;
        }

        try {
            setIsLoading(true);

            const token = await secureStorage.getToken();
            if (!token) {
                Alert.alert(t('common.error'), t('settings.sessionExpired'));
                return;
            }

            const updates: any = {
                name: name.trim(),
                hasCompletedProfile: true,
            };
            if (bio.trim()) updates.bio = bio.trim();

            const response = await authApi.updateProfile(token, updates);

            if (response.success && response.data) {
                const userData = (response.data as any).user || response.data;
                await updateUser({
                    name: userData.name,
                    bio: userData.bio,
                    profilePhoto: userData.profilePhoto || user?.profilePhoto,
                    hasCompletedProfile: true,
                });
            } else {
                // Still mark profile as completed even if API had a non-critical error
                await updateUser({ name: name.trim(), bio: bio.trim() || undefined, hasCompletedProfile: true });
            }

            await setProfileCompleted(true);

            const nextStep = await getNextOnboardingStep();
            router.replace(nextStep as any);
        } catch (error) {
            Alert.alert(t('common.error'), 'Profil güncellenirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    const defaultAvatar = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>{t('profile.myProfile')}</Text>
                    <Text style={styles.subtitle}>Bize biraz kendinden bahset</Text>
                </View>

                <TouchableOpacity style={styles.photoContainer} onPress={handlePhotoUpload} disabled={isUploading}>
                    <View style={styles.photoWrapper}>
                        <Image
                            source={{ uri: profilePhoto || defaultAvatar }}
                            style={styles.profilePhoto}
                        />
                        <View style={styles.cameraOverlay}>
                            {isUploading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <FontAwesome5 name="camera" size={14} color="#fff" />
                            )}
                        </View>
                    </View>
                    <Text style={styles.photoText}>
                        {profilePhoto ? 'Fotoğrafı Değiştir' : 'Fotoğraf Ekle'}
                    </Text>
                </TouchableOpacity>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('auth.name')}</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder={t('auth.name')}
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('settings.bio')} <Text style={styles.optional}>(Opsiyonel)</Text></Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={bio}
                            onChangeText={setBio}
                            placeholder={t('settings.bioPlaceholder')}
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={4}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
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
    photoWrapper: {
        position: 'relative',
        marginBottom: 12,
    },
    profilePhoto: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#007AFF',
    },
    cameraOverlay: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    photoText: {
        color: '#007AFF',
        fontWeight: '600',
        fontSize: 15,
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
    optional: {
        fontWeight: '400',
        color: '#999',
        fontSize: 14,
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
        paddingTop: 16,
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        marginTop: 24,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
