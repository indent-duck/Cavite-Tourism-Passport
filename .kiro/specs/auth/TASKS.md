# Implementation Plan: Auth

## Overview

Implement the complete authentication UI for the Cavite Tourism Passport app: login, sign up (3 steps), and forgot password (3 steps + success). All screens match designs in `design/screens/01-auth/`. This is a UI-first implementation using mock authentication with code "123456" succeeding and password "wrong" failing.

## Tasks

- [x] 1. Create auth constants
  - Create or update `src/lib/constants.ts` with auth-specific constants
  - Add `VERIFICATION_CODE_LENGTH = 6`
  - Add `RESEND_CODE_TIMEOUT = 60` (seconds)
  - Add `MIN_PASSWORD_LENGTH = 8`
  - Add `PASSWORD_REQUIRES_NUMBER = true`
  - Add `PASSWORD_REQUIRES_UPPERCASE = true`
  - Add `PASSWORD_REQUIRES_SPECIAL = true`
  - Add `EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/`
  - _Requirements: Foundation, validation rules_

- [x] 2. Create useAuth hook
  - Create `src/hooks/useAuth.ts`
  - Wrap `signIn(email, password)` from `@/data/api` with loading and error state
  - Wrap `signUp(email, name, address, password)` with loading and error state
  - Wrap `sendVerificationCode(email)` with loading and error state
  - Wrap `resetPassword(email, newPassword)` with loading and error state
  - Each function returns `{ fn, loading, error }` where `fn` is the wrapped async function
  - Catch errors from API calls and set user-friendly error messages in state
  - Navigation is handled by screens, not the hook
  - _Requirements: Auth API abstraction with UI state_

- [x] 3. Create useVerification hook
  - Create `src/hooks/useVerification.ts`
  - Wrap `verifyCode(email, code)` from `@/data/api` with loading and error state
  - Implement countdown timer starting at `RESEND_CODE_TIMEOUT` (60 seconds)
  - Decrement countdown every second with `setInterval` in `useEffect`
  - Stop countdown at 0 and clean up interval on unmount
  - Provide `resendCode(email)` function that calls `sendVerificationCode` and resets countdown
  - Export `{ verifyCode, resendCode, loading, error, countdown, canResend }` where `canResend = countdown === 0`
  - _Requirements: Code verification with timer and resend_

- [x] 4. Create CodeInput component
  - Create `src/components/ui/CodeInput.tsx`
  - Accept props: `value: string`, `onChangeText: (code: string) => void`, `length?: number` (default 6), `error?: string`
  - Render 6 individual boxes in a horizontal row with 8px gap
  - Each box: 54px height, 12px border radius, surface background color
  - Filled box: shows digit in headlineLarge style with primary color
  - Focused box: lighter background (surface-container-lowest if available, else slightly lighter surface), show cursor
  - Empty box: small dot indicator (8px diameter, outline-variant color at 60% opacity, centered)
  - Use individual `TextInput` components with `maxLength={1}` and `keyboardType="number-pad"`
  - Auto-focus first box on mount
  - Auto-advance to next box when digit entered
  - Auto-backspace to previous box when delete pressed on empty box
  - Call `onChangeText` with complete code string when all boxes filled
  - Display error message below boxes if error prop provided
  - _Requirements: 6-digit verification code input_

- [x] 5. Create PasswordCriteria component
  - Create `src/components/ui/PasswordCriteria.tsx`
  - Accept props: `password: string`, `style?: StyleProp<ViewStyle>`
  - Display 4 criteria as a vertical list with checkmarks that update live as user types
  - Criteria: "At least 8 characters", "Includes a number (0-9)", "Includes uppercase letter (A-Z)", "Includes special character (!@#$%^&*)"
  - Each criterion: check circle icon (Ionicons 'checkmark-circle') in success color if met, else 'ellipse-outline' in gray
  - Use bodySmall text style from theme
  - 8px spacing between criteria rows
  - Validation logic: length >= 8, `/\d/.test(password)`, `/[A-Z]/.test(password)`, `/[!@#$%^&*]/.test(password)`
  - _Requirements: Password strength validation with visual feedback_

