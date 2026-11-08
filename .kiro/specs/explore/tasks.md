# Explore Feature - Implementation Tasks

## Task List

- [ ] 1. Data layer: types, mock data, API functions, hooks, and shared utilities
- [ ] 2. Components: reusable cards, search bar, progress displays, and timeline elements
- [ ] 3. Explore tab: segmented toggle, Sites view with search/filters/cards, Itineraries view
- [ ] 4. Site Information screen: header, gallery, sections, map, and Open in Maps button
- [ ] 5. Itinerary Detail screen: header, progress card, timeline with stops
- [ ] 6. Checkpoint: type check, lint, test on phone, write DIFFERENCES.md

---

## 1. Data Layer

_Requirements: 1.1, 1.2, 1.3, 6.1, 6.2, 6.3_

Update types, mock data, API functions, hooks, and create the shared open-maps utility.

### 1.1 Review and update Site type
- Read `src/data/types.ts` Site interface
- Confirm all required fields exist: id, name, category, municipality, address, description, latitude, longitude, operatingHours (optional), imageUrl

### 1.2 Review and update Itinerary type
- Read `src/data/types.ts` Itinerary interface
- Confirm required fields: id, title, type, description (optional), siteIds, stops, imageUrl, duration (optional)

### 1.3 Update mock sites
- Read `src/data/mock-data.ts` mockSites array
- Keep existing site ids and names (Passport, Scanner, Rewards depend on them)
- Ensure at least 3 sites per category (Dining, Staycation, Adventure, Heritage)
- Add operatingHours text to all sites
- Set descriptions to "Placeholder: awaiting Tourism Office content" format
- Remove any phone numbers or emails
- Verify all have latitude, longitude, address, municipality

### 1.4 Create or update mock itineraries
- Read `src/data/mock-data.ts` mockItineraries array
- Create 4 itineraries if not present: Day Tour A, Day Tour B, Overnight Tour A, Overnight Tour B
- Day tours: 3-4 stops each
- Overnight tours: 4-5 stops each
- Each itinerary has ordered siteIds array referencing existing sites
- Add optional description text
- Set stops = siteIds.length

### 1.5 Add API functions (if missing)
- Read `src/data/api.ts`
- Add `getSites(category?: Category)` if missing
- Add `getSiteById(id: string)` if missing
- Add `searchSites(query: string)` if missing
- Add `getItineraries()` if missing
- Add `getItineraryById(id: string)` if missing
- Ensure `getStamps()` exists
- All functions return mock data after randomDelay()

### 1.6 Create or update useSites hook
- Create `src/hooks/useSites.ts` if missing
- Use React Query to call `getSites()` from api.ts
- Return `{ data, isLoading, error, refetch }`
- Export from `src/hooks/index.ts`

### 1.7 Create useSiteById hook
- Create `src/hooks/useSiteById.ts`
- Accept `id: string` parameter
- Use React Query to call `getSiteById(id)`
- Return `{ data: Site | null, isLoading, error, refetch }`
- Export from `src/hooks/index.ts`

### 1.8 Create useItineraries hook
- Create `src/hooks/useItineraries.ts`
- Use React Query to call `getItineraries()`
- Return `{ data, isLoading, error, refetch }`
- Export from `src/hooks/index.ts`

### 1.9 Create useItineraryById hook
- Create `src/hooks/useItineraryById.ts`
- Accept `id: string` parameter
- Use React Query to call `getItineraryById(id)`
- Return `{ data: Itinerary | null, isLoading, error, refetch }`
- Export from `src/hooks/index.ts`

### 1.10 Extract or create openInMaps utility
- Read `src/app/events/[id].tsx` to find the handleOpenMaps function
- Create `src/lib/open-maps.ts` if handleOpenMaps is inline in events/[id].tsx
- Export `openInMaps(latitude: number, longitude: number, label?: string)` function
- Implementation: try geo: URI first, fallback to Google Maps URL
- Update `src/app/events/[id].tsx` to import and use the shared function

---

## 2. Components

