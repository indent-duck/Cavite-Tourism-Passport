# Implementation Plan: Account

## Overview

The Account feature displays the user's profile information, digital passport ID card, and activity statistics. It provides the interface for adding and verifying a contact number (not collected at sign up) and logging out. The screen shows the Passport ID prominently in a secure-looking ID card, profile details (name, address, email), and a contact number row with an "Add" button (or verified badge if added). A gear icon opens Settings (separate spec), and a "Log out" button clears the session and React Query cache. All data flows through hooks in `src/hooks` that call `src/data/api.ts`, which returns mock data for now.

## Tasks

- [x] 1. Update types and mock data for contact number
  - [x] 1.1 Add contactNumber and contactVerified to User type
    - Open `src/data/types.ts`
    - Add `contactNumber?: string;` field to User interface (already exists)
    - Add `contactVerified?: boolean;` field to User interface
    - _Requirements: User type with contact fields_

  - [x] 1.2 Update mock user data
    - Open `src/data/mock-data.ts`
    - Ensure `currentMockUser` has no `contactNumber` initially (undefined or omitted)
    - Ensure `contactVerified` is false or omitted
    - _Requirements: Mock user starts with no contact number_

- [x] 2. Create API functions for contact number and sign out
  - [x] 2.1 Add sendContactCode function to api.ts
    - Open `src/data/api.ts`
    - Implement `sendContactCode(contactNumber: string): Promise<boolean>`
    - Add artificial delay (300-800ms)
    - Mock: always returns true (simulates sending SMS code)
    - _Requirements: Mock API function for sending contact verification code_

  - [x] 2.2 Add verifyContactCode function to api.ts
    - Implement `verifyContactCode(contactNumber: string, code: string): Promise<boolean>`
    - Add artificial delay
    - Mock: code "123456" returns true, all others return false
    - On success, update `currentMockUser.contactNumber` and `currentMockUser.contactVerified = true`
    - _Requirements: Mock API function for verifying contact number_

  - [x] 2.3 Add signOut function to api.ts
    - Implement `signOut(): Promise<void>`
    - Add artificial delay
    - Reset `currentMockUser` to initial state (clear contactNumber and contactVerified)
    - _Requirements: Mock API function for signing out_

- [x] 3. Create hooks for contact number and sign out
  - [x] 3.1 Create useContactVerification hook
    - Create `src/hooks/useContactVerification.ts`
    - Export `useContactVerification` hook that returns `{ sendCode, verifyCode, isLoading, error }`
    - `sendCode` calls `sendContactCode` from api.ts
    - `verifyCode` calls `verifyContactCode` from api.ts
    - After successful verification, invalidate the `currentUser` query to refetch updated user data
    - Handle loading and error states
    - _Requirements: Hook for contact verification flow_

  - [x] 3.2 Create useSignOut hook
    - Create `src/hooks/useSignOut.ts`
    - Export `useSignOut` hook that returns `{ signOut, isLoading }`
    - `signOut` calls `signOut` from api.ts, clears React Query cache (both in-memory and persisted), and navigates to `/(auth)/login` with `router.replace`
    - Use `queryClient.clear()` to clear the entire cache
    - Use `queryClient.removeQueries()` to clear persisted cache
    - Handle loading state
    - _Requirements: Hook for sign out with cache clearing_

