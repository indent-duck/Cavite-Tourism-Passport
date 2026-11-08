# Account Design Specification

## Overview

The Account feature provides user profile management with three main responsibilities: displaying the digital passport ID card with verification status, managing contact number verification (not collected at signup), and secure logout with confirmation. The feature integrates AddContactSheet (bottom sheet), LogoutConfirmModal (modal overlay), and a Privacy Policy screen (root-level route) with the main Account tab screen.

## Architecture

**Screen hierarchy:**
- `src/app/(tabs)/account.tsx` - Main Account screen (tab route)
- `src/app/privacy.tsx` - Privacy Policy & Terms screen (root-level route with back arrow)

**Component structure:**
- `PassportIdCard` - Self-contained ID card with QR code, copy functionality, gradient background
- `AddContactSheet` - Three-stage bottom sheet (phone input → OTP verification → success)
- `LogoutConfirmModal` - Modal overlay with Cancel/Confirm actions

**Data flow:**
1. Screen → Hook (`useCurrentUser`, `useContactVerification`, `useSignOut`) → API function → Mock data
2. Contact verification: `sendCode` → `verifyCode` → invalidate `currentUser` query → refetch
3. Sign out: `signOut` API → clear React Query cache (in-memory + persisted) → navigate to login

## Components and Interfaces

