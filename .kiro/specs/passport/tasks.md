# Implementation Plan: Passport

## Overview

The Passport screen displays the user's digital tourism passport with a summary card, segmented toggle for Identity Page and Visas & Stamps views, and a "View Rewards" button. Identity Page shows passport details with a generic person icon, issued and valid-through dates from the promo period. Visas & Stamps displays stamp slots grouped by category (Dining, Staycation, Adventure, Heritage, Festival), with collected stamps shown in ink-stamp style and uncollected slots as muted dashed outlines. All styling uses React Native components and theme tokens, no web code.

## Tasks

- [x] 1. Create data hooks, constants, and theme tokens for Passport
  - Create `src/hooks/useStamps.ts` as a React Query hook wrapping getStamps from api.ts, returns stamps array with loading and error states
  - Create `src/hooks/useSites.ts` as a React Query hook wrapping getSites from api.ts, returns sites array with loading and error states
  - Create or reuse `src/hooks/useEvents.ts` as a React Query hook wrapping getEvents from api.ts (may already exist), returns events array with loading and error states
  - Add passport constants to `src/lib/constants.ts`: PASSPORT_ISSUER_LINE = "Province of Cavite", PASSPORT_SUBTITLE = "Official Passport", PASSPORT_HEADER_LABEL = "PASSPORT", PASSPORT_STAMPS_TITLE = "Official Stamps", PASSPORT_STAMPS_HEADER = "OFFICIAL STAMP REGISTER", PASSPORT_FOOTER = "Cavite Tourism Passport", all marked TBD pending Tourism Office confirmation
  - Add passport color tokens to `src/theme/index.ts` in the colors object: passportCream (body tint #FFFDF7), passportHeaderBorder (orange #F47B20), categoryDining (#00542A), categoryStaycation (#004987), categoryAdventure (#6B7280), categoryHeritage (pick one fixed color from design images), categoryFestival (#F47B20), with comments explaining usage
  - Update mock events in `src/data/mock-data.ts` to ensure at least one festival includes festivalStamp field with pointsBonus: 50 and available: true (event-001 already has it, verify it exists)
  - _Requirements: 1.1, 1.2_

- [x] 2. Create summary card component
  - Create `src/components/passport/SummaryCard.tsx`
  - Display "Digital Passport" title with Ionicons 'book' icon on the left
  - Display green "Active Season" badge on the same line (right-aligned) when promo is active per usePromoPeriod, with green dot (6px diameter) and text
  - Badge uses numberOfLines={1} and flexShrink to prevent wrapping
  - Two tiles in a 2-column grid: "Stamps Collected" (N of TOTAL collected, blue background) and "Passport Balance" (POINTS PTS, orange background)
  - Overall completion bar below tiles showing percentage (N / TOTAL * 100)
  - White card background, 16px radius, theme shadow, 16px padding
  - N = stamps.length, TOTAL = count of stamp slots (sites.length + festivals with stamps), POINTS = currentUser.points
  - _Requirements: 2.1, 2.2_

- [x] 3. Create shared segmented toggle component
  - Create `src/components/ui/SegmentedControl.tsx` as a reusable component
  - Props: options (array of { label: string, value: string }), selectedValue (string), onValueChange (callback), testID
  - Pill-shaped container with light gray background (theme token), 4px padding
  - Active option: primary blue background with white text, inactive: transparent with gray text
  - 32px height, labelMedium text style, 16px radius
  - OnPress calls onValueChange with selected value
  - _Requirements: 2.3_

- [x] 4. Create Identity Page card component
  - Create `src/components/passport/IdentityCard.tsx`
  - Navy blue header (colors.primary) with orange border bottom (colors.passportHeaderBorder), shield icon (Ionicons 'shield'), issuer line from PASSPORT_ISSUER_LINE constant on first line, PASSPORT_SUBTITLE constant on second line, and badge with PASSPORT_HEADER_LABEL constant on right
  - Cream tinted body (colors.passportCream) with plain tint background (no pattern)
  - Holder slot with generic person icon (Ionicons 'person-circle', 80px size, same for all users), no photo, no caption
  - Passport ID in platform monospace font (use 'monospace' as fontFamily on Android)
  - Field labels: "Passport ID", "Full Name", "Address", "Issued", "Valid Through" (English only)
  - Fields: Full Name, Address (from currentUser), Issued Date and Valid Through Date (from usePromoPeriod start and end dates, formatted as "01 JAN 2027")
  - Footer with PASSPORT_FOOTER constant and "PAGE 01" on right
  - Remove machine-readable code strip, "URI / TYPE: P - REGULAR" field, and "HOLDER PHOTO" caption
  - All text in English only, no Filipino or Tagalog
  - Match padding, spacing from HTML: header py-3 (12px), body p-4 (16px), footer py-1.5 (6px)
  - 16px card radius, navy border (colors.primary)
  - Use only theme tokens, no hex values in component
  - _Requirements: 2.4, 2.5_

- [ ] 5. Create Visas & Stamps card component and stamp slots
  - Create `src/components/passport/StampsCard.tsx` for the main card structure
  - Navy blue header (colors.primary) with PASSPORT_STAMPS_TITLE constant on left and "N STAMPED" pill badge (N = stamps.length) on right
  - Cream tinted body (colors.passportCream) with 2-column grid of stamp slots
  - Footer with PASSPORT_STAMPS_HEADER constant text and "PAGE 02" on right
  - Create `src/components/passport/StampSlot.tsx` for individual stamp slots
  - Props: site (Site | Event), stamp (Stamp | undefined), category (Category), siteId (string for deterministic rotation)
  - Collected slot: ink-stamp style with dashed border in category color, deterministic rotation derived from siteId (hash string to -2 to 2 degrees using character codes), category label, site name, municipality, date only (formatted as "JAN 14, 2027"), points, and green "Stamped" check (Ionicons 'checkmark-circle')
  - Uncollected slot: muted gray, dashed border, lock icon (Ionicons 'lock-closed'), site name, municipality, points in orange badge (colors.accent), and gray "Uncollected" with empty circle icon (Ionicons 'ellipse-outline')
  - Slots grouped by category in order: Dining, Staycation, Adventure, Heritage, Festival (bonus)
  - Festival slots: one slot per event offering a stamp (from useEvents filtered by festivalStamp field), show "+50 pts" and "Stamped" or "Uncollected" states only
  - All text in English only, no Filipino or Tagalog
  - Slot height: auto-height to fit content, width: 48% (2 columns with 4% gap)
  - Category colors from theme tokens: colors.categoryDining, colors.categoryStaycation, colors.categoryAdventure, colors.categoryHeritage (one fixed color, no alternating), colors.categoryFestival
  - 16px card radius, navy border (colors.primary)
  - Use only theme tokens, no hex values in component
  - _Requirements: 2.6, 2.7, 2.8_

- [ ] 6. Implement Passport screen with view toggle
  - Update `src/app/(tabs)/passport.tsx` to replace placeholder
  - Create local view state defaulting to 'identity' ('identity' | 'stamps'), changed only by the segmented toggle
  - Render ScreenContainer with scrollable={true}, edges={['left', 'right']}, withTabBarPadding={true}
  - Render SummaryCard at top (task 2)
  - Render SegmentedControl (task 3) below summary with options for "Identity Page" and "Visas & Stamps (N)" where N = stamps.length
  - Conditionally render IdentityCard (task 4) or StampsCard (task 5) based on view state
  - "View Rewards" Button below card opens `/rewards` with router.push
  - Note text below button: "Collect stamps by scanning the QR code at each partner site."
  - Loading state shows skeleton or spinner for stamps, sites, and events queries
  - Error state shows error message with retry button calling refetch on all queries
  - Empty state (0 stamps): show all slots as uncollected, count is 0, completion is 0%
  - _Requirements: 2.9, 2.10, 2.11_

- [ ] 7. Checkpoint - Verify, test, and document differences
  - Run `npx tsc --noEmit` and fix all TypeScript errors
  - Run `npx expo lint` and fix all linting errors
  - Test on physical Android phone: open Passport tab, toggle between views, tap "View Rewards"
  - Scan a site, press Dismiss from success modal, open the Passport tab, verify the new stamp appears, stamp count is updated, completion bar is correct, and header points match
  - Test with mock user (4 stamps, 450 pts) and verify counts match
  - Test Festival section shows at least one slot (from mockEvents with festivalStamp field)
  - Test empty state (temporarily modify mock data to have 0 stamps, then revert)
  - Test loading and error states
  - Verify no Filipino or Tagalog text appears on the screen (all text must be English only)
  - Verify Android back button works from all states
  - Verify bottom padding prevents tab bar from covering content when scrolled to bottom
  - Verify safe area insets are respected on all edges
  - Create `DIFFERENCES.md` in `.kiro/specs/passport/` listing every visual difference between the implemented screens and the design images in `design/screens/05-passport/`
  - Include differences in layout, spacing, colors, fonts, icons, and any omitted or simplified elements
  - Note each Filipino/Tagalog translation to English in DIFFERENCES.md (e.g., "Republika ng Pilipinas" → "Province of Cavite", "PASAPORTE" → "PASSPORT", etc.)

## Notes

- Passport screen is a single vertically scrolling page, not a page-turn booklet
- Identity Page and Visas & Stamps are two views of the same card, toggled with a segmented control
- The tabs layout provides the Header (name and points) and PromoChip, so the Passport screen does not render them
- Summary card always shows, regardless of which view is selected
- View state is plain local state defaulting to 'identity', changed only by the toggle
- Issued and valid-through dates come from usePromoPeriod (startDate and endDate)
- Holder photo slot shows the same generic person icon for every user (Ionicons 'person-circle'), not a user-uploaded photo
- Passport ID uses platform monospace font ('monospace' fontFamily on Android, no package installation)
- Festival category: one slot per event offering a stamp (derived from useEvents hook, filtered by festivalStamp field)
- At least one festival in mockEvents must have festivalStamp with pointsBonus: 50 and available: true (event-001 already has it)
- Festival stamps are bonus points only and do not replace the 4-category requirement
- Stamp slots are auto-height, grouped by category, displayed in a 2-column grid
- Collected stamps: deterministic rotation with transform (hash siteId string to -2 to 2 degrees using character codes, never random), dashed border, category color, date only formatted as "JAN 14, 2027"
- Uncollected slots: gray, dashed border, lock icon, no rotation
- Remove decorative elements not in docs/app.md: machine-readable code strip, "URI / TYPE: P - REGULAR", "HOLDER PHOTO" caption, faint background pattern
- "Active Season" badge only shows when promo is active per usePromoPeriod
- Use numberOfLines={1} and flexShrink on "Active Season" badge to prevent wrapping
- Omit faint background pattern and use plain tinted background (colors.passportCream)
- All UI text is English only (no Filipino or Tagalog)
- Passport constants (PASSPORT_ISSUER_LINE = "Province of Cavite", PASSPORT_SUBTITLE = "Official Passport", PASSPORT_HEADER_LABEL = "PASSPORT", PASSPORT_STAMPS_TITLE = "Official Stamps", PASSPORT_STAMPS_HEADER = "OFFICIAL STAMP REGISTER", PASSPORT_FOOTER = "Cavite Tourism Passport") stored in constants.ts, marked TBD, never hardcoded in components
- Identity field labels in English: "Passport ID", "Full Name", "Address", "Issued", "Valid Through"
- SegmentedControl is a shared component at src/components/ui/SegmentedControl.tsx (reusable)
- Total stamps count (TOTAL) = sites.length + festivals offering stamps (from useEvents)
- Completion percentage = collected stamps / total slots * 100
- No backend calls yet - all data from hooks wrapping api.ts mock functions
- Successful scan must update Passport screen through React Query cache invalidation (handled by useCollectStamp mutation)
- Use theme tokens only, no hardcoded colors, spacing, or fonts (add tokens in task 1: passportCream, passportHeaderBorder, categoryDining, categoryStaycation, categoryAdventure, categoryHeritage, categoryFestival)
- Heritage category uses one fixed color (no alternating), taken from design images
- All passport components must use theme tokens exclusively, no hex values
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
      "tasks": ["6"]
    },
    {
      "id": 3,
      "tasks": ["7"]
    }
  ]
}
```
