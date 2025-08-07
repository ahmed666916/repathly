import { StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Text, View } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface InterestCategory {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
}

export default function InterestSelectionScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<InterestCategory[]>([
    { id: 'food', name: 'Yemek & İçecek', icon: '🍽️', enabled: true },
    { id: 'history', name: 'Tarih & Müze', icon: '🏛️', enabled: false },
    { id: 'art', name: 'Sanat & Kültür', icon: '🎨', enabled: false },
    { id: 'adventure', name: 'Macera & Spor', icon: '🏔️', enabled: false },
    { id: 'nature', name: 'Doğa & Manzara', icon: '🌿', enabled: true },
    { id: 'nightlife', name: 'Gece Hayatı', icon: '🌃', enabled: false },
  ]);

  const toggleCategory = (categoryId: string) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, enabled: !cat.enabled }
          : cat
      )
    );
  };

  // En az bir kategori seçili mi kontrol et
  const hasSelectedCategories = categories.some(cat => cat.enabled);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>İlgi Alanlarınızı Seçin</Text>
        <Text style={styles.subtitle}>
          Size özel öneriler sunabilmemiz için seyahat tercihlerinizi belirtin.
        </Text>
      </View>

      <View style={styles.categoriesContainer}>
        {categories.map((category) => (
          <View key={category.id} style={styles.categoryItem}>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
            </View>
            <Switch
              value={category.enabled}
              onValueChange={() => toggleCategory(category.id)}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={category.enabled ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.routeButton, 
            !hasSelectedCategories && styles.disabledButton
          ]} 
          onPress={() => {
            if (hasSelectedCategories) {
              router.push('/(app)/route-planner');
            }
          }}
          disabled={!hasSelectedCategories}
        >
          <FontAwesome 
            name="map" 
            size={18} 
            color={hasSelectedCategories ? "#fff" : "#999"} 
            style={styles.routeIcon} 
          />
          <Text style={[
            styles.routeButtonText,
            !hasSelectedCategories && styles.disabledButtonText
          ]}>
            Rota Seçin
          </Text>
          <FontAwesome 
            name="chevron-right" 
            size={16} 
            color={hasSelectedCategories ? "#fff" : "#999"} 
          />
        </TouchableOpacity>
        
        <Text style={styles.footerText}>
          Seçimlerinizi istediğiniz zaman değiştirebilirsiniz.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginVertical: 5,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  routeButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  routeIcon: {
    marginRight: 10,
  },
  routeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    elevation: 1,
    shadowOpacity: 0.1,
  },
  disabledButtonText: {
    color: '#999',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
