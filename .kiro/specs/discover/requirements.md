# Requirements: Discover

## 1. Overview

The Discover feature provides information about Cavite's festivals, events, and province highlights. It consists of a tab screen with two views (Events and About Cavite) and a dedicated Event Information screen. This is a UI-first implementation using mock data only.

## 2. Screens and Routes

### 2.1 Discover Tab Screen
- Route: `src/app/(tabs)/discover.tsx`
- Inside the tabs group, uses SegmentedControl to switch between Events and About Cavite views
- Uses ScreenContainer with `scrollable`, `withTabBarPadding`, and `edges=['left', 'right']`
- Header provided by `(tabs)/_layout.tsx`

### 2.2 Event Information Screen
- Route: `src/app/events/[id].tsx`
- Root-level stack route (no tab bar visible)
- Shows event details, date/time, location, description, and "Open in Maps" button
- Uses ScreenContainer with default edges

## 3. Events View

### 3.1 Layout
- Section heading: "Provincial Festivals & Events"
- Subtitle: "Explore vibrant cultural fiestas across Cavite municipalities"
- Chronological list of event cards (soonest first)
- Never show past events

### 3.2 Event Card
- Photo area (local placeholder with tinted background and icon, aspect ratio 16:9)
- Date badge (top-left corner of photo, formatted as "MMM DD" or "MMM DD-DD")
- Location with pin icon (municipality only)
- Event title (unique name including town, e.g., "Sample Town Festival - Amadeo")
- Short description (3 lines max with ellipsis)
- "Happening now" tag (green pill, only for events where current date is within start and end dates)
- Festival stamp indicator (chip with text derived from POINTS_PER_CATEGORY.Festival, e.g., "+50 pts", only if festivalStamp.available is true)
- Pressable, opens `/events/[id]` on tap

### 3.3 Status Computation
- Status computed client-side from startDate and endDate vs. current date
- "happening": today is between startDate and endDate (inclusive, day-level comparison)
- "upcoming": today is before startDate
- "past": today is after endDate (filter out, never show)
- Do NOT store status field in mock data

### 3.4 Sorting and Filtering
- Events sorted chronologically (soonest first)
- Past events filtered out
- No filter chips (out of scope)

## 4. About Cavite View

### 4.1 Layout (top to bottom)
1. Three text sections with headings and placeholder body text
2. Festival calendar list (4-5 items, sorted by date)
3. Map placeholder with legend
4. Expressway cards (3 cards)

### 4.2 Text Sections
- Heading: "Historical and Topographical Riches"
- Heading: "Culinary Delights"
- Heading: "Cultural Immersions"
- Each section has placeholder body text marked "Placeholder: awaiting Tourism Office content"

### 4.3 Festival Calendar List
- Heading: "Quick Festival Calendar"
- List of all events where category is 'Festival' (name, town, date badge)
- Sorted by startDate (soonest first)
- Exclude Cultural events and past events
- Tapping a festival opens `/events/[id]`
- Empty state if no festivals available

### 4.4 Map Placeholder
- Section heading: "Expressway & Province Map"
- CaviteMap component at 300px height
- Legend row below map: three items with icons and labels (Partner establishments, Heritage sites, Signature food/product)
- Shows "Selected: <name>" when an expressway card is tapped

### 4.5 Expressway Cards
- Three cards: CAVITEX, CAVITEX C5 Link, CALAX
- Each card: icon, name, location span (placeholder text), description (placeholder text)
- Tapping a card highlights it and shows label in map placeholder
- Only one card can be selected at a time

## 5. Event Information Screen

### 5.1 Layout (top to bottom)
1. Back arrow and "Event Information" title
2. Photo area (local placeholder, aspect ratio 16:9)
3. Chips row (Festival/Cultural, Happening now/Upcoming, +50 pts if festival stamp available)
4. Event title
5. Location (pin icon + municipality)
6. Stamp bonus card (conditional, only if festival stamp available)
7. Date & Time section
8. Venue Address section
9. Description section
10. Location & Directions section (map preview, "Open in Maps" button)

