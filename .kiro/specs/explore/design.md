# Explore Feature Design

## Architecture

The Explore feature follows a layered architecture with clear separation of concerns:

```
Screens (routes)
    ↓
  Hooks (data fetching, caching)
    ↓
  API Layer (mock data, delay simulation)
    ↓
  Mock Data Store
```

**Data flow is unidirectional:** Screens → Hooks → API → Mock Data. Screens never directly import api.ts or mock-data.ts.

## Component Hierarchy

### Explore Tab (`src/app/(tabs)/explore.tsx`)
```
<ScreenContainer>
  <SegmentedControl> (Sites | Itineraries)
  
  {/* Sites View */}
  <SearchBar />
  <CategoryChips />
  <ListMapSwitch />
  {isListView ? (
    <SiteCardList>
      <SiteCard /> (multiple)
    </SiteCardList>
  ) : (
    <CaviteMap selectedLabel="N sites on the map" />
  )}
  
  {/* Itineraries View */}
  <ItineraryCardList>
    <ItineraryCard /> (4 cards)
  </ItineraryCardList>
</ScreenContainer>
```

### Site Information (`src/app/sites/[id].tsx`)
```
<ScreenContainer>
  <PhotoGallery /> (if multiple photos)
  <HeaderInfo>
    <VisitedBadge /> (conditional)
    <CategoryPill />
    <PointsBadge />
  </HeaderInfo>
  <AddressRow />
  <DescriptionSection />
  <OperatingHoursCard />
  <AmenitiesGrid /> (optional)
  <LocationMapCard>
    <CaviteMap />
    <OpenInMapsButton />
  </LocationMapCard>
</ScreenContainer>
```

### Itinerary Detail (`src/app/itineraries/[id].tsx`)
```
<ScreenContainer>
  <HeaderChips>
    <TourTypeChip />
    <StopCountChip />
  </HeaderChips>
  <Title />
  <Description />
  <ProgressCard>
    <StampsProgress />
    <PointsSummary />
    <ProgressBar />
    <PercentageComplete />
  </ProgressCard>
  <Timeline>
    {stops.map(stop => (
      <TimelineStopCard>
        <StopNumber | CheckCircle />
        <StopInfo />
        <StopThumbnail />
        <OperatingHours />
      </TimelineStopCard>
    ))}
  </Timeline>
</ScreenContainer>
```

## Component Design

### 1. Shared UI Components

#### SearchBar
**Purpose:** Text input with search and clear functionality  
**Props:**
- `value: string`
- `onChangeText: (text: string) => void`
- `placeholder?: string`
- `onClear?: () => void`
- `showFilter?: boolean`
- `onFilterPress?: () => void`

**Behavior:**
- Shows clear button (X) when text is present
- Optional filter icon on right
- Dismisses keyboard on scroll
- Does not prevent card taps when open

#### SiteCard
**Purpose:** Display site summary with visited indicator  
**Props:**
- `site: Site`
- `isVisited: boolean`
- `onPress: () => void`

**Layout:**
- Photo (tall aspect, fills width)
- Category tag overlay (top-left)
- Visited indicator overlay (bottom-left, conditional)
- Name (below photo)
- Address with location icon
- Points badge (top-right or inline)

#### ItineraryCard
**Purpose:** Display itinerary summary with progress  
**Props:**
- `itinerary: Itinerary`
- `stampedCount: number`
- `totalStops: number`
- `pointsAvailable: number`
- `onPress: () => void`

**Layout:**
- Thumbnail
- Tour type and stop count badges (overlays)
- Title and description
- Points available
- Progress: "N of M stops stamped", bar, percentage

#### TimelineStopCard
**Purpose:** Display stop in itinerary timeline  
**Props:**
- `stop: Site`
- `stopNumber: number`
- `isStamped: boolean`
- `points: number`
- `onPress: () => void`

**Layout:**
- Circle with number or green check
- Stop badge, category, status tag
- Thumbnail
- Name, description
- Operating hours with icon

#### ProgressCard (for Itinerary)
**Purpose:** Show itinerary completion summary  
**Props:**
- `stampedCount: number`
- `totalStops: number`
- `pointsAvailable: number`
- `pointsCollected: number`

**Layout:**
- "N of M stops stamped"
- "Points available: +X pts"
- "Y pts collected"
- Progress bar
- "Z% complete"
- "R pts remaining"

### 2. Hooks

#### useSites()
**Returns:** `{ data: Site[], isLoading, error, refetch }`  
**Purpose:** Fetch all sites from API  
**Implementation:** React Query with `getSites()` from api.ts

#### useSiteById(id: string)
**Returns:** `{ data: Site | null, isLoading, error, refetch }`  
**Purpose:** Fetch single site by ID  
**Implementation:** React Query with `getSiteById(id)` from api.ts

