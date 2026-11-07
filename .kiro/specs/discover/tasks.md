# Implementation Plan: Discover

## Overview

The Discover feature provides the Events calendar, About Cavite information, and Event detail screens. It consists of a tab screen with a segmented toggle (Events and About Cavite views) and a dedicated Event Information screen at the root level. All data comes from mock sources with generic placeholder text. Event status ("happening now" vs. "upcoming") is computed client-side from ISO date strings. The CaviteMap component is a placeholder in this spec; the real map implementation comes later.

## Tasks

- [x] 1. Data layer (types, mock data, utility, API, hooks)
  - [x] 1.1 Add types to src/data/types.ts
    - Event interface with startDate, endDate (ISO strings), municipality, address, coordinates, description, category ('Festival' | 'Cultural'), optional festivalStamp
    - Remove status and imageUrl fields, rename date to startDate, rename location to municipality
    - Search entire project for every use of Event type and renamed/removed fields (date, location, status, imageUrl)
    - Update Passport festival slots, Scanner, Account screens, all hooks, and all mock data to use new field names
    - Run npx tsc --noEmit to verify no breaking changes
    - Expressway interface with id, name, locationSpan, description
    - AboutCaviteSection and AboutCaviteContent interfaces
    - MapPin interface (stub for future map)
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 1.2 Update mockEvents in src/data/mock-data.ts
    - At least 6 events: 4 festivals, 2 cultural events
    - Each event gets unique name format "Sample Town Festival - [Town]" using the real Cavite town name (e.g., "Sample Town Festival - Amadeo")
    - All descriptions: "Placeholder: awaiting Tourism Office content"
    - startDate and endDate as ISO strings (toISOString())
    - Dates relative to now: one happening now (started yesterday, ends tomorrow), rest upcoming (30, 60, 90, 120, 150 days from now)
    - At least one festival with festivalStamp: { pointsBonus: 50, available: true }
    - At least one multi-day event (with endDate)
    - Keep existing event ids that other specs reference
    - Search project for Event type usage and update all references to removed/renamed fields (date to startDate, location to municipality, remove status and imageUrl)
    - Run npx tsc --noEmit to verify no TypeScript errors
    - _Requirements: 6.1, 6.4_
  - [x] 1.3 Add mockExpressways in src/data/mock-data.ts
    - Three expressways: CAVITEX, CAVITEX C5 Link, CALAX
    - All locationSpan: "placeholder, to be confirmed"
    - All descriptions: "Placeholder: awaiting Tourism Office content"
    - _Requirements: 6.2, 6.4_

  - [x] 1.4 Add mockAboutCavite in src/data/mock-data.ts
    - Three sections: "Historical and Topographical Riches", "Culinary Delights", "Cultural Immersions"
    - All content: "Placeholder: awaiting Tourism Office content"
    - _Requirements: 6.3, 6.4_

  - [x] 1.5 Create src/lib/event-utils.ts
    - getEventStatus(event): compute "happening" | "upcoming" | "past" from startDate and endDate (ISO strings), day-level comparison
    - formatEventDate(startDate, endDate?): format as "MMMM DD, YYYY" or "MMMM DD–DD, YYYY"
    - formatDateBadge(startDate, endDate?): format as "FEB 12" or "FEB 12-14"
    - Parse ISO strings with new Date()
    - _Requirements: 3.3, 5.2_

  - [x] 1.6 Add API functions to src/data/api.ts
    - getEventById(id): find in mockEvents, throw if not found, add artificial delay
    - getExpressways(): return mockExpressways with delay
    - getAboutCavite(): return mockAboutCavite with delay
    - _Requirements: 8.2_

  - [x] 1.7 Create hooks in src/hooks/
    - useEventById(id): React Query hook wrapping getEventById, query key ['events', id], staleTime 1 hour, enabled if id exists
    - useExpressways(): React Query hook wrapping getExpressways, query key ['expressways'], staleTime Infinity
    - useAboutCavite(): React Query hook wrapping getAboutCavite, query key ['about-cavite'], staleTime Infinity
    - _Requirements: 8.1_

