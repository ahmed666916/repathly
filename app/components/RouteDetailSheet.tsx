import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

interface RouteDetailSheetProps {
  routeData?: {
    placeName: string;
    placeAddress: string;
    routes: Array<{
      mode: string;
      duration: string;
      distance: string;
      durationValue: number;
    }>;
  };
  onClose?: () => void;
}

export default function RouteDetailSheet({ routeData, onClose }: RouteDetailSheetProps) {
  const [selectedTransport, setSelectedTransport] = useState('car');

  // İkon eşleştirmesi
  const getIconName = (mode: string) => {
    switch (mode) {
      case 'car': return 'car';
      case 'bus': return 'bus';
      case 'bike': return 'bicycle';
      case 'walk': return 'walking';
      default: return 'car';
    }
  };

  // Türkçe mod isimleri
  const getModeDisplayName = (mode: string) => {
    switch (mode) {
      case 'car': return 'Araba';
      case 'bus': return 'Toplu Taşıma';
      case 'bike': return 'Bisiklet';
      case 'walk': return 'Yürüyüş';
      default: return 'Araba';
    }
  };

  if (!routeData) {
    return null;
  }

  return (
    <View style={styles.sheetContainer}>
      <View style={styles.handleBar} />
      
      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <FontAwesome5 name="times" size={20} color="#666" />
        </TouchableOpacity>
      )}
      
      <View style={styles.locationInfoContainer}>
        <View style={styles.locationRow}>
          <FontAwesome5 name="circle" size={16} color="#4CAF50" solid style={styles.locationIcon} />
          <Text style={styles.locationText}>Mevcut Konumunuz</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.locationRow}>
          <FontAwesome5 name="map-marker-alt" size={16} color="#F44336" style={styles.locationIcon} />
          <Text style={styles.locationText} numberOfLines={1} ellipsizeMode="tail">
            {routeData.placeName}
          </Text>
        </View>
        <Text style={styles.placeAddress} numberOfLines={1} ellipsizeMode="tail">
          {routeData.placeAddress}
        </Text>
      </View>

      <View style={styles.transportOptionsContainer}>
        {routeData.routes.map((route, index) => (
          <TouchableOpacity
            key={route.mode}
            style={[
              styles.transportButton,
              selectedTransport === route.mode && styles.selectedTransportButton,
            ]}
            onPress={() => setSelectedTransport(route.mode)}
          >
            <FontAwesome5
              name={getIconName(route.mode)}
              size={24}
              color={selectedTransport === route.mode ? '#fff' : '#333'}
            />
            <Text
              style={[
                styles.transportTime,
                selectedTransport === route.mode && styles.selectedTransportTime,
              ]}
            >
              {route.duration}
            </Text>
            <Text
              style={[
                styles.transportDistance,
                selectedTransport === route.mode && styles.selectedTransportTime,
              ]}
            >
              {route.distance}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.goButton}>
        <Text style={styles.goButtonText}>Şimdi Git</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 5,
    backgroundColor: '#ddd',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 15,
  },
  locationInfoContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  locationIcon: {
    marginRight: 15,
  },
  locationText: {
    fontSize: 16,
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 5,
  },
  swapButton: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -8 }],
  },
  transportOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  transportButton: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#eee',
    marginHorizontal: 5,
  },
  selectedTransportButton: {
    backgroundColor: '#2E3B55', // Dark Slate Blue from design
    borderColor: '#2E3B55',
  },
  transportTime: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  selectedTransportTime: {
    color: '#fff',
  },
  transportDistance: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 20,
    zIndex: 1,
    padding: 5,
  },
  placeAddress: {
    fontSize: 14,
    color: '#666',
    marginLeft: 31,
    marginTop: 5,
  },
  goButton: {
    backgroundColor: '#10B981', // Emerald Green from design
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  goButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});