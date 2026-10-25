# Foundation Technical Design

## Overview

The Foundation establishes the technical architecture for the Cavite Tourism Passport mobile application. It provides the visual design system, shared UI component library, navigation structure, and data layer abstraction that all feature modules will build upon.

This is an Android-only Expo React Native application built with TypeScript in strict mode. The Foundation implements a UI-first approach where all data flows through a mock layer with artificial delays to properly design loading states before backend integration.

**Key Design Principles:**
- Single source of truth for styling via centralized theme tokens
- Strict separation between UI components and business logic
- Type-safe data contracts with comprehensive TypeScript types
- Mock-first data architecture enabling rapid UI iteration
- Consistent component APIs using composition patterns
- Accessibility and safe area handling built into base components

## Architecture

### System Layers

```
┌─────────────────────────────────────────────────────┐
│                  Expo Router Routes                  │
│                  (src/app/ directory)                │
│  Thin route files that compose components & hooks    │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│              UI Components Layer                     │
│          (src/components/ directory)                 │
│  Shared UI primitives + feature-specific components  │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                  Hooks Layer                         │
│              (src/hooks/ directory)                  │
│      React Query hooks wrapping API functions        │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│               API Abstraction Layer                  │
│              (src/data/api.ts file)                  │
│     Single file exposing all data operations         │
│         (Mock now, Supabase later)                   │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                 Mock Data Store                      │
│           (src/data/mock-data.ts file)               │
│      Sample data matching requirements               │
└─────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

**1. Theme System as Single Source of Truth**
- All styling values (colors, spacing, typography, radii) centralized in `src/theme/`
- Components never hardcode visual values
- Enables consistent design language and easy theming updates

**2. Route Files as Composition Layer**
- Route files in `src/app/` are kept minimal
- Contain no business logic or direct data access
- Compose UI components and hooks only
- Makes route files easy to scan and maintain

**3. API Abstraction Boundary**
- All external data access goes through `src/data/api.ts`
- Components and hooks never import mock data directly
- Swapping mock layer for real backend touches only `api.ts`
- Artificial delays simulate network latency for loading state design

**4. React Query for State Management**
- Server state managed exclusively by React Query
- AsyncStorage persistence for offline-first experience
- Consistent loading, error, and caching patterns
- No separate Redux/MobX needed for this use case

**5. Type Safety Throughout**
- Strict TypeScript mode enforced
- All data types defined in `src/data/types.ts`
- Components receive typed props
- API functions return typed promises

## Components and Interfaces

### Theme System

**Location:** `src/theme/index.ts`

The theme system exports design tokens organized by category:

```typescript
// Color tokens
export const colors = {
  // Primary palette
  primary: '#004987',        // Navy blue for navigation, headers
  accent: '#F47B20',         // Orange for CTAs, highlights
  background: '#FFFFFF',     // Main canvas background
  surface: '#F4F6FA',        // Card backgrounds
  
  // Text colors
  text: '#1B2A49',          // Primary text
  textSecondary: '#6B7280', // Secondary text, metadata
  
  // Semantic colors
  success: '#2E9E5B',       // Success states, completed stamps
  error: '#D64545',         // Error states, validation failures
  
  // Structural colors
  border: '#E5E7EB',        // Dividers, input borders
  
  // Passport-specific colors
  passportLeather: '#0B2A4A',
  passportFoil: '#F89C48',
} as const;

// Spacing scale (px values)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
} as const;

// Typography scale
export const typography = {
  // Font family
  fontFamily: 'Inter',
  
  // Display styles
  displayLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
    letterSpacing: -0.64,
  },
  displayLargeMobile: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as const,
    letterSpacing: -0.28,
  },
  
  // Headline styles
  headlineLarge: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700' as const,
    letterSpacing: -0.24,
  },
  headlineMedium: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
  },
  headlineSmall: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  
  // Title styles
  titleMedium: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
  },
  
  // Body styles
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
  
  // Label styles
  labelLarge: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.14,
  },
  labelMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.24,
  },
  labelSmall: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700' as const,
    letterSpacing: 0.4,
  },
} as const;

// Border radii
export const radii = {
  card: 16,
  button: 24,   // Pill shape
  chip: 16,
  input: 12,
  full: 9999,
} as const;

