import React, { useState, useEffect, useRef } from 'react';
import GOOGLE_MAPS_KEY from '../../constants/googleMapsKey';
import {
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  View,
  Text,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';

const GOOGLE_MAPS_API_KEY = GOOGLE_MAPS_KEY;

export default function FullScreenMapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mapRef = useRef<MapView>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  const [isNavigationStarted, setIsNavigationStarted] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [userPosition, setUserPosition] = useState<{ latitude: number, longitude: number } | null>(null);
  const [routeInfo, setRouteInfo] = useState<any>(null);

  const destination = params.destination as string || (global as any).routeDestination;
  const waypoints = params.waypoints ? JSON.parse(params.waypoints as string) :
    ((global as any).routeWaypoints ? JSON.parse((global as any).routeWaypoints) : []);
  const selectedPlaces = params.selectedPlaces ? JSON.parse(params.selectedPlaces as string) :
    ((global as any).selectedPlaces || []);
  const userLocation = (global as any).userLocation || { latitude: 41.0082, longitude: 28.9784 };

  const [destinationCoords, setDestinationCoords] = useState<{ latitude: number, longitude: number } | null>(null);
  const [waypointCoords, setWaypointCoords] = useState<Array<{ latitude: number, longitude: number }>>([]);

  // Geocode bir adresi koordinatlara çevir
  const geocodeAddress = async (address: string): Promise<{ latitude: number, longitude: number } | null> => {
    try {
      // Eğer address zaten koordinat objesiyse olduğu gibi döndür
      if (typeof address === 'object' && (address as any).latitude && (address as any).longitude) {
        return address as any;
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address as string)}&key=${GOOGLE_MAPS_API_KEY}&region=tr&language=tr`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results[0]) {
        const location = data.results[0].geometry.location;
        return { latitude: location.lat, longitude: location.lng };
      }
      console.error('Geocoding failed:', data.status);
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

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

      // Combine waypoints and selected places for geocoding
      const allPoints = [...waypoints];
      if (selectedPlaces && selectedPlaces.length > 0) {
        selectedPlaces.forEach((place: any) => {
          if (place.location) {
            allPoints.push(place.location);
          }
        });
      }

      if (allPoints.length > 0) {
        console.log('Geocoding waypoints:', allPoints);
        const coords = await Promise.all(
          allPoints.map(wp => geocodeAddress(wp))
        );
        const validCoords = coords.filter(c => c !== null) as Array<{ latitude: number, longitude: number }>;
        console.log('Waypoint coords:', validCoords);
        setWaypointCoords(validCoords);
      }
    };

    geocodeLocations();
  }, [destination, waypoints, selectedPlaces]);

  useEffect(() => {
    StatusBar.setHidden(true);
    setUserPosition(userLocation);
    return () => {
      StatusBar.setHidden(false);
    };
  }, []);

  const handleBackPress = () => {
    router.push({
      pathname: '/(app)/interests',
      params: { destination, waypoints: JSON.stringify(waypoints) }
    });
  };

  const handleFinishJourney = () => {
    console.log('🔄 Gezi bitiriliyor, TÜM state\'ler ZORLA temizleniyor...');

    // Tüm global state'leri agresif şekilde temizle
    (global as any).selectedInterests = [];
    (global as any).routeDestination = '';
    (global as any).routeWaypoints = '';
    (global as any).selectedPlaces = [];

    // Tüm olası global değişkenleri de temizle
    delete (global as any).routeWaypoints;
    delete (global as any).selectedInterests;
    delete (global as any).routeDestination;
    delete (global as any).selectedPlaces;

    // Reset flag'ini kalıcı olarak ayarla
    (global as any).shouldResetInputs = true;
    (global as any).resetTimestamp = Date.now();
    (global as any).forceReset = true;

    // Konum takibini durdur
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }

    console.log('🏠 Ana sayfaya yönlendiriliyor...');
    router.push('/');
  };

  const handleStartJourney = async () => {
    console.log('Geziye başla butonuna basıldı');
    setIsCalculatingRoute(true);
    setIsNavigationStarted(true);

    // Konum takibini başlat
    try {
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 2000,
          distanceInterval: 10,
        },
        (newLocation) => {
          const newPos = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          };
          setUserPosition(newPos);

          // Haritayı kullanıcının konumuna merkez al
          if (mapRef.current) {
            mapRef.current.animateCamera({
              center: newPos,
              zoom: 17,
              heading: newLocation.coords.heading || 0,
            });
          }
        }
      );
    } catch (error) {
      console.error('Konum takibi hatası:', error);
      Alert.alert('Hata', 'Konum takibi başlatılamadı');
    }
  };

  useEffect(() => {
    return () => {
      locationSubscription.current?.remove();
    };
  }, []);

  const onDirectionsReady = (result: any) => {
    setIsCalculatingRoute(false);
    setRouteInfo(result);

    if (mapRef.current && result.coordinates) {
      // Haritayı rotaya sığdır
      mapRef.current.fitToCoordinates(result.coordinates, {
        edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
        animated: true,
      });
    }
  };

  const onDirectionsError = (errorMessage: string) => {
    console.error('Directions error:', errorMessage);
    setIsCalculatingRoute(false);
    Alert.alert('Rota Hatası', 'Rota hesaplanamadı. Lütfen hedef ve ara durakları kontrol edin.');
  };

  // Combine waypoints and selected places
  const allWaypoints = [...waypoints];
  if (selectedPlaces && selectedPlaces.length > 0) {
    selectedPlaces.forEach((place: any) => {
      if (place.location) {
        allWaypoints.push(place.location);
      }
    });
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
          followsUserLocation={isNavigationStarted}
          onMapReady={() => setIsMapReady(true)}
        >
          {/* Başlangıç marker */}
          <Marker
            coordinate={userLocation}
            title="Başlangıç"
            pinColor="#4285F4"
          />

          {/* Kullanıcının mevcut konumu (navigasyon sırasında) */}
          {isNavigationStarted && userPosition && (
            <Marker
              coordinate={userPosition}
              title="Siz"
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.userMarker}>
                <FontAwesome name="location-arrow" size={20} color="#1A73E8" />
              </View>
            </Marker>
          )}

          {/* Rota çizimi - koordinat veya string kullan */}
          {isMapReady && (destinationCoords || destination) && (
            <MapViewDirections
              origin={userLocation}
              destination={destinationCoords || destination}
              waypoints={waypointCoords.length > 0 ? waypointCoords : allWaypoints}
              apikey={GOOGLE_MAPS_API_KEY}
              strokeWidth={5}
              strokeColor="#E91E63"
              optimizeWaypoints={true}
              onReady={onDirectionsReady}
              onError={onDirectionsError}
              language="tr"
              region="tr"
            />
          )}
        </MapView>

        {!isMapReady && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#E91E63" />
            <Text style={styles.loadingText}>Harita hazırlanıyor...</Text>
          </View>
        )}
      </View>

      {isMapReady && (
        <>
          {/* Navigasyon başlamadan önce: Geziye Başla ve İlgi Alanlarını Değiştir butonları yan yana */}
          {!isNavigationStarted && (
            <View style={styles.bottomButtonContainer}>
              <TouchableOpacity style={styles.changeInterestsButton} onPress={handleBackPress} activeOpacity={0.8}>
                <FontAwesome name="edit" size={16} color="#E91E63" />
                <Text style={styles.changeInterestsText}>İlgi Alanlarını Değiştir</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.startJourneyButtonBottom}
                onPress={handleStartJourney}
                activeOpacity={0.8}
                disabled={isCalculatingRoute}
              >
                {isCalculatingRoute ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <FontAwesome name="location-arrow" size={16} color="#fff" />
                    <Text style={styles.startJourneyBottomText}>Geziye Başla</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Navigasyon başladıktan sonra: Geziyi Bitir butonu */}
          {isNavigationStarted && (
            <View style={styles.bottomButtonContainer}>
              <TouchableOpacity style={styles.finishJourneyButton} onPress={handleFinishJourney} activeOpacity={0.8}>
                <FontAwesome name="home" size={18} color="#fff" />
                <Text style={styles.finishJourneyText}>Geziyi Bitir</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Rota bilgisi */}
          {routeInfo && isNavigationStarted && (
            <View style={styles.routeInfoBox}>
              <Text style={styles.routeInfoText}>
                {routeInfo.distance?.toFixed(1)} km • {routeInfo.duration?.toFixed(0)} dk
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  userMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1A73E8',
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1000,
  },
  changeInterestsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  changeInterestsText: {
    color: '#E91E63',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    textAlign: 'center',
    flex: 1,
  },
  finishJourneyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E91E63',
    paddingVertical: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  finishJourneyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  startJourneyButtonBottom: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  startJourneyBottomText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    textAlign: 'center',
    flex: 1,
  },
  routeInfoBox: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  routeInfoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});