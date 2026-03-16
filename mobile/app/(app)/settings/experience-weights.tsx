import React, { useState, useEffect, useCallback } from 'react';
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
import { useProfileContext } from '../../../contexts/ProfileContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getGroupedExperienceCards } from '../../../services/api/experienceCards';
import { updateUserExperienceCards } from '../../../services/api/experienceCards';
import * as secureStorage from '../../../utils/secureStorage';

type Tab = 'my' | 'discover';

// ─── Category display names ───────────────────────────────────────
const CATEGORY_LABELS: Record<string, { en: string; tr: string }> = {
  food_dining:     { en: 'Food & Dining',          tr: 'Yeme & İçme' },
  activities:      { en: 'Activities & Experiences', tr: 'Aktiviteler' },
  lifestyle:       { en: 'Lifestyle',              tr: 'Yaşam Tarzı' },
  special_interest:{ en: 'Special Interest',       tr: 'Özel İlgi Alanları' },
};

export default function ExperienceWeightsScreen() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const {
    experienceWeights,
    isLoading,
    error,
    fetchExperienceWeights,
    updateExperienceWeights,
    clearError,
  } = useProfileContext();

  const [activeTab, setActiveTab]         = useState<Tab>('my');
  const [localWeights, setLocalWeights]   = useState<Record<number, number>>({});
  const [isSaving, setIsSaving]           = useState(false);
  const [hasChanges, setHasChanges]       = useState(false);

  // All cards catalogue
  const [allGrouped, setAllGrouped]       = useState<Record<string, any>>({});
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [addingCardId, setAddingCardId]   = useState<number | null>(null);
  const [removingCardId, setRemovingCardId] = useState<number | null>(null);

  // ── Load user weights on mount ──────────────────────────────────
  useEffect(() => { fetchExperienceWeights(); }, [fetchExperienceWeights]);

  useEffect(() => {
    if (experienceWeights.length > 0) {
      const map: Record<number, number> = {};
      experienceWeights.forEach(w => { map[w.cardId] = w.weight; });
      setLocalWeights(map);
    }
  }, [experienceWeights]);

  useEffect(() => {
    if (error) Alert.alert('Hata', error, [{ text: 'Tamam', onPress: clearError }]);
  }, [error, clearError]);

  // ── Load full catalogue when Discover tab opens ─────────────────
  useEffect(() => {
    if (activeTab === 'discover' && Object.keys(allGrouped).length === 0) {
      loadCatalog();
    }
  }, [activeTab]);

  const loadCatalog = async () => {
    setCatalogLoading(true);
    try {
      const res = await getGroupedExperienceCards();
      if (res.success && res.data) setAllGrouped(res.data);
    } catch {
      // ignore — handled by empty state
    } finally {
      setCatalogLoading(false);
    }
  };

  // ── Weights tab actions ──────────────────────────────────────────
  const handleBack = () => {
    if (hasChanges) {
      Alert.alert(
        t('settings.unsavedChanges'),
        t('settings.unsavedChangesMsg'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('settings.discard'), style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleSaveWeights = async () => {
    setIsSaving(true);
    const weights = Object.entries(localWeights).map(([cardId, weight]) => ({
      cardId: parseInt(cardId, 10),
      weight,
    }));
    const result = await updateExperienceWeights(weights);
    setIsSaving(false);
    if (result.success) {
      setHasChanges(false);
      Alert.alert(t('common.success'), t('settings.cardAdded'));
    } else {
      Alert.alert('Hata', result.message);
    }
  };

  const updateWeight = (cardId: number, weight: number) => {
    setLocalWeights(prev => ({ ...prev, [cardId]: weight }));
    setHasChanges(true);
  };

  const handleRemoveCard = (cardId: number, cardName: string) => {
    if (experienceWeights.length <= 4) {
      Alert.alert('Hata', t('settings.minCardsError'));
      return;
    }
    Alert.alert(
      t('settings.removeCard'),
      `"${cardName}" ${locale === 'tr' ? 'ilgi alanından kaldırılsın mı?' : 'will be removed from your interests.'}`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.removeCard'),
          style: 'destructive',
          onPress: async () => {
            setRemovingCardId(cardId);
            const token = await secureStorage.getToken();
            if (!token) { setRemovingCardId(null); return; }
            const remainingIds = experienceWeights
              .filter(w => w.cardId !== cardId)
              .map(w => w.cardId);
            const res = await updateUserExperienceCards(token, remainingIds);
            setRemovingCardId(null);
            if (res.success) {
              await fetchExperienceWeights();
              Alert.alert(t('common.success'), t('settings.cardRemoved'));
            } else {
              Alert.alert('Hata', res.message);
            }
          },
        },
      ]
    );
  };

  // ── Discover tab actions ─────────────────────────────────────────
  const selectedIds = new Set(experienceWeights.map(w => w.cardId));

  const handleAddCard = async (cardId: number) => {
    setAddingCardId(cardId);
    const token = await secureStorage.getToken();
    if (!token) { setAddingCardId(null); return; }
    const newIds = [...Array.from(selectedIds), cardId];
    const res = await updateUserExperienceCards(token, newIds);
    setAddingCardId(null);
    if (res.success) {
      await fetchExperienceWeights();
      Alert.alert(t('common.success'), t('settings.cardAdded'));
    } else {
      Alert.alert('Hata', t('settings.addError'));
    }
  };

  // ── Weight color ─────────────────────────────────────────────────
  const weightColor = (w: number) => {
    switch (w) {
      case 1: return '#ef4444';
      case 2: return '#f97316';
      case 3: return '#eab308';
      case 4: return '#22c55e';
      case 5: return '#E91E63';
      default: return '#666';
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={18} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.interestWeightsTitle')}</Text>
        {activeTab === 'my' ? (
          <TouchableOpacity
            onPress={handleSaveWeights}
            style={[styles.saveButton, (!hasChanges || isSaving) && styles.saveButtonDisabled]}
            disabled={!hasChanges || isSaving}
          >
            {isSaving
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.saveButtonText}>{t('settings.saveWeights')}</Text>}
          </TouchableOpacity>
        ) : (
          <View style={{ width: 64 }} />
        )}
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'my' && styles.tabBtnActive]}
          onPress={() => setActiveTab('my')}
        >
          <FontAwesome5 name="heart" size={13} color={activeTab === 'my' ? '#E91E63' : '#999'} />
          <Text style={[styles.tabLabel, activeTab === 'my' && styles.tabLabelActive]}>
            {t('settings.myInterests')}
          </Text>
          <View style={[styles.tabCount, activeTab === 'my' && styles.tabCountActive]}>
            <Text style={[styles.tabCountText, activeTab === 'my' && styles.tabCountTextActive]}>
              {experienceWeights.length}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'discover' && styles.tabBtnActive]}
          onPress={() => setActiveTab('discover')}
        >
          <FontAwesome5 name="compass" size={13} color={activeTab === 'discover' ? '#E91E63' : '#999'} />
          <Text style={[styles.tabLabel, activeTab === 'discover' && styles.tabLabelActive]}>
            {t('settings.discoverMore')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── MY INTERESTS TAB ── */}
      {activeTab === 'my' && (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionSubtitle}>{t('settings.interestWeightsSubtitle')}</Text>
          <Text style={styles.legend}>{t('settings.weightLegend')}</Text>

          {isLoading && experienceWeights.length === 0 ? (
            <ActivityIndicator size="large" color="#E91E63" style={{ marginTop: 40 }} />
          ) : experienceWeights.length === 0 ? (
            <View style={styles.emptyState}>
              <FontAwesome5 name="compass" size={40} color="#ccc" />
              <Text style={styles.emptyText}>{t('profile.noInterestsYet')}</Text>
              <TouchableOpacity style={styles.discoverBtn} onPress={() => setActiveTab('discover')}>
                <Text style={styles.discoverBtnText}>{t('settings.discoverMore')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            experienceWeights.map(item => {
              const weight = localWeights[item.cardId] ?? item.weight;
              const name = locale === 'tr'
                ? (item.cardNameTr || item.cardName || item.cardSlug || '')
                : (item.cardName || item.cardNameTr || item.cardSlug || '');
              const isRemoving = removingCardId === item.cardId;
              return (
                <View key={item.cardId} style={styles.card}>
                  {/* Card header */}
                  <View style={styles.cardRow}>
                    <Text style={styles.cardName}>{name}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveCard(item.cardId, name)}
                      disabled={isRemoving}
                      style={styles.removeBtn}
                    >
                      {isRemoving
                        ? <ActivityIndicator size="small" color="#ef4444" />
                        : <FontAwesome5 name="times" size={14} color="#ef4444" />}
                    </TouchableOpacity>
                  </View>

                  {/* Weight buttons */}
                  <View style={styles.weightRow}>
                    {[1, 2, 3, 4, 5].map(w => (
                      <TouchableOpacity
                        key={w}
                        style={[styles.weightBtn, weight === w && { backgroundColor: weightColor(w) }]}
                        onPress={() => updateWeight(item.cardId, w)}
                      >
                        <Text style={[styles.weightBtnText, weight === w && styles.weightBtnTextActive]}>
                          {w}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.weightScaleRow}>
                    <Text style={styles.weightScaleLabel}>{locale === 'tr' ? 'Nadiren' : 'Rarely'}</Text>
                    <View style={styles.weightBar}>
                      {[1, 2, 3, 4, 5].map(dot => (
                        <View key={dot} style={[styles.weightDot, dot <= weight && { backgroundColor: weightColor(weight) }]} />
                      ))}
                    </View>
                    <Text style={styles.weightScaleLabel}>{locale === 'tr' ? 'Her Zaman' : 'Always'}</Text>
                  </View>
                </View>
              );
            })
          )}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}

      {/* ── DISCOVER MORE TAB ── */}
      {activeTab === 'discover' && (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionSubtitle}>{t('settings.discoverMoreSubtitle')}</Text>

          {catalogLoading ? (
            <View style={styles.centerLoad}>
              <ActivityIndicator size="large" color="#E91E63" />
              <Text style={styles.loadingText}>{t('common.loading')}</Text>
            </View>
          ) : (
            Object.entries(allGrouped).map(([categoryKey, categoryData]: [string, any]) => {
              const cards: any[] = categoryData?.cards ?? [];
              const unselected = cards.filter((c: any) => !selectedIds.has(c.id));
              if (unselected.length === 0) return null;

              const catLabel = locale === 'tr'
                ? (CATEGORY_LABELS[categoryKey]?.tr ?? categoryKey)
                : (CATEGORY_LABELS[categoryKey]?.en ?? categoryKey);

              return (
                <View key={categoryKey} style={styles.categorySection}>
                  <Text style={styles.categoryTitle}>{catLabel}</Text>
                  {unselected.map((card: any) => {
                    const cardName = locale === 'tr'
                      ? (card.name_tr || card.nameTr || card.name_en || card.nameEn || card.slug || '')
                      : (card.name_en || card.nameEn || card.name_tr || card.nameTr || card.slug || '');
                    const isAdding = addingCardId === card.id;
                    return (
                      <View key={card.id} style={styles.discoverCard}>
                        <View style={styles.discoverCardInfo}>
                          <Text style={styles.discoverCardName}>{cardName}</Text>
                          {(card.description_en || card.descriptionEn) && (
                            <Text style={styles.discoverCardDesc} numberOfLines={2}>
                              {locale === 'tr'
                                ? (card.description_tr || card.descriptionTr || card.description_en || card.descriptionEn)
                                : (card.description_en || card.descriptionEn || card.description_tr || card.descriptionTr)}
                            </Text>
                          )}
                        </View>
                        <TouchableOpacity
                          style={[styles.addBtn, isAdding && styles.addBtnLoading]}
                          onPress={() => handleAddCard(card.id)}
                          disabled={isAdding}
                        >
                          {isAdding
                            ? <ActivityIndicator size="small" color="#fff" />
                            : (
                              <>
                                <FontAwesome5 name="plus" size={11} color="#fff" />
                                <Text style={styles.addBtnText}>{t('settings.addCard')}</Text>
                              </>
                            )}
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              );
            })
          )}

          {/* Already added all cards message */}
          {!catalogLoading && Object.entries(allGrouped).every(([, d]: [string, any]) => {
            const cards: any[] = d?.cards ?? [];
            return cards.every((c: any) => selectedIds.has(c.id));
          }) && Object.keys(allGrouped).length > 0 && (
            <View style={styles.allAddedState}>
              <FontAwesome5 name="check-circle" size={40} color="#10B981" />
              <Text style={styles.allAddedText}>
                {locale === 'tr' ? 'Tüm ilgi alanları eklendi!' : 'All available interests added!'}
              </Text>
            </View>
          )}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#fff' },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', flex: 1, textAlign: 'center', marginHorizontal: 8 },
  saveButton: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 64,
    alignItems: 'center',
  },
  saveButtonDisabled: { backgroundColor: '#ccc' },
  saveButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  /* Tab bar */
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive:   { borderBottomColor: '#E91E63' },
  tabLabel:       { fontSize: 14, color: '#999', fontWeight: '500' },
  tabLabelActive: { color: '#E91E63', fontWeight: '700' },
  tabCount: {
    backgroundColor: '#eee',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tabCountActive:     { backgroundColor: 'rgba(233,30,99,0.12)' },
  tabCountText:       { fontSize: 11, color: '#999', fontWeight: '600' },
  tabCountTextActive: { color: '#E91E63' },

  /* Common */
  scroll:          { flex: 1 },
  sectionSubtitle: { fontSize: 13, color: '#888', marginHorizontal: 16, marginTop: 16, marginBottom: 4, lineHeight: 18 },
  legend:          { fontSize: 12, color: '#bbb', marginHorizontal: 16, marginBottom: 16 },

  /* My Interests tab */
  card: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: '#fafafa',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', flex: 1 },
  removeBtn: { padding: 6 },
  weightRow:  { flexDirection: 'row', justifyContent: 'space-between', gap: 6, marginBottom: 8 },
  weightBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weightBtnText:       { fontSize: 15, fontWeight: '600', color: '#999' },
  weightBtnTextActive: { color: '#fff' },
  weightScaleRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  weightScaleLabel:{ fontSize: 10, color: '#bbb' },
  weightBar:       { flex: 1, flexDirection: 'row', gap: 4, justifyContent: 'center' },
  weightDot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: '#eee' },

  /* Discover tab */
  categorySection: { marginTop: 20, paddingHorizontal: 16 },
  categoryTitle:   { fontSize: 13, fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  discoverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    gap: 12,
  },
  discoverCardInfo: { flex: 1 },
  discoverCardName: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
  discoverCardDesc: { fontSize: 12, color: '#888', lineHeight: 16 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E91E63',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 58,
    justifyContent: 'center',
  },
  addBtnLoading: { backgroundColor: '#ccc' },
  addBtnText:    { color: '#fff', fontSize: 12, fontWeight: '700' },

  /* Empty / loading states */
  emptyState:   { padding: 40, alignItems: 'center' },
  emptyText:    { color: '#aaa', fontSize: 14, textAlign: 'center', marginTop: 12, lineHeight: 20 },
  discoverBtn:  { marginTop: 16, backgroundColor: '#E91E63', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  discoverBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  centerLoad:   { paddingTop: 60, alignItems: 'center', gap: 12 },
  loadingText:  { color: '#aaa', fontSize: 14 },
  allAddedState:{ paddingVertical: 48, alignItems: 'center', gap: 12 },
  allAddedText: { fontSize: 15, color: '#10B981', fontWeight: '600', textAlign: 'center' },
});