// Shadow elevations
export const shadows = {
  card: {
    shadowColor: '#1B2A49',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  button: {
    shadowColor: '#F47B20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 4,
  },
  tabBar: {
    shadowColor: '#1B2A49',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;
```

**Design Rationale:**
- All values exported as `const` for type inference
- Numeric spacing values (not strings) for easier math operations
- Typography objects include all style properties for easy spreading
- Shadow definitions include both iOS (shadow*) and Android (elevation) properties
- Color naming is semantic (purpose-based) not descriptive (blue, orange)

### UI Components

All shared UI components live in `src/components/ui/` and follow these patterns:
- Typed props with required/optional distinction
- Composition over configuration
- Accessible by default
- Theme tokens only (no hardcoded values)
- Platform-specific handling when necessary

#### Button Component

**Location:** `src/components/ui/Button.tsx`

```typescript
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'text';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  size?: 'default' | 'compact';
  icon?: React.ReactNode;
  testID?: string;
}
```

**Visual Specifications:**
- **Primary variant:** Solid orange background (#F47B20), white text, pill shape
- **Secondary variant:** Transparent background, blue border (1.5px), blue text
- **Text variant:** Transparent background, no border, blue text
- **Height:** 48px default, 40px compact
- **Border radius:** 24px (full pill)
- **Loading state:** Spinner replaces text, button remains at full size
- **Disabled state:** 40% opacity, no pointer events

**Implementation Notes:**
- Use `TouchableOpacity` for press feedback
- Loading spinner uses theme accent color
- Icon + text layout: icon on left with 8px spacing
- Full width mode sets `flex: 1` or `width: '100%'` based on container

#### TextInput Component

**Location:** `src/components/ui/TextInput.tsx`

```typescript
interface TextInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  testID?: string;
}
```

**Visual Specifications:**
- **Container height:** 56px (single line), auto (multiline)
- **Background:** Surface color (#F4F6FA)
- **Border radius:** 12px
- **Border:** 1px transparent default, 1.5px primary blue when focused, 1.5px error red when error
- **Label:** bodyMedium style, text color, 4px above input
- **Placeholder:** textSecondary color
- **Error message:** bodySmall style, error color, 4px below input
- **Padding:** 16px horizontal, 16px vertical

**State Interactions:**
- Focus state adds border animation
- Error state takes precedence over focus
- Disabled state reduces opacity to 60%

#### Card Component

**Location:** `src/components/ui/Card.tsx`

```typescript
interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
```

**Visual Specifications:**
- **Background:** White (#FFFFFF)
- **Border radius:** 16px
- **Padding:** 16px all sides
- **Shadow:** Card elevation from theme
- **Pressable:** Only if `onPress` provided
- **Press feedback:** Subtle scale down (0.98) with spring animation

**Implementation Notes:**
- Conditionally wraps children in `Pressable` if `onPress` exists
- Custom style prop merges with base styles
- Shadow applied via theme `shadows.card`

#### Chip Component

**Location:** `src/components/ui/Chip.tsx`

```typescript
interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  size?: 'default' | 'small';
  testID?: string;
}
```

**Visual Specifications:**
- **Height:** 36px default, 32px small
- **Border radius:** Full pill (radii.chip = 16px)
- **Unselected state:** White background, border (#E5E7EB), text primary color
- **Selected state:** Primary blue background, white text, no border
- **Padding:** 12px horizontal (default), 8px horizontal (small)
- **Icon spacing:** 6px between icon and text

**Implementation Notes:**
- Use `Pressable` with haptic feedback on press
- Icon tinted to match text color
- Accessible label for screen readers

#### StepIndicator Component

**Location:** `src/components/ui/StepIndicator.tsx`

```typescript
interface StepIndicatorProps {
  currentStep: number;  // 1-indexed
  totalSteps: number;
  labels?: string[];
  testID?: string;
}
```

**Visual Specifications:**
- **Layout:** Horizontal row with equal spacing
- **Step circles:** 32px diameter
- **Active step:** Primary blue background, white text
- **Completed step:** Success green background, white checkmark
- **Upcoming step:** Border only (1px border color), text secondary color
- **Connector lines:** 1px height, border color, 8px length between circles
- **Labels:** bodySmall style, centered below circles, 4px spacing

**Implementation Notes:**
- Use `FlatList` horizontal for dynamic step count
- Animate transitions between steps
- Labels optional; if provided, must match totalSteps length

#### ScreenContainer Component

**Location:** `src/components/ui/ScreenContainer.tsx`

```typescript
interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  showHeader?: boolean;
  headerTitle?: string;
  onBackPress?: () => void;
  contentContainerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}
```

**Visual Specifications:**
- **Background:** Background color (#FFFFFF)
- **Safe area:** Wraps content in SafeAreaView
- **Bottom padding:** 80px when scrollable (for tab bar clearance)
- **Header height:** 56px when shown
- **Header background:** White with bottom border

**Component Structure:**
```
SafeAreaView (edges: top, left, right)
  └─ Header (optional)
       ├─ Back button (if onBackPress provided)
       └─ Title
  └─ ScrollView (if scrollable) OR View
       └─ children
