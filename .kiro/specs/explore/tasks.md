# Implementation Plan: Explore

## Overview

The Explore feature provides the primary discovery interface for browsing partner sites and curated itineraries. This plan implements four screens: the Explore tab with Sites/Itineraries toggle, Site Information with details and Open in Maps, Itinerary Detail with progress tracking and timeline, and all their supporting components. All data flows through hooks to api.ts, which returns mock data after a delay.

## Tasks

- [ ] 1. Data layer and shared utilities

  - [x] 1.1 Update types and mock data

    - Remove `imageUrl` from Site and Itinerary types in `src/data/types.ts`
    - Remove `stops` field from Itinerary type (derive count from siteIds.length)
    - Ensure Site has: id, name, category, municipality, address, description, latitude, longitude, operatingHours (optional)
    - Ensure Itinerary has: id, title, type, description (optional), siteIds, duration (optional)
    - Update `src/data/mock-data.ts` mockSites: keep existing ids/names, add operatingHours to all, set descriptions to "Placeholder: awaiting Tourism Office content", ensure at least 3 sites per category
    - Create or update mockItineraries: 4 itineraries (Day Tour A, Day Tour B, Overnight Tour A, Overnight Tour B), day tours with 3-4 stops, overnight with 4-5 stops, all siteIds reference existing sites
    - Update `design/screens/README.md` rows for 02-explore to point to `explore_cavite_full_view_sites`, `explore_itineraries_full_view`, `site_information_full_view`, and `itinerary_detail` files
    - *Requirements: 1.1, 1.2*

  - [x] 1.2 Add API functions and hooks

    - Verify `getSites(category?)` exists in `src/data/api.ts`, returns filtered or all sites
    - Verify `getSiteById(id)` exists, returns site or null
    - Verify `getItineraries()` exists, returns all itineraries
    - Verify `getItineraryById(id)` exists, returns itinerary or null
    - Create `src/hooks/useSites.ts`, `src/hooks/useSiteById.ts`, `src/hooks/useItineraries.ts`, `src/hooks/useItineraryById.ts` using React Query
    - *Requirements: 6.1, 6.2*

  - [x] 1.3 Extract openInMaps utility

    - Read `src/app/events/[id].tsx` to locate handleOpenMaps function
    - Create `src/lib/open-maps.ts` with exported `openInMaps(latitude, longitude, label?)` function
    - Implementation: try geo: URI first, fallback to Google Maps URL
    - Update `src/app/events/[id].tsx` to import and use shared function
    - *Requirements: 6.3*

- [ ] 2. Shared components

  - [x] 2.1 Search bar and list controls

    - Create `src/components/explore/SearchBar.tsx`: TextInput with search icon, clear button when value present, props value/onChangeText/placeholder/onClear
    - Create `src/components/explore/ListMapSwitch.tsx`: button with icon and label, toggles between "Map"/"List" and map/list icons
    - Use existing Chip component from `@/components/ui` for category chips (no new CategoryChips component)
    - *Requirements: 2.2.1, 5.1*

  - [x] 2.2 Site and itinerary cards

    - Create `src/components/explore/SiteCard.tsx`: local placeholder photo, category tag overlay, visited indicator (conditional green badge), name, address with icon, points badge, pressable wrapper
    - Create `src/components/explore/ItineraryCard.tsx`: local placeholder thumbnail, tour type/stop count badges, title, description, points, progress bar with "N of M stops stamped" and percentage, pressable wrapper
    - *Requirements: 2.2.4, 2.3.1, 5.2, 5.3*

  - [x] 2.3 Itinerary progress and timeline components

    - Create `src/components/explore/ItineraryProgressCard.tsx`: displays stampedCount/totalStops, pointsAvailable/collected/remaining, progress bar, percentage (no "Circuit Stamp" mention)
    - Create `src/components/explore/TimelineStopCard.tsx`: circle with number or green check, stop badge, category, status tag, local placeholder thumbnail, name, two-line description, operating hours with clock icon, pressable wrapper
    - Add dashed connector line using react-native-svg Line component with strokeDasharray (not CSS border, since single-edge dashed borders do not render on Android)
    - *Requirements: 4.2.2, 4.2.3, 5.4, 5.5*

  - [x] 2.4 Site information section components

    - Create `src/components/explore/SiteHeader.tsx`: visited badge (conditional), name, category pill, points badge, address with location icon
    - Create `src/components/explore/SiteDescription.tsx`: heading "About the [Category]", description text
    - Create `src/components/explore/OperatingHoursCard.tsx`: clock icon, "Operating Hours" heading, hours text from site.operatingHours
    - *Requirements: 3.2*

