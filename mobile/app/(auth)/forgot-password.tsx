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
import { useLanguage } from '../../contexts/LanguageContext';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [error, setError] = useState('');

    const validateEmail = () => {
        if (!email.trim()) {
            setError(t('auth.emailRequired'));
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError(t('auth.invalidEmail'));
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
                Alert.alert(t('common.error'), response.message);
            }
        } catch (err) {
            Alert.alert(t('common.error'), t('forgotPassword.connectionError'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsLoading(true);
        try {
            const response = await authApi.forgotPassword(email.trim());
            if (response.success) {
                Alert.alert(t('common.success'), t('forgotPassword.resentSuccess'));
            }
        } catch (err) {
            Alert.alert(t('common.error'), t('forgotPassword.connectionError'));
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
                        <Text style={styles.successTitle}>{t('forgotPassword.successTitle')}</Text>
                        <Text style={styles.successMessage}>
                            {t('forgotPassword.successMessage', { email })}
                        </Text>
                        <Text style={styles.successHint}>
                            {t('forgotPassword.successHint')}
                        </Text>

                        <TouchableOpacity
                            style={styles.resendButton}
                            onPress={handleResend}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#E91E63" />
                            ) : (
                                <Text style={styles.resendButtonText}>{t('forgotPassword.resend')}</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.backToLoginButton}
                            onPress={() => router.push('/(auth)/login')}
                        >
                            <Text style={styles.backToLoginText}>{t('forgotPassword.backToLogin')}</Text>
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
                            <Text style={styles.title}>{t('forgotPassword.title')}</Text>
                            <Text style={styles.subtitle}>
                                {t('forgotPassword.subtitle')}
                            </Text>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            <View style={styles.inputContainer}>
                                <FontAwesome name="envelope" size={16} color="#8A9A94" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('forgotPassword.emailPlaceholder')}
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
                                    <Text style={styles.submitButtonText}>{t('forgotPassword.sendButton')}</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Back to Login */}
                        <TouchableOpacity
                            style={styles.loginLink}
                            onPress={() => router.push('/(auth)/login')}
                        >
                            <FontAwesome name="arrow-left" size={14} color="#8A9A94" />
                            <Text style={styles.loginLinkText}>{t('forgotPassword.backToLoginLink')}</Text>
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
