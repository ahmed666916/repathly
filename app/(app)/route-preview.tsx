import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { WebView } from 'react-native-webview';

export default function RoutePreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const webViewRef = useRef<WebView>(null);
  
  const destination = params.destination as string;
  const waypoints = params.waypoints ? JSON.parse(params.waypoints as string) : [];
  
  const [isMapReady, setIsMapReady] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const userLocation = (global as any).userLocation;
  const startLocationName = userAddress || (userLocation ? "Mevcut Konumunuz" : "İstanbul");

  // Reset kontrolü
  useFocusEffect(
    useCallback(() => {
      if ((global as any).shouldResetInputs) {
        console.log('Route preview sayfası temizleniyor...');
        setIsMapReady(false);
        setUserAddress('');
        (global as any).shouldResetInputs = false;
      }
    }, [])
  );

  // Ek olarak, sayfa her açıldığında da kontrol et
  useEffect(() => {
    if ((global as any).shouldResetInputs) {
      console.log('Route preview sayfası useEffect ile temizleniyor...');
      setIsMapReady(false);
      setUserAddress('');
      (global as any).shouldResetInputs = false;
    }
  }, []);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MAP_READY') {
        setIsMapReady(true);
      } else if (data.type === 'USER_ADDRESS') {
        setUserAddress(data.address);
      }
    } catch (e) {
      console.error('WebView message error:', e);
    }
  };

  const handleContinue = () => {
    router.push({
      pathname: '/(app)/interests',
      params: {
        destination,
        waypoints: JSON.stringify(waypoints)
      }
    });
  };

  // Başlangıç konumu için koordinatlar
  const startLocationJS = userLocation 
    ? JSON.stringify({ lat: userLocation.latitude, lng: userLocation.longitude }) 
    : JSON.stringify({ lat: 41.0082, lng: 28.9784 });

  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <style>
        body, html { height: 100%; margin: 0; padding: 0; }
        #map { width: 100%; height: 100%; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        let map, directionsService, directionsRenderer;
        const startLocation = ${startLocationJS};

        function initMap() {
          map = new google.maps.Map(document.getElementById('map'), {
            center: startLocation,
            zoom: 10,
            disableDefaultUI: true,
            styles: [
              { "featureType": "poi", "elementType": "labels", "stylers": [{ "visibility": "off" }] },
              { "featureType": "transit", "elementType": "labels", "stylers": [{ "visibility": "off" }] }
            ]
          });

          directionsService = new google.maps.DirectionsService();
          directionsRenderer = new google.maps.DirectionsRenderer({
            suppressMarkers: true,
            polylineOptions: { strokeColor: '#E91E63', strokeWeight: 4, strokeOpacity: 0.8 }
          });
          directionsRenderer.setMap(map);

          // Kullanıcının gerçek adresini al (reverse geocoding)
          getUserAddress();

          createRoute();
        }

        function getUserAddress() {
          if (!startLocation || (startLocation.lat === 41.0082 && startLocation.lng === 28.9784)) {
            // İstanbul varsayılan konumu ise, statik marker ekle
            new google.maps.Marker({
              position: startLocation,
              map: map,
              icon: { path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#4285F4', fillOpacity: 1, strokeWeight: 2, strokeColor: 'white' },
              title: 'Başlangıç: İstanbul'
            });
            window.ReactNativeWebView.postMessage(JSON.stringify({ 
              type: 'USER_ADDRESS', 
              address: 'İstanbul' 
            }));
            return;
          }

          // Gerçek kullanıcı konumu için reverse geocoding yap
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: startLocation }, (results, status) => {
            if (status === 'OK' && results[0]) {
              // En detaylı adresi al (street_address, route, neighborhood öncelikli)
              let userAddress = '';
              
              for (let i = 0; i < results.length; i++) {
                const result = results[i];
                const types = result.types;
                
                // Cadde/sokak seviyesinde adres arayalım
                if (types.includes('street_address') || 
                    types.includes('route') || 
                    types.includes('neighborhood') ||
                    types.includes('sublocality')) {
                  userAddress = result.formatted_address;
                  break;
                }
              }

              // Eğer detaylı adres bulunamazsa, en kısa adresi al
              if (!userAddress && results[0]) {
                userAddress = results[0].formatted_address;
              }

              // Eğer hala adres yoksa, koordinatları göster
              if (!userAddress) {
                userAddress = \`\${startLocation.lat.toFixed(6)}, \${startLocation.lng.toFixed(6)}\`;
              }

              // React Native'e adresi gönder
              window.ReactNativeWebView.postMessage(JSON.stringify({ 
                type: 'USER_ADDRESS', 
                address: userAddress 
              }));

              // Başlangıç marker'ı ekle
              new google.maps.Marker({
                position: startLocation,
                map: map,
                icon: { path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#4285F4', fillOpacity: 1, strokeWeight: 2, strokeColor: 'white' },
                title: 'Başlangıç: ' + userAddress
              });
            } else {
              // Reverse geocoding başarısızsa, koordinatları kullan
              const fallbackAddress = \`\${startLocation.lat.toFixed(6)}, \${startLocation.lng.toFixed(6)}\`;
              window.ReactNativeWebView.postMessage(JSON.stringify({ 
                type: 'USER_ADDRESS', 
                address: fallbackAddress 
              }));

              new google.maps.Marker({
                position: startLocation,
                map: map,
                icon: { path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#4285F4', fillOpacity: 1, strokeWeight: 2, strokeColor: 'white' },
                title: 'Başlangıç: ' + fallbackAddress
              });
            }
          });
        }

        function createRoute() {
          const destination = "${destination}";
          const waypoints = ${JSON.stringify(waypoints)};
          
          if (!destination) return;

          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ address: destination }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const destinationLocation = results[0].geometry.location;
              
              // Hedef marker'ı
              new google.maps.Marker({
                position: destinationLocation,
                map: map,
                icon: { path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#E91E63', fillOpacity: 1, strokeWeight: 2, strokeColor: 'white' },
                title: 'Hedef'
              });

              if (waypoints && waypoints.length > 0) {
                calculateRouteWithWaypoints(startLocation, destinationLocation, waypoints);
              } else {
                calculateSimpleRoute(startLocation, destinationLocation);
              }
              
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_READY' }));
            }
          });
        }

        function calculateRouteWithWaypoints(origin, destination, waypoints) {
          const waypointPromises = waypoints.map(waypoint => 
            new Promise((resolve) => {
              new google.maps.Geocoder().geocode({ address: waypoint }, (results, status) => {
                if (status === 'OK' && results[0]) {
                  new google.maps.Marker({
                    position: results[0].geometry.location,
                    map: map,
                    icon: { path: google.maps.SymbolPath.CIRCLE, scale: 6, fillColor: '#FF9800', fillOpacity: 1, strokeWeight: 2, strokeColor: 'white' },
                    title: waypoint
                  });
                  resolve({ location: results[0].geometry.location, stopover: true });
                } else {
                  resolve(null);
                }
              });
            })
          );

          Promise.all(waypointPromises).then(waypointsData => {
            const validWaypoints = waypointsData.filter(wp => wp !== null);
            directionsService.route({
              origin: origin,
              destination: destination,
              waypoints: validWaypoints,
              travelMode: google.maps.TravelMode.DRIVING
            }, (result, status) => {
              if (status === 'OK') {
                directionsRenderer.setDirections(result);
                map.fitBounds(result.routes[0].bounds);
              }
            });
          });
        }

        function calculateSimpleRoute(origin, destination) {
          directionsService.route({
            origin: origin,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING
          }, (result, status) => {
            if (status === 'OK') {
              directionsRenderer.setDirections(result);
              map.fitBounds(result.routes[0].bounds);
            }
          });
        }
      </script>
      <script async defer
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyD20dEgYCXYcs-C4uGDMUTSvSbdxYDuk5o&libraries=places&callback=initMap">
      </script>
    </body>
    </html>
  `;

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
          <Text style={styles.headerTitle}>Rota Önizleme</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <WebView
            ref={webViewRef}
            source={{ html: mapHTML }}
            style={styles.webView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onMessage={handleMessage}
          />
          {!isMapReady && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#E91E63" />
              <Text style={styles.loadingText}>Harita yükleniyor...</Text>
            </View>
          )}
        </View>

        {/* Route Info */}
        <View style={styles.routeInfo}>
          <Text style={styles.routeTitle}>Rota Bilgileri</Text>
          <View style={styles.routeStep}>
            <FontAwesome name="circle" size={12} color="#4285F4" />
            <Text style={styles.routeStepText} numberOfLines={2}>
              {userAddress ? userAddress : startLocationName} (Başlangıç)
            </Text>
          </View>
          {waypoints.map((waypoint: string, index: number) => (
            <View key={index} style={styles.routeStep}>
              <FontAwesome name="circle" size={12} color="#FF9800" />
              <Text style={styles.routeStepText}>{waypoint}</Text>
            </View>
          ))}
          <View style={styles.routeStep}>
            <FontAwesome name="circle" size={12} color="#E91E63" />
            <Text style={styles.routeStepText}>{destination} (Hedef)</Text>
          </View>
        </View>

        {/* Continue Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity 
            style={[styles.continueButton, !isMapReady && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={!isMapReady}
          >
            <FontAwesome name="star" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.continueButtonText}>İlgi Alanlarını Seç</Text>
            <FontAwesome name="chevron-right" size={18} color="#fff" />
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
  placeholder: {
    width: 40,
  },
  mapContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  routeInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    margin: 20,
    marginTop: 0,
    borderRadius: 15,
    padding: 20,
    elevation: 5,
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  routeStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeStepText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
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
  buttonIcon: {
    marginRight: 12,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
}); 