# Implementation Plan: Passport

## Overview

The Passport screen displays the user's digital tourism passport with a summary card, segmented toggle for Identity Page and Visas & Stamps views, and a "View Rewards" button. Identity Page shows passport details with a generic person icon, issued and valid-through dates from the promo period. Visas & Stamps displays stamp slots grouped by category (Dining, Staycation, Adventure, Heritage, Festival), with collected stamps shown in ink-stamp style and uncollected slots as muted dashed outlines. The screen accepts a `view` search param to open directly to stamps view from the scanner success modal. All styling uses React Native components and theme tokens, no web code.

## Tasks

- [ ] 1. Create data hooks and constants for Passport
  - Create `src/hooks/useStamps.ts` as a React Query hook wrapping getStamps from api.ts, returns stamps array with loading and error states
  - Create `src/hooks/useSites.ts` as a React Query hook wrapping getSites from api.ts, returns sites array with loading and error states
  - Add passport issuer and footer wording constants to `src/lib/constants.ts`: PASSPORT_ISSUER_LINE = "Lalawigan ng Cavite", PASSPORT_FOOTER = "Cavite Tourism Passport", both marked TBD pending Tourism Office confirmation
  - _Requirements: 1.1_

- [ ] 2. Create summary card component
  - Create `src/components/passport/SummaryCard.tsx`
  - Display "Digital Passport" title with Ionicons 'book' icon on the left
  - Display green "Active Season" badge on the same line (right-aligned) when promo is active per usePromoPeriod, with green dot (6px diameter) and text
  - Badge uses numberOfLines={1} and flexShrink to prevent wrapping
  - Two tiles in a 2-column grid: "Stamps Collected" (N of TOTAL collected, blue background) and "Passport Balance" (POINTS PTS, orange background)
  - Overall completion bar below tiles showing percentage (N / TOTAL * 100)
  - White card background, 16px radius, theme shadow, 16px padding
  - N = stamps.length, TOTAL = count of stamp slots (sites.length + festivals with stamps), POINTS = currentUser.points
  - _Requirements: 2.1, 2.2_

- [ ] 3. Create segmented toggle component
  - Create `src/components/passport/SegmentedToggle.tsx`
  - Two options: "Identity Page" and "Visas & Stamps (N)" where N is stamps.length
  - Pill-shaped container with light gray background, 4px padding
  - Active option: primary blue background with white text, inactive: transparent with gray text
  - 32px height, labelMedium text style, 16px radius
  - OnPress calls callback with selected view ('identity' | 'stamps')
  - _Requirements: 2.3_

