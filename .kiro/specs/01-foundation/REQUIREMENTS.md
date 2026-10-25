# Foundation Spec

## Overview

Foundation establishes the visual design system, core UI components, routing structure, and data layer scaffolding for the Cavite Tourism Passport app. This spec contains no screen-specific content—only the reusable foundation that all features will build upon.

## Scope

### 1. Theme System (`src/theme/`)
Design tokens matching the Stitch designs:
- **Colors**: primary `#004987`, accent `#F47B20`, background `#FFFFFF`, surface `#F4F6FA`, text `#1B2A49`, secondary text `#6B7280`, success `#2E9E5B`, error `#D64545`, border `#E5E7EB`
- **Spacing**: 4, 8, 12, 16, 20, 24, 32, 40, 48px scale
- **Typography**: Inter font family (via `@expo-google-fonts/inter`), defined scale with weights (400 regular, 500 medium, 600 semibold, 700 bold)
- **Radii**: card 16px, button 24px (pill), chip 16px, input 12px
- **Shadows**: subtle elevation for cards and modals

### 2. Shared UI Components (`src/components/ui/`)

#### Button
Variants: `primary` (filled orange), `secondary` (outlined blue), `text` (no background)
- Props: `title`, `onPress`, `variant`, `disabled`, `loading`, `fullWidth`
- Heights: 48px (default), 40px (compact)
- Pill shape (rounded ends)
- Loading spinner replaces text when `loading={true}`

#### TextInput
- Props: `label`, `value`, `onChangeText`, `placeholder`, `error`, `secureTextEntry`, `keyboardType`, `autoCapitalize`, `editable`
- States: default, focused (blue border), error (red border with error message below)
- Height: 56px
- Rounded: 12px
- Label above input

#### Card
- Props: `children`, `onPress` (optional, makes it touchable), `style`
- White background, 16px radius, subtle shadow
- Padding: 16px default

#### Chip
- Props: `label`, `selected`, `onPress`, `icon` (optional)
- Pill shape, 16px radius
- States: default (light gray), selected (orange with white text)
- Height: 36px
- Used for category filters and toggles

#### StepIndicator
- Props: `currentStep` (1-indexed), `totalSteps`, `labels` (optional array of step names)
- Horizontal dots or numbered circles
- Shows progress through multi-step flows (signup, forgot password)

#### ScreenContainer
- Props: `children`, `scrollable` (boolean, default true), `showHeader` (boolean, default false), `headerTitle`, `onBackPress`
- Wraps all screens with safe area handling
- If `scrollable`, renders ScrollView with bottom padding for tab bar clearance
- If `showHeader`, renders a header with back button and title
- Background color: `background` token

#### Header
- Props: `userName`, `points`, `onPointsPress`
- Displays user name with points below (e.g., "Juan Dela Cruz\n450 pts")
- Tapping points opens Rewards screen
- Used on main tab screens (Explore, Passport, Discover, Account)
- Positioned at top of screen, white background, shadow

### 3. Routing Structure (`app/`)

#### Root Layout (`app/_layout.tsx`)
- Stack navigator wrapping entire app
- No header (screens manage their own)
- Loads Inter font with splash screen handling

#### Auth Group (`app/(auth)/_layout.tsx` and routes)
- Stack navigator for auth flows
- Routes (all placeholder screens):
  - `login.tsx`
  - `signup/email.tsx`
  - `signup/verify.tsx`
  - `signup/details.tsx`
  - `forgot/email.tsx`
  - `forgot/verify.tsx`
  - `forgot/new-password.tsx`
  - `forgot/success.tsx`

#### Tabs Group (`app/(tabs)/_layout.tsx` and routes)
- Custom bottom tab bar (fully opaque white background, subtle top border)
- 5 tabs with custom layout:
  - **Explore** (icon: compass) → `explore.tsx`
  - **Passport** (icon: book) → `passport.tsx`
  - **Scan** (icon: qr-code, raised orange circular button, 64px diameter) → placeholder `scan.tsx`, but tab button opens `/scanner` instead
  - **Discover** (icon: calendar) → `discover.tsx`
  - **Account** (icon: person) → `account.tsx`
- Tab bar height: 64px + safe area bottom inset
- Active tab: primary blue, Inactive: gray
- Center Scan button is elevated above the tab bar with shadow

#### Other Routes (all placeholder screens at root level)
- `scanner.tsx` (opens from Scan tab button)
- `sites/[id].tsx`
- `itineraries/[id].tsx`
- `events/[id].tsx`
- `rewards/index.tsx`
- `rewards/[id].tsx`
- `settings.tsx` (opens from Account gear icon)

### 4. Data Layer Scaffolding

#### Types (`src/data/types.ts`)
Core types for the domain model:
- `User`: id, email, name, address, passportId, points, createdAt
- `Category`: 'Dining' | 'Staycation' | 'Adventure' | 'Heritage' | 'Festival'
- `Site`: id, name, category, municipality, address, description, imageUrl, latitude, longitude
- `Stamp`: id, siteId, siteName, category, pointsEarned, collectedAt
- `Itinerary`: id, title, description, duration, imageUrl, siteIds
- `Event`: id, title, date, location, description, imageUrl
- `Reward`: id, title, description, pointsCost, imageUrl, available, limited
- `PromoPeriod`: startDate, endDate
- Additional supporting types as needed

