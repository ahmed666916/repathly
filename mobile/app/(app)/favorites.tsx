import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

const FavoritesRoute = () => (
  <View style={[styles.scene, { backgroundColor: 'white' }]}>
    <Text>Favorilerim</Text>
  </View>
);

const HistoryRoute = () => (
  <View style={[styles.scene, { backgroundColor: 'white' }]}>
    <Text>Geçmiş</Text>
  </View>
);

const initialLayout = { width: Dimensions.get('window').width };

export default function FavoritesScreen() {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'favorites', title: 'Favorilerim' },
    { key: 'history', title: 'Geçmiş' },
  ]);

  const renderScene = SceneMap({
    favorites: FavoritesRoute,
    history: HistoryRoute,
  });

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={initialLayout}
      renderTabBar={props => (
        <TabBar
          {...props}
          style={{ backgroundColor: 'white' }}
          indicatorStyle={{ backgroundColor: 'black' }}
          activeColor="black"
          inactiveColor="black"
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  scene: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