### 5.2 Status Label
- "Happening now" (green) if current date is within event dates
- "Upcoming" (primary blue) if current date is before event start date
- Never show past events

### 5.3 Festival Stamp Info
- Show stamp bonus card only if event.festivalStamp.available is true
- Text: "Happening Now: +[value] Bonus Pts" or "Upcoming: +[value] Bonus Pts" using POINTS_PER_CATEGORY.Festival
- Subtext: "Available during event dates at [municipality]"
- Background: light tint of success or primary color

### 5.4 Date & Time
- Section heading: "DATE & TIME"
- Calendar icon
- Date range formatted as "MMMM DD, YYYY" or "MMMM DD–DD, YYYY" for multi-day events
- Time not shown (omitted from design)

### 5.5 Venue Address
- Section heading: "VENUE ADDRESS"
- Location pin icon
- Full address

### 5.6 Location & Directions
- Section heading: "Location & Directions"
- Map preview: CaviteMap placeholder at 200px height with pin at event location
- "Navigate to [truncated address]" label
- "Open in Maps" button (primary style)
- Only show this section if the design image shows a map preview

### 5.7 "Open in Maps" Button
- Try `Linking.openURL(geo:...)` inside try/catch first
- If it throws, fallback to Google Maps URL `https://www.google.com/maps/search/?api=1&query=<lat>,<lng>`
- Do NOT use `canOpenURL`
- Format: `geo:${lat},${lng}?q=${encodeURIComponent(title)}`

### 5.8 No Contact Details
- No phone, email, or contact info (per docs/app.md)
- No scan button (scanning is center tab button only)
- No reminder button (reminders are push notifications)

## 6. Data Requirements

### 6.1 Event Type
- Remove `status` field (computed, not stored)
- Remove `imageUrl` field (use local placeholder)
- Rename `date` to `startDate`, `location` to `municipality`
- Store `startDate` and `endDate` as ISO string format in mock data
- Fields: id, title, startDate, endDate, municipality, address, latitude, longitude, description, category (Festival or Cultural), festivalStamp (optional)
- Event type changes require searching entire project for all Event type usage and updating references to renamed/removed fields
- Keep existing event ids that other specs reference

### 6.2 Expressway Type
- Fields: id, name, locationSpan (placeholder text), description (placeholder text)
- No coordinates in this spec

### 6.3 AboutCaviteContent Type
- Array of sections, each with heading and content (placeholder text)

### 6.4 Mock Data Content Rules
- All text is generic placeholder marked "Placeholder: awaiting Tourism Office content"
- Event names: "Sample Town Festival - [Town]" format with real Cavite town name (e.g., "Sample Town Festival - Amadeo")
- No invented descriptions, dishes, crafts, or event details
- Expressway locationSpan: "placeholder, to be confirmed"
- At least 6 events total
- At least 4 festivals in different towns
- At least 1 event "happening now" (relative dates)
- At least 1 festival with festivalStamp: { pointsBonus: 50, available: true }
- At least 1 event with endDate (multi-day)
- Keep existing event ids that other specs reference

## 7. Components

### 7.1 EventCard
- Props: event, onPress
- Computes status from dates using utility function
- Shows "Happening now" tag only if status is "happening"
- Shows "+50 pts" chip only if festivalStamp.available is true
- Truncates description to 3 lines with ellipsis
- Pressable with feedback

### 7.2 ExpresswayCard
- Props: expressway, selected, onPress
- Shows icon, name, locationSpan, description
- Selected state: primary border and subtle background tint
- Pressable with feedback

### 7.3 AboutCaviteContent
- Props: onEventPress
- Renders three text sections
- Renders festival calendar list (all festivals, excluding Cultural events and past events)
- Renders map placeholder with legend and expressway selection
- Renders expressway cards
- Manages local state for selected expressway
- Loading, error (with retry), and empty states

