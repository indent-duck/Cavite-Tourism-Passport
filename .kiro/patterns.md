# Development Patterns & Solutions

This file documents common issues encountered in this project and their solutions, so they can be quickly referenced when similar problems arise in other components.

---

## Keyboard Covering Input Fields (Android)

**Problem:**
- Keyboard covers input fields and buttons when user taps an input
- KeyboardAvoidingView with 'padding' or 'height' behavior doesn't work reliably on Android
- Native 'pan' mode (softwareKeyboardLayoutMode) is insufficient for ScrollView-based forms

**Solution:**
Implement manual scroll-to-input behavior using refs and the Keyboard API. There are two approaches: per-input tracking with `onLayout`, or global keyboard listener with fixed scroll position.

**Approach A: Global Keyboard Listener (Simpler, Recommended for most forms)**

Use this when you want all inputs to trigger the same scroll behavior.

**Implementation Steps:**

1. **Import required modules:**
```typescript
import { useEffect, useRef } from 'react';
import { Keyboard } from 'react-native';
```

2. **Create ref:**
```typescript
const scrollViewRef = useRef<any>(null);
```

3. **Add keyboard listeners:**
```typescript
useEffect(() => {
  const keyboardDidShowListener = Keyboard.addListener(
    'keyboardDidShow',
    () => {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: 200, // Adjust based on your form height
          animated: true,
        });
      }, 100);
    }
  );

  const keyboardDidHideListener = Keyboard.addListener(
    'keyboardDidHide',
    () => {
      // Optional: Scroll back to top when keyboard closes
      scrollViewRef.current?.scrollTo({
        y: 0,
        animated: true,
      });
    }
  );

  return () => {
    keyboardDidShowListener.remove();
    keyboardDidHideListener.remove();
  };
}, []);
```

4. **Pass ref to ScreenContainer:**
```typescript
<ScreenContainer scrollViewRef={scrollViewRef} contentContainerStyle={{ paddingBottom: spacing.xxl * 6 }}>
```

**Approach B: Per-Input Tracking (More precise, for complex forms)**

Use this when different inputs need different scroll positions.

**Approach B: Per-Input Tracking (More precise, for complex forms)**

Use this when different inputs need different scroll positions.

**Implementation Steps:**

1. **Import required modules:**
```typescript
import { useEffect, useRef, useState } from 'react';
import { Keyboard, ScrollView } from 'react-native';
```

2. **Create refs and state:**
```typescript
const scrollViewRef = useRef<any>(null);
const [inputLayouts, setInputLayouts] = useState<Record<string, number>>({});
```

3. **Create scroll helper function:**
```typescript
const scrollToInput = (inputKey: string, extraOffset = 100) => {
  const yPosition = inputLayouts[inputKey];
  if (yPosition !== undefined && scrollViewRef.current) {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: Math.max(0, yPosition - extraOffset),
        animated: true,
      });
    }, 100);
  }
};
```

4. **Track input positions with onLayout:**
```typescript
<View
  style={styles.fieldContainer}
  onLayout={(event) => {
    setInputLayouts((prev) => ({
      ...prev,
      inputName: event.nativeEvent.layout.y,
    }));
  }}
>
  <TextInput
    onFocus={() => scrollToInput('inputName', 50)}
    // ... other props
  />
</View>
```

5. **Pass ref to ScreenContainer:**
- Update ScreenContainer interface: `scrollViewRef?: React.RefObject<any>`
- Pass ref to ScrollView: `<ScrollView ref={scrollViewRef} ...>`
- Use in screen: `<ScreenContainer scrollViewRef={scrollViewRef} ...>`

6. **Adjust offsets based on content:**
- Small offset (50px): for fields near the top
- Medium offset (100px): for mid-form fields
- Large offset (150-200px): for fields that need to show content below them (e.g., password with criteria checklist)

7. **Ensure sufficient bottom padding:**
```typescript
contentContainerStyle={{ paddingBottom: spacing.xxl * 6 }} // ~192px
```

