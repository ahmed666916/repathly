import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    SafeAreaView,
    ImageBackground,
    ActivityIndicator,
    Alert,
    Dimensions,
} from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getToken } from '../../utils/secureStorage';
import { setExperiencesSelected } from '../../utils/onboardingManager';
import { t } from '../../services/api/i18n';
import {
    ExperienceCard,
    getExperienceCards,
    saveUserExperienceCards,
} from '../../services/api/experienceCards';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

const MIN_CARDS_REQUIRED = 4;

// Icon mapping for FontAwesome5
const ICON_MAP: { [key: string]: { name: string; type: 'fa' | 'fa5' } } = {
    'coffee': { name: 'coffee', type: 'fa5' },
    'utensils': { name: 'utensils', type: 'fa5' },
    'wine-glass-alt': { name: 'wine-glass-alt', type: 'fa5' },
    'hamburger': { name: 'hamburger', type: 'fa5' },
    'egg': { name: 'egg', type: 'fa5' },
    'cocktail': { name: 'cocktail', type: 'fa5' },
    'landmark': { name: 'landmark', type: 'fa5' },
    'tree': { name: 'tree', type: 'fa5' },
    'shopping-bag': { name: 'shopping-bag', type: 'fa5' },
    'palette': { name: 'palette', type: 'fa5' },
    'store': { name: 'store', type: 'fa5' },
    'child': { name: 'child', type: 'fa5' },
    'gem': { name: 'gem', type: 'fa5' },
    'camera': { name: 'camera', type: 'fa5' },
    'mountain': { name: 'mountain', type: 'fa5' },
    'music': { name: 'music', type: 'fa5' },
    'spa': { name: 'spa', type: 'fa5' },
    'paw': { name: 'paw', type: 'fa5' },
};

// Category colors for visual distinction
const CATEGORY_COLORS: { [key: string]: string } = {
    'food_dining': '#FF6B6B',
    'activities': '#4ECDC4',
    'lifestyle': '#9B59B6',
    'special_interest': '#F39C12',
};

const CATEGORY_TITLES: { [key: string]: string } = {
    'food_dining': 'Yeme & Icme',
    'activities': 'Aktiviteler',
    'lifestyle': 'Yasam Tarzi',
    'special_interest': 'Ozel Ilgi',
};