_Requirements: 2.2.1, 2.2.4, 2.3.1, 3.2, 4.2, 5.1, 5.2, 5.3, 5.4, 5.5_

Build reusable components for search, site cards, itinerary cards, progress displays, and timeline elements.

### 2.1 Create SearchBar component
- Create `src/components/explore/SearchBar.tsx`
- Props: value, onChangeText, placeholder, onClear, showFilter (optional), onFilterPress (optional)
- TextInput with search icon (Ionicons "search")
- Clear button (X icon) when value is not empty
- Optional filter icon on right
- Height 40px, rounded, border, padding
- Use theme tokens

### 2.2 Create CategoryChips component
- Create `src/components/explore/CategoryChips.tsx`
- Props: options (string[]), selected, onSelect
- Horizontal ScrollView with chips
- Each chip: pressable, rounded pill, padding, selected state (primary bg) vs unselected (white bg with border)
- Use existing Chip component if possible, or create minimal custom

### 2.3 Create ListMapSwitch component
- Create `src/components/explore/ListMapSwitch.tsx`
- Props: isMapView, onToggle
- Button with icon and label
- Icon changes: "map" when showing list, "list" when showing map
- Label changes: "Map" when showing list, "List" when showing map
- Use theme tokens

### 2.4 Create SiteCard component
- Create `src/components/explore/SiteCard.tsx`
- Props: site (Site), isVisited (boolean), onPress
- Layout: photo (tall aspect), category tag overlay (top-left), visited indicator overlay (bottom-left, green badge if isVisited), name, address with location icon, points badge
- Pressable wrapper
- Use theme tokens

### 2.5 Create ItineraryCard component
- Create `src/components/explore/ItineraryCard.tsx`
- Props: itinerary (Itinerary), stampedCount, totalStops, pointsAvailable, percentage, onPress
- Layout: thumbnail, tour type badge, stop count badge, title, description, points, progress bar, "N of M stops stamped", "X% complete"
- Pressable wrapper
- Use theme tokens

### 2.6 Create ItineraryProgressCard component
- Create `src/components/explore/ItineraryProgressCard.tsx`
- Props: stampedCount, totalStops, pointsAvailable, pointsCollected, percentage, pointsRemaining
- Layout: "N of M stops stamped", "Points available: +X pts", "Y pts collected", progress bar, "Z% complete", "R pts remaining"
- Use Card component if suitable, or custom styled View
- Use theme tokens

### 2.7 Create TimelineStopCard component
- Create `src/components/explore/TimelineStopCard.tsx`
- Props: site (Site), stopNumber, isStamped, points, onPress
- Layout: circle with number or green check, stop badge, category label, status tag (green for stamped, neutral for not stamped), thumbnail, name, two-line description, operating hours with clock icon
- Pressable wrapper
- Use theme tokens

### 2.8 Create site information section components
- Create `src/components/explore/SiteHeader.tsx`: visited badge, name, category pill, points badge, address
- Create `src/components/explore/SiteDescription.tsx`: heading, description text
- Create `src/components/explore/OperatingHoursCard.tsx`: clock icon, hours text, closed days (optional)
- All use theme tokens

---

## 3. Explore Tab

_Requirements: 2.1, 2.2, 2.3, 7.2_

Implement the Explore tab screen with Sites and Itineraries views.

### 3.1 Read existing explore placeholder
- Read `src/app/(tabs)/explore.tsx`
- Identify what needs replacement

### 3.2 Add local state for Explore tab
- Active view: "Sites" | "Itineraries" (default: "Sites")
- Search query: string (default: "")
- Selected category: "All" | Category (default: "All")
- Is map view: boolean (default: false)

### 3.3 Add data fetching for Sites view
- Call useSites(), useStamps()
- Derive filtered sites based on search query and selected category
- Derive isVisited for each site from stamps

### 3.4 Add data fetching for Itineraries view
- Call useItineraries(), useStamps(), useSites()
- Derive progress (stampedCount, percentage, pointsAvailable) for each itinerary