**Key Points:**
- **Approach A** is simpler and sufficient for most forms - use a fixed scroll position for all inputs
- **Approach B** provides more control but requires tracking each input's position with onLayout
- Use `useRef<any>(null)` to avoid TypeScript ref type conflicts with React Native's ScrollView types
- The 100ms setTimeout allows keyboard animation to start before scrolling
- The `keyboardDidHide` listener is optional - it auto-scrolls back to top when keyboard closes, but may interfere if user wants to tap buttons immediately after dismissing keyboard
- Adjust the Y scroll value based on your form's content height (100-400px typically works)
- This approach works reliably across all Android devices

**Files Modified:**
- Screen file (e.g., `login.tsx`): Add keyboard listeners with refs (Approach A)
- Screen file (e.g., `signup/details.tsx`): Add refs, state, listeners, and onFocus handlers (Approach B)
- `ScreenContainer.tsx`: Add optional `scrollViewRef` prop and pass to ScrollView

**Related Issues:**
- Task 16.1: Fix keyboard covering input fields on Login screen (uses Approach A)
- Task 16.2: Fix keyboard covering input fields on Sign Up Step 3 (uses Approach B with password field focus tracking)
- Task 16.3: Similar fix needed for Forgot Password Step 3

---

## Navigation Stack Piling Between Sibling Entry Screens

**Problem:**
- Navigating between sibling authentication screens (Login ↔ Sign Up) creates navigation history
- Android back button cycles between screens instead of exiting the app
- Using `router.push()` accumulates stack entries
- Initial attempt with `router.replace()` failed with error: "The action 'GO_BACK' was not handled by any navigator" because there was no initial screen to replace when the app first loaded

**Root Cause:**
The back button on the Sign Up screen used `router.back()`, which would navigate to Login and create a parent-child relationship instead of maintaining them as sibling entry points.

**Solution:**
Use `router.replace()` consistently for ALL navigation between Login and Sign Up screens, including the back button.

**Implementation:**

1. **Login Screen - "Sign up" link:**
```typescript
<Pressable onPress={() => router.replace('/signup/email')}>
  <Text style={styles.signupLink}>Sign up</Text>
</Pressable>
```

2. **Sign Up Screen - Back button (top left):**
```typescript
<Pressable onPress={() => router.replace('/login')} style={styles.backButton}>
  <Ionicons name="arrow-back" size={20} color={colors.text} />
</Pressable>
```

3. **Sign Up Screen - "Log in" link:**
```typescript
<Pressable onPress={() => router.replace('/login')}>
  <Text style={styles.loginLink}>Log in</Text>
</Pressable>
```

**Why This Works:**
- `router.replace()` replaces the current screen in the navigation stack instead of pushing a new one
- When all navigation between Login ↔ Sign Up uses replace, they maintain their sibling relationship
- The Android back button will exit the app from either screen since there's no parent screen to return to
- Unlike the initial `router.replace()` error, this works because the app redirects from `index.tsx` to `/login` first, establishing an initial navigation state

**Key Points:**
- **DO NOT use `router.back()` on the Sign Up screen** - it creates the parent-child relationship
- **DO NOT use `router.push()`** - it accumulates navigation history
- **DO NOT use `router.navigate()`** - it may push or unwind based on stack state, creating inconsistent behavior
- All cross-navigation between sibling entry screens must use `router.replace()` consistently
- Sub-flows (like "Forgot password?") should still use `router.push()` since they are intended to return to the parent screen

**Applies To:**
- Login ↔ Sign Up navigation
- Any sibling authentication entry points
- Root-level screens where the back button should exit the app

**Files Modified:**
- `src/app/(auth)/login.tsx`: "Sign up" link
- `src/app/(auth)/signup/email.tsx`: Back button and "Log in" link

**Related Issues:**
- Task 16.5: Fix navigation stack piling between Login and Sign Up screens

