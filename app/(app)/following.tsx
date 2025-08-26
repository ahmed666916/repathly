import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface User {
  id: string;
  name: string;
  username: string;
  profilePhoto: string;
  bio: string;
  reviewCount: number;
  placesVisited: number;
  isFollowing: boolean;
}

export default function FollowingScreen() {
  const router = useRouter();
  
  const [followingUsers, setFollowingUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Ahmet Yılmaz',
      username: 'ahmet_yilmaz',
      profilePhoto: 'https://randomuser.me/api/portraits/men/1.jpg',
      bio: 'İstanbul\'un gizli köşelerini keşfeden bir gezgin',
      reviewCount: 45,
      placesVisited: 89,
      isFollowing: true,
    },
    {
      id: '2',
      name: 'Zeynep Kaya',
      username: 'zeynep_kaya',
      profilePhoto: 'https://randomuser.me/api/portraits/women/2.jpg',
      bio: 'Doğa fotoğrafçısı ve macera tutkunu',
      reviewCount: 67,
      placesVisited: 123,
      isFollowing: true,
    },
    {
      id: '3',
      name: 'Can Demir',
      username: 'can_demir',
      profilePhoto: 'https://randomuser.me/api/portraits/men/4.jpg',
      bio: 'Yemek blogger\'ı ve restoran kritiği',
      reviewCount: 89,
      placesVisited: 156,
      isFollowing: true,
    },
    {
      id: '4',
      name: 'Elif Şahin',
      username: 'elif_sahin',
      profilePhoto: 'https://randomuser.me/api/portraits/women/5.jpg',
      bio: 'Tarihi mekanlar ve müze tutkunu',
      reviewCount: 34,
      placesVisited: 78,
      isFollowing: true,
    },
  ]);

  const handleBack = () => {
    router.back();
  };

  const handleUnfollow = (userId: string, userName: string) => {
    Alert.alert(
      'Takibi Bırak',
      `${userName} kullanıcısını takip etmeyi bırakmak istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Takibi Bırak',
          style: 'destructive',
          onPress: () => {
            setFollowingUsers(prev => 
              prev.map(user => 
                user.id === userId 
                  ? { ...user, isFollowing: false }
                  : user
              ).filter(user => user.isFollowing)
            );
          }
        }
      ]
    );
  };

  const handleViewProfile = (userId: string) => {
    Alert.alert('Profil Görüntüle', 'Kullanıcı profili sayfası yakında eklenecek!');
  };

  const handleMessage = (userId: string, userName: string) => {
    Alert.alert('Mesaj Gönder', `${userName} ile mesajlaşma özelliği yakında eklenecek!`);
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userItem}>
      <TouchableOpacity 
        style={styles.userInfo}
        onPress={() => handleViewProfile(item.id)}
      >
        <Image source={{ uri: item.profilePhoto }} style={styles.userPhoto} />
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userUsername}>@{item.username}</Text>
          <Text style={styles.userBio} numberOfLines={2}>{item.bio}</Text>
          <View style={styles.userStats}>
            <Text style={styles.statText}>{item.reviewCount} yorum</Text>
            <Text style={styles.statText}>•</Text>
            <Text style={styles.statText}>{item.placesVisited} ziyaret</Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <View style={styles.userActions}>
        <TouchableOpacity 
          style={styles.messageButton}
          onPress={() => handleMessage(item.id, item.name)}
        >
          <FontAwesome5 name="comment" size={16} color="#E91E63" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.unfollowButton}
          onPress={() => handleUnfollow(item.id, item.name)}
        >
          <Text style={styles.unfollowText}>Takibi Bırak</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Takip Ettiklerim</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {followingUsers.length} kişiyi takip ediyorsunuz
        </Text>
      </View>

      {/* Following List */}
      {followingUsers.length === 0 ? (
        <View style={styles.emptyState}>
          <FontAwesome5 name="users" size={48} color="#ccc" />
          <Text style={styles.emptyTitle}>Henüz kimseyi takip etmiyorsunuz</Text>
          <Text style={styles.emptySubtitle}>
            Yorum yapan kullanıcıları takip ederek onların aktivitelerini görebilirsiniz
          </Text>
        </View>
      ) : (
        <FlatList
          data={followingUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  placeholder: {
    width: 36,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 10,
  },
  userItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
  },
  userPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userBio: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    marginBottom: 6,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#999',
    marginRight: 8,
  },
  userActions: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  messageButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  unfollowButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E91E63',
    borderRadius: 15,
  },
  unfollowText: {
    fontSize: 12,
    color: '#E91E63',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