- [x] 2. Components (CaviteMap placeholder, EventCard, ExpresswayCard, AboutCaviteContent)
  - [x] 2.1 Create src/components/map/CaviteMap.tsx
    - Placeholder: rounded rectangle (radii.card), surface background, border
    - Props: height, selectedLabel, plus future props (pins, expressways, selectedId, onPinPress, interactive) unused
    - Content: map icon (Ionicons "map-outline", 48px, textSecondary), "Map coming soon" text (bodyMedium), selectedLabel if provided (labelLarge, primary color)
    - Comment at top: "Placeholder. Replace the body with a MapLibre implementation later and keep the props."
    - _Requirements: 7.4_

  - [x] 2.2 Create src/components/discover/EventCard.tsx
    - Props: event, onPress
    - Card wrapper: white background, shadows.card, radii.card, pressable with feedback
    - Photo area: aspect ratio 16:9, surface background with calendar icon (local placeholder, not expo-image)
    - Date badge: absolute top-left (spacing.sm inset), surface background, bodySmall, formatDateBadge utility
    - Content padding: spacing.base
    - Location row: pin icon, municipality, bodySmall, textSecondary
    - Title: headlineMedium, spacing.sm bottom
    - Description: bodyMedium, textSecondary, 3 lines max with ellipsis, spacing.md bottom
    - Tags row: flex wrap, spacing.sm gaps
    - "Happening now" tag: success background, white text, labelMedium, radii.button, only if getEventStatus returns "happening"
    - Festival stamp chip: outlined, primary color, labelMedium, text derived from POINTS_PER_CATEGORY.Festival (e.g., "+50 pts"), only if festivalStamp.available
    - _Requirements: 3.2, 7.1_

  - [x] 2.3 Create src/components/discover/AboutCaviteContent.tsx
    - Props: onEventPress
    - Local state: selectedExpresswayId (string | null)
    - Vertical layout with spacing.xxl between major sections
    - Loading state: show ActivityIndicator while data loads
    - Error state: show error message with retry button using Button component
    - Empty state: show message if no data
    - Text sections: map over sections array, heading (headlineMedium, spacing.sm bottom), content (bodyMedium, textSecondary)
    - Festival calendar (spacing.xxl top): heading "Quick Festival Calendar" (headlineMedium, spacing.md bottom), list all events where category is 'Festival', sorted by startDate ascending, exclude 'Cultural' events and past events, each row pressable (name, municipality, date badge right-aligned)
    - Empty state for festival calendar if no festivals
    - Map section (spacing.xxl top): heading "Expressway & Province Map" (headlineMedium, spacing.md bottom), CaviteMap at 300px height with selectedLabel if expressway selected, legend row below (spacing.md top) with three items (icons + labels: Partner establishments, Heritage sites, Signature food/product)
    - Expressway cards: map over expressways, ExpresswayCard with selected state, spacing.md between, onPress updates selectedExpresswayId
    - Pass selectedLabel to CaviteMap: `Selected: ${expressway.name}`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 7.3_

- [x] 3. Discover tab screen
  - [x] 3.1 Replace src/app/(tabs)/discover.tsx placeholder
    - ScreenContainer with scrollable, withTabBarPadding, edges=['left', 'right']
    - Local state: selectedView ('events' | 'about'), default 'events'
    - SegmentedControl at top: options "Events" and "About Cavite", onValueChange updates selectedView
    - Conditional render: Events view or About Cavite view
    - Events view: section heading "Provincial Festivals & Events" (headlineLarge), subtitle "Explore vibrant cultural fiestas across Cavite municipalities" (bodyMedium, textSecondary), render events with map (not FlatList)
    - Loading state: show ActivityIndicator while events load
    - Error state: show error message with retry button using Button component
    - Empty state: show "No events at this time" message if no events
    - Filter events: exclude past (getEventStatus !== 'past'), sort by startDate ascending
    - EventCard onPress: router.push(`/events/${event.id}`)
    - About Cavite view: AboutCaviteContent with onEventPress: router.push(`/events/${id}`)
    - Use useEvents hook for event data
    - _Requirements: 2.1, 3.1, 3.2, 3.3, 3.4, 4.1-4.5, 9.1, 9.2_

- [x] 4. Event Information screen
  - [x] 4.1 Replace src/app/events/[id].tsx placeholder
    - ScreenContainer with scrollable, showHeader, headerTitle "Event Information", default edges
    - Use useLocalSearchParams to get id, useEventById(id) for data
    - Loading state: show ActivityIndicator while event loads
    - Error state: show error message with retry button using Button component
    - Event not found state: show "Event not found" message with back button
    - Photo area: aspect ratio 16:9, surface background with calendar icon (local placeholder)
    - Chips row: category chip ("Festival" or "Cultural"), status chip ("Happening now" green or "Upcoming" primary), festival stamp chip with text derived from POINTS_PER_CATEGORY.Festival (e.g., "+50 pts") and "Festival Stamp Available" if festivalStamp.available
    - Title: headlineLarge, spacing.md bottom
    - Location: pin icon + municipality, bodyMedium, textSecondary
    - Stamp bonus card (conditional on festivalStamp.available): light success or primary tint, icon, "Happening Now: +[value] Bonus Pts" or "Upcoming: +[value] Bonus Pts" using POINTS_PER_CATEGORY.Festival, subtext "Available during event dates at [municipality]"
    - Date & Time section: heading "DATE & TIME" (labelSmall, uppercase), calendar icon, formatEventDate(startDate, endDate) only (no time shown)
    - Venue Address section: heading "VENUE ADDRESS", location pin icon, full address
    - Description section: heading "About the Festival", bodyMedium
    - Location & Directions section: heading "Location & Directions", CaviteMap at 200px height, "Navigate to [truncated address]", "Open in Maps" button (primary style, onPress calls handleOpenMaps)
    - handleOpenMaps: try Linking.openURL with geo: URI inside try/catch, fallback to Google Maps URL if throws
    - Compute status with getEventStatus(event)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 9.3_