```

**Implementation Notes:**
- Use `KeyboardAvoidingView` on Android for keyboard management
- ScrollView includes `contentContainerStyle` prop
- Bottom safe area NOT included (tab bar handles it)
- Back button uses Ionicons 'arrow-back'

#### Header Component

**Location:** `src/components/ui/Header.tsx`

```typescript
interface HeaderProps {
  userName: string;
  points: number;
  onPointsPress: () => void;
  testID?: string;
}
```

**Visual Specifications:**
- **Height:** 72px
- **Background:** White with bottom shadow
- **Layout:** Vertical stack, centered
- **User name:** titleMedium style, text color
- **Points:** bodyMedium style, accent color (#F47B20), pressable
- **Spacing:** 2px between name and points

**Implementation Notes:**
- Points text wrapped in `Pressable` with haptic feedback
- Entire header uses fixed positioning at top of scrollable screens
- Shadow from theme `shadows.tabBar` (subtle top shadow)

### Navigation Architecture

**Expo Router File Structure:**

```
src/app/
├─ _layout.tsx                    # Root stack, font loading
│
├─ (auth)/
│  ├─ _layout.tsx                 # Auth stack (no header)
│  ├─ login.tsx
│  └─ signup/
│     ├─ email.tsx
│     ├─ verify.tsx
│     └─ details.tsx
│  └─ forgot/
│     ├─ email.tsx
│     ├─ verify.tsx
│     ├─ new-password.tsx
│     └─ success.tsx
│
├─ (tabs)/
│  ├─ _layout.tsx                 # Custom bottom tabs
│  ├─ explore.tsx
│  ├─ passport.tsx
│  ├─ scan.tsx                    # Placeholder (not shown in UI)
│  ├─ discover.tsx
│  └─ account.tsx
│
├─ scanner.tsx                     # Opened from Scan tab button
├─ sites/
│  └─ [id].tsx
├─ itineraries/
│  └─ [id].tsx
├─ events/
│  └─ [id].tsx
├─ rewards/
│  ├─ index.tsx
│  └─ [id].tsx
└─ settings.tsx
```

#### Root Layout (`src/app/_layout.tsx`)

**Responsibilities:**
- Load Inter font family with `useFonts` from `@expo-google-fonts/inter`
- Manage splash screen visibility
- Configure React Query provider
- Render Stack navigator with no default header

**Key Implementation:**
```typescript
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts, Inter_400Regular, Inter_500Medium, 
         Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { queryClient } from '@/lib/query-client';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="scanner" />
        <Stack.Screen name="sites/[id]" />
        <Stack.Screen name="itineraries/[id]" />
        <Stack.Screen name="events/[id]" />
        <Stack.Screen name="rewards" />
        <Stack.Screen name="settings" />
      </Stack>
    </QueryClientProvider>
  );
}
```

#### Auth Layout (`src/app/(auth)/_layout.tsx`)

**Responsibilities:**
- Provide stack navigator for auth flows
- No header (each screen manages its own)
- Enable gestures for back navigation

#### Tabs Layout (`src/app/(tabs)/_layout.tsx`)

**Responsibilities:**
- Render custom bottom tab bar
- Configure 5 tabs with icons and labels
- Implement raised center Scan button
- Handle tab press to open `/scanner` route for Scan tab

**Custom Tab Bar Specifications:**
- **Height:** 64px + bottom safe area inset
- **Background:** Opaque white (#FFFFFF)
- **Border:** 1px top border (#E5E7EB)
- **Shadow:** Subtle elevation (shadows.tabBar)
- **Layout:** Flex row with 5 equally spaced items
- **Active tab:** Primary blue icon and text
- **Inactive tab:** Border color icon and secondary text
- **Center button:** 
  - Size: 64px diameter
  - Background: Accent orange (#F47B20)
  - Icon: White QR code icon
  - Elevation: 8dp, raised 16px above tab bar baseline
  - Shadow: Button shadow from theme
  - Press opens `/scanner` route instead of showing `scan.tsx`

**Tab Configuration:**
```typescript
const tabs = [
  { name: 'explore', label: 'Explore', icon: 'compass-outline' },
  { name: 'passport', label: 'Passport', icon: 'book-outline' },
  { name: 'scan', label: 'Scan', icon: 'qr-code', isCenter: true },
  { name: 'discover', label: 'Discover', icon: 'calendar-outline' },
  { name: 'account', label: 'Account', icon: 'person-outline' },
];
```

**Implementation Notes:**
- Use Ionicons for tab icons
- Tab press triggers haptic feedback (light impact)
- Scan tab press uses `router.push('/scanner')` instead of navigation
- Custom tab bar component receives `state`, `descriptors`, `navigation` props
- Active tab determined by `state.index`

## Data Models

### Type Definitions

**Location:** `src/data/types.ts`

All data types are defined in a single file for easy maintenance and import:

```typescript
// User and authentication
export interface User {
  id: string;
  email: string;
  name: string;
  address: string;
  contactNumber?: string;  // Added later in Account settings
  passportId: string;      // Format: CVT-YYYY-NNNNNN
  points: number;
  createdAt: Date;
}

// Category taxonomy
export type Category = 
  | 'Dining' 
  | 'Staycation' 
  | 'Adventure' 
  | 'Heritage' 
  | 'Festival';

// Points per category (for reference in UI)
export const POINTS_PER_CATEGORY: Record<Category, number> = {
  Dining: 150,
  Staycation: 200,
  Adventure: 100,
  Heritage: 50,
  Festival: 50,
};

// Site/destination
export interface Site {
  id: string;
  name: string;
  category: Category;
  municipality: string;
  address: string;
  description: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  operatingHours?: string;
}

// Collected stamp
export interface Stamp {
  id: string;
  userId: string;
  siteId: string;
  siteName: string;
  siteCategory: Category;
  municipality: string;
  pointsEarned: number;
  collectedAt: Date;  // Date + time of scan
}

// Itinerary/tour
export interface Itinerary {
  id: string;
  title: string;
  type: 'Day Tour' | 'Overnight Tour';
  description: string;
  duration: string;  // e.g., "8 hours", "2 days"
  imageUrl: string;
  siteIds: string[];  // Ordered list of site IDs
  stops: number;      // Derived from siteIds.length
}

// Event/festival
export interface Event {
  id: string;
  title: string;
  date: Date;
  endDate?: Date;     // For multi-day festivals
  location: string;
  address: string;
  latitude: number;
  longitude: number;
  description: string;
  imageUrl: string;
  status: 'upcoming' | 'happening' | 'past';
  festivalStamp?: {   // Only for festivals offering stamps
    pointsBonus: number;
    available: boolean;
  };
}

// Reward
export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  imageUrl: string;
  available: boolean;      // Overall availability
  limited: boolean;        // Has participant limit
  remainingClaims?: number; // Only if limited
}

// Reward eligibility status
export interface RewardEligibility {
  eligible: boolean;
  hasEnoughPoints: boolean;
  currentPoints: number;
  pointsNeeded: number;
  hasAllCategories: boolean;
  missingCategories: Category[];
}

// Claim QR code
export interface ClaimQR {
  rewardId: string;
  userId: string;
  qrCode: string;       // Generated QR code data
  expiresAt: Date;
  used: boolean;
}

// Promo period
export interface PromoPeriod {
  startDate: Date;
  endDate: Date;
  active: boolean;
}