#### Mock Data (`src/data/mock-data.ts`)
Sample data matching the user from `product.md`:
- User: Juan Dela Cruz, Passport ID `CVT-2027-000123`, 450 pts
- 4 stamps: 1 Dining (150 pts), 1 Staycation (200 pts), 2 Heritage (50 pts each), 0 Adventure, 1 Festival (50 pts bonus)
- Collection of sites across all categories
- Several itineraries
- Multiple events
- Rewards catalog with various point requirements
- Current promo period

#### API Layer (`src/data/api.ts`)
Mock functions that return mock data after artificial delay (300-800ms to show loading states):
- `getCurrentUser()` → User
- `getSites(category?: Category)` → Site[]
- `getStamps()` → Stamp[]
- `getItineraries()` → Itinerary[]
- `getEvents()` → Event[]
- `getRewards()` → Reward[]
- `getPromoPeriod()` → PromoPeriod
- `signUp(email, code, name, address, password)` → User (mock: any email, code `123456` succeeds)
- `signIn(email, password)` → User (mock: always succeeds)
- `collectStamp(siteId)` → Stamp (mock: always succeeds)
- All return Promises with setTimeout to simulate network delay

#### React Query Setup (`src/lib/query-client.ts`)
- Configure QueryClient with persistence using AsyncStorage
- Default staleTime, cacheTime
- Persistence configuration with `@tanstack/query-async-storage-persister`
- Export configured `queryClient` instance

#### Constants (`src/lib/constants.ts`)
Placeholder values for open decisions:
- `GEOFENCE_DISTANCE_METERS = 100` (with comment: TBD by Tourism Office)
- `CLAIM_QR_EXPIRY_MINUTES = 15` (with comment: TBD by Tourism Office)
- `SITE_QR_FORMAT = 'CAVITE-SITE-{siteId}'` (with comment: TBD, placeholder format)

### 5. Dependencies

#### Add
- `@expo-google-fonts/inter` (Inter font)
- `@tanstack/react-query`
- `@tanstack/react-query-persist-client`
- `@tanstack/query-async-storage-persister`
- `@react-native-async-storage/async-storage`
- `expo-camera` (for scanner, later)
- `expo-location` (for geofencing, later)
- `expo-haptics` (for feedback)
- `@expo/vector-icons` (for icons)
- `@gorhom/bottom-sheet` (for modals, later)
- `@maplibre/maplibre-react-native` (for maps, later)
- `@protomaps/basemaps` (for map tiles, later)
- `@supabase/supabase-js` (installed but not wired)

#### Remove
- `react-native-web`
- `react-dom`
- `expo-symbols`

Use `npx expo install <package>` to ensure SDK compatibility.

### 6. Visual Reference

Match styling from these design screens:
- Tab bar: `02-explore/explore.png` (bottom navigation bar)
- Header with user/points: `02-explore/explore.png` (top header)
- Cards: `02-explore/explore.png` (site cards), `05-passport/passport.png` (passport summary card)
- Buttons: `01-auth/login.png` (primary button)
- Inputs: `01-auth/login.png` (text fields with labels)
- Chips: `02-explore/explore.png` (category filter chips, though those screens aren't built yet—infer from description)

Note: Images are 2x exports (780px width = 390px at 1x). HTML files show exact spacing, but rebuild with React Native StyleSheet, not Tailwind.

## Out of Scope

- Screen-specific content (site lists, passport display, scanner logic, etc.)
- Real authentication or backend integration
- Permission handling (scanner permission screens come in Scanner spec)
- Map view implementation (comes in Explore spec)
- Bottom sheet modals (comes in Scanner spec)
- QR code generation (comes in Rewards spec)

## Acceptance Criteria

- [ ] Theme tokens exported from `src/theme/index.ts` with all colors, spacing, typography, radii
- [ ] Inter font loaded and used app-wide
- [ ] All 7 UI components implemented with proper TypeScript props
- [ ] All placeholder route files created with basic ScreenContainer wrappers
- [ ] Auth stack group with all 8 auth routes
- [ ] Tabs group with custom tab bar and raised center Scan button
- [ ] Tab bar matches design: white, opaque, 64px height, raised orange Scan button
- [ ] Header component shows user name and points, tappable
- [ ] All data types defined in `types.ts`
- [ ] Mock data for sample user Juan with 4 stamps and 450 points
- [ ] All API functions return mocked data with delay
- [ ] React Query configured with AsyncStorage persistence
- [ ] Constants file with placeholder values
- [ ] `react-native-web`, `react-dom`, and `expo-symbols` removed from package.json
- [ ] App runs without errors: `npx expo start`
- [ ] Lint passes: `npx expo lint`
- [ ] TypeScript check passes: `npx tsc --noEmit`

## Dependencies

#[[file:design/screens/README.md]]
#[[file:docs/app.md]]
#[[file:.kiro/steering/tech.md]]
#[[file:.kiro/steering/structure.md]]
#[[file:.kiro/steering/product.md]]

## Notes

- Keep route files thin—just ScreenContainer with placeholder text for now
- Theme should be the single source of truth for all styling values
- Mock data should match the sample user described in product.md exactly
- API delay simulates loading states so they can be designed properly
- Custom tab bar requires manual implementation with `tabBar` prop on Tab.Navigator