### 7.4 CaviteMap (Placeholder)
- Props: height, selectedLabel, plus future props (pins, expressways, selectedId, onPinPress, interactive)
- Placeholder implementation: rounded rectangle with map icon, "Map coming soon" text, and optional selectedLabel
- Future props defined but unused in this spec
- Border radius: radii.card
- Background: colors.surface
- Border: colors.border

## 8. Hooks and API

### 8.1 Hooks
- `useEvents()` - Already exists, returns Event[]
- `useEventById(id)` - New, returns Event | undefined
- `useExpressways()` - New, returns Expressway[]
- `useAboutCavite()` - New, returns AboutCaviteContent

### 8.2 API Functions
- `getEvents()` - Already exists
- `getEventById(id)` - New, find by ID in mockEvents, throw if not found
- `getExpressways()` - New, return mockExpressways
- `getAboutCavite()` - New, return mockAboutCavite
- All include artificial delay (300-800ms)

## 9. Navigation

### 9.1 From Events View
- Tap event card → `router.push(/events/${id})`

### 9.2 From About Cavite View
- Tap festival in calendar → `router.push(/events/${id})`

### 9.3 From Event Information Screen
- Back arrow → `router.back()`
- "Open in Maps" button → `Linking.openURL(...)` with geo: URI or Google Maps fallback

## 10. Theme Tokens

Use only tokens that exist in `src/theme/index.ts`:

### 10.1 Colors
- colors.background, colors.surface, colors.primary, colors.accent
- colors.text, colors.textSecondary
- colors.success, colors.error, colors.border

### 10.2 Spacing
- spacing.xs (4), spacing.sm (8), spacing.md (12), spacing.base (16)
- spacing.lg (20), spacing.xl (24), spacing.xxl (32)

### 10.3 Typography
- typography.headlineLarge, typography.headlineMedium, typography.titleMedium
- typography.bodyLarge, typography.bodyMedium, typography.bodySmall
- typography.labelLarge, typography.labelMedium, typography.labelSmall

### 10.4 Radii
- radii.card (16), radii.button (24), radii.chip (16)

### 10.5 Shadows
- shadows.card (for event cards, expressway cards)

## 11. Out of Scope

- Filter chips on Events view (All, Happening Now, Upcoming, Cultural)
- Feature chips on event cards (e.g., "Street Dancing", "Water Revelry")
- "View all" link in festival calendar
- Hero section with stats on About Cavite view
- Culinary food cards on About Cavite view
- Signature food/product pins on map
- Real MapLibre implementation (placeholder only in this spec)
- Photo carousel controls on Event Information screen
- Accessibility verification (handled in separate testing phase)

## 12. Validation Criteria

- At least one event shows "Happening now" tag (computed from relative dates)
- Festival stamp indicator text derived from POINTS_PER_CATEGORY.Festival
- Events view shows chronological list (past events filtered out)
- Events view has loading, error, and empty states
- Events rendered with map (not FlatList) inside scrollable ScreenContainer
- About Cavite view shows three text sections, festival calendar list (all festivals, no Cultural events, no past events), map, and expressways
- About Cavite view has loading, error, and empty states
- Selecting expressway shows "Selected: <name>" in map placeholder
- Event Information screen shows correct status label (computed from dates)
- Event Information screen has loading, error, event-not-found, and empty states
- "Open in Maps" button opens geo: URI or Google Maps fallback
- Map preview appears in Location & Directions section (per design image)
- Date & Time section shows date range only (no time)
- Tapping event card opens Event Information screen
- Tapping festival in About Cavite opens Event Information screen
- Back button on Event Information screen navigates back
- Tab bar visible on Discover tab, NOT visible on Event Information screen
- All Event type field changes applied (date to startDate, location to municipality, removed status and imageUrl)
- Existing event ids preserved for other specs
- No console errors
- Lint passes (npx expo lint)
- TypeScript compiles (npx tsc --noEmit)
- Theme tokens used throughout (no hardcoded values)