// API response wrapper
export interface ApiResponse<T> {
  data: T;
  error?: string;
}
```

### Mock Data Store

**Location:** `src/data/mock-data.ts`

Contains sample data matching the requirements (Juan Dela Cruz with 4 stamps, 450 points):

```typescript
import { User, Site, Stamp, Itinerary, Event, Reward, PromoPeriod, Category } from './types';

// Current user
export const mockUser: User = {
  id: 'user-001',
  email: 'juan.delacruz@example.com',
  name: 'Juan Dela Cruz',
  address: 'Dasmariñas, Cavite',
  passportId: 'CVT-2027-000123',
  points: 450,
  createdAt: new Date('2027-01-15'),
};

// User's collected stamps (4 stamps: 1 Dining, 1 Staycation, 2 Heritage, 1 Festival)
export const mockStamps: Stamp[] = [
  {
    id: 'stamp-001',
    userId: 'user-001',
    siteId: 'site-dining-001',
    siteName: 'Café Amadeo',
    siteCategory: 'Dining',
    municipality: 'Amadeo',
    pointsEarned: 150,
    collectedAt: new Date('2027-02-10T14:30:00'),
  },
  {
    id: 'stamp-002',
    userId: 'user-001',
    siteId: 'site-staycation-001',
    siteName: 'Tagaytay Highlands Resort',
    siteCategory: 'Staycation',
    municipality: 'Tagaytay',
    pointsEarned: 200,
    collectedAt: new Date('2027-02-15T10:00:00'),
  },
  {
    id: 'stamp-003',
    userId: 'user-001',
    siteId: 'site-heritage-001',
    siteName: 'Aguinaldo Shrine',
    siteCategory: 'Heritage',
    municipality: 'Kawit',
    pointsEarned: 50,
    collectedAt: new Date('2027-02-20T11:15:00'),
  },
  {
    id: 'stamp-004',
    userId: 'user-001',
    siteId: 'site-heritage-002',
    siteName: 'Fort San Felipe',
    siteCategory: 'Heritage',
    municipality: 'Cavite City',
    pointsEarned: 50,
    collectedAt: new Date('2027-02-25T15:45:00'),
  },
  {
    id: 'stamp-005',
    userId: 'user-001',
    siteId: 'site-festival-001',
    siteName: 'Cavite City Charter Day',
    siteCategory: 'Festival',
    municipality: 'Cavite City',
    pointsEarned: 50,
    collectedAt: new Date('2027-03-01T16:00:00'),
  },
];

// Site catalog (diverse set across all categories)
export const mockSites: Site[] = [
  // Dining category
  {
    id: 'site-dining-001',
    name: 'Café Amadeo',
    category: 'Dining',
    municipality: 'Amadeo',
    address: 'Brgy. Dagatan, Amadeo, Cavite',
    description: 'Traditional Cavite coffee and local delicacies',
    imageUrl: 'https://picsum.photos/seed/dining1/800/600',
    latitude: 14.1747,
    longitude: 120.9217,
    operatingHours: '7:00 AM - 9:00 PM',
  },
  {
    id: 'site-dining-002',
    name: 'Josephine Restaurant',
    category: 'Dining',
    municipality: 'Tagaytay',
    address: 'Tagaytay-Nasugbu Highway, Tagaytay City',
    description: 'Famous for bulalo and scenic views',
    imageUrl: 'https://picsum.photos/seed/dining2/800/600',
    latitude: 14.1093,
    longitude: 120.9560,
    operatingHours: '10:00 AM - 10:00 PM',
  },
  
  // Staycation category
  {
    id: 'site-staycation-001',
    name: 'Tagaytay Highlands Resort',
    category: 'Staycation',
    municipality: 'Tagaytay',
    address: 'Tagaytay Highlands, Tagaytay City',
    description: 'Luxury resort with panoramic views',
    imageUrl: 'https://picsum.photos/seed/stay1/800/600',
    latitude: 14.1137,
    longitude: 120.9390,
  },
  {
    id: 'site-staycation-002',
    name: 'Canyon Cove Resort',
    category: 'Staycation',
    municipality: 'Nasugbu',
    address: 'Piloto Wawa, Nasugbu, Batangas (Cavite border)',
    description: 'Beach resort with water activities',
    imageUrl: 'https://picsum.photos/seed/stay2/800/600',
    latitude: 14.0691,
    longitude: 120.6302,
  },
  
  // Adventure category
  {
    id: 'site-adventure-001',
    name: 'Mount Palay-Palay National Park',
    category: 'Adventure',
    municipality: 'Maragondon',
    address: 'Maragondon, Cavite',
    description: 'Hiking trails and diverse wildlife',
    imageUrl: 'https://picsum.photos/seed/adv1/800/600',
    latitude: 14.2542,
    longitude: 120.7383,
    operatingHours: '6:00 AM - 6:00 PM',
  },
  {
    id: 'site-adventure-002',
    name: 'Corregidor Island',
    category: 'Adventure',
    municipality: 'Cavite City',
    address: 'Corregidor Island, Manila Bay',
    description: 'Historical island with war tunnels and ruins',
    imageUrl: 'https://picsum.photos/seed/adv2/800/600',
    latitude: 14.3833,
    longitude: 120.5833,
  },
  
  // Heritage category
  {
    id: 'site-heritage-001',
    name: 'Aguinaldo Shrine',
    category: 'Heritage',
    municipality: 'Kawit',
    address: 'Emilio Aguinaldo Highway, Kawit, Cavite',
    description: 'Birthplace of Philippine independence',
    imageUrl: 'https://picsum.photos/seed/heritage1/800/600',
    latitude: 14.4444,
    longitude: 120.9028,
    operatingHours: '8:00 AM - 5:00 PM',
  },
  {
    id: 'site-heritage-002',
    name: 'Fort San Felipe',
    category: 'Heritage',
    municipality: 'Cavite City',
    address: 'Cavite City, Cavite',
    description: 'Spanish-era fort guarding Manila Bay',
    imageUrl: 'https://picsum.photos/seed/heritage2/800/600',
    latitude: 14.4922,
    longitude: 120.9040,
    operatingHours: '8:00 AM - 5:00 PM',
  },
  {
    id: 'site-heritage-003',
    name: 'Battle of Binakayan-Dalahican Monument',
    category: 'Heritage',
    municipality: 'Kawit',
    address: 'Dalahican, Kawit, Cavite',
    description: 'Memorial of revolutionary victory',
    imageUrl: 'https://picsum.photos/seed/heritage3/800/600',
    latitude: 14.4380,
    longitude: 120.8990,
  },
  
  // Festival category
  {
    id: 'site-festival-001',
    name: 'Cavite City Charter Day',
    category: 'Festival',
    municipality: 'Cavite City',
    address: 'Cavite City Plaza',
    description: 'Annual celebration with cultural programs',
    imageUrl: 'https://picsum.photos/seed/fest1/800/600',
    latitude: 14.4791,
    longitude: 120.8973,
  },
];

