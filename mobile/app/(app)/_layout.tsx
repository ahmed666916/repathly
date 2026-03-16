import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

function CustomTabBar({ state, descriptors, navigation }: CustomTabBarProps) {
  const { t } = useLanguage();

  const TAB_CONFIG: Record<string, { icon: string; label: () => string }> = {
    index:    { icon: 'route',  label: () => t('routing.newRoute') },
    interests:{ icon: 'search', label: () => t('routing.search') },
    profile:  { icon: 'user',   label: () => t('profile.title') },
  };

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const config = TAB_CONFIG[route.name];
          if (!config) return null;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
            >
              <View style={isFocused ? styles.activeTabPill : styles.inactiveTab}>
                <FontAwesome5
                  name={config.icon}
                  size={18}
                  color={isFocused ? '#fff' : '#8A95A0'}
                  solid={isFocused}
                />
                {isFocused && (
                  <Text style={styles.activeTabLabel}>{config.label()}</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      backBehavior="history"
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {/* Visible bottom tabs */}
      <Tabs.Screen name="index"     options={{ title: 'New Route' }} />
      <Tabs.Screen name="interests" options={{ title: 'Search' }} />
      <Tabs.Screen name="profile"   options={{ title: 'Profile' }} />

      {/* Hidden — navigable but not in tab bar */}
      <Tabs.Screen name="add"           options={{ href: null }} />
      <Tabs.Screen name="saved-routes"  options={{ href: null }} />
      <Tabs.Screen name="map"           options={{ href: null }} />
      <Tabs.Screen name="favorites"     options={{ href: null }} />
      <Tabs.Screen name="settings"      options={{ href: null }} />
      <Tabs.Screen name="recommendations" options={{ href: null }} />
      <Tabs.Screen name="route-planner"  options={{ href: null }} />
      <Tabs.Screen name="route-settings" options={{ href: null }} />
      <Tabs.Screen name="user-profile"  options={{ href: null }} />
      <Tabs.Screen name="chats"         options={{ href: null }} />
      <Tabs.Screen name="chat"          options={{ href: null }} />
      <Tabs.Screen name="route-preview" options={{ href: null }} />
      <Tabs.Screen name="waypoints"     options={{ href: null }} />
      <Tabs.Screen name="fullscreen-map" options={{ href: null }} />
      <Tabs.Screen name="place-detail"  options={{ href: null }} />
      <Tabs.Screen name="following"     options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    height: 65,
    borderRadius: 35,
    backgroundColor: '#2D3E50',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  activeTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
  },
  inactiveTab: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  activeTabLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
