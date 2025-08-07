import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ImageBackground, StatusBar } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require('../../assets/images/loginbackground.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <StatusBar barStyle="light-content" />
        
        <View style={styles.content}>
          {/* Welcome Header */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Hoş Geldiniz</Text>
            <Text style={styles.welcomeSubtitle}>
              Lütfen ilgi alanlarınızı seçin
            </Text>
          </View>

          {/* Interest Areas Button */}
          <TouchableOpacity 
            style={styles.interestButton} 
            onPress={() => router.push('/(app)/interests')}
          >
            <FontAwesome name="heart" size={20} color="#fff" style={styles.interestIcon} />
            <Text style={styles.interestButtonText}>İlgi Alanlarını Seç</Text>
            <FontAwesome name="chevron-right" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Bottom Info */}
        <View style={styles.bottomInfo}>
          <Text style={styles.bottomInfoText}>
            Kişiselleştirilmiş seyahat deneyimi için önce tercihlerinizi belirleyin
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  interestButton: {
    flexDirection: 'row',
    backgroundColor: '#E91E63',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    minWidth: 280,
  },
  interestIcon: {
    marginRight: 12,
  },
  interestButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },

  bottomInfo: {
    position: 'absolute',
    bottom: 40,
    left: 30,
    right: 30,
    alignItems: 'center',
  },
  bottomInfoText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