// Itineraries
export const mockItineraries: Itinerary[] = [
  {
    id: 'itin-001',
    title: 'Day Tour A: Heritage Trail',
    type: 'Day Tour',
    description: 'Explore historical landmarks of Cavite',
    duration: '8 hours',
    imageUrl: 'https://picsum.photos/seed/itin1/800/600',
    siteIds: ['site-heritage-001', 'site-heritage-002', 'site-heritage-003', 'site-dining-001'],
    stops: 4,
  },
  {
    id: 'itin-002',
    title: 'Day Tour B: Tagaytay Escape',
    type: 'Day Tour',
    description: 'Scenic views and local cuisine',
    duration: '10 hours',
    imageUrl: 'https://picsum.photos/seed/itin2/800/600',
    siteIds: ['site-dining-002', 'site-staycation-001', 'site-adventure-001'],
    stops: 3,
  },
  {
    id: 'itin-003',
    title: 'Overnight Tour A: Coastal Adventure',
    type: 'Overnight Tour',
    description: 'Beach resort and water activities',
    duration: '2 days',
    imageUrl: 'https://picsum.photos/seed/itin3/800/600',
    siteIds: ['site-staycation-002', 'site-adventure-002', 'site-dining-001'],
    stops: 3,
  },
  {
    id: 'itin-004',
    title: 'Overnight Tour B: Complete Cavite Experience',
    type: 'Overnight Tour',
    description: 'Mix of heritage, nature, and relaxation',
    duration: '2 days',
    imageUrl: 'https://picsum.photos/seed/itin4/800/600',
    siteIds: ['site-heritage-001', 'site-staycation-001', 'site-adventure-001', 'site-dining-002'],
    stops: 4,
  },
];

// Events
export const mockEvents: Event[] = [
  {
    id: 'event-001',
    title: 'Cavite City Charter Day',
    date: new Date('2027-03-10'),
    endDate: new Date('2027-03-12'),
    location: 'Cavite City Plaza',
    address: 'Plaza Soledad, Cavite City',
    latitude: 14.4791,
    longitude: 120.8973,
    description: 'Three-day celebration of Cavite City\'s charter anniversary',
    imageUrl: 'https://picsum.photos/seed/event1/800/600',
    status: 'happening',
    festivalStamp: {
      pointsBonus: 50,
      available: true,
    },
  },
  {
    id: 'event-002',
    title: 'Regada Water Festival',
    date: new Date('2027-05-14'),
    endDate: new Date('2027-05-15'),
    location: 'Cavite City',
    address: 'Streets of Cavite City',
    latitude: 14.4791,
    longitude: 120.8973,
    description: 'Traditional water-splashing festival celebrating San Roque',
    imageUrl: 'https://picsum.photos/seed/event2/800/600',
    status: 'upcoming',
    festivalStamp: {
      pointsBonus: 50,
      available: true,
    },
  },
  {
    id: 'event-003',
    title: 'Pahimis Festival',
    date: new Date('2027-08-20'),
    endDate: new Date('2027-08-22'),
    location: 'Kawit',
    address: 'Kawit Municipal Hall',
    latitude: 14.4444,
    longitude: 120.9028,
    description: 'Harvest festival showcasing local products',
    imageUrl: 'https://picsum.photos/seed/event3/800/600',
    status: 'upcoming',
  },
];

// Rewards catalog
export const mockRewards: Reward[] = [
  {
    id: 'reward-001',
    title: 'Cavite Heritage Book Collection',
    description: 'Set of 3 books about Cavite history',
    pointsCost: 700,
    imageUrl: 'https://picsum.photos/seed/reward1/400/300',
    available: true,
    limited: false,
  },
  {
    id: 'reward-002',
    title: 'Tagaytay Weekend Staycation',
    description: '2-day resort accommodation with breakfast',
    pointsCost: 1200,
    imageUrl: 'https://picsum.photos/seed/reward2/400/300',
    available: true,
    limited: true,
    remainingClaims: 15,
  },
  {
    id: 'reward-003',
    title: 'Cavite Culinary Tour Voucher',
    description: 'Guided food tour for 2 people',
    pointsCost: 900,
    imageUrl: 'https://picsum.photos/seed/reward3/400/300',
    available: true,
    limited: true,
    remainingClaims: 8,
  },
  {
    id: 'reward-004',
    title: 'Official Cavite Tourism T-Shirt',
    description: 'Limited edition commemorative shirt',
    pointsCost: 700,
    imageUrl: 'https://picsum.photos/seed/reward4/400/300',
    available: true,
    limited: false,
  },
];