### 3.5 Render SegmentedControl
- Import from `@/components/ui/SegmentedControl`
- Options: ["Sites", "Itineraries"]
- Bind to active view state

### 3.6 Render Sites view
- SearchBar with search query state
- CategoryChips with options ["All", "Dining", "Staycation", "Adventure", "Heritage"]
- ListMapSwitch with isMapView state
- Conditional: if isMapView, render CaviteMap with selectedLabel "N sites on the map", else render site cards
- Site cards: map filtered sites to SiteCard components
- Loading state: ActivityIndicator
- Error state: icon, message, retry button
- Empty state: "No sites match your search" with "Clear filters" button

### 3.7 Render Itineraries view
- Map 4 itinerary cards to ItineraryCard components
- Pass derived progress values
- Loading state: ActivityIndicator
- Error state: icon, message, retry button
- Empty state: "No itineraries available"

### 3.8 Wire up navigation
- Site card onPress: router.push(`/sites/${site.id}`)
- Itinerary card onPress: router.push(`/itineraries/${itinerary.id}`)

### 3.9 Style Explore tab
- Use ScreenContainer with scrollable, tab bar padding, left and right edges
- Use theme tokens for all styles
- Ensure keyboard dismisses on scroll
- Ensure card taps work while keyboard is open

---

## 4. Site Information Screen

_Requirements: 3.1, 3.2, 7.2_

Implement the Site Information screen with all sections and the Open in Maps button.

### 4.1 Read existing sites/[id] placeholder
- Read `src/app/sites/[id].tsx` if it exists
- Identify what needs replacement

### 4.2 Add route param and data fetching
- Use `useLocalSearchParams<{ id: string }>()`
- Call useSiteById(id), useStamps()
- Derive isVisited from stamps

### 4.3 Render header
- Back arrow with "Site Information" title (ScreenContainer showHeader prop)
- SiteHeader component: visited badge (conditional), name, category pill, points badge, address with location icon

### 4.4 Render photo gallery (if design shows multiple)
- Single placeholder photo or photo gallery with counter, arrows, thumbnails
- Use local placeholder images

### 4.5 Render description section
- SiteDescription component
- Heading: "About the [Category]"
- Description text from site.description

### 4.6 Render operating hours
- OperatingHoursCard component
- Clock icon, "Operating Hours" heading
- Hours text from site.operatingHours
- Closed days if applicable (check design image)

### 4.7 Render amenities grid (optional)
- Only if design image shows it
- 2x2 grid of info cards: Admission, Guided Tours, Dress Code, Parking
- Generic placeholder content

### 4.8 Render location map and button
- Only if design image shows map preview
- CaviteMap placeholder with fixed height
- Coordinates display (if shown)
- "Open in Maps" button: import openInMaps from `@/lib/open-maps`, call on press with site.latitude, site.longitude, site.name

### 4.9 Add states
- Loading: ActivityIndicator centered with back header
- Error: icon, message, retry button
- Not found: icon, "Site not found" message

### 4.10 Style Site Information screen
- Use ScreenContainer with scrollable, default top/left/right edges, plus bottom inset
- Use theme tokens for all styles
- Ensure sections have proper spacing

---

## 5. Itinerary Detail Screen

_Requirements: 4.1, 4.2, 7.2_

Implement the Itinerary Detail screen with header, progress card, and timeline.

### 5.1 Create itineraries/[id] route file
- Create `src/app/itineraries/[id].tsx`
- Use default export (required by Expo Router)

### 5.2 Add route param and data fetching
- Use `useLocalSearchParams<{ id: string }>()`
- Call useItineraryById(id), useStamps(), useSites()
- Derive stop sites from itinerary.siteIds
- Derive progress values: stampedCount, pointsAvailable, pointsCollected, percentage, pointsRemaining

### 5.3 Render header
- Back arrow with "Itinerary Detail" title (ScreenContainer showHeader prop)
- Tour type chip ("Day tour" or "Overnight")
- Stop count chip ("N stops")
- Title (itinerary.title)
- Description (itinerary.description, optional)

