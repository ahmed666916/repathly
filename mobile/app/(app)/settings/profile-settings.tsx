import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Switch,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../../contexts/LanguageContext';

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [settings, setSettings] = useState({
    notifications: true,
    locationSharing: false,
    publicProfile: true,
    autoSync: true,
  });

  const handleBack = () => {
    router.back();
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const settingsOptions = [
    {
      title: t('settings.notifications'),
      subtitle: t('settings.notificationsDesc'),
      key: 'notifications' as keyof typeof settings,
      icon: 'bell',
    },
    {
      title: t('settings.locationSharing'),
      subtitle: t('settings.locationSharingDesc'),
      key: 'locationSharing' as keyof typeof settings,
      icon: 'map-marker-alt',
    },
    {
      title: t('settings.publicProfile'),
      subtitle: t('settings.publicProfileDesc'),
      key: 'publicProfile' as keyof typeof settings,
      icon: 'globe',
    },
    {
      title: t('settings.autoSync'),
      subtitle: t('settings.autoSyncDesc'),
      key: 'autoSync' as keyof typeof settings,
      icon: 'sync',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.profileSettings')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.settingsContainer}>
          {settingsOptions.map((option, index) => (
            <View key={index} style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <FontAwesome5 name={option.icon} size={20} color="#E91E63" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>{option.title}</Text>
                  <Text style={styles.settingSubtitle}>{option.subtitle}</Text>
                </View>
              </View>
              <Switch
                value={settings[option.key]}
                onValueChange={() => toggleSetting(option.key)}
                trackColor={{ false: '#E0E0E0', true: '#E91E63' }}
                thumbColor={settings[option.key] ? '#fff' : '#f4f3f4'}
              />
            </View>
          ))}

          <View style={styles.dangerZone}>
            <Text style={styles.dangerZoneTitle}>{t('settings.dangerZone')}</Text>
            <TouchableOpacity style={styles.dangerButton}>
              <FontAwesome5 name="trash" size={16} color="#FF4444" />
              <Text style={styles.dangerButtonText}>{t('settings.deleteAccount')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 35,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  settingsContainer: {
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  dangerZone: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  dangerZoneTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF4444',
    marginBottom: 15,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  dangerButtonText: {
    color: '#FF4444',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});