#### useItineraries()
**Returns:** `{ data: Itinerary[], isLoading, error, refetch }`  
**Purpose:** Fetch all itineraries  
**Implementation:** React Query with `getItineraries()` from api.ts

#### useItineraryById(id: string)
**Returns:** `{ data: Itinerary | null, isLoading, error, refetch }`  
**Purpose:** Fetch single itinerary by ID  
**Implementation:** React Query with `getItineraryById(id)` from api.ts

#### useStamps()
**Returns:** `{ data: Stamp[], isLoading, error, refetch }`  
**Purpose:** Fetch user's collected stamps  
**Implementation:** React Query with `getStamps()` from api.ts  
**Used for:** Deriving visited state and progress

### 3. API Functions

All in `src/data/api.ts`, return mock data after `randomDelay()`.

#### getSites(category?: Category): Promise<Site[]>
Returns all sites, optionally filtered by category.

#### getSiteById(id: string): Promise<Site | null>
Returns single site or null if not found.

#### searchSites(query: string): Promise<Site[]>
Filters sites by name, address, or municipality (case-insensitive).

#### getItineraries(): Promise<Itinerary[]>
Returns all itineraries (4 total).

#### getItineraryById(id: string): Promise<Itinerary | null>
Returns single itinerary or null if not found.

#### getStamps(): Promise<Stamp[]>
Returns user's collected stamps.

### 4. Utilities

#### openInMaps(latitude: number, longitude: number, label?: string)
**Location:** `src/lib/open-maps.ts`  
**Purpose:** Open device's maps app at given coordinates  
**Implementation:**
```typescript
export async function openInMaps(
  latitude: number,
  longitude: number,
  label?: string
): Promise<void> {
  const geoUri = `geo:${latitude},${longitude}?q=${encodeURIComponent(label || '')}`;
  const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  
  try {
    await Linking.openURL(geoUri);
  } catch {
    await Linking.openURL(fallbackUrl);
  }
}
```

**Usage:**
- Site Information screen
- Event Information screen

## State Management

### Local Component State
Used for:
- Active tab (Sites | Itineraries)
- Active category chip
- List/Map view toggle
- Search query text
- Keyboard visibility

**Pattern:** `useState` + derived values

### Server State (React Query)
Used for:
- Sites list
- Single site
- Itineraries list
- Single itinerary
- User stamps

**Pattern:**
```typescript
const { data, isLoading, error, refetch } = useSites();
```

**Cache keys:**
- `['sites']` - all sites
- `['sites', id]` - single site
- `['itineraries']` - all itineraries
- `['itineraries', id]` - single itinerary
- `['stamps']` - user stamps

**Invalidation:**
- Stamps invalidate on scan success (handled in Scanner spec)

## Data Derivation

### Visited State
```typescript
const isVisited = (siteId: string, stamps: Stamp[]): boolean => {
  return stamps.some(stamp => stamp.siteId === siteId);
};
```

### Itinerary Progress
```typescript
interface ItineraryProgress {
  stampedCount: number;
  totalStops: number;
  pointsAvailable: number;
  pointsCollected: number;
  percentage: number;
  pointsRemaining: number;
}

const getItineraryProgress = (
  itinerary: Itinerary,
  stamps: Stamp[],
  sites: Site[]
): ItineraryProgress => {
  const stops = itinerary.siteIds.map(id => 
    sites.find(s => s.id === id)
  ).filter(Boolean) as Site[];
  
  const stampedCount = stops.filter(stop => 
    stamps.some(stamp => stamp.siteId === stop.id)
  ).length;
  
  const pointsAvailable = stops.reduce((sum, stop) => 
    sum + POINTS_PER_CATEGORY[stop.category], 0
  );
  
  const pointsCollected = stops
    .filter(stop => stamps.some(stamp => stamp.siteId === stop.id))
    .reduce((sum, stop) => sum + POINTS_PER_CATEGORY[stop.category], 0);
  
  const percentage = Math.round((stampedCount / stops.length) * 100);
  const pointsRemaining = pointsAvailable - pointsCollected;
  
  return {
    stampedCount,
    totalStops: stops.length,
    pointsAvailable,
    pointsCollected,
    percentage,
    pointsRemaining,
  };
};
```

### Stop Status
```typescript
interface StopStatus {
  isStamped: boolean;
  points: number;
  statusLabel: string;
  statusColor: string;
}

const getStopStatus = (
  siteId: string,
  category: Category,
  stamps: Stamp[]
): StopStatus => {
  const isStamped = stamps.some(stamp => stamp.siteId === siteId);
  const points = POINTS_PER_CATEGORY[category];
  
  return {
    isStamped,
    points,
    statusLabel: isStamped 
      ? `Stamped • +${points} pts` 
      : `Not stamped • +${points} pts`,
    statusColor: isStamped ? colors.success : colors.textSecondary,
  };
};
```

## Navigation Flow

