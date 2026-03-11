import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Modal,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuthContext } from '../../contexts/AuthContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { t, locale, setLanguage } = useLanguage();
  const { logout } = useAuthContext();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const settingsItems = [
    {
      title: t('settings.personalInfo'),
      icon: 'user',
      onPress: () => router.push('/(app)/settings/personal-info'),
    },
    {
      title: t('settings.following'),
      icon: 'users',
      onPress: () => router.push('/(app)/following'),
    },
    {
      title: t('settings.profileSettings'),
      icon: 'user-cog',
      onPress: () => router.push('/(app)/settings/profile-settings'),
    },
    {
      title: t('settings.privacySettings'),
      icon: 'shield-alt',
      onPress: () => router.push('/(app)/settings/privacy-settings'),
    },
    {
      title: t('settings.language'),
      subtitle: locale === 'tr' ? '🇹🇷 Türkçe' : '🇬🇧 English',
      icon: 'globe',
      onPress: () => setShowLanguageModal(true),
    },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleLanguageChange = async (lang: 'tr' | 'en') => {
    await setLanguage(lang);
    setShowLanguageModal(false);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.settingsContainer}>
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.settingsItem}
              onPress={item.onPress}
            >
              <View style={styles.settingsItemLeft}>
                <View style={styles.iconContainer}>
                  <FontAwesome5 name={item.icon} size={20} color="#E91E63" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingsItemText}>{item.title}</Text>
                  {item.subtitle && (
                    <Text style={styles.settingsItemSubtext}>{item.subtitle}</Text>
                  )}
                </View>
              </View>
              <FontAwesome5 name="chevron-right" size={16} color="#999" />
            </TouchableOpacity>
          ))}

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <FontAwesome5 name="sign-out-alt" size={20} color="#FF4444" />
            <Text style={styles.logoutText}>{t('profile.logout')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('settings.language')}</Text>
            
            <TouchableOpacity
              style={[styles.languageOption, locale === 'tr' && styles.languageOptionActive]}
              onPress={() => handleLanguageChange('tr')}
            >
              <Text style={styles.languageFlag}>🇹🇷</Text>
              <Text style={[styles.languageText, locale === 'tr' && styles.languageTextActive]}>Türkçe</Text>
              {locale === 'tr' && <FontAwesome5 name="check" size={16} color="#E91E63" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.languageOption, locale === 'en' && styles.languageOptionActive]}
              onPress={() => handleLanguageChange('en')}
            >
              <Text style={styles.languageFlag}>🇬🇧</Text>
              <Text style={[styles.languageText, locale === 'en' && styles.languageTextActive]}>English</Text>
              {locale === 'en' && <FontAwesome5 name="check" size={16} color="#E91E63" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.modalCloseText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  settingsItem: {
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
  settingsItemLeft: {
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
  settingsItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  settingsItemSubtext: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
  },
  languageOptionActive: {
    backgroundColor: '#FCE4EC',
    borderWidth: 1,
    borderColor: '#E91E63',
  },
  languageFlag: {
    fontSize: 28,
    marginRight: 16,
  },
  languageText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  languageTextActive: {
    color: '#E91E63',
    fontWeight: '600',
  },
  modalCloseButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 10,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});
