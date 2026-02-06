# Onboarding Flow - Quick Reference Guide

## TL;DR - What Changed

**Problem**: After signup, users skipped all onboarding steps. Profile crashed.

**Solution**: 
1. Created `onboardingManager.ts` - centralized state in AsyncStorage
2. Created `onboarding-resolver.tsx` - screen to route users to correct step
3. Fixed profile screen - proper loading, error, and null-safe rendering
4. Updated auth flows - login/signup now use resolver instead of hardcoded routes

---

## For Developers Working on Onboarding

### Adding a New Onboarding Step

1. **Create the screen** in `mobile/app/(onboarding)/your-step.tsx`

2. **After completion**, mark it complete:
   ```typescript
   import { setYourStepCompleted } from '../utils/onboardingManager';
   // After your step is done:
   await setYourStepCompleted(true);
   ```

3. **Add to onboardingManager.ts**:
   ```typescript
   const STORAGE_KEYS = {
       // ...
       HAS_COMPLETED_YOUR_STEP: '@onboarding_your_step_completed',
   };
   
   export async function setYourStepCompleted(completed: boolean) {
       await AsyncStorage.setItem(STORAGE_KEYS.HAS_COMPLETED_YOUR_STEP, String(completed));
   }
   ```

4. **Update getNextOnboardingStep()**:
   ```typescript
   export async function getNextOnboardingStep(): Promise<string> {
       const state = await getOnboardingState();
       
       if (!state.hasYourStepCompleted) {
           return '/(onboarding)/your-step';
       }
       // ... rest of logic
   }
   ```

5. **Update OnboardingState interface**:
   ```typescript
   export interface OnboardingState {
       hasSelectedLanguage: boolean;
       hasCompletedProfile: boolean;
       hasSelectedExperiences: boolean;
       hasYourStepCompleted: boolean; // ← Add this
       isComplete: boolean;
   }
   ```

### Understanding the Flow

```typescript
// 1. User completes a step
await updateProfile(updates);

// 2. Mark it in AsyncStorage
await setProfileCompleted(true);

// 3. Check what's next
const nextStep = getOnboardingStep();
router.replace(nextStep);
```

### Debugging Onboarding State

```typescript
// In your component:
import { getOnboardingState } from '../utils/onboardingManager';

const state = await getOnboardingState();
console.log('Onboarding state:', state);
// Output:
// {
//   hasSelectedLanguage: true,
//   hasCompletedProfile: false,
//   hasSelectedExperiences: false,
//   isComplete: false
// }
```

### Resetting State (Testing)

```typescript
import { clearOnboardingState, setLanguageSelected } from '../utils/onboardingManager';

// Reset to start
await clearOnboardingState();

// Or just language
await setLanguageSelected(false);
```

---

## For Developers Working on Profile

### Profile Screen Requirements

**Do**:
```typescript
// ✓ Fetch on mount
useEffect(() => {
    if (user) {
        fetchProfile();
    }
}, [user]);

// ✓ Show loading
if (isLoading) return <Spinner />;

// ✓ Show error
if (error) return <Error onRetry={fetchProfile} />;

// ✓ Safe access
bio: profile?.bio || 'Default'
```

**Don't**:
```typescript
// ✗ Assume data exists
bio: profile.bio

// ✗ No loading state
if (!data) return null;

// ✗ No error handling
return <Content /> // Could crash here
```

---

## File Reference

| File | Purpose | Modified |
|------|---------|----------|
| `utils/onboardingManager.ts` | Central state mgmt | ✨ NEW |
| `(auth)/onboarding-resolver.tsx` | Route resolver | ✨ NEW |
| `hooks/useAuth.ts` | Auth logic | ✏️ Fixed |
| `(auth)/register.tsx` | Signup | ✏️ Fixed |
| `(auth)/login.tsx` | Login | ✏️ Fixed |
| `(auth)/language-selection.tsx` | Language step | ✏️ Fixed |
| `(onboarding)/basic-info.tsx` | Profile step | ✏️ Fixed |
| `(onboarding)/experience-cards.tsx` | Experience step | ✏️ Fixed |
| `(app)/profile.tsx` | Profile view | ✏️ Fixed |
| `contexts/AuthContext.tsx` | Auth state | ✏️ Fixed |

---

## Common Tasks

### Check if User Completed Onboarding
```typescript
const state = await getOnboardingState();
const isComplete = state.isComplete;
```

### Check Specific Step
```typescript
const state = await getOnboardingState();
if (!state.hasCompletedProfile) {
    // User needs to complete profile
}
```

### Mark Step as Done
```typescript
import { setProfileCompleted } from '../utils/onboardingManager';
await setProfileCompleted(true);
```

### Get Next Step Programmatically
```typescript
import { getNextOnboardingStep } from '../utils/onboardingManager';
const nextStep = await getNextOnboardingStep();
// Returns: '/(onboarding)/experience-cards' or '/(app)' etc
```

