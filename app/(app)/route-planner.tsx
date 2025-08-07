import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Dimensions, Alert, Keyboard } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');
const GOOGLE_MAPS_API_KEY = 'AIzaSyD20dEgYCXYcs-C4uGDMUTSvSbdxYDuk5o';

export default function RoutePlannerScreen() {
  const router = useRouter();
  const [activeTransport, setActiveTransport] = useState('DRIVING');
  const [toLocation, setToLocation] = useState('');
  const [waypoints, setWaypoints] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [coordinates, setCoordinates] = useState({
    from: null,
    to: null,
  });
  const [showMap, setShowMap] = useState(false);
  const [showWaypointsInput, setShowWaypointsInput] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const mapRef = useRef(null);

  const transportTypes = [
    { id: 'DRIVING', icon: 'car', label: 'Araba' },
    { id: 'BICYCLING', icon: 'motorcycle', label: 'Motorsiklet' },
    { id: 'WALKING', icon: 'male', label: 'Yaya' },
  ];

  // İstanbul'u sabit başlangıç konumu olarak ayarla
  useEffect(() => {
    const istanbulCoords = {
      latitude: 41.0082,
      longitude: 28.9784,
    };
    
    setCurrentLocation(istanbulCoords);
    setLocationPermission(true);
    console.log('İstanbul koordinatları başlangıç konumu olarak ayarlandı:', istanbulCoords);
  }, []);

  const getCoordinates = async (placeName) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          placeName
        )}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const json = await response.json();
      if (json.results.length > 0) {
        const { lat, lng } = json.results[0].geometry.location;
        return { latitude: lat, longitude: lng };
      }
      return null;
    } catch (error) {
      console.error('Geocoding Error:', error);
      return null;
    }
  };

  const getWaypointCoordinates = async (waypointsText) => {
    if (!waypointsText.trim()) return [];
    
    const waypointNames = waypointsText.split(',').map(name => name.trim()).filter(name => name);
    const waypointCoords = [];
    
    for (const name of waypointNames) {
      const coords = await getCoordinates(name);
      if (coords) {
        waypointCoords.push(coords);
      }
    }
    
    return waypointCoords;
  };

  const handleRouteSearch = async () => {
    Keyboard.dismiss();
    if (!currentLocation) {
      Alert.alert('Konum Bulunamadı', 'Mevcut konumunuz alınamadı. Lütfen konum izni verdiğinizden emin olun.');
      return;
    }
    
    // İlk tıklamada sadece "Son rota" inputunu göster
    if (!showWaypointsInput) {
      setShowWaypointsInput(true);
      return;
    }
    
    if (toLocation) {
      if (GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
        Alert.alert('API Anahtarı Eksik', 'Lütfen koda Google Maps API anahtarınızı ekleyin.');
        return;
      }

      const toCoords = await getCoordinates(toLocation);

      if (toCoords) {
        let waypointCoords = [];
        if (waypoints.trim()) {
          waypointCoords = await getWaypointCoordinates(waypoints);
        }

        setCoordinates({ 
          from: currentLocation, 
          to: toCoords,
          waypoints: waypointCoords 
        });
        setShowMap(true);
        
        const allCoords = [currentLocation, ...waypointCoords, toCoords];
        setTimeout(() => {
          mapRef.current?.fitToCoordinates(allCoords, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }, 500);
      } else {
        Alert.alert('Konum Bulunamadı', 'Girdiğiniz hedef konum bulunamadı. Lütfen kontrol edin.');
      }
    } else {
      Alert.alert('Son Rota Gerekli', 'Lütfen son rota olarak gitmek istediğiniz yeri girin.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Rota Planlayıcı</Text>
          <Text style={styles.headerSubtitle}>Hedef ve rotanızı belirleyin</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Transport Type Selection */}
      <View style={styles.transportContainer}>
        {transportTypes.map((transport) => (
          <TouchableOpacity
            key={transport.id}
            style={[
              styles.transportButton,
              activeTransport === transport.id && styles.activeTransportButton,
            ]}
            onPress={() => setActiveTransport(transport.id)}
          >
            <FontAwesome
              name={transport.icon}
              size={20}
              color={activeTransport === transport.id ? '#fff' : '#666'}
            />
            <Text
              style={[
                styles.transportText,
                activeTransport === transport.id && styles.activeTransportText,
              ]}
            >
              {transport.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Location Inputs */}
      <View style={styles.locationContainer}>
        {/* Waypoints Input - First */}
        <View style={styles.inputContainer}>
          <FontAwesome name="plus-circle" size={16} color="#FF9800" style={styles.locationIcon} />
          <TextInput
            style={styles.locationInput}
            placeholder="Gezmek istediğiniz şehirleri giriniz (virgülle ayırarak)"
            value={waypoints}
            onChangeText={setWaypoints}
            multiline={true}
          />
        </View>

        {/* Destination Input - Second */}
        {showWaypointsInput && (
          <View style={styles.inputContainer}>
            <FontAwesome name="map-marker" size={16} color="#F44336" style={styles.locationIcon} />
            <TextInput
              style={styles.locationInput}
              placeholder="Son rota olarak"
              value={toLocation}
              onChangeText={setToLocation}
            />
          </View>
        )}
      </View>

      {/* Search Button */}
      <TouchableOpacity style={styles.searchButton} onPress={handleRouteSearch}>
        <Text style={styles.searchButtonText}>
          {showWaypointsInput ? 'Rotayı Yeniden Hesapla' : 'Rota'}
        </Text>
        <FontAwesome name="chevron-right" size={16} color="#fff" />
      </TouchableOpacity>

      {/* Map View */}
      {showMap && coordinates.from && coordinates.to && (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: (coordinates.from.latitude + coordinates.to.latitude) / 2,
              longitude: (coordinates.from.longitude + coordinates.to.longitude) / 2,
              latitudeDelta: Math.abs(coordinates.from.latitude - coordinates.to.latitude) + 0.1,
              longitudeDelta: Math.abs(coordinates.from.longitude - coordinates.to.longitude) + 0.1,
            }}
          >
            <Marker coordinate={coordinates.from} title="Mevcut Konumunuz" />
            
            {coordinates.waypoints && coordinates.waypoints.map((waypoint, index) => (
              <Marker
                key={index}
                coordinate={waypoint}
                title={`Ara Durak ${index + 1}`}
                pinColor="orange"
              />
            ))}
            
            <Marker coordinate={coordinates.to} title="Hedef" />
            
            <MapViewDirections
              origin={coordinates.from}
              destination={coordinates.to}
              waypoints={coordinates.waypoints || []}
              apikey={GOOGLE_MAPS_API_KEY}
              strokeWidth={4}
              strokeColor="#4CAF50"
              mode={activeTransport}
              optimizeWaypoints={true}
            />
          </MapView>
        </View>
      )}

      {/* Recommended Places Button */}
      {showMap && (
        <TouchableOpacity 
          style={styles.recommendedButton} 
          onPress={() => {
            // Waypoints'leri ve final destination'ı recommendations sayfasına gönder
            const waypointsList = waypoints.trim() ? waypoints.split(',').map(w => w.trim()) : [];
            router.push({
              pathname: '/(app)/recommendations',
              params: {
                finalDestination: toLocation,
                waypoints: JSON.stringify(waypointsList)
              }
            });
          }}
        >
          <FontAwesome name="star" size={18} color="#fff" style={styles.recommendedIcon} />
          <Text style={styles.recommendedButtonText}>Önerilen Yerler</Text>
          <FontAwesome name="chevron-right" size={16} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  placeholder: {
    width: 34,
  },
  transportContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  transportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    backgroundColor: '#fff',
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activeTransportButton: {
    backgroundColor: '#4CAF50',
  },
  transportText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTransportText: {
    color: '#fff',
  },
  locationContainer: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  locationIcon: {
    marginRight: 15,
  },
  locationInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginHorizontal: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  mapContainer: {
    height: 250,
    marginHorizontal: 20,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: 15,
  },
  map: {
    flex: 1,
  },
  recommendedButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6B35',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  recommendedIcon: {
    marginRight: 10,
  },
  recommendedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
});