- [x] 6. Implement login screen
  - Update `src/app/(auth)/login.tsx` replacing placeholder
  - Use ScreenContainer with scrollable prop
  - Layout from top to bottom: heritage seal (80px circle, simplified icon or "1898" text), "Official Digital Pass" badge (pill shape), headline "Cavite Tourism Passport" (displayLargeMobile), description text (bodyMedium), form card (white background, 12px radius, 16px padding), "Don't have an account? Sign up" link, provincial footnote at bottom
  - Form card contains: email TextInput (with mail icon), password TextInput (with lock icon and visibility toggle), "Forgot password?" link (right-aligned, small), "Log in" Button (primary variant, full width, arrow_forward icon)
  - Use `useAuth` hook for signIn function
  - Validate: email and password required and non-empty
  - Show loading state on button during API call
  - On error, display error message using TextInput error prop
  - On success, navigate to `/(tabs)/explore` with router.push
  - "Forgot password?" link navigates to `/forgot/email`
  - "Sign up" link navigates to `/signup/email`
  - Test: password "wrong" shows error, valid credentials navigate to Explore
  - Email input: `keyboardType="email-address"`, `autoCapitalize="none"`
  - Password input: `secureTextEntry={true}`, `autoCapitalize="none"`, toggle button for visibility
  - _Requirements: 1.1 (Login screen)_

- [x] 7. Implement sign up step 1 - email entry
  - Update `src/app/(auth)/signup/email.tsx` replacing placeholder
  - Use ScreenContainer with scrollable prop
  - Layout: back button (top-left, 40px circle), step badge "STEP 1 OF 3" (top-center, pill), progress bar (33.33% fill, accent color), book icon badge "Official Tourism Identity", headline "Create your digital passport" (displayLargeMobile), description, email TextInput, info card with "Civic Exploration ID" and shield icon (optional, keep if in design), terms checkbox with text "By continuing, you agree to the Provincial Tourism Terms of Service & Privacy Policy.", "Continue" Button (primary, full width, arrow_forward icon), "Already have an account? Log in" link (bottom center)
  - Use `useAuth.sendCode` function
  - Validate email format with EMAIL_REGEX from constants
  - Terms checkbox must be checked to enable "Continue" button
  - On "Continue" success, navigate to `/signup/verify` with email in router params
  - Back button calls `router.back()`
  - "Log in" link navigates to `/login`
  - Show loading state on button
  - _Requirements: 1.2 (Sign up step 1)_

- [x] 8. Implement sign up step 2 - code verification
  - Update `src/app/(auth)/signup/verify.tsx` replacing placeholder
  - Use ScreenContainer with scrollable prop
  - Get email from router params: `const { email } = useLocalSearchParams<{ email: string }>()`
  - Use `useVerification` hook
  - Layout: back button, step badge "Step 2 of 3" with shield icon, progress bar (66.67% fill), mail icon (32px filled) in 80px circle with pulsing background effect (optional), headline "Check your email" (displayLargeMobile), description "We sent a 6-digit verification code to {email}", "Edit email" link (small, with edit icon), CodeInput component (6 boxes), countdown timer "Resend code in 00:{seconds}" (clock icon) or "Resend code" link when countdown reaches 0, "Verify" Button (primary, full width, arrow_forward icon), help card "Can't find the email?" with help_outline icon (optional)
  - Format countdown as "00:45", "00:15", etc. with zero-padding
  - On "Verify" success with code "123456", navigate to `/signup/details` with email in params
  - On error, show error message from useVerification hook
  - "Resend code" link calls `resendCode(email)` and restarts countdown
  - "Edit email" link navigates back to `/signup/email`
  - Back button calls `router.back()`
  - _Requirements: 1.3 (Sign up step 2)_

