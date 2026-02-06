# Onboarding Flow Fixes - Documentation

## Overview

This document explains the fixes implemented to resolve the broken onboarding flow and profile screen crash in the Repathly mobile app.

## Problems Fixed

### 1. **Signup Skipped Onboarding Steps**
**Root Cause**: After signup, the app redirected directly to the Route Settings screen instead of going through:
- Language Selection ✓ (fixed)
- Profile Setup ✓ (fixed)
- Experience Card Selection ✓ (fixed)

The issue was that the `useAuth()` hook's fallback implementation always returned `'/(app)'` as the next step, bypassing the onboarding logic.

**Solution**: 
- Created a centralized onboarding state manager
- Implemented an `OnboardingResolver` screen that determines the correct next step
- Both login and signup now redirect to the resolver instead of directly to a screen

### 2. **Profile Screen Crash**
**Root Cause**: The profile screen tried to render profile data without:
- Fetching it from the backend
- Checking if it was null/undefined
- Showing a loading state

**Solution**:
- Added proper loading state with spinner
- Added error handling with retry button
- Call `fetchProfile()` on component mount
- Use safe fallbacks for all data access

### 3. **No Persistent Onboarding State**
**Root Cause**: Onboarding completion was only tracked in the app's memory via Redux/Context. If the app restarted, the state was lost.

**Solution**:
- Created `onboardingManager.ts` to persist completion flags in AsyncStorage
- Flags are synced from backend after login/register
- Flags are restored from AsyncStorage automatically

## New Files Created

### 1. `mobile/app/utils/onboardingManager.ts`
Central hub for onboarding state management with AsyncStorage persistence.

**Key Functions**:
- `getOnboardingState()`: Get all completion flags
- `setLanguageSelected()`, `setProfileCompleted()`, `setExperiencesSelected()`: Mark individual steps
- `syncOnboardingState()`: Sync from backend user data
- `getNextOnboardingStep()`: Determine the correct next screen
- `clearOnboardingState()`: Clear all flags on logout

### 2. `mobile/app/(auth)/onboarding-resolver.tsx`
Screen that determines the correct next step based on onboarding state.

Shows a loading spinner while checking AsyncStorage, then redirects to the appropriate screen:
1. Language Selection (if not selected)
2. Profile Setup (if not completed)
3. Experience Card Selection (if not selected)
4. App Home (if all steps done)

## Modified Files

### 1. `mobile/app/hooks/useAuth.ts`
**Changes**:
- Fallback implementation now uses `onboardingManager.getNextOnboardingStep()` instead of hardcoded `'/(app)'`
- Syncs local onboarding state with backend after login/register
- Now returns async `getOnboardingStep()` function

### 2. `mobile/app/(auth)/register.tsx`
**Changes**:
- Removed manual onboarding step detection
- Now redirects to `onboarding-resolver` after signup
- Lets the resolver determine the next step based on state

### 3. `mobile/app/(auth)/login.tsx`
**Changes**:
- Simplified login logic
- Now redirects to `onboarding-resolver` after login
- Lets the resolver determine the next step based on state
- Removed unused `getOnboardingStep` import

### 4. `mobile/app/(auth)/_layout.tsx`
**Changes**:
- Added `onboarding-resolver` screen to the Stack navigator

### 5. `mobile/app/(auth)/language-selection.tsx`
**Changes**:
- Syncs language selection to AsyncStorage via `onboardingManager`
- Ensures flag persists across app restarts

### 6. `mobile/app/(onboarding)/basic-info.tsx`
**Changes**:
- After updating user, marks profile as completed in AsyncStorage
- Uses `setProfileCompleted(true)` from onboarding manager

### 7. `mobile/app/(onboarding)/experience-cards.tsx`
**Changes**:
- Imports and uses `setExperiencesSelected` from onboarding manager
- After successfully saving experience cards, marks step as complete in AsyncStorage

### 8. `mobile/app/(app)/profile.tsx`
**Major Changes**:
- Added `useEffect` to fetch profile data on component mount
- Shows loading spinner during data fetch
- Shows error state with retry button if fetch fails
- Added null checks for all user data
- Added `centerContainer` styles for error/loading states
- Defensive rendering with fallback values everywhere
- Safe access to user properties with fallbacks

### 9. `mobile/app/contexts/AuthContext.tsx`
**Changes**:
- Imports and syncs onboarding state from manager
- `login()` function now syncs onboarding state from backend response
- `register()` function now syncs onboarding state from backend response
- `logout()` function now clears onboarding state

