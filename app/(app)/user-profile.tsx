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
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

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
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerBackButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{userProfile.name}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image 
            source={{ uri: userProfile.profilePhoto }} 
            style={styles.profilePhoto}
          />
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
        </View>

        {/* Badges */}
        <View style={styles.badgesSection}>
          <Text style={styles.sectionTitle}>Rozetler</Text>
          <View style={styles.badgesContainer}>
            {userProfile.badges.map((badge, index) => (
              <View key={index} style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 0 && styles.activeTab]}
            onPress={() => setActiveTab(0)}
          >
            <Text style={[styles.tabText, activeTab === 0 && styles.activeTabText]}>
              Gezdiği Yerler
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 1 && styles.activeTab]}
            onPress={() => setActiveTab(1)}
          >
            <Text style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>
              Yorumlar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {renderTabContent()}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerBackButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerPlaceholder: {
    width: 36,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  followButton: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  followButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E91E63',
    gap: 8,
  },
  messageButtonText: {
    color: '#E91E63',
    fontWeight: '600',
    fontSize: 14,
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
  badgesSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#E91E63',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#E91E63',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  placesScrollView: {
    paddingBottom: 20,
  },
  placesScrollContainer: {
    paddingHorizontal: 20,
    paddingRight: 40,
  },
  placeCard: {
    width: 200,
    marginRight: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    overflow: 'hidden',
  },
  placeImage: {
    width: '100%',
    height: 140,
  },
  placeInfo: {
    padding: 15,
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  placeCity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  placeRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  visitDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewsList: {
    paddingBottom: 20,
  },
  reviewCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  reviewPlaceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reviewPlaceCity: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 10,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewLikes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likesCount: {
    fontSize: 12,
    color: '#E91E63',
    fontWeight: '500',
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
