# Auth Spec - Cavite Tourism Passport

## Overview

This spec implements the complete authentication UI for the Cavite Tourism Passport app, including:

1. **Login screen** - Email and password login with "Forgot password?" and "Sign up" links
2. **Sign up flow** (3 steps with StepIndicator):
   - Step 1: Email entry
   - Step 2: 6-digit verification code
   - Step 3: Personal details (name, address, password)
3. **Forgot password flow** (3 steps):
   - Step 1: Email entry
   - Step 2: 6-digit verification code
   - Step 3: New password entry with confirmation
   - Success screen (no design provided, built to match the auth style)

**Scope:** UI-first implementation. All authentication functions call mock APIs through hooks. No real backend integration yet.

## Design References

**Source:** `design/screens/01-auth/`

Images examined:
- `login.png` - Email, password, "Forgot password?" link, "Sign up" link
- `signup-email.png` - Email entry, step 1 of 3, terms checkbox
- `signup-verify.png` - 6-digit code entry, step 2 of 3, countdown timer, "Resend code"
- `signup-details.png` - Name, address, password fields, step 3 of 3, city chips
- `forgot-email.png` - Email entry for password recovery
- `forgot-verify.png` - 6-digit code entry for password reset
- `forgot-new-password.png` - New password with confirmation, password strength indicator

HTML files read for spacing, sizes, radii, colors (not copied):
- All matching `.html` files for the above screens

## Mock Authentication Rules

**From `src/data/api.ts`:**

- **Sign In:** Any non-empty email and password combination succeeds and returns the mock user, **except** password `"wrong"` which throws an error (for testing error states)
- **Verification Code:** Code `"123456"` succeeds, all other codes throw an error
- **Sign Up:** Always succeeds after valid code verification
- **Reset Password:** Always succeeds after valid code verification

## User Flows

### Login Flow
1. User enters email and password
2. Taps "Log in" button
3. On success → Navigate to `/(tabs)/explore`
4. On error (e.g., password "wrong") → Show error message below password field

### Sign Up Flow
1. **Step 1 (email.tsx):** User enters email, checks terms checkbox, taps "Continue"
2. **Step 2 (verify.tsx):** User enters 6-digit code sent to email, taps "Verify"
   - Shows entered email with "Edit email" link (returns to Step 1)
   - Shows countdown timer (e.g., "Resend code in 00:45")
   - After countdown → "Resend code" link becomes active
3. **Step 3 (details.tsx):** User enters name, address, password (with confirmation), taps "Create account"
4. On success → Navigate to `/(tabs)/explore`

### Forgot Password Flow
1. **Step 1 (forgot/email.tsx):** User enters email, taps "Send verification code"
2. **Step 2 (forgot/verify.tsx):** User enters 6-digit code, taps "Verify Code"
   - Shows entered email with "Edit email" option
   - Shows countdown timer and "Resend code" link
3. **Step 3 (forgot/new-password.tsx):** User enters new password (with confirmation), taps "Reset Password & Log in"
   - Shows password strength indicator
   - Shows password criteria checklist
4. **Success screen (forgot/success.tsx):** Success message, button returns to Login

## Validation Rules

