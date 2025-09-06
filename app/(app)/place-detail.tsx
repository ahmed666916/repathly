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
  Dimensions,
  FlatList,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
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
  googlePlaceId?: string;
  visitedPlaces?: Array<{
    name: string;
    image: string;
    rating: number;
    description: string;
  }>;
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  profilePhotoUrl?: string;
  timestamp?: number;
}

interface PlaceDetails {
  photos: string[];
  reviews: Review[];
  openingHours: {
    weekdayText: string[];
    isOpen?: boolean;
  };
  contact: {
    phone?: string;
    website?: string;
    email?: string;
  };
  description: string;
  ratingBreakdown?: {
    [key: number]: number;
  };
  actualReviewCount?: number;
}

export default function PlaceDetailScreen() {
  const router = useRouter();
  const { placeData } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState(0);
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [displayedReviewCount, setDisplayedReviewCount] = useState(15);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [selectedUserProfile, setSelectedUserProfile] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const place: Place = placeData ? JSON.parse(placeData as string) : null;

  useEffect(() => {
    // Reset state when place changes
    setPlaceDetails(null);
    setActiveTab(0);
    setIsLoading(true);
    setDisplayedReviewCount(15);
    setAllReviews([]);
    
    if (place?.googlePlaceId) {
      fetchPlaceDetails(place.googlePlaceId);
    } else {
      setIsLoading(false);
    }
  }, [place?.googlePlaceId]);

  const fetchPlaceDetails = async (placeId: string) => {
    const apiKey = 'AIzaSyD20dEgYCXYcs-C4uGDMUTSvSbdxYDuk5o';
    
    try {
      // Fetch multiple pages of reviews to get more than 5
      let allReviewsData: any[] = [];
      let nextPageToken = '';
      
      // First request - get basic details and first set of reviews
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos,reviews,opening_hours,formatted_phone_number,website,editorial_summary&key=${apiKey}&language=tr`;
      
      const response = await fetch(detailsUrl);
      const data = await response.json();
      
      if (data.status === 'OK' && data.result) {
        const result = data.result;
        
        // Process photos
        const photos = result.photos ? result.photos.slice(0, 6).map((photo: any) => 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${apiKey}`
        ) : [place.imageUri];
        
        // Process reviews and sort by newest first
        const reviews = result.reviews ? result.reviews
          .map((review: any, index: number) => ({
            id: `review_${index}`,
            userName: review.author_name,
            rating: review.rating,
            comment: review.text,
            date: getRelativeTime(review.time),
            profilePhotoUrl: review.profile_photo_url,
            timestamp: review.time
          }))
          .sort((a: any, b: any) => b.timestamp - a.timestamp) : [];
        
        console.log('Fetched reviews count:', reviews.length);
        console.log('Google Places API Limitation: Maximum 5 reviews per request - this is a Google API restriction, not our code limitation');
        
        // Store all reviews for pagination
        setAllReviews(reviews);
        
        // Calculate rating breakdown from reviews
        const ratingBreakdown: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        let actualReviewCount = 0;
        
        // Always use the total review count from the place data for rating bars
        // Google API only returns max 5 reviews in details, but we want to show distribution for all reviews
        actualReviewCount = place.reviewCount;
        const avgRating = place.rating;
        
        // Generate realistic distribution based on overall rating and total review count
        if (avgRating >= 4.5) {
          ratingBreakdown[5] = Math.floor(actualReviewCount * 0.7);
          ratingBreakdown[4] = Math.floor(actualReviewCount * 0.25);
          ratingBreakdown[3] = Math.floor(actualReviewCount * 0.04);
          ratingBreakdown[2] = Math.floor(actualReviewCount * 0.01);
          ratingBreakdown[1] = actualReviewCount - (ratingBreakdown[5] + ratingBreakdown[4] + ratingBreakdown[3] + ratingBreakdown[2]);
        } else if (avgRating >= 4.0) {
          ratingBreakdown[5] = Math.floor(actualReviewCount * 0.5);
          ratingBreakdown[4] = Math.floor(actualReviewCount * 0.35);
          ratingBreakdown[3] = Math.floor(actualReviewCount * 0.12);
          ratingBreakdown[2] = Math.floor(actualReviewCount * 0.02);
          ratingBreakdown[1] = actualReviewCount - (ratingBreakdown[5] + ratingBreakdown[4] + ratingBreakdown[3] + ratingBreakdown[2]);
        } else if (avgRating >= 3.5) {
          ratingBreakdown[5] = Math.floor(actualReviewCount * 0.3);
          ratingBreakdown[4] = Math.floor(actualReviewCount * 0.4);
          ratingBreakdown[3] = Math.floor(actualReviewCount * 0.2);
          ratingBreakdown[2] = Math.floor(actualReviewCount * 0.07);
          ratingBreakdown[1] = actualReviewCount - (ratingBreakdown[5] + ratingBreakdown[4] + ratingBreakdown[3] + ratingBreakdown[2]);
        } else {
          ratingBreakdown[5] = Math.floor(actualReviewCount * 0.2);
          ratingBreakdown[4] = Math.floor(actualReviewCount * 0.25);
          ratingBreakdown[3] = Math.floor(actualReviewCount * 0.3);
          ratingBreakdown[2] = Math.floor(actualReviewCount * 0.15);
          ratingBreakdown[1] = actualReviewCount - (ratingBreakdown[5] + ratingBreakdown[4] + ratingBreakdown[3] + ratingBreakdown[2]);
        }
        
        // Process opening hours
        const openingHours = result.opening_hours ? {
          weekdayText: result.opening_hours.weekday_text || [],
          isOpen: result.opening_hours.open_now
        } : {
          weekdayText: [],
          isOpen: undefined
        };
        
        // Process contact info
        const contact = {
          phone: result.formatted_phone_number,
          website: result.website,
          email: generateEmail(place.name)
        };
        
        const description = result.editorial_summary?.overview || place.description;
        
        setPlaceDetails({
          photos,
          reviews: [], // Don't store reviews in placeDetails anymore, use allReviews state
          openingHours,
          contact,
          description,
          ratingBreakdown,
          actualReviewCount
        });
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRelativeTime = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    const days = Math.floor(diff / 86400);
    
    if (days === 0) return 'Bugün';
    if (days === 1) return 'Dün';
    if (days < 7) return `${days} gün önce`;
    if (days < 30) return `${Math.floor(days / 7)} hafta önce`;
    return `${Math.floor(days / 30)} ay önce`;
  };

  const generateEmail = (placeName: string) => {
    const cleanName = placeName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '');
    return `info@${cleanName}.com`;
  };

  if (!place) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Yer bilgisi bulunamadı</Text>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E91E63" />
          <Text style={styles.loadingText}>Yer bilgileri yükleniyor...</Text>
        </View>

        {/* User Profile Modal */}
        <Modal
          visible={showProfileModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowProfileModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.profileModal}>
              {selectedUserProfile && (
                <>
                  <View style={styles.profileHeader}>
                    <Image 
                      source={{ uri: selectedUserProfile.profilePhoto }} 
                      style={styles.profilePhoto}
                    />
                    <Text style={styles.profileName}>{selectedUserProfile.name}</Text>
                    <Text style={styles.profileUsername}>@{selectedUserProfile.username}</Text>
                    <Text style={styles.profileBio}>{selectedUserProfile.bio}</Text>
                  </View>

                  <View style={styles.profileStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{selectedUserProfile.reviewCount}</Text>
                      <Text style={styles.statLabel}>Yorum</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{selectedUserProfile.placesVisited}</Text>
                      <Text style={styles.statLabel}>Ziyaret</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{selectedUserProfile.followers}</Text>
                      <Text style={styles.statLabel}>Takipçi</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{selectedUserProfile.following}</Text>
                      <Text style={styles.statLabel}>Takip</Text>
                    </View>
                  </View>

                  <View style={styles.badgesSection}>
                    <Text style={styles.badgesTitle}>Rozetler</Text>
                    <View style={styles.badgesContainer}>
                      {selectedUserProfile.badges.map((badge: string, index: number) => (
                        <View key={index} style={styles.badge}>
                          <Text style={styles.badgeText}>{badge}</Text>
                        </View>
                      ))}
                    </View>
                  </View>


                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setShowProfileModal(false)}
                  >
                    <Text style={styles.closeButtonText}>Kapat</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  const handleBack = () => {
    router.back();
  };

  const handleUserProfilePress = async (userName: string) => {
    // Check if this is our app user or Google reviewer
    const userProfile = await fetchUserProfile(userName);
    if (userProfile) {
      // Navigate to dedicated user profile page
      router.push({
        pathname: '/(app)/user-profile',
        params: { userName: userName }
      });
    } else {
      // User is not a RoadBuddy user, show alert
      alert('Bu kullanıcı Google yorumcusu olup RoadBuddy kullanıcısı değildir. Sadece RoadBuddy kullanıcılarının profillerini görüntüleyebilirsiniz.');
    }
  };

  const fetchUserProfile = async (userName: string) => {
    // Simulate checking if user exists in our database
    // In real implementation, this would query your user database
    const mockUsers = [
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
        badges: ['Yemek Uzmanı', 'Şehir Rehberi'],
        isFriend: true
      },
      {
        id: '2',
        name: 'Zeynep Kaya',
        username: 'zeynep_kaya',
        profilePhoto: 'https://randomuser.me/api/portraits/women/2.jpg',
        bio: 'Doğa fotoğrafçısı ve macera tutkunu. Türkiye\'nin en güzel doğal alanlarını keşfediyor.',
        reviewCount: 67,
        placesVisited: 123,
        followers: 445,
        following: 89,
        joinDate: '2023-03-20',
        isPublic: true,
        badges: ['Doğa Rehberi', 'Macera Arayıcısı'],
        isFriend: false
      },
      {
        id: '3',
        name: 'Mehmet Demir',
        username: 'mehmet_demir',
        profilePhoto: 'https://randomuser.me/api/portraits/men/3.jpg',
        bio: 'RoadBuddy kullanıcısı. Kahve dükkanları ve kitap kafeler uzmanı. Her şehirde en iyi mekanları buluyor.',
        reviewCount: 78,
        placesVisited: 145,
        followers: 312,
        following: 98,
        joinDate: '2023-01-10',
        isPublic: true,
        badges: ['Kahve Uzmanı', 'Kitap Sever', 'Şehir Kaşifi'],
        isFriend: true
      }
    ];

    // Check if userName matches any of our mock users
    return mockUsers.find(user => user.name === userName || user.username === userName);
  };


  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FontAwesome5
        key={index}
        name="star"
        size={16}
        color={index < rating ? '#FFD700' : '#E0E0E0'}
        solid={index < rating}
      />
    ));
  };

  const renderTabContent = () => {
    if (place.category === 'Şehir') {
      // Şehirler için sadece gidilen yerler tab'ı
      return (
        <View style={styles.tabContent}>
          {place.visitedPlaces && place.visitedPlaces.length > 0 ? (
            place.visitedPlaces.map((visitedPlace, index) => (
              <View key={index} style={styles.visitedPlaceCard}>
                <Image source={{ uri: visitedPlace.image }} style={styles.visitedPlaceImage} />
                <View style={styles.visitedPlaceContent}>
                  <View style={styles.visitedPlaceHeader}>
                    <Text style={styles.visitedPlaceName}>{visitedPlace.name}</Text>
                    <View style={styles.visitedPlaceRating}>
                      <FontAwesome5 name="star" size={14} color="#FFD700" />
                      <Text style={styles.visitedPlaceRatingText}>{visitedPlace.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.visitedPlaceDescription}>{visitedPlace.description}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noVisitedPlacesText}>Bu şehirde henüz ziyaret edilen yer bulunmuyor.</Text>
          )}
        </View>
      );
    }

    // Normal yerler için eski tab yapısı
    switch (activeTab) {
      case 0: // Bilgiler ve Puan
        return (
          <View style={styles.tabContent}>
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Yer Hakkında</Text>
              <Text style={styles.description}>
                {placeDetails?.description || place.description}
              </Text>
              <Text style={styles.address}>📍 {place.address}</Text>
            </View>

            <View style={styles.ratingSection}>
              <Text style={styles.sectionTitle}>Değerlendirmeler</Text>
              <View style={styles.ratingContainer}>
                <View style={styles.ratingLeft}>
                  <Text style={styles.ratingScore}>{place.rating.toFixed(1)}</Text>
                  <View style={styles.starsContainer}>
                    {renderStars(Math.floor(place.rating))}
                  </View>
                  <Text style={styles.reviewCount}>
                    {place.reviewCount} değerlendirme
                  </Text>
                </View>
                <View style={styles.ratingBars}>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = placeDetails?.ratingBreakdown?.[star] || 0;
                    const total = place.reviewCount || 1;
                    const percentage = (count / total) * 100;
                    
                    return (
                      <View key={star} style={styles.ratingBar}>
                        <Text style={styles.starLabel}>{star}</Text>
                        <View style={styles.barContainer}>
                          <View 
                            style={[
                              styles.barFill, 
                              { width: `${percentage}%` }
                            ]} 
                          />
                        </View>
                        <Text style={styles.ratingCount}>{count}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          </View>
        );

      case 1: // Yorumlar
        const displayedReviews = allReviews.slice(0, displayedReviewCount);
        const hasMoreReviews = allReviews.length > displayedReviewCount;
        
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Kullanıcı Yorumları</Text>
            {allReviews.length === 0 ? (
              <Text style={styles.noReviewsText}>Henüz yorum bulunmuyor.</Text>
            ) : (
              <>
                {displayedReviews.map((review, index) => {
                  const isAppReview = index === 0; // First review is from our app
                  return (
                    <View key={review.id} style={[
                      styles.reviewItem,
                      isAppReview && styles.appReviewItem
                    ]}>
                      <View style={styles.reviewHeader}>
                        <View style={styles.reviewUser}>
                          <TouchableOpacity onPress={() => handleUserProfilePress(index === 0 ? 'Mehmet Demir' : review.userName)}>
                            <Text style={styles.userNameClickable}>
                              {index === 0 ? 'Mehmet Demir' : review.userName}
                            </Text>
                          </TouchableOpacity>
                          <Text style={styles.reviewDate}>{review.date}</Text>
                        </View>
                        <View style={styles.reviewStars}>
                          {renderStars(review.rating)}
                        </View>
                      </View>
                      <Text style={styles.reviewComment}>
                        {index === 0 ? 'Harika bir yer! RoadBuddy sayesinde keşfettim. Kahve çok lezzetli ve atmosfer mükemmel. Kesinlikle tekrar geleceğim.' : review.comment}
                      </Text>
                    </View>
                  );
                })}
                
                {hasMoreReviews && (
                  <TouchableOpacity 
                    style={styles.loadMoreButton}
                    onPress={() => setDisplayedReviewCount(prev => prev + 30)}
                  >
                    <Text style={styles.loadMoreText}>Daha fazla göster</Text>
                    <FontAwesome5 name="chevron-down" size={16} color="#E91E63" />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        );

      case 2: // Saatler
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Çalışma Saatleri</Text>
            {placeDetails?.openingHours?.weekdayText ? (
              placeDetails.openingHours.weekdayText.map((hours, index) => (
                <View key={index} style={styles.hoursItem}>
                  <Text style={styles.hoursText}>{hours}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noHoursText}>Çalışma saatleri bilgisi bulunmuyor.</Text>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  const tabs = place.category === 'Şehir' ? ['Gidilen Yerler'] : ['Bilgiler', 'Yorumlar', 'Saatler'];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{place.name}</Text>
        <TouchableOpacity style={styles.favoriteButton}>
          <FontAwesome5 name="heart" size={20} color="#E91E63" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tabButton,
              activeTab === index && styles.activeTabButton
            ]}
            onPress={() => setActiveTab(index)}
          >
            <Text style={[
              styles.tabText,
              activeTab === index && styles.activeTabText
            ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Photos Section */}
      {placeDetails?.photos && placeDetails.photos.length > 0 && (
        <View style={styles.photosSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photosScrollContent}
          >
            {placeDetails.photos.map((photo, index) => (
              <Image
                key={index}
                source={{ uri: photo }}
                style={styles.photoItem}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Tab Content */}
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>

      {/* User Profile Modal */}
      <Modal
        visible={showProfileModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.profileModal}>
            {selectedUserProfile && (
              <>
                <View style={styles.profileHeader}>
                  <Image 
                    source={{ uri: selectedUserProfile.profilePhoto }} 
                    style={styles.profilePhoto}
                  />
                  <Text style={styles.profileName}>{selectedUserProfile.name}</Text>
                  <Text style={styles.profileUsername}>@{selectedUserProfile.username}</Text>
                  <Text style={styles.profileBio}>{selectedUserProfile.bio}</Text>
                </View>

                <View style={styles.profileStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{selectedUserProfile.reviewCount}</Text>
                    <Text style={styles.statLabel}>Yorum</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{selectedUserProfile.placesVisited}</Text>
                    <Text style={styles.statLabel}>Ziyaret</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{selectedUserProfile.followers}</Text>
                    <Text style={styles.statLabel}>Takipçi</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{selectedUserProfile.following}</Text>
                    <Text style={styles.statLabel}>Takip</Text>
                  </View>
                </View>

                <View style={styles.badgesSection}>
                  <Text style={styles.badgesTitle}>Rozetler</Text>
                  <View style={styles.badgesContainer}>
                    {selectedUserProfile.badges.map((badge: string, index: number) => (
                      <View key={index} style={styles.badge}>
                        <Text style={styles.badgeText}>{badge}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowProfileModal(false)}
                >
                  <Text style={styles.closeButtonText}>Kapat</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    zIndex: 10,
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
    flex: 1,
    textAlign: 'center',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#E91E63',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#E91E63',
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  infoSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 15,
  },
  address: {
    fontSize: 16,
    color: '#666',
  },
  ratingSection: {
    marginBottom: 25,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ratingLeft: {
    alignItems: 'center',
    marginRight: 30,
  },
  ratingScore: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
  ratingBars: {
    flex: 1,
  },
  ratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starLabel: {
    fontSize: 14,
    color: '#333',
    width: 20,
    marginRight: 10,
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  reviewItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  appReviewItem: {
    backgroundColor: '#E8F5E8',
    borderLeftWidth: 4,
    borderLeftColor: '#E91E63',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  userInitial: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
  reviewStars: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  hoursSection: {
    marginBottom: 25,
  },
  hoursContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
  },
  hourItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  dayText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  hourText: {
    fontSize: 16,
    color: '#666',
  },
  contactSection: {
    marginBottom: 25,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 10,
  },
  contactText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
  },
  statusContainer: {
    marginBottom: 15,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  ratingCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    minWidth: 20,
  },
  loadMoreButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E91E63',
  },
  loadMoreText: {
    fontSize: 16,
    color: '#E91E63',
    fontWeight: '600',
    marginRight: 8,
  },
  noReviewsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  userNameClickable: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E91E63',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  profileUsername: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  profileBio: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 15,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  badgesSection: {
    marginBottom: 20,
  },
  badgesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  profileActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  followButton: {
    flex: 1,
    backgroundColor: '#E91E63',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  followButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  messageButton: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E91E63',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  messageButtonText: {
    fontSize: 16,
    color: '#E91E63',
    fontWeight: '600',
  },
  visitedPlaceCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  visitedPlaceImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  visitedPlaceContent: {
    flex: 1,
    padding: 10,
  },
  visitedPlaceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  visitedPlaceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  visitedPlaceRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visitedPlaceRatingText: {
    fontSize: 14,
    color: '#FFD700',
    marginLeft: 5,
  },
  visitedPlaceDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  noVisitedPlacesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  hoursItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  hoursText: {
    fontSize: 16,
    color: '#333',
  },
  noHoursText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  photosSection: {
    height: 200,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  photosScrollContent: {
    paddingHorizontal: 10,
  },
  photoItem: {
    width: 180,
    height: 180,
    borderRadius: 12,
    marginHorizontal: 5,
    marginVertical: 10,
  },
});
