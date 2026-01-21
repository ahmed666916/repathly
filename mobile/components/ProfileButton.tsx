import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

interface ProfileButtonProps {
  onPress: () => void;
  userImage?: string;
  userName?: string;
  authProvider?: 'google' | 'facebook';
}

export default function ProfileButton({ onPress, userImage, userName, authProvider }: ProfileButtonProps) {
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderProfileContent = () => {
    if (userImage) {
      return (
        <Image 
          source={{ uri: userImage }} 
          style={styles.profileImage}
          resizeMode="cover"
        />
      );
    }
    
    return (
      <View style={styles.initialsContainer}>
        <Text style={styles.initialsText}>{getInitials(userName)}</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.profileButton}>
        {renderProfileContent()}
      </View>
      <View style={styles.settingsIcon}>
        <FontAwesome5 name="cog" size={12} color="#fff" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 50,
    height: 50,
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  profileImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  initialsContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingsIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
