import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../contexts/LanguageContext';
import { useProfileContext } from '../../contexts/ProfileContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { travelStyleLabels, detourToleranceLabels, groupTypeLabels } from '../../services/api/profile';
import * as secureStorage from '../../utils/secureStorage';

const CATEGORY_COLORS: { [key: string]: string } = {
    food_dining: '#FF6B6B',
    activities: '#4ECDC4',
    lifestyle: '#9B59B6',
    special_interest: '#F39C12',
};

export default function ProfileSummaryScreen() {
    const router = useRouter();
    const { t, locale } = useLanguage();
    const { profile, experienceWeights, fetchProfile, fetchExperienceWeights } = useProfileContext();
    const { user } = useAuthContext();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            await Promise.all([fetchProfile(), fetchExperienceWeights()]);
            setIsLoading(false);
        };
        loadData();
    }, []);

    const handleStartExploring = () => {
        router.replace('/(app)');
    };

    const getTravelStyleLabel = () => {
        if (!profile?.travelStyle) return '—';
        const label = travelStyleLabels[profile.travelStyle];
        return locale === 'tr' ? label.tr : label.en;
    };

    const getDetourLabel = () => {
        if (!profile?.detourTolerance) return '—';
        const label = detourToleranceLabels[profile.detourTolerance];
        return locale === 'tr' ? label.tr : label.en;
    };

    const getGroupLabel = () => {
        if (!profile?.preferredGroupType) return '—';
        const label = groupTypeLabels[profile.preferredGroupType];
        return locale === 'tr' ? label.tr : label.en;
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#10B981" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Hero */}
                <View style={styles.heroSection}>
                    <View style={styles.checkCircle}>
                        <FontAwesome5 name="check" size={40} color="#fff" />
                    </View>
                    <Text style={styles.title}>{t('profileSummary.title')}</Text>
                    <Text style={styles.subtitle}>{t('profileSummary.subtitle')}</Text>
                </View>

                {/* User Name */}
                {user?.name ? (
                    <View style={styles.userNameBadge}>
                        <FontAwesome5 name="user" size={14} color="#10B981" />
                        <Text style={styles.userNameText}>{user.name}</Text>
                    </View>
                ) : null}

                {/* Taste DNA Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('profileSummary.tasteDnaLabel')}</Text>
                    <View style={styles.dnaRow}>
                        <View style={styles.dnaItem}>
                            <FontAwesome5 name="tachometer-alt" size={16} color="#10B981" />
                            <Text style={styles.dnaLabel}>{t('taste_dna.travelStyle')}</Text>
                            <Text style={styles.dnaValue}>{getTravelStyleLabel()}</Text>
                        </View>
                        <View style={styles.dnaDivider} />
                        <View style={styles.dnaItem}>
                            <FontAwesome5 name="random" size={16} color="#10B981" />
                            <Text style={styles.dnaLabel}>{t('taste_dna.detourTolerance')}</Text>
                            <Text style={styles.dnaValue}>{getDetourLabel()}</Text>
                        </View>
                        <View style={styles.dnaDivider} />
                        <View style={styles.dnaItem}>
                            <FontAwesome5 name="users" size={16} color="#10B981" />
                            <Text style={styles.dnaLabel}>{t('taste_dna.groupType')}</Text>
                            <Text style={styles.dnaValue}>{getGroupLabel()}</Text>
                        </View>
                    </View>
                </View>

                {/* Experience Cards */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('profileSummary.experiencesLabel')}</Text>
                        <View style={styles.countBadge}>
                            <Text style={styles.countBadgeText}>{experienceWeights.length}</Text>
                        </View>
                    </View>
                    <View style={styles.cardsGrid}>
                        {experienceWeights.map((weight) => (
                            <View key={weight.cardId} style={styles.cardChip}>
                                <Text style={styles.cardChipText}>
                                    {locale === 'tr'
                                        ? (weight.cardNameTr || weight.cardName || weight.cardSlug)
                                        : (weight.cardName || weight.cardNameTr || weight.cardSlug)}
                                </Text>
                                <View style={styles.cardWeightDots}>
                                    {[1, 2, 3, 4, 5].map((dot) => (
                                        <View
                                            key={dot}
                                            style={[
                                                styles.miniDot,
                                                dot <= weight.weight && styles.miniDotActive,
                                            ]}
                                        />
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* CTA Button */}
                <TouchableOpacity style={styles.ctaButton} onPress={handleStartExploring}>
                    <Text style={styles.ctaButtonText}>{t('profileSummary.startExploring')}</Text>
                    <FontAwesome5 name="arrow-right" size={18} color="#fff" style={styles.ctaIcon} />
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 32,
        paddingTop: 16,
    },
    checkCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 8,
    },
    userNameBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
        marginBottom: 28,
    },
    userNameText: {
        color: '#10B981',
        fontWeight: '700',
        fontSize: 15,
    },
    section: {
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 14,
    },
    countBadge: {
        backgroundColor: '#10B981',
        width: 26,
        height: 26,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
    },
    countBadgeText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },
    dnaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    dnaItem: {
        flex: 1,
        alignItems: 'center',
        gap: 6,
    },
    dnaLabel: {
        fontSize: 11,
        color: '#999',
        textAlign: 'center',
    },
    dnaValue: {
        fontSize: 13,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
    },
    dnaDivider: {
        width: 1,
        height: 50,
        backgroundColor: '#E5E7EB',
        alignSelf: 'center',
    },
    cardsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    cardChip: {
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        gap: 4,
    },
    cardChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        textTransform: 'capitalize',
    },
    cardWeightDots: {
        flexDirection: 'row',
        gap: 3,
    },
    miniDot: {
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#E5E7EB',
    },
    miniDotActive: {
        backgroundColor: '#10B981',
    },
    ctaButton: {
        backgroundColor: '#10B981',
        borderRadius: 20,
        paddingVertical: 18,
        paddingHorizontal: 32,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    ctaButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    ctaIcon: {
        marginLeft: 12,
    },
});