- [ ] 3. Explore tab screen

  - [~] 3.1 Replace explore placeholder

    - Read `src/app/(tabs)/explore.tsx`, replace placeholder content
    - Add local state: activeView ("Sites" | "Itineraries", default "Sites"), searchQuery (string, default ""), selectedCategory ("All" | Category, default "All"), isMapView (boolean, default false)
    - *Requirements: 2.1*

  - [ ] 3.2 Implement Sites view

    - Call useSites(), useStamps()
    - Filter sites client-side by searchQuery (name, address, municipality, case-insensitive) and selectedCategory
    - Derive isVisited for each site from stamps
    - Render SearchBar, category chips using existing Chip component, ListMapSwitch
    - Conditional: if isMapView render CaviteMap with "N sites on the map" label, else map filtered sites to SiteCard components
    - Add loading/error/empty states
    - Wire site card onPress to router.push(`/sites/${site.id}`)
    - *Requirements: 2.2, 7.2*

  - [ ] 3.3 Implement Itineraries view

    - Call useItineraries(), useStamps(), useSites()
    - Derive progress for each itinerary: stampedCount, totalStops (from siteIds.length), pointsAvailable, percentage
    - Map 4 itinerary cards to ItineraryCard components
    - Add loading/error/empty states
    - Wire itinerary card onPress to router.push(`/itineraries/${itinerary.id}`)
    - *Requirements: 2.3, 7.2*

  - [ ] 3.4 Add SegmentedControl and styles

    - Import SegmentedControl from `@/components/ui`, options ["Sites", "Itineraries"], bind to activeView
    - Use ScreenContainer with scrollable, tab bar padding, left and right edges
    - Apply theme tokens for all styles
    - Ensure keyboard dismisses on scroll and card taps work while keyboard is open
    - *Requirements: 2.1, 7.1, 7.2, 8.1*

- [ ] 4. Site Information screen

  - [ ] 4.1 Create or replace sites/[id] route

    - Check design image `site_information_full_view.png` for visible tab bar
    - If tab bar is visible, create route as `src/app/(tabs)/sites/[id].tsx`, else create as `src/app/sites/[id].tsx`
    - Use default export (required by Expo Router)
    - *Requirements: 3.1*

  - [ ] 4.2 Implement Site Information layout

    - Get id from useLocalSearchParams, call useSiteById(id) and useStamps()
    - Derive isVisited from stamps
    - Render ScreenContainer with scrollable, back arrow header titled "Site Information"
    - Render SiteHeader component with visited badge (conditional), name, category, points, address
    - Render single local placeholder photo (no gallery, no counter, no arrows, no thumbnails)
    - Render SiteDescription component
    - Render OperatingHoursCard component (hours from site.operatingHours only, no "closed days")
    - *Requirements: 3.2*

  - [ ] 4.3 Add location map and button

    - Render CaviteMap placeholder at fixed height
    - Display coordinates below map
    - Render "Open in Maps" button, import openInMaps from `@/lib/open-maps`, call with site.latitude, site.longitude, site.name
    - *Requirements: 3.2.5*

  - [ ] 4.4 Add states and styles

    - Add loading/error/not-found states with ActivityIndicator, icon, message, retry button
    - Use ScreenContainer with default top/left/right edges plus bottom inset
    - Apply theme tokens for all styles
    - *Requirements: 3.2, 7.2*

