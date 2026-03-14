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
import { useAuth } from '../../hooks/useAuth';
import { t } from '../../services/api/i18n';

export default function RegisterScreen() {
    const router = useRouter();
    const { register, isLoading } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!name.trim()) {
            newErrors.name = t('auth.nameRequired');
        }

        if (!email.trim()) {
            newErrors.email = t('auth.emailRequired');
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = t('auth.invalidEmail');
        }

        if (!password) {
            newErrors.password = t('auth.passwordRequired');
        } else if (password.length < 6) {
            newErrors.password = t('auth.passwordMinLength');
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = t('auth.confirmPasswordRequired');
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = t('auth.passwordsDoNotMatch');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        const result = await register(name.trim(), email.trim(), password);

        if (result.success) {
            Alert.alert(
                t('auth.registerSuccessTitle'),
                t('auth.registerSuccessMessage'),
                [
                    {
                        text: t('common.next'),
                        onPress: async () => {
                            // Route to onboarding resolver which will determine the correct next step
                            router.replace('/(auth)/onboarding-resolver');
                        },
                    },
                ]
            );
        } else {
            Alert.alert(t('common.error'), result.message);
        }
    };

    const handleGoogleSignUp = () => {
        // Social auth not yet integrated — route through onboarding resolver
        router.replace('/(auth)/onboarding-resolver');
    };

    const handleAppleSignUp = () => {
        // Social auth not yet integrated — route through onboarding resolver
        router.replace('/(auth)/onboarding-resolver');
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
                        {/* Back Button */}
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.replace('/(auth)/login')}
                        >
                            <FontAwesome name="arrow-left" size={20} color="#fff" />
                        </TouchableOpacity>

                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>{t('auth.register')}</Text>
                            <Text style={styles.subtitle}>
                                {t('auth.registerSubtitle')}
                            </Text>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            {/* Name Input */}
                            <View style={styles.inputContainer}>
                                <FontAwesome name="user" size={18} color="#8A9A94" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('auth.name')}
                                    placeholderTextColor="#8A9A94"
                                    value={name}
                                    onChangeText={setName}
                                    autoCapitalize="words"
                                />
                            </View>
                            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

                            {/* Email Input */}
                            <View style={styles.inputContainer}>
                                <FontAwesome name="envelope" size={16} color="#8A9A94" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('auth.email')}
                                    placeholderTextColor="#8A9A94"
                                    value={email}
                                    onChangeText={setEmail}
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
                                    placeholder={t('auth.password')}
                                    placeholderTextColor="#8A9A94"
                                    value={password}
                                    onChangeText={setPassword}
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

                            {/* Confirm Password Input */}
                            <View style={styles.inputContainer}>
                                <FontAwesome name="lock" size={20} color="#8A9A94" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('auth.confirmPassword')}
                                    placeholderTextColor="#8A9A94"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <FontAwesome
                                        name={showConfirmPassword ? "eye-slash" : "eye"}
                                        size={18}
                                        color="#8A9A94"
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

                            {/* Register Button */}
                            <TouchableOpacity
                                style={[styles.registerButton, isLoading && styles.disabledButton]}
                                onPress={handleRegister}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.registerButtonText}>{t('auth.register')}</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>{t('auth.or')}</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social Login */}
                        <View style={styles.socialLoginContainer}>
                            <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignUp}>
                                <FontAwesome name="google" size={20} color="#fff" />
                                <Text style={styles.socialButtonText}>Google</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialButton} onPress={handleAppleSignUp}>
                                <FontAwesome name="apple" size={24} color="#fff" />
                                <Text style={styles.socialButtonText}>Apple</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Login Link */}
                        <View style={styles.loginLinkContainer}>
                            <Text style={styles.loginLinkText}>{t('auth.alreadyHaveAccount')} </Text>
                            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                                <Text style={styles.loginLink}>{t('auth.login')}</Text>
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
        marginBottom: 20,
    },
    header: {
        marginBottom: 30,
    },
    title: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        color: '#8A9A94',
        fontSize: 16,
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
    registerButton: {
        backgroundColor: '#E91E63',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    disabledButton: {
        opacity: 0.7,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
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
    loginLinkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    loginLinkText: {
        color: '#8A9A94',
        fontSize: 14,
    },
    loginLink: {
        color: '#E91E63',
        fontSize: 14,
        fontWeight: '600',
    },
});