---

## Navigation Stack Piling Between Parent Screen and Sub-Flow

**Problem:**
- Navigating from a parent screen (Login) to a sub-flow (Forgot Password) and back creates navigation stack issues
- When using cross-flow links to return from sub-flow to parent, the stack accumulates: `[Login, Forgot, Login]`
- Android back button from Login incorrectly returns to the Forgot Password screen
- Using `router.replace()` or `router.navigate()` from sub-flow to parent doesn't properly unwind the stack

**Root Cause:**
The sub-flow screens need to **go back** to the existing parent screen, not create a new instance of it. Methods like `router.replace()` and `router.navigate()` don't prevent duplicate screens when returning to a parent that's already in the stack.

**Solution:**
Use `router.back()` for shallow sub-flows (1 step deep) and `router.dismissAll()` + `router.replace()` for deep sub-flows (multiple steps deep).

**Implementation:**

1. **Parent Screen - Link to sub-flow (correct - no change needed):**
```typescript
// Login screen - "Forgot password?" link
<Pressable onPress={() => router.push('/forgot/email')}>
  <Text style={styles.forgotPasswordText}>Forgot password?</Text>
</Pressable>
```
*Use `router.push()` because this IS a parent-child relationship - the sub-flow should be able to go back.*

2. **Sub-Flow Step 1 - Return to parent link:**
```typescript
// Forgot Password Email screen - "Log in" link
<Pressable onPress={() => router.back()}>
  <Text style={styles.loginLink}>Log in</Text>
</Pressable>
```
*Use `router.back()` to pop back to the existing parent screen (1 screen back).*

3. **Sub-Flow Step 3 (Deep) - Cancel and return to parent:**
```typescript
// Forgot Password New Password screen - "Cancel and return to sign in" link
const handleCancel = () => {
  router.dismissAll();
  router.replace('/login');
};
```
*Use `router.dismissAll()` to clear all sub-flow screens, then `router.replace()` to show the parent.*

**Why This Works:**
- `router.back()` pops the current screen and returns to the screen underneath (the existing parent)
- `router.dismissAll()` clears the entire navigation stack, preventing any sub-flow screens from remaining
- `router.replace()` after dismissAll ensures a clean slate with just the parent screen
- This prevents duplicate parent screens in the stack

**Navigation Flow Examples:**

*Shallow sub-flow (1 step):*
```
Login → push → Forgot Email → back() → Login (same instance) → back → exit app ✓
```

*Deep sub-flow (3 steps):*
```
Login → push → Forgot Email → push → Forgot Verify → push → Forgot New Password
       → dismissAll() + replace('/login') → Login (clean stack) → back → exit app ✓
```

**Key Points:**
- **Sub-flow entry:** Parent → Sub-flow should use `router.push()` (parent-child relationship)
- **Sub-flow exit (shallow):** Use `router.back()` to return to existing parent
- **Sub-flow exit (deep):** Use `router.dismissAll()` + `router.replace()` to clear all sub-flow screens
- **DO NOT use `router.replace()` alone** - it replaces the current screen but can leave intermediate screens in the stack
- **DO NOT use `router.navigate()` alone** - it may not properly unwind to an existing parent screen
- The distinction is: sibling screens (Login ↔ Sign Up) use replace; parent-child (Login → Forgot) uses push/back

**Applies To:**
- Login → Forgot Password navigation
- Any parent screen with a multi-step sub-flow
- Flows where "Cancel" or "Return" should cleanly exit back to the parent

**Files Modified:**
- `src/app/(auth)/forgot/email.tsx`: "Remember your password? Log in" link uses `router.back()`
- `src/app/(auth)/forgot/new-password.tsx`: "Cancel and return to sign in" uses `router.dismissAll()` + `router.replace('/login')`

**Related Issues:**
- Task 16.6: Fix navigation stack piling between Login and Forgot Password screens

---

## [Future patterns will be added here as they're discovered]

