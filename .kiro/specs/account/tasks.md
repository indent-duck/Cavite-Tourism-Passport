# Implementation Plan: Account

## Overview

The Account feature displays the user's profile information, digital passport ID card, and activity statistics. It provides the interface for adding and verifying a contact number (not collected at sign up) and logging out. The screen shows the Passport ID prominently in a secure-looking ID card, profile details (name, address, email), and a contact number row with an "Add" button (or verified badge if added). Navigation links open Settings, Rewards, and Privacy screens. A "Log out" button opens a confirmation modal before signing out. All data flows through hooks in `src/hooks` that call `src/data/api.ts`, which returns mock data for now.

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
    - Android back button closes the sheet (same as close button)
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
    - Top row: shield icon in a rounded container, "Province of Cavite" text (not "Republic of the Philippines") above "Cavite Tourism Passport" title, and "Active" badge with green dot
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
      - Points card: icon, "Credits" label, "450 pts" count (no "+150 new" indicator)
      - Promo card: icon, "Promo" label, "Q1 Season" title, "Jan 1 – Mar 31" date range
    - Use data from useCurrentUser and usePromoPeriod hooks
    - Cards have white background, 16px radius, border, shadow
    - Match design from account.png (omit the "+150 new" indicator from Points card)
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
      - Settings & Preferences: tune icon, title, subtitle "Push Notifications & Help FAQs" (no "Language")
      - Redemptions & Vouchers: qr_code_2 icon, title, subtitle "View claimed rewards & active QR passes", chevron right
      - Privacy Policy & Terms: shield_person icon, title, subtitle "Cavite Tourism Registry guidelines & data privacy", chevron right
    - Settings row navigates to `/settings` (existing route, separate spec)
    - Redemptions row navigates to `/rewards`
    - Privacy row navigates to `/privacy` (task 8)
    - Use Pressable with press feedback
    - _Requirements: Navigation links section_

  - [x] 5.6 Update Log Out button to open confirmation modal
    - Red outlined button at the bottom: "Log out" text with logout icon
    - White background, red border, red text
    - On press, open LogoutConfirmModal (task 5.7) instead of calling signOut directly
    - No loading spinner on this button (loading is shown on the modal's Confirm button)
    - Version text below button: use APP_VERSION from constants (e.g., "Cavite Tourism Passport App • v2.4.1 (Build 2027)")
    - _Requirements: Log out button opens confirmation modal_

  - [x] 5.7 Create LogoutConfirmModal component
    - Create `src/components/account/LogoutConfirmModal.tsx`
    - Implement LogoutConfirmModalProps interface: `{ visible, onDismiss, onConfirm }`
    - Semi-transparent black overlay (rgba(0, 0, 0, 0.5))
    - White modal container (320px max width, 20px border radius, 24px padding, large shadow, center-aligned)
    - Warning icon (Ionicons `warning-outline` or `alert-circle-outline`, 56px size, error color)
    - Title: "Log Out?" (18px, bold, primary color)
    - Message: "Are you sure you want to log out? You'll need to sign in again to access your passport." (14px, text secondary, center-aligned)
    - Button row (horizontal, equal width, 12px gap):
      - Cancel button (outline variant, "Cancel" text, calls onDismiss)
      - Confirm button (primary variant with error color background, "Log Out" text, calls onConfirm, shows loading spinner from useSignOut.isLoading)
    - Android back button closes modal (same as Cancel)
    - Match design from `logout-confirmation.png`
    - _Requirements: Logout confirmation modal_

- [x] 6. Export new components
  - [x] 6.1 Export account components from index
    - Create or update `src/components/account/index.ts`
    - Export PassportIdCard component (if created as separate component)
    - Export AddContactSheet component
    - Export LogoutConfirmModal component
    - _Requirements: Clean exports for account components_

  - [x] 6.2 Export new hooks from index
    - Open `src/hooks/index.ts`
    - Export useContactVerification and useSignOut hooks
    - _Requirements: Clean exports for account hooks_

- [x] 7. Create legal content and Privacy screen
  - [x] 7.1 Create legal content file
    - Create `src/data/legal-content.ts`
    - Export `legalContent` object with keys for each section:
      - `introduction`: Placeholder introduction text
      - `informationWeCollect`: Placeholder text about data collection
      - `howWeUseYourInformation`: Placeholder text about data usage
      - `dataSharingAndDisclosure`: Placeholder text about data sharing
      - `yourRights`: Placeholder text about user rights
      - `security`: Placeholder text about security measures
      - `changesToThisPolicy`: Placeholder text about policy changes
      - `contactUs`: Placeholder contact information
    - Add a comment at the top: "Placeholder text pending Tourism Office and legal review"
    - _Requirements: Legal content file with placeholder text_

  - [x] 7.2 Create Privacy Policy & Terms screen
    - Create `src/app/privacy.tsx` as a root-level route (check `privacy-policy-terms.png`: if tab bar is visible, nest inside `(tabs)` instead)
    - Use ScreenContainer with `scrollable={true}`, `showHeader={true}`, `headerTitle="Privacy Policy & Terms"`
    - Import `legalContent` from `src/data/legal-content.ts`
    - Render each section with title (16px, bold, primary, 24px bottom margin) and body text (14px, text color, 16px line height, 24px bottom margin)
    - Sections: Introduction, Information We Collect, How We Use Your Information, Data Sharing and Disclosure, Your Rights, Security, Changes to This Policy, Contact Us
    - Footer with last updated date (12px, text secondary, center-aligned)
    - 32px bottom padding
    - 16px horizontal padding
    - White background
    - Android back button navigates back
    - _Requirements: Privacy Policy & Terms screen_

  - [x] 7.3 Wire Privacy link in Account screen
    - Open `src/app/(tabs)/account.tsx`
    - Update "Privacy Policy & Terms" navigation row to navigate to `/privacy` using `router.push('/privacy')`
    - Remove any placeholder "Coming soon" toast or disabled state
    - _Requirements: Privacy row navigates to privacy screen_

  - [x] 7.4 Wire Privacy link in sign up email screen (if present)
    - Open `src/app/(auth)/signup/email.tsx`
    - Check if terms text exists with links to "Provincial Tourism Terms of Service" and "Privacy Policy"
    - If links exist, make them pressable and navigate to `/privacy` using `router.push('/privacy')`
    - If no links exist, skip this subtask
    - _Requirements: Sign up terms link opens privacy screen_

- [ ] 8. Checkpoint - Verify all Account features and flows
  - Open the app on a physical Android phone
  - Navigate to Account tab
  - Verify the Account screen renders correctly:
    - Digital ID card shows "Province of Cavite" (not "Republic of the Philippines")
    - Activity stats cards show live data (Points card has no "+150 new" indicator)
    - Version text uses APP_VERSION from constants
    - Settings row subtitle does not show "Language"
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
  - Test the Log Out confirmation flow:
    - Tap "Log out" button
    - Verify confirmation modal opens with "Are you sure?" message
    - Tap "Cancel" button
    - Verify modal closes and session is still active (user is still on Account screen)
    - Tap "Log out" button again
    - Tap "Confirm" button
    - Verify Confirm button shows loading spinner
    - Verify app navigates to login screen after sign out
    - Force-close the app and reopen it
    - Verify no old user data returns (React Query cache was cleared)
  - Test the Privacy Policy & Terms screen:
    - Navigate to Account tab
    - Tap "Privacy Policy & Terms" row
    - Verify privacy screen opens with back arrow and scrollable content
    - Verify content comes from `src/data/legal-content.ts` with all sections
    - Tap back arrow and verify return to Account screen
    - Navigate to sign up email screen (if terms link exists)
    - Tap terms link
    - Verify privacy screen opens
  - Test navigation:
    - Settings row navigates to `/settings`
    - "Redemptions & Vouchers" row navigates to `/rewards`
  - Test keyboard behavior:
    - Verify keyboard does not cover input or buttons in AddContactSheet
  - Test Android back button:
    - Open AddContactSheet and press Android back button → Verify sheet closes
    - Open LogoutConfirmModal and press Android back button → Verify modal closes (same as Cancel)
    - From Account screen, press Android back button → Verify tab bar navigation works correctly
    - From Privacy screen, press Android back button → Verify return to previous screen
  - Run `npx tsc --noEmit` and verify no TypeScript errors
  - Run `npx expo lint` and verify no linting errors
  - Create `DIFFERENCES.md` in `.kiro/specs/account/` listing every difference between the implementation and the design images

## Notes

- Account screen is a tab route inside `(tabs)`, so it uses `withTabBarPadding={true}` and `edges={['left', 'right']}`
- The global Header (name and points) is provided by the tabs layout—do not add a second header on this screen
- No promo chip on the Account screen (Header's rightSlot is undefined on this tab)
- The gear icon in the design navigates to `/settings`, which is an existing route (Settings is a separate spec)
- The "Edit" button in Account Details is a placeholder for future Edit Profile feature—it does nothing in this spec
- Log out now requires confirmation via LogoutConfirmModal (matching `logout-confirmation.png`)
- Cancel button on modal keeps the session and closes the modal
- Confirm button on modal calls signOut from useSignOut hook with loading state
- Android back button on modal acts as Cancel (closes modal, keeps session)
- Log out uses `router.replace` to prevent Android back button from returning to the authenticated tabs
- Contact number is not collected at sign up—it is only added here in the Account screen
- Contact number verification uses the same mock code "123456" that succeeds in other verification flows
- CodeInput component already exists in `src/components/ui/CodeInput.tsx`
- `@gorhom/bottom-sheet` may require GestureHandlerRootView or a provider in the root layout—add it if needed (JavaScript only, no native changes)
- Activity stats use live data from useCurrentUser and usePromoPeriod hooks (no hardcoded values)
- Points card does NOT show the "+150 new" indicator (removed per content cleanup)
- The QR code in the ID card is a simplified SVG matching the design—not a real QR code library
- Philippine mobile format: 09XXXXXXXXX or +639XXXXXXXXX (accept both, store as +63 format)
- "Resend code" countdown is 30 seconds (matches auth verify screens)
- All spacing, radii, colors, and fonts use theme tokens—no hardcoded values
- The "Verified" badge is green with a checkmark icon, matching the design
- Version text uses APP_VERSION from constants (not static text)
- "Redemptions & Vouchers" row navigates to `/rewards` (not a placeholder)
- Settings row subtitle is "Push Notifications & Help FAQs" (no "Language")
- Digital ID card shows "Province of Cavite" instead of "Republic of the Philippines" (pending Tourism Office confirmation)
- Privacy Policy & Terms screen opens from Account "Privacy Policy & Terms" row
- Privacy screen may also open from sign up email terms link (if the link exists)
- Privacy screen content is in `src/data/legal-content.ts` and marked as placeholder text pending Tourism Office and legal review
- Privacy screen is a root-level route at `src/app/privacy.tsx` unless the design shows the tab bar (then nest in `(tabs)`)
- No avatar or profile photo on this screen (User type has no avatar field)
- If design images show an avatar/photo, omit it and list it in DIFFERENCES.md
- Testing must be on a physical Android phone (no emulator)
- TypeScript strict mode must pass with zero errors
- ESLint must pass with zero errors
- DIFFERENCES.md lists every visual or behavioral difference between the implementation and the design images

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
      "tasks": ["5.1", "5.2", "5.3", "5.4", "5.5", "5.6", "5.7"]
    },
    {
      "id": 5,
      "tasks": ["6.1", "6.2", "7.1", "7.2"]
    },
    {
      "id": 6,
      "tasks": ["7.3", "7.4"]
    },
    {
      "id": 7,
      "tasks": ["8"]
    }
  ]
}
```
