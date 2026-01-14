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
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as authApi from '../../services/api/auth';

export default function ResetPasswordScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const resetToken = params.token as string || '';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!password) {
            newErrors.password = 'Şifre gereklidir.';
        } else if (password.length < 6) {
            newErrors.password = 'Şifre en az 6 karakter olmalıdır.';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Şifre tekrarı gereklidir.';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Şifreler eşleşmiyor.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const response = await authApi.resetPassword(resetToken, password);

            if (response.success) {
                setIsSuccess(true);
            } else {
                Alert.alert('Hata', response.message);
            }
        } catch (err) {
            Alert.alert('Hata', 'Bağlantı hatası. Lütfen tekrar deneyin.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
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
                            <FontAwesome name="check" size={50} color="#4CAF50" />
                        </View>
                        <Text style={styles.successTitle}>Şifre Değiştirildi!</Text>
                        <Text style={styles.successMessage}>
                            Şifreniz başarıyla değiştirildi.{'\n'}
                            Yeni şifrenizle giriş yapabilirsiniz.
                        </Text>

                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={() => router.replace('/(auth)/login')}
                        >
                            <Text style={styles.loginButtonText}>Giriş Yap</Text>
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
                                <FontAwesome name="key" size={40} color="#E91E63" />
                            </View>
                            <Text style={styles.title}>Yeni Şifre Belirle</Text>
                            <Text style={styles.subtitle}>
                                Hesabınız için yeni bir şifre oluşturun. En az 6 karakter kullanın.
                            </Text>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            {/* New Password */}
                            <View style={styles.inputContainer}>
                                <FontAwesome name="lock" size={20} color="#8A9A94" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Yeni Şifre"
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

                            {/* Confirm Password */}
                            <View style={styles.inputContainer}>
                                <FontAwesome name="lock" size={20} color="#8A9A94" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Şifre Tekrar"
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

                            {/* Password Requirements */}
                            <View style={styles.requirements}>
                                <Text style={styles.requirementTitle}>Şifre gereksinimleri:</Text>
                                <View style={styles.requirementItem}>
                                    <FontAwesome
                                        name={password.length >= 6 ? "check-circle" : "circle-o"}
                                        size={14}
                                        color={password.length >= 6 ? "#4CAF50" : "#8A9A94"}
                                    />
                                    <Text style={[
                                        styles.requirementText,
                                        password.length >= 6 && styles.requirementMet
                                    ]}>
                                        En az 6 karakter
                                    </Text>
                                </View>
                                <View style={styles.requirementItem}>
                                    <FontAwesome
                                        name={password === confirmPassword && password.length > 0 ? "check-circle" : "circle-o"}
                                        size={14}
                                        color={password === confirmPassword && password.length > 0 ? "#4CAF50" : "#8A9A94"}
                                    />
                                    <Text style={[
                                        styles.requirementText,
                                        password === confirmPassword && password.length > 0 && styles.requirementMet
                                    ]}>
                                        Şifreler eşleşmeli
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.submitButton, isLoading && styles.disabledButton]}
                                onPress={handleSubmit}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Şifreyi Değiştir</Text>
                                )}
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
    requirements: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 16,
        marginVertical: 16,
    },
    requirementTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    requirementText: {
        color: '#8A9A94',
        fontSize: 14,
        marginLeft: 10,
    },
    requirementMet: {
        color: '#4CAF50',
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
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
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
        marginBottom: 40,
    },
    loginButton: {
        backgroundColor: '#E91E63',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 60,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