### 5.4 Render progress card
- ItineraryProgressCard component
- Pass: stampedCount, totalStops, pointsAvailable, pointsCollected, percentage, pointsRemaining
- All values derived from data, never hardcoded

### 5.5 Render timeline
- Vertical list with dashed connector (border-left dashed on container)
- Map stop sites to TimelineStopCard components
- Pass: site, stopNumber, isStamped (derived from stamps), points (from POINTS_PER_CATEGORY), onPress
- Wire onPress to router.push(`/sites/${site.id}`)

### 5.6 Add states
- Loading: ActivityIndicator centered with back header
- Error: icon, message, retry button
- Not found: icon, "Itinerary not found" message

### 5.7 Style Itinerary Detail screen
- Use ScreenContainer with scrollable, default top/left/right edges, plus bottom inset
- Timeline: dashed connector between stops
- Use theme tokens for all styles

---

## 6. Checkpoint

_Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

Verify implementation, test on physical device, and document differences.

### 6.1 Run type check
- Execute `npx tsc --noEmit`
- Fix all TypeScript errors
- Ensure strict mode compliance

### 6.2 Run linter
- Execute `npx expo lint`
- Fix all lint errors
- Follow naming conventions

### 6.3 Test Explore tab on phone
- Navigate to Explore tab
- Test Sites view: search, category chips, List/Map switch
- Verify site cards show correct data and visited indicators
- Tap site card, verify navigation to Site Information
- Return to Explore, switch to Itineraries view
- Verify 4 itinerary cards show correct progress
- Tap itinerary card, verify navigation to Itinerary Detail

### 6.4 Test Site Information screen on phone
- Verify all sections render correctly
- Verify "Open in Maps" button opens maps app
- Verify Android back button works
- Test loading, error, and not-found states (manually trigger if needed)

### 6.5 Test Itinerary Detail screen on phone
- Verify header, progress card, and timeline render correctly
- Verify timeline progress values are derived correctly
- Tap stop card, verify navigation to Site Information
- Verify Android back button works
- Test loading, error, and not-found states

### 6.6 Test keyboard behavior
- Open Sites view, tap search bar
- Type search query, verify keyboard appears
- Scroll list, verify keyboard dismisses
- Verify card taps work while keyboard is open

### 6.7 Test all states
- Verify loading states show ActivityIndicator
- Verify error states show icon, message, retry button
- Verify empty states show appropriate message
- Search for non-existent site, verify empty state
- Navigate to non-existent site/itinerary ID, verify not-found state

### 6.8 Write DIFFERENCES.md
- Create `.kiro/specs/explore/DIFFERENCES.md`
- List all deviations between finished screens and design images
- List all omitted features from docs/app.md (operating hours if not in data, prices, ratings, reviews, contact details, travel times, distances, completion bonuses, decorative elements)
- Note that map is a placeholder (real map is a separate spec)
- Format as bulleted list with clear headings

---

## Notes

- The map is a placeholder component in this spec. Real map implementation (with tiles, pins, and interaction) is a separate later spec.
- All progress values (stamps collected, points, percentages) are derived from data, never hardcoded.
- Stamps automatically update screens through React Query invalidation when a new stamp is collected (handled in Scanner spec).
- The design images show specific site counts and progress values. The UI should adapt to the actual data from mock-data.ts.
- No Festival category in the Site category filter or in itinerary calculations for this spec.
- Type or field changes require searching the whole project for every use and updating before running tsc.

---

## Dependency Graph

```json
{
  "tasks": [
    {
      "id": "1",
      "dependencies": []
    },
    {
      "id": "2",
      "dependencies": ["1"]
    },
    {
      "id": "3",
      "dependencies": ["1", "2"]
    },
    {
      "id": "4",
      "dependencies": ["1", "2"]
    },
    {
      "id": "5",
      "dependencies": ["1", "2"]
    },
    {
      "id": "6",
      "dependencies": ["3", "4", "5"]
    }
  ]
}
```
