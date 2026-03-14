import React from 'react';
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="basic-info" />
            <Stack.Screen name="taste-dna" />
            <Stack.Screen name="experience-cards" />
            <Stack.Screen name="profile-summary" />
        </Stack>
    );
}