export default function ExperienceCardsOnboarding() {
    const router = useRouter();
    const [cards, setCards] = useState<ExperienceCard[]>([]);
    const [selectedCardIds, setSelectedCardIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadExperienceCards();
    }, []);

    const loadExperienceCards = async () => {
        setIsLoading(true);
        setError(null);

        const result = await getExperienceCards();

        if (result.success && result.data) {
            setCards(result.data);
        } else {
            setError(result.message || t('onboarding.cardsLoadError'));
        }

        setIsLoading(false);
    };

    const toggleCardSelection = (cardId: number) => {
        setSelectedCardIds(prev => {
            if (prev.includes(cardId)) {
                return prev.filter(id => id !== cardId);
            } else {
                return [...prev, cardId];
            }
        });
    };

    const isCardSelected = (cardId: number) => selectedCardIds.includes(cardId);

    const handleContinue = async () => {
        if (selectedCardIds.length < MIN_CARDS_REQUIRED) {
            Alert.alert(
                t('onboarding.insufficientSelection'),
                t('onboarding.insufficientSelectionDesc', { min: MIN_CARDS_REQUIRED, count: selectedCardIds.length })
            );
            return;
        }

        setIsSaving(true);

        const token = await getToken();
        if (!token) {
            Alert.alert('Oturum Hatasi', 'Lutfen tekrar giris yapin.');
            router.replace('/(auth)/login');
            return;
        }

        const result = await saveUserExperienceCards(token, selectedCardIds);

        setIsSaving(false);

        if (result.success) {
            // Mark experiences as selected in persistent storage
            await setExperiencesSelected(true);

            Alert.alert(
                t('onboarding.saveSuccessTitle'),
                t('onboarding.saveSuccessMessage'),
                [
                    {
                        text: t('onboarding.letsStart'),
                        onPress: () => router.replace('/(app)'),
                    },
                ]
            );
        } else {
            Alert.alert(t('common.error'), result.message || t('onboarding.saveError'));
        }
    };

    const handleSkip = () => {
        Alert.alert(
            t('onboarding.skipConfirmTitle'),
            t('onboarding.skipConfirmMessage'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.next'),
                    onPress: () => router.replace('/(app)'),
                },
            ]
        );
    };

    const renderIcon = (iconName: string, color: string, size: number = 24) => {
        const iconConfig = ICON_MAP[iconName];
        if (iconConfig?.type === 'fa5') {
            return <FontAwesome5 name={iconConfig.name} size={size} color={color} />;
        }
        return <FontAwesome name={iconName as any} size={size} color={color} />;
    };

    const groupedCards = cards.reduce((acc, card) => {
        const category = card.category;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(card);
        return acc;
    }, {} as { [key: string]: ExperienceCard[] });

    if (isLoading) {
        return (
            <ImageBackground
                source={require('../../assets/images/loginbackground.png')}
                style={styles.container}
                resizeMode="cover"
            >
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#E91E63" />
                    <Text style={styles.loadingText}>{t('onboarding.loadingCards')}</Text>
                </View>
            </ImageBackground>
        );
    }

    if (error) {
        return (
            <ImageBackground
                source={require('../../assets/images/loginbackground.png')}
                style={styles.container}
                resizeMode="cover"
            >
                <View style={styles.loadingOverlay}>
                    <FontAwesome5 name="exclamation-circle" size={48} color="#E91E63" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadExperienceCards}>
                        <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        );
    }

    return (
        <ImageBackground
            source={require('../../assets/images/loginbackground.png')}
            style={styles.container}
            resizeMode="cover"
        >
            <View style={styles.overlay}>
                <StatusBar barStyle="light-content" />
                <SafeAreaView style={styles.safeArea}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.stepIndicator}>{t('onboarding.stepIndicator', { current: 2, total: 2 })}</Text>
                        </View>
                        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                            <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Title Section */}
                    <View style={styles.titleSection}>
                        <Text style={styles.title}>{t('onboarding.chooseExperiences')}</Text>
                        <Text style={styles.subtitle}>
                            {t('onboarding.chooseExperiencesDesc', { min: MIN_CARDS_REQUIRED })}
                        </Text>
                        <View style={styles.selectionCounter}>
                            <FontAwesome5 name="check-circle" size={16} color={selectedCardIds.length >= MIN_CARDS_REQUIRED ? '#4CAF50' : '#8A9A94'} />
                            <Text style={[
                                styles.counterText,
                                selectedCardIds.length >= MIN_CARDS_REQUIRED && styles.counterTextSuccess
                            ]}>
                                {selectedCardIds.length} / {MIN_CARDS_REQUIRED} minimum
                            </Text>
                        </View>
                    </View>

                    {/* Cards Grid */}
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {Object.entries(groupedCards).map(([category, categoryCards]) => (
                            <View key={category} style={styles.categorySection}>
                                <View style={styles.categoryHeader}>
                                    <View style={[styles.categoryIndicator, { backgroundColor: CATEGORY_COLORS[category] || '#E91E63' }]} />
                                    <Text style={styles.categoryTitle}>
                                        {CATEGORY_TITLES[category] || category}
                                    </Text>
                                </View>
                                <View style={styles.cardsGrid}>
                                    {categoryCards.map((card) => (
                                        <TouchableOpacity
                                            key={card.id}
                                            style={[
                                                styles.card,
                                                isCardSelected(card.id) && styles.cardSelected,
                                                { borderColor: isCardSelected(card.id) ? CATEGORY_COLORS[card.category] || '#E91E63' : 'transparent' }
                                            ]}
                                            onPress={() => toggleCardSelection(card.id)}
                                            activeOpacity={0.8}
                                        >
                                            {isCardSelected(card.id) && (
                                                <View style={[styles.checkmark, { backgroundColor: CATEGORY_COLORS[card.category] || '#E91E63' }]}>
                                                    <FontAwesome5 name="check" size={12} color="#fff" />
                                                </View>
                                            )}
                                            <View style={[styles.iconContainer, { backgroundColor: `${CATEGORY_COLORS[card.category]}20` || '#E91E6320' }]}>
                                                {renderIcon(card.icon, CATEGORY_COLORS[card.category] || '#E91E63', 28)}
                                            </View>
                                            <Text style={styles.cardTitle} numberOfLines={2}>
                                                {card.nameTr || card.name_tr}
                                            </Text>
                                            <Text style={styles.cardDescription} numberOfLines={2}>
                                                {card.descriptionTr || card.description_tr}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ))}
                        <View style={styles.bottomPadding} />
                    </ScrollView>

                    {/* Continue Button */}
                    <View style={styles.bottomButtonContainer}>
                        <TouchableOpacity
                            style={[
                                styles.continueButton,
                                selectedCardIds.length < MIN_CARDS_REQUIRED && styles.continueButtonDisabled,
                                isSaving && styles.continueButtonLoading,
                            ]}
                            onPress={handleContinue}
                            disabled={selectedCardIds.length < MIN_CARDS_REQUIRED || isSaving}
                        >
                            {isSaving ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Text style={[
                                        styles.continueButtonText,
                                        selectedCardIds.length < MIN_CARDS_REQUIRED && styles.continueButtonTextDisabled
                                    ]}>
                                        {t('common.next')} ({selectedCardIds.length})
                                    </Text>
                                    <FontAwesome5 name="arrow-right" size={18} color={selectedCardIds.length >= MIN_CARDS_REQUIRED ? '#fff' : '#999'} />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    loadingOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        marginTop: 16,
        fontSize: 16,
    },
    errorText: {
        color: '#fff',
        marginTop: 16,
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    retryButton: {
        marginTop: 24,
        backgroundColor: '#E91E63',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 25,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
    },
    headerLeft: {
        flex: 1,
    },
    stepIndicator: {
        color: '#8A9A94',
        fontSize: 14,
    },
    skipButton: {
        padding: 8,
    },
    skipText: {
        color: '#8A9A94',
        fontSize: 16,
    },
    titleSection: {
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#8A9A94',
        lineHeight: 22,
    },
    selectionCounter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    counterText: {
        color: '#8A9A94',
        fontSize: 14,
        marginLeft: 8,
    },
    counterTextSuccess: {
        color: '#4CAF50',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    categorySection: {
        marginBottom: 24,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryIndicator: {
        width: 4,
        height: 20,
        borderRadius: 2,
        marginRight: 10,
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    cardsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: CARD_WIDTH,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 3,
        borderColor: 'transparent',
        position: 'relative',
    },
    cardSelected: {
        backgroundColor: '#fff',
    },
    checkmark: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
    },
    bottomPadding: {
        height: 100,
    },
    bottomButtonContainer: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
    },
    continueButton: {
        flexDirection: 'row',
        backgroundColor: '#E91E63',
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#E91E63',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    continueButtonDisabled: {
        backgroundColor: '#555',
        shadowColor: '#000',
        shadowOpacity: 0.1,
    },
    continueButtonLoading: {
        backgroundColor: '#C2185B',
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 12,
    },
    continueButtonTextDisabled: {
        color: '#999',
    },
});
