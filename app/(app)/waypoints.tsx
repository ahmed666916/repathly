import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';

export default function WaypointsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const destination = params.destination as string;
  
  const [waypoints, setWaypoints] = useState<string[]>([]);
  const [currentWaypoint, setCurrentWaypoint] = useState('');

  // SÜPER AGRESIF reset kontrolü - sayfa her açıldığında ZORLA sıfırla
  useEffect(() => {
    console.log('🔥 Waypoints sayfası açıldı, ZORLA reset kontrolü yapılıyor...');
    console.log('shouldResetInputs değeri:', (global as any).shouldResetInputs);
    console.log('forceReset değeri:', (global as any).forceReset);
    console.log('routeWaypoints değeri:', (global as any).routeWaypoints);
    
    // HER DURUMDA ÖNCE TEMİZLE
    console.log('🧹 ÖNCE HER DURUMDA TEMİZLENİYOR...');
    setWaypoints([]);
    setCurrentWaypoint('');
    
    // EĞER RESET FLAG'İ VARSA GLOBAL'İ DE TEMİZLE
    if ((global as any).shouldResetInputs || (global as any).forceReset) {
      console.log('🔥 GLOBAL STATE TEMİZLENİYOR...');
      (global as any).routeWaypoints = '';
      delete (global as any).routeWaypoints;
      (global as any).shouldResetInputs = false;
      (global as any).forceReset = false;
    }
  }, []);

  // Sayfa focus olduğunda da ZORLA kontrol et
  useFocusEffect(
    useCallback(() => {
      console.log('🎯 Waypoints sayfası focus oldu, ZORLA kontrol ediliyor...');
      
      // HER FOCUS'TA ÖNCE TEMİZLE
      console.log('🧹 FOCUS TE TEMİZLENİYOR...');
      setWaypoints([]);
      setCurrentWaypoint('');
      
      if ((global as any).shouldResetInputs || (global as any).forceReset) {
        console.log('🔥 FOCUS GLOBAL STATE TEMİZLENİYOR...');
        (global as any).routeWaypoints = '';
        delete (global as any).routeWaypoints;
        (global as any).shouldResetInputs = false;
        (global as any).forceReset = false;
      }
    }, [])
  );

  const capitalizeText = (text: string) => {
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const addWaypoint = () => {
    if (currentWaypoint.trim() && !waypoints.includes(currentWaypoint.trim())) {
      setWaypoints([...waypoints, currentWaypoint.trim()]);
      setCurrentWaypoint('');
    }
  };

  const removeWaypoint = (index: number) => {
    setWaypoints(waypoints.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    // Global'e kaydet
    (global as any).routeWaypoints = JSON.stringify(waypoints);
    
    // Rota önizleme sayfasına git
    router.push({
      pathname: '/(app)/route-preview',
      params: {
        destination,
        waypoints: JSON.stringify(waypoints)
      }
    });
  };

  const handleSkip = () => {
    (global as any).routeWaypoints = JSON.stringify([]);
    router.push({
      pathname: '/(app)/route-preview',
      params: {
        destination,
        waypoints: JSON.stringify([])
      }
    });
  };

  return (
    <ImageBackground
      source={require('../../assets/images/loginbackground.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        
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
          <Text style={styles.headerTitle}>Ara Duraklar</Text>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Atla</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.infoSection}>
            <Text style={styles.destinationText}>
              <FontAwesome name="flag" size={16} color="#E91E63" /> {destination}
            </Text>
            <Text style={styles.infoText}>
              Başka nerelere uğramak istersiniz? (İsteğe bağlı)
            </Text>
          </View>

          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <FontAwesome name="plus" size={20} color="#4CAF50" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Ara durak ekleyin..."
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                value={currentWaypoint}
                onChangeText={(text) => setCurrentWaypoint(capitalizeText(text))}
                onSubmitEditing={addWaypoint}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[styles.addButton, !currentWaypoint.trim() && styles.addButtonDisabled]}
                onPress={addWaypoint}
                disabled={!currentWaypoint.trim()}
              >
                <FontAwesome name="check" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {waypoints.length > 0 && (
            <View style={styles.waypointsSection}>
              <Text style={styles.waypointsTitle}>Ara Duraklar ({waypoints.length})</Text>
              {waypoints.map((waypoint, index) => (
                <View key={index} style={styles.waypointItem}>
                  <View style={styles.waypointInfo}>
                    <Text style={styles.waypointNumber}>{index + 1}</Text>
                    <Text style={styles.waypointText}>{waypoint}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeWaypoint(index)}
                  >
                    <FontAwesome name="times" size={16} color="#E91E63" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Rotayı Önizle</Text>
            <FontAwesome name="map" size={20} color="#fff" />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  skipButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  skipButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoSection: {
    marginBottom: 30,
    alignItems: 'center',
  },
  destinationText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputSection: {
    marginBottom: 30,
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
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginLeft: 10,
  },
  addButtonDisabled: {
    backgroundColor: 'rgba(76, 175, 80, 0.5)',
  },
  waypointsSection: {
    marginBottom: 20,
  },
  waypointsTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  waypointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  waypointInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  waypointNumber: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 12,
  },
  waypointText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    flex: 1,
  },
  removeButton: {
    padding: 8,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
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
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 15,
  },
}); 