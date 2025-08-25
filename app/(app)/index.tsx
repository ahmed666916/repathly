import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const [destination, setDestination] = useState('');

  // Sayfa focus olduğunda reset kontrolü
  useFocusEffect(
    useCallback(() => {
      if ((global as any).shouldResetInputs) {
        setDestination('');
        (global as any).shouldResetInputs = false;
      }
    }, [])
  );

  const handleContinue = () => {
    if (!destination.trim()) {
      Alert.alert('Hata', 'Lütfen nereye gitmek istediğinizi girin.');
      return;
    }

    // Global'e kaydet
    (global as any).routeDestination = destination.trim();
    
    // Ara nokta sayfasına git
    router.push({
      pathname: '/(app)/waypoints',
      params: { destination: destination.trim() }
    });
  };

  const capitalizeText = (text: string) => {
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <ImageBackground
      source={require('../../assets/images/loginbackground.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        
        <View style={styles.content}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Hoş Geldiniz!</Text>
            <Text style={styles.welcomeSubtitle}>
              Keşfe başlamak için rotanızı belirleyiniz
            </Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Nereye gitmek istiyorsunuz?</Text>
            <View style={styles.inputContainer}>
              <FontAwesome name="map-marker" size={20} color="#E91E63" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Örn: Antalya, Cappadocia, Bodrum..."
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                value={destination}
                onChangeText={(text) => setDestination(capitalizeText(text))}
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.continueButton, !destination.trim() && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={!destination.trim()}
          >
            <Text style={styles.continueButtonText}>Devam Et</Text>
            <FontAwesome name="arrow-right" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  inputSection: {
    marginBottom: 40,
  },
  inputLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 15,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  inputIcon: {
    marginRight: 15,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: '#E91E63',
    borderRadius: 15,
    paddingVertical: 18,
    paddingHorizontal: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  continueButtonDisabled: {
    backgroundColor: 'rgba(233, 30, 99, 0.5)',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 15,
  },
});
