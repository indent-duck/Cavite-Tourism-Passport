# Implementation Plan: Settings

## Overview

The Settings feature provides app configuration and help resources. It displays four sections: Device & Alerts (push notifications toggle and location services status), FAQs & Help (accordion of frequently asked questions), Official Tourism Links (four external links to tourism agencies), and app version information. The screen is accessible from the Account screen and uses a custom FAQ accordion component for expandable help content. All data flows through hooks that call mock API functions in `src/data/api.ts`, following the project's data layer architecture. Settings state is persisted in-memory for this UI-first phase.

## Tasks

- [x] 1. Update types and mock data for settings
  - [x] 1.1 Add Settings and FAQ types
    - Open `src/data/types.ts`
    - Add `Settings` interface with `pushNotificationsEnabled: boolean` field
    - Add `FAQ` interface with `id: string`, `question: string`, `answer: string`, `icon?: string` fields
    - Export both interfaces
    - _Requirements: 2.6.3, 3.1.1_

  - [x] 1.2 Create mock settings and FAQs
    - Open `src/data/mock-data.ts`
    - Export `mockSettings: Settings` with `pushNotificationsEnabled: true` (default enabled)
    - Export `mockFaqs: FAQ[]` array with 4 FAQ items from design:
      - FAQ 1: "How do I collect stamps with the QR scanner?" with icon `qr-code-outline`
      - FAQ 2: "How do points and rewards redemption work?" with icon `gift-outline` (answer MUST state: Dining 150, Staycation 200, Adventure 100, Heritage 50, Festival 50 bonus, 700 points + one stamp from each main category required, one prize per promo period)
      - FAQ 3: "Can I scan a site QR code more than once?" with icon `sync-outline`
      - FAQ 4: "What should I do if the scanner cannot verify my location?" with icon `location-outline`
    - Answer text MUST match design but ensure point values and reward rules match `docs/app.md`
    - Answers MUST NOT mention geofence distance or claim QR expiry (TBD values)
    - _Requirements: 2.3.4, 2.3.5, 2.3.6, 2.3.7_

- [x] 2. Create API functions for settings
  - [x] 2.1 Add getSettings function to api.ts
    - Open `src/data/api.ts`
    - Implement `getSettings(): Promise<Settings>`
    - Add artificial delay (300-800ms using `randomDelay()`)
    - Return `mockSettings` from mock-data.ts
    - Add JSDoc comment
    - _Requirements: 2.2.2, 2.6.2, 2.6.3_

  - [x] 2.2 Add updateSettings function to api.ts
    - Implement `updateSettings(settings: Partial<Settings>): Promise<Settings>`
    - Add artificial delay
    - Update `mockSettings` in-memory: `mockSettings = { ...mockSettings, ...settings }`
    - Return updated `mockSettings`
    - Add JSDoc comment
    - _Requirements: 2.2.2, 2.6.2, 2.6.3_

- [x] 3. Create useSettings hook
  - [x] 3.1 Create useSettings hook
    - Create `src/hooks/useSettings.ts`
    - Import `useQuery`, `useMutation`, `useQueryClient` from React Query
    - Import `getSettings`, `updateSettings` from api.ts
    - Import `Settings` type
    - Create `useSettings` hook that returns `{ settings, isLoading, updateSetting, isUpdating }`
    - Use `useQuery` with queryKey `['settings']` and queryFn `getSettings`
    - Use `useMutation` with mutationFn `updateSettings` and onSuccess that updates query cache with `queryClient.setQueryData(['settings'], updatedSettings)`
    - `updateSetting` helper function takes `(key: keyof Settings, value: boolean)` and calls `mutation.mutate({ [key]: value })`
    - Export hook with named export
    - _Requirements: 2.2.2, 2.6.1, 2.6.2_

  - [x] 3.2 Export useSettings from hooks index
    - Open `src/hooks/index.ts`
    - Add `export { useSettings } from './useSettings';`
    - _Requirements: 2.6.1_

