import React, { useState, useRef, useEffect, useCallback } from 'react';
import GOOGLE_MAPS_KEY from '../../constants/googleMapsKey';
import { StyleSheet, View, Text, TouchableOpacity, Alert, SafeAreaView, StatusBar, ImageBackground, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';

const GOOGLE_MAPS_API_KEY = GOOGLE_MAPS_KEY;

export default function MainMapScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [waypoints, setWaypoints] = useState([]);
  const mapRef = useRef<MapView>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<any>(null);
  const [destinationCoords, setDestinationCoords] = useState<{ latitude: number, longitude: number } | null>(null);
  const [waypointCoords, setWaypointCoords] = useState<Array<{ latitude: number, longitude: number }>>([]);

  // Use global key if set, otherwise fall back to the hard-coded (legacy) key
  const mapsApiKey = (global as any).googleMapsApiKey || GOOGLE_MAPS_API_KEY;
  // Log the key source for debugging (remove in production)
  console.log('Using mapsApiKey:', mapsApiKey ? '[REDACTED]' : '<<missing>>');

  // Global'den alınmış gerçek kullanıcı konumunu kullan
  const globalUserLocation = (global as any).userLocation;
  const startLocationName = globalUserLocation ? "Mevcut Konumunuz" : "İstanbul";

  const startLocation = globalUserLocation
    ? { latitude: globalUserLocation.latitude, longitude: globalUserLocation.longitude }
    : { latitude: 41.0082, longitude: 28.9784 }; // Istanbul default

  // Geocode bir adresi koordinatlara çevir
  const geocodeAddress = async (address: string): Promise<{ latitude: number, longitude: number } | null> => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${mapsApiKey}&region=tr&language=tr`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results[0]) {
        const location = data.results[0].geometry.location as { lat: number; lng: number };
        return { latitude: location.lat, longitude: location.lng };
      }
      console.error('Geocoding failed:', data.status);
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Parametrelerden hedef ve ara durakları al
  useEffect(() => {
    if (params.destination) {
      setDestination(params.destination as string);
    }
    if (params.waypoints) {
      try {
        const waypointsArray = JSON.parse(params.waypoints as string);
        setWaypoints(waypointsArray);
      } catch (error) {
        console.error('Waypoints parse hatası:', error);
      }
    }
  }, [params.destination, params.waypoints]);

  // Hedef ve ara durakları geocode et
  useEffect(() => {
    const geocodeLocations = async () => {
      if (destination) {
        console.log('Geocoding destination:', destination);
        const coords = await geocodeAddress(destination);
        if (coords) {
          console.log('Destination coords:', coords);
          setDestinationCoords(coords);
        }
      }

      if (waypoints.length > 0) {
        console.log('Geocoding waypoints:', waypoints);
        const coords = await Promise.all(
          waypoints.map(wp => geocodeAddress(wp))
        );
        const validCoords = coords.filter(c => c !== null) as Array<{ latitude: number, longitude: number }>;
        console.log('Waypoint coords:', validCoords);
        setWaypointCoords(validCoords);
      }
    };

    geocodeLocations();
  }, [destination, waypoints]);

  // Sayfa focus olduğunda reset kontrolü
  useFocusEffect(
    useCallback(() => {
      const shouldReset = (global as any).shouldResetInputs;
      if (shouldReset) {
        console.log('Map sayfası temizleniyor...');
        setDestination('');
        setWaypoints([]);
        (global as any).shouldResetInputs = false;
      }
    }, [])
  );

  const handleCompleteRoute = () => {
    router.push({
      pathname: '/(app)/interests',
      params: {
        destination: destination,
        waypoints: JSON.stringify(waypoints)
      }
    });
  };

  // Harita hazır olduğunda rotayı göster
  const onMapReady = () => {
    setIsMapReady(true);
  };

  // Rota hesaplandığında haritayı sığdır
  const onDirectionsReady = (result: any) => {
    if (mapRef.current && result.coordinates) {
      setRouteCoordinates(result);
      // Haritayı rotaya sığdır
      mapRef.current.fitToCoordinates(result.coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
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
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => {
              const r: any = router as any;
              if (r?.canGoBack?.()) {
                r.back();
              } else {
                r.replace('/(app)');
              }
            }}>
              <FontAwesome name="arrow-left" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Rota Haritası</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.contentContainer}>
            {destination && (
              <View style={styles.miniMapContainer}>
                <Text style={styles.miniMapTitle}>Rota Önizleme</Text>
                <View style={styles.miniMapPreview}>
                  <MapView
                    ref={mapRef}
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    initialRegion={{
                      latitude: startLocation.latitude,
                      longitude: startLocation.longitude,
                      latitudeDelta: 0.5,
                      longitudeDelta: 0.5,
                    }}
                    onMapReady={onMapReady}
                  >
                    {/* Başlangıç marker */}
                    <Marker
                      coordinate={startLocation}
                      title="Başlangıç"
                      pinColor="#4285F4"
                    />

                    {/* Hedef için directions - koordinat veya string kullan */}
                    {isMapReady && (destinationCoords || destination) && (
                      <MapViewDirections
                        origin={startLocation}
                        destination={destinationCoords || destination}
                        waypoints={waypointCoords.length > 0 ? waypointCoords : waypoints}
                        apikey={mapsApiKey}
                        strokeWidth={4}
                        strokeColor="#E91E63"
                        optimizeWaypoints={true}
                        onReady={onDirectionsReady}
                        onError={(errorMessage) => {
                          console.error('Directions error:', errorMessage);
                          Alert.alert('Rota Hatası', 'Rota hesaplanamadı. Lütfen hedef ve ara durakları kontrol edin.');
                        }}
                        language="tr"
                        region="tr"
                      />
                    )}
                  </MapView>

                  {!isMapReady && (
                    <View style={styles.mapLoadingOverlay}>
                      <ActivityIndicator size="large" color="#E91E63" />
                      <Text style={styles.loadingText}>Harita yükleniyor...</Text>
                    </View>
                  )}
                </View>
                <View style={styles.routeInfoCompact}>
                  <View style={styles.routeInfoSection}>
                    <Text style={styles.routeInfoLabel}>Rota Sırası:</Text>
                    <View style={styles.routeSequence}>
                      <View style={styles.routeStep}>
                        <View style={styles.stepNumber}>
                          <Text style={styles.stepNumberText}>1</Text>
                        </View>
                        <Text style={styles.stepText}>{startLocationName} (Başlangıç)</Text>
                      </View>

                      {waypoints.slice(0, 3).map((waypoint, index) => (
                        <View key={index} style={styles.routeStep}>
                          <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>{index + 2}</Text>
                          </View>
                          <Text style={styles.stepText} numberOfLines={1}>{waypoint}</Text>
                        </View>
                      ))}

                      <View style={styles.routeStep}>
                        <View style={[styles.stepNumber, styles.finalStep]}>
                          <Text style={styles.stepNumberText}>{waypoints.length + 2}</Text>
                        </View>
                        <Text style={styles.stepText} numberOfLines={1}>{destination} (Hedef)</Text>
                      </View>

                      {waypoints.length > 3 && (
                        <Text style={styles.moreWaypointsText}>+{waypoints.length - 3} durak daha...</Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>

          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity style={styles.completeRouteButton} onPress={handleCompleteRoute}>
              <FontAwesome name="star" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.completeRouteButtonText}>Rotamız üzerindeki ilginizi çekebilecek altın tavsiyelerimizi görmek ister misiniz?</Text>
              <FontAwesome name="chevron-right" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  bottomButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
  },
  completeRouteButton: {
    backgroundColor: '#E91E63',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  buttonIcon: {
    marginRight: 12,
  },
  completeRouteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  miniMapContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  miniMapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  miniMapPreview: {
    height: 250,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    marginBottom: 20,
    elevation: 3,
  },
  map: {
    flex: 1,
  },
  mapLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginTop: 10,
  },
  routeInfoCompact: {
    gap: 15,
  },
  routeInfoSection: {
    gap: 8,
  },
  routeInfoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  routeSequence: {
    marginTop: 5,
  },
  routeStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 2,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  finalStep: {
    backgroundColor: '#E91E63',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 18,
  },
  moreWaypointsText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 5,
    textAlign: 'center',
  },
});