// Promo period
export const mockPromoPeriod: PromoPeriod = {
  startDate: new Date('2027-01-01'),
  endDate: new Date('2027-12-31'),
  active: true,
};
```

### API Abstraction Layer

**Location:** `src/data/api.ts`

All data operations exposed through a single API file. Mock implementation returns data after artificial delay (300-800ms random) to simulate network latency:

```typescript
import { User, Site, Stamp, Itinerary, Event, Reward, PromoPeriod, 
         Category, RewardEligibility, ClaimQR } from './types';
import { mockUser, mockSites, mockStamps, mockItineraries, 
         mockEvents, mockRewards, mockPromoPeriod } from './mock-data';

// Utility to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const randomDelay = () => delay(300 + Math.random() * 500);

// Authentication
export async function signIn(email: string, password: string): Promise<User> {
  await randomDelay();
  // Mock: always succeeds
  return mockUser;
}

export async function signUp(
  email: string,
  verificationCode: string,
  name: string,
  address: string,
  password: string
): Promise<User> {
  await randomDelay();
  // Mock: code "123456" succeeds, others fail
  if (verificationCode !== '123456') {
    throw new Error('Invalid verification code');
  }
  return { ...mockUser, email, name, address };
}

export async function sendVerificationCode(email: string): Promise<void> {
  await randomDelay();
  // Mock: always succeeds
}

export async function resetPassword(
  email: string,
  verificationCode: string,
  newPassword: string
): Promise<void> {
  await randomDelay();
  // Mock: code "123456" succeeds
  if (verificationCode !== '123456') {
    throw new Error('Invalid verification code');
  }
}

// User data
export async function getCurrentUser(): Promise<User> {
  await randomDelay();
  return mockUser;
}

export async function updateUser(updates: Partial<User>): Promise<User> {
  await randomDelay();
  return { ...mockUser, ...updates };
}

// Sites
export async function getSites(category?: Category): Promise<Site[]> {
  await randomDelay();
  if (category) {
    return mockSites.filter(site => site.category === category);
  }
  return mockSites;
}

export async function getSiteById(id: string): Promise<Site | null> {
  await randomDelay();
  return mockSites.find(site => site.id === id) || null;
}

export async function searchSites(query: string): Promise<Site[]> {
  await randomDelay();
  const lowerQuery = query.toLowerCase();
  return mockSites.filter(
    site =>
      site.name.toLowerCase().includes(lowerQuery) ||
      site.municipality.toLowerCase().includes(lowerQuery) ||
      site.address.toLowerCase().includes(lowerQuery)
  );
}

// Stamps
export async function getStamps(): Promise<Stamp[]> {
  await randomDelay();
  return mockStamps;
}

export async function collectStamp(siteId: string): Promise<Stamp> {
  await randomDelay();
  // Mock: always succeeds, generates new stamp
  const site = mockSites.find(s => s.id === siteId);
  if (!site) throw new Error('Site not found');
  
  const newStamp: Stamp = {
    id: `stamp-${Date.now()}`,
    userId: mockUser.id,
    siteId: site.id,
    siteName: site.name,
    siteCategory: site.category,
    municipality: site.municipality,
    pointsEarned: POINTS_PER_CATEGORY[site.category],
    collectedAt: new Date(),
  };
  
  return newStamp;
}

// Itineraries
export async function getItineraries(): Promise<Itinerary[]> {
  await randomDelay();
  return mockItineraries;
}

export async function getItineraryById(id: string): Promise<Itinerary | null> {
  await randomDelay();
  return mockItineraries.find(itin => itin.id === id) || null;
}

// Events
export async function getEvents(): Promise<Event[]> {
  await randomDelay();
  return mockEvents;
}

export async function getEventById(id: string): Promise<Event | null> {
  await randomDelay();
  return mockEvents.find(event => event.id === id) || null;
}

// Rewards
export async function getRewards(): Promise<Reward[]> {
  await randomDelay();
  return mockRewards;
}

export async function getRewardById(id: string): Promise<Reward | null> {
  await randomDelay();
  return mockRewards.find(reward => reward.id === id) || null;
}

export async function checkRewardEligibility(
  rewardId: string
): Promise<RewardEligibility> {
  await randomDelay();
  
  const reward = mockRewards.find(r => r.id === rewardId);
  if (!reward) throw new Error('Reward not found');
  
  // Check if user has stamps from all 4 main categories
  const stampCategories = new Set(
    mockStamps
      .filter(s => s.siteCategory !== 'Festival')
      .map(s => s.siteCategory)
  );
  const requiredCategories: Category[] = ['Dining', 'Staycation', 'Adventure', 'Heritage'];
  const missingCategories = requiredCategories.filter(
    cat => !stampCategories.has(cat)
  );
  
  const hasAllCategories = missingCategories.length === 0;
  const hasEnoughPoints = mockUser.points >= reward.pointsCost;
  
  return {
    eligible: hasAllCategories && hasEnoughPoints,
    hasEnoughPoints,
    currentPoints: mockUser.points,
    pointsNeeded: Math.max(0, reward.pointsCost - mockUser.points),
    hasAllCategories,
    missingCategories,
  };
}