## Flow Diagram

### Onboarding Resolver Logic
```
User Signs Up/Logs In
        ↓
Redirect to onboarding-resolver
        ↓
Check AsyncStorage flags
        ↓
        ├─ hasSelectedLanguage = false → Go to language-selection
        ├─ hasCompletedProfile = false → Go to basic-info
        ├─ hasSelectedExperiences = false → Go to experience-cards
        └─ All true → Go to /(app)
```

### Data Sync Flow
```
Backend (Laravel)
    ↓
    Returns user with onboarding flags
    (hasCompletedProfile, hasSelectedExperiences, isOnboardingCompleted)
    ↓
SecureStorage
    (Saves user object locally)
    ↓
onboardingManager.syncOnboardingState()
    (Parses user.hasCompletedProfile and user.hasSelectedExperiences)
    ↓
AsyncStorage
    (Persists individual flags for integrity)
    ↓
onboardingManager.getNextOnboardingStep()
    (Reads AsyncStorage to determine next screen)
```

## Testing Checklist

### Fresh Registration Flow
- [ ] User signs up
- [ ] Redirected to language selection (not bypassed)
- [ ] After language selection, redirected to profile setup
- [ ] After profile setup, redirected to experience cards
- [ ] After experience cards, redirected to app home
- [ ] All steps are required (cannot skip)

### Login Flow (After Registration)
- [ ] User logs in
- [ ] Redirected to onboarding-resolver
- [ ] If onboarding incomplete, redirected to first incomplete step
- [ ] If onboarding complete, redirected to app home

### App Restart (After Signup but Not All Steps)
- [ ] User signs up but closes app during onboarding
- [ ] App reopens
- [ ] User is redirected to the first incomplete step (resume correctly)

### Profile Screen
- [ ] Profile screen loads with spinner
- [ ] User data displays correctly
- [ ] No crashes or null reference errors
- [ ] Error state shows if fetch fails
- [ ] Retry button works

### Logout and Re-Login
- [ ] User logs out
- [ ] All onboarding flags are cleared
- [ ] User logs back in
- [ ] Flags are restored from backend

## Backend Verification

The backend already supports this flow:

### Endpoints Returning Onboarding Flags
1. `POST /api/auth/register` - Returns user with onboarding flags
2. `POST /api/auth/login` - Returns user with onboarding flags
3. `GET /api/auth/profile` - Returns user with onboarding flags

### User Model Accessors
The `User` model provides computed accessors:
- `getHasCompletedProfileAttribute()` - Returns `has_completed_profile` column value
- `getHasSelectedExperiencesAttribute()` - Returns count of experience card weights >= 4
- `getIsOnboardingCompletedAttribute()` - Returns combined completion status

### Data Persistence
- `has_completed_profile` column exists in users table (migration added)
- Experience cards are tracked via `user_experience_card_weights` pivot
- Minimum 4 experience cards required for completion

## Key Improvements

1. **Single Source of Truth**: AsyncStorage is the authoritative source for local onboarding state
2. **Resilient**: Works offline after initial login
3. **Resumable**: Users can close the app mid-onboarding and resume correctly
4. **No Skipping**: Each step requires completion before moving to next
5. **Synced**: Local state always syncs from backend after auth operations
6. **Clear & Maintainable**: Centralized logic in `onboardingManager.ts`

## Edge Cases Handled

1. **Network Failure During Registration**: User data still saved to SecureStorage, resolver will use it
2. **App Restart Mid-Onboarding**: AsyncStorage flags persist, resolver routes to correct step
3. **Corrupted AsyncStorage**: Falls back to backend flags on next auth operation
4. **Profile Not Yet Created**: Loading state prevents crash, empty state handled gracefully
5. **Missing User Data**: All fields have safe fallbacks

## Implementation Notes

- **No Breaking Changes**: Existing auth flow remains compatible
- **Backward Compatible**: Existing users' data is automatically synced
- **Performance**: AsyncStorage checks are instant (no network delay)
- **Type Safe**: All functions are fully typed with TypeScript
- **Error Boundaries**: Each component has error handling

## Future Enhancements

1. Analytics tracking for onboarding completion rates
2. A/B testing for onboarding flow variations
3. Onboarding skip option (with warning) for returning users
4. Onboarding progress analytics for each step
5. Deep linking to specific onboarding steps
