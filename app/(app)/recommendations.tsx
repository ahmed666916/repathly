import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  SafeAreaView,
  Alert,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import GOOGLE_MAPS_KEY from '../../constants/googleMapsKey';

const { width } = Dimensions.get('window');

interface Place {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  description: string;
  imageUri: string;
  address: string;
  priceLevel: number;
  selected: boolean;
  googlePlaceId?: string;
  location?: {
    lat: number;
    lng: number;
  };
  vicinity?: string;
  // Önerinin hangi rota lokasyonu için fetch edildiği
  sourceLocation?: string;
  // Yeni lokasyon hiyerarşi bilgileri
  locationHierarchy?: string; // 'il', 'ilçe', 'mahalle'
  locationDisplayName?: string; // 'Ankara' veya 'Ankara > Çankaya' gibi
  routeOrder?: number; // Güzergah sırası
}

export default function RecommendationsScreen() {
  const router = useRouter();
  const { selectedInterests, destination, waypoints } = useLocalSearchParams();
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('Öneriler yükleniyor...');
  const [searchRadius, setSearchRadius] = useState(30); // Default 30km
  const [userCurrentCity, setUserCurrentCity] = useState<string>('İstanbul'); // Default İstanbul

  useEffect(() => {
    // Kullanıcının mevcut konumunu tespit et
    detectUserCurrentCity();
  }, []);

  useEffect(() => {
    if (userCurrentCity) {
      generateLocationBasedRecommendations();
    }
  }, [selectedInterests, destination, waypoints, searchRadius, userCurrentCity]);

  // Kullanıcının mevcut şehrini tespit eden fonksiyon
  const detectUserCurrentCity = async () => {
    try {
      // Global'den kullanıcının konumunu al
      const globalUserLocation = (global as any).userLocation;

      if (globalUserLocation) {
        console.log('🌍 Kullanıcının GPS konumu:', globalUserLocation);

        // Reverse geocoding ile şehir adını al
        const apiKey = GOOGLE_MAPS_KEY;
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${globalUserLocation.latitude},${globalUserLocation.longitude}&key=${apiKey}&language=tr&result_type=administrative_area_level_1`;

        const response = await fetch(geocodeUrl);
        const data = await response.json();

        if (data.status === 'OK' && data.results[0]) {
          const result = data.results[0];

          for (const component of result.address_components) {
            if (component.types.includes('administrative_area_level_1')) {
              const cityName = component.long_name;
              console.log('📍 Kullanıcının bulunduğu şehir:', cityName);
              setUserCurrentCity(cityName);
              return;
            }
          }
        }
      }

      // Fallback: GPS yoksa İstanbul varsayılan
      console.log('⚠️ GPS konumu bulunamadı, İstanbul varsayılan olarak kullanılıyor');
      setUserCurrentCity('İstanbul');

    } catch (error) {
      console.error('Kullanıcı konumu tespit hatası:', error);
      setUserCurrentCity('İstanbul');
    }
  };

  // Sayfa focus olduğunda reset kontrolü
  useFocusEffect(
    useCallback(() => {
      const shouldReset = (global as any).shouldResetInputs;
      if (shouldReset) {
        console.log('Öneriler sayfası temizleniyor...');
        // Tüm önerileri temizle ve loading'i sıfırla
        setPlaces([]);
        setIsLoading(true);
        setLoadingText('Öneriler yükleniyor...');
        (global as any).shouldResetInputs = false;
      }
    }, [])
  );

  const fetchGooglePlaces = async (location: string, interest: string, searchRadius: number): Promise<Place[]> => {
    // KULLANICININ BULUNDUĞU ŞEHİR İÇİN ÖNERI ALMA - KESIN FİLTRE
    if (location === userCurrentCity || location === `${userCurrentCity} Province` || location.includes(userCurrentCity)) {
      console.log('🚫 Kullanıcının bulunduğu şehir için öneri alınmıyor:', location);
      return [];
    }

    const apiKey = GOOGLE_MAPS_KEY;
    const targetCount = 10;
    let allPlaces: any[] = [];

    const interestConfig: Record<string, { textQueries: string[]; types: string[]; keywords: string[] }> = {
      history: {
        textQueries: ['tarihi yerler', 'antik kentler', 'müzeler', 'kaleler', 'arkeolojik alanlar'],
        types: ['museum', 'tourist_attraction', 'mosque', 'church', 'synagogue', 'castle', 'ruins'],
        keywords: ['tarihi', 'antik', 'müze', 'kale', 'arkeoloji', 'eski şehir', 'kalıntı']
      },
      nature: {
        textQueries: ['doğal güzellikler', 'şelaleler', 'milli parklar', 'kanyonlar', 'plajlar', 'göller'],
        types: ['park', 'national_park', 'beach', 'lake', 'mountain', 'tourist_attraction'],
        keywords: ['doğa', 'şelale', 'kanyon', 'orman', 'plaj', 'göl', 'dağ', 'tabiat']
      },
      food: {
        textQueries: ['en iyi restoranlar', 'yöresel yemekler', 'meşhur lokantalar', 'kahvaltı mekanları'],
        types: ['restaurant', 'cafe', 'bakery', 'bar'],
        keywords: ['restoran', 'kafe', 'yemek', 'lezzet', 'mutfak', 'lokanta']
      },
      art: {
        textQueries: ['sanat galerileri', 'kültür merkezleri', 'sergiler', 'tiyatrolar'],
        types: ['art_gallery', 'museum', 'theater', 'library'],
        keywords: ['sanat', 'kültür', 'galeri', 'sergi', 'tiyatro', 'müze']
      },
      adventure: {
        textQueries: ['macera parkları', 'aktiviteler', 'yamaç paraşütü', 'rafting'],
        types: ['amusement_park', 'zoo', 'aquarium', 'tourist_attraction'],
        keywords: ['macera', 'eğlence', 'aktivite', 'safari', 'rafting', 'dalış']
      },
      nightlife: {
        textQueries: ['gece kulüpleri', 'canlı müzik', 'rooftop barlar'],
        types: ['night_club', 'bar'],
        keywords: ['gece', 'bar', 'club', 'canlı müzik', 'eğlence']
      }
    };

    const config = interestConfig[interest];
    if (!config) return [];

    const geocodeLocation = async (loc: string): Promise<{ lat: number; lng: number } | null> => {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(loc)}&key=${apiKey}&language=tr`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === 'OK') return data.results[0].geometry.location;
      } catch (e) { console.error("Geocode Error:", e); }
      return null;
    };

    const coords = await geocodeLocation(location);
    if (!coords) return [];

    // 1. ADIM: TextSearch ile popüler yerleri ara
    // Google Places API maksimum 50km radius destekler, daha büyük değerler için farklı strateji
    const apiRadiusMeters = Math.min(searchRadius * 1000, 50000); // Maksimum 50km
    for (const query of config.textQueries) {
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${coords.lat},${coords.lng}&radius=${apiRadiusMeters}&key=${apiKey}&language=tr`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === 'OK') {
          allPlaces.push(...data.results);
        }
      } catch (e) { console.error("TextSearch Error:", e); }
    }

    // 2. ADIM: Yeterli sonuç yoksa, NearbySearch ile destekle
    if (allPlaces.length < targetCount * 2) {
      for (const type of config.types) {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coords.lat},${coords.lng}&radius=${apiRadiusMeters}&type=${type}&key=${apiKey}&language=tr`;
        try {
          const res = await fetch(url);
          const data = await res.json();
          if (data.status === 'OK') {
            allPlaces.push(...data.results);
          }
        } catch (e) { console.error("NearbySearch Error:", e); }
      }
    }

    // 3. ADIM: Sonuçları filtrele ve sırala
    const uniquePlaces = allPlaces.filter((place, index, self) =>
      place.place_id && index === self.findIndex(p => p.place_id === place.place_id)
    );

    // Mesafe hesabı (Haversine)
    const toRad = (v: number) => (v * Math.PI) / 180;
    const distanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    // Kullanıcı tarafından belirlenen mesafe eşiği kullan (orijinal searchRadius)
    const userRadiusKm = searchRadius;

    // Coğrafi mesafe filtresi: kullanıcının belirlediği mesafe içinde kal
    const distanceFilteredPlaces = uniquePlaces.filter((p: any) => {
      const loc = p.geometry?.location;
      if (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number') return false;
      const d = distanceKm(coords.lat, coords.lng, loc.lat, loc.lng);
      return d <= userRadiusKm;
    });

    const matchesInterest = (place: any): boolean => {
      const placeTypes = new Set((place.types || []).map((t: string) => t.toLowerCase()));
      const interestTypes = new Set(config.types);
      for (const type of interestTypes) {
        if (placeTypes.has(type)) return true;
      }
      const placeText = `${(place.name || '').toLowerCase()} ${(place.vicinity || '').toLowerCase()}`;
      for (const keyword of config.keywords) {
        if (placeText.includes(keyword)) return true;
      }
      return false;
    };

    // Önce coğrafi filtre, sonra kategori eşleşmesi
    const categoryFilteredPlaces = distanceFilteredPlaces.filter(matchesInterest);

    const sortPlaces = (a: any, b: any) => {
      const aReviews = a.user_ratings_total || 0;
      const bReviews = b.user_ratings_total || 0;
      if (aReviews !== bReviews) return bReviews - aReviews;
      return (b.rating || 0) - (a.rating || 0);
    };

    let finalPlaces = categoryFilteredPlaces
      .filter(p => (p.rating || 0) >= 4.0 && (p.user_ratings_total || 0) >= 50)
      .sort(sortPlaces);

    if (finalPlaces.length < targetCount) {
      const morePlaces = categoryFilteredPlaces
        .filter(p => (p.rating || 0) >= 3.0 && (p.user_ratings_total || 0) >= 10)
        .sort(sortPlaces);
      finalPlaces = [...new Set([...finalPlaces, ...morePlaces])].slice(0, targetCount);
    }

    if (finalPlaces.length < targetCount) {
      const evenMorePlaces = categoryFilteredPlaces.sort(sortPlaces);
      finalPlaces = [...new Set([...finalPlaces, ...evenMorePlaces])].slice(0, targetCount);
    }


    // Use basic place information without detailed API calls for better performance
    const basicPlaces = finalPlaces.slice(0, targetCount).map((place: any) => {
      return {
        id: place.place_id,
        name: place.name,
        category: interest,
        rating: place.rating || 0,
        reviewCount: place.user_ratings_total || 0,
        description: (place.types || []).join(', ').replace(/_/g, ' '),
        imageUri: place.photos?.[0]
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${apiKey}`
          : getDefaultImageForCategory(interest),
        address: place.vicinity || 'Adres bilgisi yok',
        priceLevel: place.price_level || 1,
        selected: false,
        googlePlaceId: place.place_id,
        location: place.geometry?.location,
        vicinity: place.vicinity,
        sourceLocation: location
      };
    });

    // KULLANICININ ŞEHRİ FİLTRESİ - Son kontrol
    const filteredPlaces = basicPlaces.filter(place => {
      const isUserCity = place.address?.includes(userCurrentCity) ||
        place.vicinity?.includes(userCurrentCity) ||
        place.sourceLocation?.includes(userCurrentCity);

      if (isUserCity) {
        console.log('🚫 Kullanıcının şehri filtrelendi:', place.name, `(${userCurrentCity})`);
        return false;
      }
      return true;
    });

    console.log(`✅ ${location} için ${filteredPlaces.length} yer döndürülüyor (${userCurrentCity} filtrelendi)`);
    return filteredPlaces;
  };

  const getDefaultImageForCategory = (interest: string): string => {
    const defaultImages = {
      food: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
      history: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=400&h=300&fit=crop',
      art: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
      adventure: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop',
      nature: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
      nightlife: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop'
    };
    return defaultImages[interest as keyof typeof defaultImages] || defaultImages.food;
  };

  const generateLocationBasedRecommendations = async () => {
    setIsLoading(true);
    setLoadingText('Rota güzergahı analiz ediliyor...');

    const interests = selectedInterests ? JSON.parse(selectedInterests as string) : [];
    const waypointsList = waypoints ? JSON.parse(waypoints as string) : [];

    try {
      // 1. ADIM: Rota güzergahını analiz et ve geçilen tüm il/ilçeleri bul
      const routeLocations = await analyzeRouteAndGetLocations(waypointsList, destination as string);
      console.log('🗺️ Rota boyunca bulunan lokasyonlar (sıralı):', routeLocations.map(l => ({ name: l.name, order: l.routeOrder })));
      console.log('📍 Waypoints:', waypointsList);
      console.log('🎯 Destination:', destination);

      // Kullanıcının bulunduğu şehri filtrele - öneri alma
      const filteredLocations = routeLocations.filter(location =>
        location.name !== userCurrentCity &&
        location.name !== `${userCurrentCity} Province` &&
        location.displayName !== userCurrentCity &&
        !location.displayName.includes(userCurrentCity)
      );

      setLoadingText(`${filteredLocations.length} şehir için öneriler hazırlanıyor...`);

      // 2. ADIM: Her lokasyon için öneriler al (İstanbul hariç)
      const realPlaces: Place[] = [];

      console.log(`🚫 ${userCurrentCity} filtrelendi. Öneri alınacak şehirler:`, filteredLocations.map(l => l.name));

      let totalExpected = filteredLocations.length * interests.length;
      let currentProgress = 0;

      for (const location of filteredLocations) {
        for (const interest of interests) {
          currentProgress++;
          setLoadingText(`${location.displayName} için ${getCategoryName(interest)} yerleri aranıyor... (${currentProgress}/${totalExpected})`);

          try {
            const placesForLocation = await fetchGooglePlaces(location.name, interest, searchRadius);
            // Lokasyon bilgilerini ekle
            const enrichedPlaces = placesForLocation.map(place => ({
              ...place,
              sourceLocation: location.name,
              locationHierarchy: location.hierarchy,
              locationDisplayName: location.displayName,
              routeOrder: location.routeOrder
            }));
            realPlaces.push(...enrichedPlaces);
          } catch (error) {
            console.error(`Error fetching places for ${location.name}, ${interest}:`, error);
          }

          // API rate limiting için kısa bekleme
          await new Promise(resolve => setTimeout(resolve, 150));
        }
      }

      // Final kullanıcı şehri filtresi - places state'ine eklemeden önce
      const finalFilteredPlaces = realPlaces.filter(place => {
        const isUserCity = place.sourceLocation?.includes(userCurrentCity) ||
          place.locationDisplayName?.includes(userCurrentCity) ||
          place.address?.includes(userCurrentCity) ||
          place.vicinity?.includes(userCurrentCity) ||
          place.name?.includes(userCurrentCity);

        if (isUserCity) {
          console.log(`🚫 Final filtrede ${userCurrentCity} yeri kaldırıldı:`, place.name);
          return false;
        }
        return true;
      });

      console.log(`✅ Final: ${realPlaces.length} -> ${finalFilteredPlaces.length} yer (${userCurrentCity} filtrelendi)`);
      setPlaces(finalFilteredPlaces);
      if (finalFilteredPlaces.length === 0) {
        setLoadingText('Bu rota güzergahında öneriler bulunamadı.');
        setTimeout(() => setIsLoading(false), 3000);
      } else {
        setIsLoading(false);
      }

    } catch (error) {
      console.error('Rota analizi hatası:', error);
      setLoadingText('Rota analizi başarısız oldu.');
      setTimeout(() => setIsLoading(false), 3000);
    }
  };

  // GERÇEK ROTA GÜZERGAHINDAKİ İLLERİ SIRASIYLA BULAN FONKSİYON
  const analyzeRouteAndGetLocations = async (waypoints: string[], destination: string): Promise<Array<{ name: string, hierarchy: string, displayName: string, routeOrder: number }>> => {
    const apiKey = GOOGLE_MAPS_KEY;
    const orderedCities: Array<{ name: string, hierarchy: string, displayName: string, routeOrder: number }> = [];

    try {
      console.log(`🛣️ ${userCurrentCity} -> ${destination} rotası analiz ediliyor...`);

      // TEK BİR DIRECTIONS ÇAĞRISI: Kullanıcının şehrinden hedefe direkt rota
      const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(userCurrentCity)}&destination=${encodeURIComponent(destination)}&key=${apiKey}&language=tr&region=tr`;

      const response = await fetch(directionsUrl);
      const data = await response.json();

      if (data.status === 'OK' && data.routes[0]) {
        const route = data.routes[0];
        console.log('✅ Rota bulundu, adımlar analiz ediliyor...');

        let stepOrder = 0;
        const seenProvinces = new Set<string>();

        // Her leg ve step'i sırayla işle
        for (const leg of route.legs) {
          for (let stepIndex = 0; stepIndex < leg.steps.length; stepIndex++) {
            const step = leg.steps[stepIndex];
            stepOrder++;

            // Her adımın koordinatlarını analiz et
            const stepLocations = await analyzeStepLocation(step, apiKey, stepOrder);

            // Yeni illeri ekle (kullanıcının şehri hariç - kesin filtre)
            for (const location of stepLocations) {
              if (location.name !== userCurrentCity &&
                location.name !== `${userCurrentCity} Province` &&
                !location.name.includes(userCurrentCity) &&
                !location.displayName.includes(userCurrentCity) &&
                !seenProvinces.has(location.name)) {

                seenProvinces.add(location.name);
                orderedCities.push({
                  ...location,
                  routeOrder: stepOrder
                });

                console.log(`📍 ${stepOrder}. sırada: ${location.name} (${location.hierarchy})`);
              }
            }

            // Her 10 step'te bir kısa bekleme
            if (stepIndex % 10 === 0) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }
        }

        console.log('🎯 Final route cities:', orderedCities.map(c => c.name));
        return orderedCities;

      } else {
        console.error('❌ Directions API hatası:', data.status);
        throw new Error(`Directions API Error: ${data.status}`);
      }

    } catch (error) {
      console.error('🚨 Rota analizi hatası:', error);
      // Hata durumunda en azından hedef şehri döndür
      return [
        { name: destination, hierarchy: 'il', displayName: destination, routeOrder: 1 }
      ];
    }
  };

  // Tek bir step'in lokasyonunu analiz eden yardımcı fonksiyon
  const analyzeStepLocation = async (step: any, apiKey: string, stepOrder: number): Promise<Array<{ name: string, hierarchy: string, displayName: string }>> => {
    try {
      const lat = step.start_location.lat;
      const lng = step.start_location.lng;

      // Reverse geocoding
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=tr&result_type=administrative_area_level_1|administrative_area_level_2`;

      const response = await fetch(geocodeUrl);
      const data = await response.json();

      if (data.status === 'OK' && data.results[0]) {
        const result = data.results[0];
        const locations: Array<{ name: string, hierarchy: string, displayName: string }> = [];

        let province = '';
        let district = '';

        // Adres bileşenlerini parse et
        for (const component of result.address_components) {
          if (component.types.includes('administrative_area_level_1')) {
            province = component.long_name;
          } else if (component.types.includes('administrative_area_level_2')) {
            district = component.long_name;
          }
        }

        // Önce ili ekle
        if (province) {
          locations.push({
            name: province,
            hierarchy: 'il',
            displayName: province
          });
        }

        // Sonra ilçeyi ekle (eğer farklıysa)
        if (district && district !== province) {
          locations.push({
            name: district,
            hierarchy: 'ilçe',
            displayName: `${province} > ${district}`
          });
        }

        return locations;
      }

      return [];
    } catch (error) {
      console.error('Step location analysis error:', error);
      return [];
    }
  };

  const togglePlaceSelection = (placeId: string) => {
    setPlaces(prev =>
      prev.map(place =>
        place.id === placeId
          ? { ...place, selected: !place.selected }
          : place
      )
    );
  };

  const handleCompleteRoute = () => {
    const selectedCount = places.filter(p => p.selected).length;
    if (selectedCount === 0) {
      Alert.alert('Uyarı', 'Lütfen en az bir yer seçin.');
      return;
    }

    // Seçilen yerleri global'e kaydet
    const selectedPlaces = places.filter(p => p.selected);
    (global as any).selectedPlaces = selectedPlaces;
    (global as any).selectedInterests = selectedInterests ? JSON.parse(selectedInterests as string) : [];
    (global as any).routeDestination = destination;
    (global as any).routeWaypoints = waypoints;

    // Full-screen map'e yönlendir
    router.push('/(app)/fullscreen-map');
  };

  // Önerileri lokasyon hiyerarşisine ve kategoriye göre grupla
  const groupedByLocationAndCategory = () => {
    const grouped: { [location: string]: { [category: string]: Place[] } } = {};

    // Tüm yerleri önce place_id'ye göre benzersiz hale getir (tekrar önleme)
    const uniquePlaces = places.filter((place, index, arr) =>
      index === arr.findIndex(p => p.googlePlaceId === place.googlePlaceId)
    );

    // Lokasyon hiyerarşisine göre akıllı gruplama
    const locationGroups = new Map<string, Place[]>();

    uniquePlaces
      .filter(place => {
        const locationKey = place.locationDisplayName || place.sourceLocation;
        const isUserCity = locationKey?.includes(userCurrentCity) ||
          place.address?.includes(userCurrentCity) ||
          place.vicinity?.includes(userCurrentCity);

        if (isUserCity) {
          console.log(`🚫 Gruplama sırasında ${userCurrentCity} yeri filtrelendi:`, place.name);
          return false;
        }
        return true;
      })
      .forEach(place => {
        const hierarchy = place.locationHierarchy;
        const displayName = place.locationDisplayName || place.sourceLocation;

        if (!displayName) return;

        // Merkez ilçe kontrolü: eğer displayName sadece il adı içeriyorsa merkez ilçe
        const isCenterDistrict = hierarchy === 'ilçe' && !displayName.includes(' > ');

        if (isCenterDistrict) {
          // Merkez ilçe ise, il adı altında grupla
          const provinceName = place.sourceLocation || displayName;
          if (!locationGroups.has(provinceName)) {
            locationGroups.set(provinceName, []);
          }
          locationGroups.get(provinceName)!.push({
            ...place,
            locationDisplayName: provinceName,
            locationHierarchy: 'il'
          });
        } else {
          // Normal ilçe/il ise kendi adı altında grupla
          if (!locationGroups.has(displayName)) {
            locationGroups.set(displayName, []);
          }
          locationGroups.get(displayName)!.push(place);
        }
      });

    // Map'ten grouped objesine dönüştür
    locationGroups.forEach((places, locationName) => {
      grouped[locationName] = {};
      places.forEach(place => {
        if (!grouped[locationName][place.category]) {
          grouped[locationName][place.category] = [];
        }
        grouped[locationName][place.category].push(place);
      });
    });

    // Benzersiz lokasyonları al
    const uniqueLocations = Array.from(locationGroups.keys())
      .filter(location =>
        location !== userCurrentCity &&
        location !== `${userCurrentCity} Province` &&
        !location?.includes(userCurrentCity)
      );

    // Lokasyonları rota sırasına göre sırala (güzergah boyunca)
    const sortedLocations = uniqueLocations.sort((a, b) => {
      const aPlace = places.find(p => p.locationDisplayName === a || p.sourceLocation === a);
      const bPlace = places.find(p => p.locationDisplayName === b || p.sourceLocation === b);

      const aRouteOrder = aPlace?.routeOrder || 999;
      const bRouteOrder = bPlace?.routeOrder || 999;

      console.log(`🔄 Sorting: ${a} (order: ${aRouteOrder}) vs ${b} (order: ${bRouteOrder})`);

      // Önce rota sırasına göre sırala
      if (aRouteOrder !== bRouteOrder) {
        return aRouteOrder - bRouteOrder;
      }

      // Aynı rota sırasındaysa hiyerarşiye göre sırala
      const aHierarchy = aPlace?.locationHierarchy || 'il';
      const bHierarchy = bPlace?.locationHierarchy || 'il';

      const hierarchyOrder = { 'il': 1, 'ilçe': 2, 'mahalle': 3 };
      const aHOrder = hierarchyOrder[aHierarchy as keyof typeof hierarchyOrder] || 4;
      const bHOrder = hierarchyOrder[bHierarchy as keyof typeof hierarchyOrder] || 4;

      if (aHOrder !== bHOrder) {
        return aHOrder - bHOrder;
      }

      // Son olarak alfabetik sırala
      return (a || '').localeCompare(b || '');
    });

    console.log('✅ Final sorted order:', sortedLocations);

    return { grouped, routeOrder: sortedLocations };
  };

  const extractLocationFromName = (placeName: string): string | null => {
    const waypointsList = waypoints ? JSON.parse(waypoints as string) : [];
    const allLocations = [...waypointsList, destination].filter(Boolean);

    for (const location of allLocations) {
      if (placeName.includes(location as string)) {
        return location as string;
      }
    }
    return null;
  };

  const getCategoryName = (category: string) => {
    const categoryNames: { [key: string]: string } = {
      food: 'Yemek & İçecek',
      history: 'Tarih & Müze',
      art: 'Sanat & Kültür',
      adventure: 'Macera & Spor',
      nature: 'Doğa & Manzara',
      nightlife: 'Gece Hayatı'
    };
    return categoryNames[category] || category;
  };

  const getCategoryIcon = (category: string) => {
    const categoryIcons: { [key: string]: string } = {
      food: 'cutlery',
      history: 'institution',
      art: 'paint-brush',
      adventure: 'bicycle',
      nature: 'tree',
      nightlife: 'moon-o'
    };
    return categoryIcons[category] || 'star';
  };

  const handleRadiusChange = (newRadius: number) => {
    setSearchRadius(newRadius);
    setIsLoading(true);
    setLoadingText('Yeni mesafe ile öneriler yükleniyor...');
  };

  const formatLocationHierarchy = (address: string) => {
    // Address'i parse ederek il/ilçe/köy hiyerarşisini belirle
    const parts = address.split(',').map(part => part.trim());

    // Türkiye'deki il isimlerini kontrol et
    const turkishProvinces = [
      'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin',
      'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale',
      'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum',
      'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta', 'Mersin',
      'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir', 'Kocaeli',
      'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş',
      'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas',
      'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van', 'Yozgat', 'Zonguldak',
      'Aksaray', 'Bayburt', 'Karaman', 'Kırıkkale', 'Batman', 'Şırnak', 'Bartın', 'Ardahan',
      'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
    ];

    // İl merkezi mi kontrol et
    const isProvincialCenter = parts.some(part =>
      turkishProvinces.some(province =>
        part.toLowerCase().includes(province.toLowerCase() + ' merkez') ||
        part.toLowerCase() === province.toLowerCase()
      )
    );

    if (isProvincialCenter) {
      // İl merkezi ise sadece il ismini döndür
      const province = parts.find(part =>
        turkishProvinces.some(prov =>
          part.toLowerCase().includes(prov.toLowerCase())
        )
      );
      return province || parts[parts.length - 2] || address;
    } else {
      // İlçe/köy ise "İl > İlçe/Köy" formatında döndür
      const province = parts.find(part =>
        turkishProvinces.some(prov =>
          part.toLowerCase().includes(prov.toLowerCase())
        )
      );
      const district = parts[0]; // İlk part genelde ilçe/mahalle

      if (province && district && province !== district) {
        return `${province} > ${district}`;
      }
      return parts.slice(0, 2).join(' > ') || address;
    }
  };

  const selectedCount = places.filter(p => p.selected).length;
  const { grouped, routeOrder } = groupedByLocationAndCategory();

  // Loading ekranı göster
  if (isLoading) {
    return (
      <ImageBackground
        source={require('../../assets/images/loginbackground.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <StatusBar barStyle="light-content" />
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.loadingContainer}>
              <View style={styles.loadingContent}>
                <ActivityIndicator size="large" color="#E91E63" />
                <Text style={styles.loadingTitle}>Özel Tavsiyeleriniz Hazırlanıyor</Text>
                <Text style={styles.loadingSubtitle}>{loadingText}</Text>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </ImageBackground>
    );
  }

  // Öneri bulunamadıysa mesaj göster
  if (places.length === 0 && !isLoading) {
    return (
      <ImageBackground
        source={require('../../assets/images/loginbackground.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
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
              <Text style={styles.headerTitle}>Öneri Bulunamadı</Text>
              <View style={styles.placeholder} />
            </View>
            <View style={styles.loadingContainer}>
              <View style={styles.loadingContent}>
                <FontAwesome name="frown-o" size={60} color="#FFB800" style={styles.loadingIcon} />
                <Text style={styles.loadingTitle}>Sonuç Bulunamadı</Text>
                <Text style={styles.loadingSubtitle}>
                  Seçtiğiniz konum ve ilgi alanına uygun popüler bir yer bulamadık. Lütfen farklı bir seçim yapın.
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </ImageBackground>
    );
  }

  // Toplam öneri sayısını hesapla
  const getTotalRecommendationCount = () => {
    const interests = selectedInterests ? JSON.parse(selectedInterests as string) : [];
    const totalLocations = routeOrder.length;

    let placesPerLocation: number;
    if (totalLocations === 1) placesPerLocation = 10;
    else if (totalLocations === 2) placesPerLocation = 5;
    else if (totalLocations === 3) placesPerLocation = 5;
    else if (totalLocations === 4) placesPerLocation = 5;
    else placesPerLocation = 4;

    return totalLocations * interests.length * placesPerLocation;
  };

  const getLocationIcon = (location: string) => {
    const hierarchy = places.find(p =>
      p.locationDisplayName === location || p.sourceLocation === location
    )?.locationHierarchy || 'il';

    switch (hierarchy) {
      case 'il':
        return 'building'; // İl merkezi için bina ikonu
      case 'ilçe':
        return 'map-marker'; // İlçe için harita işareti
      case 'mahalle':
        return 'home'; // Mahalle için ev ikonu
      default:
        return 'map-marker';
    }
  };

  const getLocationDescription = (location: string, locationIndex: number, totalLocations: number) => {
    // Bu lokasyondaki toplam öneri sayısını hesapla
    const locationPlaces = places.filter(p =>
      p.locationDisplayName === location || p.sourceLocation === location
    );
    const totalPlacesForLocation = locationPlaces.length;

    // Lokasyonun hiyerarşi tipini belirle
    const hierarchy = locationPlaces[0]?.locationHierarchy || 'il';

    let hierarchyText = '';
    switch (hierarchy) {
      case 'il':
        hierarchyText = 'İl Merkezi';
        break;
      case 'ilçe':
        hierarchyText = 'İlçe';
        break;
      case 'mahalle':
        hierarchyText = 'Mahalle/Bölge';
        break;
      default:
        hierarchyText = 'Bölge';
    }

    return `${hierarchyText} - ${totalPlacesForLocation} öneri`;
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
            <Text style={styles.headerTitle}>Rota Önerileri</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Info Section */}
            <View style={styles.infoSection}>
              <Text style={styles.title}>Rota Güzergahı Boyunca Tavsiyeler</Text>
              <Text style={styles.subtitle}>
                {routeOrder.length} farklı şehirde toplam {places.length} özel öneri
              </Text>
            </View>

            {/* Distance Filter Slider */}
            <View style={styles.distanceSliderSection}>
              <View style={styles.sliderHeader}>
                <FontAwesome name="search" size={16} color="#fff" />
                <Text style={styles.sliderTitle}>Arama Mesafesi</Text>
                <Text style={styles.sliderValue}>{searchRadius} km</Text>
              </View>

              <View style={styles.sliderContainer}>
                <View style={styles.sliderTrack}>
                  <View style={styles.sliderBar} />
                  <View
                    style={[
                      styles.sliderProgress,
                      { width: `${searchRadius - 10}%` }
                    ]}
                  />
                  <View style={styles.sliderMarks}>
                    {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((value) => (
                      <TouchableOpacity
                        key={value}
                        style={[
                          styles.sliderMark,
                          searchRadius === value && styles.sliderMarkActive
                        ]}
                        onPress={() => handleRadiusChange(value)}
                      >
                        <FontAwesome
                          name="star"
                          size={16}
                          color={searchRadius >= value ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)'}
                          style={styles.sliderIcon}
                        />
                        <Text style={[
                          styles.sliderLabel,
                          searchRadius === value && styles.sliderLabelActive
                        ]}>
                          {value}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            {/* Route-based Locations */}
            {routeOrder.map((location, locationIndex) => (
              <View key={location as string} style={styles.locationSection}>
                {/* Location Header */}
                <View style={styles.locationHeader}>
                  <View style={styles.locationIconContainer}>
                    <FontAwesome
                      name={getLocationIcon(location || '') as any}
                      size={16}
                      color="#fff"
                    />
                  </View>
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationTitle}>{location || ''}</Text>
                    <Text style={styles.locationSubtitle}>
                      {getLocationDescription(location || '', locationIndex, routeOrder.length)}
                    </Text>
                  </View>
                  <View style={styles.locationRoute}>
                    <Text style={styles.routeStep}>{locationIndex + 1}</Text>
                  </View>
                </View>

                {/* Categories for this location */}
                {Object.entries(grouped[location as string] || {}).map(([category, categoryPlaces]) => {
                  // Puanlarına göre yüksekten alçağa sırala
                  const sortedPlaces = [...categoryPlaces].sort((a, b) => b.rating - a.rating);

                  return (
                    <View key={`${location}_${category}`} style={styles.categorySection}>
                      <View style={styles.categoryHeader}>
                        <FontAwesome name={getCategoryIcon(category) as any} size={18} color="#E91E63" />
                        <Text style={styles.categoryTitle}>{getCategoryName(category)}</Text>
                        <Text style={styles.categoryCount}>({sortedPlaces.length})</Text>
                      </View>

                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalScroll}
                      >
                        {sortedPlaces.map((place, index) => (
                          <TouchableOpacity
                            key={`${place.id}_${index}`}
                            style={[
                              styles.placeCard,
                              place.selected && styles.selectedPlaceCard
                            ]}
                            onPress={() => togglePlaceSelection(place.id)}
                            activeOpacity={0.6}
                            delayPressIn={0}
                            delayPressOut={0}
                          >
                            <ImageBackground
                              source={{ uri: place.imageUri }}
                              style={styles.placeImage}
                              imageStyle={styles.placeImageStyle}
                            >
                              <View style={styles.placeOverlay}>
                                {place.selected && (
                                  <View style={styles.checkContainer}>
                                    <FontAwesome name="check" size={16} color="#fff" />
                                  </View>
                                )}
                              </View>
                            </ImageBackground>

                            <View style={styles.placeInfo}>
                              <Text style={styles.placeName} numberOfLines={1}>{place.name}</Text>
                              <Text style={styles.placeAddress} numberOfLines={1}>
                                {place.locationDisplayName || formatLocationHierarchy(place.address)}
                              </Text>
                              <Text style={styles.placeDescription} numberOfLines={2}>{place.description}</Text>

                              <View style={styles.placeStats}>
                                <View style={styles.ratingContainer}>
                                  <FontAwesome name="star" size={14} color="#FFB800" />
                                  <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
                                </View>

                                <TouchableOpacity
                                  style={styles.detailButton}
                                  onPress={() => router.push({
                                    pathname: '/(app)/place-detail',
                                    params: { placeData: JSON.stringify(place) }
                                  })}
                                  activeOpacity={0.7}
                                  delayPressIn={0}
                                  delayPressOut={0}
                                >
                                  <Text style={styles.detailButtonText}>Detaylı İncele</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  );
                })}

                {/* Divider */}
                {locationIndex < routeOrder.length - 1 && (
                  <View style={styles.routeDivider}>
                    <View style={styles.dividerLine} />
                    <FontAwesome name="chevron-down" size={14} color="rgba(255,255,255,0.5)" />
                    <View style={styles.dividerLine} />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Complete Route Button */}
          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity
              style={[
                styles.completeButton,
                selectedCount === 0 && styles.disabledButton
              ]}
              onPress={handleCompleteRoute}
              disabled={selectedCount === 0}
            >
              <FontAwesome
                name="check-circle"
                size={20}
                color={selectedCount > 0 ? "#fff" : "#999"}
                style={styles.buttonIcon}
              />
              <Text style={[
                styles.completeButtonText,
                selectedCount === 0 && styles.disabledButtonText
              ]}>
                Rotayı Tamamla ({selectedCount})
              </Text>
              <FontAwesome
                name="chevron-right"
                size={18}
                color={selectedCount > 0 ? "#fff" : "#999"}
              />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  locationSection: {
    marginBottom: 30,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(233, 30, 99, 0.2)',
    marginBottom: 15,
  },
  locationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  locationSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  locationRoute: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeStep: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  routeDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  routeInfo: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  distanceSliderSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sliderTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginLeft: 10,
  },
  sliderValue: {
    color: '#E91E63',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'rgba(233, 30, 99, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sliderContainer: {
    paddingHorizontal: 5,
  },
  sliderTrack: {
    height: 50,
    position: 'relative',
  },
  sliderBar: {
    position: 'absolute',
    top: 13,
    height: 4,
    width: '90%',
    left: '5%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
  },
  sliderProgress: {
    position: 'absolute',
    top: 13,
    left: '5%',
    height: 4,
    backgroundColor: '#E91E63',
    borderRadius: 2,
    elevation: 2,
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  sliderMarks: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  sliderMark: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 5,
  },
  sliderIcon: {
    marginBottom: 4,
  },
  sliderDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sliderDotActive: {
    backgroundColor: '#fff',
    borderColor: '#E91E63',
    transform: [{ scale: 1.2 }],
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  sliderLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    fontWeight: '500',
  },
  sliderLabelActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sliderMarkActive: {
    transform: [{ scale: 1.1 }],
  },
  categorySection: {
    marginBottom: 25,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
    flex: 1,
  },
  categoryCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  horizontalScroll: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  placeCard: {
    width: width * 0.7,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    marginRight: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlaceCard: {
    borderColor: '#E91E63',
  },
  placeImage: {
    height: 140,
    justifyContent: 'flex-end',
  },
  placeImageStyle: {
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
  },
  placeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 10,
  },
  checkContainer: {
    backgroundColor: '#E91E63',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeInfo: {
    padding: 15,
  },
  placeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  placeAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  placeDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 18,
    marginBottom: 10,
  },
  placeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 5,
  },
  reviewText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 3,
  },
  priceContainer: {
    flexDirection: 'row',
  },
  detailButton: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  detailButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: 35,
  },
  completeButton: {
    backgroundColor: '#E91E63',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  buttonIcon: {
    marginRight: 10,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  disabledButtonText: {
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  loadingIcon: {
    marginBottom: 20,
    opacity: 0.9,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  loadingIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E91E63',
    marginHorizontal: 4,
    opacity: 0.4,
  },
  loadingDot2: {
    opacity: 0.7,
  },
  loadingDot3: {
    opacity: 1,
  },
  loadingNote: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});