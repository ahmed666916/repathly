import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();

  const handleSocialSignIn = () => router.replace('/(app)');

  return (
    <ImageBackground
      source={require('../../assets/images/loginbackground.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <StatusBar barStyle="light-content" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.header}>
              <Image source={require('../../assets/images/icon.png')} style={styles.logo} />
              <Text style={styles.brandName}>RoadBuddy</Text>
            </View>

            <Text style={styles.title}>Create an Account</Text>
            <Text style={styles.subtitle}>
              To create an account provide details verify email and set a password.
            </Text>

            <View style={styles.socialLoginContainer}>
              <TouchableOpacity style={styles.socialButton} onPress={handleSocialSignIn}>
                <FontAwesome name="google" size={20} color="#fff" />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton} onPress={handleSocialSignIn}>
                <FontAwesome name="apple" size={24} color="#fff" />
                <Text style={styles.socialButtonText}>Apple</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity>
                <Text style={styles.footerText}>Terms of Service</Text>
              </TouchableOpacity>
              <View style={styles.footerSeparator} />
              <TouchableOpacity>
                <Text style={styles.footerText}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  brandName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    color: '#8A9A94',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  socialLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '48%',
    justifyContent: 'center',
  },
  socialButtonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#8A9A94',
    fontSize: 12,
  },
  footerSeparator: {
    width: 1,
    height: 12,
    backgroundColor: '#8A9A94',
    marginHorizontal: 10,
  },
  socialIcon: {
    width: 20,
    height: 20,
  },
});
