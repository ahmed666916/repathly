import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ImageBackground,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as authApi from '../../services/api/auth';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [error, setError] = useState('');

    const validateEmail = () => {
        if (!email.trim()) {
            setError('Email adresi gereklidir.');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Geçerli bir email adresi girin.');
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = async () => {
        if (!validateEmail()) return;

        setIsLoading(true);
        try {
            const response = await authApi.forgotPassword(email.trim());

            if (response.success) {
                setIsEmailSent(true);
            } else {
                Alert.alert('Hata', response.message);
            }
        } catch (err) {
            Alert.alert('Hata', 'Bağlantı hatası. Lütfen tekrar deneyin.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsLoading(true);
        try {
            const response = await authApi.forgotPassword(email.trim());
            if (response.success) {
                Alert.alert('Başarılı', 'Şifre sıfırlama bağlantısı tekrar gönderildi.');
            }
        } catch (err) {
            Alert.alert('Hata', 'Bağlantı hatası.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isEmailSent) {
        return (
            <ImageBackground
                source={require('../../assets/images/loginbackground.png')}
                style={styles.container}
                resizeMode="cover"
            >
                <View style={styles.overlay}>
                    <StatusBar barStyle="light-content" />
                    <View style={styles.successContainer}>
                        <View style={styles.successIconContainer}>
                            <FontAwesome name="envelope-o" size={60} color="#E91E63" />
                        </View>
                        <Text style={styles.successTitle}>Email Gönderildi!</Text>
                        <Text style={styles.successMessage}>
                            Şifre sıfırlama bağlantısı{'\n'}
                            <Text style={styles.emailHighlight}>{email}</Text>
                            {'\n'}adresine gönderildi.
                        </Text>
                        <Text style={styles.successHint}>
                            Email'inizi kontrol edin ve şifrenizi sıfırlamak için bağlantıya tıklayın.
                        </Text>

                        <TouchableOpacity
                            style={styles.resendButton}
                            onPress={handleResend}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#E91E63" />
                            ) : (
                                <Text style={styles.resendButtonText}>Tekrar Gönder</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.backToLoginButton}
                            onPress={() => router.push('/(auth)/login')}
                        >
                            <Text style={styles.backToLoginText}>Giriş Sayfasına Dön</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        );
    }

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
                        {/* Back Button */}
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <FontAwesome name="arrow-left" size={20} color="#fff" />
                        </TouchableOpacity>

                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.iconContainer}>
                                <FontAwesome name="lock" size={40} color="#E91E63" />
                            </View>
                            <Text style={styles.title}>Şifremi Unuttum</Text>
                            <Text style={styles.subtitle}>
                                Email adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
                            </Text>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            <View style={styles.inputContainer}>
                                <FontAwesome name="envelope" size={16} color="#8A9A94" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email Adresi"
                                    placeholderTextColor="#8A9A94"
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        setError('');
                                    }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                />
                            </View>
                            {error && <Text style={styles.errorText}>{error}</Text>}

                            <TouchableOpacity
                                style={[styles.submitButton, isLoading && styles.disabledButton]}
                                onPress={handleSubmit}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Sıfırlama Bağlantısı Gönder</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Back to Login */}
                        <TouchableOpacity
                            style={styles.loginLink}
                            onPress={() => router.push('/(auth)/login')}
                        >
                            <FontAwesome name="arrow-left" size={14} color="#8A9A94" />
                            <Text style={styles.loginLinkText}>Giriş sayfasına dön</Text>
                        </TouchableOpacity>
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
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(233, 30, 99, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        color: '#8A9A94',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    form: {
        marginBottom: 30,
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
    submitButton: {
        backgroundColor: '#E91E63',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    loginLinkText: {
        color: '#8A9A94',
        fontSize: 14,
    },
    // Success screen styles
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    successIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(233, 30, 99, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    successTitle: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    successMessage: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: 12,
    },
    emailHighlight: {
        color: '#E91E63',
        fontWeight: '600',
    },
    successHint: {
        color: '#8A9A94',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    resendButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: '#E91E63',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 40,
        marginBottom: 16,
    },
    resendButtonText: {
        color: '#E91E63',
        fontSize: 16,
        fontWeight: '600',
    },
    backToLoginButton: {
        paddingVertical: 14,
        paddingHorizontal: 40,
    },
    backToLoginText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
