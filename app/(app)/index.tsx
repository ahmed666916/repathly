import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ImageBackground, StatusBar, TextInput, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const [destination, setDestination] = useState('');

  const validateDestination = (place: string): Promise<{ isValid: boolean; suggestion?: string }> => {
    return new Promise((resolve) => {
      // Basit ama etkili validasyon
      const trimmedPlace = place.trim();
      
      // Minimum uzunluk kontrolü
      if (trimmedPlace.length < 2) {
        resolve({ isValid: false });
        return;
      }
      
      // Sadece sayı veya özel karakter kontrolü
      const hasLetters = /[a-zA-ZçğıöşüÇĞIİÖŞÜ]/.test(trimmedPlace);
      if (!hasLetters) {
        resolve({ isValid: false });
        return;
      }
      
      // Çok yaygın hatalı girişleri engelle
      const invalidPatterns = [
        /^[0-9]+$/, // Sadece sayı
        /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/, // Sadece özel karakter
        /^(.)\1{4,}$/, // Aynı karakter 5+ kez (aaaaa)
        /^test$/i,
        /^asd$/i,
        /^qwe$/i,
        /^abc$/i,
        /^undefined$/i,
        /^null$/i
      ];
      
      const isInvalid = invalidPatterns.some(pattern => pattern.test(trimmedPlace));
      if (isInvalid) {
        resolve({ isValid: false });
        return;
      }
      
      // Geçerli kabul et
      resolve({ isValid: true });
    });
  };

  const handleStartPlanning = async () => {
    if (destination.trim() === '') {
      Alert.alert('Uyarı', 'Lütfen gitmek istediğiniz yeri girin.');
      return;
    }

    // Basit validasyon yap
    const validation = await validateDestination(destination.trim());
    
    if (!validation.isValid) {
      Alert.alert(
        'Geçersiz Giriş',
        'Lütfen geçerli bir yer adı girin.\n\nÖrnekler: İstanbul, Paris, New York, Taksim',
        [
          {
            text: 'Tamam',
            style: 'default'
          }
        ]
      );
      return;
    }

    router.push({
      pathname: '/(app)/route-planner',
      params: { destination: destination.trim() }
    });
  };

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
              Keşfe başlamak için rotanızı belirleyiniz
            </Text>
          </View>

          {/* Destination Input */}
          <View style={styles.inputContainer}>
            <FontAwesome name="map-marker" size={20} color="#E91E63" style={styles.inputIcon} />
            <TextInput
              style={styles.destinationInput}
              placeholder="Nereye gitmek istiyorsunuz?"
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              value={destination}
              onChangeText={setDestination}
            />
          </View>

          {/* Start Planning Button */}
          <TouchableOpacity 
            style={styles.startButton} 
            onPress={handleStartPlanning}
          >
            <FontAwesome name="route" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.startButtonText}>Rotayı Planlamaya Başla</Text>
            <FontAwesome name="chevron-right" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Bottom Info */}
        <View style={styles.bottomInfo}>
          <Text style={styles.bottomInfoText}>
            Hedef noktanızı belirleyerek kişiselleştirilmiş rota planlama deneyimine başlayın
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
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 25,
    minWidth: 320,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputIcon: {
    marginRight: 15,
  },
  destinationInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  startButton: {
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
    minWidth: 320,
  },
  buttonIcon: {
    marginRight: 12,
  },
  startButtonText: {
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
