# Account Spec

## Overview

The Account feature provides the user's profile view, including the digital passport ID card, activity statistics, and account settings. It is accessed via the Account tab in the bottom navigation bar. The screen displays the user's Passport ID prominently in a secure-looking ID card design, profile details (name, address, email, and optionally contact number), quick stats (stamps, points, promo period), navigation links to Settings and other features, and a log out button.

## Scope

This spec covers:

1. **Account screen** (`src/app/(tabs)/account.tsx`)
   - Digital passport ID card with QR code
   - Activity stats cards (stamps, points, promo period)
   - Account details section (name, address, email, contact number)
   - Contact number row with "Add Contact Number" button (or "Verified" badge if already added)
   - Navigation links (Settings, Redemptions & Vouchers, Privacy Policy & Terms)
   - Log out button (opens confirmation modal)

2. **Add Contact Number flow** (bottom sheet)
   - Step 1: Philippine mobile number input with validation
   - Step 2: 6-digit OTP verification
   - Step 3: Success confirmation
   - No contact number is collected at sign up—it is only added here

3. **Log out confirmation modal** (`src/components/account/LogoutConfirmModal.tsx`)
   - Modal with "Are you sure?" message
   - Cancel button (keeps session)
   - Confirm button (calls signOut with loading state)
   - Android back button cancels

4. **Privacy Policy & Terms screen** (`src/app/privacy.tsx`)
   - Root-level route with back arrow
   - Scrollable content from `src/data/legal-content.ts` (placeholder text pending Tourism Office and legal review)
   - Opened from Account screen "Privacy Policy & Terms" row
   - Also opened from sign up email screen terms link (if present)

5. **Sign out**
   - Clear mock session
   - Clear React Query cache (both in-memory and persisted)
   - Navigate to login screen with `router.replace`

## Design Reference

- **Account screen:**
  - **Image:** `design/screens/10-account/account.png`
  - **HTML:** `design/screens/10-account/account.html` (for exact spacing, sizes, radii, and colors only—never copy HTML or Tailwind)
  - **Stitch Screen ID:** `8cc60c3e5e494e52b321eec690c314d6`
  - **Route:** `src/app/(tabs)/account.tsx`

- **Log out confirmation modal:**
  - **Image:** `design/screens/10-account/logout-confirmation.png`
  - **Route:** Modal component in `src/components/account/LogoutConfirmModal.tsx`

- **Privacy Policy & Terms screen:**
  - **Image:** `design/screens/10-account/privacy-policy-terms.png`
  - **Route:** `src/app/privacy.tsx` (root-level route with back arrow)

## Data Flow

Screens and components **never import mock data directly**. Flow:

1. Screen uses hooks from `src/hooks` (e.g., `useCurrentUser`, `useContactVerification`, `useSignOut`)
2. Hooks call functions in `src/data/api.ts`
3. `api.ts` returns mock data from `src/data/mock-data.ts` after a short artificial delay

## Key Components

### New Components Created

1. **AddContactSheet** (`src/components/account/AddContactSheet.tsx`)
   - Bottom sheet with three stages: phone input, OTP verification, success
   - Uses `@gorhom/bottom-sheet`
   - Uses TextInput and CodeInput from `src/components/ui`

2. **LogoutConfirmModal** (`src/components/account/LogoutConfirmModal.tsx`)
   - Modal with confirmation message
   - Cancel button (closes modal, keeps session)
   - Confirm button (calls signOut with loading state)
   - Android back button cancels (closes modal)

3. **PassportIdCard** (`src/components/account/PassportIdCard.tsx`) (optional separate component)
   - Digital ID card with gradient background, decorative patterns, QR code
   - Copy button for Passport ID
   - Matches the secure ID card design from account.png

### Existing Components Reused

- `ScreenContainer` (with `scrollable={true}`, `withTabBarPadding={true}`, `edges={['left', 'right']}`)
- `Header` (provided by tabs layout, shows user name and points)
- `Button` (accent, primary, outline variants)
- `TextInput` (for phone number input)
- `CodeInput` (for 6-digit OTP)
- `Card` (for stats and details sections)

## New Hooks

1. **useContactVerification** (`src/hooks/useContactVerification.ts`)
   - `sendCode(contactNumber: string)` → sends SMS code (mock)
   - `verifyCode(contactNumber: string, code: string)` → verifies code (mock: "123456" succeeds)
   - After verification, invalidates `currentUser` query to refetch updated data

2. **useSignOut** (`src/hooks/useSignOut.ts`)
   - `signOut()` → clears session, clears React Query cache, navigates to login
   - Uses `queryClient.clear()` and `queryClient.removeQueries()` to clear persisted cache

## New API Functions

1. **sendContactCode** (`src/data/api.ts`)
   - Mock function with artificial delay
   - Always returns true (simulates sending SMS)

2. **verifyContactCode** (`src/data/api.ts`)
   - Mock function with artificial delay
   - Code "123456" returns true, all others return false
   - On success, updates `currentMockUser.contactNumber` and `contactVerified = true`

3. **signOut** (`src/data/api.ts`)
   - Mock function with artificial delay
   - Resets `currentMockUser` to initial state (clears contact number)

## Type Updates

- `User` interface in `src/data/types.ts` already has `contactNumber?: string`
- Add `contactVerified?: boolean` to `User` interface
- Mock user starts with no contact number (undefined)

## Behavior Rules

