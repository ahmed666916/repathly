import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as routesApi from '../../services/api/routes';
import { RouteListItem, routeModeLabels, routeStatusLabels } from '../../services/api/routes';
import * as secureStorage from '../../utils/secureStorage';
import { useLanguage } from '../../contexts/LanguageContext';

export default function SavedRoutesScreen() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [routes, setRoutes] = useState<RouteListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRoutes = useCallback(async () => {
    try {
      const token = await secureStorage.getToken();
      if (!token) {
        Alert.alert(t('common.error'), t('savedRoutes.sessionNotFound'));
        return;
      }

      const response = await routesApi.getRoutes(token);

      if (response.success && response.data) {
        setRoutes(response.data.routes);
      } else {
        Alert.alert(t('common.error'), response.message || t('savedRoutes.loadFailed'));
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      Alert.alert(t('common.error'), t('savedRoutes.loadError'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchRoutes();
  };

  const handleBack = () => {
    router.back();
  };

  const handleRoutePress = (uuid: string) => {
    // Navigate to route details/preview
    router.push({ pathname: '/(app)/route-preview', params: { uuid } });
  };

  const handleDeleteRoute = async (uuid: string) => {
    Alert.alert(
      t('savedRoutes.deleteTitle'),
      t('savedRoutes.deleteMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('savedRoutes.archive'),
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await secureStorage.getToken();
              if (!token) return;

              const response = await routesApi.deleteRoute(token, uuid);

              if (response.success) {
                setRoutes(prev => prev.filter(r => r.uuid !== uuid));
              } else {
                Alert.alert(t('common.error'), response.message);
              }
            } catch (error) {
              Alert.alert(t('common.error'), t('savedRoutes.deleteError'));
            }
          },
        },
      ]
    );
  };

  const formatDistance = (meters?: number | null): string => {
    if (!meters) return '-';
    if (meters < 1000) return `${meters}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatDuration = (minutes?: number | null): string => {
    if (!minutes) return '-';
    if (minutes < 60) return `${minutes}dk`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}s ${mins}dk` : `${hours}s`;
  };

  const getModeIcon = (mode: string): string => {
    switch (mode) {
      case 'pass_through':
        return 'bolt';
      case 'casual':
        return 'smile';
      case 'flexible':
        return 'compass';
      default:
        return 'route';
    }
  };

  const renderRoute = ({ item }: { item: RouteListItem }) => (
    <TouchableOpacity
      style={styles.routeCard}
      onPress={() => handleRoutePress(item.uuid)}
      onLongPress={() => handleDeleteRoute(item.uuid)}
    >
      <View style={styles.routeHeader}>
        <View style={styles.routeModeIcon}>
          <FontAwesome5
            name={getModeIcon(item.routeMode)}
            size={16}
            color="#E91E63"
          />
        </View>
        <View style={styles.routeInfo}>
          <Text style={styles.routeName} numberOfLines={1}>
            {item.name || t('savedRoutes.unnamed')}
          </Text>
          <Text style={styles.routeMode}>
            {(locale === 'tr' ? routeModeLabels[item.routeMode]?.tr : routeModeLabels[item.routeMode]?.en) || item.routeMode}
          </Text>
        </View>
        <View style={styles.routeStats}>
          <Text style={styles.statValue}>{formatDistance(item.totalDistanceMeters)}</Text>
          <Text style={styles.statLabel}>{t('savedRoutes.distance')}</Text>
        </View>
      </View>

      <View style={styles.routeDetails}>
        <View style={styles.locationRow}>
          <FontAwesome5 name="map-marker-alt" size={12} color="#22c55e" />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.originAddress}
          </Text>
        </View>
        <View style={styles.locationDots}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
        <View style={styles.locationRow}>
          <FontAwesome5 name="flag-checkered" size={12} color="#ef4444" />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.destinationAddress}
          </Text>
        </View>
      </View>

      <View style={styles.routeFooter}>
        <View style={styles.footerItem}>
          <FontAwesome5 name="clock" size={12} color="#666" />
          <Text style={styles.footerText}>{formatDuration(item.totalDurationMinutes)}</Text>
        </View>
        <View style={styles.footerItem}>
          <FontAwesome5 name="map-pin" size={12} color="#666" />
          <Text style={styles.footerText}>{item.stopsCount} {t('savedRoutes.stops')}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>
            {(locale === 'tr' ? routeStatusLabels[item.status]?.tr : routeStatusLabels[item.status]?.en) || item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return '#22c55e';
      case 'completed':
        return '#3b82f6';
      case 'generated':
        return '#E91E63';
      default:
        return '#999';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E91E63" />
          <Text style={styles.loadingText}>{t('savedRoutes.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('savedRoutes.title')}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      {routes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="route" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>{t('savedRoutes.empty')}</Text>
          <Text style={styles.emptyText}>{t('savedRoutes.emptyDesc')}</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/(app)/route-planner')}
          >
            <FontAwesome5 name="plus" size={16} color="#fff" />
            <Text style={styles.createButtonText}>{t('savedRoutes.createRoute')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={routes}
          keyExtractor={(item) => item.uuid}
          renderItem={renderRoute}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#E91E63']}
              tintColor="#E91E63"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 35,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  listContainer: {
    padding: 16,
  },
  routeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeModeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fce7f3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  routeMode: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  routeStats: {
    alignItems: 'flex-end',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
  },
  routeDetails: {
    paddingLeft: 8,
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  locationDots: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
    paddingVertical: 4,
    gap: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
  },
  routeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E91E63',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 24,
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
