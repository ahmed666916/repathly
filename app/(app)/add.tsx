import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/Themed';

export default function AddScreen() {
  return (
    <View style={styles.container}>
      <ThemedText type="title">Ekle</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});