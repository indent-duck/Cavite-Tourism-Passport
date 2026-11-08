# Explore Feature Requirements

## Overview

The Explore feature provides the primary discovery interface for the Cavite Tourism Passport app. Users browse partner sites, view curated itineraries, and access detailed information about destinations. All screens in this spec are UI-first with mock data.

## Visual References

All four reference screens are in `design/screens/02-explore/`:
- `explore_cavite_full_view_sites.png/.html` - Explore tab, Sites view
- `explore_itineraries_full_view.png/.html` - Explore tab, Itineraries view
- `site_information_full_view.png/.html` - Site Information screen
- `itinerary_detail.png/.html` - Itinerary Detail screen

## 1. Data Requirements

### 1.1 Site Data
Each site must have:
- `id` (string): Unique identifier
- `name` (string): Site name
- `category` (Dining | Staycation | Adventure | Heritage): Category
- `municipality` (string): Municipality
- `address` (string): Full address
- `description` (string): Placeholder text marked "Placeholder: awaiting Tourism Office content"
- `latitude` (number): GPS coordinate
- `longitude` (number): GPS coordinate
- `operatingHours` (string): Operating hours text (optional)

**Constraints:**
- At least 3 sites per category (Dining, Staycation, Adventure, Heritage)
- No phone numbers or emails
- Keep existing site ids and names (Passport, Scanner, and Rewards depend on them)

### 1.2 Itinerary Data
Each itinerary must have:
- `id` (string): Unique identifier
- `title` (string): Itinerary name (e.g., "Day Tour A: Heritage & Flavors")
- `type` ("Day Tour" | "Overnight Tour"): Tour type
- `description` (string): Short description (optional)
- `siteIds` (string[]): Ordered array of site IDs
- `duration` (string): Duration text (optional)

**Constraints:**
- Four itineraries total: Day Tour A, Day Tour B, Overnight Tour A, Overnight Tour B
- Day tours: 3-4 stops each
- Overnight tours: 4-5 stops each
- All site IDs must reference existing sites
- No travel times or distances

### 1.3 Stamp Data
Used to derive visited indicators and progress:
- Stamp category matches site category
- Stamp siteId references site.id
- Sample user has stamps from Dining, Staycation, and two Heritage sites

## 2. Explore Tab Requirements

**Route:** `src/app/(tabs)/explore.tsx`

### 2.1 Layout
The tabs layout already provides:
- Header with user name and points
- Promo chip
- Tab bar

The Explore screen renders:
- SegmentedControl with "Sites" and "Itineraries" options
- Local state for active view (default: Sites)
- ScreenContainer with scrollable, tab bar padding, and left/right edges

### 2.2 Sites View

#### 2.2.1 Search Bar
- Text input with search icon
- Clear button (X) when text is present
- Searches site name, address, and municipality (case-insensitive)
- Client-side filtering over useSites data
- Keyboard dismisses on scroll without covering list
- Taps on cards work while keyboard is open

#### 2.2.2 Category Chips
- Horizontal scroll strip of chips
- Options: All, Dining, Staycation, Adventure, Heritage (no Festival)
- Combined with search filter
- Default: All selected
- One chip active at a time

#### 2.2.3 List/Map Switch
- Button with icon and label
- Local state toggle
- Default: List view
- Map view shows CaviteMap placeholder at fixed height with "N sites on the map" label

#### 2.2.4 Site Cards (List View)
Each card shows:
- Local placeholder photo (tall aspect)
- Category tag (pill, top-left overlay)
- Name
- Address (full address, location icon)
- "+N pts" badge (derived from POINTS_PER_CATEGORY)
- Green "Visited" indicator if stamp exists for this site (derived from useStamps)
- Tapping opens `/sites/[id]`

**States:**
- Loading: ActivityIndicator centered
- Error: Icon, message, retry button
- Empty: "No sites match your search" with "Clear filters" button

### 2.3 Itineraries View

#### 2.3.1 Cards
Four cards shown (from useItineraries):
- Thumbnail image
- Tour type badge ("Day tour" or "Overnight")
- Stop count badge ("N stops")
- Title
- Description (short)
- Total points available ("+N pts", sum of POINTS_PER_CATEGORY for stops)
- Progress: "N of M stops stamped", progress bar, "X% complete"
  - Derived from useStamps and itinerary.siteIds
  - Stamped stops have green check, unstamped show number
- Tapping opens `/itineraries/[id]`

**States:**
- Loading: ActivityIndicator centered
- Error: Icon, message, retry button
- Empty: "No itineraries available"

## 3. Site Information Screen Requirements

**Route:** `src/app/sites/[id].tsx`

### 3.1 Layout
- Back arrow header with "Site Information" title
- ScreenContainer with scrollable, default top/left/right edges, plus bottom inset
- Covers tab bar (root-level stack route)

