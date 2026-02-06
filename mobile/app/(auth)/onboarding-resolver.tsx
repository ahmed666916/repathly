import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { getNextOnboardingStep } from '../../utils/onboardingManager';

/**
 * OnboardingResolver Screen
 *
 * This screen determines the correct next step in the onboarding flow
 * based on the current onboarding state stored in AsyncStorage.
 *
 * It's used after login/signup to route users to the first incomplete step.
 * It ensures:
 * - Language selection is not skipped
 * - Profile setup is not skipped
 * - Experience card selection is not skipped
 * - The flow resumes correctly if the app restarts
 */
export default function OnboardingResolverScreen() {
    const router = useRouter();
    const [debugInfo, setDebugInfo] = useState<string>('Initializing...');

    useEffect(() => {
        const resolveNextStep = async () => {
            try {
                setDebugInfo('Checking onboarding state...');
                console.log('[OnboardingResolver] Starting to resolve next step');

                const nextStep = await getNextOnboardingStep();
                console.log('[OnboardingResolver] Next step:', nextStep);
                setDebugInfo(`Navigating to: ${nextStep}`);

                // Small delay to ensure state is ready
                setTimeout(() => {
                    // Use replace to prevent going back to this screen
                    router.replace(nextStep as any);
                }, 100);
            } catch (error) {
                console.error('[OnboardingResolver] Error resolving next onboarding step:', error);
                setDebugInfo(`Error: ${error}`);
                // Fallback to basic-info on error (safer than going to app)
                setTimeout(() => {
                    router.replace('/(onboarding)/basic-info');
                }, 100);
            }
        };

        resolveNextStep();
    }, [router]);

    // Show loading while determining the next step
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' }}>
            <ActivityIndicator size="large" color="#E91E63" />
            <Text style={{ color: '#666', marginTop: 16, fontSize: 12 }}>{debugInfo}</Text>
        </View>
    );
}
