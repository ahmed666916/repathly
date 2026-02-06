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
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { t } from '../../services/api/i18n';
import { useAuthContext } from '../../contexts/AuthContext';
import { useProfileContext } from '../../contexts/ProfileContext';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { profile, isLoading, fetchProfile, error } = useProfileContext();
  const [activeTab, setActiveTab] = useState<'favorites' | 'reviews'>('favorites');

  useEffect(() => {
    // Fetch profile data when component mounts
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Kullanıcı bulunamadı</Text>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#E91E63" />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <FontAwesome5 name="exclamation-circle" size={48} color="#E91E63" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => fetchProfile()}
          >
            <Text style={styles.buttonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Use real user data with safe fallbacks
  const currentUser = {
    id: user.id,
    name: user.name || 'Kullanıcı',
    username: user.email?.split('@')[0] || 'user',
    profilePhoto: user.profilePhoto || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
    coverPhoto: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
    bio: profile?.bio || 'Yeni Repathly gezgini!',
    stats: {
      reviewCount: 0,
      placesVisited: 0,
      followers: 0,
      following: 0,
    },
    joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2024',
    stories: [],
    favoriteExperiences: [
      {
        id: '1',
        name: 'Galata Kulesi',
        city: 'İstanbul',
        image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=300&h=300&fit=crop',
        rating: 4.8,
        description: 'İstanbul\'un simgesi, 528 yılında inşa edilen tarihi kule'
      },
      {
        id: '2',
        name: 'Anıtkabir',
        city: 'Ankara',
        image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=300&h=300&fit=crop',
        rating: 4.9,
        description: 'Mustafa Kemal Atatürk\'ün anıt mezarı, Türkiye\'nin en önemli simgesi'
      }
    ],
    recentReviews: []
  };

  const handleBack = () => {
    router.back();
  };

  const handleEditProfile = () => {
    Alert.alert('Profil Düzenle', 'Profil düzenleme sayfası yakında eklenecek!');
  };

  const handleSettings = () => {
    router.push('/(app)/settings');
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (isNaN(date.getTime())) return 'Yakın zamanda';
      if (diffDays === 1) return '1 gün önce';
      if (diffDays < 7) return `${diffDays} gün önce`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
      return `${Math.floor(diffDays / 30)} ay önce`;
    } catch {
      return 'Yakın zamanda';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile.myProfile')}</Text>
        <TouchableOpacity onPress={handleSettings} style={styles.settingsButton}>
          <FontAwesome5 name="cog" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cover Photo */}
        <View style={styles.coverContainer}>
          <Image
            source={{ uri: currentUser.coverPhoto }}
            style={styles.coverPhoto}
          />
          <View style={styles.coverOverlay} />

          {/* Profile Photo Overlay */}
          <View style={styles.profilePhotoContainer}>
            <Image
              source={{ uri: currentUser.profilePhoto }}
              style={styles.profilePhoto}
            />
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{currentUser.name}</Text>
          <Text style={styles.profileUsername}>@{currentUser.username}</Text>
          <Text style={styles.profileBio}>{currentUser.bio}</Text>

          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <FontAwesome5 name="edit" size={14} color="white" />
            <Text style={styles.editButtonText}>Profili Düzenle</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{currentUser.stats.reviewCount}</Text>
            <Text style={styles.statLabel}>{t('profile.reviews')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{currentUser.stats.placesVisited}</Text>
            <Text style={styles.statLabel}>{t('profile.visits')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{currentUser.stats.followers}</Text>
            <Text style={styles.statLabel}>{t('profile.followers')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{currentUser.stats.following}</Text>
            <Text style={styles.statLabel}>{t('profile.following')}</Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'favorites' && styles.activeTabButton]}
            onPress={() => setActiveTab('favorites')}
          >
            <FontAwesome5 name="heart" size={20} color={activeTab === 'favorites' ? '#E91E63' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
              {t('profile.favoriteExperiences')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'reviews' && styles.activeTabButton]}
            onPress={() => setActiveTab('reviews')}
          >
            <FontAwesome5 name="comment" size={20} color={activeTab === 'reviews' ? '#E91E63' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
              {t('profile.recentReviews')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'favorites' ? (
          <View style={styles.favoritesGrid}>
            {currentUser.favoriteExperiences.map((experience) => (
              <View key={experience.id} style={styles.favoriteItem}>
                <Image source={{ uri: experience.image }} style={styles.favoriteImage} />
                <View style={styles.favoriteOverlay}>
                  <View style={styles.favoriteRating}>
                    <FontAwesome5 name="star" size={12} color="#FFD700" />
                    <Text style={styles.favoriteRatingText}>{experience.rating}</Text>
                  </View>
                </View>
                <Text style={styles.favoriteName}>{experience.name}</Text>
                <Text style={styles.favoriteCity}>{experience.city}</Text>
                <Text style={styles.favoriteDescription}>{experience.description}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.reviewsList}>
            {currentUser.recentReviews.map((review: any) => (
              <View key={review.id} style={styles.reviewItem}>
                <Image source={{ uri: review.image }} style={styles.reviewImage} />
                <View style={styles.reviewContent}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewPlaceName}>{review.placeName}</Text>
                    <View style={styles.reviewRating}>
                      <FontAwesome5 name="star" size={12} color="#FFD700" />
                      <Text style={styles.reviewRatingText}>{review.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.reviewCity}>{review.city}</Text>
                  <Text style={styles.reviewText}>{review.review}</Text>
                  <Text style={styles.reviewDate}>{formatDate(review.date)}</Text>
                </View>
              </View>
            ))}
            {currentUser.recentReviews.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Henüz yorum yok.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#999',
    fontSize: 16,
  },
  errorText: {
    color: '#E91E63',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    position: 'absolute',
    top: 20,
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
  settingsButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
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
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF', // Using standard iOS blue for now
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  editButtonText: {
    color: 'white',
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
    color: '#007AFF',
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
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
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
  favoriteDescription: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
    lineHeight: 16,
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
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
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
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  }
});
