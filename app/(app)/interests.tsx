import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';

interface InterestCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  imageUri: string;
  selected: boolean;
}

export default function InterestSelectionScreen() {
  const router = useRouter();
  const { destination, waypoints } = useLocalSearchParams();
  const handleBack = () => {
    const r: any = router as any;
    if (r?.canGoBack?.()) {
      r.back();
    } else {
      r.replace('/(app)');
    }
  };
  const [categories, setCategories] = useState<InterestCategory[]>([
    {
      id: 'food',
      name: 'Yemek & İçecek',
      icon: 'cutlery',
      description: 'Lezzetli restoran ve kafeleri keşfedin',
      imageUri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
      selected: false,
    },
    {
      id: 'history',
      name: 'Tarih & Müze',
      icon: 'institution',
      description: 'Tarihi yerler ve müzeleri gezin',
      imageUri: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=400&h=300&fit=crop',
      selected: false,
    },
    {
      id: 'art',
      name: 'Sanat & Kültür',
      icon: 'paint-brush',
      description: 'Sanat galerileri ve kültürel etkinlikler',
      imageUri: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
      selected: false,
    },
    {
      id: 'adventure',
      name: 'Macera & Spor',
      icon: 'bicycle',
      description: 'Açık hava aktiviteleri ve spor alanları',
      imageUri: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop',
      selected: false,
    },
    {
      id: 'nature',
      name: 'Doğa & Manzara',
      icon: 'tree',
      description: 'Doğal güzellikler ve parklar',
      imageUri: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
      selected: false,
    },
    {
      id: 'nightlife',
      name: 'Gece Hayatı',
      icon: 'moon-o',
      description: 'Barlar, kulüpler ve gece eğlenceleri',
      imageUri: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop',
      selected: false,
    },
  ]);

  // SÜPER AGRESIF reset kontrolü - sayfa her açıldığında ZORLA sıfırla
  useEffect(() => {
    console.log('🔥 İlgi alanları sayfası açıldı, ZORLA reset kontrolü yapılıyor...');
    console.log('shouldResetInputs değeri:', (global as any).shouldResetInputs);
    console.log('forceReset değeri:', (global as any).forceReset);
    console.log('selectedInterests değeri:', (global as any).selectedInterests);
    
    // HER DURUMDA ÖNCE TEMİZLE - koşulsuz temizlik
    console.log('🧹 ÖNCE HER DURUMDA TEMİZLENİYOR...');
    setCategories(prev => 
      prev.map(cat => ({ ...cat, selected: false }))
    );
    
    // EĞER RESET FLAG'İ VARSA GLOBAL'İ DE TEMİZLE
    if ((global as any).shouldResetInputs || (global as any).forceReset) {
      console.log('🔥 GLOBAL STATE TEMİZLENİYOR...');
      (global as any).selectedInterests = [];
      delete (global as any).selectedInterests;
      (global as any).shouldResetInputs = false;
      (global as any).forceReset = false;
    }
  }, []);

  // Sayfa focus olduğunda da ZORLA kontrol et
  useFocusEffect(
    useCallback(() => {
      console.log('🎯 İlgi alanları sayfası focus oldu, ZORLA kontrol ediliyor...');
      
      // HER FOCUS'TA ÖNCE TEMİZLE
      console.log('🧹 FOCUS TE TEMİZLENİYOR...');
      setCategories(prev => 
        prev.map(cat => ({ ...cat, selected: false }))
      );
      
      if ((global as any).shouldResetInputs || (global as any).forceReset) {
        console.log('🔥 FOCUS GLOBAL STATE TEMİZLENİYOR...');
        (global as any).selectedInterests = [];
        delete (global as any).selectedInterests;
        (global as any).shouldResetInputs = false;
        (global as any).forceReset = false;
      }
    }, [])
  );

  const toggleCategory = (categoryId: string) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, selected: !cat.selected }
          : cat
      )
    );
  };

  // En az bir kategori seçili mi kontrol et
  const hasSelectedCategories = categories.some(cat => cat.selected);

  const handleContinue = () => {
    if (!hasSelectedCategories) {
      Alert.alert('Uyarı', 'Lütfen en az bir ilgi alanı seçin.');
      return;
    }
    
    const selectedCategories = categories.filter(cat => cat.selected);
    router.push({
      pathname: '/(app)/recommendations',
      params: {
        selectedInterests: JSON.stringify(selectedCategories.map(cat => cat.id)),
        destination: destination,
        waypoints: waypoints
      }
    });
  };

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
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
            >
              <FontAwesome name="arrow-left" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>İlgi Alanları</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>İlgi alanlarınızı seçin lütfen</Text>
              <Text style={styles.subtitle}>
                Size özel yerler önerebilmemiz için ilgi alanlarınızı seçin
              </Text>
            </View>

            {/* Categories Grid */}
            <View style={styles.categoriesGrid}>
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    category.selected && styles.selectedCard
                  ]}
                  onPress={() => toggleCategory(category.id)}
                  activeOpacity={0.8}
                >
                  <ImageBackground
                    source={{ uri: category.imageUri }}
                    style={styles.categoryImage}
                    imageStyle={styles.categoryImageStyle}
                  >
                    <View style={styles.categoryOverlay}>
                      {category.selected && (
                        <View style={styles.checkMarkContainer}>
                          <FontAwesome name="check" size={16} color="#fff" />
                        </View>
                      )}
                    </View>
                  </ImageBackground>
                  
                  <View style={styles.categoryInfo}>
                    <FontAwesome name={category.icon as any} size={20} color="#E91E63" style={styles.categoryIcon} />
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryDescription}>{category.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Continue Button */}
          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                !hasSelectedCategories && styles.disabledButton
              ]}
              onPress={handleContinue}
              disabled={!hasSelectedCategories}
            >
              <FontAwesome 
                name="star" 
                size={20} 
                color={hasSelectedCategories ? "#fff" : "#999"} 
                style={styles.buttonIcon} 
              />
              <Text style={[
                styles.continueButtonText,
                !hasSelectedCategories && styles.disabledButtonText
              ]}>
                Önerileri Gör ({categories.filter(c => c.selected).length})
              </Text>
              <FontAwesome 
                name="chevron-right" 
                size={18} 
                color={hasSelectedCategories ? "#fff" : "#999"} 
              />
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
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  titleSection: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#E91E63',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  categoryImage: {
    height: 120,
    justifyContent: 'flex-end',
  },
  categoryImageStyle: {
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 10,
  },
  checkMarkContainer: {
    backgroundColor: '#E91E63',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  categoryInfo: {
    padding: 15,
    alignItems: 'center',
  },
  categoryIcon: {
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  categoryDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: '#E91E63',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  buttonIcon: {
    marginRight: 12,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#999',
    elevation: 2,
    shadowOpacity: 0.1,
  },
  disabledButtonText: {
    color: '#ccc',
  },
});
