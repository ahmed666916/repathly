import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  SafeAreaView,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

interface Place {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  description: string;
  imageUri: string;
  address: string;
  priceLevel: number;
  selected: boolean;
}

export default function RecommendationsScreen() {
  const router = useRouter();
  const { selectedInterests, destination, waypoints } = useLocalSearchParams();
  const [places, setPlaces] = useState<Place[]>([]);

  useEffect(() => {
    generateLocationBasedRecommendations();
  }, [selectedInterests, destination, waypoints]);

  const generateLocationBasedRecommendations = () => {
    const interests = selectedInterests ? JSON.parse(selectedInterests as string) : [];
    const waypointsList = waypoints ? JSON.parse(waypoints as string) : [];
    
    // Rota sırası: İstanbul (başlangıç) → ara noktalar → hedef (son)
    const routeOrder = [];
    
    // Ara noktalar varsa önce onlar
    if (waypointsList && waypointsList.length > 0) {
      routeOrder.push(...waypointsList);
    }
    
    // Son olarak hedef
    if (destination) {
      routeOrder.push(destination);
    }
    
    // Her lokasyon için ve her ilgi alanı için 10'ar yer oluştur (rota sırasına göre)
    const generatedPlaces: Place[] = [];
    
    routeOrder.forEach((location, locationIndex) => {
      interests.forEach((interest: string) => {
        const placesForInterest = generatePlacesForLocationAndInterest(location as string, interest, locationIndex, routeOrder.length);
        generatedPlaces.push(...placesForInterest);
      });
    });
    
    setPlaces(generatedPlaces);
  };

  const generatePlacesForLocationAndInterest = (location: string, interest: string, locationIndex: number, totalLocations: number): Place[] => {
    const places: Place[] = [];
    
    // Rota yapısına göre öneri sayısını belirle
    let placesPerLocation: number;
    
    if (totalLocations === 1) {
      // Sadece hedef var → 10 öneri
      placesPerLocation = 10;
    } else if (totalLocations === 2) {
      // 1 ara nokta + 1 hedef → 5+5 = 10 toplam
      placesPerLocation = 5;
    } else if (totalLocations === 3) {
      // 2 ara nokta + 1 hedef → 5+5+5 = 15 toplam  
      placesPerLocation = 5;
    } else if (totalLocations === 4) {
      // 3 ara nokta + 1 hedef → 5+5+5+5 = 20 toplam
      placesPerLocation = 5;
    } else {
      // 4+ nokta varsa → 4'er öneri (maksimum 24)
      placesPerLocation = 4;
    }
    
    // Belirlenen sayıda yer oluştur
    for (let i = 1; i <= placesPerLocation; i++) {
      const place = createPlaceForInterest(location, interest, i, locationIndex);
      places.push(place);
    }
    
    return places;
  };

  const createPlaceForInterest = (location: string, interest: string, index: number, locationIndex: number): Place => {
    const placeTemplates = {
      food: [
        { prefix: 'Lezzetli', suffix: 'Restoran', desc: 'Geleneksel ve modern mutfağın buluştuğu nokta' },
        { prefix: 'Meşhur', suffix: 'Lokantası', desc: 'Şehrin en sevilen lezzetleri' },
        { prefix: 'Gurme', suffix: 'Bistro', desc: 'Özel tarifler ve benzersiz tatlar' },
        { prefix: 'Tarihi', suffix: 'Meyhanesi', desc: 'Asırlık geleneksel lezzetler' },
        { prefix: 'Modern', suffix: 'Kitchen', desc: 'Çağdaş gastronomi deneyimi' }
      ],
      history: [
        { prefix: 'Tarihi', suffix: 'Müzesi', desc: 'Geçmişin izlerini keşfedin' },
        { prefix: 'Antik', suffix: 'Kalıntıları', desc: 'Asırlık tarihi yapılar' },
        { prefix: 'Osmanlı', suffix: 'Eserleri', desc: 'İmparatorluk mirasını görün' },
        { prefix: 'Arkeolojik', suffix: 'Alanı', desc: 'Kazılarla ortaya çıkan tarih' },
        { prefix: 'Kültür', suffix: 'Merkezi', desc: 'Yaşayan tarih ve kültür' }
      ],
      art: [
        { prefix: 'Sanat', suffix: 'Galerisi', desc: 'Çağdaş sanat eserleri' },
        { prefix: 'Kültür', suffix: 'Merkezi', desc: 'Sanat ve kültür buluşması' },
        { prefix: 'Modern', suffix: 'Müzesi', desc: 'Çağdaş sanatın kalbi' },
        { prefix: 'Sergi', suffix: 'Salonu', desc: 'Dönemsel sanat sergileri' },
        { prefix: 'Atölye', suffix: 'Evi', desc: 'Sanatçıların yaratım alanı' }
      ],
      adventure: [
        { prefix: 'Macera', suffix: 'Parkı', desc: 'Adrenalin dolu aktiviteler' },
        { prefix: 'Spor', suffix: 'Kompleksi', desc: 'Her türlü spor imkanı' },
        { prefix: 'Doğa', suffix: 'Sporları', desc: 'Açık havada heyecan' },
        { prefix: 'Ekstrem', suffix: 'Merkezi', desc: 'Sınırlarınızı zorlayın' },
        { prefix: 'Aktivite', suffix: 'Alanı', desc: 'Aktif yaşam deneyimi' }
      ],
      nature: [
        { prefix: 'Doğa', suffix: 'Parkı', desc: 'Yeşilin ve havanın tadını çıkarın' },
        { prefix: 'Botanik', suffix: 'Bahçesi', desc: 'Binlerce bitki türü' },
        { prefix: 'Manzara', suffix: 'Tepesi', desc: 'Nefes kesen manzaralar' },
        { prefix: 'Mesire', suffix: 'Alanı', desc: 'Piknik ve dinlence' },
        { prefix: 'Orman', suffix: 'Yürüyüşü', desc: 'Doğayla iç içe yürüyüş' }
      ],
      nightlife: [
        { prefix: 'Trendy', suffix: 'Bar', desc: 'Şehrin en popüler gece mekanı' },
        { prefix: 'Rooftop', suffix: 'Lounge', desc: 'Manzaralı gece eğlencesi' },
        { prefix: 'Jazz', suffix: 'Club', desc: 'Canlı müzik ve dans' },
        { prefix: 'Cocktail', suffix: 'Bar', desc: 'Özel kokteyl tarifleri' },
        { prefix: 'Live', suffix: 'Music', desc: 'Canlı müzik performansları' }
      ]
    };

    const templates = placeTemplates[interest as keyof typeof placeTemplates] || placeTemplates.food;
    const template = templates[index % templates.length];
    
    const images = {
      food: [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop'
      ],
      history: [
        'https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'
      ],
      art: [
        'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1574270185629-9e1b9d8fd72f?w=400&h=300&fit=crop'
      ],
      adventure: [
        'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1571019613914-85e0c0e24465?w=400&h=300&fit=crop'
      ],
      nature: [
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=400&h=300&fit=crop'
      ],
      nightlife: [
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=400&h=300&fit=crop'
      ]
    };

    const imageSet = images[interest as keyof typeof images] || images.food;
    
    return {
      id: `${interest}_${location}_${index}_${locationIndex}`,
      name: `${template.prefix} ${location} ${template.suffix}`,
      category: interest,
      rating: 4.0 + Math.random() * 1.0, // 4.0 - 5.0 arası
      reviewCount: Math.floor(Math.random() * 500) + 50, // 50-550 arası
      description: template.desc,
      imageUri: imageSet[index % imageSet.length],
      address: `${location} yakınları`,
      priceLevel: Math.floor(Math.random() * 4) + 1, // 1-4 arası
      selected: false
    };
  };

  const togglePlaceSelection = (placeId: string) => {
    setPlaces(prev => 
      prev.map(place => 
        place.id === placeId 
          ? { ...place, selected: !place.selected }
          : place
      )
    );
  };

  const handleCompleteRoute = () => {
    const selectedCount = places.filter(p => p.selected).length;
    if (selectedCount === 0) {
      Alert.alert('Uyarı', 'Lütfen en az bir yer seçin.');
      return;
    }
    
    Alert.alert('Başarılı', `${selectedCount} yer rotaya eklendi!`, [
      { text: 'Tamam', onPress: () => router.push('/(app)/map') }
    ]);
  };

  // Önerileri önce lokasyona, sonra kategoriye göre grupla
  const groupedByLocationAndCategory = () => {
    const waypointsList = waypoints ? JSON.parse(waypoints as string) : [];
    const routeOrder = [...waypointsList];
    if (destination) routeOrder.push(destination);
    
    const grouped: { [location: string]: { [category: string]: Place[] } } = {};
    
    // Her lokasyon için grup oluştur
    routeOrder.forEach(location => {
      grouped[location as string] = {};
    });
    
    // Yerleri lokasyon ve kategoriye göre grupla
    places.forEach(place => {
      const locationFromName = extractLocationFromName(place.name);
      if (locationFromName && grouped[locationFromName]) {
        if (!grouped[locationFromName][place.category]) {
          grouped[locationFromName][place.category] = [];
        }
        grouped[locationFromName][place.category].push(place);
      }
    });
    
    return { grouped, routeOrder };
  };
  
  const extractLocationFromName = (placeName: string): string | null => {
    const waypointsList = waypoints ? JSON.parse(waypoints as string) : [];
    const allLocations = [...waypointsList, destination].filter(Boolean);
    
    for (const location of allLocations) {
      if (placeName.includes(location as string)) {
        return location as string;
      }
    }
    return null;
  };

  const getCategoryName = (category: string) => {
    const categoryNames: { [key: string]: string } = {
      food: 'Yemek & İçecek',
      history: 'Tarih & Müze',
      art: 'Sanat & Kültür',
      adventure: 'Macera & Spor',
      nature: 'Doğa & Manzara',
      nightlife: 'Gece Hayatı'
    };
    return categoryNames[category] || category;
  };

  const getCategoryIcon = (category: string) => {
    const categoryIcons: { [key: string]: string } = {
      food: 'cutlery',
      history: 'institution',
      art: 'paint-brush',
      adventure: 'bicycle',
      nature: 'tree',
      nightlife: 'moon-o'
    };
    return categoryIcons[category] || 'star';
  };

  const selectedCount = places.filter(p => p.selected).length;
  const { grouped, routeOrder } = groupedByLocationAndCategory();

  // Toplam öneri sayısını hesapla
  const getTotalRecommendationCount = () => {
    const interests = selectedInterests ? JSON.parse(selectedInterests as string) : [];
    const totalLocations = routeOrder.length;
    
    let placesPerLocation: number;
    if (totalLocations === 1) placesPerLocation = 10;
    else if (totalLocations === 2) placesPerLocation = 5;
    else if (totalLocations === 3) placesPerLocation = 5;
    else if (totalLocations === 4) placesPerLocation = 5;
    else placesPerLocation = 4;
    
    return totalLocations * interests.length * placesPerLocation;
  };

  const getLocationIcon = (index: number, total: number) => {
    if (index === 0) return 'play'; // İlk durak
    if (index === total - 1) return 'flag-checkered'; // Son durak
    return 'map-marker'; // Ara duraklar
  };

  const getLocationDescription = (locationIndex: number, totalLocations: number) => {
    const placesPerLocation = totalLocations === 1 ? 10 : 
                             totalLocations <= 4 ? 5 : 4;
    const interests = selectedInterests ? JSON.parse(selectedInterests as string) : [];
    const totalPlacesForLocation = placesPerLocation * interests.length;
    
    if (locationIndex === 0 && totalLocations > 1) {
      return `İlk durak - ${totalPlacesForLocation} öneri`;
    } else if (locationIndex === totalLocations - 1 && totalLocations > 1) {
      return `Son durak - ${totalPlacesForLocation} öneri`;
    } else if (totalLocations === 1) {
      return `Hedef nokta - ${totalPlacesForLocation} öneri`;
    } else {
      return `${locationIndex + 1}. durak - ${totalPlacesForLocation} öneri`;
    }
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
              onPress={() => router.back()}
            >
              <FontAwesome name="arrow-left" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Rota Önerileri</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Info Section */}
            <View style={styles.infoSection}>
              <Text style={styles.title}>Rota Sırasına Göre Tavsiyeler</Text>
              <Text style={styles.subtitle}>
                {routeOrder.length} durakta toplam {getTotalRecommendationCount()} özel öneri
              </Text>
              <Text style={styles.routeInfo}>
                {routeOrder.length === 1 ? 'Hedef başına 10 öneri' :
                 routeOrder.length <= 4 ? 'Her durak için 5 öneri' : 'Her durak için 4 öneri'}
              </Text>
            </View>

            {/* Route-based Locations */}
            {routeOrder.map((location, locationIndex) => (
              <View key={location as string} style={styles.locationSection}>
                {/* Location Header */}
                <View style={styles.locationHeader}>
                  <View style={styles.locationIconContainer}>
                    <FontAwesome 
                      name={getLocationIcon(locationIndex, routeOrder.length) as any} 
                      size={16} 
                      color="#fff" 
                    />
                  </View>
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationTitle}>{location}</Text>
                    <Text style={styles.locationSubtitle}>
                      {getLocationDescription(locationIndex, routeOrder.length)}
                    </Text>
                  </View>
                  <View style={styles.locationRoute}>
                    <Text style={styles.routeStep}>{locationIndex + 1}</Text>
                  </View>
                </View>

                {/* Categories for this location */}
                {Object.entries(grouped[location as string] || {}).map(([category, categoryPlaces]) => (
                  <View key={`${location}_${category}`} style={styles.categorySection}>
                    <View style={styles.categoryHeader}>
                      <FontAwesome name={getCategoryIcon(category) as any} size={18} color="#E91E63" />
                      <Text style={styles.categoryTitle}>{getCategoryName(category)}</Text>
                      <Text style={styles.categoryCount}>({categoryPlaces.length})</Text>
                    </View>

                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.horizontalScroll}
                    >
                      {categoryPlaces.map((place) => (
                        <TouchableOpacity
                          key={place.id}
                          style={[
                            styles.placeCard,
                            place.selected && styles.selectedPlaceCard
                          ]}
                          onPress={() => togglePlaceSelection(place.id)}
                          activeOpacity={0.8}
                        >
                          <ImageBackground
                            source={{ uri: place.imageUri }}
                            style={styles.placeImage}
                            imageStyle={styles.placeImageStyle}
                          >
                            <View style={styles.placeOverlay}>
                              {place.selected && (
                                <View style={styles.checkContainer}>
                                  <FontAwesome name="check" size={16} color="#fff" />
                                </View>
                              )}
                            </View>
                          </ImageBackground>
                          
                          <View style={styles.placeInfo}>
                            <Text style={styles.placeName} numberOfLines={1}>{place.name}</Text>
                            <Text style={styles.placeAddress} numberOfLines={1}>{place.address}</Text>
                            <Text style={styles.placeDescription} numberOfLines={2}>{place.description}</Text>
                            
                            <View style={styles.placeStats}>
                              <View style={styles.ratingContainer}>
                                <FontAwesome name="star" size={14} color="#FFB800" />
                                <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
                                <Text style={styles.reviewText}>({place.reviewCount})</Text>
                              </View>
                              
                              <View style={styles.priceContainer}>
                                {Array.from({ length: place.priceLevel }, (_, i) => (
                                  <FontAwesome key={i} name="dollar" size={12} color="#E91E63" />
                                ))}
                              </View>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                ))}
                
                {/* Divider */}
                {locationIndex < routeOrder.length - 1 && (
                  <View style={styles.routeDivider}>
                    <View style={styles.dividerLine} />
                    <FontAwesome name="chevron-down" size={14} color="rgba(255,255,255,0.5)" />
                    <View style={styles.dividerLine} />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Complete Route Button */}
          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity
              style={[
                styles.completeButton,
                selectedCount === 0 && styles.disabledButton
              ]}
              onPress={handleCompleteRoute}
              disabled={selectedCount === 0}
            >
              <FontAwesome 
                name="check-circle" 
                size={20} 
                color={selectedCount > 0 ? "#fff" : "#999"} 
                style={styles.buttonIcon} 
              />
              <Text style={[
                styles.completeButtonText,
                selectedCount === 0 && styles.disabledButtonText
              ]}>
                Rotayı Tamamla ({selectedCount})
              </Text>
              <FontAwesome 
                name="chevron-right" 
                size={18} 
                color={selectedCount > 0 ? "#fff" : "#999"} 
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
    paddingBottom: 120,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  locationSection: {
    marginBottom: 30,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(233, 30, 99, 0.2)',
    marginBottom: 15,
  },
  locationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  locationSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  locationRoute: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeStep: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  routeDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  routeInfo: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  categorySection: {
    marginBottom: 25,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
    flex: 1,
  },
  categoryCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  horizontalScroll: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  placeCard: {
    width: width * 0.7,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    marginRight: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlaceCard: {
    borderColor: '#E91E63',
  },
  placeImage: {
    height: 140,
    justifyContent: 'flex-end',
  },
  placeImageStyle: {
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
  },
  placeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 10,
  },
  checkContainer: {
    backgroundColor: '#E91E63',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeInfo: {
    padding: 15,
  },
  placeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  placeAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  placeDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 18,
    marginBottom: 10,
  },
  placeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 5,
  },
  reviewText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 3,
  },
  priceContainer: {
    flexDirection: 'row',
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: 35,
  },
  completeButton: {
    backgroundColor: '#E91E63',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  buttonIcon: {
    marginRight: 10,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  disabledButtonText: {
    color: '#999',
  },
});