export async function generateClaimQR(rewardId: string): Promise<ClaimQR> {
  await randomDelay();
  
  // Mock: generates a claim QR that expires in 15 minutes
  const expiryMinutes = 15;
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
  
  return {
    rewardId,
    userId: mockUser.id,
    qrCode: `CLAIM-${rewardId}-${mockUser.id}-${Date.now()}`,
    expiresAt,
    used: false,
  };
}

// Promo period
export async function getPromoPeriod(): Promise<PromoPeriod> {
  await randomDelay();
  return mockPromoPeriod;
}
```

### React Query Configuration

**Location:** `src/lib/query-client.ts`

Centralized React Query setup with AsyncStorage persistence:

```typescript
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Create persister
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'CAVITE_TOURISM_CACHE',
});

// Configure persistence
persistQueryClient({
  queryClient,
  persister: asyncStoragePersister,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
});
```

**Design Rationale:**
- 5-minute stale time balances freshness with network efficiency
- 24-hour cache keeps data available offline
- 7-day persistence maximum prevents indefinite stale data
- 2 retries handle transient network failures
- Window focus refetch disabled (mobile app context)

## Error Handling

### Error Boundaries

**Component-Level Error Boundary:**

Each major feature area wrapped in error boundary to prevent full app crash:

```typescript
// src/components/ui/ErrorBoundary.tsx
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error reporting service (later)
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <Button
            title="Try Again"
            onPress={() => this.setState({ hasError: false, error: null })}
          />
        </View>
      );
    }

    return this.props.children;
  }
}
```

### API Error Handling

**Standard Error Response:**

All API functions throw typed errors that components can catch and handle:

```typescript
export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Usage in API functions:
export async function signIn(email: string, password: string): Promise<User> {
  try {
    await randomDelay();
    // ... mock logic
    return mockUser;
  } catch (error) {
    throw new ApiError('Failed to sign in', 'AUTH_ERROR', 401);
  }
}
```

### React Query Error Handling

Components using React Query hooks receive error objects:

```typescript
// In a component:
const { data, isLoading, error } = useQuery({
  queryKey: ['sites'],
  queryFn: getSites,
});

if (error) {
  return <ErrorMessage error={error} onRetry={refetch} />;
}
```

### Form Validation Errors

Form inputs display validation errors below the field:

```typescript
<TextInput
  label="Email"
  value={email}
  onChangeText={setEmail}
  error={emailError}  // "Please enter a valid email"
  keyboardType="email-address"
