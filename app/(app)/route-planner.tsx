import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  TextInput,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

export default function RoutePlannerScreen() {
  const router = useRouter();
  const { destination } = useLocalSearchParams();
  const [waypoints, setWaypoints] = useState<string[]>([]);
  const [currentWaypoint, setCurrentWaypoint] = useState('');

  // Sayfa focus olduğunda reset kontrolü
  useFocusEffect(
    useCallback(() => {
      const shouldReset = (global as any).shouldResetInputs;
      if (shouldReset) {
        console.log('Route planner sayfası temizleniyor...');
        setWaypoints([]);
        setCurrentWaypoint('');
        (global as any).shouldResetInputs = false;
      }
    }, [])
  );

  const validatePlace = (place: string): Promise<{ isValid: boolean; suggestion?: string }> => {
    return new Promise((resolve) => {
      const trimmedPlace = place.trim();
      
      // Minimum uzunluk kontrolü
      if (trimmedPlace.length < 2) {
        resolve({ isValid: false });
        return;
      }
      
      // Harf içeriyor mu kontrolü
      const hasLetters = /[a-zA-ZçğıöşüÇĞIİÖŞÜ]/.test(trimmedPlace);
      if (!hasLetters) {
        resolve({ isValid: false });
        return;
      }
      
      // Hatalı girişleri engelle
      const invalidPatterns = [
        /^[0-9]+$/, // Sadece sayı
        /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/, // Sadece özel karakter
        /^(.)\1{4,}$/, // Tekrar eden karakter (aaaaa)
        /^test$/i,
        /^asd$/i,
        /^qwe$/i,
        /^abc$/i
      ];
      
      const isInvalid = invalidPatterns.some(pattern => pattern.test(trimmedPlace));
      if (isInvalid) {
        resolve({ isValid: false });
        return;
      }
      
      resolve({ isValid: true });
    });
  };

  const addWaypoint = async () => {
    if (currentWaypoint.trim() === '') {
      Alert.alert('Uyarı', 'Lütfen uğramak istediğiniz yeri girin.');
      return;
    }

    // Basit validasyon yap
    const validation = await validatePlace(currentWaypoint.trim());
    
    if (!validation.isValid) {
      Alert.alert(
        'Geçersiz Giriş',
        'Lütfen geçerli bir ara durak adı girin.\n\nÖrnekler: Taksim, Kadıköy, Central Park',
        [
          {
            text: 'Tamam',
            style: 'default'
          }
        ]
      );
      return;
    }

    setWaypoints([...waypoints, currentWaypoint.trim()]);
    setCurrentWaypoint('');
  };

  const removeWaypoint = (index: number) => {
    const updatedWaypoints = waypoints.filter((_, i) => i !== index);
    setWaypoints(updatedWaypoints);
  };

  const handleViewRoute = () => {
    router.push({
      pathname: '/(app)/map',
      params: {
        destination: destination as string,
        waypoints: JSON.stringify(waypoints),
      },
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
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  const r: any = router as any;
                  if (r?.canGoBack?.()) {
                    r.back();
                  } else {
                    r.replace('/(app)');
                  }
                }}
              >
                <FontAwesome name="arrow-left" size={20} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Rota Planlama</Text>
              <View style={styles.placeholder} />
            </View>

            {/* Destination Display */}
            <View style={styles.destinationContainer}>
              <Text style={styles.destinationLabel}>Hedef:</Text>
              <View style={styles.destinationDisplay}>
                <FontAwesome name="map-marker" size={18} color="#E91E63" />
                <Text style={styles.destinationText}>{destination}</Text>
              </View>
            </View>

            {/* Waypoints Input */}
            <View style={styles.waypointsSection}>
              <Text style={styles.sectionTitle}>Başka nerelere uğramak istersiniz?</Text>
              
              <View style={styles.inputContainer}>
                <FontAwesome name="plus-circle" size={20} color="#E91E63" style={styles.inputIcon} />
                <TextInput
                  style={styles.waypointInput}
                  placeholder="Ara durak ekleyin..."
                  placeholderTextColor="rgba(255, 255, 255, 0.7)"
                  value={currentWaypoint}
                  onChangeText={(text) => {
              // Her kelimenin ilk harfini büyük yap
              const capitalizedText = text
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
              setCurrentWaypoint(capitalizedText);
            }}
                  onSubmitEditing={addWaypoint}
                  returnKeyType="done"
                />
                <TouchableOpacity style={styles.addButton} onPress={addWaypoint}>
                  <FontAwesome name="plus" size={16} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Waypoints List */}
              {waypoints.length > 0 && (
                <View style={styles.waypointsList}>
                  <Text style={styles.waypointsListTitle}>Ara Duraklar:</Text>
                  {waypoints.map((waypoint, index) => (
                    <View key={index} style={styles.waypointItem}>
                      <FontAwesome name="location-arrow" size={16} color="#4CAF50" />
                      <Text style={styles.waypointText}>{waypoint}</Text>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeWaypoint(index)}
                      >
                        <FontAwesome name="times" size={14} color="#ff4757" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}


            </View>

            {/* View Route Button */}
            <TouchableOpacity
              style={styles.viewRouteButton}
              onPress={handleViewRoute}
            >
              <FontAwesome name="map" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.viewRouteButtonText}>Rotayı Gör</Text>
              <FontAwesome name="chevron-right" size={18} color="#fff" />
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
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
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  destinationContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  destinationLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
  },
  destinationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  destinationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  waypointsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputIcon: {
    marginRight: 15,
  },
  waypointInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#E91E63',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waypointsList: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  waypointsListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  waypointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  waypointText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    marginLeft: 10,
  },
  removeButton: {
    backgroundColor: 'rgba(255, 71, 87, 0.2)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewRouteButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    marginTop: 20,
  },
  buttonIcon: {
    marginRight: 12,
  },
  viewRouteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
});