import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface Recommendation {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  description: string;
  location: string;
  selected: boolean;
}

interface InterestCategory {
  id: string;
  name: string;
  icon: string;
  recommendations: Recommendation[];
}

export default function RecommendationsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [categories, setCategories] = useState<InterestCategory[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<Recommendation[]>([]);
  
  // Route planner'dan gelen bilgileri al
  const finalDestination = params.finalDestination as string;
  const waypoints = params.waypoints ? JSON.parse(params.waypoints as string) : [];
  
  console.log('Final destination:', finalDestination);
  console.log('Waypoints:', waypoints);

  // Mock data - gerçek uygulamada API'den gelecek
  useEffect(() => {
    // Başlangıç şehri (İstanbul) ve son rota şehrini belirle
    const startCity = 'İstanbul';
    const excludeCities = [startCity];
    
    // Eğer son rota şehri başlangıç şehriyle aynıysa, onu da hariç tut
    if (finalDestination && finalDestination.toLowerCase().includes('istanbul')) {
      // İstanbul ile aynı, zaten hariç tutulacak
    } else if (finalDestination) {
      excludeCities.push(finalDestination);
    }
    
    console.log('Excluded cities:', excludeCities);

    const allRecommendations = {
      food: [
        {
          id: 'food_1',
          name: 'Pandeli Restaurant',
          category: 'food',
          rating: 4.5,
          reviews: 1250,
          description: 'Osmanlı mutfağının eşsiz lezzetleri',
          location: 'İstanbul',
          selected: false,
        },
        {
          id: 'food_2',
          name: 'Hamdi Restaurant',
          category: 'food',
          rating: 4.3,
          reviews: 980,
          description: 'Güneydoğu mutfağı ve kebap çeşitleri',
          location: 'İstanbul',
          selected: false,
        },
        {
          id: 'food_3',
          name: 'Ankara Tandır Evi',
          category: 'food',
          rating: 4.4,
          reviews: 850,
          description: 'Geleneksel Ankara tandır lezzetleri',
          location: 'Ankara',
          selected: false,
        },
        {
          id: 'food_4',
          name: 'İzmir Köfte',
          category: 'food',
          rating: 4.2,
          reviews: 720,
          description: 'Ege\'nin meşhur köfte çeşitleri',
          location: 'İzmir',
          selected: false,
        },
        {
          id: 'food_5',
          name: 'Bursa İskender',
          category: 'food',
          rating: 4.1,
          reviews: 650,
          description: 'Orijinal İskender kebabının evi',
          location: 'Bursa',
          selected: false,
        },
        {
          id: 'food_6',
          name: 'Antalya Balık Evi',
          category: 'food',
          rating: 4.3,
          reviews: 580,
          description: 'Akdeniz\'in taze balık lezzetleri',
          location: 'Antalya',
          selected: false,
        },
      ]
    };

    const mockCategories: InterestCategory[] = [
      {
        id: 'food',
        name: 'Yemek & İçecek',
        icon: '🍽️',
        recommendations: allRecommendations.food.filter(item => 
          !excludeCities.some(city => 
            item.location.toLowerCase().includes(city.toLowerCase())
          )
        ),
      },
      {
        id: 'history',
        name: 'Tarih & Müze',
        icon: '🏛️',
        recommendations: [
          {
            id: 'history_1',
            name: 'Ayasofya Müzesi',
            category: 'history',
            rating: 4.6,
            reviews: 15000,
            description: 'Bizans ve Osmanlı mimarisinin şaheseri',
            location: 'Sultanahmet',
            selected: false,
          },
          {
            id: 'history_2',
            name: 'Topkapı Sarayı',
            category: 'history',
            rating: 4.5,
            reviews: 12000,
            description: 'Osmanlı İmparatorluğu\'nun kalbi',
            location: 'Sultanahmet',
            selected: false,
          },
          {
            id: 'history_3',
            name: 'Sultanahmet Camii',
            category: 'history',
            rating: 4.7,
            reviews: 18000,
            description: 'Altı minareli büyüleyici cami',
            location: 'Sultanahmet',
            selected: false,
          },
          {
            id: 'history_4',
            name: 'Galata Kulesi',
            category: 'history',
            rating: 4.3,
            reviews: 8500,
            description: 'İstanbul\'un panoramik manzarası',
            location: 'Galata',
            selected: false,
          },
          {
            id: 'history_5',
            name: 'Dolmabahçe Sarayı',
            category: 'history',
            rating: 4.4,
            reviews: 7200,
            description: 'Osmanlı\'nın son dönem sarayı',
            location: 'Beşiktaş',
            selected: false,
          },
        ],
      },
      {
        id: 'art',
        name: 'Sanat & Kültür',
        icon: '🎨',
        recommendations: [
          {
            id: 'art_1',
            name: 'İstanbul Modern',
            category: 'art',
            rating: 4.3,
            reviews: 2800,
            description: 'Çağdaş Türk sanatının evi',
            location: 'Karaköy',
            selected: false,
          },
          {
            id: 'art_2',
            name: 'Pera Müzesi',
            category: 'art',
            rating: 4.2,
            reviews: 2100,
            description: 'Sanat ve kültür merkezi',
            location: 'Beyoğlu',
            selected: false,
          },
          {
            id: 'art_3',
            name: 'Sadberk Hanım Müzesi',
            category: 'art',
            rating: 4.1,
            reviews: 950,
            description: 'Türk ve İslam sanatları',
            location: 'Sarıyer',
            selected: false,
          },
          {
            id: 'art_4',
            name: 'Rahmi M. Koç Müzesi',
            category: 'art',
            rating: 4.4,
            reviews: 1800,
            description: 'Endüstri, ulaştırma ve teknoloji',
            location: 'Hasköy',
            selected: false,
          },
          {
            id: 'art_5',
            name: 'Türk ve İslam Eserleri Müzesi',
            category: 'art',
            rating: 4.0,
            reviews: 1200,
            description: 'Zengin İslami sanat koleksiyonu',
            location: 'Sultanahmet',
            selected: false,
          },
        ],
      },
      {
        id: 'nature',
        name: 'Doğa & Manzara',
        icon: '🌿',
        recommendations: [
          {
            id: 'nature_1',
            name: 'Çamlıca Tepesi',
            category: 'nature',
            rating: 4.2,
            reviews: 3500,
            description: 'İstanbul\'un en yüksek tepesi',
            location: 'Üsküdar',
            selected: false,
          },
          {
            id: 'nature_2',
            name: 'Emirgan Korusu',
            category: 'nature',
            rating: 4.5,
            reviews: 2800,
            description: 'Lale festivali ve doğa yürüyüşü',
            location: 'Sarıyer',
            selected: false,
          },
          {
            id: 'nature_3',
            name: 'Büyükada',
            category: 'nature',
            rating: 4.3,
            reviews: 4200,
            description: 'Prens Adaları\'nın en büyüğü',
            location: 'Adalar',
            selected: false,
          },
          {
            id: 'nature_4',
            name: 'Gülhane Parkı',
            category: 'nature',
            rating: 4.1,
            reviews: 2100,
            description: 'Tarihi yarımada\'nın yeşil alanı',
            location: 'Eminönü',
            selected: false,
          },
          {
            id: 'nature_5',
            name: 'Yıldız Parkı',
            category: 'nature',
            rating: 4.0,
            reviews: 1650,
            description: 'Şehrin kalbinde doğa',
            location: 'Beşiktaş',
            selected: false,
          },
        ],
      },
    ];

    setCategories(mockCategories);
  }, [finalDestination]);

  const togglePlaceSelection = (categoryId: string, placeId: string) => {
    setCategories(prev =>
      prev.map(category =>
        category.id === categoryId
          ? {
              ...category,
              recommendations: category.recommendations.map(rec =>
                rec.id === placeId ? { ...rec, selected: !rec.selected } : rec
              ),
            }
          : category
      )
    );

    // Update selected places
    const updatedPlace = categories
      .find(cat => cat.id === categoryId)
      ?.recommendations.find(rec => rec.id === placeId);

    if (updatedPlace) {
      setSelectedPlaces(prev => {
        const isAlreadySelected = prev.some(place => place.id === placeId);
        if (isAlreadySelected) {
          return prev.filter(place => place.id !== placeId);
        } else {
          return [...prev, { ...updatedPlace, selected: true }];
        }
      });
    }
  };

  const handleCreateRoute = () => {
    if (selectedPlaces.length === 0) {
      Alert.alert('Yer Seçimi', 'Lütfen en az bir yer seçin.');
      return;
    }
    
    // Seçilen yerleri route parameter olarak geçir
    router.push({
      pathname: '/(app)/map',
      params: {
        selectedPlaces: JSON.stringify(selectedPlaces.map(place => place.name)),
      },
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FontAwesome key={i} name="star" size={14} color="#FFD700" />);
    }

    if (hasHalfStar) {
      stars.push(<FontAwesome key="half" name="star-half-o" size={14} color="#FFD700" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<FontAwesome key={`empty-${i}`} name="star-o" size={14} color="#FFD700" />);
    }

    return stars;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Size Özel Öneriler</Text>
        <Text style={styles.subtitle}>
          İlgi alanlarınıza göre en popüler yerler
        </Text>
        {selectedPlaces.length > 0 && (
          <Text style={styles.selectedCount}>
            {selectedPlaces.length} yer seçildi
          </Text>
        )}
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {categories.map(category => (
          <View key={category.id} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryTitle}>{category.name}</Text>
            </View>

            {category.recommendations.slice(0, 10).map(place => (
              <TouchableOpacity
                key={place.id}
                style={[
                  styles.placeCard,
                  place.selected && styles.selectedPlaceCard,
                ]}
                onPress={() => togglePlaceSelection(category.id, place.id)}
              >
                <View style={styles.placeHeader}>
                  <View style={styles.placeInfo}>
                    <Text style={styles.placeName}>{place.name}</Text>
                    <Text style={styles.placeLocation}>{place.location}</Text>
                  </View>
                  <View style={styles.placeStats}>
                    <View style={styles.ratingContainer}>
                      {renderStars(place.rating)}
                      <Text style={styles.ratingText}>{place.rating}</Text>
                    </View>
                    <Text style={styles.reviewsText}>({place.reviews} yorum)</Text>
                  </View>
                  {place.selected && (
                    <FontAwesome name="check-circle" size={24} color="#4CAF50" />
                  )}
                </View>
                <Text style={styles.placeDescription}>{place.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      {selectedPlaces.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.routeButton} onPress={handleCreateRoute}>
            <FontAwesome name="map" size={18} color="#fff" style={styles.routeIcon} />
            <Text style={styles.routeButtonText}>
              Rotayı Gör ({selectedPlaces.length} yer)
            </Text>
            <FontAwesome name="chevron-right" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  selectedCount: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 100, // Alt kısım için ekstra boşluk
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 5,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlaceCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#f8fff8',
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  placeLocation: {
    fontSize: 14,
    color: '#666',
  },
  placeStats: {
    alignItems: 'flex-end',
    marginRight: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 5,
  },
  reviewsText: {
    fontSize: 12,
    color: '#999',
  },
  placeDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  routeButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
});