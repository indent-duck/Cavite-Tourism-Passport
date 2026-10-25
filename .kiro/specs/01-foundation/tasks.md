# Implementation Plan: Foundation

## Overview

The Foundation establishes the technical architecture for the Cavite Tourism Passport app. This includes the theme system with design tokens, seven shared UI components, Expo Router navigation structure with a custom tab bar, data layer scaffolding with mock data, and React Query configuration. All implementation is in TypeScript with strict mode enabled.

## Tasks

- [x] 1. Set up project structure and theme system
  - Create `src/theme/index.ts` with all design tokens (colors, spacing, typography, radii, shadows)
  - Export color palette (primary, accent, background, surface, text, textSecondary, success, error, border, passportLeather, passportFoil)
  - Export spacing scale (xs: 4px through huge: 48px)
  - Export typography scale with Inter font family (displayLarge, headlineLarge, bodyMedium, labelSmall, etc.)
  - Export border radii (card: 16, button: 24, chip: 16, input: 12, full: 9999)
  - Export shadow elevations (card, button, tabBar with iOS/Android properties)
  - _Requirements: 1.1 (Theme System)_

- [x] 2. Install and configure dependencies
  - [x] 2.1 Install required dependencies
    - Run `npx expo install @expo-google-fonts/inter expo-font expo-splash-screen`
    - Run `npx expo install @tanstack/react-query @tanstack/react-query-persist-client @tanstack/query-async-storage-persister @react-native-async-storage/async-storage`
    - Run `npx expo install expo-haptics @expo/vector-icons`
    - Run `npx expo install expo-camera expo-location @gorhom/bottom-sheet`
    - Run `npx expo install @maplibre/maplibre-react-native @protomaps/basemaps`
    - Run `npx expo install @supabase/supabase-js`
    - _Requirements: 1.5 (Dependencies)_

  - [x] 2.2 Remove unwanted dependencies
    - Remove `react-native-web`, `react-dom`, and `expo-symbols` from package.json if present
    - _Requirements: 1.5 (Dependencies)_

- [x] 3. Create data layer foundation
  - [x] 3.1 Define all TypeScript types
    - Create `src/data/types.ts` with all domain types
    - Define User, Category, Site, Stamp, Itinerary, Event, Reward, RewardEligibility, ClaimQR, PromoPeriod interfaces
    - Export POINTS_PER_CATEGORY constant (Dining: 150, Staycation: 200, Adventure: 100, Heritage: 50, Festival: 50)
    - _Requirements: 1.4.1 (Type Definitions)_

  - [x] 3.2 Create mock data matching requirements
    - Create `src/data/mock-data.ts` with sample data
    - Mock user: Juan Dela Cruz, CVT-2027-000123, 450 pts, 4 stamps (1 Dining, 1 Staycation, 2 Heritage)
    - Mock sites: diverse set across Dining, Staycation, Adventure, Heritage categories with realistic Cavite locations
    - Mock itineraries: 4 tours (2 day tours, 2 overnight tours)
    - Mock events: 3 festivals/events with varying statuses
    - Mock rewards: 4 rewards, each costing at least 700 pts, with varying availability
    - Mock promo period: Jan 1 to Mar 31, 2027
    - _Requirements: 1.4.2 (Mock Data Store), 2.1.3, 2.5.1, 2.6.1, 2.6.2, 2.7.1_

  - [x] 3.3 Create API abstraction layer
    - Create `src/data/api.ts` with all API functions
    - Implement mock functions with 300-800ms artificial delay
    - Authentication: signIn, signUp, verifyCode (code "123456" succeeds), sendVerificationCode, resetPassword
    - User data: getCurrentUser, updateUser
    - Sites: getSites (with optional category filter), getSiteById, searchSites
    - Stamps: getStamps, collectStamp
    - Itineraries: getItineraries, getItineraryById
    - Events: getEvents, getEventById
    - Rewards: getRewards, getRewardById, checkRewardEligibility, generateClaimQR
    - Promo: getPromoPeriod
    - _Requirements: 1.4.3 (API Abstraction Layer), 2.1.2, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [x] 3.4 Configure React Query with persistence
    - Create `src/lib/query-client.ts`
    - Configure QueryClient with staleTime (5 min), gcTime (24 hours), retry (2)
    - Set up AsyncStorage persister with 7-day maxAge
    - Configure persistence with persistQueryClient
    - Export queryClient instance
    - _Requirements: 1.4.4 (React Query Configuration)_

  - [x] 3.5 Create constants file
    - Create `src/lib/constants.ts`
    - Define GEOFENCE_DISTANCE_METERS = 150 with TBD comment
    - Define CLAIM_QR_EXPIRY_MINUTES = 15 with TBD comment
    - Define SITE_QR_FORMAT placeholder with TBD comment
    - Define APP_VERSION, TAB_BAR_HEIGHT, HEADER_HEIGHT, MAX_SEARCH_RESULTS
    - _Requirements: 1.4.5 (Constants)_

  - [x] 3.6 Clean up template files and prepare for UI components
    - Delete `src/components/app-tabs.web.tsx` and any other `*.web.tsx` files
    - Delete `src/app/explore.tsx` (the real Explore is created in task 5.3)
    - Replace `src/app/index.tsx` with a redirect to `/(auth)/login`
    - Rewrite `src/components/ui/collapsible.tsx` with `@expo/vector-icons`
    - Do NOT reinstall `expo-symbols` (iOS-only, removed on purpose)
    - Delete unused template files and move anything needed into `src/theme`
    - Run `npx tsc --noEmit` and `npx expo lint` until both pass
    - _Requirements: Clean foundation for UI components_

