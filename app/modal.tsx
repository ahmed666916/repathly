import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Text, View } from '@/components/Themed';

interface RecommendedPlace {
  id: string;
  name: string;
  category: string;
  rating: number;
  distance: string;
  description: string;
  image: string;
}

export default function RecommendationsScreen() {
  const [recommendations] = useState<RecommendedPlace[]>([
    {
      id: '1',
      name: 'Galata Kulesi',
      category: 'Tarih & Kültür',
      rating: 4.5,
      distance: '2.3 km',
      description: 'İstanbul\'un en ünlü simge yapılarından biri.',
      image: '🏛️'
    },
    {
      id: '2',
      name: 'Karaköy Lokantası',
      category: 'Yemek & İçecek',
      rating: 4.8,
      distance: '1.8 km',
      description: 'Geleneksel Türk mutfağının modern yorumu.',
      image: '🍽️'
    },
    {
      id: '3',
      name: 'Emirgan Korusu',
      category: 'Doğa & Manzara',
      rating: 4.6,
      distance: '5.2 km',
      description: 'Boğaz manzaralı muhteşem park alanı.',
      image: '🌿'
    },
    {
      id: '4',
      name: 'İstiklal Caddesi',
      category: 'Alışveriş',
      rating: 4.4,
      distance: '1.5 km',
      description: 'Şehrin kalbi, alışveriş ve eğlence merkezi.',
      image: '🛍️'
    }
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Önerileri</Text>
      <Text style={styles.subtitle}>Size özel seçilmiş yerler</Text>
      
      <ScrollView style={styles.scrollView}>
        {recommendations.map((place) => (
          <TouchableOpacity key={place.id} style={styles.placeCard}>
            <View style={styles.placeHeader}>
              <Text style={styles.placeIcon}>{place.image}</Text>
              <View style={styles.placeInfo}>
                <Text style={styles.placeName}>{place.name}</Text>
                <Text style={styles.placeCategory}>{place.category}</Text>
              </View>
              <View style={styles.placeStats}>
                <Text style={styles.rating}>⭐ {place.rating}</Text>
                <Text style={styles.distance}>{place.distance}</Text>
              </View>
            </View>
            <Text style={styles.placeDescription}>{place.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  placeCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  placeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  placeIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  placeCategory: {
    fontSize: 14,
    color: '#666',
  },
  placeStats: {
    alignItems: 'flex-end',
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  distance: {
    fontSize: 12,
    color: '#999',
  },
  placeDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});
