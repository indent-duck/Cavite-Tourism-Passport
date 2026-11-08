# Requirements: Passport

## Functional Requirements

### 1. Data Layer

**1.1 Data Hooks**
- useStamps hook: fetches stamps array from api.ts
- useSites hook: fetches sites array from api.ts
- useEvents hook: fetches events array from api.ts (reuse if exists)
- All hooks return data with loading and error states using React Query

**1.2 Constants and Theme Tokens**
- PASSPORT_ISSUER_LINE = "Province of Cavite" (TBD)
- PASSPORT_SUBTITLE = "Official Passport" (TBD)
- PASSPORT_HEADER_LABEL = "PASSPORT" (TBD)
- PASSPORT_STAMPS_TITLE = "Official Stamps" (TBD)
- PASSPORT_STAMPS_HEADER = "OFFICIAL STAMP REGISTER" (TBD)
- PASSPORT_FOOTER = "Cavite Tourism Passport" (TBD)
- All text in English only, no Filipino or Tagalog
- Theme color tokens:
  - passportCream: body tint color
  - passportHeaderBorder: orange border
  - categoryDining: dining stamp color
  - categoryStaycation: staycation stamp color
  - categoryAdventure: adventure stamp color
  - categoryHeritage: heritage stamp color (one fixed color)
  - categoryFestival: festival stamp color

**1.3 Mock Data Requirements**
- At least one event in mockEvents must have festivalStamp field with pointsBonus: 50 and available: true

### 2. UI Components

**2.1 Summary Card**
- Display "Digital Passport" title with book icon
- Show "Active Season" badge when promo is active (green dot + text)
- Two stat tiles: "Stamps Collected" (N of TOTAL) and "Passport Balance" (POINTS PTS)
- Overall completion progress bar (N / TOTAL * 100%)
- White card with theme shadow

**2.2 Summary Card Calculations**
- N = stamps.length (number of collected stamps)
- TOTAL = sites.length + festivals with stamps (from useEvents)
- POINTS = currentUser.points
- Completion percentage = (N / TOTAL) * 100

**2.3 Segmented Control (Shared Component)**
- Generic reusable component at src/components/ui/SegmentedControl.tsx
- Props: options, selectedValue, onValueChange
- Pill-shaped container, 32px height, active option highlighted
- Used in Passport with two options: "Identity Page" and "Visas & Stamps (N)"

**2.4 Identity Page Card**
- Navy header with shield icon, issuer text (PASSPORT_ISSUER_LINE), subtitle (PASSPORT_SUBTITLE), and badge (PASSPORT_HEADER_LABEL)
- Cream body with generic person icon (same for all users)
- Field labels in English: "Passport ID", "Full Name", "Address", "Issued", "Valid Through"
- Fields: Passport ID (monospace), Full Name, Address
- Issued and Valid Through dates from promo period
- Footer with PASSPORT_FOOTER constant and "PAGE 01"
- No machine-readable code, no "URI / TYPE", no "HOLDER PHOTO" caption
- All text in English only

**2.5 Date Formatting**
- Format promo dates as "01 JAN 2027"
- Use Intl.DateTimeFormat for consistent formatting

**2.6 Visas & Stamps Card**
- Navy header with PASSPORT_STAMPS_TITLE on left and "N STAMPED" badge on right
- Cream body with 2-column grid of collected stamp slots only
- **Chronological order**: Stamps sorted by collectedAt (most recent first)
- Footer with PASSPORT_STAMPS_HEADER constant and "PAGE 02"
- All text in English only
- **No uncollected/locked slots shown** - only display stamps the user has collected
- **Empty state**: When 0 stamps, show encouraging message: "Start Your Journey! Scan QR codes at partner sites to collect your first stamp."

**2.7 Stamp Slots - Collected Appearance**
- Ink-stamp visual with dashed border in category color
- Deterministic rotation: hash siteId to -2 to 2 degrees (never random)
- **Category badge**: Small pill at top showing category (e.g., "DINING", "HERITAGE")
  - Badge uses category color as background, white text, uppercase
- Show site name, municipality, date only (format: "JAN 14, 2027"), points
- Green "Stamped" check icon
- Tinted background (category color at low opacity)

**2.8 View State Management**
- View state is plain local state defaulting to 'identity'
- Toggle changes view between 'identity' and 'stamps'
- No URL parameters or routing involved

**2.9 Loading and Error States**
- Loading: show skeleton or spinner for stamps, sites, events queries
- Error: show error message with retry button for all queries
- Empty state: 0 stamps, all slots uncollected, 0% completion

**2.10 Action Buttons**
- "View Rewards" button below passport card navigates to /rewards
- Note text: "Collect stamps by scanning the QR code at each partner site."

### 3. Technical Constraints

**3.1 Styling**
- Use React Native StyleSheet with theme tokens only
- No hardcoded hex values in any passport component
- Platform monospace font for Passport ID
- No web components or Tailwind code

**3.2 Navigation**
- ScreenContainer with edges={['left', 'right']}, withTabBarPadding={true}
- Support Android back button
- View state is local only (no URL routing)

**3.3 Category Colors and Sorting**
- Heritage uses one fixed color (no alternating)
- Festival section shows when user has collected festival stamps
- Festival stamps are bonus only, +50 pts
- **Stamps are sorted chronologically (most recent first), not by category**
- Category is indicated by the badge at the top of each stamp

**3.4 Performance**
- React Query hooks with proper cache invalidation
- Efficient re-renders on view state changes
- Deterministic rotation calculation (not random per render)

## Out of Scope

- User-uploaded profile photos (generic icon only)
- Biometric authentication
- Offline stamp queueing
- Real-time promo period updates
- Multiple passport holders per account
- Export passport as PDF
- Share passport on social media
- Passport animation effects beyond rotation
- Custom category colors per user
- Passport themes or skins