- [ ] 5. Itinerary Detail screen

  - [ ] 5.1 Create itineraries/[id] route

    - Check design image `itinerary_detail.png` for visible tab bar
    - If tab bar is visible, create route as `src/app/(tabs)/itineraries/[id].tsx`, else create as `src/app/itineraries/[id].tsx`
    - Use default export (required by Expo Router)
    - *Requirements: 4.1*

  - [ ] 5.2 Implement header and progress card

    - Get id from useLocalSearchParams, call useItineraryById(id), useStamps(), useSites()
    - Derive stop sites from itinerary.siteIds, calculate stampedCount, totalStops (siteIds.length), pointsAvailable, pointsCollected, percentage, pointsRemaining
    - Render back arrow header titled "Itinerary Detail"
    - Render tour type chip, stop count chip, title, description
    - Render ItineraryProgressCard with derived values
    - *Requirements: 4.2.1, 4.2.2*

  - [ ] 5.3 Implement timeline with stops

    - Map stop sites to TimelineStopCard components
    - Pass site, stopNumber, isStamped (from stamps), points (from POINTS_PER_CATEGORY), onPress
    - Draw dashed connector with react-native-svg Line using strokeDasharray (vertical line between stops)
    - Wire stop card onPress to router.push(`/sites/${site.id}`)
    - *Requirements: 4.2.3*

  - [ ] 5.4 Add states and styles

    - Add loading/error/not-found states with ActivityIndicator, icon, message, retry button
    - Use ScreenContainer with default top/left/right edges plus bottom inset
    - Apply theme tokens for all styles
    - *Requirements: 4.2, 7.2*

- [ ] 6. Checkpoint

  - [ ] 6.1 Type check and lint

    - Run `npx tsc --noEmit`, fix all TypeScript errors
    - Run `npx expo lint`, fix all lint errors
    - Verify strict mode compliance and naming conventions
    - *Requirements: 11.4*

  - [ ] 6.2 Test on physical Android phone

    - Test Explore tab: Sites view search, category chips, List/Map switch, site cards with visited indicators, navigation to Site Information
    - Test Explore tab: Itineraries view with 4 cards showing correct progress, navigation to Itinerary Detail
    - Test Site Information: all sections render, "Open in Maps" opens maps app, Android back button works
    - Test Itinerary Detail: header, progress card with correct derived values, timeline with stops, navigation to Site Information from stop cards
    - Test keyboard behavior: dismisses on scroll, card taps work while open
    - Test all states: loading, error, empty, not-found
    - *Requirements: 11.1*

  - [ ] 6.3 Write DIFFERENCES.md

    - Create `.kiro/specs/explore/DIFFERENCES.md`
    - List deviations from design images: no photo gallery (single photo only), no amenities grid, no closed days indicator, no filter icon in search bar
    - List omissions from docs/app.md: prices, ratings, reviews, contact details, travel times, distances, completion bonuses
    - Note map is placeholder (real map is separate spec)
    - Note all images are local placeholders (no remote URLs)
    - *Requirements: 11.5*

## Notes

- Map is a placeholder component in this spec; real map implementation is a separate later spec
- All progress values are derived from data, never hardcoded
- Search is client-side only; no searchSites API function
- Timeline dashed connector uses react-native-svg Line with strokeDasharray, not CSS borders
- All images are local placeholders; no imageUrl field in Site or Itinerary types
- Total stops derived from siteIds.length, not stored as a separate field
- No "Circuit Stamp" or completion bonus mentions in progress card
- Category chips reuse existing Chip component from @/components/ui
- Check design images for tab bar visibility before creating Site Information and Itinerary Detail routes

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1.1", "1.3"]
    },
    {
      "id": 1,
      "tasks": ["1.2"]
    },
    {
      "id": 2,
      "tasks": ["2.1", "2.2", "2.3", "2.4"]
    },
    {
      "id": 3,
      "tasks": ["3.1"]
    },
    {
      "id": 4,
      "tasks": ["3.2", "3.3"]
    },
    {
      "id": 5,
      "tasks": ["3.4", "4.1", "5.1"]
    },
    {
      "id": 6,
      "tasks": ["4.2", "5.2"]
    },
    {
      "id": 7,
      "tasks": ["4.3", "5.3"]
    },
    {
      "id": 8,
      "tasks": ["4.4", "5.4"]
    },
    {
      "id": 9,
      "tasks": ["6.1"]
    },
    {
      "id": 10,
      "tasks": ["6.2"]
    },
    {
      "id": 11,
      "tasks": ["6.3"]
    }
  ]
}
```