/>
```

## Testing Strategy

### Unit Testing Strategy

Foundation components require comprehensive unit tests to ensure reliability since all features depend on them.

**Test Framework:** Jest with React Native Testing Library

**Component Test Coverage:**
1. **Visual rendering:** Snapshot tests for each component variant
2. **Props interface:** Test all prop combinations
3. **Interaction:** User events (press, text input, etc.)
4. **Accessibility:** Screen reader labels, keyboard navigation
5. **Theme integration:** Verify theme tokens used (no hardcoded values)

**Example Test Structure:**

```typescript
// src/components/ui/__tests__/Button.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  describe('rendering', () => {
    it('renders primary variant correctly', () => {
      const { toJSON } = render(
        <Button title="Test" onPress={() => {}} variant="primary" />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('renders secondary variant correctly', () => {
      const { toJSON } = render(
        <Button title="Test" onPress={() => {}} variant="secondary" />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('renders disabled state correctly', () => {
      const { toJSON } = render(
        <Button title="Test" onPress={() => {}} disabled />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('renders loading state correctly', () => {
      const { toJSON } = render(
        <Button title="Test" onPress={() => {}} loading />
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('interactions', () => {
    it('calls onPress when pressed', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Button title="Test" onPress={onPress} />
      );
      
      fireEvent.press(getByText('Test'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('does not call onPress when disabled', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Button title="Test" onPress={onPress} disabled />
      );
      
      fireEvent.press(getByText('Test'));
      expect(onPress).not.toHaveBeenCalled();
    });

    it('does not call onPress when loading', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <Button title="Test" onPress={onPress} loading testID="button" />
      );
      
      fireEvent.press(getByTestId('button'));
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has accessible label', () => {
      const { getByLabelText } = render(
        <Button title="Submit Form" onPress={() => {}} />
      );
      expect(getByLabelText('Submit Form')).toBeDefined();
    });

    it('indicates disabled state to screen readers', () => {
      const { getByRole } = render(
        <Button title="Test" onPress={() => {}} disabled />
      );
      const button = getByRole('button');
      expect(button).toHaveAccessibilityState({ disabled: true });
    });
  });
});
```

**API Layer Testing:**

```typescript
// src/data/__tests__/api.test.ts
import { getSites, collectStamp } from '../api';
import { mockSites } from '../mock-data';

describe('API Layer', () => {
  describe('getSites', () => {
    it('returns all sites when no category specified', async () => {
      const sites = await getSites();
      expect(sites).toEqual(mockSites);
    });

    it('filters by category when specified', async () => {
      const diningSites = await getSites('Dining');
      expect(diningSites.every(s => s.category === 'Dining')).toBe(true);
    });

    it('simulates network delay', async () => {
      const start = Date.now();
      await getSites();
      const duration = Date.now() - start;
      expect(duration).toBeGreaterThan(300);
    });
  });

  describe('collectStamp', () => {
    it('creates new stamp with correct points', async () => {
      const siteId = 'site-dining-001';
      const stamp = await collectStamp(siteId);
      
      expect(stamp.siteId).toBe(siteId);
      expect(stamp.pointsEarned).toBe(150); // Dining category
      expect(stamp.collectedAt).toBeInstanceOf(Date);
    });

    it('throws error for invalid site ID', async () => {
      await expect(collectStamp('invalid-id')).rejects.toThrow('Site not found');
    });
  });
});
```

### Integration Testing

**Navigation Flow Tests:**

Test that navigation structure works end-to-end:

```typescript
describe('Navigation Integration', () => {
  it('navigates from Explore to Site Detail', async () => {
    const { getByText } = render(<RootLayout />);
    
    // Start on Explore tab
    expect(getByText('Explore')).toBeDefined();
    
    // Tap a site card
    fireEvent.press(getByText('Café Amadeo'));
    
    // Should navigate to site detail
    await waitFor(() => {
      expect(getByText('Site Information')).toBeDefined();
    });
  });

  it('opens scanner from Scan tab button', async () => {
    const { getByTestId } = render(<RootLayout />);
    
    fireEvent.press(getByTestId('scan-tab-button'));
    
    await waitFor(() => {
      expect(getByText('Scan QR Code')).toBeDefined();
    });
  });
});
```

**Theme Integration Tests:**

Verify components use theme tokens:

```typescript
describe('Theme Integration', () => {
  it('Button uses theme colors', () => {
    const { getByTestId } = render(
      <Button title="Test" onPress={() => {}} testID="btn" />
    );
    
    const button = getByTestId('btn');
    const styles = button.props.style;
    
    // Should use theme accent color, not hardcoded
    expect(styles.backgroundColor).toBe(colors.accent);
  });
});
```

### Manual Testing Checklist

Since this is the Foundation, manual testing focuses on visual consistency and performance:

- [ ] All theme tokens render correctly on device
- [ ] Inter font loads and displays properly
- [ ] Custom tab bar matches design (raised center button)
- [ ] Tab navigation smooth with no jank
- [ ] Safe area insets respected on all screens
- [ ] Android back button works on all routes
- [ ] Loading states visible during API delays
- [ ] All placeholder screens accessible
- [ ] No console errors or warnings
- [ ] TypeScript compilation succeeds
- [ ] Lint passes with no errors

## Implementation Notes

### Font Loading Strategy

Inter font must load before showing UI to prevent font flash:

```typescript
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';

// Keep splash visible while fonts load
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Or minimal loading screen
  }

  return <Stack>...</Stack>;
}
```

### Custom Tab Bar Implementation

The raised center Scan button requires custom tab bar:

```typescript
function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const isCenter = index === 2; // Scan tab

          if (isCenter) {
            return (
              <Pressable
                key={route.key}
                style={styles.centerButton}
                onPress={() => router.push('/scanner')}
              >
                <Ionicons name="qr-code" size={32} color="#FFFFFF" />
              </Pressable>
            );
          }

          return (
            <Pressable
              key={route.key}
              style={styles.tab}
              onPress={() => navigation.navigate(route.name)}
            >
              <Ionicons
                name={options.tabBarIcon}
                size={24}
                color={isFocused ? colors.primary : colors.border}
              />
              <Text
                style={[
                  styles.label,
                  { color: isFocused ? colors.primary : colors.textSecondary },
                ]}
              >
                {options.tabBarLabel}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    height: 64,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.tabBar,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    marginLeft: -32,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
  },
  label: {
    ...typography.labelSmall,
    marginTop: 4,
  },
});
```

### TypeScript Configuration

Ensure strict mode enabled in `tsconfig.json`:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### Performance Considerations

**Image Optimization:**
- Use `expo-image` instead of `Image` for better caching
- Implement lazy loading for list images
- Use appropriate image sizes (no unnecessary 4K images)

**List Performance:**
- Use `FlatList` with `getItemLayout` for fixed-height items
- Implement `keyExtractor` for stable keys
- Use `initialNumToRender` appropriate to viewport

**Bundle Size:**
- Tree-shake unused Ionicons (configure in `metro.config.js`)
- Avoid importing entire libraries when only using subset
- Monitor bundle size with `npx expo export` and check output

### Constants File

**Location:** `src/lib/constants.ts`

```typescript
// Open decisions - values TBD by Tourism Office
export const GEOFENCE_DISTANCE_METERS = 100; // TBD

export const CLAIM_QR_EXPIRY_MINUTES = 15; // TBD

export const SITE_QR_FORMAT = 'CAVITE-SITE-{siteId}'; // TBD, placeholder format

// Fixed values
export const APP_VERSION = '1.0.0';

export const TAB_BAR_HEIGHT = 64;

export const HEADER_HEIGHT = 56;

// Limits
export const MAX_SEARCH_RESULTS = 50;
```

---

## Open Questions

1. **Map Provider:** While `@maplibre/maplibre-react-native` and `@protomaps/basemaps` are specified, do we need specific tile URLs or API keys during Foundation setup, or can these be configured later in the Explore spec?

2. **Error Logging Service:** Should Foundation include integration with a crash reporting service (e.g., Sentry), or defer to a later spec?

3. **Offline Behavior:** Beyond React Query caching, should Foundation implement explicit offline mode detection and UI feedback patterns?

4. **Animation Library:** The design mentions animations (e.g., button press, chip selection). Should Foundation include `react-native-reanimated` configuration and base animation utilities, or handle per-component in feature specs?

5. **Deep Linking:** Should Foundation configure deep link handling for the Expo Router setup, or defer to specific feature specs that need it (e.g., sharing site links)?

---

**Document Status:** ✅ Ready for Review  
**Author:** Kiro AI  
**Last Updated:** 2027-03-15