- [x] 4. Add social link constants
  - [x] 4.1 Add social link URLs to constants
    - Open `src/lib/constants.ts`
    - Add comment "// Social Links (TBD - pending Tourism Office URLs)"
    - Export `SOCIAL_LINKS` object with four keys:
      - `BIYAHENG_SOUTH: 'https://example.com/biyaheng-south' // TBD`
      - `CAVITE_TOURISM: 'https://example.com/cavite-tourism' // TBD`
      - `DOT_4A: 'https://example.com/dot-region4a' // TBD`
      - `DILG_4A: 'https://example.com/dilg-region4a' // TBD`
    - Each URL must have a "// TBD" comment
    - _Requirements: 2.4.3_

- [x] 5. Implement Settings screen
  - [x] 5.1 Create Settings screen layout and header
    - Open `src/app/settings.tsx`
    - Replace placeholder content
    - Import `ScreenContainer`, `useSettings` hook, `mockFaqs`, `SOCIAL_LINKS`, `APP_VERSION`, theme tokens, Ionicons
    - Use ScreenContainer with `scrollable={true}`, `showHeader={true}`, `headerTitle="Settings & Help"`, `showBackButton={true}`
    - The route is root-level (not nested in tabs) because the tab bar is not visible in the design
    - No `withTabBarPadding` needed
    - Main container with paddingHorizontal 16, paddingVertical 20, gap 24, paddingBottom 32
    - _Requirements: 2.1.2, 2.1.3, 3.2.2_

  - [x] 5.2 Create Device & Alerts section
    - Section header: View with flexDirection row, alignItems center, gap 8, paddingHorizontal 4
      - Ionicons `options` icon (20px, primary, filled)
      - Text "DEVICE & ALERTS" (12px, bold, primary, uppercase, letterSpacing 1.2)
    - Card container: backgroundColor background, borderRadius 16, padding 16, borderWidth 1, borderColor border with opacity 0.6, shadow
    - Push Notifications row:
      - Pressable with flexDirection row, justifyContent space-between, alignItems flex-start, gap 12
      - Left side: flexDirection row, alignItems flex-start, gap 12
        - Icon container: 36px width/height, borderRadius 12, backgroundColor primary-fixed with opacity 0.6, center icon `notifications-active` (20px, primary, filled)
        - Text container: flexDirection column, gap 4
          - Title "Push Notifications" (15px, semibold, text)
          - Subtitle "Get alerts for new stamp locations, events, and promo deadlines." (12px, textSecondary)
      - Right side: Toggle switch
        - Pressable with 44px width, 24px height, borderRadius full, backgroundColor based on state (primary-container if on, `#C2C6D2` if off), padding 2
        - Inner knob: 20px width/height, borderRadius full, backgroundColor white, transform translateX based on state (24px if on, 0 if off)
        - On press, call `updateSetting('pushNotificationsEnabled', !settings.pushNotificationsEnabled)`
        - Use animated View for smooth transition (optional, or use simple conditional styling)
    - Divider: height 1, backgroundColor border with opacity 0.5, marginVertical 16
    - Location Services row (read-only):
      - flexDirection row, justifyContent space-between, alignItems center, gap 12
      - Left side: flexDirection row, alignItems center, gap 12
        - Icon container: 36px width/height, borderRadius 12, backgroundColor `#A7F3D0` (emerald-200), center icon `location` (20px, `#047857` emerald-800, filled)
        - Text container: flexDirection column, gap 2
          - Title "Location Services" (14px, semibold, text)
          - Subtitle "Used for geo-verifying site stamps" (12px, textSecondary)
      - Right side: "Active" badge
        - flexDirection row, alignItems center, gap 6, paddingHorizontal 10, paddingVertical 6, backgroundColor `#D1FAE5` (emerald-100), borderRadius full, borderWidth 1, borderColor `#6EE7B7` (emerald-300)
        - Animated green dot: 8px width/height, borderRadius full, backgroundColor `#10B981` (emerald-500), pulsing animation (optional)
        - Text "Active" (11px, semibold, `#047857` emerald-800, letterSpacing 0.5)
    - Use data from `settings.pushNotificationsEnabled`
    - _Requirements: 2.2.1, 2.2.3, 2.2.5, 2.2.6, 2.2.7_

  - [x] 5.3 Create FAQs & Help section
    - Section header: View with flexDirection row, justifyContent space-between, alignItems center, paddingHorizontal 4
      - Left side: flexDirection row, alignItems center, gap 8
        - Ionicons `help-circle` icon (20px, primary, filled)
        - Text "FAQS & HELP" (12px, bold, primary, uppercase, letterSpacing 1.2)
      - Right side: Text "Tap to read" (11px, medium, textSecondary, backgroundColor surface, paddingHorizontal 8, paddingVertical 4, borderRadius 6)
    - FAQ list: flexDirection column, gap 10
      - For each FAQ in `mockFaqs`, render a custom FAQ item component:
        - Card container: backgroundColor background, borderRadius 16, borderWidth 1, borderColor border with opacity 0.6, overflow hidden, shadow
        - Pressable header: padding 16, flexDirection row, justifyContent space-between, alignItems center, gap 12, onPress toggles expanded state
          - Left side: flexDirection row, alignItems center, gap 12
            - Icon container: 28px width/height, borderRadius 8, backgroundColor varies per FAQ (primary-fixed for FAQ 1, secondary-fixed for FAQ 2, surface-variant for FAQ 3, tertiary-fixed for FAQ 4), center icon from `faq.icon` (17px, color varies)
            - Question text (14px, semibold, text)
          - Right side: Chevron icon `chevron-down` (20px, primary), rotated 180deg if expanded
        - Conditional answer (only if expanded):
          - Container: paddingHorizontal 16, paddingBottom 16, paddingTop 0
          - Answer box: backgroundColor `#F4F7FC`, borderRadius 12, padding 12, borderWidth 1, borderColor `#E3EAF4`
          - Answer text (13px, textSecondary, lineHeight 20)
    - Use local state to track which FAQ is expanded (or allow multiple open)
    - Start all FAQs collapsed (despite design showing FAQ 1 expanded)
    - _Requirements: 2.3.1, 2.3.2, 2.3.3, 2.3.4_

  - [x] 5.4 Create Official Tourism Links section
    - Section header: View with flexDirection row, alignItems center, gap 8, paddingHorizontal 4
      - Ionicons `business` icon (20px, primary, filled)
      - Text "OFFICIAL TOURISM LINKS" (12px, bold, primary, uppercase, letterSpacing 1.2)
    - Links list: flexDirection column, gap 10
      - For each of the 4 links, render a Pressable card:
        - backgroundColor background, borderRadius 16, padding 14, borderWidth 1, borderColor border with opacity 0.6, shadow
        - flexDirection row, justifyContent space-between, alignItems center, gap 12
        - On press, call `handleLinkPress(url)` using `expo-web-browser`
        - Active press scale: 0.99
        - Left side: flexDirection row, alignItems center, gap 12
          - Icon container: 40px width/height, borderRadius 12, backgroundColor varies (amber-500/10 for Biyaheng South, primary-fixed/60 for Cavite Tourism, emerald-500/10 for DOT, blue-500/10 for DILG), center icon varies per link (20px, color varies)
          - Text container: flexDirection column, gap 2
            - Title row: flexDirection row, alignItems center, gap 6
              - Title text (14px, semibold, text)
              - Optional verified badge: Ionicons `checkmark-circle` (15px, primary or passport-foil, filled) for first two links
            - Subtitle text (12px, textSecondary, truncate if too long)
        - Right side: External link indicator
          - Container: 32px width/height, borderRadius full, backgroundColor surface, center icon `open-outline` (18px, primary)
    - Links data:
      - Biyaheng South: icon `compass-outline`, title "Biyaheng South", subtitle "Official South Luzon Tourism guide", verified badge, url `SOCIAL_LINKS.BIYAHENG_SOUTH`
      - Cavite Tourism: icon `business-outline`, title "Cavite Provincial Tourism", subtitle "Cavite Provincial Capitol, Trece Martires", verified badge, url `SOCIAL_LINKS.CAVITE_TOURISM`
      - DOT IV-A: icon `earth-outline`, title "DOT IV-A", subtitle "Department of Tourism CALABARZON", no verified badge, url `SOCIAL_LINKS.DOT_4A`
      - DILG IV-A: icon `shield-checkmark-outline`, title "DILG IV-A", subtitle "Dept. of the Interior & Local Government", no verified badge, url `SOCIAL_LINKS.DILG_4A`
    - Implement `handleLinkPress` function using `expo-web-browser`:
      ```typescript
      import * as WebBrowser from 'expo-web-browser';
      
      const handleLinkPress = async (url: string) => {
        try {
          await WebBrowser.openBrowserAsync(url);
        } catch (error) {
          Alert.alert('Error', 'Cannot open this link.');
        }
      };
      ```
    - _Requirements: 2.4.1, 2.4.2, 2.4.4, 2.4.5_

  - [x] 5.5 Create footer with app version
    - Container: paddingTop 16, borderTopWidth 1, borderTopColor border with opacity 0.6, flexDirection column, alignItems center, gap 12
    - App icon: 48px width/height, borderRadius 16, backgroundColor primary, center Ionicons `medal` icon (26px, accent)
    - App name and version: flexDirection column, gap 4, alignItems center
      - Title "Cavite Tourism Passport" (14px, bold, primary)
      - Version "v{APP_VERSION} (Official Provincial Android Build)" (12px, medium, textSecondary)
    - Contact helpdesk button (placeholder, non-functional):
      - Pressable with flexDirection row, alignItems center, gap 6, paddingHorizontal 16, paddingVertical 8, backgroundColor surface, borderRadius full
      - Ionicons `headset-outline` icon (17px, primary)
      - Text "Contact Tourism Helpdesk" (13px, semibold, primary)
    - Footer note: flexDirection row, alignItems center, gap 8, marginTop 4
      - Green dot: 6px width/height, borderRadius full, backgroundColor `#10B981` (emerald-500)
      - Text "Official Digital System • Province of Cavite" (11px, textSecondary)
    - Use `APP_VERSION` from constants
    - _Requirements: 2.5.1, 2.5.2_

