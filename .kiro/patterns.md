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

## Segmented Control with Icons

**Design Pattern:**
Segmented controls can include icons alongside text labels for better visual hierarchy and clarity.

**Implementation:**

The `SegmentedControl` component supports an optional `icon` prop in each option:

```typescript
interface SegmentedControlOption {
  label: string;
  value: string;
  icon?: ReactNode; // Optional icon to display before label
}
```

**Example Usage (Discover Screen):**

```typescript
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/theme';

<SegmentedControl
  options={[
    {
      label: 'Events',
      value: 'events',
      icon: (
        <MaterialCommunityIcons
          name="party-popper"
          size={14}
          color={selectedView === 'events' ? colors.background : colors.textSecondary}
        />
      ),
    },
    {
      label: 'About Cavite',
      value: 'about',
      icon: (
        <MaterialCommunityIcons
          name="map"
          size={14}
          color={selectedView === 'about' ? colors.background : colors.textSecondary}
        />
      ),
    },
  ]}
  selectedValue={selectedView}
  onValueChange={(value) => setSelectedView(value as 'events' | 'about')}
/>
```

**Key Design Details:**
- **Icon size:** 14px (matches design reference)
- **Icon color:** 
  - Active state: `colors.background` (white)
  - Inactive state: `colors.textSecondary` (gray)
- **Layout:** Icons appear before text labels with `spacing.xs` gap
- **Height:** Reduced from 44px to 36px for a thinner, more compact appearance
- **Font size:** Uses `typography.labelSmall` instead of `labelMedium`

**Visual Reference:**
From `design/screens/08-discover/discover_cavite_full_view_events.html`:
- Events button uses Material Symbol "celebration" (party popper icon)
- About Cavite button uses Material Symbol "map" (map icon)
- Pills are smaller and more compact than standard buttons

**Component Files:**
- `src/components/ui/SegmentedControl.tsx`: Core component with icon support
- `src/app/(tabs)/discover.tsx`: Example implementation

**Related Design Patterns:**
- Used in Discover screen for Events/About Cavite toggle
- Can be applied to Explore screen for Sites/Itineraries toggle if icons are added in the future

---

## Section Headings Typography

**Design Pattern:**
Section headings for major content areas should use Inter Bold (font weight 700) for stronger visual hierarchy.

**Implementation:**

Override the `fontWeight` in the heading style:

```typescript
heading: {
  ...typography.headlineLarge,
  color: colors.text,
  fontWeight: '700', // Inter Bold
},
```

**Example Usage:**

```typescript
<Text style={styles.heading}>Provincial Festivals & Events</Text>
```

