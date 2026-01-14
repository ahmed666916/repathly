import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { Alert } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider } from './contexts/AuthContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(auth)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const [locationReady, setLocationReady] = useState(false);

  // Set global Google Maps API key from expo config immediately (do not wait for location)
  useEffect(() => {
    try {
      const expoApiKey = (Constants as any).expoConfig?.android?.config?.googleMaps?.apiKey || (Constants as any).manifest?.android?.config?.googleMaps?.apiKey;
      if (expoApiKey) {
        (global as any).googleMapsApiKey = expoApiKey;
        console.log('Global googleMapsApiKey set from expo config (early)');
      } else {
        console.warn('No googleMapsApiKey found in expo config');
      }
    } catch (e) {
      console.warn('Unable to set global googleMapsApiKey from expo config', e);
    }
  }, []);

  // Konum izni ve konum alma
  useEffect(() => {
    const requestLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Konum İzni Reddedildi', 'Uygulamanın özelliklerini tam olarak kullanabilmek için konum izni gereklidir.');
          (global as any).userLocation = null; // Konum yoksa null olarak ayarla
          return;
        }

        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        // Global değişkene konumu ata
        (global as any).userLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
        };
        console.log('Kullanıcı konumu global olarak ayarlandı:', (global as any).userLocation);

      } catch (err) {
        console.warn('Konum alınamadı:', err);
        Alert.alert('Konum Hatası', 'Konumunuz alınırken bir hata oluştu.');
        (global as any).userLocation = null;
      } finally {
        setLocationReady(true); // Konum işlemi tamamlandı
      }
    };

    requestLocation();
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && locationReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, locationReady]);

  if (!loaded || !locationReady) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}