### Reset for Testing
```typescript
import { clearOnboardingState } from '../utils/onboardingManager';
await clearOnboardingState();
// All flags set to false
```

---

## The 3-Step Guarantee

After signup, the app guarantees:

1. **Language Selection** - Must happen first
2. **Profile Setup** - Must happen before experiences  
3. **Experience Cards** - Must happen before app access

**You cannot skip any step.** The resolver enforces this by checking:

```typescript
if (!languageSelected) return language_selection;
if (!profileCompleted) return profile_setup;
if (!experiencesSelected) return experience_cards;
return app;
```

---

## Backend Integration

### User Flags Expected from Backend

```json
{
  "user": {
    "id": "123",
    "name": "John Doe",
    "hasCompletedProfile": false,
    "hasSelectedExperiences": false,
    "isOnboardingCompleted": false
  }
}
```

### Sync Happens Here

```typescript
// In AuthContext and useAuth hook
await onboardingManager.syncOnboardingState(
    response.data.user.hasCompletedProfile,
    response.data.user.hasSelectedExperiences
);
```

This ensures:
- ✓ Local state matches backend
- ✓ Works offline (AsyncStorage)
- ✓ Survives app restart
- ✓ Never out of sync

---

## Error Scenarios & Recovery

### Profile Fetch Fails
```
Profile Screen Loads
    ↓ useEffect calls fetchProfile()
    ↓ Network error
    ↓ error state set
    ↓ Error message shown: "Profil alınamadı"
    ↓ User taps "Tekrar Dene" button
    ↓ Retry (fetchProfile called again)
```

### AsyncStorage Corrupted
```
App Calls getNextOnboardingStep()
    ↓ AsyncStorage read fails
    ↓ Fallback to empty state
    ↓ User redirected to language selection
    ↓ Next sync with backend fixes flags
```

### Context Not Available (Fallback)
```
Auth Screen calls useAuth()
    ↓ Context not immediately available
    ↓ Uses fallback implementation
    ↓ Fallback calls getNextOnboardingStep()
    ↓ Checks AsyncStorage (has persistence)
    ↓ Returns correct next step
    ↓ No hardcoded '/(app)' anymore
```

---

## Testing Checklist

Before committing changes to onboarding:

### Flow Tests
- [ ] Fresh signup shows language selection
- [ ] After language, shows profile setup
- [ ] After profile, shows experience cards
- [ ] After experiences, shows app home
- [ ] Cannot skip steps (back button doesn't work)

### Persistence Tests
- [ ] Close app during language selection
- [ ] Reopen app → back at language selection
- [ ] Close app during profile setup
- [ ] Reopen app → back at profile setup
- [ ] Close app during experience cards
- [ ] Reopen app → back at experience cards

### Crash Tests
- [ ] Open profile before onboarding complete (doesn't crash)
- [ ] Profile shows loading spinner
- [ ] Profile shows error if fetch fails
- [ ] Retry button works

### Edge Cases
- [ ] Already onboarded user logs in → goes to app
- [ ] Incomplete user logs in → goes to first incomplete step
- [ ] User logs out → flags cleared
- [ ] User logs back in → flags restored from backend

---

## Performance Tips

✓ onboardingManager checks and writes are instant (AsyncStorage is fast)

✓ No network calls in resolver (pure local state)

✓ Resolver is lightweight (just show spinner)

✓ Parallel operations:
```typescript
// Good: fetch multiple items at once
const state = await getOnboardingState(); // All keys read in one call
```

---

## Troubleshooting

### Users Can't Get Past Language Selection
```
Check: Does language selection call setLanguageSelected()?
Check: Does it also call setLanguageSelectedInStorage()?
Check: Is onboarding-resolver screen registered?
```

### Users Can't Get to Experience Cards
```
Check: Did profile setup call setProfileCompleted()?
Check: Did it call it BEFORE router.replace()?
Check: Is basic-info screen registered?
```

### Profile Still Crashes
```
Check: Is useEffect calling fetchProfile()?
Check: Are all properties accessed safely (.bio or with || fallback)?
Check: Is loading state rendering the spinner?
Check: Is error state rendering error message?
```

### App Won't Login After Onboarding
```
Check: Does useAuth hook import onboardingManager?
Check: Does login/register call syncOnboardingState()?
Check: Is onboarding-resolver registered in (auth) layout?
```

---

## Key Takeaways

1. **Single Source of Truth**: AsyncStorage + backend flags
2. **Resolver Pattern**: Centralized routing logic in one screen
3. **Persistent State**: Survives app restart
4. **No Skipping**: Each step is required
5. **Safe Rendering**: Loading, error, and null states everywhere
6. **Type Safety**: Full TypeScript with interfaces

---

## Questions?

Refer to:
- `ONBOARDING_FIXES.md` - Full documentation
- `ROOT_CAUSE_ANALYSIS.md` - Why fixes were needed
- `onboardingManager.ts` - Implementation details
- `onboarding-resolver.tsx` - Routing logic