**Key Design Details:**
- **Font weight:** 700 (Inter Bold)
- **Base style:** `typography.headlineLarge` (provides size and line height)
- **Color:** `colors.text` (primary text color #1B2A49)

**Visual Reference:**
From `design/screens/08-discover/discover_cavite_full_view_events.html`:
- "Provincial Festivals & Events" heading uses `font-bold` (weight 700)

**Applies To:**
- Major section headings on tab screens
- Content category titles
- Any heading that needs strong emphasis

**Related Files:**
- `src/app/(tabs)/discover.tsx`: Events section heading

---

## Screen Container Horizontal Margins

**Design Pattern:**
Maintain consistent horizontal spacing across all screens by avoiding redundant padding at the content container level.

**Implementation:**

**Rule:** Content containers within scrollable screens should NOT add their own horizontal padding. Horizontal margins are handled by the `ScreenContainer` component via safe area insets.

**Correct Pattern:**
```typescript
// ❌ WRONG - Do not add horizontal padding to content containers
const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: spacing.base, // Don't do this!
    gap: spacing.base,
  },
});

// ✅ CORRECT - Let ScreenContainer handle horizontal spacing
const styles = StyleSheet.create({
  contentContainer: {
    gap: spacing.base, // Only vertical spacing and gaps
  },
});
```

**Screen Structure:**
```typescript
<ScreenContainer
  scrollable={true}
  edges={['left', 'right']} // Safe area insets provide horizontal spacing
  withTabBarPadding={true}
>
  <View style={styles.segmentedControlContainer}>
    {/* Segmented control - can have its own padding if needed */}
  </View>
  
  <View style={styles.contentContainer}>
    {/* Content cards, lists, etc. - no horizontal padding here */}
  </View>
</ScreenContainer>
```

**When Individual Padding IS Needed:**
- Segmented controls or header elements that need to be inset from edges
- Individual cards or components that need internal padding
- Never on the main content wrapper

**Reference Implementation:**
- `src/app/(tabs)/discover.tsx`: Both Events and About Cavite views have no horizontal padding on their content containers
- `src/components/discover/AboutCaviteContent.tsx`: ScrollView contentContainer has no horizontal padding
- Cards and sections within these views handle their own internal spacing

**Key Points:**
- **Consistency:** All tab screens should follow this pattern
- **Safe areas:** The `ScreenContainer` with `edges={['left', 'right']}` handles device-specific safe areas
- **Cards:** Individual cards can have their own padding, margins, or border radius
- **Do not double-pad:** Adding padding at both the container and content level creates inconsistent spacing

**Applies To:**
- All tab screens (Explore, Passport, Discover, Account)
- Stack screens that use ScreenContainer with scrollable content
- Any full-width content layout

---

## Using Inter Bold 700 Font Weight

**Design Pattern:**
When instructed to use "Inter Bold 700" for text elements, this means using the explicitly loaded bold font family variant, not just setting `fontWeight: '700'`.

**Problem:**
In React Native with custom fonts loaded via `@expo-google-fonts`, setting `fontWeight: '700'` alone does not apply the bold variant. The font family name must explicitly reference the loaded weight variant.

**Solution:**
Use `fontFamily: 'Inter_700Bold'` instead of `fontWeight: '700'`.

**Implementation:**

**❌ WRONG - Does not work with custom fonts:**
```typescript
const styles = StyleSheet.create({
  heading: {
    ...typography.headlineLarge,
    color: colors.text,
    fontWeight: '700', // This won't apply the bold font
  },
});
```

**✅ CORRECT - Uses the loaded font variant:**
```typescript
const styles = StyleSheet.create({
  heading: {
    ...typography.headlineLarge,
    color: colors.text,
    fontFamily: 'Inter_700Bold', // This applies the bold font
  },
});
```

**Available Inter Font Variants:**
The following Inter fonts are loaded in `src/app/_layout.tsx`:
- `Inter_400Regular` - Regular weight (400)
- `Inter_500Medium` - Medium weight (500)
- `Inter_600SemiBold` - SemiBold weight (600)
- `Inter_700Bold` - Bold weight (700)

**When to Use:**
- Section headings that need strong emphasis
- Header titles in navigation bars
- Primary content titles
- Any text that the design specifies as "Inter Bold 700"

**Key Points:**
- The `fontWeight` property works for system fonts, but NOT for custom loaded fonts
- Always use the explicit `fontFamily` property with the weight variant name
- The typography theme tokens provide `fontWeight` values, but these may need to be overridden with `fontFamily` for custom fonts
- Can be combined with other typography properties like `fontSize`, `lineHeight`, `color`

**Example Usage:**
```typescript
// Header title
<Text style={[typography.headlineSmall, { fontFamily: 'Inter_700Bold' }]}>
  Event Information
</Text>

// Festival name
const styles = StyleSheet.create({
  festivalName: {
    ...typography.headlineLarge,
    color: colors.text,
    fontFamily: 'Inter_700Bold',
    marginBottom: spacing.md,
  },
});
```

**Files Modified:**
- `src/components/ui/ScreenContainer.tsx`: Header title uses `Inter_700Bold`
- `src/app/events/[id].tsx`: Festival name title uses `Inter_700Bold`

**Related Issues:**
- Task: Make Event Information header and festival name use Inter Bold 700

---

## [Future patterns will be added here as they're discovered]