- [x] 6. Wire Settings navigation in Account screen
  - [x] 6.1 Verify Settings navigation from Account screen
    - Open `src/app/(tabs)/account.tsx`
    - Verify that the "Settings & Preferences" row already navigates to `/settings` using `router.push('/settings')`
    - If not wired, update the onPress handler to `router.push('/settings')`
    - Verify that the gear icon (if present in Account header) also navigates to `/settings`
    - If gear icon exists and is not wired, add onPress handler
    - Remove any placeholder "Coming soon" toast for Settings row
    - _Requirements: 2.1.1_

- [ ] 7. Checkpoint - Verify all Settings features and flows
  - Open the app on a physical Android phone
  - Navigate to Account tab and tap "Settings & Preferences" row
  - Verify the Settings screen opens with "Settings & Help" header and back arrow
  - Verify the Settings screen has four sections:
    - Device & Alerts with Push Notifications toggle and Location Services status
    - FAQs & Help with 4 expandable FAQ items
    - Official Tourism Links with 4 external link cards
    - Footer with app icon, version, and contact button
  - Test the Push Notifications toggle:
    - Tap the toggle to turn it off
    - Verify the toggle animates to off state (gray background, knob moves left)
    - Close the app completely (force-close)
    - Reopen the app and navigate back to Settings
    - Verify the toggle is still off (state persisted)
    - Toggle it back on
    - Verify the toggle animates to on state (primary background, knob moves right)
  - Test the Location Services indicator:
    - Verify it shows "Active" badge with green pulsing dot (or static green dot)
    - Verify it is NOT a toggle (read-only, cannot be tapped)
  - Test the FAQ accordion:
    - Verify all FAQs start collapsed
    - Tap FAQ 1 question
    - Verify answer expands with chevron rotating 180deg
    - Tap FAQ 1 question again
    - Verify answer collapses with chevron rotating back
    - Tap FAQ 2 question
    - Verify FAQ 2 answer expands
    - Verify FAQ answers match the rules in `docs/app.md`:
      - FAQ 2 answer mentions: Dining 150, Staycation 200, Adventure 100, Heritage 50, Festival 50 (bonus), 700 points + one stamp from each main category, one prize per promo period
    - Verify FAQ answers do NOT mention geofence distance or claim QR expiry
  - Test the Official Tourism Links:
    - Tap "Biyaheng South" link
    - Verify in-app browser or external browser opens with the URL from `SOCIAL_LINKS.BIYAHENG_SOUTH`
    - Close browser and return to app
    - Tap "Cavite Tourism" link
    - Verify browser opens with the URL from `SOCIAL_LINKS.CAVITE_TOURISM`
    - Tap "DOT IV-A" link and "DILG IV-A" link
    - Verify all links open correctly
  - Test the footer:
    - Scroll to the bottom
    - Verify app version displays correctly using `APP_VERSION` from constants
    - Verify "Contact Tourism Helpdesk" button is present (non-functional placeholder, no action needed)
  - Test navigation:
    - Tap back arrow in header
    - Verify return to Account screen
    - Navigate back to Settings
    - Press Android back button
    - Verify return to Account screen
  - Test keyboard behavior (if any text inputs added in future):
    - No text inputs on this screen, skip this test
  - Run `npx tsc --noEmit` and verify no TypeScript errors
  - Run `npx expo lint` and verify no linting errors
  - Create `DIFFERENCES.md` in `.kiro/specs/settings/` listing every difference between the implementation and the design images:
    - List any visual differences (colors, spacing, sizes)
    - List any behavioral differences (e.g., FAQs start collapsed vs. design shows FAQ 1 expanded)
    - List any omitted features from the design (e.g., Contact helpdesk button is placeholder)
    - List any added features not in the design

