# Requirements: Settings

## 1. User Stories

### 1.1 Push Notifications Toggle
As a tourist, I want to turn push notifications on or off so that I can control whether the app sends me alerts about new stamps, events, and promo deadlines.

### 1.2 FAQs and Help
As a tourist, I want to view frequently asked questions about stamp collection, points, rewards, and technical troubleshooting so that I can get help without contacting support.

### 1.3 Official Tourism Links
As a tourist, I want quick access to the official pages of Biyaheng South, Cavite Tourism, DOT IV-A, and DILG IV-A so that I can explore more tourism resources.

### 1.4 App Information
As a tourist, I want to see the app version so that I know which version I'm using when reporting issues or checking for updates.

## 2. Functional Requirements

### 2.1 Navigation
- 2.1.1 The Settings screen MUST be accessible from the Account screen via a gear icon or a "Settings & Preferences" row
- 2.1.2 The Settings screen MUST have a back arrow that returns to the Account screen
- 2.1.3 The Android back button MUST return to the Account screen from Settings

### 2.2 Push Notifications
- 2.2.1 The Settings screen MUST display a toggle switch for push notifications
- 2.2.2 The toggle MUST store its state persistently via `getSettings` and `updateSettings` API functions
- 2.2.3 The toggle MUST be visually distinguishable in on and off states (color change, position change)
- 2.2.4 The toggle MUST NOT request OS-level notification permissions (handled separately)
- 2.2.5 The push notifications toggle MUST be the ONLY notification control (no category-specific toggles)
- 2.2.6 The Settings screen MUST display a "Location Services" status indicator showing "Active" with a green badge
- 2.2.7 The Location Services indicator MUST be read-only (not a toggle)

### 2.3 FAQs and Help
- 2.3.1 The Settings screen MUST display an accordion of frequently asked questions
- 2.3.2 Each FAQ item MUST show a question title and an expandable answer
- 2.3.3 Tapping an FAQ item MUST expand or collapse its answer with an animated chevron indicator
- 2.3.4 The FAQ content MUST come from `src/data/mock-data.ts`
- 2.3.5 The FAQ answers about points MUST match the rules in `docs/app.md`:
  - Dining = 150 points
  - Staycation = 200 points
  - Adventure = 100 points
  - Heritage = 50 points
  - Festival = 50 points (bonus only)
- 2.3.6 The FAQ answers about rewards MUST match the rules in `docs/app.md`:
  - Requires at least 700 points AND at least one stamp from each of Dining, Staycation, Adventure, and Heritage
  - One prize per person per promo period
- 2.3.7 The FAQ answers MUST NOT mention the geofence distance or claim QR expiry (TBD values)

### 2.4 Official Tourism Links
- 2.4.1 The Settings screen MUST display exactly four social links: Biyaheng South, Cavite Tourism, DOT IV-A, and DILG IV-A
- 2.4.2 Each link MUST show an icon, title, subtitle, and external link indicator
- 2.4.3 The URLs for each link MUST be stored in `src/lib/constants.ts` as TBD placeholders
- 2.4.4 Tapping a link MUST open the URL using `expo-web-browser` or `expo-linking` (both already installed)
- 2.4.5 Links MUST open in an external browser or in-app browser (not navigate within the app)

### 2.5 App Version
- 2.5.1 The Settings screen MUST display the app version from `APP_VERSION` in `src/lib/constants.ts`
- 2.5.2 The version display MUST be at the bottom of the Settings screen

### 2.6 Data Flow
- 2.6.1 The Settings screen MUST NEVER import `api.ts` or `mock-data.ts` directly
- 2.6.2 Settings data MUST flow through a hook in `src/hooks` that calls functions in `src/data/api.ts`
- 2.6.3 The `api.ts` functions MUST return mock data with artificial delays (300-800ms)
- 2.6.4 All shared types MUST live in `src/data/types.ts`

## 3. Non-Functional Requirements

### 3.1 UI and Styling
- 3.1.1 The Settings screen MUST use React Native `StyleSheet` with tokens from `src/theme`
- 3.1.2 No colors, spacing, radii, or font sizes MUST be hardcoded in components
- 3.1.3 The Settings screen MUST match the visual design in `design/screens/11-settings/settings.png`
- 3.1.4 The Settings screen MUST NOT include any features not shown in the design image or `docs/app.md`:
  - No language selection
  - No dark mode toggle
  - No change password option
  - No delete account option
  - No notification categories (only one toggle for all notifications)

### 3.2 Safe Areas and Tab Bar
- 3.2.1 The Settings screen MUST respect safe areas (top, bottom, left, right)
- 3.2.2 The Settings screen MUST check if the tab bar is visible in the design image:
  - If the tab bar is visible, the route MUST be nested inside `(tabs)`
  - If the tab bar is NOT visible, the route MUST be a root-level route
- 3.2.3 Scrollable content MUST have bottom padding so the tab bar never covers content (if nested in tabs)

### 3.3 Android Compatibility
- 3.3.1 The Settings screen MUST handle the Android back button correctly (return to Account)
- 3.3.2 The Settings screen MUST be tested on a physical Android phone only (no emulator)

### 3.4 No Native Packages
- 3.4.1 The Settings screen MUST NOT install any new native packages
- 3.4.2 The Settings screen MUST use only the packages already in the project

## 4. Acceptance Criteria

### 4.1 Navigation Works
- Given the user is on the Account screen
- When the user taps the gear icon or "Settings & Preferences" row
- Then the Settings screen opens with a back arrow
- And the Android back button returns to Account

### 4.2 Push Notifications Toggle Works
- Given the Settings screen is open
- When the user taps the push notifications toggle
- Then the toggle switches between on and off states
- And the state is saved via `updateSettings` API function
- And the state persists after closing and reopening the app

### 4.3 FAQs Expand and Collapse
- Given the Settings screen is open with the FAQ accordion
- When the user taps an FAQ question
- Then the answer expands with an animated chevron
- And tapping again collapses the answer
- And the FAQ content comes from `src/data/mock-data.ts`
- And the answers match the rules in `docs/app.md`

### 4.4 Official Links Open Externally
- Given the Settings screen is open with the four social links
- When the user taps a link (e.g., "Biyaheng South")
- Then the link opens in an external or in-app browser
- And the URL comes from `src/lib/constants.ts`

### 4.5 App Version Displays
- Given the Settings screen is open
- When the user scrolls to the bottom
- Then the app version is visible
- And the version matches `APP_VERSION` from `src/lib/constants.ts`

### 4.6 Settings Data Persists
- Given the user toggles push notifications to off
- When the user closes the app and reopens it
- Then the push notifications toggle is still off

## 5. Out of Scope

- OS-level notification permission requests (handled separately with `expo-notifications` in a future spec)
- Language selection (not in the design or `docs/app.md`)
- Dark mode toggle (not in the design or `docs/app.md`)
- Change password option (not in the design or `docs/app.md`)
- Delete account option (not in the design or `docs/app.md`)
- Notification category toggles (only one toggle for all notifications)
- Actual push notification delivery (mock only)
- Final URLs for social links (TBD placeholders in constants)