- [ ] 4. Create Identity Page card component
  - Create `src/components/passport/IdentityCard.tsx`
  - Navy blue header (#004987) with orange border bottom, shield icon (Ionicons 'shield'), issuer line from constants, and "PASAPORTE" badge
  - Cream tinted body (#FFFDF7) with subtle background (plain tint, no pattern)
  - Holder slot with generic person icon (Ionicons 'person-circle', 80px size, same for all users), no photo, no caption
  - Passport ID in platform monospace font (use 'monospace' as fontFamily on Android)
  - Fields: Full Name, Address (from currentUser), Issued Date and Valid Through Date (from usePromoPeriod start and end dates, formatted as "01 JAN 2027")
  - Footer with PASSPORT_FOOTER constant and "PAGE 01" on right
  - Remove machine-readable code strip, "URI / TYPE: P - REGULAR" field, "Republika ng Pilipinas", and "HOLDER PHOTO" caption
  - Match padding, spacing, and colors from HTML: header py-3, body p-4, footer py-1.5
  - 16px card radius, navy border
  - _Requirements: 2.4, 2.5_

- [ ] 5. Create Visas & Stamps card component and stamp slots
  - Create `src/components/passport/StampsCard.tsx` for the main card structure
  - Navy blue header with "N STAMPED" pill badge (N = stamps.length) on right
  - Cream tinted body with 2-column grid of stamp slots
  - Footer with "OPISYAL NA REHISTRO NG TATAK" text and "PAGE 02"
  - Create `src/components/passport/StampSlot.tsx` for individual stamp slots
  - Props: site (Site), stamp (Stamp | undefined), categoryColor (string)
  - Collected slot: ink-stamp style with dashed border in category color, slight rotation (-2 to 2 degrees with transform), category label, site name, municipality, date (formatted as "JAN 14, 2027"), points, and green "Stamped" check (Ionicons 'checkmark-circle')
  - Uncollected slot: muted gray, dashed border, lock icon (Ionicons 'lock-closed'), site name, municipality, points in orange badge, and gray "Uncollected" with empty circle icon
  - Slots grouped by category in order: Dining, Staycation, Adventure, Heritage, Festival (bonus)
  - Festival slots: one slot per event offering a stamp, show "+50 pts" and "Stamped" or "Uncollected" states only (remove "Pending Slot")
  - Slot height: auto-height to fit content, width: 48% (2 columns with 4% gap)
  - Category colors: Dining #00542A, Staycation #004987, Adventure #6B7280, Heritage #004987 or #F47B20 alternating, Festival #F47B20
  - Show date only (no time) unless time fits without layout change
  - 16px card radius, navy border
  - _Requirements: 2.6, 2.7, 2.8_

- [ ] 6. Implement Passport screen with view routing
  - Update `src/app/(tabs)/passport.tsx` to replace placeholder
  - Use useLocalSearchParams from expo-router to read optional `view` param ('identity' | 'stamps')
  - Default to 'identity' view if param is not provided
  - Render ScreenContainer with scrollable={true}, edges={['left', 'right']}, withTabBarPadding={true}
  - Render SummaryCard at top (task 2)
  - Render SegmentedToggle (task 3) below summary, controlling which card is shown
  - Conditionally render IdentityCard (task 4) or StampsCard (task 5) based on view state
  - "View Rewards" Button below card opens `/rewards` with router.push
  - Note text below button: "Collect stamps by scanning the QR code at each partner site."
  - Loading state shows skeleton or spinner for stamps and sites queries
  - Error state shows error message with retry button calling refetch on both queries
  - Empty state (0 stamps): show all slots as uncollected, count is 0, completion is 0%
  - _Requirements: 2.9, 2.10, 2.11_

- [ ] 7. Update Scanner success and already-scanned modals
  - Update `src/components/scanner/SuccessSheet.tsx`: change "Dismiss" button to "View in Passport"
  - Update `src/components/scanner/AlreadyScannedSheet.tsx`: change button to "View in Passport"
  - Both buttons call onViewPassport callback which navigates to `/(tabs)/passport?view=stamps` and closes the modal
  - Update `src/app/scanner.tsx` handleViewPassport function to router.push with search param
  - _Requirements: 2.12_

- [ ] 8. Add new theme colors if needed
  - Review implemented passport components against design images
  - Add any missing colors to `src/theme/index.ts` only if the design images require a color not already in the theme
  - Document each new token with a comment explaining its use
  - Do NOT add colors that can be achieved with existing tokens or opacity
  - _Requirements: 2.13_

- [ ] 9. Checkpoint - Verify, test, and document differences
  - Run `npx tsc --noEmit` and fix all TypeScript errors
  - Run `npx expo lint` and fix all linting errors
  - Test on physical Android phone: open Passport tab, toggle between views, tap "View Rewards", scan a QR code and tap "View in Passport" from success modal to verify it opens stamps view
  - Test with mock user (4 stamps, 450 pts) and verify counts match
  - Test empty state (modify mock data temporarily to have 0 stamps)
  - Test loading and error states
  - Verify Android back button works from all states
  - Verify bottom padding prevents tab bar from covering content when scrolled to bottom
  - Verify safe area insets are respected on all edges
  - Create `DIFFERENCES.md` in `.kiro/specs/passport/` listing every visual difference between the implemented screens and the design images in `design/screens/05-passport/`
  - Include differences in layout, spacing, colors, fonts, icons, and any omitted or simplified elements
  - Ensure all tests pass and the app runs without errors

## Notes

- Passport screen is a single vertically scrolling page, not a page-turn booklet
- Identity Page and Visas & Stamps are two views of the same card, toggled with a segmented control
- The tabs layout provides the Header (name and points) and PromoChip, so the Passport screen does not render them
- Summary card always shows, regardless of which view is selected
- Issued and valid-through dates come from usePromoPeriod (startDate and endDate)
- Holder photo slot shows the same generic person icon for every user (Ionicons 'person-circle'), not a user-uploaded photo
- Passport ID uses platform monospace font ('monospace' fontFamily on Android, no package installation)
- Festival category: one slot per event offering a stamp (derived from mockEvents with festivalStamp field)
- Festival stamps are bonus points only and do not replace the 4-category requirement
- Stamp slots are auto-height, grouped by category, displayed in a 2-column grid
- Collected stamps: slight rotation with transform (use random -2 to 2 degrees per slot), dashed border, category color, date formatted as "JAN 14, 2027"
- Uncollected slots: gray, dashed border, lock icon, no rotation
- Remove decorative elements not in docs/app.md: machine-readable code strip, "URI / TYPE: P - REGULAR", "Republika ng Pilipinas", "HOLDER PHOTO" caption, faint background pattern
- "Active Season" badge only shows when promo is active per usePromoPeriod
- Use numberOfLines={1} and flexShrink on "Active Season" badge to prevent wrapping
- Omit faint background pattern and use plain tinted background
- Scanner "View in Passport" buttons open `/(tabs)/passport?view=stamps` to show stamps view directly
- Total stamps count (TOTAL) = sites.length + festivals offering stamps
- Completion percentage = collected stamps / total slots * 100
- No backend calls yet - all data from hooks wrapping api.ts mock functions
- Successful scan must update Passport screen through React Query cache invalidation (handled by useCollectStamp mutation)
- Use theme tokens only, no hardcoded colors, spacing, or fonts
- All components use TypeScript strict mode (no `any` types)
- ScreenContainer with edges={['left', 'right']}, withTabBarPadding={true}
- Run lint and typecheck before declaring done
- Test on physical Android phone
- Document all visual differences from design images in DIFFERENCES.md

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1"]
    },
    {
      "id": 1,
      "tasks": ["2", "3", "4", "5"]
    },
    {
      "id": 2,
      "tasks": ["6", "7"]
    },
    {
      "id": 3,
      "tasks": ["8"]
    },
    {
      "id": 4,
      "tasks": ["9"]
    }
  ]
}
```