- **Log out requires confirmation:** The log out button opens a confirmation modal with Cancel and Confirm buttons; only Confirm calls signOut
- **No contact number at sign up:** Contact number is not collected during registration—only added here in Account settings
- **Philippine mobile format:** Accept 09XXXXXXXXX or +639XXXXXXXXX, store as +63 format
- **OTP verification:** Code "123456" succeeds, all others fail (matches auth verify flows)
- **Resend code countdown:** 30 seconds (matches auth verify screens)
- **Keyboard behavior:** Bottom sheet must handle keyboard so it does not cover inputs or buttons
- **Android back button:** Closes the bottom sheet or modal, returns to Account screen
- **No avatar or profile photo:** The User type has no avatar field, and the design shows no photo
- **Privacy screen text is placeholder:** Content in `src/data/legal-content.ts` is placeholder text pending Tourism Office and legal review

## Navigation

- **Gear icon → `/settings`:** Opens the Settings screen (existing route, separate spec)
- **"Redemptions & Vouchers" row → `/rewards`:** Opens the Rewards list screen
- **"Privacy Policy & Terms" row → `/privacy`:** Opens the Privacy Policy & Terms screen (this spec)
- **Terms link in sign up email screen → `/privacy`:** Opens the Privacy Policy & Terms screen (if link exists in email.tsx)
- **"Edit" button in Account Details:** Placeholder for future Edit Profile feature (does nothing in this spec)

## Out of Scope

The following are **not** included in this spec:

- Edit profile (name, address, email)—separate spec
- Change password—separate spec
- Delete account—separate spec
- Biometric authentication—not in the app
- Redemption history screen—separate spec
- Privacy policy and terms screen—separate spec
- Upload or change profile photo—no photos in this app

## Known Design Deviations

The following differences from the design images should be documented in `DIFFERENCES.md`:

1. **No avatar or profile photo:** If account.png shows a profile photo or avatar, omit it (User type has no avatar field)
2. **"Edit" button is non-functional:** It appears in the design but does nothing in this spec (future Edit Profile feature)
3. Any other visual or behavioral differences discovered during implementation

## Testing Checklist

- [ ] Account screen renders correctly with all sections
- [ ] Digital ID card shows correct Passport ID and user data
- [ ] Copy button works and shows checkmark feedback
- [ ] Activity stats cards show live data from hooks (points card shows no "+150 new" indicator)
- [ ] Version shows APP_VERSION from constants (not static text)
- [ ] "Redemptions & Vouchers" row navigates to `/rewards`
- [ ] Settings row subtitle does not show "Language"
- [ ] ID card shows "Province of Cavite" (not "Republic of the Philippines")
- [ ] Contact Number row shows "+63 •••••••••" and "Add Contact Number" button initially
- [ ] "Add Contact Number" button opens bottom sheet
- [ ] Phone input stage validates Philippine mobile format
- [ ] "Send Verification Code" moves to OTP stage
- [ ] OTP stage shows masked phone number
- [ ] Code "123456" succeeds and shows success stage
- [ ] Invalid code shows error message
- [ ] "Done" button closes sheet and updates Contact Number row with "Verified" badge
- [ ] "Resend code" countdown works (30 seconds)
- [ ] Keyboard does not cover inputs or buttons in bottom sheet
- [ ] Android back button closes bottom sheet
- [ ] Settings gear icon navigates to `/settings`
- [ ] "Privacy Policy & Terms" row navigates to `/privacy`
- [ ] Privacy screen opens with back arrow and scrollable content
- [ ] Privacy screen content comes from `src/data/legal-content.ts`
- [ ] Terms link in sign up email screen (if present) opens `/privacy`
- [ ] Log out button opens confirmation modal
- [ ] Confirmation modal shows "Are you sure?" message
- [ ] Cancel button closes modal and keeps session
- [ ] Confirm button shows loading state and signs out
- [ ] Android back button on modal cancels (closes modal)
- [ ] Log out clears React Query cache (re-login does not show old data)
- [ ] Log out navigates to login screen with `router.replace`
- [ ] After logout, force-close and reopen app to confirm no old user data returns
- [ ] Android back button works correctly on Account screen
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npx expo lint` passes with zero errors
- [ ] Tested on physical Android phone (no emulator)

## Related Specs

- **Foundation** (`.kiro/specs/01-foundation/`): Theme system, shared UI components, navigation structure
- **Auth** (`.kiro/specs/auth/`): Sign up, login, verification flows (contact number verification follows the same pattern)
- **Settings** (future spec): Settings screen opened from gear icon
- **Edit Profile** (future spec): Edit name, address, email
- **Change Password** (future spec): Change password flow
- **Redemption History** (future spec): View claimed rewards and QR passes

## Design Assets

- `design/screens/10-account/account.png` (visual reference for Account screen)
- `design/screens/10-account/account.html` (spacing, sizes, colors reference only)
- `design/screens/10-account/logout-confirmation.png` (visual reference for logout modal)
- `design/screens/10-account/privacy-policy-terms.png` (visual reference for privacy screen)
- `design/screens/README.md` (screen inventory and scale information)

## Notes

- Account is a tab route inside `(tabs)`, so it uses `withTabBarPadding={true}` and `edges={['left', 'right']}`
- The global Header (name and points) is provided by the tabs layout—do not add a second header on this screen
- No promo chip on the Account screen (Header's rightSlot is undefined on this tab)
- The QR code in the ID card is a simplified SVG matching the design—not a real QR code library
- `@gorhom/bottom-sheet` may require GestureHandlerRootView or a provider in the root layout—add it if needed (JavaScript only)
- All styling uses theme tokens—no hardcoded colors, spacing, or radii
- Version text at the bottom is static: "Cavite Tourism Passport App • v2.4.1 (Build 2027)"
- Mock user data: Juan Dela Cruz, Passport ID CVT-2027-000123, 450 pts, no contact number initially
- Contact number format: +63 9XX XXX XXXX (Philippine mobile)
- OTP code format: 6 digits (matches auth verify screens)
- Log out clears both in-memory and persisted React Query cache