- [x] 4. Create AddContactSheet component for bottom sheet flow
  - [x] 4.1 Create AddContactSheet component
    - Create `src/components/account/AddContactSheet.tsx`
    - Implement AddContactSheetProps interface: `{ visible, onDismiss, onSuccess }`
    - Use `@gorhom/bottom-sheet` BottomSheet component
    - Three stages: phone input, OTP verification, success
    - Stage 1 (Phone Input):
      - Title "Add Contact Number" with close button
      - Description text about SMS verification
      - TextInput with label "Mobile Phone", prefix "+63", placeholder "917 123 4567"
      - Validate Philippine mobile format (09XXXXXXXXX or 9XXXXXXXXX after +63)
      - "Send Verification Code" button (accent variant)
      - On submit, call `sendCode` from useContactVerification hook and move to stage 2
    - Stage 2 (OTP Verification):
      - Back button to return to stage 1
      - "SMS Code Sent" label in the top-right corner
      - Title "Verify Mobile Number"
      - Description "Code sent to +63 917 ••• ••••" (mask middle digits)
      - CodeInput component (6 digits)
      - "Resend code" link with 30-second countdown
      - "Verify & Link" button (primary variant)
      - On submit, call `verifyCode` from useContactVerification hook
      - On success, move to stage 3
      - On error, show error message below CodeInput
    - Stage 3 (Success):
      - Success icon (checkmark in green circle)
      - Title "Number Successfully Linked!"
      - Description "Your Cavite Tourism Passport is now updated with verified SMS notices."
      - "Done" button (accent variant)
      - On press, call `onSuccess` and `onDismiss`
    - Use theme tokens for all styling
    - Handle keyboard avoiding (KeyboardAvoidingView or bottom sheet's keyboardBehavior prop)
    - Use Ionicons for icons
    - _Requirements: Bottom sheet component for contact number verification flow_

- [x] 5. Implement Account screen
  - [x] 5.1 Create Account screen layout and header
    - Open `src/app/(tabs)/account.tsx`
    - Replace placeholder content
    - Use ScreenContainer with `scrollable={true}`, `withTabBarPadding={true}`, and `edges={['left', 'right']}`
    - The global Header with name and points is provided by the tabs layout—do not add a second header
    - No promo chip on this screen (Header's rightSlot is undefined)
    - _Requirements: Account screen with proper layout_

  - [x] 5.2 Create Digital ID Card section
    - Create ID card component in the Account screen or as a separate component in `src/components/account/PassportIdCard.tsx`
    - Dark blue gradient background (from #0B2A4A via #003260 to #001f3f)
    - Decorative security pattern backdrop (subtle circles)
    - Top row: shield icon in a rounded container, "Republic of the Philippines" text above "Cavite Tourism Passport" title, and "Active" badge with green dot
    - Middle section: "Passport ID Number" label, Passport ID in mono font (CVT-2027-000123), copy button, holder name, and municipality with location pin icon
    - Right side: QR code in white rounded container (use simplified SVG matching the design, not a real QR library)
    - Bottom strip: "Provincial Tourism Board" and "Official Pass 2027" text
    - Match colors, spacing, and layout from account.png and account.html
    - Use theme tokens for border radius and spacing
    - Copy button shows checkmark icon for 1.8 seconds after copying
    - _Requirements: Digital ID card matching the design_

  - [x] 5.3 Create Activity Stats cards section
    - Three cards in a grid (3 columns, equal width):
      - Stamps card: icon, "Stamps" label, "5 / 20" count, progress bar (25%)
      - Points card: icon, "Credits" label, "450 pts" count, "+150 new" indicator with up arrow
      - Promo card: icon, "Promo" label, "Q1 Season" title, "Jan 1 – Mar 31" date range
    - Use data from useCurrentUser and usePromoPeriod hooks
    - Cards have white background, 16px radius, border, shadow
    - Match design from account.png
    - _Requirements: Activity stats cards with live data_

  - [x] 5.4 Create Account Details section
    - Card with white background, 16px radius, border, shadow
    - Header row: "ACCOUNT DETAILS" title (uppercase, bold, small text), "Edit" button
    - "Edit" button is non-functional for this spec (placeholder for future Edit Profile feature)
    - Four detail rows:
      - Full Name: badge icon, "Full Name" label, user name value
      - Address: home pin icon, "Address" label, user address value
      - Email: mail icon, "Email" label, user email value
      - Contact Number: phone icon, "Contact Number" label, contact number or "+63 •••••••••" placeholder, "Add Contact Number" button (or "Verified" badge if already added)
    - Contact Number row:
      - If no contact number: show "+63 •••••••••" and orange "Add Contact Number" button with "+" icon
      - If contact number exists and verified: show full number (e.g., "+63 917 123 4567") and green "Verified" badge with checkmark
    - "Add Contact Number" button opens AddContactSheet (task 4.1)
    - Use data from useCurrentUser hook
    - _Requirements: Account details section with contact number state_

  - [x] 5.5 Create Navigation Links section
    - Card with white background, 16px radius, border, shadow
    - Three navigation rows:
      - Settings & Preferences: tune icon, title, subtitle "Push Notifications, Language & Help FAQs", chevron right
      - Redemptions & Vouchers: qr_code_2 icon, title, subtitle "View claimed rewards & active QR passes", chevron right
      - Privacy Policy & Terms: shield_person icon, title, subtitle "Cavite Tourism Registry guidelines & data privacy", chevron right
    - Settings row navigates to `/settings` (existing route, separate spec)
    - Redemptions and Privacy rows are placeholders (future specs)—tap shows a toast "Coming soon" or does nothing
    - Use Pressable with press feedback
    - _Requirements: Navigation links section_

  - [x] 5.6 Create Log Out button
    - Red outlined button at the bottom: "Log out" text with logout icon
    - White background, red border, red text
    - On press, call `signOut` from useSignOut hook (no confirmation dialog—account.png shows no confirmation)
    - Button should show loading spinner if `isLoading` is true from useSignOut hook
    - Version text below button: "Cavite Tourism Passport App • v2.4.1 (Build 2027)" (static text, not from constants)
    - _Requirements: Log out button with immediate sign out_

- [x] 6. Export new components
  - [x] 6.1 Export account components from index
    - Create or update `src/components/account/index.ts`
    - Export PassportIdCard component (if created as separate component)
    - Export AddContactSheet component
    - _Requirements: Clean exports for account components_

  - [x] 6.2 Export new hooks from index
    - Open `src/hooks/index.ts`
    - Export useContactVerification and useSignOut hooks
    - _Requirements: Clean exports for account hooks_

- [ ] 7. Checkpoint - Verify Account screen and test all flows
  - Open the app on a physical Android phone
  - Navigate to Account tab
  - Verify the Account screen renders correctly:
    - Digital ID card with correct data and layout
    - Activity stats cards with live data
    - Account details section with correct user data
    - Contact Number row shows "+63 •••••••••" and "Add Contact Number" button
    - Navigation links section renders
    - Log out button renders
  - Test the Add Contact Number flow:
    - Tap "Add Contact Number" button
    - Verify bottom sheet opens with phone input stage
    - Enter a Philippine mobile number (e.g., "917 123 4567")
    - Tap "Send Verification Code"
    - Verify OTP stage appears with masked phone number
    - Enter code "123456"
    - Tap "Verify & Link"
    - Verify success stage appears
    - Tap "Done"
    - Verify bottom sheet closes and Contact Number row now shows the full number with "Verified" badge
  - Test the Add Contact Number flow with invalid code:
    - Tap "Add Contact Number" button again (or use "Change" if implemented)
    - Enter a number and proceed to OTP stage
    - Enter code "111111" (not "123456")
    - Verify error message appears
  - Test the Log Out flow:
    - Tap "Log out" button
    - Verify no confirmation dialog appears
    - Verify app navigates to login screen immediately
    - Verify React Query cache is cleared (re-login should not show old user data)
  - Test keyboard behavior:
    - Verify keyboard does not cover input or buttons in AddContactSheet
  - Test Android back button:
    - Open AddContactSheet and press Android back button
    - Verify sheet closes
    - From Account screen, press Android back button
    - Verify tab bar navigation works correctly (does not exit app if other tabs were visited)
  - Run `npx tsc --noEmit` and verify no TypeScript errors
  - Run `npx expo lint` and verify no linting errors
  - Create `DIFFERENCES.md` in `.kiro/specs/account/` listing every difference between the implementation and account.png

## Notes

- Account screen is a tab route inside `(tabs)`, so it uses `withTabBarPadding={true}` and `edges={['left', 'right']}`
- The global Header (name and points) is provided by the tabs layout—do not add a second header on this screen
- No promo chip on the Account screen (Header's rightSlot is undefined on this tab)
- The gear icon in the design navigates to `/settings`, which is an existing route (Settings is a separate spec)
- The "Edit" button in Account Details is a placeholder for future Edit Profile feature—it does nothing in this spec
- Redemptions & Vouchers and Privacy Policy & Terms navigation rows are placeholders for future specs—they do nothing or show a "Coming soon" toast
- Log out immediately clears the session and cache with no confirmation dialog (account.png shows no confirmation)
- Log out uses `router.replace` to prevent Android back button from returning to the authenticated tabs
- Contact number is not collected at sign up—it is only added here in the Account screen
- Contact number verification uses the same mock code "123456" that succeeds in other verification flows
- CodeInput component already exists in `src/components/ui/CodeInput.tsx` (verified in the codebase check)
- `@gorhom/bottom-sheet` may require GestureHandlerRootView or a provider in the root layout—add it if needed (JavaScript only, no native changes)
- Activity stats use live data from useCurrentUser and usePromoPeriod hooks (no hardcoded values)
- The QR code in the ID card is a simplified SVG matching the design—not a real QR code library
- Philippine mobile format: 09XXXXXXXXX or +639XXXXXXXXX (accept both, store as +63 format)
- "Resend code" countdown is 30 seconds (matches auth verify screens)
- All spacing, radii, colors, and fonts use theme tokens—no hardcoded values
- The "Verified" badge is green with a checkmark icon, matching the design
- The version text at the bottom is static: "Cavite Tourism Passport App • v2.4.1 (Build 2027)"
- No avatar or profile photo on this screen (User type has no avatar field, and account.png shows no photo)
- If account.png shows an avatar/photo, omit it and list it in DIFFERENCES.md
- Testing must be on a physical Android phone (no emulator)
- TypeScript strict mode must pass with zero errors
- ESLint must pass with zero errors
- DIFFERENCES.md lists every visual or behavioral difference between the implementation and account.png

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1.1", "1.2"]
    },
    {
      "id": 1,
      "tasks": ["2.1", "2.2", "2.3"]
    },
    {
      "id": 2,
      "tasks": ["3.1", "3.2"]
    },
    {
      "id": 3,
      "tasks": ["4.1"]
    },
    {
      "id": 4,
      "tasks": ["5.1", "5.2", "5.3", "5.4", "5.5", "5.6"]
    },
    {
      "id": 5,
      "tasks": ["6.1", "6.2"]
    },
    {
      "id": 6,
      "tasks": ["7"]
    }
  ]
}
```