1. **Email:**
   - Required
   - Must match email format (basic regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
   - Show error: "Please enter a valid email address"

2. **Password:**
   - Required
   - Minimum 8 characters
   - Show error: "Password must be at least 8 characters"

3. **Password Confirmation:**
   - Required
   - Must match password field
   - Show error: "Passwords do not match"

4. **Name:**
   - Required
   - Show error: "Name is required"

5. **Address:**
   - Required
   - Show error: "Address is required"

6. **Verification Code:**
   - Required
   - Must be 6 digits
   - Show error from API if verification fails: "Invalid verification code"

7. **Terms Checkbox (Sign Up only):**
   - Must be checked to enable "Continue" button

## Components Used

**Existing:**
- `ScreenContainer` (`@/components/ui/ScreenContainer`)
- `Button` (`@/components/ui/Button`)
- `TextInput` (`@/components/ui/TextInput`)
- `StepIndicator` (`@/components/ui/StepIndicator`)

**New (if needed):**
- `CodeInput` - A specialized 6-digit code input component (if the existing `TextInput` cannot achieve the design)
- `PasswordStrengthIndicator` - Visual indicator of password strength (optional, can be inline in new-password screen)

## Navigation

- **Back button behavior:**
  - Android hardware back button and on-screen back arrow both use `router.back()`
  - In multi-step flows, returns to previous step
  - On login screen, may exit the auth stack (depending on root navigation setup)

- **Forward navigation:**
  - Login success → `/(tabs)/explore`
  - Sign up success → `/(tabs)/explore`
  - Forgot password success → `/login` (via "Log in" button on success screen)
  - "Sign up" link on login → `/signup/email`
  - "Log in" links on signup and forgot password → `/login`
  - "Forgot password?" link on login → `/forgot/email`

## Keyboard Handling

- Use `KeyboardAvoidingView` with `behavior="padding"` on Android
- Ensure primary action buttons (Continue, Verify, Create account, etc.) remain visible above the keyboard
- Use `scrollable` prop on `ScreenContainer` to allow scrolling when keyboard is open
- Set appropriate `keyboardType`:
  - Email fields: `"email-address"`
  - Password fields: `"default"`
  - Code fields: `"number-pad"` or `"numeric"`

## Loading States

- Show loading spinner on buttons during API calls:
  - Login: "Logging in..."
  - Sign up steps: "Sending code...", "Verifying...", "Creating account..."
  - Forgot password: "Sending code...", "Verifying...", "Resetting password..."
- Disable button and show `ActivityIndicator` via `Button` component's `loading` prop

## Countdown Timer (Verification Screens)

- Initial countdown: 60 seconds (can be adjusted via constant in `src/lib/constants.ts`)
- Format: `00:MM` (e.g., `00:45`)
- When countdown reaches 0:
  - Replace timer text with "Resend code" link/button
  - Tapping "Resend code" calls `sendVerificationCode` again and restarts countdown

## Design Differences and Omissions

The following elements appear in the design images but are **intentionally omitted** per product rules:

1. **No biometric login** - The login screen design may show a fingerprint icon. Do not implement biometric authentication.
2. **No contact number at sign up** - The signup-details screen collects only name, address, and password. Contact number is added later in Account settings (separate spec).
3. **No decorative branding beyond what's specified** - The login screen shows a heritage seal graphic and "Official Digital Pass" badge. These are included. Other decorative elements (e.g., guilloche rings, year "1898") are simplified or omitted if not critical to the brand identity.
4. **Civic Exploration ID card** - The signup-email screen shows an informational card with a shield icon and text "Unlocks verified heritage stamps across all 23 Cavite municipalities." This is a nice-to-have decorative element and can be included or simplified.
5. **Municipality chips** - The signup-details screen shows quick-select chips for municipalities (Imus, Bacoor, Dasmariñas, Tagaytay, Kawit). These can be included as a usability enhancement but are not required.
6. **Password strength indicator on signup-details** - The design shows 4 dots indicating "Strong". This can be simplified to text or omitted if the new-password screen already has a full indicator.

### Differences Summary

| Screen | Design Element | Implementation Decision |
|--------|---------------|-------------------------|
| login | Biometric button | Omitted (no biometric login per product rules) |
| login | Heritage seal with "1898" | Simplified to static image or icon |
| signup-email | Civic Exploration ID info card | Include if time permits, otherwise omit |
| signup-email | Terms checkbox | **Required** (must be checked to proceed) |
| signup-verify | Email icon with animation | Simplified to static icon |
| signup-details | Municipality chips | Include as usability feature (optional) |
| signup-details | Password strength dots | Simplified to text or omitted |
| signup-details | "Passport Ready To Issue" card | Omitted (decorative preview) |
| forgot-email | Security gateway text | Simplified to standard copy |
| forgot-verify | Timer animation | Standard countdown text |
| forgot-new-password | Password criteria checklist | **Include** (critical for UX) |
| forgot/success | No design provided | Built to match auth screen style: success icon, message, button to login |

## Accessibility

- All inputs have labels
- Error messages are announced via `accessibilityLiveRegion`
- Buttons have `accessibilityLabel` and `accessibilityRole`
- Focus management: auto-focus first input on screen load where appropriate

## Testing Checklist

**Manual testing (on physical Android phone):**

- [ ] Login with valid credentials navigates to Explore
- [ ] Login with password "wrong" shows error message
- [ ] "Forgot password?" link navigates to forgot/email
- [ ] "Sign up" link navigates to signup/email
- [ ] Sign up Step 1: Email validation works, terms must be checked
- [ ] Sign up Step 2: Code "123456" succeeds, other codes show error
- [ ] Sign up Step 2: Countdown timer works, "Resend code" appears after 60s
- [ ] Sign up Step 3: All fields validated, password confirmation works
- [ ] Sign up Step 3: Successful account creation navigates to Explore
- [ ] Forgot password Step 1: Email entry works
- [ ] Forgot password Step 2: Code "123456" succeeds
- [ ] Forgot password Step 3: Password validation and confirmation work
- [ ] Forgot password success screen shows, button returns to Login
- [ ] Android back button works at every step
- [ ] Keyboard does not cover input fields or buttons
- [ ] Loading states show on all buttons during async operations
- [ ] No TypeScript or ESLint errors

## Files to Modify/Create

### Routes (in `src/app/(auth)/`)
- ✅ `login.tsx` - Replace placeholder
- ✅ `signup/email.tsx` - Replace placeholder
- ✅ `signup/verify.tsx` - Replace placeholder
- ✅ `signup/details.tsx` - Replace placeholder
- ✅ `forgot/email.tsx` - Replace placeholder
- ✅ `forgot/verify.tsx` - Replace placeholder
- ✅ `forgot/new-password.tsx` - Replace placeholder
- ✅ `forgot/success.tsx` - Replace placeholder

### Hooks (in `src/hooks/`)
- ✅ `useAuth.ts` - Hook for sign in, sign up, password reset
- ✅ `useVerification.ts` - Hook for code verification and resend

### Components (in `src/components/auth/` or `src/components/ui/`)
- ❓ `CodeInput.tsx` - 6-digit code input (create if needed)
- ❓ `PasswordStrengthIndicator.tsx` - Visual password strength (create if needed)

### Constants (in `src/lib/constants.ts`)
- ✅ `VERIFICATION_CODE_LENGTH = 6`
- ✅ `RESEND_CODE_TIMEOUT = 60` (seconds)
- ✅ `MIN_PASSWORD_LENGTH = 8`

### API (no changes needed)
- ✅ `src/data/api.ts` already has `signIn`, `signUp`, `verifyCode`, `sendVerificationCode`, `resetPassword`

## Implementation Order

1. Create constants in `src/lib/constants.ts`
2. Create hooks: `useAuth.ts`, `useVerification.ts`
3. Create specialized components if needed: `CodeInput.tsx`, `PasswordStrengthIndicator.tsx`
4. Implement login screen
5. Implement signup flow (email → verify → details)
6. Implement forgot password flow (email → verify → new-password → success)
7. Test all flows end-to-end on physical device
8. Remove dev-only buttons from login placeholder
9. Run `npx tsc --noEmit` and `npx expo lint` to ensure zero errors

## Success Criteria

- All auth screens match the design images (with documented omissions)
- All user flows work end-to-end
- Mock authentication rules are implemented correctly
- Validation shows appropriate error messages
- Loading states display during async operations
- Keyboard handling works correctly
- Android back button works at every step
- No TypeScript or lint errors
- Code is organized according to project structure rules (routes thin, hooks for data, components reusable)

---

**Note:** This is a UI-first implementation. The next phase will replace the mock API layer in `src/data/api.ts` with real Supabase calls, but screens and hooks remain unchanged.