### PassportIdCard
- **Props:** `{ user: User }` (from useCurrentUser)
- **State:** `copied: boolean` (for copy button feedback)
- **Behavior:** Copy button shows checkmark for 1.8s, haptic feedback on copy
- **Styling:** Gradient background (#0B2A4A → #003260 → #001f3f), decorative circles, QR code SVG

### AddContactSheet
- **Props:** `{ visible: boolean, onDismiss: () => void, onSuccess: () => void }`
- **State:** `stage: 'input' | 'verify' | 'success'`, `phoneNumber: string`, `code: string`, `countdown: number`
- **Hooks:** `useContactVerification` for sendCode/verifyCode
- **Behavior:** Three-stage flow with validation, 30s resend countdown, keyboard handling

### LogoutConfirmModal
- **Props:** `{ visible: boolean, onDismiss: () => void, onConfirm: () => void }`
- **State:** None (uses `useSignOut.isLoading` for Confirm button loading state)
- **Behavior:** Overlay dismisses on Cancel or Android back button, Confirm calls signOut

### Privacy Screen
- **Route:** `src/app/privacy.tsx` (check design for tab bar visibility; nest in `(tabs)` if visible)
- **Data:** `legalContent` from `src/data/legal-content.ts`
- **Sections:** Introduction, Information We Collect, How We Use Your Information, Data Sharing, Your Rights, Security, Changes to This Policy, Contact Us

## Data Models

### User (extended)
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  passportId: string;
  municipality: string;
  points: number;
  contactNumber?: string;      // New: optional contact number
  contactVerified?: boolean;   // New: verification status
}
```

### Legal Content
```typescript
interface LegalContent {
  introduction: string;
  informationWeCollect: string;
  howWeUseYourInformation: string;
  dataSharingAndDisclosure: string;
  yourRights: string;
  security: string;
  changesToThisPolicy: string;
  contactUs: string;
  lastUpdated: string;
}
```

## Correctness Properties

### Property 1: Contact verification atomicity

**Validates: Requirements 2 (Add Contact Number flow)**

`verifyCode` returns true → API updates `currentMockUser.contactNumber` and `contactVerified = true` → query invalidation refetches → UI shows verified badge. No partial updates: either both fields update or neither does.

### Property 2: Cache clearing completeness

**Validates: Requirements 5 (Sign out)**

`signOut` calls `queryClient.clear()` and `queryClient.removeQueries()` → persisted cache cleared → re-login does not show stale data. All queries (in-memory and persisted) must be cleared.

### Property 3: Logout confirmation safety

**Validates: Requirements 3 (Log out confirmation modal)**

Modal with Cancel/Confirm → Cancel keeps session → Confirm calls signOut with loading state → Android back button acts as Cancel. Accidental logout prevented by explicit confirmation.

### Property 4: Contact number format consistency

**Validates: Requirements 2 (Add Contact Number flow)**

Accept 09XXXXXXXXX or +639XXXXXXXXX → store as +63 format → display with spacing (e.g., "+63 917 123 4567"). All storage and display uses the same normalized format.

### Property 5: OTP verification consistency

**Validates: Requirements 2 (Add Contact Number flow)**

Code "123456" succeeds, all others fail (matches auth flows). Mock behavior is deterministic and consistent across all verification flows.

## Error Handling

1. **Contact verification errors:**
   - Network failure: Show error below CodeInput, allow retry
   - Invalid code: Show "Invalid code. Please try again." in error color
   - Timeout: Bottom sheet remains open, user can retry or close

2. **Sign out errors:**
   - Network failure: Still clear local cache and navigate to login (fail gracefully)
   - Cache clearing failure: Log error but proceed with navigation

3. **Privacy screen errors:**
   - Missing legal content: Show placeholder text with notice
   - Navigation errors: Fall back to Account screen

## Testing Strategy

1. **Unit tests (future):**
   - `useContactVerification`: sendCode success, verifyCode with valid/invalid codes, query invalidation
   - `useSignOut`: cache clearing, navigation after sign out
   - `PassportIdCard`: copy button state, QR code rendering
   - `LogoutConfirmModal`: Cancel behavior, Confirm loading state

2. **Integration tests (manual):**
   - Add Contact Number flow: input → send → verify → success → UI update
   - Invalid OTP flow: input → send → invalid code → error message → retry
   - Logout flow: tap button → modal opens → Cancel keeps session → Confirm signs out
   - Privacy screen: open from Account → scroll content → back arrow returns
   - Sign up terms link: tap link → privacy screen opens (if link exists)

3. **E2E tests (manual on physical device):**
   - Contact verification with keyboard: verify keyboard doesn't cover inputs
   - Logout and force-close: sign out → force-close app → reopen → no old data
   - Android back button: bottom sheet closes, modal closes, privacy screen navigates back
   - Settings row navigates to `/settings`, Redemptions navigates to `/rewards`

## Visual Design Reference

- **Account screen:**
  - **Image:** `design/screens/10-account/account.png`
  - **HTML:** `design/screens/10-account/account.html`
  - **Screen Width:** 390px (1x), 780px (2x export)

- **Log out confirmation modal:**
  - **Image:** `design/screens/10-account/logout-confirmation.png`

- **Privacy Policy & Terms screen:**
  - **Image:** `design/screens/10-account/privacy-policy-terms.png`

## Layout Structure

The Account screen is a scrollable view with the following sections, from top to bottom:

1. User Profile Summary & Member Status (card)
2. Official Cavite Passport ID Card (gradient card)
3. Activity & Stats Cards (3-column grid)
4. Account Details (card)
5. Navigation Links (card with 3 rows)
6. Log Out Button
7. Version Text

## Section Breakdown

### 1. User Profile Summary & Member Status

**Container:**
- White card (`surface-container-lowest`)
- 16px border radius (`theme.radii.card`)
- Subtle border (`border-divider/60`)
- Shadow (`theme.shadows.card`)
- 16px padding
- Flex row, space-between alignment

**Left side:**
- Person icon in rounded circle:
  - 52px diameter (w-13 h-13 = 52px)
  - Light blue background (`primary/10`)
  - 2px border (`primary/20`)
  - Person icon (Ionicons `person` or similar), 28px size, primary color
- User name:
  - 18px font size (`headlineMedium` or similar)
  - Bold weight
  - Primary color
  - Leading: snug
- Status badge:
  - Small green dot (8px diameter), emerald-500, with pulse animation
  - Text: "Verified Resident / Tourist"
  - 12px font size
  - Emerald text on emerald background (emerald-50)
  - Emerald border (emerald-200)
  - Pill shape (full border radius)
  - 8px horizontal padding, 2px vertical padding

**Right side:**
- "Points" label:
  - 11px font size
  - Text secondary color
  - Uppercase
  - Semibold
  - Letter spacing: wider
- Points value:
  - 18px font size
  - Extrabold weight
  - Secondary color (orange)
  - Tracking: tight

**Note:** This card appears in account.png but duplicates information from the Header. Consider omitting it or simplifying it to reduce redundancy. List in DIFFERENCES.md if omitted.

### 2. Official Cavite Passport ID Card

**Container:**
- 16px border radius
- Gradient background: from #0B2A4A via #003260 to #001f3f (dark blue gradient)
- 16px padding
- Border: 1px solid #1e4875 (darker blue)
- Shadow: large (`theme.shadows.card`)
- White text throughout
- Decorative backdrop elements:
  - Large circle (160px diameter) at bottom-right, -32px offset, radial gradient (orange #F89C48 at center, fading to transparent), 10% opacity
  - Medium circle (128px diameter) at top-left, -24px offset, solid white, 5% opacity

**Card Top (Header & Seals):**
- Border bottom: 1px solid white/10
- Padding bottom: 12px
- Flex row, space-between alignment

**Left side of header:**
- Shield icon in rounded container:
  - 36px square
  - 8px border radius
  - White/10 background
  - 1px border, orange/40 color (#F89C48/40)
  - Shield icon (Ionicons `shield` or `shield-checkmark`), 20px size, orange color (#F89C48)
- Text group:
  - Top line: "Republic of the Philippines"
    - 9px font size
    - Uppercase
    - Letter spacing: widest
    - Light blue color (#d4e3ff/80)
    - Medium weight
  - Bottom line: "Cavite Tourism Passport"
    - 14px font size
    - Bold weight
    - White color
    - Letter spacing: wide
    - 2px margin top

**Right side of header:**
- "Active" badge:
  - Pill shape (full border radius)
  - Emerald background (emerald-500/20)
  - Emerald text (emerald-300)
  - Emerald border (emerald-400/30)
  - 10px font size
  - Semibold weight
  - 8px horizontal padding, 2px vertical padding
  - Green dot (6px diameter) before text, emerald-400 color

**Card Body (Info & QR Code):**
- Padding top and bottom: 14px
- Flex row, space-between alignment, center vertical alignment
- 12px gap between left and right sections

**Left section:**
- "Passport ID Number" label:
  - 10px font size
  - Uppercase
  - Letter spacing: wider
  - Light blue color (#d4e3ff/70)
  - Medium weight
- Passport ID with copy button:
  - Passport ID: "CVT-2027-000123"
    - Mono font (system-ui monospace or Inter with monospace features)
    - 16px font size
    - Bold weight
    - Letter spacing: widest
    - Orange color (#F89C48)
  - Copy button:
    - Small button (8px padding)
    - White/70 color (inactive), white color (active)
    - Copy icon (Ionicons `copy-outline`), 16px size
    - Press feedback: scale to 0.95
    - After copy: show checkmark icon (Ionicons `checkmark`), emerald-400 color, for 1.8 seconds
- Holder info group (margin top: 12px):
  - "Holder Name" label:
    - 10px font size
    - Uppercase
    - Letter spacing: wider
    - Light blue color (#d4e3ff/70)
    - Medium weight
  - Name value:
    - 14px font size
    - Bold weight
    - White color
    - Letter spacing: wide
    - Truncate if too long
    - 2px margin top
  - Municipality with icon:
    - 11px font size
    - Light blue color (#d4e3ff/80)
    - 2px margin top
    - Location pin icon (Ionicons `location`), 13px size, orange color (#F89C48), 4px gap before text

**Right section (QR Code):**
- Container:
  - White background
  - 12px border radius
  - 8px padding
  - Shadow (small)
  - 1px border, white/20 color
- QR Code:
  - 64px square SVG
  - Primary color (#003260) for QR code pattern
  - Orange accent (#F89C48) in center dot
  - Simplified QR code pattern with corner markers and data dots (not a real QR code library)
- Label below QR:
  - "Scan ID" text
  - 9px font size
  - Bold weight
  - Primary color
  - Uppercase
  - Letter spacing: wider
  - 4px margin top

**Card Bottom Strip:**
- Border top: 1px solid white/10
- Padding top: 8px
- Flex row, space-between alignment
- 11px font size
- Light blue color (#d4e3ff/75)

- Left text: "Provincial Tourism Board"
- Right text: "Official Pass 2027", orange color (#F89C48), semibold weight

### 3. Activity & Stats Cards

**Layout:**
- Grid with 3 columns, equal width
- 10px gap between cards (gap-2.5 = 10px)

**Each card:**
- White background (`surface-container-lowest`)
- 16px border radius
- 12px padding
- Border (`border-divider/60`)
- Shadow (`theme.shadows.card`)
- Flex column layout

**Card header (top row):**
- Flex row, space-between alignment
- Label:
  - 10px font size
  - Semibold weight
  - Uppercase
  - Letter spacing: wider
  - Text secondary color
- Icon:
  - 16px size
  - Different color per card (primary, secondary, or category color)

**Card 1: Stamps**
- Icon: Ionicons `ribbon` or Material `approval`, primary color
- Label: "Stamps"
- Value section (margin top: 8px):
  - Count: "5" (20px font size, bold, primary color)
  - Total: "/ 20" (12px font size, medium, text secondary color), 2px gap
  - Progress bar (margin top: 6px):
    - Container: 4px height, full width, surface container background, full border radius
    - Fill: primary color, 25% width (5/20), full border radius

**Card 2: Points**
- Icon: Ionicons `star` or Material `toll`, secondary color (orange)
- Label: "Credits"
- Value section (margin top: 8px):
  - Count: "450" (20px font size, bold, secondary color)
  - Unit: "pts" (12px font size, medium, secondary color), 2px gap
  - Indicator (margin top: 4px):
    - "+150 new" text (10px font size, semibold, emerald-600 color)
    - Up arrow icon (Ionicons `arrow-up`), 11px size, emerald-600 color, 2px gap before text

**Card 3: Promo Period**
- Icon: Ionicons `megaphone` or Material `campaign`, secondary container color (#994700)
- Label: "Promo"
- Value section (margin top: 8px):
  - Title: "Q1 Season" (11px font size, bold, primary color, leading tight)
  - Date range: "Jan 1 – Mar 31" (10px font size, medium, text secondary color, leading tight, 2px margin top)

**Note:** The promo period data comes from `usePromoPeriod` hook. Format the date range dynamically (e.g., "Jan 1 – Mar 31" if the promo spans multiple months, or "Jan 15 – Jan 31" if within one month).

### 4. Account Details Section

**Container:**
- White card (`surface-container-lowest`)
- 16px border radius
- 16px padding
- Border (`border-divider/60`)
- Shadow (`theme.shadows.card`)
- Flex column layout
- 12px gap between rows

**Header row:**
- Border bottom: 1px solid `border-divider/50`
- Padding bottom: 8px
- Flex row, space-between alignment
- Title: "ACCOUNT DETAILS"
  - 12px font size
  - Bold weight
  - Uppercase
  - Letter spacing: wider
  - Text secondary color
- "Edit" button:
  - 12px font size
  - Semibold weight
  - Primary color
  - Underline on press
  - Non-functional in this spec (placeholder)

**Detail rows (4 rows):**
Each row:
- Flex row, space-between alignment
- 14px font size
- 2px vertical padding

**Row 1: Full Name**
- Icon: Ionicons `person-circle-outline` or Material `badge`, 18px size, primary/70 color, 8px gap
- Label: "Full Name", text secondary color
- Value: User name, semibold weight, primary color

**Row 2: Address**
- Icon: Ionicons `location-outline` or Material `home_pin`, 18px size, primary/70 color, 8px gap
- Label: "Address", text secondary color
- Value: User address, medium weight, on-surface color, right-aligned, 12-14px font size

**Row 3: Email**
- Icon: Ionicons `mail-outline` or Material `mail`, 18px size, primary/70 color, 8px gap
- Label: "Email", text secondary color
- Value: User email, medium weight, on-surface color

**Row 4: Contact Number**
- Border top: 1px solid `border-divider/50`
- Padding top: 8px
- Flex row, space-between alignment, center vertical alignment

**Left side:**
- Icon: Ionicons `phone-portrait-outline` or Material `phone_iphone`, 18px size, primary/70 color, 8px gap
- Label and value group:
  - Label: "Contact Number", text secondary color, 12px font size
  - Value: "+63 •••••••••" (if no number) or "+63 917 123 4567" (if added), semibold weight, on-surface color, 14px font size

**Right side (conditional):**
- If no contact number:
  - "Add Contact Number" button:
    - Accent variant (orange, `secondary-container` background)
    - White text
    - 12px font size
    - Semibold weight
    - Full border radius (pill shape)
    - 12px horizontal padding, 6px vertical padding
    - Shadow (small)
    - "+" icon (Ionicons `add`), 14px size, 4px gap before text
    - Press feedback: scale to 0.95
- If contact number exists and verified:
  - "Verified" badge:
    - Emerald background (emerald-100 or emerald-500/20)
    - Emerald text (emerald-700)
    - Emerald border (emerald-300)
    - Full border radius (pill shape)
    - 8px horizontal padding, 4px vertical padding
    - 12px font size
    - Semibold weight
    - Checkmark icon (Ionicons `checkmark-circle`), 14px size, emerald-700 color, 4px gap before text

### 5. Navigation Links Section

**Container:**
- White card (`surface-container-lowest`)
- 16px border radius
- Border (`border-divider/60`)
- Shadow (`theme.shadows.card`)
- Flex column layout
- Dividers between rows

**Each row:**
- Pressable with press feedback (background changes to `surface-container-low` on press)
- 14px padding
- Flex row, space-between alignment, center vertical alignment

**Left side:**
- Icon container:
  - 36px square
  - 12px border radius
  - Background color varies per row
  - Icon: 20px size, color varies per row
- Text group (12px left margin):
  - Title: 14px font size, semibold weight, primary color
  - Subtitle: 12px font size, text secondary color, 2px margin top

**Right side:**
- Chevron right icon (Ionicons `chevron-forward`), 20px size, text secondary color

**Row 1: Settings & Preferences**
- Icon container: `primary-fixed` background (#d4e3ff)
- Icon: Ionicons `settings-outline` or Material `tune`, primary color
- Title: "Settings & Preferences"
- Subtitle: "Push Notifications, Language & Help FAQs"
- Action: Navigate to `/settings`

**Row 2: Redemptions & Vouchers**
- Icon container: `secondary-fixed` background (#ffdbc8)
- Icon: Ionicons `qr-code-outline` or Material `qr_code_2`, secondary color
- Title: "Redemptions & Vouchers"
- Subtitle: "View claimed rewards & active QR passes"
- Action: Placeholder (show "Coming soon" toast or do nothing)

**Row 3: Privacy Policy & Terms**
- Icon container: `surface-container` background (#e9edff)
- Icon: Ionicons `shield-checkmark-outline` or Material `shield_person`, primary color
- Title: "Privacy Policy & Terms"
- Subtitle: "Cavite Tourism Registry guidelines & data privacy"
- Action: Placeholder (show "Coming soon" toast or do nothing)

### 6. Log Out Button

**Button:**
- Full width
- 12px vertical padding
- 16px horizontal padding
- 12px border radius
- White background
- Red border (2px, `status-error` color)
- Red text (`status-error` color)
- Semibold weight
- 14px font size
- Shadow (small)
- Flex row, center alignment, 8px gap
- Logout icon (Ionicons `log-out-outline`), 18px size
- Press feedback: scale to 0.99
- Action: Open log out confirmation modal (task 5.7)

**Version text below button (margin top: 8px):**
- 11px font size
- Text secondary color
- Center alignment
- Text: Use APP_VERSION from constants (e.g., "Cavite Tourism Passport App • v2.4.1 (Build 2027)")

## Log Out Confirmation Modal

Match design from `logout-confirmation.png`. This is a modal overlay that appears when the user taps the "Log out" button.

**Overlay:**
- Semi-transparent black background (rgba(0, 0, 0, 0.5))
- Full screen
- Center-aligned modal container

**Modal container:**
- White background
- 20px border radius
- 320px max width
- 24px padding
- Shadow (large)
- Center-aligned content

**Icon:**
- Warning icon (Ionicons `warning-outline` or `alert-circle-outline`)
- 56px size
- Error color (red)
- 12px bottom margin

**Title:**
- 18px font size
- Bold weight
- Primary color
- Text: "Log Out?"
- 8px bottom margin

**Message:**
- 14px font size
- Text secondary color
- Center alignment
- Text: "Are you sure you want to log out? You'll need to sign in again to access your passport."
- 24px bottom margin

**Button row (horizontal, equal width):**
- 12px gap between buttons
- Full width

**Cancel button:**
- Outline variant (white background, border, primary text)
- 44px height
- Flex: 1
- Text: "Cancel"
- Closes modal, keeps session

**Confirm button:**
- Primary variant (error color background, white text)
- 44px height
- Flex: 1
- Text: "Log Out"
- Shows loading spinner when signOut is in progress
- Calls signOut from useSignOut hook

**Android back button:**
- Closes modal (same as Cancel)

## Privacy Policy & Terms Screen

Match design from `privacy-policy-terms.png`. This is a root-level route (`src/app/privacy.tsx`) with a back arrow.

**Check the design image:** If the tab bar is visible in `privacy-policy-terms.png`, nest the route inside `(tabs)` instead of at root level. If no tab bar is visible, use root level as described here.

**Layout:**
- ScreenContainer with `scrollable={true}`, `showHeader={true}`, `headerTitle="Privacy Policy & Terms"`
- Back arrow in header navigates back
- White background
- 16px horizontal padding

**Header:**
- 56px height
- White background
- Bottom border (1px, `border-divider`)
- Back button (Ionicons `arrow-back`, 20px size)
- Title: "Privacy Policy & Terms"
  - 18px font size
  - Bold weight
  - Primary color
  - Center-aligned

**Content sections:**
- Scrollable content with multiple sections
- Each section has a title (16px, bold, primary color, 24px bottom margin) and body text (14px, text color, 16px line height, 24px bottom margin)
- Sections (titles and content come from `src/data/legal-content.ts`):
  1. **Introduction**
  2. **Information We Collect**
  3. **How We Use Your Information**
  4. **Data Sharing and Disclosure**
  5. **Your Rights**
  6. **Security**
  7. **Changes to This Policy**
  8. **Contact Us**

**Content source:**
- All text comes from `src/data/legal-content.ts`
- Mark content as placeholder text pending Tourism Office and legal review
- Use `legalContent` object with keys matching section names (e.g., `legalContent.introduction`, `legalContent.informationWeCollect`, etc.)

**Footer:**
- Last updated date (12px, text secondary color, center-aligned)
- 32px bottom padding (additional space after content)

**Behavior:**
- Opened from Account screen "Privacy Policy & Terms" navigation row
- Also opened from sign up email screen terms link (if link exists in email.tsx)
- Android back button navigates back
- ScreenContainer handles safe area and keyboard automatically

## Add Contact Number Bottom Sheet

The bottom sheet is opened by tapping "Add Contact Number" button. It uses `@gorhom/bottom-sheet` with three stages.

**Bottom sheet container:**
- White background
- Rounded top corners (24px border radius)
- 20px padding
- 32px bottom padding (for safe area)
- Shadow (large)
- Drag handle: 48px wide, 4px height, gray-300 color, full border radius, 16px bottom margin, centered

### Stage 1: Phone Input

**Header row:**
- Flex row, space-between alignment
- Left side:
  - Icon in circle:
    - 32px diameter
    - `secondary-fixed` background (#ffdbc8)
    - SMS icon (Ionicons `chatbox-outline`), 18px size, secondary color
  - Title: "Add Contact Number"
    - 16px font size
    - Bold weight
    - Primary color
    - 8px left margin
- Right side:
  - Close button:
    - 32px diameter
    - Gray-100 background
    - Full border radius
    - Close icon (Ionicons `close`), 18px size, gray-500 color
    - Press feedback: gray-700 color

**Description text (margin top: 12px):**
- 12px font size
- Text secondary color
- Text: "Enter your 10-digit mobile number to receive instant SMS codes for verified tourist perks and stamp claims."

**Phone input group (margin top: 16px):**
- Label: "Mobile Phone"
  - 12px font size
  - Semibold weight
  - Primary color
  - 4px bottom margin
- Input container:
  - Flex row, center alignment
  - 48px height
  - 12px border radius
  - Surface card background (#F4F6FA)
  - 1px border, `border-divider` color
  - 12px padding
  - Focus ring: 2px, primary/40 color, white background on focus
- Prefix: "+63"
  - Bold weight
  - Primary color
  - 14px font size
  - 8px right padding
  - 1px right border, `border-divider` color
- Input field:
  - Flex: 1
  - 12px left padding
  - 14px font size
  - Semibold weight
  - Letter spacing: wide
  - Primary color
  - Placeholder: "917 123 4567", text secondary/60 color
  - Max length: 10 digits
  - Keyboard type: phone-pad

**Send Code button (margin top: 16px):**
- Accent variant (orange, `secondary-container` background)
- White text
- Semibold weight
- 14px font size
- Full width
- 44px height
- Full border radius (pill shape)
- Shadow (medium)
- Press feedback: scale to 0.95
- Flex row, center alignment, 6px gap
- Text: "Send Verification Code"
- Arrow forward icon (Ionicons `arrow-forward`), 18px size

### Stage 2: OTP Verification

**Header row:**
- Flex row, space-between alignment
- Left side:
  - Back button:
    - 12px font size
    - Primary color
    - Semibold weight
    - Flex row, center alignment, 4px gap
    - Back arrow icon (Ionicons `arrow-back`), 16px size
    - Text: "Back"
- Right side:
  - "SMS Code Sent" label:
    - 12px font size
    - Bold weight
    - Secondary color (orange)
    - Uppercase
    - Letter spacing: wider

**Title and description (margin top: 8px, center alignment):**
- Title: "Verify Mobile Number"
  - 16px font size
  - Bold weight
  - Primary color
- Description: "Code sent to +63 917 ••• ••••"
  - 12px font size
  - Text secondary color
  - 2px margin top
  - Masked phone number: show first 3 digits, mask middle 6 digits, show last 4 digits

**CodeInput group (margin top: 16px, center alignment):**
- Use existing `CodeInput` component from `src/components/ui/CodeInput.tsx`
- 6 digits
- 44px square inputs
- 8px gap between inputs
- 12px border radius
- Surface card background
- 1px border, `border-divider` color
- Focus ring: 2px, primary color
- Center text, bold, 18px font size, primary color

**Resend code row (margin top: 16px):**
- Flex row, space-between alignment
- Left text: "Didn't receive code?"
  - 12px font size
  - Text secondary color
- Right button: "Resend in 30s"
  - 12px font size
  - Secondary color (orange)
  - Semibold weight
  - Underline on press
  - Countdown timer: 30 seconds

**Verify button (margin top: 16px):**
- Primary variant (navy, `primary-container` background)
- White text
- Semibold weight
- 14px font size
- Full width
- 44px height
- Full border radius (pill shape)
- Shadow (medium)
- Press feedback: scale to 0.95
- Flex row, center alignment, 6px gap
- Verified icon (Ionicons `checkmark-circle`), 18px size
- Text: "Verify & Link"

**Error message (conditional, margin top: 8px):**
- 12px font size
- Error color (`status-error`)
- Center alignment
- Text: "Invalid code. Please try again."

### Stage 3: Success

**Center-aligned content:**
- Success icon:
  - 56px diameter circle
  - Emerald-100 background
  - Emerald-600 checkmark icon (Ionicons `checkmark-circle`), 32px size
  - 4px bottom margin
- Title: "Number Successfully Linked!"
  - 16px font size
  - Bold weight
  - Primary color
  - 8px margin top
- Description: "Your Cavite Tourism Passport is now updated with verified SMS notices."
  - 12px font size
  - Text secondary color
  - Center alignment
  - Max width: 320px
  - 8px margin top

**Done button (margin top: 24px):**
- Accent variant (orange, `secondary-container` background)
- White text
- Semibold weight
- 14px font size
- Full width
- 44px height
- Full border radius (pill shape)
- Text: "Done"

## Theme Token Mapping

| Design HTML Value | Theme Token | Notes |
|---|---|---|
| `#003260`, `#0a1b39`, `#1B2A49` | `theme.colors.text` or `primary` | Primary text or primary color |
| `#6B7280` | `theme.colors.textSecondary` | Secondary text |
| `#F47B20`, `#fc8127` | `theme.colors.accent` | Accent/orange color |
| `#FFFFFF` | `theme.colors.background` | White background |
| `#F4F6FA` | `theme.colors.surface` | Surface/card background |
| `#E5E7EB` | `theme.colors.border` | Border/divider color |
| `#D64545` | `theme.colors.error` | Error/red color |
| `#2E9E5B` | `theme.colors.success` | Success/green color |
| 16px | `theme.radii.card` | Card border radius |
| 24px | `theme.radii.button` | Button border radius (pill) |
| 12px | `theme.radii.input` | Input border radius |
| 4px, 8px, 12px, 16px, 24px | `theme.spacing` | Use spacing scale |
| Shadow values | `theme.shadows.card`, `theme.shadows.button` | Use predefined shadows |