- [x] 9. Implement sign up step 3 - personal details
  - Update `src/app/(auth)/signup/details.tsx` replacing placeholder
  - Use ScreenContainer with scrollable prop
  - Get email from router params
  - Use `useAuth.signUp` function
  - Layout: back button, step badge "Step 3 of 3" with dot indicator, progress bar (100% fill), badge "FINAL STEP" with shield icon, headline "Your personal details" (displayLargeMobile), description, form with 4 TextInputs (Full Name with badge icon and "As shown on valid ID" hint, Residential Address with location_on icon and "Cavite Local" hint, Password with lock icon and visibility toggle, Confirm Password with lock_reset icon and visibility toggle), municipality chips below address (Imus, Bacoor, Dasmariñas, Tagaytay, Kawit - optional, keep if in design), PasswordCriteria component below Password field, "Passport Ready To Issue" preview card (optional), "Create account" Button (primary, full width, check_circle filled icon), trust seal footer with shield icon and data privacy text
  - Validate: name required, address required, password min 8 chars and meets criteria, confirm password matches password
  - Municipality chips: clicking a chip sets the address field value (optional feature)
  - On "Create account" success, navigate to `/(tabs)/explore` with `router.replace` to clear auth stack
  - Show loading state on button
  - Back button calls `router.back()`
  - _Requirements: 1.4 (Sign up step 3)_

- [x] 10. Implement forgot password step 1 - email entry
  - Update `src/app/(auth)/forgot/email.tsx` replacing placeholder
  - Use ScreenContainer with scrollable prop
  - Use `useAuth.sendCode` function
  - Layout: back button, title badge "Password Recovery" or step indicator "STEP 1 OF 3", mail icon in decorative circles, headline "Forgot your password?" (displayLargeMobile), description "Enter your email address and we'll send you a 6-digit verification code to reset your password.", email TextInput, security notice with shield icon (optional), "Send verification code" Button (accent variant, full width, arrow_forward icon), "Remember your password? Log in" link (center, bottom), help footer "Need help? Contact support@cavite.gov.ph" (optional, very small)
  - Validate email format with EMAIL_REGEX
  - On success, navigate to `/forgot/verify` with email in params
  - Back button calls `router.back()` or navigates to `/login`
  - "Log in" link navigates to `/login`
  - Show loading state on button
  - _Requirements: 1.5 (Forgot password step 1)_

- [x] 11. Implement forgot password step 2 - code verification
  - Update `src/app/(auth)/forgot/verify.tsx` replacing placeholder
  - Use ScreenContainer with scrollable prop
  - Get email from router params
  - Use `useVerification` hook
  - Layout: same as signup verify screen but with title "Otp Verification" or "Password Recovery", step badge "Step 2 of 3", help card adjusted for password reset context
  - Countdown timer behavior identical to signup verify
  - On "Verify" success with code "123456", navigate to `/forgot/new-password` with email in params
  - "Resend code" and "Edit email" links work same as signup verify
  - Back button calls `router.back()`
  - _Requirements: 1.6 (Forgot password step 2)_

- [x] 12. Implement forgot password step 3 - new password entry
  - Update `src/app/(auth)/forgot/new-password.tsx` replacing placeholder
  - Use ScreenContainer with scrollable prop
  - Get email from router params
  - Use `useAuth.resetPassword` function
  - Layout: back button, title "New Password Reset" or step badge "Step 3 of 3", label "ACCOUNT RECOVERY" (uppercase small), lock icon with refresh arrow (32px in circle), headline "Set new password" (displayLargeMobile), description "Create a strong new password with at least 8 characters, consisting letters, numbers, and symbols.", New Password TextInput (lock icon, visibility toggle), Confirm New Password TextInput (lock icon, visibility toggle), PasswordCriteria component showing 4 criteria with live checkmarks, "Reset Password & Log in" Button (primary, full width, check_circle filled icon), "Cancel and return to sign in" link (center, small), trust seal footer (optional)
  - Validate: password min 8 chars and meets all criteria, confirm password matches password
  - On success, navigate to `/forgot/success`
  - "Cancel" link navigates to `/login`
  - Show loading state on button
  - Back button calls `router.back()`
  - _Requirements: 1.7 (Forgot password step 3)_

