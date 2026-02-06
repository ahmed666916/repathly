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
import { weightLabels } from '../../../services/api/profile';

export default function ExperienceWeightsScreen() {
  const router = useRouter();
  const {
    experienceWeights,
    isLoading,
    error,
    fetchExperienceWeights,
    updateExperienceWeights,
    clearError,
  } = useProfileContext();

  const [localWeights, setLocalWeights] = useState<Record<number, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchExperienceWeights();
  }, [fetchExperienceWeights]);

  useEffect(() => {
    if (experienceWeights.length > 0) {
      const weightsMap: Record<number, number> = {};
      experienceWeights.forEach(w => {
        weightsMap[w.cardId] = w.weight;
      });
      setLocalWeights(weightsMap);
    }
  }, [experienceWeights]);

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

    const weights = Object.entries(localWeights).map(([cardId, weight]) => ({
      cardId: parseInt(cardId, 10),
      weight,
    }));

    const result = await updateExperienceWeights(weights);
    setIsSaving(false);

    if (result.success) {
      setHasChanges(false);
      Alert.alert('Basarili', 'Deneyim agirliklari guncellendi.');
    } else {
      Alert.alert('Hata', result.message);
    }
  };

  const updateWeight = (cardId: number, weight: number) => {
    setLocalWeights(prev => ({ ...prev, [cardId]: weight }));
    setHasChanges(true);
  };

  const getWeightLabel = (weight: number): string => {
    return weightLabels[weight]?.tr || 'Bilinmiyor';
  };

  const getWeightColor = (weight: number): string => {
    switch (weight) {
      case 1:
        return '#ef4444';
      case 2:
        return '#f97316';
      case 3:
        return '#eab308';
      case 4:
        return '#22c55e';
      case 5:
        return '#E91E63';
      default:
        return '#666';
    }
  };

  if (isLoading && experienceWeights.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E91E63" />
          <Text style={styles.loadingText}>Yukleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deneyim Agirliklari</Text>
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
          <Text style={styles.introTitle}>Ilgi Alanlarinizi Ayarlayin</Text>
          <Text style={styles.introText}>
            Her deneyim karti icin ne kadar ilgilendiginizi belirleyin.
            Daha yuksek degerler, o ture uygun mekanlarin rotanizda daha cok yer almasini saglar.
          </Text>
        </View>

        {/* Weight Legend */}
        <View style={styles.legendContainer}>
          {[1, 2, 3, 4, 5].map(weight => (
            <View key={weight} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: getWeightColor(weight) }]} />
              <Text style={styles.legendText}>{weight}</Text>
            </View>
          ))}
        </View>

        <View style={styles.cardsContainer}>
          {experienceWeights.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FontAwesome5 name="inbox" size={48} color="#ccc" />
              <Text style={styles.emptyText}>
                Henuz deneyim karti secmediniz.
                Onboarding sirasinda en az 4 kart secmelisiniz.
              </Text>
            </View>
          ) : (
            experienceWeights.map(item => {
              const weight = localWeights[item.cardId] ?? item.weight;
              return (
                <View key={item.cardId} style={styles.cardItem}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardName}>{item.cardNameTr || item.cardName}</Text>
                  </View>
                  <Text style={styles.weightLabel}>{getWeightLabel(weight)}</Text>
                  <View style={styles.weightButtons}>
                    {[1, 2, 3, 4, 5].map(w => (
                      <TouchableOpacity
                        key={w}
                        style={[
                          styles.weightButton,
                          weight === w && { backgroundColor: getWeightColor(w) },
                        ]}
                        onPress={() => updateWeight(item.cardId, w)}
                      >
                        <Text
                          style={[
                            styles.weightButtonText,
                            weight === w && styles.weightButtonTextActive,
                          ]}
                        >
                          {w}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.sliderLabels}>
                    <Text style={styles.sliderLabelText}>Nadiren</Text>
                    <Text style={styles.sliderLabelText}>Her zaman</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  introTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  introText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
  cardsContainer: {
    padding: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
  cardItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  weightBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weightBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  weightLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  weightButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  weightButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weightButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  weightButtonTextActive: {
    color: '#fff',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabelText: {
    fontSize: 11,
    color: '#999',
  },
});
