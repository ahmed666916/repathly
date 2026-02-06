import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  Alert,
  FlatList,
  ScrollView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import ProfileButton from '../../components/ProfileButton';
import GOOGLE_MAPS_KEY from '../../constants/googleMapsKey';
import { t } from '../../services/api/i18n';

interface PlaceSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export default function HomeScreen() {
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Sayfa focus olduğunda reset kontrolü
  useFocusEffect(
    useCallback(() => {
      if ((global as any).shouldResetInputs) {
        setDestination('');
        (global as any).shouldResetInputs = false;
      }
    }, [])
  );

  const handleContinue = () => {
    if (!destination.trim()) {
      Alert.alert(t('common.error'), t('routing.enterDestination'));
      return;
    }

    // Global'e kaydet
    (global as any).routeDestination = destination.trim();

    // Ara nokta sayfasına git
    router.push({
      pathname: '/(app)/waypoints',
      params: { destination: destination.trim() }
    });
  };

  const handleProfilePress = () => {
    router.push('/(app)/profile');
  };

  const capitalizeText = (text: string) => {
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const fetchPlaceSuggestions = async (input: string) => {
    if (input.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const apiKey = (global as any).googleMapsApiKey || GOOGLE_MAPS_KEY;
      console.log('Fetching suggestions for:', input);

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}&language=tr&components=country:tr`
      );
      const data = await response.json();

      console.log('API Response:', data);

      if (data.status === 'OK' && data.predictions) {
        console.log('Setting suggestions:', data.predictions.slice(0, 5));
        setSuggestions(data.predictions.slice(0, 5));
        setShowSuggestions(true);
      } else {
        console.log('No predictions or error:', data.status);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (suggestion: PlaceSuggestion) => {
    setDestination(suggestion.structured_formatting.main_text);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleDestinationChange = (text: string) => {
    setDestination(text);

    // Fetch suggestions immediately for better UX
    if (text.length >= 1) {
      fetchPlaceSuggestions(text);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/loginbackground.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />

        {/* Profile Button */}
        <View style={styles.profileButtonContainer}>
          <ProfileButton
            onPress={handleProfilePress}
            userName={t('profile.user')}
            authProvider="google"
          />
        </View>

        <View style={styles.content}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>{t('home.welcome')}</Text>
            <Text style={styles.welcomeSubtitle}>
              {t('home.startExploring')}
            </Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>{t('home.whereTo')}</Text>
            <View style={styles.inputContainer}>
              <FontAwesome name="map-marker" size={20} color="#E91E63" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder={t('home.destinationPlaceholder')}
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                value={destination}
                onChangeText={handleDestinationChange}
                returnKeyType="done"
                onSubmitEditing={handleContinue}
                autoCorrect={false}
                autoCapitalize="words"
                keyboardType="default"
                textContentType="location"
                multiline={false}
                spellCheck={false}
                importantForAutofill="no"
              />
            </View>

            {/* Suggestions List */}
            {showSuggestions && suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <ScrollView
                  style={styles.suggestionsScrollView}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                >
                  {suggestions.map((item) => (
                    <TouchableOpacity
                      key={item.place_id}
                      style={styles.suggestionItem}
                      onPress={() => handleSuggestionSelect(item)}
                    >
                      <FontAwesome name="map-marker" size={16} color="#E91E63" style={styles.suggestionIcon} />
                      <View style={styles.suggestionText}>
                        <Text style={styles.suggestionMain} numberOfLines={1} ellipsizeMode="tail">
                          {item.structured_formatting.main_text}
                        </Text>
                        <Text style={styles.suggestionSecondary} numberOfLines={2} ellipsizeMode="tail">
                          {item.structured_formatting.secondary_text}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.continueButton, !destination.trim() && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={!destination.trim()}
          >
            <Text style={styles.continueButtonText}>{t('common.next')}</Text>
            <FontAwesome name="arrow-right" size={20} color="#fff" />
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
  profileButtonContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  inputSection: {
    marginBottom: 40,
  },
  inputLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 15,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  inputIcon: {
    marginRight: 15,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
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
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  suggestionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  suggestionIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  suggestionText: {
    flex: 1,
    minWidth: 0,
  },
  suggestionMain: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  suggestionSecondary: {
    fontSize: 14,
    color: '#666',
    flexWrap: 'wrap',
    lineHeight: 18,
  },
  suggestionsScrollView: {
    maxHeight: 200,
  },
});