- [x] 13. Implement forgot password success screen
  - Update `src/app/(auth)/forgot/success.tsx` replacing placeholder
  - Use ScreenContainer without scrollable prop (content fits in viewport)
  - Layout: centered vertical layout, success icon check_circle (64px, success color, filled) in 120px circle background (10% opacity success color), headline "Password reset successful!" (displayLargeMobile, center-aligned), message "Your password has been successfully reset. You can now log in with your new password." (bodyMedium, center-aligned, max width 300px), "Log in" Button (primary, full width or max 300px, arrow_forward icon)
  - No design file provided, follow auth screen styling patterns
  - On "Log in", navigate to `/login` with `router.replace` to clear forgot password stack
  - No back button (success is terminal state)
  - _Requirements: 1.8 (Forgot password success)_

- [x] 14. Remove development placeholders from login screen
  - Open `src/app/(auth)/login.tsx`
  - Remove any temporary navigation buttons or dev-only UI elements (e.g., "Go to Explore" button)
  - Keep only production UI elements from task 6
  - _Requirements: Clean production-ready login screen_

- [x] 15. Checkpoint - run type check and linter
  - Run `npx tsc --noEmit` in terminal
  - Fix any TypeScript errors until command reports 0 errors
  - Run `npx expo lint` in terminal
  - Fix any lint errors until command passes (acceptable warnings only)
  - Verify no unused imports or variables
  - Verify all components follow project conventions (named exports for components, default exports only for route files)
  - _Requirements: Code quality standards met_

- [x] 16. Test all auth flows on physical Android phone
  - Start dev server with `npx expo start --dev-client`
  - Open app on phone over Wi-Fi
  - Test login flow: valid credentials navigate to Explore, password "wrong" shows error, "Forgot password?" and "Sign up" links work, loading state shows, keyboard handling works
  - Test sign up flow: step 1 email validation and terms checkbox work, step 2 code "123456" succeeds and countdown works (60 → 0), "Resend code" appears after 60s, "Edit email" returns to step 1, step 3 all validations work, password criteria checklist updates live, "Create account" succeeds and navigates to Explore, back button works at each step
  - Test forgot password flow: step 1 email entry works, step 2 code "123456" succeeds and countdown works, step 3 password criteria checklist updates, "Reset Password & Log in" navigates to success screen, success screen "Log in" button returns to login, back button works at each step
  - Verify Android back button and gesture work on every screen
  - Verify keyboard never covers input fields or buttons (KeyboardAvoidingView working)
  - _Requirements: All auth flows functional on target platform_

- [x] 16.1. Fix CodeInput cursor/typing indicator visual bug
  - Open `src/components/ui/CodeInput.tsx`
  - Issue: typing indicator appears inside the number box and pushes the number upward
  - Root cause: cursor position or text input alignment issue when focused
  - Fix: adjust TextInput styling to prevent cursor from displacing the digit
  - Possible solutions: set `caretHidden={true}` and show custom cursor, or adjust paddingVertical/height to accommodate cursor without shifting content
  - Test on physical Android phone: typing "123456" should not lift the last digit
  - _Requirements: Verification code input visual correctness_

