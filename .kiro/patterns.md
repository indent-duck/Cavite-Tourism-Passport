# Development Patterns & Solutions

This file documents common issues encountered in this project and their solutions, so they can be quickly referenced when similar problems arise in other components.

---

## Keyboard Covering Input Fields (Android)

**Problem:**
- Keyboard covers input fields and buttons when user taps an input
- KeyboardAvoidingView with 'padding' or 'height' behavior doesn't work reliably on Android
- Native 'pan' mode (softwareKeyboardLayoutMode) is insufficient for ScrollView-based forms

**Solution:**
Implement manual scroll-to-input behavior using refs and the Keyboard API.

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

3. **Add keyboard listener (optional, for global scroll):**
```typescript
useEffect(() => {
  const keyboardDidShowListener = Keyboard.addListener(
    'keyboardDidShow',
    () => {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: 100,
          animated: true,
        });
      }, 100);
    }
  );
  return () => keyboardDidShowListener.remove();
}, []);
```

4. **Create scroll helper function:**
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

5. **Track input positions with onLayout:**
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

6. **Pass ref to ScreenContainer:**
- Update ScreenContainer interface: `scrollViewRef?: React.RefObject<any>`
- Pass ref to ScrollView: `<ScrollView ref={scrollViewRef} ...>`
- Use in screen: `<ScreenContainer scrollViewRef={scrollViewRef} ...>`

7. **Adjust offsets based on content:**
- Small offset (50px): for fields near the top
- Medium offset (100px): for mid-form fields
- Large offset (150-200px): for fields that need to show content below them (e.g., password with criteria checklist)

8. **Ensure sufficient bottom padding:**
```typescript
contentContainerStyle={{ paddingBottom: spacing.xxl * 6 }} // ~192px
```

**Key Points:**
- Use `useRef<any>(null)` to avoid TypeScript ref type conflicts with React Native's ScrollView types
- The 100ms setTimeout allows keyboard animation to start before scrolling
- Larger offsets for password fields ensure criteria checklists and buttons remain visible
- This approach works reliably across all Android devices

**Files Modified:**
- Screen file (e.g., `signup/details.tsx`): Add refs, state, listeners, and onFocus handlers
- `ScreenContainer.tsx`: Add optional `scrollViewRef` prop and pass to ScrollView

**Related Issues:**
- Task 16.2: Fix keyboard covering input fields on Sign Up Step 3
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
- Task 16.6: Similar fix may be needed between Login and Forgot Password screens

---

## [Future patterns will be added here as they're discovered]
