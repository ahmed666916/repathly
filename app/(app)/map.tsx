import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, SafeAreaView, StatusBar, ImageBackground } from 'react-native';
import { WebView } from 'react-native-webview';
import { FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';

export default function MainMapScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [waypoints, setWaypoints] = useState([]);
  const webViewRef = useRef(null);

  // Global'den alınmış gerçek kullanıcı konumunu kullan
  const globalUserLocation = (global as any).userLocation;
  const startLocationName = globalUserLocation ? "Mevcut Konumunuz" : "İstanbul";

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
  
  // Başlangıç konumu için JS nesnesi oluştur (Gerçek konum veya İstanbul)
  const startLocationJS = globalUserLocation 
    ? JSON.stringify({ lat: globalUserLocation.latitude, lng: globalUserLocation.longitude }) 
    : JSON.stringify({ lat: 41.0082, lng: 28.9784 });

  const miniMapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <style>
        body, html { height: 100%; margin: 0; padding: 0; background-color: transparent; }
        #miniMap { width: 100%; height: 100%; }
      </style>
    </head>
    <body>
      <div id="miniMap"></div>
      <script>
        let miniMap, miniDirectionsService, miniDirectionsRenderer;
        const startLocation = ${startLocationJS};

        function initMiniMap() {
          miniMap = new google.maps.Map(document.getElementById('miniMap'), {
            center: startLocation,
            zoom: 10,
            disableDefaultUI: true,
            gestureHandling: 'none',
            styles: [
              { "featureType": "all", "elementType": "geometry.fill", "stylers": [ { "weight": "1.00" } ] },
              { "featureType": "landscape", "elementType": "all", "stylers": [ { "color": "#f8f8f8" } ] },
              { "featureType": "poi", "elementType": "all", "stylers": [ { "visibility": "off" } ] },
              { "featureType": "road", "elementType": "all", "stylers": [ { "saturation": -100 }, { "lightness": 60 } ] },
              { "featureType": "transit", "elementType": "all", "stylers": [ { "visibility": "off" } ] },
              { "featureType": "water", "elementType": "all", "stylers": [ { "color": "#c8d7d4" }, { "visibility": "on" } ] }
            ]
          });

          miniDirectionsService = new google.maps.DirectionsService();
          miniDirectionsRenderer = new google.maps.DirectionsRenderer({
            suppressMarkers: true,
            polylineOptions: { strokeColor: '#E91E63', strokeWeight: 4, strokeOpacity: 0.8 }
          });
          miniDirectionsRenderer.setMap(miniMap);

          new google.maps.Marker({
            position: startLocation,
            map: miniMap,
            icon: { path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#4285F4', fillOpacity: 1, strokeWeight: 2, strokeColor: 'white' },
            title: 'Başlangıç'
          });

          createMiniRoute();
        }

        function createMiniRoute() {
          const destination = "${destination}";
          const waypoints = ${JSON.stringify(waypoints)};
          if (!destination) return;

          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ address: destination }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const destinationLocation = results[0].geometry.location;
              
              new google.maps.Marker({
                position: destinationLocation,
                map: miniMap,
                icon: { path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#E91E63', fillOpacity: 1, strokeWeight: 2, strokeColor: 'white' },
                title: 'Hedef'
              });

              if (waypoints && waypoints.length > 0) {
                calculateMiniRouteWithWaypoints(startLocation, destinationLocation, waypoints);
              } else {
                calculateSimpleMiniRoute(startLocation, destinationLocation);
              }
            }
          });
        }

        function calculateMiniRouteWithWaypoints(origin, destination, waypoints) {
          const waypointPromises = waypoints.map(waypoint => 
            new Promise((resolve) => {
              new google.maps.Geocoder().geocode({ address: waypoint }, (results, status) => {
                if (status === 'OK' && results[0]) {
                  new google.maps.Marker({
                    position: results[0].geometry.location,
                    map: miniMap,
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
            miniDirectionsService.route({
              origin: origin,
              destination: destination,
              waypoints: validWaypoints,
              travelMode: google.maps.TravelMode.DRIVING
            }, (result, status) => {
              if (status === 'OK') {
                miniDirectionsRenderer.setDirections(result);
                if (result.routes[0]) miniMap.fitBounds(result.routes[0].bounds);
              }
            });
          });
        }

        function calculateSimpleMiniRoute(origin, destination) {
          miniDirectionsService.route({
            origin: origin,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING
          }, (result, status) => {
            if (status === 'OK') {
              miniDirectionsRenderer.setDirections(result);
               if (result.routes[0]) miniMap.fitBounds(result.routes[0].bounds);
            }
          });
        }
      </script>
      <script async defer
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyD20dEgYCXYcs-C4uGDMUTSvSbdxYDuk5o&libraries=places&callback=initMiniMap">
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
                  <WebView
                    ref={webViewRef}
                    source={{ html: miniMapHTML }}
                    style={styles.miniMapWebView}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    scrollEnabled={false}
                  />
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
  miniMapWebView: {
    flex: 1,
    backgroundColor: 'transparent',
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