### From Explore Tab
```
Sites view → [Tap site card] → /sites/[id]
Itineraries view → [Tap itinerary card] → /itineraries/[id]
```

### From Site Information
```
/sites/[id] → [Tap "Open in Maps"] → Device maps app
/sites/[id] → [Tap back] → Previous screen
```

### From Itinerary Detail
```
/itineraries/[id] → [Tap stop card] → /sites/[id]
/itineraries/[id] → [Tap back] → Explore tab
```

### Navigation Stack
```
(tabs) layout
  └─ explore (Sites | Itineraries)

(root) layout
  ├─ sites/[id]
  └─ itineraries/[id]
```

## Styling Patterns

### Theme Token Usage
```typescript
import { colors, spacing, typography, radii } from '@/theme';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.titleMedium,
    color: colors.text,
  },
  // ... more styles
});
```

### Component Patterns
- **Pressable cards:** Use `activeOpacity={0.7}` or scale transform
- **Icons:** Use `@expo/vector-icons` Ionicons
- **Images:** Use local placeholders or `expo-image` with placeholder URLs
- **Lists:** Use ScrollView or View with map (no FlatList in ScreenContainer)

### Layout Patterns
- **Vertical spacing:** `gap` or `marginBottom`
- **Horizontal spacing:** `gap` or `marginRight`
- **Edge padding:** `spacing.base` (16px) for screen container content
- **Card internal padding:** `spacing.base` (16px)
- **Chip padding:** horizontal `spacing.base`, vertical `spacing.xs`

## Error Handling

### Loading States
Show `ActivityIndicator` centered with appropriate sizing:
```tsx
<View style={styles.centerContainer}>
  <ActivityIndicator size="large" color={colors.primary} />
</View>
```

### Error States
Show icon, message, and retry button:
```tsx
<View style={styles.centerContainer}>
  <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
  <Text style={styles.errorTitle}>Unable to load sites</Text>
  <Text style={styles.errorMessage}>{error.message}</Text>
  <Button title="Retry" onPress={refetch} variant="primary" />
</View>
```

### Empty States
Show icon and contextual message:
```tsx
<View style={styles.centerContainer}>
  <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
  <Text style={styles.emptyTitle}>No sites match your search</Text>
  <Button title="Clear filters" onPress={handleClearFilters} variant="secondary" />
</View>
```

### Not Found States
For detail screens:
```tsx
<View style={styles.centerContainer}>
  <Ionicons name="location-outline" size={48} color={colors.textSecondary} />
  <Text style={styles.emptyTitle}>Site not found</Text>
  <Text style={styles.emptyMessage}>
    The site you're looking for could not be found.
  </Text>
</View>
```

## Performance Considerations

### React Query Caching
- Sites cached for 5 minutes
- Stamps cached for 5 minutes
- Invalidate stamps on scan success

### List Rendering
- Use ScrollView with map for small lists (<20 items)
- No virtualization needed in this phase

### Image Loading
- Use local placeholders
- No remote image optimization needed

## Testing Strategy

### Manual Testing Checklist
- [ ] Explore tab renders and switches views
- [ ] Search filters sites correctly
- [ ] Category chips filter correctly
- [ ] List/Map toggle works
- [ ] Site cards show correct visited indicators
- [ ] Itinerary cards show correct progress
- [ ] Site Information screen shows all sections
- [ ] "Open in Maps" opens maps app
- [ ] Itinerary Detail timeline renders correctly
- [ ] Timeline progress card shows correct values
- [ ] Stop cards navigate to site detail
- [ ] All loading states display correctly
- [ ] All error states display correctly
- [ ] All empty states display correctly
- [ ] Android back button works
- [ ] Keyboard dismisses on scroll
- [ ] Card taps work with keyboard open

### Type Safety
- Run `npx tsc --noEmit` before checkpoint
- Fix all type errors
- Ensure strict mode compliance

### Code Quality
- Run `npx expo lint` before checkpoint
- Fix all lint errors
- Follow naming conventions

## Future Enhancements (Not in This Spec)

### Real Map Implementation
- Replace CaviteMap placeholder with MapLibre
- Add Protomaps tile source
- Render site pins
- Handle pin taps
- Show route for itineraries
- User location indicator

### Advanced Search
- Multi-select category filters
- Municipality filter
- Distance-based search

### Performance
- Virtualized lists for large datasets
- Image optimization
- Offline support

### Enhanced UX
- Site photos from real data
- Save/bookmark sites
- Share itineraries
- Print passport

## Notes

- The map is a placeholder in this spec. Real map implementation is a separate, later spec.
- All progress values are derived from data, never hardcoded.
- Stamps auto-update screens via React Query invalidation.
- The design images show 5 site cards in the list, but the mock data may have more or fewer sites. The UI should adapt to the actual data count.
- Festival stamps (50 pts bonus) do not appear in the Site category filter or in itinerary stop calculations for this spec.
