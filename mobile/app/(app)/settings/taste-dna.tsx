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
import { useProfileContext } from '../../contexts/ProfileContext';
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
} from '../../../services/api/profile';

type OptionItem<T extends string> = {
  value: T;
  label: string;
};

export default function TasteDNAScreen() {
  const router = useRouter();
  const { profile, isLoading, error, fetchProfile, updateProfile, clearError } = useProfileContext();

  const [localProfile, setLocalProfile] = useState({
    travelStyle: 'balanced' as TravelStyle,
    detourTolerance: 'medium' as DetourTolerance,
    budgetSensitivity: 'moderate' as BudgetSensitivity,
    preferredGroupType: 'solo' as GroupType,
    stopIntensity: 'moderate' as StopIntensity,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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

  useEffect(() => {
    if (error) {
      Alert.alert('Hata', error, [{ text: 'Tamam', onPress: clearError }]);
    }
  }, [error, clearError]);

  const handleBack = () => {
    if (hasChanges) {
      Alert.alert(
        'Kaydetmeden Cik',
        'Degisiklikler kaydedilmedi. Cikmak istediginize emin misiniz?',
        [
          { text: 'Iptal', style: 'cancel' },
          { text: 'Cikmak', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateProfile(localProfile);
    setIsSaving(false);

    if (result.success) {
      setHasChanges(false);
      Alert.alert('Basarili', 'Profil tercihleri guncellendi.');
    } else {
      Alert.alert('Hata', result.message);
    }
  };

  const updateField = <K extends keyof typeof localProfile>(field: K, value: typeof localProfile[K]) => {
    setLocalProfile(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const renderOptionGroup = <T extends string>(
    label: string,
    description: string,
    options: OptionItem<T>[],
    value: T,
    onChange: (value: T) => void
  ) => (
    <View style={styles.optionGroup}>
      <Text style={styles.optionLabel}>{label}</Text>
      <Text style={styles.optionDescription}>{description}</Text>
      <View style={styles.optionsContainer}>
        {options.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              value === option.value && styles.optionButtonActive,
            ]}
            onPress={() => onChange(option.value)}
          >
            <Text
              style={[
                styles.optionButtonText,
                value === option.value && styles.optionButtonTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (isLoading && !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E91E63" />
          <Text style={styles.loadingText}>Yukleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const travelStyleOptions: OptionItem<TravelStyle>[] = [
    { value: 'fast', label: travelStyleLabels.fast.tr },
    { value: 'balanced', label: travelStyleLabels.balanced.tr },
    { value: 'experience_first', label: travelStyleLabels.experience_first.tr },
  ];

  const detourToleranceOptions: OptionItem<DetourTolerance>[] = [
    { value: 'low', label: detourToleranceLabels.low.tr },
    { value: 'medium', label: detourToleranceLabels.medium.tr },
    { value: 'high', label: detourToleranceLabels.high.tr },
  ];

  const budgetOptions: OptionItem<BudgetSensitivity>[] = [
    { value: 'budget', label: budgetSensitivityLabels.budget.tr },
    { value: 'moderate', label: budgetSensitivityLabels.moderate.tr },
    { value: 'premium', label: budgetSensitivityLabels.premium.tr },
    { value: 'any', label: budgetSensitivityLabels.any.tr },
  ];

  const groupTypeOptions: OptionItem<GroupType>[] = [
    { value: 'solo', label: groupTypeLabels.solo.tr },
    { value: 'couple', label: groupTypeLabels.couple.tr },
    { value: 'friends', label: groupTypeLabels.friends.tr },
    { value: 'family', label: groupTypeLabels.family.tr },
  ];

  const stopIntensityOptions: OptionItem<StopIntensity>[] = [
    { value: 'minimal', label: stopIntensityLabels.minimal.tr },
    { value: 'moderate', label: stopIntensityLabels.moderate.tr },
    { value: 'frequent', label: stopIntensityLabels.frequent.tr },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seyahat Tercihlerim</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveButton, !hasChanges && styles.saveButtonDisabled]}
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Kaydet</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introContainer}>
          <FontAwesome5 name="dna" size={32} color="#E91E63" />
          <Text style={styles.introTitle}>Seyahat DNA'niz</Text>
          <Text style={styles.introText}>
            Bu tercihler rotalarinizin nasil olusturulacagini belirler.
            Tercihlerinizi dilediginiz zaman degistirebilirsiniz.
          </Text>
        </View>

        <View style={styles.formContainer}>
          {renderOptionGroup(
            'Seyahat Stili',
            'Yolculuklarda zaman mi deneyim mi oncelikli?',
            travelStyleOptions,
            localProfile.travelStyle,
            (value) => updateField('travelStyle', value)
          )}

          {renderOptionGroup(
            'Sapma Toleransi',
            'Ana rotadan ne kadar sapmaya aciksiniz?',
            detourToleranceOptions,
            localProfile.detourTolerance,
            (value) => updateField('detourTolerance', value)
          )}

          {renderOptionGroup(
            'Butce Tercihi',
            'Hangi fiyat araliginda mekanlar tercih edersiniz?',
            budgetOptions,
            localProfile.budgetSensitivity,
            (value) => updateField('budgetSensitivity', value)
          )}

          {renderOptionGroup(
            'Grup Tipi',
            'Genellikle kimlerle seyahat ediyorsunuz?',
            groupTypeOptions,
            localProfile.preferredGroupType,
            (value) => updateField('preferredGroupType', value)
          )}

          {renderOptionGroup(
            'Durak Yogunlugu',
            'Yolculukta ne siklikta durmak istersiniz?',
            stopIntensityOptions,
            localProfile.stopIntensity,
            (value) => updateField('stopIntensity', value)
          )}
        </View>

        {/* Experience Weights Link */}
        <TouchableOpacity
          style={styles.experienceWeightsLink}
          onPress={() => router.push('/settings/experience-weights' as any)}
        >
          <View style={styles.linkContent}>
            <FontAwesome5 name="sliders-h" size={20} color="#E91E63" />
            <View style={styles.linkTextContainer}>
              <Text style={styles.linkTitle}>Deneyim Agirliklarini Duzenle</Text>
              <Text style={styles.linkDescription}>
                Sectiginiz deneyim kartlarinin onecelik sirasini ayarlayin
              </Text>
            </View>
          </View>
          <FontAwesome5 name="chevron-right" size={16} color="#999" />
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 35,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  introContainer: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  introTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  introText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  formContainer: {
    padding: 20,
  },
  optionGroup: {
    marginBottom: 28,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  optionButtonActive: {
    backgroundColor: '#E91E63',
    borderColor: '#E91E63',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#333',
  },
  optionButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  experienceWeightsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  linkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  linkTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  linkTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  linkDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
