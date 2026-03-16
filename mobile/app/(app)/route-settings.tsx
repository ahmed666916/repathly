import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Switch,
  ImageBackground,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLanguage } from '../../contexts/LanguageContext';
import { useProfileContext } from '../../contexts/ProfileContext';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type RouteMode = 'pass_through' | 'casual' | 'flexible';

export interface RouteSettings {
  mode: RouteMode;
  selectedCardIds: number[];
  detourMinutes: number;
  stopDensity: number;
  scenicPriority: boolean;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const DETOUR_OPTIONS = [
  { label: 'None', labelTr: 'Hiç', value: 0 },
  { label: '30m',  labelTr: '30dk', value: 30 },
  { label: '1h',   labelTr: '1s',   value: 60 },
  { label: '1.5h', labelTr: '1.5s', value: 90 },
  { label: '2h',   labelTr: '2s',   value: 120 },
  { label: '3h',   labelTr: '3s',   value: 180 },
];

const STOP_DENSITY_OPTIONS = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5+', value: 5 },
];

const MODE_CONFIG: Record<RouteMode, { icon: string; color: string }> = {
  pass_through: { icon: 'bolt',    color: '#F59E0B' },
  casual:       { icon: 'road',    color: '#3B82F6' },
  flexible:     { icon: 'compass', color: '#10B981' },
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function RouteSettingsScreen() {
  const router = useRouter();
  const { destination } = useLocalSearchParams<{ destination: string }>();
  const { t, locale } = useLanguage();
  const { experienceWeights, fetchExperienceWeights } = useProfileContext();

  const [mode, setMode]                       = useState<RouteMode>('casual');
  const [selectedCardIds, setSelectedCardIds] = useState<number[]>([]);
  const [detourMinutes, setDetourMinutes]     = useState(60);
  const [stopDensity, setStopDensity]         = useState(3);
  const [scenicPriority, setScenicPriority]   = useState(false);

  // Load experience weights and pre-select all
  useEffect(() => {
    fetchExperienceWeights();
  }, [fetchExperienceWeights]);

  useEffect(() => {
    if (experienceWeights.length > 0) {
      setSelectedCardIds(experienceWeights.map(w => w.cardId));
    }
  }, [experienceWeights]);

  const toggleCard = (cardId: number) => {
    setSelectedCardIds(prev =>
      prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]
    );
  };

  const getWeightColor = (weight: number): string => {
    if (weight >= 5) return '#10B981';
    if (weight >= 4) return '#3B82F6';
    if (weight >= 3) return '#F59E0B';
    if (weight >= 2) return '#EF4444';
    return '#9CA3AF';
  };

  const handleContinue = () => {
    const settings: RouteSettings = {
      mode,
      selectedCardIds,
      detourMinutes,
      stopDensity,
      scenicPriority,
    };
    // Store globally so route-preview can read it without deep param threading
    (global as any).routeSettings = settings;

    router.push({
      pathname: '/(app)/waypoints',
      params: { destination },
    });
  };

  const modes: Array<{ key: RouteMode; titleKey: string; descKey: string; philKey: string }> = [
    { key: 'pass_through', titleKey: 'passThrough', descKey: 'passThroughDesc', philKey: 'passThroughPhilosophy' },
    { key: 'casual',       titleKey: 'casual',      descKey: 'casualDesc',      philKey: 'casualPhilosophy' },
    { key: 'flexible',     titleKey: 'flexible',    descKey: 'flexibleDesc',    philKey: 'flexiblePhilosophy' },
  ];

  return (
    <ImageBackground
      source={require('../../assets/images/loginbackground.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="light-content" />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <FontAwesome5 name="arrow-left" size={18} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>{t('routeSettings.title')}</Text>
              <Text style={styles.headerDest} numberOfLines={1}>→ {destination}</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.pageSubtitle}>{t('routeSettings.subtitle')}</Text>

            {/* ── Section 1: Route Mode ── */}
            <SectionHeader icon="sliders-h" title={t('routeSettings.routeMode')} subtitle={t('routeSettings.routeModeSubtitle')} />
            <View style={styles.modeGrid}>
              {modes.map(m => {
                const cfg = MODE_CONFIG[m.key];
                const selected = mode === m.key;
                return (
                  <TouchableOpacity
                    key={m.key}
                    style={[styles.modeCard, selected && { borderColor: cfg.color, borderWidth: 2 }]}
                    onPress={() => setMode(m.key)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.modeIconCircle, { backgroundColor: selected ? cfg.color : 'rgba(255,255,255,0.08)' }]}>
                      <FontAwesome5 name={cfg.icon} size={20} color={selected ? '#fff' : '#aaa'} />
                    </View>
                    <Text style={[styles.modeTitle, selected && { color: cfg.color }]}>
                      {t(`routeSettings.${m.titleKey}`)}
                    </Text>
                    <Text style={styles.modeDesc}>{t(`routeSettings.${m.descKey}`)}</Text>
                    {selected && (
                      <Text style={[styles.modePhil, { color: cfg.color }]}>
                        "{t(`routeSettings.${m.philKey}`)}"
                      </Text>
                    )}
                    {selected && (
                      <View style={[styles.modeCheckBadge, { backgroundColor: cfg.color }]}>
                        <FontAwesome5 name="check" size={10} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Section 2: Experience Chips ── */}
            <SectionHeader icon="heart" title={t('routeSettings.experiences')} subtitle={t('routeSettings.experiencesSubtitle')} />
            {experienceWeights.length === 0 ? (
              <Text style={styles.emptyChips}>{t('routeSettings.noExperiences')}</Text>
            ) : (
              <View style={styles.chipsWrap}>
                {experienceWeights.map(w => {
                  const isSelected = selectedCardIds.includes(w.cardId);
                  const color = getWeightColor(w.weight);
                  const name = locale === 'tr'
                    ? (w.cardNameTr || w.cardName || w.cardSlug || '')
                    : (w.cardName || w.cardNameTr || w.cardSlug || '');
                  return (
                    <TouchableOpacity
                      key={w.cardId}
                      style={[
                        styles.chip,
                        isSelected
                          ? { backgroundColor: color, borderColor: color }
                          : styles.chipInactive,
                      ]}
                      onPress={() => toggleCard(w.cardId)}
                      activeOpacity={0.75}
                    >
                      {isSelected && <FontAwesome5 name="check" size={10} color="#fff" style={{ marginRight: 5 }} />}
                      <Text style={[styles.chipText, !isSelected && styles.chipTextInactive]}>
                        {name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* ── Section 3: Detour Tolerance ── */}
            <SectionHeader icon="clock" title={t('routeSettings.detourTolerance')} subtitle={t('routeSettings.detourToleranceSubtitle')} />
            <View style={styles.pillRow}>
              {DETOUR_OPTIONS.map(opt => {
                const active = detourMinutes === opt.value;
                const label = locale === 'tr' ? opt.labelTr : opt.label;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.pill, active && styles.pillActive]}
                    onPress={() => setDetourMinutes(opt.value)}
                  >
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Section 4: Stop Density ── */}
            <SectionHeader icon="map-pin" title={t('routeSettings.stopDensity')} subtitle={t('routeSettings.stopDensitySubtitle')} />
            <View style={styles.densityRow}>
              <Text style={styles.densityLabel}>{t('routeSettings.fewStops')}</Text>
              <View style={styles.pillRow}>
                {STOP_DENSITY_OPTIONS.map(opt => {
                  const active = stopDensity === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.pill, styles.pillSquare, active && styles.pillActive]}
                      onPress={() => setStopDensity(opt.value)}
                    >
                      <Text style={[styles.pillText, active && styles.pillTextActive]}>{opt.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.densityLabel}>{t('routeSettings.manyStops')}</Text>
            </View>

            {/* ── Section 5: Scenic Priority ── */}
            <SectionHeader icon="mountain" title={t('routeSettings.scenicPriority')} subtitle={t('routeSettings.scenicPriorityDesc')} />
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <FontAwesome5 name="mountain" size={18} color={scenicPriority ? '#10B981' : '#666'} />
                <Text style={[styles.toggleLabel, scenicPriority && { color: '#10B981' }]}>
                  {t('routeSettings.scenicPriority')}
                </Text>
              </View>
              <Switch
                value={scenicPriority}
                onValueChange={setScenicPriority}
                trackColor={{ false: '#333', true: '#10B981' }}
                thumbColor="#fff"
              />
            </View>

            <View style={{ height: 32 }} />
          </ScrollView>

          {/* Continue Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.85}>
              <FontAwesome5 name="arrow-right" size={16} color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.continueBtnText}>{t('routeSettings.continue')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

// ─────────────────────────────────────────────
// Section header helper
// ─────────────────────────────────────────────
function SectionHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIconWrap}>
        <FontAwesome5 name={icon} size={14} color="#E91E63" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)' },
  safeArea: { flex: 1 },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: { flex: 1, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerDest:  { color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 2 },

  /* Page subtitle */
  pageSubtitle: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },

  /* Section header */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
    marginTop: 8,
  },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(233,30,99,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle:    { color: '#fff', fontSize: 15, fontWeight: '700' },
  sectionSubtitle: { color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 2, lineHeight: 16 },

  /* Divider */
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 20 },

  /* Route mode cards */
  modeGrid: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  modeCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    position: 'relative',
    minHeight: 140,
  },
  modeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  modeTitle: { color: '#fff', fontSize: 13, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  modeDesc:  { color: 'rgba(255,255,255,0.45)', fontSize: 10, textAlign: 'center', lineHeight: 14 },
  modePhil: {
    fontSize: 9,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 13,
    opacity: 0.85,
  },
  modeCheckBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Experience chips */
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipInactive: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.15)',
  },
  chipText:         { color: '#fff', fontSize: 13, fontWeight: '600' },
  chipTextInactive: { color: 'rgba(255,255,255,0.45)' },
  emptyChips: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 28,
    textAlign: 'center',
  },

  /* Pill selectors */
  pillRow: { flexDirection: 'row', gap: 8, marginBottom: 28, flexWrap: 'wrap' },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    minWidth: 48,
    alignItems: 'center',
  },
  pillSquare: { borderRadius: 12, minWidth: 44 },
  pillActive: { backgroundColor: '#E91E63', borderColor: '#E91E63' },
  pillText:       { color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '600' },
  pillTextActive: { color: '#fff' },

  /* Density row */
  densityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
  },
  densityLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 11 },

  /* Scenic toggle */
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  toggleInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleLabel: { color: '#fff', fontSize: 15, fontWeight: '600' },

  /* Footer */
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  continueBtn: {
    backgroundColor: '#E91E63',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  continueBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
