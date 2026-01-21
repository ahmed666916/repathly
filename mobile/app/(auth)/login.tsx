import React, { useState } from 'react';
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
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email adresi gereklidir.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Geçerli bir email adresi girin.';
    }

    if (!password) {
      newErrors.password = 'Şifre gereklidir.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    const result = await login(email.trim(), password);

    if (result.success) {
      router.replace('/(app)');
    } else {
      Alert.alert('Giriş Başarısız', result.message);
    }
  };

  const handleSocialSignIn = () => router.replace('/(app)');

  // TEST BACKEND CONNECTION - ADD THIS
  const testBackendConnection = async () => {
    try {
      console.log('🔧 Testing connection to: http://192.168.100.23:8000/api/test');

      const response = await fetch('http://192.168.100.23:8000/api/test', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log('✅ Response status:', response.status);
      const data = await response.json();
      console.log('✅ Response data:', data);

      Alert.alert(
        'Backend Çalışıyor! ✅',
        `${data.message}\n\nZaman: ${data.timestamp}`,
        [{ text: 'Tamam' }]
      );
    } catch (error) {
      console.error('❌ Connection error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';
      Alert.alert(
        'Bağlantı Hatası ❌',
        `Hata: ${errorMessage}\n\nKontrol edin:\n• Laravel çalışıyor mu?\n• Aynı Wi-Fi'de misiniz?\n• IP doğru mu?`,
        [{ text: 'Tamam' }]
      );
    }
  };



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
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Image source={require('../../assets/images/Logo.png')} style={styles.logo} />
              <Text style={styles.brandName}>Repathly</Text>
            </View>

            <Text style={styles.title}>Hoş Geldiniz</Text>
            <Text style={styles.subtitle}>
              Devam etmek için giriş yapın veya yeni hesap oluşturun
            </Text>

            {/* Login Form */}
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <FontAwesome name="envelope" size={16} color="#8A9A94" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Adresi"
                  placeholderTextColor="#8A9A94"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <FontAwesome name="lock" size={20} color="#8A9A94" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Şifre"
                  placeholderTextColor="#8A9A94"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <FontAwesome
                    name={showPassword ? "eye-slash" : "eye"}
                    size={18}
                    color="#8A9A94"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

              {/* Forgot Password */}
              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => router.push('/(auth)/forgot-password')}
              >
                <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.disabledButton]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Giriş Yap</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>veya</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login */}
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

            {/* TEST BUTTON - ADD THIS */}
            <TouchableOpacity
              style={styles.testButton}
              onPress={testBackendConnection}
            >
              <Text style={styles.testButtonText}>🔧 Test Backend</Text>
            </TouchableOpacity>





            {/* Register Link */}
            <View style={styles.registerLinkContainer}>
              <Text style={styles.registerLinkText}>Hesabınız yok mu? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.registerLink}>Kayıt Ol</Text>
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
    marginBottom: 30,
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
    marginBottom: 8,
  },
  subtitle: {
    color: '#8A9A94',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  form: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputIcon: {
    marginRight: 12,
    width: 20,
    textAlign: 'center',
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: '#E91E63',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#E91E63',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#E91E63',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: '#8A9A94',
    marginHorizontal: 16,
    fontSize: 14,
  },
  socialLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
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
  registerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  registerLinkText: {
    color: '#8A9A94',
    fontSize: 14,
  },
  registerLink: {
    color: '#E91E63',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
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
  testButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.8)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
