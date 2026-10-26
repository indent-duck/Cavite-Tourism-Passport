# Auth Spec

Complete authentication UI implementation for the Cavite Tourism Passport app.

## Overview

Implement login, sign up (3 steps), and forgot password (3 steps + success) flows. All screens match the designs in `design/screens/01-auth/`. This is a UI-first implementation using mock authentication.

## Context

- **Design files:** `design/screens/01-auth/*.png` and `.html` files
- **Product rules:** `docs/app.md` and `.kiro/steering/product.md`
- **Mock auth rules:** Code "123456" succeeds, password "wrong" fails, everything else succeeds
- **Navigation:** Login/signup/forgot password success → `/(tabs)/explore`

## Dependencies

- Existing UI components: `Button`, `TextInput`, `ScreenContainer`, `StepIndicator`
- Existing API layer: `src/data/api.ts` (mock functions)
- Theme system: `src/theme`

## Tasks

### Task 1: Foundation - Constants and Hooks
Create auth constants and hooks for authentication and verification logic.

**Files to create:**
- `src/lib/constants.ts` (create or update)
- `src/hooks/useAuth.ts`
- `src/hooks/useVerification.ts`

**Constants to add:**
```typescript
export const VERIFICATION_CODE_LENGTH = 6;
export const RESEND_CODE_TIMEOUT = 60; // seconds
export const MIN_PASSWORD_LENGTH = 8;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

**useAuth hook:**
- Wraps `signIn`, `signUp`, `sendVerificationCode`, `resetPassword` from `@/data/api`
- Returns `{ fn, loading, error }` for each function
- Handles navigation on success

**useVerification hook:**
- Wraps `verifyCode` from `@/data/api`
- Manages countdown timer (60s → 0)
- Provides `verifyCode`, `resendCode`, `countdown`, `canResend`, `loading`, `error`

**Acceptance:**
- [ ] Constants file exists with all auth constants
- [ ] `useAuth` hook exports all auth functions with loading/error states
- [ ] `useVerification` hook provides countdown timer and resend functionality
- [ ] Mock rules work: code "123456" succeeds, others fail
- [ ] `npx tsc --noEmit` passes

---

### Task 2: Login Screen
Implement the login screen with email, password, and links to sign up and forgot password.

**File:** `src/app/(auth)/login.tsx`

**Design reference:** `design/screens/01-auth/login.png`

**Layout:**
- Heritage seal (80px circle) or simplified icon at top
- "Official Digital Pass" badge
- Headline: "Cavite Tourism Passport"
- Description: "Explore historic Cavite..."
- Form card with email and password inputs
- "Forgot password?" link (right-aligned, small)
- "Log in" button (primary, full width, arrow icon)
- "Don't have an account? Sign up" link at bottom
- Provincial footnote (shield icon, small text)

**Behavior:**
- Use `useAuth` hook
- Validate email and password (required)
- Password "wrong" shows error, all others succeed
- On success → `/(tabs)/explore`
- "Forgot password?" → `/forgot/email`
- "Sign up" → `/signup/email`

**Acceptance:**
- [ ] Screen matches login.png design
- [ ] Login with valid credentials navigates to Explore
- [ ] Password "wrong" shows error message
- [ ] All links navigate correctly
- [ ] Loading state shows during API call
- [ ] Keyboard does not cover inputs or button
- [ ] No TypeScript errors

---

### Task 3: Sign Up Flow - Step 1 (Email)
Implement the email entry screen for sign up.

**File:** `src/app/(auth)/signup/email.tsx`

**Design reference:** `design/screens/01-auth/signup-email.png`

**Layout:**
- Back button (top-left, 40px circle)
- Step indicator: "STEP 1 OF 3"
- Progress bar: 33.33% fill, orange
- Book icon badge: "Official Tourism Identity"
- Headline: "Create your digital passport"
- Email input with validation
- Info card: "Civic Exploration ID" (optional)
- Terms checkbox (required to proceed)
- "Continue" button
- "Already have an account? Log in"

**Behavior:**
- Email validation (format check)
- Terms must be checked to enable button
- On "Continue" → send code, navigate to `/signup/verify` with email param
- Use `useAuth.sendCode()`

**Acceptance:**
- [ ] Screen matches signup-email.png
- [ ] Email validation works
- [ ] Terms checkbox required
- [ ] "Continue" sends code and navigates
- [ ] "Log in" link works
- [ ] Back button works
- [ ] No TypeScript errors

---

### Task 4: Sign Up Flow - Step 2 (Verify)
Implement the 6-digit code verification screen.

**File:** `src/app/(auth)/signup/verify.tsx`

**Design reference:** `design/screens/01-auth/signup-verify.png`

**Layout:**
- Back button and step indicator "Step 2 of 3"
- Progress bar: 66.67% fill
- Mail icon in pulsing circle
- Headline: "Check your email"
- Email display with "Edit email" link
- 6-digit code input (6 boxes or single input)
- Countdown: "Resend code in 00:45"
- "Verify" button
- Help card: "Can't find the email?"

**Behavior:**
- Get email from router params
- Use `useVerification` hook
- Countdown: 60s → 0, then show "Resend code" link
- Code "123456" succeeds, others show error
- On success → `/signup/details` with email param
- "Edit email" → back to `/signup/email`

**Acceptance:**
- [ ] Screen matches signup-verify.png
- [ ] Email from params displays
- [ ] Code input works (6 digits)
- [ ] Countdown timer works (60 → 0)
- [ ] "Resend code" appears and works
- [ ] Code "123456" succeeds, validation works
- [ ] Navigation works
- [ ] No TypeScript errors

---

### Task 5: Sign Up Flow - Step 3 (Details)
Implement the personal details entry screen.

**File:** `src/app/(auth)/signup/details.tsx`

**Design reference:** `design/screens/01-auth/signup-details.png`

**Layout:**
- Back button, step indicator "Step 3 of 3"
- Progress bar: 100% fill
- Badge: "FINAL STEP"
- Headline: "Your personal details"
- Form fields:
  - Full Name (required)
  - Residential Address (required)
  - Password (min 8 chars, toggle visibility)
  - Confirm Password (must match)
- Municipality chips below address (optional)
- "Create account" button
- Trust seal footer

**Behavior:**
- Get email from params
- Use `useAuth.signUp()`
- Validate all fields
- On success → `/(tabs)/explore` (use `router.replace`)
- Municipality chips set address value (optional)

**Acceptance:**
- [ ] Screen matches signup-details.png
- [ ] All validations work
- [ ] Password toggle works
- [ ] Password confirmation validates
- [ ] "Create account" creates account
- [ ] Navigation to Explore works
- [ ] Municipality chips work (if implemented)
- [ ] No TypeScript errors

---

### Task 6: Forgot Password - Step 1 (Email)
Implement email entry for password recovery.

**File:** `src/app/(auth)/forgot/email.tsx`

**Design reference:** `design/screens/01-auth/forgot-email.png`

**Layout:**
- Back button
- Title: "Password Recovery" or "STEP 1 OF 3"
- Mail icon
- Headline: "Forgot your password?"
- Email input
- "Send verification code" button (orange)
- "Remember your password? Log in" link

**Behavior:**
- Use `useAuth.sendCode()`
- On success → `/forgot/verify` with email param
- Back or "Log in" → `/login`

**Acceptance:**
- [ ] Screen matches forgot-email.png
- [ ] Email validation works
- [ ] "Send code" navigates
- [ ] "Log in" link works
- [ ] Back button works
- [ ] No TypeScript errors

---

### Task 7: Forgot Password - Step 2 (Verify)
Implement code verification for password reset.

**File:** `src/app/(auth)/forgot/verify.tsx`

**Design reference:** `design/screens/01-auth/forgot-verify.png`

**Layout:** Same as sign up verify, adjusted for password reset context

**Behavior:**
- Use `useVerification` hook
- Code "123456" succeeds
- On success → `/forgot/new-password` with email param

**Acceptance:**
- [ ] Screen matches forgot-verify.png
- [ ] Countdown works
- [ ] Code "123456" succeeds
- [ ] Navigation works
- [ ] "Resend code" works
- [ ] No TypeScript errors

---

### Task 8: Forgot Password - Step 3 (New Password)
Implement new password entry with confirmation.

**File:** `src/app/(auth)/forgot/new-password.tsx`

**Design reference:** `design/screens/01-auth/forgot-new-password.png`

**Layout:**
- Back button, step indicator "Step 3 of 3"
- Badge: "ACCOUNT RECOVERY"
- Lock icon
- Headline: "Set new password"
- New Password input (toggle visibility, strength indicator optional)
- Confirm Password input
- Password criteria checklist:
  - At least 8 characters
  - Includes a number
  - Includes uppercase letter
  - Includes special character
- "Reset Password & Log in" button
- "Cancel and return to sign in" link

**Behavior:**
- Get email from params
- Use `useAuth.resetPassword()`
- Show checkmarks on criteria as met
- On success → `/forgot/success`
- "Cancel" → `/login`

**Acceptance:**
- [ ] Screen matches forgot-new-password.png
- [ ] Password inputs work
- [ ] Criteria checklist updates live
- [ ] Password validation works
- [ ] "Reset Password" navigates
- [ ] "Cancel" works
- [ ] No TypeScript errors

---

### Task 9: Forgot Password Success Screen
Implement success screen (no design provided, match auth style).

**File:** `src/app/(auth)/forgot/success.tsx`

**Layout:**
- Centered layout
- Success icon: check_circle (64px, green) in circle background
- Headline: "Password reset successful!"
- Message: "Your password has been successfully reset..."
- "Log in" button (primary, arrow icon)

**Behavior:**
- "Log in" → `/login` (use `router.replace`)
- No back button (success is terminal)

**Acceptance:**
- [ ] Screen follows auth design patterns
- [ ] Success message clear
- [ ] "Log in" navigates correctly
- [ ] No back button
- [ ] No TypeScript errors

---

### Task 10: Testing and Polish
Test all flows end-to-end and remove dev placeholders.

**Manual testing on physical Android phone:**

**Login:**
- [ ] Valid login → Explore
- [ ] Password "wrong" → error
- [ ] Links work
- [ ] Keyboard handling works

**Sign up (email → verify → details):**
- [ ] Step 1: Email validation, terms required
- [ ] Step 2: Code "123456" succeeds, countdown works
- [ ] Step 2: "Resend code" works
- [ ] Step 3: All validations work
- [ ] Step 3: Success → Explore
- [ ] Back button works at each step

**Forgot password (email → verify → new password → success):**
- [ ] Step 1: Email entry works
- [ ] Step 2: Code "123456" succeeds
- [ ] Step 3: Password criteria checklist works
- [ ] Step 3: Success → success screen
- [ ] Success: "Log in" → login screen
- [ ] Back button works at each step

**Code quality:**
- [ ] Remove dev-only buttons from login
- [ ] `npx tsc --noEmit` passes (0 errors)
- [ ] `npx expo lint` passes (0 errors)

**Documentation:**
- [ ] Create `DIFFERENCES.md` listing visual differences from designs (omitted elements, simplifications)

---

## Deliverables

- ✅ 8 implemented auth screens
- ✅ 2 hooks: `useAuth`, `useVerification`
- ✅ Auth constants
- ✅ Optional components: `CodeInput`, `PasswordStrengthIndicator` (if needed)
- ✅ All flows tested on physical device
- ✅ Zero TypeScript/lint errors
- ✅ `DIFFERENCES.md` documenting design deviations

## References

- Full spec details: `README.md`
- Visual specifications: `DESIGN.md`
- Quick reference: `SUMMARY.md`
- Product rules: `docs/app.md`, `.kiro/steering/product.md`
- Design assets: `design/screens/01-auth/`
