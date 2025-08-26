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
}

export default function RecommendationsScreen() {
  const router = useRouter();
  const { selectedInterests, destination, waypoints } = useLocalSearchParams();
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('Öneriler yükleniyor...');

  useEffect(() => {
    generateLocationBasedRecommendations();
  }, [selectedInterests, destination, waypoints]);

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

  const fetchGooglePlaces = async (location: string, interest: string): Promise<Place[]> => {
    const apiKey = 'AIzaSyD20dEgYCXYcs-C4uGDMUTSvSbdxYDuk5o';
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
    for (const query of config.textQueries) {
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${coords.lat},${coords.lng}&radius=50000&key=${apiKey}&language=tr`;
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
             const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coords.lat},${coords.lng}&radius=50000&type=${type}&key=${apiKey}&language=tr`;
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
    
    // İlgi alanına göre dinamik mesafe eşiği (km)
    const interestRadiusKm: Record<string, number> = {
        nature: 80,
        adventure: 70,
        history: 50,
        art: 40,
        food: 30,
        nightlife: 30,
    };
    const radiusKm = interestRadiusKm[interest] ?? 50;

    // Coğrafi mesafe filtresi: şehir merkezi çevresinde kal
    const distanceFilteredPlaces = uniquePlaces.filter((p: any) => {
        const loc = p.geometry?.location;
        if (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number') return false;
        const d = distanceKm(coords.lat, coords.lng, loc.lat, loc.lng);
        return d <= radiusKm;
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


    // Get detailed place information to ensure consistent ratings
    const detailedPlaces = await Promise.all(
        finalPlaces.slice(0, targetCount).map(async (place: any) => {
            try {
                const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=rating,user_ratings_total,name,formatted_address,photos&key=${apiKey}&language=tr`;
                const response = await fetch(detailsUrl);
                const data = await response.json();
                
                if (data.status === 'OK' && data.result) {
                    const result = data.result;
                    return {
                        id: place.place_id,
                        name: result.name || place.name,
                        category: interest,
                        rating: result.rating || place.rating || 0,
                        reviewCount: result.user_ratings_total || place.user_ratings_total || 0,
                        description: (place.types || []).join(', ').replace(/_/g, ' '),
                        imageUri: result.photos?.[0]
                            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${result.photos[0].photo_reference}&key=${apiKey}`
                            : place.photos?.[0]
                            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${apiKey}`
                            : getDefaultImageForCategory(interest),
                        address: result.formatted_address || place.vicinity || 'Adres bilgisi yok',
                        priceLevel: place.price_level || 1,
                        selected: false,
                        googlePlaceId: place.place_id,
                        location: place.geometry?.location,
                        vicinity: place.vicinity,
                        sourceLocation: location
                    };
                }
            } catch (error) {
                console.error('Error fetching place details:', error);
            }
            
            // Fallback to original data
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
        })
    );

    return detailedPlaces;
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
    setLoadingText('Öneriler yükleniyor...');
    
    const interests = selectedInterests ? JSON.parse(selectedInterests as string) : [];
    const waypointsList = waypoints ? JSON.parse(waypoints as string) : [];
    
    // Rota sırası: İstanbul (başlangıç) → ara noktalar → hedef (son)
    const routeOrder = [];
    
    // Ara noktalar varsa önce onlar
    if (waypointsList && waypointsList.length > 0) {
      routeOrder.push(...waypointsList);
    }
    
    // Son olarak hedef
    if (destination) {
      routeOrder.push(destination);
    }
    
    // Google Places API'den gerçek yerler al
    const realPlaces: Place[] = [];
    let totalExpected = routeOrder.length * interests.length;
    let currentProgress = 0;
    
    for (const location of routeOrder) {
      for (const interest of interests) {
        currentProgress++;
        setLoadingText(`${location} için ${getCategoryName(interest)} yerleri aranıyor... (${currentProgress}/${totalExpected})`);
        
        try {
          const placesForLocation = await fetchGooglePlaces(location as string, interest);
          // Güvenli ekleme: sadece bu lokasyon için üretilmiş öneriler
          const safePlaces = placesForLocation.filter(p => p.sourceLocation === (location as string));
          realPlaces.push(...safePlaces);
        } catch (error) {
          console.error(`Error fetching places for ${location}, ${interest}:`, error);
          // Hata durumunda mock data kullan
          const mockPlaces = generatePlacesForLocationAndInterest(
            location as string, 
            interest, 
            routeOrder.indexOf(location), 
            routeOrder.length
          );
          realPlaces.push(...mockPlaces);
        }
        
        // Kısa bir bekleme süresi ekle (API rate limiting için)
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    setPlaces(realPlaces);
    if (realPlaces.length === 0) {
        setLoadingText('Bu kategori ve konum için popüler yer bulunamadı.');
        // Hata durumunda 3 saniye sonra ekranı kapatmaması için isLoading'i false yap ama boş ekran göster
        setTimeout(() => {
             setIsLoading(false);
        }, 3000);
    } else {
        setIsLoading(false);
    }
  };

  const generatePlacesForLocationAndInterest = (location: string, interest: string, locationIndex: number, totalLocations: number): Place[] => {
    const places: Place[] = [];
    
    // Her kategori ve şehir için minimum 10 öneri garanti et
    const placesPerLocation = 10;
    
    // Belirlenen sayıda yer oluştur
    for (let i = 1; i <= placesPerLocation; i++) {
      const place = createPlaceForInterest(location, interest, i, locationIndex);
      places.push(place);
    }
    
    return places;
  };

  const createPlaceForInterest = (location: string, interest: string, index: number, locationIndex: number): Place => {
    // Şehir-bazlı gerçek yerler
    const realPlacesByCity = {
      'Afyon': {
        food: [
          'Afyon Kebap Evi', 'İkbal Lokantası', 'Sandal Bedesteni Restaurant', 'Öz Afyon Mutfağı', 
          'Tarihi Afyon Lokantası', 'Sultan Sofrası', 'Thermal Restoran', 'Mevlana Restaurant',
          'Paşa Konağı', 'Afyon Lezzet Durağı', 'Kaymak Evi', 'Pide Palace'
        ],
        history: [
          'Afyonkarahisar Kalesi', 'Afyon Müzesi', 'Gedik Ahmet Paşa Camii', 'Mevlevihane Camii',
          'Ulu Camii', 'İmaret Camii', 'Afyon Arkeoloji Müzesi', 'Sandıklı Apollon Tapınağı',
          'Roma Hamamları', 'Frigler Vadisi', 'Frig Yazıtları', 'Ayazini Köyü'
        ]
      },
      'Konya': {
        food: [
          'Konya Mutfağı', 'Mevlana Restaurant', 'Şems-i Tebrizi Lokantası', 'Tiritçi Mithat',
          'Konya Etli Ekmek', 'Hacı Şükrü Usta', 'Sultan Sofrası', 'Rumi Restaurant',
          'Selçuklu Lokantası', 'Karatay Restoran', 'Sille Restaurant', 'Gevrek Restaurant'
        ],
        history: [
          'Mevlana Türbesi', 'Karatay Medresesi', 'İnce Minareli Medrese', 'Konya Kalesi',
          'Alaeddin Camii', 'Sahip Ata Külliyesi', 'Sırçalı Medrese', 'İplikçi Camii',
          'Selimiye Camii', 'Konya Arkeoloji Müzesi', 'Sille Köyü', 'Çatalhöyük'
        ]
      },
      'Antalya': {
        food: [
          'Vanilla Lounge', 'Seraser Fine Dining', 'Kaleiçi Restaurant', 'Arma Restaurant',
          'Club Arma', 'Hasanağa Bahçesi', 'Pasa Bey Kebap', 'Big Yellow Taxi Benzin Cafe',
          'Rokka Restaurant', 'Castle Cafe', 'Parlak Restaurant', 'Antalya Balık Evi'
        ],
        history: [
          'Kaleiçi', 'Hadrian Kapısı', 'Yivli Minare', 'Antalya Müzesi',
          'Hidırlık Kulesi', 'Kesik Minare', 'Karatay Medresesi', 'Saat Kulesi',
          'Perge Antik Kenti', 'Aspendos Antik Tiyatrosu', 'Termessos', 'Side Antik Kenti'
        ]
      }
    };

    // Genel template sistemi
    const placeTemplates = {
      food: [
        { prefix: 'Lezzetli', suffix: 'Restoran', desc: 'Geleneksel ve modern mutfağın buluştuğu nokta' },
        { prefix: 'Meşhur', suffix: 'Lokantası', desc: 'Şehrin en sevilen lezzetleri' },
        { prefix: 'Gurme', suffix: 'Bistro', desc: 'Özel tarifler ve benzersiz tatlar' },
        { prefix: 'Tarihi', suffix: 'Meyhanesi', desc: 'Asırlık geleneksel lezzetler' },
        { prefix: 'Modern', suffix: 'Kitchen', desc: 'Çağdaş gastronomi deneyimi' }
      ],
      history: [
        { prefix: 'Tarihi', suffix: 'Müzesi', desc: 'Geçmişin izlerini keşfedin' },
        { prefix: 'Antik', suffix: 'Kalıntıları', desc: 'Asırlık tarihi yapılar' },
        { prefix: 'Osmanlı', suffix: 'Eserleri', desc: 'İmparatorluk mirasını görün' },
        { prefix: 'Arkeolojik', suffix: 'Alanı', desc: 'Kazılarla ortaya çıkan tarih' },
        { prefix: 'Kültür', suffix: 'Merkezi', desc: 'Yaşayan tarih ve kültür' }
      ],
      art: [
        { prefix: 'Sanat', suffix: 'Galerisi', desc: 'Çağdaş sanat eserleri' },
        { prefix: 'Kültür', suffix: 'Merkezi', desc: 'Sanat ve kültür buluşması' },
        { prefix: 'Modern', suffix: 'Müzesi', desc: 'Çağdaş sanatın kalbi' },
        { prefix: 'Sergi', suffix: 'Salonu', desc: 'Dönemsel sanat sergileri' },
        { prefix: 'Atölye', suffix: 'Evi', desc: 'Sanatçıların yaratım alanı' }
      ],
      adventure: [
        { prefix: 'Macera', suffix: 'Parkı', desc: 'Adrenalin dolu aktiviteler' },
        { prefix: 'Spor', suffix: 'Kompleksi', desc: 'Her türlü spor imkanı' },
        { prefix: 'Doğa', suffix: 'Sporları', desc: 'Açık havada heyecan' },
        { prefix: 'Ekstrem', suffix: 'Merkezi', desc: 'Sınırlarınızı zorlayın' },
        { prefix: 'Aktivite', suffix: 'Alanı', desc: 'Aktif yaşam deneyimi' }
      ],
      nature: [
        { prefix: 'Doğa', suffix: 'Parkı', desc: 'Yeşilin ve havanın tadını çıkarın' },
        { prefix: 'Botanik', suffix: 'Bahçesi', desc: 'Binlerce bitki türü' },
        { prefix: 'Manzara', suffix: 'Tepesi', desc: 'Nefes kesen manzaralar' },
        { prefix: 'Mesire', suffix: 'Alanı', desc: 'Piknik ve dinlence' },
        { prefix: 'Orman', suffix: 'Yürüyüşü', desc: 'Doğayla iç içe yürüyüş' }
      ],
      nightlife: [
        { prefix: 'Trendy', suffix: 'Bar', desc: 'Şehrin en popüler gece mekanı' },
        { prefix: 'Rooftop', suffix: 'Lounge', desc: 'Manzaralı gece eğlencesi' },
        { prefix: 'Jazz', suffix: 'Club', desc: 'Canlı müzik ve dans' },
        { prefix: 'Cocktail', suffix: 'Bar', desc: 'Özel kokteyl tarifleri' },
        { prefix: 'Live', suffix: 'Music', desc: 'Canlı müzik performansları' }
      ]
    };

    // Önce gerçek yerlerden kontrol et
    const cityPlaces = realPlacesByCity[location as keyof typeof realPlacesByCity];
    const realPlaces = cityPlaces?.[interest as keyof typeof cityPlaces] as string[];
    
    let placeName: string;
    let placeDesc: string;
    
    if (realPlaces && realPlaces.length > 0 && index <= realPlaces.length) {
      // Gerçek yer kullan
      placeName = realPlaces[(index - 1) % realPlaces.length];
      placeDesc = `${location}'da gezilmesi gereken popüler ${getCategoryName(interest)} mekanı`;
        } else {
      // Template kullan
      const templates = placeTemplates[interest as keyof typeof placeTemplates] || placeTemplates.food;
      const template = templates[(index - 1) % templates.length];
      placeName = `${location} ${template.prefix} ${template.suffix}`;
      placeDesc = template.desc;
    }
    
    const images = {
      food: [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop'
      ],
      history: [
        'https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'
      ],
      art: [
        'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1574270185629-9e1b9d8fd72f?w=400&h=300&fit=crop'
      ],
      adventure: [
        'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1571019613914-85e0c0e24465?w=400&h=300&fit=crop'
      ],
      nature: [
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=400&h=300&fit=crop'
      ],
      nightlife: [
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=400&h=300&fit=crop'
      ]
    };

    const imageSet = images[interest as keyof typeof images] || images.food;
    
    return {
      id: `${interest}_${location}_${index}_${locationIndex}`,
      name: placeName,
      category: interest,
      rating: 4.0 + Math.random() * 1.0, // 4.0 - 5.0 arası
      reviewCount: Math.floor(Math.random() * 500) + 50, // 50-550 arası
      description: placeDesc,
      imageUri: imageSet[index % imageSet.length],
      address: `${location} yakınları`,
      priceLevel: Math.floor(Math.random() * 4) + 1, // 1-4 arası
      selected: false
    };
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

  // Önerileri önce lokasyona, sonra kategoriye göre grupla
  const groupedByLocationAndCategory = () => {
    const waypointsList = waypoints ? JSON.parse(waypoints as string) : [];
    const routeOrder = [...waypointsList];
    if (destination) routeOrder.push(destination);
    
    const grouped: { [location: string]: { [category: string]: Place[] } } = {};
    
    // Her lokasyon için grup oluştur
    routeOrder.forEach(location => {
      grouped[location as string] = {};
    });
    
    // Yerleri lokasyon ve kategoriye göre grupla
    places.forEach(place => {
      const preferredLocation = (place.sourceLocation && grouped[place.sourceLocation])
        ? place.sourceLocation
        : extractLocationFromName(place.name || '');

      if (preferredLocation && grouped[preferredLocation]) {
        if (!grouped[preferredLocation][place.category]) {
          grouped[preferredLocation][place.category] = [];
        }
        grouped[preferredLocation][place.category].push(place);
      }
    });
    
    return { grouped, routeOrder };
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

  const getLocationIcon = (index: number, total: number) => {
    if (index === 0) return 'play'; // İlk durak
    if (index === total - 1) return 'flag-checkered'; // Son durak
    return 'map-marker'; // Ara duraklar
  };

  const getLocationDescription = (locationIndex: number, totalLocations: number) => {
    const placesPerLocation = totalLocations === 1 ? 10 : 
                             totalLocations <= 4 ? 5 : 4;
    const interests = selectedInterests ? JSON.parse(selectedInterests as string) : [];
    const totalPlacesForLocation = placesPerLocation * interests.length;
    
    if (locationIndex === 0 && totalLocations > 1) {
      return `İlk durak - ${totalPlacesForLocation} öneri`;
    } else if (locationIndex === totalLocations - 1 && totalLocations > 1) {
      return `Son durak - ${totalPlacesForLocation} öneri`;
    } else if (totalLocations === 1) {
      return `Hedef nokta - ${totalPlacesForLocation} öneri`;
    } else {
      return `${locationIndex + 1}. durak - ${totalPlacesForLocation} öneri`;
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
              <Text style={styles.title}>Rota Sırasına Göre Tavsiyeler</Text>
              <Text style={styles.subtitle}>
                {routeOrder.length} durakta toplam {getTotalRecommendationCount()} özel öneri
              </Text>
              <Text style={styles.routeInfo}>
                {routeOrder.length === 1 ? 'Hedef başına 10 öneri' :
                 routeOrder.length <= 4 ? 'Her durak için 5 öneri' : 'Her durak için 4 öneri'}
              </Text>
            </View>

            {/* Route-based Locations */}
            {routeOrder.map((location, locationIndex) => (
              <View key={location as string} style={styles.locationSection}>
                {/* Location Header */}
                <View style={styles.locationHeader}>
                  <View style={styles.locationIconContainer}>
                    <FontAwesome 
                      name={getLocationIcon(locationIndex, routeOrder.length) as any} 
                      size={16} 
                      color="#fff" 
                    />
                  </View>
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationTitle}>{location}</Text>
                    <Text style={styles.locationSubtitle}>
                      {getLocationDescription(locationIndex, routeOrder.length)}
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
                            activeOpacity={0.8}
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
                              <Text style={styles.placeAddress} numberOfLines={1}>{place.address}</Text>
                              <Text style={styles.placeDescription} numberOfLines={2}>{place.description}</Text>
                              
                  <View style={styles.placeStats}>
                    <View style={styles.ratingContainer}>
                                  <FontAwesome name="star" size={14} color="#FFB800" />
                                  <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
                                  <Text style={styles.reviewText}>({place.reviewCount})</Text>
                    </View>
                                
                                <TouchableOpacity 
                                  style={styles.detailButton}
                                  onPress={() => router.push({
                                    pathname: '/(app)/place-detail',
                                    params: { placeData: JSON.stringify(place) }
                                  })}
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