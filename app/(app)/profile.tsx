import React, { useState } from 'react';
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
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'favorites' | 'reviews'>('favorites');

  // Mock current user data with cities and destinations
  const currentUser = {
    id: '1',
    name: 'Mehmet Özkan',
    username: 'mehmet_ozkan',
    profilePhoto: 'https://randomuser.me/api/portraits/men/3.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
    bio: 'Türkiye\'nin her köşesini keşfetmeyi seven bir gezgin. Yemek kültürü ve tarihi mekanlar tutkunu.',
    reviewCount: 89,
    placesVisited: 234,
    followers: 456,
    following: 123,
    joinDate: '2022-08-15',
    isPublic: true,
    stories: [
      { 
        id: '1', 
        title: 'İstanbul', 
        image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=200&h=200&fit=crop',
        description: 'Türkiye\'nin en büyük şehri, tarihi ve kültürel merkezi',
        visitedPlaces: [
          { name: 'Galata Kulesi', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=300&h=300&fit=crop', rating: 4.8, description: 'İstanbul\'un simgesi, 528 yılında inşa edilen tarihi kule' },
          { name: 'Ayasofya', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', rating: 4.9, description: '1500 yıllık tarihi ile dünya mimarlık tarihinin başyapıtı' },
          { name: 'Topkapı Sarayı', image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=300&h=300&fit=crop', rating: 4.7, description: 'Osmanlı İmparatorluğu\'nun 400 yıl boyunca ana sarayı' },
          { name: 'Kapalı Çarşı', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', rating: 4.6, description: 'Dünyanın en eski ve en büyük kapalı çarşılarından biri' },
          { name: 'Sultanahmet Camii', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=300&h=300&fit=crop', rating: 4.8, description: 'Mavi Camii olarak bilinen, 6 minareli tarihi cami' }
        ]
      },
      { 
        id: '2', 
        title: 'Ankara', 
        image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=200&h=200&fit=crop',
        description: 'Türkiye\'nin başkenti, Atatürk\'ün şehri',
        visitedPlaces: [
          { name: 'Anıtkabir', image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=300&h=300&fit=crop', rating: 4.9, description: 'Mustafa Kemal Atatürk\'ün anıt mezarı, Türkiye\'nin en önemli simgesi' },
          { name: 'Kızılay Meydanı', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', rating: 4.3, description: 'Ankara\'nın kalbi, alışveriş ve sosyal hayatın merkezi' },
          { name: 'Atakule', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=300&h=300&fit=crop', rating: 4.1, description: 'Ankara\'nın simgesi, 125 metre yüksekliğinde kule' },
          { name: 'Ulus Meydanı', image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=300&h=300&fit=crop', rating: 4.2, description: 'Tarihi Ankara\'nın merkezi, Roma döneminden kalma yapılar' }
        ]
      },
      { 
        id: '3', 
        title: 'İzmir', 
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop',
        description: 'Ege\'nin incisi, antik çağların önemli liman kenti',
        visitedPlaces: [
          { name: 'Efes Antik Kenti', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', rating: 4.8, description: 'Antik dünyanın en büyük ve en iyi korunmuş antik kenti' },
          { name: 'Kemeraltı Çarşısı', image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=300&h=300&fit=crop', rating: 4.4, description: '400 yıllık tarihi çarşı, geleneksel el sanatları merkezi' },
          { name: 'Saat Kulesi', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=300&h=300&fit=crop', rating: 4.2, description: 'İzmir\'in simgesi, 1901 yılında inşa edilen tarihi kule' },
          { name: 'Kordon Boyu', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', rating: 4.5, description: 'Ege Denizi manzaralı, yürüyüş ve dinlenme alanı' }
        ]
      },
      { 
        id: '4', 
        title: 'Antalya', 
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop',
        description: 'Türkiye\'nin turizm başkenti, tarih ve doğanın buluştuğu yer',
        visitedPlaces: [
          { name: 'Kaleiçi', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', rating: 4.6, description: 'Antalya\'nın tarihi merkezi, Roma döneminden kalma surlar' },
          { name: 'Düden Şelalesi', image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=300&h=300&fit=crop', rating: 4.5, description: 'Antalya\'nın doğal güzelliği, 40 metre yüksekliğinde şelale' },
          { name: 'Aspendos Antik Tiyatrosu', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=300&h=300&fit=crop', rating: 4.7, description: 'Roma döneminden kalma, dünyanın en iyi korunmuş antik tiyatrosu' },
          { name: 'Köprülü Kanyon', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', rating: 4.4, description: '14 km uzunluğunda, rafting için ideal doğal kanyon' }
        ]
      },
      { 
        id: '5', 
        title: 'Kapadokya', 
        image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=200&h=200&fit=crop',
        description: 'Peri bacaları ve sıcak hava balonları ile ünlü doğal harika',
        visitedPlaces: [
          { name: 'Peribacaları', image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=300&h=300&fit=crop', rating: 4.9, description: 'Doğanın milyonlarca yılda oluşturduğu eşsiz jeolojik yapılar' },
          { name: 'Göreme Açık Hava Müzesi', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=300&h=300&fit=crop', rating: 4.8, description: 'UNESCO Dünya Mirası Listesi\'nde yer alan tarihi alan' },
          { name: 'Uçhisar Kalesi', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', rating: 4.6, description: 'Kapadokya\'nın en yüksek noktası, muhteşem manzara' },
          { name: 'Ihlara Vadisi', image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=300&h=300&fit=crop', rating: 4.7, description: '14 km uzunluğunda, tarihi kiliseleri olan doğal vadi' }
        ]
      }
    ],
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
      },
      { 
        id: '3', 
        name: 'Efes Antik Kenti', 
        city: 'İzmir', 
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', 
        rating: 4.8,
        description: 'Antik dünyanın en büyük ve en iyi korunmuş antik kenti'
      },
      { 
        id: '4', 
        name: 'Kaleiçi', 
        city: 'Antalya', 
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', 
        rating: 4.6,
        description: 'Antalya\'nın tarihi merkezi, Roma döneminden kalma surlar'
      },
      { 
        id: '5', 
        name: 'Peribacaları', 
        city: 'Kapadokya', 
        image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=300&h=300&fit=crop', 
        rating: 4.9,
        description: 'Doğanın mucizesi, kesinlikle görülmeli! Balon turu harika.'
      },
      { 
        id: '6', 
        name: 'Ayasofya', 
        city: 'İstanbul', 
        image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=300&h=300&fit=crop', 
        rating: 4.9,
        description: 'İnsanlık tarihinin en önemli yapılarından. İçerideki mozaikler muhteşem.'
      },
      { 
        id: '7', 
        name: 'Topkapı Sarayı', 
        city: 'İstanbul', 
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', 
        rating: 4.7,
        description: 'Osmanlı İmparatorluğu\'nun 400 yıl boyunca ana sarayı'
      },
      { 
        id: '8', 
        name: 'Pamukkale', 
        city: 'Denizli', 
        image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=300&h=300&fit=crop', 
        rating: 4.8,
        description: 'Beyaz traverten terasları ile ünlü doğal harika'
      }
    ],
    recentReviews: [
      { id: '1', placeName: 'Galata Kulesi', city: 'İstanbul', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=300&h=300&fit=crop', rating: 4.8, review: 'Muhteşem manzara ve tarihi atmosfer! İstanbul\'un en güzel manzarasını sunuyor.', date: '2024-01-15' },
      { id: '2', placeName: 'Anıtkabir', city: 'Ankara', image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=300&h=300&fit=crop', rating: 4.9, review: 'Her Türk vatandaşının görmesi gereken yer. Atatürk\'ün anısına saygıyla...', date: '2024-01-10' },
      { id: '3', placeName: 'Efes Antik Kenti', city: 'İzmir', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', rating: 4.8, review: 'Antik dünyanın en etkileyici kalıntıları. Tarih kokan sokaklar...', date: '2024-01-05' },
      { id: '4', placeName: 'Kaleiçi', city: 'Antalya', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', rating: 4.6, review: 'Tarihi sokaklarda kaybolmak çok keyifli. Roma surları etkileyici.', date: '2023-12-28' },
      { id: '5', placeName: 'Peribacaları', city: 'Kapadokya', image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=300&h=300&fit=crop', rating: 4.9, review: 'Doğanın mucizesi, kesinlikle görülmeli! Balon turu harika.', date: '2023-12-20' },
      { id: '6', placeName: 'Ayasofya', city: 'İstanbul', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=300&h=300&fit=crop', rating: 4.9, review: 'İnsanlık tarihinin en önemli yapılarından. İçerideki mozaikler muhteşem.', date: '2023-12-15' },
    ]
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
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 gün önce';
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
    return `${Math.floor(diffDays / 30)} ay önce`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profilim</Text>
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
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <FontAwesome5 name="edit" size={16} color="white" />
            <Text style={styles.editButtonText}>Profili Düzenle</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{currentUser.reviewCount}</Text>
            <Text style={styles.statLabel}>Yorum</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{currentUser.placesVisited}</Text>
            <Text style={styles.statLabel}>Ziyaret</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{currentUser.followers}</Text>
            <Text style={styles.statLabel}>Takipçi</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{currentUser.following}</Text>
            <Text style={styles.statLabel}>Takip</Text>
          </View>
        </View>

        {/* Stories Section */}
        <View style={styles.storiesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {currentUser.stories.map((story) => (
              <TouchableOpacity 
                key={story.id} 
                style={styles.storyItem}
                onPress={() => {
                  console.log('Story clicked:', story);
                  // Şehir bilgilerini place-detail sayfasına gönder
                  const cityData = {
                    id: story.id,
                    name: story.title,
                    category: 'Şehir',
                    rating: 4.8,
                    reviewCount: story.visitedPlaces.length,
                    description: story.description,
                    imageUri: story.image,
                    address: `${story.title}, Türkiye`,
                    priceLevel: 2,
                    visitedPlaces: story.visitedPlaces
                  };
                  
                  router.push({
                    pathname: '/(app)/place-detail',
                    params: { 
                      placeData: JSON.stringify(cityData)
                    }
                  });
                }}
                activeOpacity={0.7}
              >
                <View style={styles.storyCircle}>
                  <Image source={{ uri: story.image }} style={styles.storyImage} />
                </View>
                <Text style={styles.storyTitle}>{story.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'favorites' && styles.activeTabButton]}
            onPress={() => setActiveTab('favorites')}
          >
            <FontAwesome5 name="heart" size={20} color={activeTab === 'favorites' ? '#E91E63' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
              Favori Deneyimler
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'reviews' && styles.activeTabButton]}
            onPress={() => setActiveTab('reviews')}
          >
            <FontAwesome5 name="comment" size={20} color={activeTab === 'reviews' ? '#E91E63' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
              Son Yorumlar
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
            {currentUser.recentReviews.map((review) => (
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
    backgroundColor: '#E91E63',
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
    color: '#E91E63',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  storiesSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  storyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#E91E63',
    marginBottom: 8,
    overflow: 'hidden',
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  storyTitle: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
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
});
