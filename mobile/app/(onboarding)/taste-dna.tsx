import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../../contexts/AuthContext';
import { useProfileContext } from '../../contexts/ProfileContext';
import { t } from '../../services/api/i18n';
import { useLanguage } from '../../contexts/LanguageContext';
import { setTasteDnaCompleted, getNextOnboardingStep } from '../../utils/onboardingManager';
import {
    travelStyleLabels,
    detourToleranceLabels,
    budgetSensitivityLabels,
    groupTypeLabels,
    stopIntensityLabels,
    TravelStyle,
    DetourTolerance,
    BudgetSensitivity,
    GroupType,
    StopIntensity,
} from '../../services/api/profile';

export default function TasteDNAOnboardingScreen() {
    const router = useRouter();
    const { updateUser } = useAuthContext();
    const { profile, fetchProfile, updateProfile } = useProfileContext();
    const { locale } = useLanguage();
    const lang = locale as 'tr' | 'en';

    const [localProfile, setLocalProfile] = useState({
        travelStyle: 'balanced' as TravelStyle,
        detourTolerance: 'medium' as DetourTolerance,
        budgetSensitivity: 'moderate' as BudgetSensitivity,
        preferredGroupType: 'solo' as GroupType,
        stopIntensity: 'moderate' as StopIntensity,
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (profile) {
            setLocalProfile({
                travelStyle: profile.travelStyle,
                detourTolerance: profile.detourTolerance,
                budgetSensitivity: profile.budgetSensitivity,
                preferredGroupType: profile.preferredGroupType,
                stopIntensity: profile.stopIntensity,
            });
        }
    }, [profile]);

    const handleContinue = async () => {
        setIsSaving(true);
        const result = await updateProfile(localProfile);

        if (result.success) {
            // Mark taste DNA as completed in persistent storage
            await setTasteDnaCompleted(true);

            // Also update AuthContext user state
            await updateUser({
                hasCompletedTasteDna: true,
            });

            // Redirect to next onboarding step using async storage-based check
            const nextStep = await getNextOnboardingStep();
            router.replace(nextStep as any);
        } else {
            Alert.alert(t('common.error'), result.message);
        }
        setIsSaving(false);
    };

    const updateField = (field: string, value: string) => {
        setLocalProfile(prev => ({ ...prev, [field]: value as any }));
    };

    const renderOptions = (
        field: string,
        labels: any,
        title: string,
        icon: string
    ) => {
        const currentValue = (localProfile as any)[field];

        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <FontAwesome5 name={icon} size={18} color="#E91E63" />
                    <Text style={styles.sectionTitle}>{title}</Text>
                </View>
                <View style={styles.optionsGrid}>
                    {Object.entries(labels).map(([value, labelObj]: [string, any]) => (
                        <TouchableOpacity
                            key={value}
                            style={[
                                styles.optionButton,
                                currentValue === value && styles.activeOption
                            ]}
                            onPress={() => updateField(field, value)}
                        >
                            <Text style={[
                                styles.optionLabel,
                                currentValue === value && styles.activeOptionLabel
                            ]}>
                                {labelObj[lang] || labelObj['tr']}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>{t('taste_dna.travelDna')}</Text>
                    <Text style={styles.subtitle}>{t('taste_dna.description')}</Text>
                </View>

                {renderOptions(
                    'travelStyle',
                    travelStyleLabels,
                    t('taste_dna.travelStyle'),
                    'plane'
                )}

                {renderOptions(
                    'detourTolerance',
                    detourToleranceLabels,
                    t('taste_dna.detourTolerance'),
                    'route'
                )}

                {renderOptions(
                    'budgetSensitivity',
                    budgetSensitivityLabels,
                    t('taste_dna.budgetPreference'),
                    'wallet'
                )}

                {renderOptions(
                    'preferredGroupType',
                    groupTypeLabels,
                    t('taste_dna.groupType'),
                    'users'
                )}

                {renderOptions(
                    'stopIntensity',
                    stopIntensityLabels,
                    t('taste_dna.stopIntensity'),
                    'coffee'
                )}

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleContinue}
                    disabled={isSaving}
                >
                    {isSaving ? (
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
        paddingBottom: 40,
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
        lineHeight: 22,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    optionButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F2F2F7',
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    activeOption: {
        backgroundColor: '#E91E63',
        borderColor: '#E91E63',
    },
    optionLabel: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    activeOptionLabel: {
        color: '#fff',
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
