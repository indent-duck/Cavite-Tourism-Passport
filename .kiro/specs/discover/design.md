# Design: Discover

## 1. Architecture

### 1.1 Data Flow
```
Screens → Hooks → API Functions → Mock Data
```

- Screens never import api.ts or mock-data.ts directly
- All data access goes through hooks
- Hooks use React Query for caching and state management
- API functions add artificial delay and return mock data

### 1.2 Component Hierarchy

**Discover Tab:**
```
discover.tsx
├─ ScreenContainer (scrollable, withTabBarPadding, edges=['left', 'right'])
│  └─ SegmentedControl
│     ├─ Events View
│     │  └─ FlatList of EventCard
│     └─ About Cavite View
│        └─ AboutCaviteContent
│           ├─ Text sections
│           ├─ Festival calendar list
│           ├─ CaviteMap placeholder
│           └─ ExpresswayCard list
```

**Event Information Screen:**
```
events/[id].tsx
└─ ScreenContainer (scrollable, default edges)
   ├─ Photo area
   ├─ Chips row
   ├─ Event title
   ├─ Location
   ├─ Stamp bonus card (conditional)
   ├─ Date & Time section
   ├─ Venue Address section
   ├─ Description section
   └─ Location & Directions section (conditional)
      ├─ CaviteMap placeholder
      └─ "Open in Maps" button
```

### 1.3 State Management
- Segmented control state: local useState in discover.tsx
- Selected expressway: local useState in AboutCaviteContent
- Event data: React Query via hooks
- No global state needed

## 2. Type Definitions

Add to `src/data/types.ts`:

```typescript
// Event/festival
export interface Event {
  id: string;
  title: string; // e.g., "Sample Town Festival - Amadeo"
  startDate: string; // ISO format (renamed from date)
  endDate?: string; // ISO format, for multi-day events
  municipality: string; // Renamed from location
  address: string;
  latitude: number;
  longitude: number;
  description: string;
  category: 'Festival' | 'Cultural';
  festivalStamp?: {
    pointsBonus: number;
    available: boolean;
  };
  // Removed: status (computed client-side)
  // Removed: imageUrl (use local placeholder)
}

// Expressway info
export interface Expressway {
  id: string;
  name: string;
  locationSpan: string; // e.g., "placeholder, to be confirmed"
  description: string;
}

// About Cavite content
export interface AboutCaviteSection {
  heading: string;
  content: string;
}

export interface AboutCaviteContent {
  sections: AboutCaviteSection[];
}

// Map pin (stub for future map implementation)
export interface MapPin {
  id: string;
  category: 'partner' | 'heritage' | 'signature-food';
  latitude: number;
  longitude: number;
  label: string;
}
```

## 3. Event Status Utility

Create `src/lib/event-utils.ts`:

```typescript
import type { Event } from '@/data/types';

/**
 * Compute event status from dates
 * 
 * @param event - Event object with startDate and optional endDate (ISO strings)
 * @returns "happening" if current date is within event dates, "upcoming" if before, "past" if after
 */
export function getEventStatus(event: Event): 'happening' | 'upcoming' | 'past' {
  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : startDate;
  
  // Set times to start of day for date comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const eventEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  
  if (today >= eventStart && today <= eventEnd) {
    return 'happening';
  } else if (today < eventStart) {
    return 'upcoming';
  } else {
    return 'past';
  }
}

/**
 * Format event date range
 * 
 * @param startDate - Start date (ISO string)
 * @param endDate - Optional end date (ISO string)
 * @returns Formatted date string (e.g., "February 12, 2027" or "February 12–14, 2027")
 */
export function formatEventDate(startDate: string, endDate?: string): string {
  const start = new Date(startDate);
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  if (!endDate) {
    return start.toLocaleDateString('en-US', options);
  }
  
  const end = new Date(endDate);
  
  // Same month and year
  if (
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()
  ) {
    const monthYear = start.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    return `${monthYear} ${start.getDate()}–${end.getDate()}`;
  }
  
  // Different months or years
  return `${start.toLocaleDateString('en-US', options)} – ${end.toLocaleDateString('en-US', options)}`;
}

/**
 * Format date badge for event card
 * 
 * @param startDate - Start date (ISO string)
 * @param endDate - Optional end date (ISO string)
 * @returns Short date string (e.g., "FEB 12" or "FEB 12-14")
 */
export function formatDateBadge(startDate: string, endDate?: string): string {
  const start = new Date(startDate);
  const month = start.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = start.getDate();
  
  if (!endDate) {
    return `${month} ${day}`;
  }
  
  const end = new Date(endDate);
  
  // Same month
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${month} ${day}-${end.getDate()}`;
  }
  
  // Different month
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  return `${month} ${day}-${endMonth} ${end.getDate()}`;
}
```

## 4. CaviteMap Placeholder

Create `src/components/map/CaviteMap.tsx`:

```typescript
/**
 * Placeholder map component.
 * 
 * Replace the body with a MapLibre implementation later and keep the props.
 * The real map will use @maplibre/maplibre-react-native with Protomaps tiles.
 */

