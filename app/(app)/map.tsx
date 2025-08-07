import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, Alert, Animated } from 'react-native';
import { WebView } from 'react-native-webview';
import { FontAwesome5 } from '@expo/vector-icons';
import RouteDetailSheet from '@/components/RouteDetailSheet';
import { useLocalSearchParams } from 'expo-router';

const userProfilePic = 'https://i.pravatar.cc/150?u=a042581f4e29026704d';

export default function MainMapScreen() {
  const params = useLocalSearchParams();
  const [isRouteSheetVisible, setIsRouteSheetVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [routeData, setRouteData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const fabAnimation = useRef(new Animated.Value(0)).current;
  const webViewRef = useRef(null);

  // Seçilen yerleri parametreden al
  useEffect(() => {
    if (params.selectedPlaces) {
      try {
        const places = JSON.parse(params.selectedPlaces as string);
        setSelectedPlaces(places);
        console.log('Seçilen yerler:', places);
      } catch (error) {
        console.error('Parametre parse hatası:', error);
      }
    }
  }, [params.selectedPlaces]);

  const toggleFabMenu = () => {
    const toValue = isFabMenuOpen ? 0 : 1;
    Animated.timing(fabAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsFabMenuOpen(!isFabMenuOpen);
  };


  const handleSearch = () => {
    if (searchQuery.trim() && webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'search',
        query: searchQuery.trim()
      }));
    }
  };

  // Seçilen yerlerle rota oluştur
  useEffect(() => {
    if (selectedPlaces.length > 0 && webViewRef.current) {
      // WebView yüklendiğinde biraz bekle, sonra rota oluştur
      setTimeout(() => {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'createRouteWithPlaces',
          places: selectedPlaces
        }));
      }, 2000);
    }
  }, [selectedPlaces]);

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'userLocation':
          setUserLocation(data.location);
          break;
        case 'routeData':
          setRouteData(data.data);
          setIsRouteSheetVisible(true);
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

        function createRouteWithPlaces(places) {
          if (!places || places.length === 0 || !userLocation) return;

          console.log('Creating route with places:', places);

          // İlk yeri hedef olarak belirle ve rota hesapla
          searchPlace(places[0]);
        }

        // React Native'den mesaj alma
        window.addEventListener('message', function(event) {
          const data = JSON.parse(event.data);
          if (data.type === 'search') {
            searchPlace(data.query);
          } else if (data.type === 'createRouteWithPlaces') {
            createRouteWithPlaces(data.places);
          }
        });
      </script>
      <script async defer
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyD20dEgYCXYcs-C4uGDMUTSvSbdxYDuk5o&libraries=places&callback=initMap">
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: mapHTML }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleWebViewMessage}
        geolocationEnabled={true}
        allowsInlineMediaPlayback={true}
      />
      
      <View style={styles.rightActionButtonsContainer}>
        <TouchableOpacity style={styles.mapActionButton}>
          <FontAwesome5 name="location-arrow" size={20} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapActionButton}>
          <FontAwesome5 name="compass" size={20} color="#333" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.profilePinContainer}>
        <View style={styles.profilePicContainer}>
          <Image
            source={{ uri: userProfilePic }}
            style={styles.profilePic}
          />
        </View>
        <View style={styles.profilePinPointer} />
      </View>

      {isRouteSheetVisible && routeData && (
         <View style={styles.routeSheetWrapper}>
            <RouteDetailSheet 
              routeData={routeData}
              onClose={() => setIsRouteSheetVisible(false)}
            />
         </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f3',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    rightActionButtonsContainer: {
        position: 'absolute',
        right: 20,
        top: 150,
        alignItems: 'center',
    },
    mapActionButton: {
        backgroundColor: '#fff',
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    profilePinContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -28 }, { translateY: -56 }],
        alignItems: 'center',
    },
    profilePicContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 10,
    },
    profilePinPointer: {
      width: 0,
      height: 0,
      backgroundColor: 'transparent',
      borderStyle: 'solid',
      borderLeftWidth: 8,
      borderRightWidth: 8,
      borderTopWidth: 12,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderTopColor: '#10B981',
      transform: [{ translateY: -2 }],
    },
    profilePic: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#fff',
    },
    routeSheetWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 2,
    },
});