### 3.2 Content

#### 3.2.1 Photo
- Single local placeholder photo

#### 3.2.2 Header Info
- "Visited" indicator (green badge, derived from useStamps) if stamped
- Name (headline)
- Category pill (blue for Heritage, etc.)
- "+N pts" badge (orange, from POINTS_PER_CATEGORY)
- Address with location icon (full address)

#### 3.2.3 Description Section
- "About the [Category]" heading
- Description text (from site data)

#### 3.2.4 Operating Hours
- Clock icon, "Operating Hours" heading
- Hours text from site.operatingHours

#### 3.2.5 Location Map & Button
- CaviteMap placeholder (fixed height)
- Coordinates display
- "Open in Maps" button using shared handler

**States:**
- Loading: ActivityIndicator centered with back header
- Error: Icon, message, retry button
- Not found: Icon, "Site not found" message

**Exclusions:**
- No scan button
- No contact details
- No save/bookmark button
- No profile icons
- No photo gallery with multiple images
- No amenities grid

## 4. Itinerary Detail Screen Requirements

**Route:** `src/app/itineraries/[id].tsx`

### 4.1 Layout
- Back arrow header with "Itinerary Detail" title
- ScreenContainer with scrollable, default top/left/right edges, plus bottom inset
- Covers tab bar (root-level stack route)

### 4.2 Content

#### 4.2.1 Header
- Tour type chip ("Day tour" or "Overnight")
- Stop count chip ("N stops")
- Title (itinerary name, e.g., "Heritage & Flavors")
- Description (short, optional, from itinerary data)

#### 4.2.2 Progress Card
Shows:
- "N of M stops stamped" (derived from useStamps and itinerary.siteIds)
- "Points available: +X pts" (sum of POINTS_PER_CATEGORY for all stops)
- "Y pts collected" (sum for stamped stops)
- Progress bar
- "Z% complete" (percentage)
- "R pts remaining" (X - Y)

**All values derived from data, never hardcoded**
**No "Circuit Stamp" or completion bonus mentioned**

#### 4.2.3 Timeline
Vertical list of stops with dashed connector (drawn with react-native-svg Line using strokeDasharray):
- Stop number or green check circle
- Stop card for each site:
  - "Stop N" badge
  - Category label
  - Status tag: "Stamped • +N pts" (green) or "Not stamped • +N pts" (neutral, never "Pending")
  - Thumbnail
  - Site name
  - Two-line description
  - Operating hours with clock icon (from site data)
- All stamped stops use the same style (no faded cards)
- Tapping a stop opens `/sites/[id]`

**Timeline updates automatically via query invalidation when stamps change**

**No day grouping for overnight tours unless design shows it**

**States:**
- Loading: ActivityIndicator centered with back header
- Error: Icon, message, retry button
- Not found: Icon, "Itinerary not found" message

**Exclusions:**
- No map view or route map
- No travel times or distances

## 5. Shared Components

### 5.1 Search Bar Component
- TextInput with search icon
- Clear button when text present
- Optional filter icon
- Keyboard dismiss on scroll

### 5.2 Site Card Component
- Local placeholder photo, category tag, name, address, points badge
- Visited indicator (conditional)
- Pressable wrapper

### 5.3 Itinerary Card Component
- Local placeholder thumbnail, tour type/stop count badges
- Title, description, points
- Progress bar and percentage

### 5.4 Itinerary Timeline Stop Card
- Number or check circle
- Stop info with status tag
- Local placeholder thumbnail, name, description, hours
- Pressable wrapper

### 5.5 Itinerary Progress Card
- Stamps completed, points available/collected/remaining
- Progress bar and percentage

## 6. Data Flow

### 6.1 Hooks
- `useSites()`: Returns all sites
- `useSiteById(id)`: Returns single site or null
- `useItineraries()`: Returns all itineraries
- `useItineraryById(id)`: Returns single itinerary or null
- `useStamps()`: Returns user's stamps (to derive visited state and progress)

### 6.2 API Layer
All functions in `src/data/api.ts`:
- `getSites(category?)`: Returns sites, optionally filtered
- `getSiteById(id)`: Returns site or null
- `getItineraries()`: Returns all itineraries
- `getItineraryById(id)`: Returns itinerary or null
- `getStamps()`: Returns user stamps

Note: Search is client-side only, no API function needed.

All return mock data after artificial delay. Screens never import mock-data or api directly.

### 6.3 Shared Utilities
- `src/lib/open-maps.ts`: Exported `openInMaps(latitude, longitude, label?)` function
  - Tries `geo:` URI first, falls back to Google Maps URL
  - Used by Site Information and Event Information screens

## 7. Styling Rules

