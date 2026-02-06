# Root Cause Analysis - Broken Onboarding Flow

## Issue 1: Signup Skips Directly to Route Settings

### Problem Statement
After a user completes signup, they were immediately taken to the Route Settings screen instead of going through:
1. Language Selection
2. Profile Setup  
3. Experience Card Selection

### Root Cause Analysis

#### Layer 1: The Auth Screen (register.tsx)
```typescript
// BEFORE - This was trying to get the next step
const nextStep = getOnboardingStep();
router.replace(nextStep as any);
```

The issue: `getOnboardingStep()` is called from the `useAuth()` hook.

#### Layer 2: The useAuth Hook (hooks/useAuth.ts)
```typescript
export function useAuth() {
    const context = useContext(AuthContext);
    
    if (context !== undefined) {
        return context;  // ✓ Would work if context is available
    }
    
    // Fallback when context is not available
    return {
        ...
        getOnboardingStep: () => '/(app)', // ❌ HARDCODED!
    };
}
```

**The Real Problem**: The fallback implementation has a hardcoded return value that always returns `'/(app)'`, completely bypassing onboarding!

#### Why the Fallback Was Being Used

While the auth screens ARE technically inside the AuthProvider (via the layout hierarchy), there could be edge cases or timing issues where:
1. Context isn't immediately available when the hook is called
2. The compiler optimizes the fallback in certain conditions
3. There's a React context provider boundary issue with Expo Router's nested layouts

**Root Cause**: Even though the context fallback *shouldn't* be used, it was being used as a safety net. When it was, it hardcoded `'/(app)'` instead of checking actual state.

#### The Cascading Problem

```
Signup completes
    ↓
useAuth().register() saves user to SecureStorage and context
    ↓
register.tsx calls getOnboardingStep()
    ↓
useAuth hook returns fallback (if context not ready)
    ↓
Fallback returns hardcoded '/(app)'
    ↓
User routed to /(app) SKIPPING all onboarding
```

### Why It Happened

1. **No Persistent Onboarding State**: Onboarding status was only in React state (context). If context wasn't ready, there was no fallback.

2. **Simplistic Fallback**: The fallback didn't try to check user data or use AsyncStorage. It just hardcoded the destination.

3. **No Onboarding Resolver**: After auth, there was no dedicated screen to check and route users to the correct onboarding step.

4. **Architecture Mismatch**: The app tried to determine the next step from within auth screens, but the logic wasn't robust enough for edge cases.

---

## Issue 2: Profile Screen Crashes

### Problem Statement
When opening the Profile Settings screen, the app crashes with a null reference error.

### Root Cause Analysis

#### Code That Crashed
```typescript
export default function ProfileScreen() {
  const { profile } = useProfileContext();
  
  // ... later in render
  bio: (profile as any)?.bio || 'Yeni Repathly gezgini!',
```

#### The Problem Chain

**Step 1**: Component mounts
```typescript
const { profile, isLoading, fetchProfile } = useProfileContext();
```
At this point, `profile` is null (not yet fetched).

**Step 2**: No fetch call
```typescript
// ❌ NO useEffect to call fetchProfile()
// App tries to render immediately
```

**Step 3**: Render tries to access null
```typescript
bio: (profile as any)?.bio  // ❌ profile is null
```

Even with optional chaining `?.`, there could be other properties being accessed elsewhere in the render that don't have safe fallbacks.

#### Why It Wasn't Fixed Before

The profile screen had:
- No `useEffect` to fetch data
- No loading state
- No error state
- No defensive null checks

The component assumed `profile` would magically exist, which it never did.

### Why It's a Crash and Not Just Missing Data

The crash likely occurred because:
1. Some inline computed property tried to access `profile.something` without optional chaining
2. Rendering nested properties without checking parent first
3. TypeScript saying it's safe (with `as any`), but runtime failing
4. Missing image URLs causing layout crashes
5. Redux/Context updated triggering re-render before data loaded

---

## Issue 3: No Persistent Onboarding State

### Problem Statement
There was no reliable way to track which onboarding steps the user had completed. State was only in memory.

### Root Cause Analysis

#### The Architecture Problem

```
AuthContext (React State - in memory only)
    ↓
Uses user.hasCompletedProfile flag from backend
    ↓
But this flag is ONLY available while user is logged in AND context is active
    ↓
App restart or context reset = state lost
```

#### The Missing Piece

There was no:
- AsyncStorage persistence of onboarding flags
- Local source of truth for onboarding status
- Way to resume onboarding if app was closed mid-flow
- Fallback if context wasn't immediately available

#### Flow of State Loss

```
1. User signs up
   ├─ hasSelectedLanguage = true (saved in context only)
   ├─ hasCompletedProfile = true (saved in context only)
   └─ hasSelectedExperiences = false (saved in context only)

2. User closes app mid-experience-selection

3. App restarts
   ├─ AuthContext re-initializes
   ├─ All state variables reset to false
   └─ User loses progress
```

#### Why Authorization Status But Not Onboarding Status?

The app DID persist:
- Auth token (in SecureStorage) ← Backend-focused
- User object (in SecureStorage) ← Backend-focused

But it did NOT persist:
- Which onboarding steps were completed ← Frontend-specific
- Onboarding start time
- Partial progress
- Resumed state

This is the category error: backend state was persisted but frontend state wasn't.

---

## Design Issues Found

### 1. No Separation of Concerns
**Problem**: Onboarding logic was scattered across:
- register.tsx (signup flow)
- login.tsx (login flow)
- AuthContext (state)
- Multiple onboarding screens

**Better**: Centralized in onboardingManager.ts

### 2. No Router Resolution Layer
**Problem**: Auth screens directly determined where to route

**Better**: Dedicated resolver screen that handles routing logic

### 3. Fallback Not Robust
**Problem**: Fallback in useAuth() was a hardcoded string

**Better**: Fallback checks actual stored state (AsyncStorage)

### 4. No Loading States
**Problem**: Profile screen tried to render before data loaded

**Better**: Explicit loading, error, and success states

### 5. No Error Recovery
**Problem**: If profile fetch failed, app crashed

**Better**: Error state with retry button

---

## Why These Issues Existed

1. **MVP Focus**: App was built quickly as an MVP, hardcoding happy paths
2. **Context-Only State**: Redux or MobX would have been more robust
3. **No TypeScript Strictness**: Using `as any` and optional chaining hid issues
4. **Limited Testing**: Edge cases like app restart weren't tested
5. **No Observable State**: Couldn't see what was happening in onboarding
6. **No Analytics**: No tracking of where users got stuck or dropped off

---

## The Fix Strategy

Rather than patch individual issues, we fixed the architecture:

1. **Centralized Onboarding Logic** → onboardingManager.ts
2. **Persistent State** → AsyncStorage backed
3. **Dedicated Router** → OnboardingResolver screen
4. **Synced State** → AsyncStorage ↔ Backend sync on auth
5. **Defensive Rendering** → Loading, error, null checks everywhere
6. **Type Safe** → Full TypeScript, no `as any`

This ensures:
- ✓ No skipping steps
- ✓ Can resume if app closes
- ✓ Works offline after sync
- ✓ No null reference crashes
- ✓ Clear error states
- ✓ Maintainable code