- [x] 16.2. Fix keyboard covering input fields on Sign Up Step 3
  - Open `src/app/(auth)/signup/details.tsx`
  - Issue: keyboard covers input fields and "Create account" button
  - Fix: ensure ScreenContainer's KeyboardAvoidingView is properly configured
  - Verify `behavior` prop is set to "padding" for Android
  - Verify `keyboardVerticalOffset` accounts for status bar and header if present
  - Alternative: wrap form in ScrollView with `keyboardShouldPersistTaps="handled"` and adjust contentContainerStyle paddingBottom
  - Test on physical Android phone: tap each field, keyboard should never cover the active field or the button
  - _Requirements: Keyboard never covers input fields or buttons_

- [x] 16.3. Fix keyboard covering password criteria checklist on Forgot Password Step 3
  - Open `src/app/(auth)/forgot/new-password.tsx`
  - Issue: keyboard covers the password criteria checklist when typing
  - Fix: ensure ScreenContainer's KeyboardAvoidingView is properly configured, same approach as 16.2
  - Verify the criteria checklist is visible above keyboard when password fields are focused
  - May need to adjust ScrollView contentContainerStyle paddingBottom or KeyboardAvoidingView keyboardVerticalOffset
  - Test on physical Android phone: tap password field, criteria checklist should remain visible or scroll into view above keyboard
  - _Requirements: Password criteria checklist remains visible during password entry_

- [x] 16.4. Fix success screen back button navigation
  - Open `src/app/(auth)/forgot/success.tsx`
  - Issue: Android back button returns to New Password screen instead of Login screen
  - Expected: back button should return to Login screen (success is terminal state)
  - Fix: use `router.replace('/login')` instead of `router.push` when navigating to success screen from new-password screen, OR handle back button press in success screen to navigate to login
  - Alternative: in success.tsx, use `useFocusEffect` or `useEffect` with `BackHandler` to intercept back button and navigate to login
  - Test on physical Android phone: from success screen, tap back button or back gesture, should navigate to Login
  - _Requirements: Success screen is terminal state, back navigates to login_
- [x] 16.5. Fix navigation stack piling between Login and Sign Up screens
  - Issue: navigating between Login and Sign Up using "Sign up" and "Log in" links creates a navigation stack
  - Expected behavior: back button/gesture from Login or Sign Up should exit the app, not return to the other screen
  - Root cause: using `router.push()` creates navigation history stack
  - Fix option 1: use `router.replace()` instead of `router.push()` when navigating between Login and Sign Up
  - Fix option 2: use `Redirect` component with `href` prop instead of Link with push navigation
  - Apply fix to:
    - `src/app/(auth)/login.tsx`: "Sign up" link should replace, not push
    - `src/app/(auth)/signup/email.tsx`: "Log in" link should replace, not push
  - Test on physical Android phone: from Login tap "Sign up", from Sign Up tap back button ? should exit app. From Sign Up tap "Log in", from Login tap back button ? should exit app
  - _Requirements: Login and Sign Up are sibling entry points, not parent-child_

