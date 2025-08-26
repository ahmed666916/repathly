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

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const [privacySettings, setPrivacySettings] = useState({
    dataCollection: false,
    analytics: true,
    crashReports: true,
    locationHistory: false,
    personalizedAds: false,
  });

  const handleBack = () => {
    router.back();
  };

  const toggleSetting = (key: keyof typeof privacySettings) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const privacyOptions = [
    {
      title: 'Veri Toplama',
      subtitle: 'Kişisel verilerinin toplanmasına izin ver',
      key: 'dataCollection' as keyof typeof privacySettings,
      icon: 'database',
    },
    {
      title: 'Analitik Veriler',
      subtitle: 'Uygulama kullanım verilerini paylaş',
      key: 'analytics' as keyof typeof privacySettings,
      icon: 'chart-bar',
    },
    {
      title: 'Hata Raporları',
      subtitle: 'Uygulama hatalarını otomatik bildir',
      key: 'crashReports' as keyof typeof privacySettings,
      icon: 'bug',
    },
    {
      title: 'Konum Geçmişi',
      subtitle: 'Konum geçmişini kaydet ve sakla',
      key: 'locationHistory' as keyof typeof privacySettings,
      icon: 'history',
    },
    {
      title: 'Kişiselleştirilmiş Reklamlar',
      subtitle: 'İlgi alanlarına göre reklam göster',
      key: 'personalizedAds' as keyof typeof privacySettings,
      icon: 'ad',
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
        <Text style={styles.headerTitle}>Gizlilik Ayarları</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.settingsContainer}>
          <View style={styles.infoBox}>
            <FontAwesome5 name="shield-alt" size={24} color="#10B981" />
            <Text style={styles.infoText}>
              Gizliliğiniz bizim için önemlidir. Bu ayarlar verilerinizin nasıl kullanıldığını kontrol etmenizi sağlar.
            </Text>
          </View>

          {privacyOptions.map((option, index) => (
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
                value={privacySettings[option.key]}
                onValueChange={() => toggleSetting(option.key)}
                trackColor={{ false: '#E0E0E0', true: '#E91E63' }}
                thumbColor={privacySettings[option.key] ? '#fff' : '#f4f3f4'}
              />
            </View>
          ))}

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <FontAwesome5 name="download" size={16} color="#10B981" />
              <Text style={styles.actionButtonText}>Verilerimi İndir</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]}>
              <FontAwesome5 name="trash" size={16} color="#FF4444" />
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Verilerimi Sil</Text>
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
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
  actionButtons: {
    marginTop: 30,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  deleteButton: {
    borderColor: '#FF4444',
    backgroundColor: '#FFF5F5',
  },
  actionButtonText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteButtonText: {
    color: '#FF4444',
  },
});
