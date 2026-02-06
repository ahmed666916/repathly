import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { t } from '../../services/api/i18n';

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

function CustomTabBar({ state, descriptors, navigation }: CustomTabBarProps) {
  const router = useRouter();

  const fabAction = () => {
    router.push('/(app)/add');
  };

  // Tab bar'ı tamamen kaldır
  return null;

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          if (route.name === 'add') {
            return (
              <View key={index} style={styles.fabPlaceholder} />
            );
          }

          const { options } = descriptors[route.key];
          const label = options.title !== undefined ? options.title : route.name;
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
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const Icon = ({ color }: { color: string }) => {
            let iconName;
            if (label === t('routing.home')) iconName = 'home';
            else if (label === t('routing.interests')) iconName = 'bell';
            else if (label === t('routing.favorites')) iconName = 'bookmark';
            else if (label === t('routing.map')) iconName = 'map-marked-alt';
            return <FontAwesome5 name={iconName} size={24} color={color} solid={isFocused} />;
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
            >
              <View style={isFocused ? styles.activeTab : null}>
                <Icon color={isFocused ? '#fff' : '#8A95A0'} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity onPress={fabAction} style={styles.fab}>
        <FontAwesome5 name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      backBehavior="history"
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('routing.home') }} />
      <Tabs.Screen name="interests" options={{ title: t('routing.interests') }} />
      <Tabs.Screen name="add" options={{ title: t('routing.add') }} />
      <Tabs.Screen name="favorites" options={{ title: t('routing.favorites') }} />
      <Tabs.Screen name="map" options={{ title: t('routing.map') }} />
      <Tabs.Screen
        name="recommendations"
        options={{
          title: t('routing.recommendations'),
          href: null, // Tab bar'da gösterme
        }}
      />
      <Tabs.Screen
        name="route-planner"
        options={{
          title: t('routing.routePlanner'),
          href: null, // Tab bar'da gösterme
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile.title'),
          href: null, // Tab bar'da gösterme
        }}
      />
      <Tabs.Screen
        name="user-profile"
        options={{
          title: t('profile.userProfile'),
          href: null, // Tab bar'da gösterme
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: t('chat.chats'),
          href: null, // Tab bar'da gösterme
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t('chat.chat'),
          href: null, // Tab bar'da gösterme
        }}
      />
      <Tabs.Screen
        name="route-preview"
        options={{
          title: t('routing.routePreview'),
          href: null, // Tab bar'da gösterme
        }}
      />
      <Tabs.Screen
        name="waypoints"
        options={{
          title: t('routing.waypoints'),
          href: null, // Tab bar'da gösterme
        }}
      />
      <Tabs.Screen
        name="fullscreen-map"
        options={{
          title: t('routing.fullscreenMap'),
          href: null, // Tab bar'da gösterme
        }}
      />
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
  activeTab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    top: 0,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#fff',
  },
  fabPlaceholder: {
    flex: 1,
  },
});