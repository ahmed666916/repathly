import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Linking, // Bu hala bir fallback için gerekebilir
  Alert,
  ActivityIndicator,
  View,
  Text,
  FlatList
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';

export default function FullScreenMapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const webViewRef = useRef<WebView>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  
  const [isNavigationStarted, setIsNavigationStarted] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [navSteps, setNavSteps] = useState<any[]>([]);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const destination = params.destination as string || (global as any).routeDestination;
  const waypoints = params.waypoints ? JSON.parse(params.waypoints as string) : 
                   ((global as any).routeWaypoints ? JSON.parse((global as any).routeWaypoints) : []);
  const selectedPlaces = params.selectedPlaces ? JSON.parse(params.selectedPlaces as string) : 
                        ((global as any).selectedPlaces || []);
  const userLocation = (global as any).userLocation || { latitude: 41.0082, longitude: 28.9784 };

  useEffect(() => {
    StatusBar.setHidden(true);
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
    
    console.log('✅ Global state\'ler temizlendi:', {
      routeWaypoints: (global as any).routeWaypoints,
      routeDestination: (global as any).routeDestination,
      selectedPlaces: (global as any).selectedPlaces,
      selectedInterests: (global as any).selectedInterests,
      shouldResetInputs: (global as any).shouldResetInputs,
      forceReset: (global as any).forceReset
    });
    
    // Navigasyon state'lerini de temizle
    setNavSteps([]);
    setIsNavigationStarted(false);
    setIsCalculatingRoute(false);
    setCurrentStepIndex(0);
    
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
    console.log('Destination:', destination);
    console.log('Waypoints:', waypoints);
    console.log('UserLocation:', userLocation);
    
    setIsCalculatingRoute(true); // Rota hesaplaması başladı
    
    // Haritanın tam yüklenmesi için kısa bir bekleme
    setTimeout(() => {
      if (webViewRef.current) {
        console.log('WebView\'e getTurnByTurnDirections mesajı gönderiliyor');
        webViewRef.current.injectJavaScript('window.getTurnByTurnDirections(); true;');
      }
    }, 500);

    setIsNavigationStarted(true);

    // 3 saniye sonra yönlendirme adımları hala gelmemişse tekrar dene
    setTimeout(() => {
      if (navSteps.length === 0 && webViewRef.current) {
        console.log('Yönlendirme adımları hala yok, tekrar deneniyor...');
        webViewRef.current.injectJavaScript('window.getTurnByTurnDirections(); true;');
      }
    }, 3000);

    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (newLocation) => {
        if (webViewRef.current) {
          const script = `window.updateUserLocation(${newLocation.coords.latitude}, ${newLocation.coords.longitude}, ${newLocation.coords.heading}); true;`;
          webViewRef.current.injectJavaScript(script);
        }

        // Mevcut adımı güncelle (basit mesafe bazlı hesaplama)
        updateCurrentStep(newLocation.coords.latitude, newLocation.coords.longitude);
      }
    );
  };

  useEffect(() => {
    return () => {
      locationSubscription.current?.remove();
    };
  }, []);

  // Kullanıcının mevcut konumuna göre hangi adımda olduğunu hesapla
  const updateCurrentStep = (userLat: number, userLng: number) => {
    if (navSteps.length === 0) return;

    // Basit mesafe hesaplaması (haversine formula)
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const R = 6371; // Dünya'nın yarıçapı (km)
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c * 1000; // metre cinsinden
    };

    // Şu anki adımdan sonraki adıma geçip geçmeyeceğimizi kontrol et
    if (currentStepIndex < navSteps.length - 1) {
      // Bir sonraki adımın başlangıç noktasına olan mesafe
      // Bu örnek için basit bir mantık: eğer bir adımın mesafesi 50m'den azsa bir sonraki adıma geç
      const currentStep = navSteps[currentStepIndex];
      if (currentStep && currentStep.distance) {
        const distanceValue = parseInt(currentStep.distance.replace(/[^\d]/g, ''));
        if (distanceValue < 50 && currentStepIndex < navSteps.length - 1) {
          setCurrentStepIndex(prev => prev + 1);
        }
      }
    }
  };

  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('WebView mesajı alındı:', data);

      if (data.type === 'MAP_READY') {
        console.log('Harita hazır');
        setIsMapReady(true);
      } else if (data.type === 'NAVIGATION_ERROR') {
        console.error('Navigasyon hatası:', data.message);
        Alert.alert('Navigasyon Hatası', data.message);
        setIsCalculatingRoute(false);
      } else if (data.type === 'TURN_BY_TURN_STEPS') {
        console.log('Yönlendirme adımları alındı:', data.steps);
        setNavSteps(data.steps);
        setIsCalculatingRoute(false);
      } else if (data.type === 'TEST') {
        console.log('Test mesajı:', data.message);
      }
    } catch (error) {
      console.error('WebView message parse hatası:', error);
      setIsCalculatingRoute(false);
    }
  };

  const fullScreenMapHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
         body, html { height: 100%; margin: 0; padding: 0; overflow: hidden; }
         #fullMap { width: 100vw; height: 100vh; }
        </style>
      </head>
      <body>
       <div id="fullMap"></div>
       <script>
         let fullMap, directionsService, directionsRenderer;
         let userMarker = null; // Kullanıcıyı takip eden marker
         const userStartLocation = { lat: ${userLocation.latitude}, lng: ${userLocation.longitude} };

         function initFullMap() {
           fullMap = new google.maps.Map(document.getElementById('fullMap'), {
             center: userStartLocation,
             zoom: 12,
             mapTypeControl: true,
             streetViewControl: false,
             fullscreenControl: false,
           });

           directionsService = new google.maps.DirectionsService();
           directionsRenderer = new google.maps.DirectionsRenderer({
             suppressMarkers: true, // Marker'ları biz kendimiz ekleyeceğiz
             polylineOptions: { strokeColor: '#E91E63', strokeWeight: 5, strokeOpacity: 0.8 }
           });
           directionsRenderer.setMap(fullMap);
           
           createFullRoute();
           
           // Harita tamamen yüklendiğinde bildirimi gönder
           setTimeout(() => {
             window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_READY' }));
           }, 1000);
         }

         function createFullRoute() {
           const destination = "${destination}";
           const waypoints = ${JSON.stringify(waypoints)};
           const selectedPlaces = ${JSON.stringify(selectedPlaces)};
           if (!destination) return;

           // Başlangıç marker'ını ekle
           addMarker(userStartLocation, 'Başlangıç', '#4285F4');
           
           let allWaypoints = [];
           if (waypoints) allWaypoints.push(...waypoints.map(w => ({ location: w, stopover: true })));
           if (selectedPlaces) {
             selectedPlaces.forEach(place => {
               if (place.location) allWaypoints.push({ location: place.location, stopover: true });
             });
           }

           directionsService.route({
             origin: userStartLocation,
             destination: destination,
             waypoints: allWaypoints,
             travelMode: google.maps.TravelMode.DRIVING,
             optimizeWaypoints: true
           }, (result, status) => {
             if (status === 'OK') {
               directionsRenderer.setDirections(result);
               // Hedef ve ara nokta marker'larını ekle
               const route = result.routes[0];
               addMarker(route.legs[route.legs.length - 1].end_location, 'Hedef', '#E91E63');
               route.legs.slice(0, -1).forEach((leg) => addMarker(leg.end_location, 'Ara Durak', '#FF9800'));
             }
           });
         }

         function getTrafficColor(durationInTraffic, duration) {
           const ratio = durationInTraffic.value / duration.value;
           if (ratio > 1.5) return '#FF0000'; // Kırmızı (yoğun trafik)
           if (ratio > 1.1) return '#FFFF00'; // Sarı (orta trafik)
           return '#E91E63'; // Pembe ana renk
         }

         window.getTurnByTurnDirections = function() {
           console.log('getTurnByTurnDirections fonksiyonu çağrıldı');
           
           const destination = "${destination}";
           const waypoints = ${JSON.stringify(waypoints)};
           
           console.log('Destination:', destination);
           console.log('Waypoints:', waypoints);
           console.log('UserStartLocation:', userStartLocation);
           
           if (!destination) {
             console.error('Hedef konum bulunamadı');
             window.ReactNativeWebView.postMessage(JSON.stringify({ 
               type: 'NAVIGATION_ERROR', 
               message: 'Hedef konum bulunamadı' 
             }));
             return;
           }

           if (!directionsService) {
             console.error('DirectionsService henüz hazır değil');
             window.ReactNativeWebView.postMessage(JSON.stringify({ 
               type: 'NAVIGATION_ERROR', 
               message: 'Harita servisleri henüz hazır değil' 
             }));
             return;
           }

           // Waypoints'i doğru formata çevir
           let processedWaypoints = [];
           if (waypoints && waypoints.length > 0) {
             processedWaypoints = waypoints.map(w => ({ location: w, stopover: true }));
           }

           const request = {
             origin: userStartLocation,
             destination: destination,
             waypoints: processedWaypoints,
             travelMode: google.maps.TravelMode.DRIVING,
             optimizeWaypoints: true
           };

           console.log('Directions request:', request);

           directionsService.route(request, (result, status) => {
             console.log('Directions response status:', status);
             
             if (status === 'OK') {
               console.log('Directions result:', result);
               const route = result.routes[0];
               const steps = route.legs.flatMap(leg => leg.steps).map(step => ({
                 instruction: step.instructions.replace(/<[^>]*>/g, ''), // HTML etiketlerini temizle
                 distance: step.distance.text,
                 duration: step.duration.text,
               }));
               
               console.log('Extracted steps:', steps);
               window.ReactNativeWebView.postMessage(JSON.stringify({ 
                 type: 'TURN_BY_TURN_STEPS', 
                 steps: steps 
               }));
             } else {
               console.error('Directions error:', status);
               window.ReactNativeWebView.postMessage(JSON.stringify({ 
                 type: 'NAVIGATION_ERROR', 
                 message: 'Yol tarifi alınamadı: ' + status 
               }));
             }
           });
         }

         function addMarker(position, title, color) {
            new google.maps.Marker({
                position,
                map: fullMap,
                title,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: color,
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: 'white'
                }
            });
         }

         // UYGULAMA İÇİ NAVİGASYON FONKSİYONU - YENİ YÖNTEM
         window.updateUserLocation = function(lat, lng, heading) {
            const newPos = { lat, lng };

            // Haritayı kullanıcının konumuna yakınlaştır ve merkeze al (sadece ilk seferde)
            if (!userMarker) {
              fullMap.setCenter(newPos);
              fullMap.setZoom(17);
            }

            // Eğer marker yoksa oluştur, varsa pozisyonunu güncelle
            if (!userMarker) {
                userMarker = new google.maps.Marker({
                    position: newPos,
                    map: fullMap,
                    icon: {
                        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                        scale: 7,
                        rotation: heading || 0,
                        fillColor: '#1A73E8',
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: 'white'
                    },
                    title: 'Siz'
                });
            } else {
                userMarker.setPosition(newPos);
                if (heading) {
                    const icon = userMarker.getIcon();
                    icon.rotation = heading;
                    userMarker.setIcon(icon);
                }
            }
            
            // Haritayı kullanıcının yeni konumuna kaydır
            fullMap.panTo(newPos);
         };

         // Test fonksiyonu
         window.testFunction = function() {
           console.log('Test fonksiyonu çalışıyor');
           window.ReactNativeWebView.postMessage(JSON.stringify({ 
             type: 'TEST', 
             message: 'WebView iletişimi çalışıyor' 
           }));
         };

         setTimeout(initFullMap, 500);
       </script>
       <script async defer
         src="https://maps.googleapis.com/maps/api/js?key=AIzaSyD20dEgYCXYcs-C4uGDMUTSvSbdxYDuk5o&libraries=places">
       </script>
      </body>
      </html>
    `;

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: fullScreenMapHTML }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onMessage={onMessage}
          geolocationEnabled={true} // Konum takibi için bu zorunludur!
        />
        {!isMapReady && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#E91E63" />
              <Text style={styles.loadingText}>Harita hazırlanıyor...</Text>
            </View>
        )}
      </View>
      
      {isMapReady && (
          <>
            {/* Sol üst köşede küçük yönlendirme kutusu - sadece navigasyon başladığında */}
            {isNavigationStarted && navSteps.length > 0 && navSteps[currentStepIndex] && (
              <View style={styles.navigationBox}>
                <View style={styles.distanceContainer}>
                  <FontAwesome name="arrow-right" size={16} color="#fff" />
                  <Text style={styles.distanceText}>{navSteps[currentStepIndex].distance}</Text>
                </View>
                <Text style={styles.instructionText}>
                  {navSteps[currentStepIndex].instruction}
                </Text>
                <View style={styles.nextIndicator}>
                  <Text style={styles.nextText}>sonra</Text>
                  <FontAwesome name="arrow-right" size={12} color="#4CAF50" />
                </View>
              </View>
            )}
            
            {/* Navigasyon başlamadan önce: Geziye Başla ve İlgi Alanlarını Değiştir butonları yan yana */}
            {!isNavigationStarted && (
              <View style={styles.bottomButtonContainer}>
                <TouchableOpacity style={styles.changeInterestsButton} onPress={handleBackPress} activeOpacity={0.8}>
                  <FontAwesome name="edit" size={16} color="#E91E63" />
                  <Text style={styles.changeInterestsText}>İlgi Alanlarını Değiştir</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.startJourneyButtonBottom} onPress={handleStartJourney} activeOpacity={0.8} disabled={isCalculatingRoute}>
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
          </>
      )}
    </View>
  );
}

// STYLES...
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000',
    },
    mapContainer: {
      flex: 1,
    },
    webView: {
      flex: 1,
      backgroundColor: 'transparent',
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
    navigationBox: {
      position: 'absolute',
      top: 60,
      left: 20,
      zIndex: 1000,
      backgroundColor: '#1E3A8A',
      borderRadius: 12,
      padding: 12,
      minWidth: 160,
      maxWidth: 220,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    distanceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    distanceText: {
      color: '#fff',
      fontSize: 24,
      fontWeight: 'bold',
      marginLeft: 8,
    },
    instructionText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 6,
      lineHeight: 18,
    },
    nextIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
      alignSelf: 'flex-start',
    },
    nextText: {
      color: '#fff',
      fontSize: 12,
      marginRight: 4,
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
  });