- [x] 16.6. Fix navigation stack piling between Login and Forgot Password screens
  - Issue: same as 16.5 but between Login and Forgot Password flows
  - Expected behavior: back button from Forgot Password Step 1 should return to Login, but subsequent back from Login should exit app (not cycle back to Forgot Password)
  - Apply same fix as 16.5:
    - `src/app/(auth)/login.tsx`: "Forgot password?" link should use push (correct, it's a sub-flow)
    - `src/app/(auth)/forgot/email.tsx`: "Log in" link should replace, not push
    - `src/app/(auth)/forgot/verify.tsx`: if "Log in" link exists, use replace
    - `src/app/(auth)/forgot/new-password.tsx`: "Cancel and return to sign in" link should replace
  - Test on physical Android phone: Login ? Forgot Password ? "Log in" link ? back button should exit app. Forgot Password Step 1 ? back button should return to Login
  - _Requirements: Forgot Password is a sub-flow of Login, but cross-links should replace_

- [x] 16.7. Fix Sign Up Step 1 Continue button validation
  - Open `src/app/(auth)/signup/email.tsx`
  - Issue: Continue button is enabled when checkbox is ticked even if email field is empty
  - Expected: Continue button should be enabled only when BOTH email is valid AND checkbox is ticked
  - Fix: update button `disabled` prop to check `!isEmailValid || !termsAccepted` where `isEmailValid` is `EMAIL_REGEX.test(email) && email.length > 0`
  - Ensure email validation runs on every keystroke or on blur
  - Test on physical Android phone: tick checkbox with empty email ? button disabled. Enter invalid email and tick checkbox ? button disabled. Enter valid email and tick checkbox ? button enabled
  - _Requirements: Form validation requires all fields to be valid_

- [ ] 17. Document design differences
  - Create `.kiro/specs/auth/DIFFERENCES.md`
  - List every visual element from design images that was omitted or simplified
  - Examples: decorative guilloche rings, heritage seal simplified to icon or text, biometric login omitted, strength meter replaced with criteria checklist
  - For each difference, explain why (e.g., "per product rules", "not in requirements", "simplified for MVP")
  - Include decisions made: CodeInput used (6 boxes), password validation uses criteria checklist not strength meter, terms checkbox is UI-only with no terms page
  - _Requirements: Design deviation documentation_

## Notes

- All constants for validation rules go in `src/lib/constants.ts`, never hardcoded in components
- Password requirements: at least 8 characters, includes a number, includes uppercase letter, includes special character (!@#$%^&*)
- Hooks wrap `api.ts` functions and return loading/error state but do NOT handle navigation (screens do)
- CodeInput component is required for the 6-digit verification code boxes
- PasswordCriteria checklist is required, password strength meter omitted
- Terms checkbox on signup email screen must be checked to enable Continue, but there is no terms page to navigate to (UI-only requirement per design)
- Mock auth rules: code "123456" succeeds, password "wrong" fails for testing error state, all other inputs succeed
- Navigation on auth success uses `router.replace` for terminal states (signup complete, forgot password success) to clear the auth stack
- Success screen (forgot password) has no design file, follow existing auth screen patterns with centered success icon and message
- All screens use ScreenContainer with scrollable prop except success screen (fits in viewport)
- Email inputs: `keyboardType="email-address"`, `autoCapitalize="none"`
- Password inputs: `secureTextEntry={true}`, `autoCapitalize="none"`, visibility toggle button
- Countdown format: "00:45", "00:15" with zero-padded seconds
- Municipality chips on signup details are optional (keep if in design, but not required by docs/app.md)
- Decorative elements like pulsing background, guilloche rings, detailed heritage seal are optional (simplify for implementation)
- Route files use default exports, all other modules use named exports
- Use `@/` import alias for `src/` imports
- Testing must be on physical Android phone (no emulators per tech rules)
- DIFFERENCES.md lists all omissions, simplifications, and decisions for design review
- Bugfix tasks 16.1-16.8 address issues found during physical device testing: CodeInput visual bug, keyboard covering fields, success screen back button, navigation stack piling between auth screens, Continue button validation on signup step 1, and keyboard covering Verify button on verification screens

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1", "2", "3"]
    },
    {
      "id": 1,
      "tasks": ["4", "5"]
    },
    {
      "id": 2,
      "tasks": ["6", "7", "10"]
    },
    {
      "id": 3,
      "tasks": ["8", "11"]
    },
    {
      "id": 4,
      "tasks": ["9", "12"]
    },
    {
      "id": 5,
      "tasks": ["13", "14"]
    },
    {
      "id": 6,
      "tasks": ["15"]
    },
    {
      "id": 7,
      "tasks": ["16"]
    },
    {
      "id": 8,
      "tasks": ["16.1", "16.2", "16.3", "16.4", "16.5", "16.6", "16.7", "16.8"]
    },
    {
      "id": 9,
      "tasks": ["17"]
    }
  ]
}
```