import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import type { Expressway, MapPin } from '@/data/types';

export interface CaviteMapProps {
  // For future real map implementation:
  pins?: MapPin[];
  expressways?: Expressway[];
  selectedId?: string;
  onPinPress?: (id: string) => void;
  interactive?: boolean;
  
  // Used by placeholder:
  height: number;
  selectedLabel?: string; // e.g., "Selected: CAVITEX"
}

export function CaviteMap({ height, selectedLabel }: CaviteMapProps) {
  return (
    <View style={[styles.container, { height }]}>
      <Ionicons name="map-outline" size={48} color={colors.textSecondary} />
      <Text style={styles.text}>Map coming soon</Text>
      {selectedLabel && (
        <Text style={styles.selectedText}>{selectedLabel}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  text: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  selectedText: {
    ...typography.labelLarge,
    color: colors.primary,
    marginTop: spacing.xs,
  },
});
```

## 5. Mock Data

### 5.1 Update mockEvents

In `src/data/mock-data.ts`, replace existing mockEvents with:

```typescript
export const mockEvents: Event[] = [
  {
    id: 'event-001',
    title: 'Sample Town Festival - Amadeo',
    category: 'Festival',
    startDate: new Date(Date.now() - 86400000).toISOString(), // Started yesterday
    endDate: new Date(Date.now() + 86400000).toISOString(), // Ends tomorrow (happening now)
    municipality: 'Amadeo',
    address: 'Amadeo Municipal Plaza, Amadeo, Cavite',
    latitude: 14.1719,
    longitude: 120.9236,
    description: 'Placeholder: awaiting Tourism Office content.',
    festivalStamp: {
      pointsBonus: 50,
      available: true,
    },
  },
  {
    id: 'event-002',
    title: 'Sample Town Festival - Cavite City',
    category: 'Festival',
    startDate: new Date(Date.now() + 86400000 * 60).toISOString(), // ~60 days from now
    endDate: new Date(Date.now() + 86400000 * 61).toISOString(),
    municipality: 'Cavite City',
    address: 'Cavite City Plaza, Cavite City',
    latitude: 14.4791,
    longitude: 120.8973,
    description: 'Placeholder: awaiting Tourism Office content.',
    festivalStamp: {
      pointsBonus: 50,
      available: true,
    },
  },
  {
    id: 'event-003',
    title: 'Sample Town Festival - Kawit',
    category: 'Festival',
    startDate: new Date(Date.now() + 86400000 * 120).toISOString(), // ~120 days from now
    municipality: 'Kawit',
    address: 'Emilio Aguinaldo Shrine, Kawit, Cavite',
    latitude: 14.4444,
    longitude: 120.9028,
    description: 'Placeholder: awaiting Tourism Office content.',
    festivalStamp: {
      pointsBonus: 50,
      available: true,
    },
  },
  {
    id: 'event-004',
    title: 'Sample Town Festival - Maragondon',
    category: 'Festival',
    startDate: new Date(Date.now() + 86400000 * 30).toISOString(), // ~30 days from now
    municipality: 'Maragondon',
    address: 'Maragondon Town Plaza, Cavite',
    latitude: 14.2675,
    longitude: 120.7361,
    description: 'Placeholder: awaiting Tourism Office content.',
  },
  {
    id: 'event-005',
    title: 'Sample Cultural Event - General Trias',
    category: 'Cultural',
    startDate: new Date(Date.now() + 86400000 * 90).toISOString(), // ~90 days from now
    municipality: 'General Trias',
    address: 'General Trias City Hall, Cavite',
    latitude: 14.3859,
    longitude: 120.8812,
    description: 'Placeholder: awaiting Tourism Office content.',
  },
  {
    id: 'event-006',
    title: 'Sample Cultural Event - Tagaytay City',
    category: 'Cultural',
    startDate: new Date(Date.now() + 86400000 * 150).toISOString(), // ~150 days from now
    endDate: new Date(Date.now() + 86400000 * 152).toISOString(),
    municipality: 'Tagaytay City',
    address: "People's Park in the Sky, Tagaytay City",
    latitude: 14.1095,
    longitude: 120.9745,
    description: 'Placeholder: awaiting Tourism Office content.',
  },
];

// Keep existing event ids that other specs reference
// Search project for all Event type usage and update renamed/removed fields:
// - date → startDate
// - location → municipality
// - Remove: status, imageUrl
```

### 5.2 Add mockExpressways

```typescript
export const mockExpressways: Expressway[] = [
  {
    id: 'expressway-001',
    name: 'CAVITEX',
    locationSpan: 'placeholder, to be confirmed',
    description: 'Placeholder: awaiting Tourism Office content.',
  },
  {
    id: 'expressway-002',
    name: 'CAVITEX C5 Link',
    locationSpan: 'placeholder, to be confirmed',
    description: 'Placeholder: awaiting Tourism Office content.',
  },
  {
    id: 'expressway-003',
    name: 'CALAX',
    locationSpan: 'placeholder, to be confirmed',
    description: 'Placeholder: awaiting Tourism Office content.',
  },
];
```

### 5.3 Add mockAboutCavite

```typescript
export const mockAboutCavite: AboutCaviteContent = {
  sections: [
    {
      heading: 'Historical and Topographical Riches',
      content: 'Placeholder: awaiting Tourism Office content.',
    },
    {
      heading: 'Culinary Delights',
      content: 'Placeholder: awaiting Tourism Office content.',
    },
    {
      heading: 'Cultural Immersions',
      content: 'Placeholder: awaiting Tourism Office content.',
    },
  ],
};
```

## 6. API Functions

Add to `src/data/api.ts`:

```typescript
/**
 * Get event by ID
 */
export async function getEventById(id: string): Promise<Event> {
  await randomDelay();
  const event = mockEvents.find((e) => e.id === id);
  if (!event) {
    throw new Error(`Event not found: ${id}`);
  }
  return event;
}

/**
 * Get all expressways
 */
export async function getExpressways(): Promise<Expressway[]> {
  await randomDelay();
  return mockExpressways;
}

/**
 * Get About Cavite content
 */
export async function getAboutCavite(): Promise<AboutCaviteContent> {
  await randomDelay();
  return mockAboutCavite;
}
```

## 7. Hooks

### 7.1 useEventById

Create `src/hooks/useEventById.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { getEventById } from '@/data/api';
import type { Event } from '@/data/types';

export function useEventById(id: string) {
  return useQuery<Event, Error>({
    queryKey: ['events', id],
    queryFn: () => getEventById(id),
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: !!id,
  });
}
```

### 7.2 useExpressways

Create `src/hooks/useExpressways.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { getExpressways } from '@/data/api';
import type { Expressway } from '@/data/types';

export function useExpressways() {
  return useQuery<Expressway[], Error>({
    queryKey: ['expressways'],
    queryFn: getExpressways,
    staleTime: Infinity, // Static data
  });
}
```

### 7.3 useAboutCavite

Create `src/hooks/useAboutCavite.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { getAboutCavite } from '@/data/api';
import type { AboutCaviteContent } from '@/data/types';

export function useAboutCavite() {
  return useQuery<AboutCaviteContent, Error>({
    queryKey: ['about-cavite'],
    queryFn: getAboutCavite,
    staleTime: Infinity, // Static content
  });
}
```

## 8. Component Specifications

### 8.1 EventCard

**Props:**
```typescript
interface EventCardProps {
  event: Event;
  onPress: (id: string) => void;
}
```

**Layout:**
- Card wrapper (white background, shadow, border radius 16)
- Photo area: aspect ratio 16:9, local placeholder (tinted background with calendar icon)
- Date badge: absolute positioned top-left with spacing.sm inset
- Content padding: spacing.base
- Location row: pin icon + municipality, caption style
- Title: headlineMedium, spacing.sm bottom
- Description: bodyMedium, 3 lines max with ellipsis, spacing.md bottom
- Tags row: flex wrap with spacing.sm gaps
  - "Happening now" tag: green pill (success color)
  - Festival stamp chip: outlined pill, text derived from POINTS_PER_CATEGORY.Festival (e.g., "+50 pts"), only if festivalStamp.available

**Styling:**
- Use colors.background, colors.border, colors.text, colors.textSecondary, colors.success
- Use spacing.sm, spacing.md, spacing.base
- Use typography.headlineMedium, typography.bodyMedium, typography.labelMedium
- Use radii.card, radii.button
- Use shadows.card

### 8.2 ExpresswayCard

**Props:**
```typescript
interface ExpresswayCardProps {
  expressway: Expressway;
  selected: boolean;
  onPress: (id: string) => void;
}
```

**Layout:**
- Card wrapper (white background, border, border radius 16)
- Icon: highway icon (Ionicons 'git-network-outline'), 24px size
- Name: headlineMedium
- Location span: bodySmall, textSecondary
- Description: bodyMedium, textSecondary, 2 lines max
- Padding: 16px
- Gap: 8px between elements

**Selected State:**
- Border: primary color, 2px width
- Background: primary color with 5% opacity tint

**Styling:**
- Use colors.background, colors.border, colors.primary, colors.text, colors.textSecondary
- Use spacing.sm, spacing.base
- Use typography.headlineMedium, typography.bodyMedium, typography.bodySmall
- Use radii.card

### 8.3 AboutCaviteContent

**Props:**
```typescript
interface AboutCaviteContentProps {
  onEventPress: (id: string) => void;
}
```

**Layout (vertical):**
1. Loading state: ActivityIndicator centered
2. Error state: error message with retry button (use Button component)
3. Empty state: message if no data

4. Text sections (map over sections array)
   - Heading: headlineMedium, spacing.sm bottom
   - Content: bodyMedium, textSecondary
   - Gap: spacing.xxl between sections

5. Festival calendar (spacing.xxl top margin)
   - Heading: "Quick Festival Calendar", headlineMedium
   - List: all events where category is 'Festival', sorted by startDate, exclude Cultural events and past events
   - Each item: name, municipality, date badge (right-aligned)
   - Pressable rows
   - Empty state if no festivals

6. Map section (spacing.xxl top margin)
   - Heading: "Expressway & Province Map", headlineMedium, spacing.md bottom
   - CaviteMap component (300px height)
   - Legend row: three items with icons and labels, spacing.md top
   - Gap: spacing.xl bottom

7. Expressway cards
   - ExpresswayCard for each expressway
   - Gap: spacing.md between cards
   - Local state: selectedExpresswayId
   - Pass selectedLabel to CaviteMap: `Selected: ${name}`

**Styling:**
- Use spacing.sm, spacing.md, spacing.base, spacing.xl, spacing.xxl
- Use typography.headlineMedium, typography.bodyMedium, typography.labelMedium
- Use colors.text, colors.textSecondary

### 8.4 Local Image Placeholder

For photo areas, use a tinted View with an icon instead of remote images:

```typescript
<View style={styles.photoPlaceholder}>
  <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
</View>

// styles
photoPlaceholder: {
  aspectRatio: 16 / 9,
  backgroundColor: colors.surface,
  justifyContent: 'center',
  alignItems: 'center',
  borderTopLeftRadius: radii.card,
  borderTopRightRadius: radii.card,
}
```

## 9. Navigation

### 9.1 Discover Tab
- Use `router.push(\`/events/\${event.id}\`)` for event card press

### 9.2 Event Information Screen
- Use `router.back()` for back button (header handled by ScreenContainer)
- "Open in Maps" button:

```typescript
const handleOpenMaps = async () => {
  const geoUri = `geo:${event.latitude},${event.longitude}?q=${encodeURIComponent(event.title)}`;
  const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`;
  
  try {
    await Linking.openURL(geoUri);
  } catch {
    // Fallback to Google Maps
    await Linking.openURL(fallbackUrl);
  }
};
```

## 10. Design References

- `design/screens/08-discover/discover_cavite_full_view_events.png` - Events view
- `design/screens/08-discover/discover_cavite_full_view_about_cavite.png` - About Cavite view
- `design/screens/08-discover/event_information_sample_town_festival_full_view.png` - Event Information screen

Read HTML files only for exact spacing, sizes, and colors. Never copy HTML or Tailwind code.
