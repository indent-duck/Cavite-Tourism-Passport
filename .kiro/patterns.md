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
\\\	ypescript
import { useEffect, useRef, useState } from 'react';
import { Keyboard, ScrollView } from 'react-native';
\\\

2. **Create refs and state:**
\\\	ypescript
const scrollViewRef = useRef<any>(null);
const [inputLayouts, setInputLayouts] = useState<Record<string, number>>({});
\\\

3. **Add keyboard listener (optional, for global scroll):**
\\\	ypescript
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
\\\

4. **Create scroll helper function:**
\\\	ypescript
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
\\\

5. **Track input positions with onLayout:**
\\\	ypescript
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
\\\

6. **Pass ref to ScreenContainer:**
- Update ScreenContainer interface: \scrollViewRef?: React.RefObject<any>\
- Pass ref to ScrollView: \<ScrollView ref={scrollViewRef} ...>\
- Use in screen: \<ScreenContainer scrollViewRef={scrollViewRef} ...>\

7. **Adjust offsets based on content:**
- Small offset (50px): for fields near the top
- Medium offset (100px): for mid-form fields
- Large offset (150-200px): for fields that need to show content below them (e.g., password with criteria checklist)

8. **Ensure sufficient bottom padding:**
\\\	ypescript
contentContainerStyle={{ paddingBottom: spacing.xxl * 6 }} // ~192px
\\\

**Key Points:**
- Use \useRef<any>(null)\ to avoid TypeScript ref type conflicts with React Native's ScrollView types
- The 100ms setTimeout allows keyboard animation to start before scrolling
- Larger offsets for password fields ensure criteria checklists and buttons remain visible
- This approach works reliably across all Android devices

**Files Modified:**
- Screen file (e.g., \signup/details.tsx\): Add refs, state, listeners, and onFocus handlers
- \ScreenContainer.tsx\: Add optional \scrollViewRef\ prop and pass to ScrollView

**Related Issues:**
- Task 16.2: Fix keyboard covering input fields on Sign Up Step 3
- Task 16.3: Similar fix needed for Forgot Password Step 3

---

## [Future patterns will be added here as they're discovered]