### 7.1 Theme Tokens Only
- All colors, spacing, radii, and typography from `src/theme`
- No hardcoded visual values
- Add token only if images need a color that has none

### 7.2 Screen Containers
- Explore tab: scrollable, tab bar padding, left and right edges
- Site Information and Itinerary Detail: scrollable, default top/left/right edges, plus bottom inset

### 7.3 Component Spacing
From design HTML:
- Card padding: `spacing.base` (16px)
- Gap between cards: `spacing.md` (12px) to `spacing.base` (16px)
- Search bar height: 40px
- Chip padding: horizontal `spacing.base`, vertical `spacing.xs`
- Progress bar height: 6px rounded

## 8. Behavior Rules

### 8.1 Search and Filtering
- Search filters by site name, address, and municipality
- Case-insensitive substring match
- Combined with category chip filter
- No network call per keystroke (client-side only)
- Keyboard dismisses on scroll
- Card taps work while keyboard is open

### 8.2 Navigation
- Site card tap -> `/sites/[id]`
- Itinerary card tap -> `/itineraries/[id]`
- Timeline stop tap -> `/sites/[id]`
- Android back button works on all screens

### 8.3 Progress Calculation
- Visited state: stamp exists where stamp.siteId === site.id
- Itinerary progress: count stamps where stamp.siteId is in itinerary.siteIds
- Points for stop: POINTS_PER_CATEGORY[site.category]

### 8.4 Empty States
- No search results: "No sites match your search" with "Clear filters" button
- No itineraries: "No itineraries available"
- Site not found: "Site not found" message
- Itinerary not found: "Itinerary not found" message

## 9. Content Rules

### 9.1 Text
- All text in English
- Descriptions use "Placeholder: awaiting Tourism Office content"
- No phone numbers or emails
- No travel times or distances
- No completion bonuses or "Circuit Stamp" labels

### 9.2 Images
- All images are local placeholders or placeholder URLs
- No remote image URLs

### 9.3 Omissions
List in DIFFERENCES.md at checkpoint:
- Photo gallery with multiple images, navigation arrows, thumbnails
- Amenities grid (Admission, Guided Tours, Dress Code, Parking)
- Closed days indicator in operating hours
- Prices, ratings, reviews
- Contact details
- Travel times, distances
- Completion bonuses or "Circuit Stamp" mentions
- Any decorative elements from design not in docs/app.md

## 10. Constraints

### 10.1 Technical
- Android only, portrait
- Expo Router file-based routing
- TypeScript strict mode, no `any`
- No backend, no real network calls
- No package installs beyond what's listed in tech.md
- No app.json changes

### 10.2 Map Placeholder
- Use only the existing CaviteMap placeholder component
- Do not import or use @maplibre/maplibre-react-native
- No tile source, map style, pins, or scroll handling
- State in DIFFERENCES.md that real map is a separate spec

### 10.3 Type Safety
- If any type or field changes, search the whole project for every use
- Update all uses before running `npx tsc --noEmit`

## 11. Acceptance Criteria

### 11.1 Functional
- [ ] Explore tab renders with Sites/Itineraries toggle
- [ ] Sites view: search, category chips, List/Map switch all work
- [ ] Site cards show correct data, visited indicators, and navigate to detail
- [ ] Itineraries view: 4 cards with correct progress derived from stamps
- [ ] Site Information screen: all sections render, "Open in Maps" works
- [ ] Itinerary Detail screen: timeline renders, progress card shows correct values
- [ ] All loading, error, and empty states render
- [ ] Android back button works on all screens

### 11.2 Data Layer
- [ ] Hooks call api.ts, not mock-data directly
- [ ] api.ts returns mock data after delay
- [ ] Types are correct and consistent

### 11.3 Visual
- [ ] All screens match design references (colors, spacing, typography)
- [ ] Theme tokens used throughout, no hardcoded values
- [ ] Screens use ScreenContainer correctly
- [ ] Safe areas respected

### 11.4 Code Quality
- [ ] No TypeScript errors (`npx tsc --noEmit` passes)
- [ ] No lint errors (`npx expo lint` passes)
- [ ] Route files use default exports, other modules use named exports
- [ ] Functional components with hooks
- [ ] Components in feature folders, shared components in ui/

### 11.5 Documentation
- [ ] DIFFERENCES.md lists all deviations from design images
- [ ] DIFFERENCES.md lists all omitted features from docs/app.md
- [ ] DIFFERENCES.md notes map is placeholder

## 12. Out of Scope

- Real map implementation with tiles, pins, and user interaction
- Remote images or photos
- Save/bookmark functionality
- Scan button on detail screens
- Contact details for sites or events
- Push notifications for events
- Offline support
- Performance optimization beyond React Query caching
