import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, SafeAreaView, StatusBar, ImageBackground } from 'react-native';
import { WebView } from 'react-native-webview';
import { FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

const userProfilePic = 'https://i.pravatar.cc/150?u=a042581f4e29026704d';

export default function MainMapScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [userLocation, setUserLocation] = useState(null);
  const [destination, setDestination] = useState('');
  const [waypoints, setWaypoints] = useState([]);
  const webViewRef = useRef(null);

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

  // Hedef ve waypoints ile rota oluştur
  useEffect(() => {
    if (destination && webViewRef.current) {
      // WebView yüklendiğinde biraz bekle, sonra rota oluştur
      setTimeout(() => {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'createRoute',
          destination: destination,
          waypoints: waypoints
        }));
      }, 2000);
    }
  }, [destination, waypoints]);

  const handleCompleteRoute = () => {
    router.push({
      pathname: '/(app)/interests',
      params: {
        destination: destination,
        waypoints: JSON.stringify(waypoints)
      }
    });
  };

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'userLocation':
          setUserLocation(data.location);
          break;
        case 'locationError':
          Alert.alert('Konum Hatası', 'Konumunuz alınamadı. Lütfen konum izinlerini kontrol edin.');
          break;
      }
    } catch (error) {
      console.error('WebView mesaj hatası:', error);
    }
  };

  const getCurrentLocation = () => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'getCurrentLocation'
      }));
    }
  };

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
        let userMarker, destinationMarker;
        let userLocation = null;

        function initMap() {
          map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: 41.0082, lng: 28.9784 }, // İstanbul koordinatları
            zoom: 13,
            disableDefaultUI: true,
            styles: [
              { "featureType": "all", "elementType": "geometry.fill", "stylers": [ { "weight": "2.00" } ] },
              { "featureType": "all", "elementType": "geometry.stroke", "stylers": [ { "color": "#ffffff" } ] },
              { "featureType": "all", "elementType": "labels.text", "stylers": [ { "visibility": "on" } ] },
              { "featureType": "landscape", "elementType": "all", "stylers": [ { "color": "#f2f2f2" } ] },
              { "featureType": "landscape", "elementType": "geometry.fill", "stylers": [ { "color": "#ffffff" } ] },
              { "featureType": "landscape.man_made", "elementType": "geometry.fill", "stylers": [ { "color": "#ffffff" } ] },
              { "featureType": "poi", "elementType": "all", "stylers": [ { "visibility": "off" } ] },
              { "featureType": "road", "elementType": "all", "stylers": [ { "saturation": -100 }, { "lightness": 45 } ] },
              { "featureType": "road", "elementType": "geometry.fill", "stylers": [ { "color": "#eeeeee" } ] },
              { "featureType": "road", "elementType": "labels.text.fill", "stylers": [ { "color": "#7b7b7b" } ] },
              { "featureType": "road", "elementType": "labels.text.stroke", "stylers": [ { "color": "#ffffff" } ] },
              { "featureType": "road.highway", "elementType": "all", "stylers": [ { "visibility": "simplified" } ] },
              { "featureType": "road.arterial", "elementType": "labels.icon", "stylers": [ { "visibility": "off" } ] },
              { "featureType": "transit", "elementType": "all", "stylers": [ { "visibility": "off" } ] },
              { "featureType": "water", "elementType": "all", "stylers": [ { "color": "#46bcec" }, { "visibility": "on" } ] },
              { "featureType": "water", "elementType": "geometry.fill", "stylers": [ { "color": "#c8d7d4" } ] },
              { "featureType": "water", "elementType": "labels.text.fill", "stylers": [ { "color": "#070707" } ] },
              { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [ { "color": "#ffffff" } ] }
            ]
          });

          directionsService = new google.maps.DirectionsService();
          directionsRenderer = new google.maps.DirectionsRenderer({
            suppressMarkers: true
          });
          directionsRenderer.setMap(map);

          // Konum izni iste ve konumu al
          getCurrentLocation();
        }

        function getCurrentLocation() {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                userLocation = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
                };
                
                // Haritayı kullanıcı konumuna odakla
                map.setCenter(userLocation);
                
                // Kullanıcı konumu marker'ı ekle
                if (userMarker) userMarker.setMap(null);
                userMarker = new google.maps.Marker({
                  position: userLocation,
                  map: map,
                  icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#4285F4',
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: 'white'
                  },
                  title: 'Konumunuz'
                });

                // React Native'e konum bilgisini gönder
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'userLocation',
                  location: userLocation
                }));
              },
              (error) => {
                console.error('Konum alınamadı:', error);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'locationError',
                  error: error.message
                }));
              }
            );
          }
        }

        function searchPlace(query) {
          if (!query || !userLocation) return;

          const service = new google.maps.places.PlacesService(map);
          const request = {
            query: query,
            location: userLocation,
            radius: 50000,
            fields: ['place_id', 'name', 'geometry', 'formatted_address']
          };

          service.textSearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results[0]) {
              const place = results[0];
              const destination = place.geometry.location;

              // Hedef marker'ı ekle
              if (destinationMarker) destinationMarker.setMap(null);
              destinationMarker = new google.maps.Marker({
                position: destination,
                map: map,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: '#EA4335',
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: 'white'
                },
                title: place.name
              });

              // Rota hesapla
              calculateRoutes(userLocation, destination, place.name, place.formatted_address);
            }
          });
        }

        function calculateRoutes(origin, destination, placeName, placeAddress) {
          const travelModes = [
            { mode: google.maps.TravelMode.DRIVING, icon: 'car' },
            { mode: google.maps.TravelMode.TRANSIT, icon: 'bus' },
            { mode: google.maps.TravelMode.BICYCLING, icon: 'bike' },
            { mode: google.maps.TravelMode.WALKING, icon: 'walk' }
          ];

          Promise.all(
            travelModes.map(tm => 
              new Promise((resolve) => {
                directionsService.route({
                  origin: origin,
                  destination: destination,
                  travelMode: tm.mode
                }, (result, status) => {
                  if (status === 'OK') {
                    const route = result.routes[0].legs[0];
                    resolve({
                      mode: tm.icon,
                      duration: route.duration.text,
                      distance: route.distance.text,
                      durationValue: route.duration.value
                    });
                  } else {
                    resolve({
                      mode: tm.icon,
                      duration: 'N/A',
                      distance: 'N/A',
                      durationValue: 0
                    });
                  }
                });
              })
            )
          ).then(routes => {
            // İlk rotayı (araba) haritada göster
            directionsService.route({
              origin: origin,
              destination: destination,
              travelMode: google.maps.TravelMode.DRIVING
            }, (result, status) => {
              if (status === 'OK') {
                directionsRenderer.setDirections(result);
              }
            });

            // React Native'e rota bilgilerini gönder
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'routeData',
              data: {
                placeName: placeName,
                placeAddress: placeAddress,
                routes: routes
              }
            }));
          });
        }

        function createRoute(destination, waypoints) {
          if (!destination || !userLocation) return;

          console.log('Creating route to:', destination, 'with waypoints:', waypoints);

          // Geocoding servisi ile hedef konumu bul
          const geocoder = new google.maps.Geocoder();
          
          geocoder.geocode({ address: destination }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const destinationLocation = results[0].geometry.location;
              
              // Hedef marker'ı ekle
              if (destinationMarker) destinationMarker.setMap(null);
              destinationMarker = new google.maps.Marker({
                position: destinationLocation,
                map: map,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: '#EA4335',
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: 'white'
                },
                title: destination
              });

              // Waypoints varsa rota hesapla
              if (waypoints && waypoints.length > 0) {
                calculateRouteWithWaypoints(userLocation, destinationLocation, waypoints);
              } else {
                calculateSimpleRoute(userLocation, destinationLocation);
              }
            }
          });
        }

        function calculateRouteWithWaypoints(origin, destination, waypoints) {
          // Waypoints'leri geocode et
          const waypointPromises = waypoints.map(waypoint => 
            new Promise((resolve) => {
              const geocoder = new google.maps.Geocoder();
              geocoder.geocode({ address: waypoint }, (results, status) => {
                if (status === 'OK' && results[0]) {
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

        // React Native'den mesaj alma
        window.addEventListener('message', function(event) {
          const data = JSON.parse(event.data);
          if (data.type === 'createRoute') {
            createRoute(data.destination, data.waypoints);
          }
        });
      </script>
      <script async defer
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyD20dEgYCXYcs-C4uGDMUTSvSbdxYDuk5o&libraries=places&callback=initMap">
      </script>
    </body>
    </html>
  `;

  // Mini harita HTML'i
  const miniMapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <style>
        body, html { height: 100%; margin: 0; padding: 0; }
        #miniMap { width: 100%; height: 100%; }
      </style>
    </head>
    <body>
      <div id="miniMap"></div>
      <script>
        let miniMap, miniDirectionsService, miniDirectionsRenderer;
        const istanbulLocation = { lat: 41.0082, lng: 28.9784 };

        function initMiniMap() {
          miniMap = new google.maps.Map(document.getElementById('miniMap'), {
            center: istanbulLocation,
            zoom: 11,
            disableDefaultUI: true,
            gestureHandling: 'none',
            styles: [
              { "featureType": "all", "elementType": "geometry.fill", "stylers": [ { "weight": "1.00" } ] },
              { "featureType": "all", "elementType": "geometry.stroke", "stylers": [ { "color": "#ffffff" } ] },
              { "featureType": "landscape", "elementType": "all", "stylers": [ { "color": "#f8f8f8" } ] },
              { "featureType": "poi", "elementType": "all", "stylers": [ { "visibility": "off" } ] },
              { "featureType": "road", "elementType": "all", "stylers": [ { "saturation": -100 }, { "lightness": 60 } ] },
              { "featureType": "road", "elementType": "geometry.fill", "stylers": [ { "color": "#f0f0f0" } ] },
              { "featureType": "road.highway", "elementType": "all", "stylers": [ { "visibility": "simplified" } ] },
              { "featureType": "transit", "elementType": "all", "stylers": [ { "visibility": "off" } ] },
              { "featureType": "water", "elementType": "all", "stylers": [ { "color": "#c8d7d4" }, { "visibility": "on" } ] }
            ]
          });

          miniDirectionsService = new google.maps.DirectionsService();
          miniDirectionsRenderer = new google.maps.DirectionsRenderer({
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#E91E63',
              strokeWeight: 3,
              strokeOpacity: 0.8
            }
          });
          miniDirectionsRenderer.setMap(miniMap);

          // İstanbul marker'ı ekle
          new google.maps.Marker({
            position: istanbulLocation,
            map: miniMap,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 6,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeWeight: 1,
              strokeColor: 'white'
            }
          });

          // Rota oluştur
          createMiniRoute();
        }

        function createMiniRoute() {
          const destination = "${destination}";
          const waypoints = ${JSON.stringify(waypoints)};
          
          if (!destination) return;

          const geocoder = new google.maps.Geocoder();
          
          geocoder.geocode({ address: destination + ', İstanbul' }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const destinationLocation = results[0].geometry.location;
              
              // Hedef marker'ı ekle
              new google.maps.Marker({
                position: destinationLocation,
                map: miniMap,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 6,
                  fillColor: '#E91E63',
                  fillOpacity: 1,
                  strokeWeight: 1,
                  strokeColor: 'white'
                }
              });

              if (waypoints && waypoints.length > 0) {
                calculateMiniRouteWithWaypoints(istanbulLocation, destinationLocation, waypoints);
              } else {
                calculateSimpleMiniRoute(istanbulLocation, destinationLocation);
              }
            }
          });
        }

        function calculateMiniRouteWithWaypoints(origin, destination, waypoints) {
          const waypointPromises = waypoints.map(waypoint => 
            new Promise((resolve) => {
              const geocoder = new google.maps.Geocoder();
              geocoder.geocode({ address: waypoint + ', İstanbul' }, (results, status) => {
                if (status === 'OK' && results[0]) {
                  // Waypoint marker'ı ekle
                  new google.maps.Marker({
                    position: results[0].geometry.location,
                    map: miniMap,
                    icon: {
                      path: google.maps.SymbolPath.CIRCLE,
                      scale: 4,
                      fillColor: '#4CAF50',
                      fillOpacity: 1,
                      strokeWeight: 1,
                      strokeColor: 'white'
                    }
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
                miniMap.fitBounds(result.routes[0].bounds);
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
              miniMap.fitBounds(result.routes[0].bounds);
            }
          });
        }

        // Sayfa yüklendiğinde mini haritayı başlat
        setTimeout(initMiniMap, 1000);
      </script>
      <script async defer
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyD20dEgYCXYcs-C4uGDMUTSvSbdxYDuk5o&libraries=places">
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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <FontAwesome name="arrow-left" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Rota Haritası</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Content Container */}
          <View style={styles.contentContainer}>
            {/* Mini Map Preview */}
            {destination && (
              <View style={styles.miniMapContainer}>
                <Text style={styles.miniMapTitle}>Rota Önizleme</Text>
                <View style={styles.miniMapPreview}>
                  <WebView
                    source={{ html: miniMapHTML }}
                    style={styles.miniMapWebView}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    scrollEnabled={false}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                  />
                </View>
                <View style={styles.routeInfoCompact}>
                  {waypoints.length === 0 ? (
                    // Sadece başlangıç ve hedef
                    <>
                      <View style={styles.routeInfoSection}>
                        <Text style={styles.routeInfoLabel}>Başlangıç:</Text>
                        <View style={styles.routeInfoRow}>
                          <FontAwesome name="home" size={14} color="#4285F4" />
                          <Text style={styles.routeInfoText}>İstanbul</Text>
                        </View>
                      </View>
                      
                      <View style={styles.routeInfoSection}>
                        <Text style={styles.routeInfoLabel}>Hedef:</Text>
                        <View style={styles.routeInfoRow}>
                          <FontAwesome name="map-marker" size={14} color="#E91E63" />
                          <Text style={styles.routeInfoText} numberOfLines={2}>{destination}</Text>
                        </View>
                      </View>
                    </>
                  ) : (
                    // Tam rota sırası göster
                    <View style={styles.routeInfoSection}>
                      <Text style={styles.routeInfoLabel}>Rota Sırası:</Text>
                      <View style={styles.routeSequence}>
                        <View style={styles.routeStep}>
                          <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>1</Text>
                          </View>
                          <Text style={styles.stepText}>İstanbul (Başlangıç)</Text>
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
                  )}
                </View>
              </View>
            )}
          </View>

          {/* Complete Route Button */}
          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity
              style={styles.completeRouteButton}
              onPress={handleCompleteRoute}
            >
              <FontAwesome name="check-circle" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.completeRouteButtonText}>Rotayı Tamamla</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  routeInfoCard: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    zIndex: 1,
  },
  routeInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  destinationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  destinationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  waypointsInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  waypointsLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  waypointInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  waypointText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    flex: 1,
  },
  moreWaypoints: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 3,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  completeRouteButton: {
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
  },
  buttonIcon: {
    marginRight: 12,
  },
  completeRouteButtonText: {
    color: '#fff',
    fontSize: 18,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  routeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 3,
  },
  routeInfoText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 18,
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
  bottomButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
  },
});