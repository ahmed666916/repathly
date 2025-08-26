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
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface ChatUser {
  id: string;
  name: string;
  username: string;
  profilePhoto: string;
  isOnline: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isFriend: boolean;
}

export default function ChatsScreen() {
  const router = useRouter();
  
  const [chatUsers] = useState<ChatUser[]>([
    {
      id: '1',
      name: 'Ahmet Yılmaz',
      username: 'ahmet_yilmaz',
      profilePhoto: 'https://randomuser.me/api/portraits/men/1.jpg',
      isOnline: true,
      lastMessage: 'O restoran gerçekten harikaydı! Teşekkürler öneri için 😊',
      lastMessageTime: '14:30',
      unreadCount: 2,
      isFriend: true,
    },
    {
      id: '3',
      name: 'Mehmet Demir',
      username: 'mehmet_demir',
      profilePhoto: 'https://randomuser.me/api/portraits/men/3.jpg',
      isOnline: false,
      lastMessage: 'Başka önerilerın var mı?',
      lastMessageTime: 'Dün',
      unreadCount: 0,
      isFriend: true,
    },
    {
      id: '2',
      name: 'Zeynep Kaya',
      username: 'zeynep_kaya',
      profilePhoto: 'https://randomuser.me/api/portraits/women/2.jpg',
      isOnline: true,
      lastMessage: 'Doğa fotoğrafları için harika yerler buldum!',
      lastMessageTime: '2 gün önce',
      unreadCount: 1,
      isFriend: true,
    },
    {
      id: '4',
      name: 'Elif Şahin',
      username: 'elif_sahin',
      profilePhoto: 'https://randomuser.me/api/portraits/women/5.jpg',
      isOnline: false,
      lastMessage: 'Müze gezisi nasıldı?',
      lastMessageTime: '1 hafta önce',
      unreadCount: 0,
      isFriend: true,
    },
  ]);

  const handleBack = () => {
    router.back();
  };

  const handleChatPress = (user: ChatUser) => {
    router.push({
      pathname: '/(app)/chat',
      params: { userId: user.id, userName: user.name }
    });
  };

  const renderChatItem = ({ item }: { item: ChatUser }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => handleChatPress(item)}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.profilePhoto }} style={styles.avatar} />
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.messageTime}>{item.lastMessageTime}</Text>
        </View>
        
        <View style={styles.messageRow}>
          <Text 
            style={[
              styles.lastMessage,
              item.unreadCount && item.unreadCount > 0 ? styles.unreadMessage : null
            ]} 
            numberOfLines={1}
          >
            {item.lastMessage || 'Henüz mesaj yok'}
          </Text>
          {item.unreadCount && item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const activeChatUsers = chatUsers.filter(user => user.isFriend);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sohbetler</Text>
        <TouchableOpacity style={styles.newChatButton}>
          <FontAwesome5 name="edit" size={20} color="#E91E63" />
        </TouchableOpacity>
      </View>

      {/* Chat Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {activeChatUsers.length} aktif sohbet
        </Text>
      </View>

      {/* Chat List */}
      {activeChatUsers.length === 0 ? (
        <View style={styles.emptyState}>
          <FontAwesome5 name="comments" size={48} color="#ccc" />
          <Text style={styles.emptyTitle}>Henüz sohbet yok</Text>
          <Text style={styles.emptySubtitle}>
            Takip ettiğiniz kişilerle sohbet etmeye başlayın
          </Text>
        </View>
      ) : (
        <FlatList
          data={activeChatUsers}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          style={styles.chatList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.chatListContent}
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
  newChatButton: {
    padding: 8,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  chatList: {
    flex: 1,
  },
  chatListContent: {
    paddingVertical: 8,
  },
  chatItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#fff',
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  unreadMessage: {
    color: '#333',
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#E91E63',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
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