- [ ] 5. Checkpoint (testing, validation, DIFFERENCES.md)
  - [x] 5.1 Run lint and TypeScript
    - npx expo lint (must pass)
    - npx tsc --noEmit (must pass)
    - Fix any errors before proceeding
    - _Requirements: 12_

  - [ ] 5.2 Test on physical Android phone
    - Open Discover tab, verify segmented control switches views
    - Events view: verify at least one "Happening now" tag, sorted chronologically, past events hidden
    - Tap event card, verify Event Information screen opens (no tab bar visible)
    - Event Information: verify correct status label, festival stamp info conditional, "Open in Maps" works
    - Back button navigates to Discover
    - About Cavite view: verify three sections, festival calendar list sorted, expressway selection updates map label
    - Tap festival in calendar, verify Event Information opens
    - Verify tab bar visible on Discover tab, not on Event Information screen
    - Check console for errors
    - _Requirements: 12_

  - [ ] 5.3 Write .kiro/specs/discover/DIFFERENCES.md
    - Compare finished screens with design images in design/screens/08-discover
    - Document omitted elements: filter chips, feature chips, hero section, culinary cards, photo carousel, "View all" link, event time (date range only shown)
    - Document content changes: all placeholder text, expressway location spans, generic event titles with town names
    - Document behavioral changes: status computed from dates, festival calendar sorted by date and shows all festivals (not limited to 4-5), map placeholder
    - Confirm correct implementations: no contact details, no scan/reminder buttons, festival stamp uses POINTS_PER_CATEGORY, Event Information is root-level route
    - _Requirements: 12_

## Notes

- Before writing any component, read src/theme/index.ts and use only token names that exist (spacing, typography, radii, shadows, colors)
- Event status is computed client-side from ISO date strings, never stored in mock data
- All mock text is generic placeholder marked "Placeholder: awaiting Tourism Office content"
- Event names use format "Sample Town Festival - [Town]" with real Cavite town name (e.g., "Sample Town Festival - Amadeo")
- Expressway locationSpan: "placeholder, to be confirmed"
- No remote image URLs; use local placeholder (tinted View with icon)
- "Open in Maps" uses try/catch with Linking.openURL, no canOpenURL check
- Event Information screen is root-level (no tab bar), per design image
- Map preview shown in Location & Directions section per design image
- CaviteMap is a placeholder in this spec; real MapLibre implementation is a separate later spec
- ScreenContainer for Discover tab uses scrollable, withTabBarPadding, edges=['left', 'right']
- ScreenContainer for Event Information uses scrollable, showHeader, default edges
- Use only theme tokens from src/theme/index.ts (colors, spacing, typography, radii, shadows)
- Filter chips, feature chips, "View all" link removed from spec
- Event time removed from Date & Time section (date range only); omission noted in DIFFERENCES.md
- Festival calendar shows all festivals (not limited to 4-5), excluding Cultural events and past events
- Event type changes (date to startDate, location to municipality, removed status and imageUrl) require updating all existing code references
- Keep existing event ids that other specs reference
- DIFFERENCES.md written after code exists, comparing finished screens with design images

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1.1"]
    },
    {
      "id": 1,
      "tasks": ["1.2", "1.3", "1.4", "1.5"]
    },
    {
      "id": 2,
      "tasks": ["1.6"]
    },
    {
      "id": 3,
      "tasks": ["1.7", "2.1", "2.2", "2.3"]
    },
    {
      "id": 4,
      "tasks": ["2.4"]
    },
    {
      "id": 5,
      "tasks": ["3.1", "4.1"]
    },
    {
      "id": 6,
      "tasks": ["5.1"]
    },
    {
      "id": 7,
      "tasks": ["5.2"]
    },
    {
      "id": 8,
      "tasks": ["5.3"]
    }
  ]
}
```