- [x] 4. Implement shared UI components
  - [x] 4.1 Create Button component
    - Create `src/components/ui/Button.tsx`
    - Implement ButtonProps interface (title, onPress, variant, disabled, loading, fullWidth, size, icon, testID)
    - Implement four variants: accent (orange solid), primary (navy solid), outline (transparent with border), text (transparent)
    - Heights: 48px default, 40px compact
    - Pill shape (24px border radius)
    - Loading state with spinner replacing text
    - Disabled state with 40% opacity
    - Use TouchableOpacity with haptic feedback
    - Import and use theme tokens only (no hardcoded values)
    - _Requirements: 1.2.1 (Button Component)_

  - [x] 4.2 Create TextInput component
    - Create `src/components/ui/TextInput.tsx`
    - Implement TextInputProps interface (label, value, onChangeText, placeholder, error, secureTextEntry, keyboardType, autoCapitalize, editable, multiline, numberOfLines, testID)
    - Container height: 56px (single line), auto (multiline)
    - Background: surface color (#F4F6FA)
    - Border: 1px transparent default, 1.5px primary when focused, 1.5px error when error
    - Label above input with 4px spacing
    - Error message below input with 4px spacing
    - 12px border radius, 16px padding
    - _Requirements: 1.2.2 (TextInput Component)_

  - [x] 4.3 Create Card component
    - Create `src/components/ui/Card.tsx`
    - Implement CardProps interface (children, onPress, style, testID)
    - White background, 16px radius, card shadow from theme
    - 16px padding all sides
    - Conditionally wrap in Pressable if onPress provided
    - Press feedback: scale to 0.98 with spring animation
    - _Requirements: 1.2.3 (Card Component)_

  - [x] 4.4 Create Chip component
    - Create `src/components/ui/Chip.tsx`
    - Implement ChipProps interface (label, selected, onPress, icon, size, testID)
    - Height: 36px default, 32px small
    - Pill shape with 16px border radius
    - Unselected: white background, border, text primary color
    - Selected: primary blue background, white text, no border
    - Padding: 12px horizontal (default), 8px horizontal (small)
    - Icon with 6px spacing from text, tinted to match text color
    - Use Pressable with haptic feedback
    - _Requirements: 1.2.4 (Chip Component)_

  - [x] 4.5 Create StepIndicator component
    - Create `src/components/ui/StepIndicator.tsx`
    - Implement StepIndicatorProps interface (currentStep 1-indexed, totalSteps, labels, testID)
    - Match design shown in `design/screens/01-auth/signup-email.png`
    - Use plain Views for the step circles and connector lines (no FlatList)
    - Horizontal layout with equal spacing
    - Step circles: 32px diameter
    - Active step: primary blue background, white text
    - Completed step: success green background, white checkmark
    - Upcoming step: 1px border only, text secondary color
    - Connector lines: 1px height, border color, 8px length
    - Optional labels below circles with 4px spacing
    - _Requirements: 1.2.5 (StepIndicator Component)_

  - [x] 4.6 Create ScreenContainer component
    - Create `src/components/ui/ScreenContainer.tsx`
    - Implement ScreenContainerProps interface (children, scrollable, showHeader, headerTitle, onBackPress, contentContainerStyle, withTabBarPadding, edges, testID)
    - Wrap in SafeAreaView from `react-native-safe-area-context` with configurable `edges` prop
    - Default edges: ['top', 'left', 'right']
    - Inside `(tabs)` routes, pass edges=['left', 'right'] only (no 'top' since Header applies it, no 'bottom' since withTabBarPadding applies it)
    - Background: background color from theme
    - Optional header (56px height) with back button and title
    - Conditionally render ScrollView or View based on scrollable prop
    - Add bottom padding when `withTabBarPadding` prop is true: TAB_BAR_HEIGHT plus the bottom safe area inset
    - This prop is only used inside `(tabs)` routes
    - Use KeyboardAvoidingView for Android keyboard handling
    - Back button uses Ionicons 'arrow-back'
    - _Requirements: 1.2.6 (ScreenContainer Component)_

  - [x] 4.7 Create Header component
    - Create `src/components/ui/Header.tsx`
    - Implement HeaderProps interface (userName, points, onPointsPress, rightSlot, testID)
    - Match design shown in `design/screens/05-passport`
    - Content height: 72px, plus top safe area inset applied internally
    - White background with bottom shadow
    - Apply top safe area inset inside the Header component itself
    - Left-aligned layout with the user name on the first line, then a star icon and points in orange (accent color) on the second line
    - User name: titleMedium style, text color
    - Points row: star icon (Ionicons 'star'), 4px spacing, points text in bodyMedium style with accent color, pressable with haptic feedback
    - 2px spacing between name line and points line
    - Optional `rightSlot` prop for rendering additional content (like the promo chip) in the top-right corner
    - Fixed positioning for scrollable screens
    - _Requirements: 1.2.7 (Header Component)_

  - [x] 4.8 Create PromoChip component
    - Create `src/components/ui/PromoChip.tsx`
    - Implement PromoChipProps interface (testID)
    - Match design shown in `design/screens/05-passport`
    - Rounded chip shape (16px border radius)
    - White background with subtle border
    - Display green dot (8px diameter) followed by formatted promo period text (e.g., "Promo: Jan 1 - Mar 31, 2027")
    - Use usePromoPeriod hook (task 4.9) to fetch promo data and format the display text from the data (no hardcoded dates)
    - 8px padding horizontal, 6px padding vertical
    - bodySmall text style from theme
    - 4px spacing between dot and text
    - _Requirements: 1.2.8 (PromoChip Component)_

  - [x] 4.9 Create data hooks
    - Create `src/hooks/useCurrentUser.ts` as a React Query hook wrapping getCurrentUser from api.ts
    - Create `src/hooks/usePromoPeriod.ts` as a React Query hook wrapping getPromoPeriod from api.ts
    - Both hooks use queryClient from task 3.4
    - useCurrentUser returns user data with loading and error states
    - usePromoPeriod returns promo period data with loading and error states
    - _Requirements: 1.2.9 (Data Hooks)_

- [x] 5. Set up Expo Router navigation structure
  - [x] 5.1 Configure root layout
    - Create `src/app/_layout.tsx`
    - Import and load Inter fonts (400, 500, 600, 700 weights)
    - Manage splash screen: prevent auto-hide, hide when fonts loaded
    - Wrap in QueryClientProvider with queryClient
    - Render Stack navigator with headerShown: false
    - Configure all root-level screen routes
    - _Requirements: 1.3.1 (Root Layout)_

  - [x] 5.2 Create auth group routes
    - Create `src/app/(auth)/_layout.tsx` with Stack navigator, no header, gestures enabled
    - Create `src/app/(auth)/login.tsx` placeholder with ScreenContainer
    - Create `src/app/(auth)/signup/email.tsx` placeholder
    - Create `src/app/(auth)/signup/verify.tsx` placeholder
    - Create `src/app/(auth)/signup/details.tsx` placeholder
    - Create `src/app/(auth)/forgot/email.tsx` placeholder
    - Create `src/app/(auth)/forgot/verify.tsx` placeholder
    - Create `src/app/(auth)/forgot/new-password.tsx` placeholder
    - Create `src/app/(auth)/forgot/success.tsx` placeholder
    - _Requirements: 1.3.2 (Auth Layout)_

  - [x] 5.3 Create custom tab bar and tabs group
    - Create `src/app/(tabs)/_layout.tsx` with custom tab bar component
    - Render the Header component from task 4.7 inside the tabs layout, positioned at the top
    - Header uses useCurrentUser hook (task 4.9) to display user name and points
    - Header's onPointsPress navigates to `/rewards`
    - Display the PromoChip component (task 4.8) via the Header's `rightSlot` prop on Explore and Passport tabs only
    - Implement CustomTabBar function component with 5 tabs
    - Tab bar: content height 64px plus bottom safe area inset applied internally, white background, 1px top border, subtle shadow
    - Regular tabs: Explore, Passport, Discover, Account with icons and labels
    - Center Scan tab: 64px diameter orange circular button, raised 16px above baseline
    - Scan button opens `/scanner` route instead of showing scan.tsx screen
    - Active tabs: primary blue color, inactive: gray
    - Use Ionicons for all tab icons
    - Haptic feedback on tab press
    - Create `src/app/(tabs)/explore.tsx` placeholder
    - Create `src/app/(tabs)/passport.tsx` placeholder
    - Create `src/app/(tabs)/scan.tsx` placeholder (not shown in UI)
    - Create `src/app/(tabs)/discover.tsx` placeholder
    - Create `src/app/(tabs)/account.tsx` placeholder
    - _Requirements: 1.3.3 (Tabs Layout), 3.4 (Custom Tab Bar Implementation)_

  - [x] 5.4 Create remaining root-level routes
    - Create `src/app/scanner.tsx` placeholder
    - Create `src/app/sites/[id].tsx` placeholder with dynamic route parameter
    - Create `src/app/itineraries/[id].tsx` placeholder
    - Create `src/app/events/[id].tsx` placeholder
    - Create `src/app/rewards/index.tsx` placeholder
    - Create `src/app/rewards/[id].tsx` placeholder
    - Create `src/app/settings.tsx` placeholder
    - _Requirements: 1.3.4 (Other Routes)_

- [x] 6. Configure TypeScript and verify setup
  - Ensure `tsconfig.json` has strict mode enabled
  - Verify `baseUrl: "."` and `paths: { "@/*": ["src/*"] }` are configured
  - Run `npx tsc --noEmit` to verify no TypeScript errors
  - _Requirements: 1.6 (TypeScript Configuration)_

- [x] 7. Checkpoint - Verify foundation is complete
  - Verify Inter font loads correctly across all screens
  - Verify custom tab bar renders with raised center Scan button
  - Tap each tab and verify navigation works
  - Tap Scan button and verify it opens `/scanner` route
  - Verify all placeholder screens are accessible
  - Run `npx expo lint` and ensure it passes
  - Run `npx tsc --noEmit` and ensure no TypeScript errors
  - Manually test on a physical Android phone
  - Verify safe area insets are respected
  - Verify Android back button works on all routes
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All route files use default exports (Expo Router requirement)
- All other modules use named exports
- Route files stay thin - just ScreenContainer with placeholder content for now
- Theme tokens are the single source of truth for all styling
- Mock data matches the sample user from product.md exactly (Juan Dela Cruz, 450 pts, 4 stamps from Dining, Staycation, and 2 Heritage)
- Sites cover only Dining, Staycation, Adventure, Heritage categories
- Promo period is Jan 1 to Mar 31, 2027
- Every reward costs at least 700 pts
- API functions include artificial delay (300-800ms) to simulate loading states
- verifyCode function: code "123456" succeeds
- GEOFENCE_DISTANCE_METERS = 150, still marked TBD
- Custom tab bar requires manual implementation - not using default Tabs.Screen
- TAB_BAR_HEIGHT constant = 64px
- Tab bar content height is 64px plus the bottom safe area inset (applied internally)
- Header content height is 72px plus the top safe area inset (applied internally)
- Scan tab button opens `/scanner` route instead of showing the scan.tsx screen
- All components use TypeScript strict mode (no `any` types)
- Use `@/` import alias for `src/` imports
- Bottom padding for tab bar is controlled via the `withTabBarPadding` prop in ScreenContainer (only used inside `(tabs)` routes)
- Button variants are: accent (orange), primary (navy), outline, and text
- StepIndicator uses plain Views matching the design, not FlatList
- Header is left-aligned with name on first line, star icon + points on second line, and optional rightSlot for the promo chip
- Header applies the top safe-area inset itself
- ScreenContainer accepts an `edges` prop; screens inside (tabs) pass edges=['left', 'right'] only (no 'top' since Header applies it, no 'bottom' since withTabBarPadding applies it)
- PromoChip (task 4.8) uses usePromoPeriod hook (task 4.9) and formats the text from the data with no hardcoded dates
- Header (task 5.3) uses useCurrentUser hook (task 4.9), and onPointsPress navigates to /rewards
- Testing and error boundaries will be added in feature-specific specs

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1", "2.1", "2.2"]
    },
    {
      "id": 1,
      "tasks": ["3.1", "3.5"]
    },
    {
      "id": 2,
      "tasks": ["3.2", "3.3", "3.4", "3.6"]
    },
    {
      "id": 3,
      "tasks": ["4.1", "4.2", "4.3", "4.4", "4.5", "4.6", "4.7", "4.9", "5.1"]
    },
    {
      "id": 4,
      "tasks": ["4.8", "5.2"]
    },
    {
      "id": 5,
      "tasks": ["5.3", "5.4", "6"]
    },
    {
      "id": 6,
      "tasks": ["7"]
    }
  ]
}
```
