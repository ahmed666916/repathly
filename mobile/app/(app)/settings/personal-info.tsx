import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import * as authApi from '../../../services/api/auth';
import * as secureStorage from '../../../utils/secureStorage';

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { user, updateUser, refreshUser } = useAuthContext();
  const { t } = useLanguage();

  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(user?.profilePhoto || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch current profile from server
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await secureStorage.getToken();
        if (!token) return;

        const response = await authApi.getProfile(token);
        if (response.success && response.data) {
          setName(response.data.name || '');
          setPhone((response.data as any).phone || '');
          setBio((response.data as any).bio || '');
          if (response.data.profilePhoto) {
            setProfilePhoto(response.data.profilePhoto);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const token = await secureStorage.getToken();
      if (!token) {
        Alert.alert(t('common.error'), t('settings.sessionExpired'));
        return;
      }

      const updates: any = { name };
      if (phone) updates.phone = phone;
      if (bio) updates.bio = bio;

      const response = await authApi.updateProfile(token, updates);

      if (response.success && response.data) {
        const userData = (response.data as any).user || response.data;
        await updateUser({
          name: userData.name,
          bio: userData.bio,
          phone: userData.phone,
          profilePhoto: userData.profilePhoto,
        });
        // Refresh full user object from backend to ensure bio/phone are in local cache
        await refreshUser();
        Alert.alert(t('common.success'), t('settings.profileUpdated'));
      } else {
        Alert.alert(t('common.error'), response.message || t('settings.profileUpdateFailed'));
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert(t('common.error'), t('settings.profileUpdateFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(t('common.error'), t('settings.photoPermissionDenied'));
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const imageUri = result.assets[0].uri;
      setProfilePhoto(imageUri); // Show preview immediately

      setIsUploading(true);
      const token = await secureStorage.getToken();
      if (!token) {
        Alert.alert(t('common.error'), t('settings.sessionExpired'));
        return;
      }

      const response = await authApi.uploadProfilePhoto(token, imageUri);
      if (response.success && response.data) {
        const photoUrl = response.data.profilePhoto;
        setProfilePhoto(photoUrl);
        await updateUser({ profilePhoto: photoUrl });
        Alert.alert(t('common.success'), t('settings.photoUploaded'));
      } else {
        Alert.alert(t('common.error'), response.message || t('settings.photoUploadFailed'));
        // Revert preview
        setProfilePhoto(user?.profilePhoto || null);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert(t('common.error'), t('settings.photoUploadFailed'));
      setProfilePhoto(user?.profilePhoto || null);
    } finally {
      setIsUploading(false);
    }
  };

  const defaultAvatar = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.personalInfo')}</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>{t('common.save')}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Photo */}
        <TouchableOpacity style={styles.photoContainer} onPress={handlePhotoUpload} disabled={isUploading}>
          <Image 
            source={{ uri: profilePhoto || defaultAvatar }} 
            style={styles.profilePhoto} 
          />
          <View style={styles.cameraOverlay}>
            {isUploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <FontAwesome5 name="camera" size={16} color="#fff" />
            )}
          </View>
          <Text style={styles.changePhotoText}>{t('settings.changePhoto')}</Text>
        </TouchableOpacity>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('settings.fullName')}</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder={t('settings.fullNamePlaceholder')}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('auth.email')}</Text>
            <TextInput
              style={[styles.textInput, styles.readOnlyInput]}
              value={email}
              editable={false}
              placeholder={t('settings.emailPlaceholder')}
              keyboardType="email-address"
            />
            <Text style={styles.helperText}>{t('settings.emailReadOnly')}</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('settings.phone')}</Text>
            <TextInput
              style={styles.textInput}
              value={phone}
              onChangeText={setPhone}
              placeholder={t('settings.phonePlaceholder')}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('settings.bio')}</Text>
            <TextInput
              style={[styles.textInput, styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              placeholder={t('settings.bioPlaceholder')}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
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
  saveButton: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  photoContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#E91E63',
  },
  cameraOverlay: {
    position: 'absolute',
    top: 90,
    right: '38%',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  changePhotoText: {
    marginTop: 12,
    color: '#E91E63',
    fontSize: 14,
    fontWeight: '500',
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  readOnlyInput: {
    backgroundColor: '#e9ecef',
    color: '#999',
  },
  bioInput: {
    minHeight: 80,
    paddingTop: 16,
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    marginLeft: 4,
  },
});