## Notes

- Settings screen is a root-level route at `src/app/settings.tsx` because the tab bar is NOT visible in the design
- No `withTabBarPadding` needed (not a tab route)
- The push notifications toggle stores state via `updateSettings` API function (mock, in-memory for now)
- OS-level notification permission requests are NOT handled in this spec (handled separately with `expo-notifications`)
- The toggle is the ONLY notification control (no category-specific toggles)
- FAQ answers must match the rules in `docs/app.md` for points per category and reward eligibility
- FAQ answers must NOT mention geofence distance or claim QR expiry (TBD values)
- Social link URLs are example.com placeholders marked TBD in constants
- Social links open in in-app browser using `expo-web-browser` (recommended) or external browser using `expo-linking`
- The "Contact Tourism Helpdesk" button in the footer is a placeholder (non-functional, no email integration in this spec)
- The design shows FAQ 1 expanded by default, but the code starts all FAQs collapsed for consistency
- Location Services indicator is read-only (not a toggle), shows "Active" badge with green dot
- The FAQ accordion uses a custom component (not the existing Collapsible component, which has different styling)
- All spacing, radii, colors, and fonts use theme tokens—no hardcoded values
- Testing must be on a physical Android phone (no emulator)
- TypeScript strict mode must pass with zero errors
- ESLint must pass with zero errors
- DIFFERENCES.md lists every visual or behavioral difference between the implementation and the design images
- The Settings screen does NOT include: language selection, dark mode toggle, change password option, delete account option, or notification categories (only one toggle for all notifications)
- The gear icon on Account screen (if present) should already navigate to `/settings` (verify and wire if missing)
- The "Settings & Preferences" row on Account screen should already navigate to `/settings` (verify and update if needed)

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1.1", "1.2", "4.1"]
    },
    {
      "id": 1,
      "tasks": ["2.1", "2.2"]
    },
    {
      "id": 2,
      "tasks": ["3.1"]
    },
    {
      "id": 3,
      "tasks": ["3.2"]
    },
    {
      "id": 4,
      "tasks": ["5.1", "5.2", "5.3", "5.4", "5.5"]
    },
    {
      "id": 5,
      "tasks": ["6.1"]
    },
    {
      "id": 6,
      "tasks": ["7"]
    }
  ]
}
```
