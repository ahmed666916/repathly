import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Alert,
  FlatList,
  Dimensions,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

interface UserProfile {
  id: string;
  name: string;
  username: string;
  profilePhoto: string;
  bio: string;
  reviewCount: number;
  placesVisited: number;
  followers: number;
  following: number;
  joinDate: string;
  isPublic: boolean;
  badges: string[];
  isFriend: boolean;
  visitedPlaces: VisitedPlace[];
  recentReviews: UserReview[];
}

interface VisitedPlace {
  id: string;
  googlePlaceId: string;
  name: string;
  city: string;
  category: string;
  image: string;
  rating: number;
  visitDate: string;
  reviewText?: string;
  photos?: any[];
  formattedAddress?: string;
}

interface UserReview {
  id: string;
  placeName: string;
  placeCity: string;
  rating: number;
  comment: string;
  date: string;
  likes: number;
}

export default function UserProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [placesWithGoogleData, setPlacesWithGoogleData] = useState<VisitedPlace[]>([]);

  useEffect(() => {
    const userId = params.userId as string;
    const userName = params.userName as string;
    if (userId || userName) {
      fetchUserProfile(userId || userName);
    }
  }, [params.userId, params.userName]);

  useEffect(() => {
    if (userProfile?.visitedPlaces) {
      fetchGooglePlaceDetails(userProfile.visitedPlaces);
    }
  }, [userProfile]);

  const fetchUserProfile = (identifier: string) => {
    if (!identifier) return;
    
    // Mock user data - in real app this would be an API call
    const mockUsers: UserProfile[] = [
      {
        id: '1',
        name: 'Ahmet Yılmaz',
        username: 'ahmet_yilmaz',
        profilePhoto: 'https://randomuser.me/api/portraits/men/1.jpg',
        bio: 'İstanbul\'un gizli köşelerini keşfeden bir gezgin. Yemek kültürü ve tarihi mekanlar tutkunu.',
        reviewCount: 45,
        placesVisited: 89,
        followers: 234,
        following: 156,
        joinDate: '2022-08-15',
        isPublic: true,
        badges: ['Şehir Kaşifi', 'Yemek Uzmanı', 'Fotoğraf Tutkunu'],
        isFriend: false,
        visitedPlaces: [
          {
            id: '1',
            googlePlaceId: 'ChIJdUyx15BU5kcRj85ZX8H8OAU',
            name: 'Galata Kulesi',
            city: 'İstanbul',
            category: 'Tarihi Mekan',
            image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400',
            rating: 4.5,
            visitDate: '2024-01-15'
          },
          {
            id: '2',
            googlePlaceId: 'ChIJ_xkgOm-5UxQRvCRqOYWZNSM',
            name: 'Ayasofya',
            city: 'İstanbul',
            category: 'Tarihi Mekan',
            image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=400',
            rating: 5.0,
            visitDate: '2024-01-10'
          },
          {
            id: '3',
            googlePlaceId: 'ChIJa147K9i5UxQRNVGOlCnZQSM',
            name: 'Kapalıçarşı',
            city: 'İstanbul',
            category: 'Alışveriş',
            image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
            rating: 4.0,
            visitDate: '2024-01-08'
          },
          {
            id: '4',
            googlePlaceId: 'ChIJt6n44tq5UxQRTH0FXwwNMqA',
            name: 'Boğaziçi Köprüsü',
            city: 'İstanbul',
            category: 'Doğa & Manzara',
            image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400',
            rating: 4.8,
            visitDate: '2024-01-05'
          }
        ],
        recentReviews: [
          {
            id: '1',
            placeName: 'Galata Kulesi',
            placeCity: 'İstanbul',
            rating: 4.5,
            comment: 'İstanbul\'un muhteşem manzarasını izlemek için harika bir yer. Gün batımında özellikle büyüleyici.',
            date: '2 gün önce',
            likes: 12
          },
          {
            id: '2',
            placeName: 'Ayasofya',
            placeCity: 'İstanbul',
            rating: 5.0,
            comment: 'Tarihi dokusu ve mimarisi ile büyüleyici. Mutlaka görülmesi gereken bir yapı.',
            date: '1 hafta önce',
            likes: 18
          },
          {
            id: '3',
            placeName: 'Kapalıçarşı',
            placeCity: 'İstanbul',
            rating: 4.0,
            comment: 'Alışveriş için güzel ama oldukça kalabalık. Pazarlık yapmayı unutmayın!',
            date: '2 hafta önce',
            likes: 8
          }
        ]
      },
      {
        id: '2',
        name: 'Mehmet Demir',
        username: 'mehmet_demir',
        profilePhoto: 'https://randomuser.me/api/portraits/men/2.jpg',
        bio: 'Doğa yürüyüşleri ve outdoor aktiviteler tutkunu. Her haftasonu yeni bir rotada.',
        reviewCount: 67,
        placesVisited: 123,
        followers: 445,
        following: 289,
        joinDate: '2021-11-20',
        isPublic: true,
        badges: ['Kahve Uzmanı', 'Kitap Sever', 'Şehir Kaşifi'],
        isFriend: true,
        visitedPlaces: [
          {
            id: '1',
            googlePlaceId: 'ChIJrTLr-GyuEmsRBfy61i59si0',
            name: 'Belgrad Ormanı',
            city: 'İstanbul',
            category: 'Doğa & Outdoor',
            image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
            rating: 4.8,
            visitDate: '2024-01-20'
          },
          {
            id: '2',
            googlePlaceId: 'ChIJKzGHdQq5UxQRQvvfLwAb8hM',
            name: 'Emirgan Korusu',
            city: 'İstanbul',
            category: 'Doğa & Outdoor',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
            rating: 4.5,
            visitDate: '2024-01-18'
          }
        ],
        recentReviews: [
          {
            id: '1',
            placeName: 'Belgrad Ormanı',
            placeCity: 'İstanbul',
            rating: 4.8,
            comment: 'Şehrin stresinden uzaklaşmak için mükemmel bir yer. Temiz hava ve doğa.',
            date: '3 gün önce',
            likes: 15
          },
          {
            id: '2',
            placeName: 'Kitap Cafe',
            placeCity: 'Ankara',
            rating: 4,
            comment: 'Kitap okumak için ideal bir mekan. Sessiz ve huzurlu.',
            date: '5 gün önce',
            likes: 9
          }
        ]
      }
    ];

    const user = mockUsers.find(u => 
      u.id === identifier || 
      u.name === identifier || 
      u.username === identifier
    );
    
    setUserProfile(user || null);
  };

  const fetchGooglePlaceDetails = async (places: VisitedPlace[]) => {
    const apiKey = 'AIzaSyBiwWqbt9wGMbsTDEJW8pChcqfrBjti6jE';
    const updatedPlaces: VisitedPlace[] = [];

    for (const place of places) {
      try {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.googlePlaceId}&fields=name,formatted_address,rating,photos,geometry&key=${apiKey}&language=tr`;
        const response = await fetch(detailsUrl);
        const data = await response.json();

        if (data.status === 'OK' && data.result) {
          const result = data.result;
          let photoUrl = place.image; // fallback to original image

          // Get first photo if available
          if (result.photos && result.photos.length > 0) {
            const photoReference = result.photos[0].photo_reference;
            photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${apiKey}`;
          }

          updatedPlaces.push({
            ...place,
            name: result.name || place.name,
            formattedAddress: result.formatted_address,
            rating: result.rating || place.rating,
            image: photoUrl,
            photos: result.photos
          });
        } else {
          // If Google API fails, keep original data
          updatedPlaces.push(place);
        }
      } catch (error) {
        console.error('Error fetching place details:', error);
        // If error, keep original data
        updatedPlaces.push(place);
      }
    }

    setPlacesWithGoogleData(updatedPlaces);
  };

  const handleBack = () => {
    router.back();
  };


  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FontAwesome5
        key={index}
        name="star"
        size={14}
        color={index < rating ? '#FFD700' : '#E0E0E0'}
        solid={index < rating}
      />
    ));
  };

  const renderVisitedPlace = ({ item }: { item: VisitedPlace }) => (
    <View style={styles.placeCard}>
      <Image source={{ uri: item.image }} style={styles.placeImage} />
      <View style={styles.placeInfo}>
        <Text style={styles.placeName} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
        <Text style={styles.placeCity} numberOfLines={1} ellipsizeMode="tail">
          {item.formattedAddress || item.city}
        </Text>
        <View style={styles.placeRating}>
          {renderStars(item.rating)}
          <Text style={styles.ratingText}>({item.rating})</Text>
        </View>
        <Text style={styles.visitDate}>{item.visitDate}</Text>
      </View>
    </View>
  );

  const renderReview = ({ item }: { item: UserReview }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View>
          <Text style={styles.reviewPlaceName}>{item.placeName}</Text>
          <Text style={styles.reviewPlaceCity}>{item.placeCity}</Text>
        </View>
        <View style={styles.reviewRating}>
          {renderStars(item.rating)}
        </View>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
      <View style={styles.reviewFooter}>
        <Text style={styles.reviewDate}>{item.date}</Text>
        <View style={styles.reviewLikes}>
          <FontAwesome5 name="heart" size={12} color="#E91E63" />
          <Text style={styles.likesCount}>{item.likes}</Text>
        </View>
      </View>
    </View>
  );

  const renderTabContent = () => {
    if (!userProfile) return null;

    switch (activeTab) {
      case 0: // Gezdiği Yerler
        const placesToShow = placesWithGoogleData.length > 0 ? placesWithGoogleData : userProfile.visitedPlaces;
        return (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.placesScrollContainer}
            style={styles.placesScrollView}
          >
            {placesToShow.map((item, index) => (
              <View key={`place-${index}`}>
                {renderVisitedPlace({ item })}
              </View>
            ))}
          </ScrollView>
        );
      case 1: // Yorumlar
        return (
          <View style={styles.reviewsList}>
            {userProfile.recentReviews.map((item, index) => (
              <View key={`review-${index}`}>
                {renderReview({ item })}
              </View>
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.errorContainer}>
          <FontAwesome5 name="user-slash" size={48} color="#ccc" />
          <Text style={styles.errorText}>Kullanıcı bulunamadı</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{userProfile.name}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cover Photo */}
        <View style={styles.coverContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop' }} 
            style={styles.coverPhoto}
          />
          <View style={styles.coverOverlay} />
          
          {/* Profile Photo Overlay */}
          <View style={styles.profilePhotoContainer}>
            <Image 
              source={{ uri: userProfile.profilePhoto }} 
              style={styles.profilePhoto}
            />
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{userProfile.name}</Text>
          <Text style={styles.profileUsername}>@{userProfile.username}</Text>
          <Text style={styles.profileBio}>{userProfile.bio}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userProfile.reviewCount}</Text>
            <Text style={styles.statLabel}>Yorum</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userProfile.placesVisited}</Text>
            <Text style={styles.statLabel}>Ziyaret</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userProfile.followers}</Text>
            <Text style={styles.statLabel}>Takipçi</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userProfile.following}</Text>
            <Text style={styles.statLabel}>Takip</Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 0 && styles.activeTabButton]}
            onPress={() => setActiveTab(0)}
          >
            <FontAwesome5 name="map-marker-alt" size={20} color={activeTab === 0 ? '#E91E63' : '#666'} />
            <Text style={[styles.tabText, activeTab === 0 && styles.activeTabText]}>
              Gezdiği Yerler
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 1 && styles.activeTabButton]}
            onPress={() => setActiveTab(1)}
          >
            <FontAwesome5 name="comment" size={20} color={activeTab === 1 ? '#E91E63' : '#666'} />
            <Text style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>
              Son Yorumlar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 0 ? (
          <View style={styles.favoritesGrid}>
            {userProfile.visitedPlaces.map((place) => (
              <View key={place.id} style={styles.favoriteItem}>
                <Image source={{ uri: place.image }} style={styles.favoriteImage} />
                <View style={styles.favoriteOverlay}>
                  <View style={styles.favoriteRating}>
                    <FontAwesome5 name="star" size={12} color="#FFD700" />
                    <Text style={styles.favoriteRatingText}>{place.rating}</Text>
                  </View>
                </View>
                <Text style={styles.favoriteName}>{place.name}</Text>
                <Text style={styles.favoriteCity}>{place.city}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.reviewsList}>
            {userProfile.recentReviews.map((review) => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewContent}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewPlaceName}>{review.placeName}</Text>
                    <View style={styles.reviewRating}>
                      <FontAwesome5 name="star" size={12} color="#FFD700" />
                      <Text style={styles.reviewRatingText}>{review.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.reviewCity}>{review.placeCity}</Text>
                  <Text style={styles.reviewText}>{review.comment}</Text>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  coverContainer: {
    height: 200,
    position: 'relative',
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  profilePhotoContainer: {
    position: 'absolute',
    bottom: -50,
    left: 20,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'white',
  },
  profileInfo: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileUsername: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  profileBio: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    marginHorizontal: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    marginBottom: 25,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#E91E63',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#E91E63',
    fontWeight: '600',
  },
  favoritesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    gap: 8,
  },
  favoriteItem: {
    width: (width - 36) / 2,
    marginBottom: 15,
  },
  favoriteImage: {
    width: '100%',
    height: (width - 36) / 2,
    borderRadius: 12,
    marginBottom: 8,
  },
  favoriteOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  favoriteRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  favoriteRatingText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  favoriteName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  favoriteCity: {
    fontSize: 10,
    color: '#666',
  },
  reviewsList: {
    paddingHorizontal: 20,
  },
  reviewItem: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 15,
  },
  reviewContent: {
    flex: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewPlaceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewRatingText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  reviewCity: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

