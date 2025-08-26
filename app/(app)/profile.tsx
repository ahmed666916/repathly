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
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);

  // Mock current user data
  const currentUser = {
    id: '1',
    name: 'Mehmet Özkan',
    username: 'mehmet_ozkan',
    profilePhoto: 'https://randomuser.me/api/portraits/men/3.jpg',
    bio: 'Türkiye\'nin her köşesini keşfetmeyi seven bir gezgin. Yemek kültürü ve tarihi mekanlar tutkunu.',
    reviewCount: 89,
    placesVisited: 234,
    followers: 456,
    following: 123,
    joinDate: '2022-08-15',
    isPublic: true,
    badges: ['Seyahat Uzmanı', 'Yemek Kritiği', 'Fotoğraf Sanatçısı', 'Şehir Rehberi'],
    recentPlaces: [
      { name: 'Galata Kulesi', city: 'İstanbul', image: 'https://picsum.photos/100/100?random=1' },
      { name: 'Anıtkabir', city: 'Ankara', image: 'https://picsum.photos/100/100?random=2' },
      { name: 'Efes Antik Kenti', city: 'İzmir', image: 'https://picsum.photos/100/100?random=3' },
    ]
  };

  const handleBack = () => {
    router.back();
  };

  const handleEditProfile = () => {
    Alert.alert('Profil Düzenle', 'Profil düzenleme sayfası yakında eklenecek!');
  };

  const handleShareProfile = () => {
    Alert.alert('Profil Paylaş', 'Profil paylaşma özelliği yakında eklenecek!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profilim</Text>
        <TouchableOpacity onPress={handleShareProfile} style={styles.shareButton}>
          <FontAwesome5 name="share-alt" size={20} color="#E91E63" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image 
            source={{ uri: currentUser.profilePhoto }} 
            style={styles.profilePhoto}
          />
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

        {/* Badges */}
        <View style={styles.badgesSection}>
          <Text style={styles.sectionTitle}>Rozetlerim</Text>
          <View style={styles.badgesContainer}>
            {currentUser.badges.map((badge, index) => (
              <View key={index} style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Places */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Son Ziyaret Ettiğim Yerler</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {currentUser.recentPlaces.map((place, index) => (
              <View key={index} style={styles.placeCard}>
                <Image source={{ uri: place.image }} style={styles.placeImage} />
                <Text style={styles.placeName}>{place.name}</Text>
                <Text style={styles.placeCity}>{place.city}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Profile Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Genel Ayarlar</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/(app)/settings/personal-info')}
          >
            <FontAwesome5 name="user" size={20} color="#E91E63" />
            <Text style={styles.settingText}>Kişi Bilgileri</Text>
            <FontAwesome5 name="chevron-right" size={16} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/(app)/settings/previous-places')}
          >
            <FontAwesome5 name="map-marked-alt" size={20} color="#E91E63" />
            <Text style={styles.settingText}>Önceki Gittiği Yerler</Text>
            <FontAwesome5 name="chevron-right" size={16} color="#ccc" />
          </TouchableOpacity>


          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/(app)/settings/profile-settings')}
          >
            <FontAwesome5 name="user-cog" size={20} color="#E91E63" />
            <Text style={styles.settingText}>Profil Ayarları</Text>
            <FontAwesome5 name="chevron-right" size={16} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/(app)/settings/privacy-settings')}
          >
            <FontAwesome5 name="shield-alt" size={20} color="#E91E63" />
            <Text style={styles.settingText}>Gizlilik Ayarları</Text>
            <FontAwesome5 name="chevron-right" size={16} color="#ccc" />
          </TouchableOpacity>
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  shareButton: {
    padding: 8,
  },
  content: {
    flex: 1,
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
  recentSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  placeCard: {
    marginRight: 15,
    alignItems: 'center',
    width: 100,
  },
  placeImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginBottom: 8,
  },
  placeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 2,
  },
  placeCity: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  settingsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
});