## Icons

Use Ionicons from `@expo/vector-icons` for all icons:

- Person: `person`, `person-circle-outline`
- Shield: `shield`, `shield-checkmark`, `shield-checkmark-outline`
- Location: `location`, `location-outline`
- Mail: `mail`, `mail-outline`
- Phone: `phone-portrait-outline`, `call-outline`
- Settings: `settings-outline`, `cog-outline`
- QR Code: `qr-code-outline`
- Logout: `log-out-outline`
- Copy: `copy-outline`
- Checkmark: `checkmark`, `checkmark-circle`
- Close: `close`
- Arrow: `arrow-back`, `arrow-forward`, `arrow-up`
- Add: `add`
- SMS: `chatbox-outline`, `mail-outline`
- Star: `star`, `star-outline`
- Ribbon: `ribbon`, `trophy-outline`
- Megaphone: `megaphone-outline`
- Chevron: `chevron-forward`, `chevron-right`

## Responsive Considerations

- All cards have full width with 16px left and right margins (from ScreenContainer padding)
- Activity stats grid uses equal column widths with flexible wrapping
- Text truncates with ellipsis where needed (user name, address)
- Bottom sheet adjusts to keyboard (use KeyboardAvoidingView or bottom sheet's keyboardBehavior)
- Safe area insets: applied by ScreenContainer (left and right only) and Header (top only)
- Tab bar padding: applied by ScreenContainer with `withTabBarPadding={true}`

## Animation and Interaction

- Card press feedback: scale to 0.98 with spring animation
- Button press feedback: scale to 0.95 or 0.99 (log out button) with spring animation
- Copy button: checkmark icon appears for 1.8 seconds after copying
- Status badge pulse animation: green dot animates with pulse effect
- Bottom sheet: slides up from bottom with easing curve, drag handle for dismissal
- Resend code countdown: updates every second from 30 to 0

## Accessibility

- All interactive elements have minimum 44x44pt touch targets
- Icons have accessible labels (aria-label or accessibilityLabel)
- Inputs have associated labels
- Buttons have clear text labels
- Color is not the only indicator of state (icons accompany colors)
- Focus order is logical (top to bottom, left to right)

## Notes on Design Deviations

If any of the following appear in account.png, they should be **omitted** and documented in DIFFERENCES.md:

1. **Profile photo or avatar** (User type has no avatar field)
2. **User Profile Summary card at the top** (duplicates Header information—consider simplifying or omitting)
3. Any decorative elements not critical to the feature (e.g., heritage seals, background patterns beyond the ID card)

All other visual details should match the design as closely as possible using theme tokens.
