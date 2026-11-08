# Rewards Spec - Cavite Tourism Passport

## Overview

This spec implements the complete Rewards UI for the Cavite Tourism Passport app, including:

1. **Rewards list screen** (`/rewards`) - Points summary card showing current points and category stamp completion, plus a scrollable list of reward cards showing status (Locked, Eligible, Claimed, No longer available)
2. **Reward detail screen** (`/rewards/[id]`) - Full reward information with requirements checklist, eligibility status, and action buttons based on state:
   - **Locked** - Button disabled, shows what's needed
   - **Eligible** - "Generate Claim QR" button
   - **QR Generated** - Shows the claim QR code with expiry timer and instructions
   - **Expired** - Shows "Expired" message with "Generate New QR" button
   - **Already Claimed** - Shows message that user has already claimed their prize this promo period (user-level, affects all rewards)
   - **No Longer Available** - Shows message that limited reward is fully claimed

**Scope:** UI-first implementation. All reward functions call mock APIs through hooks. No real backend integration yet. Officer-side claim scanning tool is out of scope.

## Design References

**Source:** `design/screens/07-rewards/`

**Note:** The rewards list screen image (from user screenshot) should be saved as `rewards-list.png` in `design/screens/07-rewards/` for reference, but is currently not present in that folder.

### Images Examined

1. User-provided screenshot showing "Rewards Hub" list view
2. `reward_detail_locked.png` - Locked state
3. `reward_detail_eligible.png` - Eligible state  
4. `reward_detail_qr_generated.png` - QR Generated state
5. `reward_claim_qr_full_view.png` - Same as QR Generated

**HTML files read** for measurements: All matching `.html` files for exact spacing, sizes, radii, colors. HTML/Tailwind code is NOT copied into React Native.

**Tab bar check:** No tab bar is visible at the bottom of any reward detail images. Rewards routes remain root-level (`src/app/rewards/`), not nested in `(tabs)`.

### States Without Design
- **Expired** - Built to match QR Generated layout, but shows "Expired" message and "Generate New QR" button
- **Already Claimed** - Built to match Locked layout with message
- **No Longer Available** - Built to match Locked layout with message

## Mock Reward Rules

**From `src/data/types.ts` and `src/data/mock-data.ts`:**

### Eligibility Requirements
- At least 700 points
- At least the reward's cost in points
- At least one stamp from each of: Dining, Staycation, Adventure, and Heritage
- Festival stamps do NOT count toward category requirements
- User has not claimed a reward this promo period
- Reward is available (not sold out)

**Implementation:** The `checkRewardEligibility` function in `api.ts` must enforce all six conditions above.

### Redemption Rules
- Points are deducted when reward is claimed by officer (not when QR is generated)
- **One prize per promo period (user-level):** When a user claims any reward, `hasClaimedThisPeriod` flag is set to true on the mock user, and `claimedRewardId` stores which reward was claimed. When this flag is true, ALL rewards show "Already Claimed" state and eligibility returns not eligible for any reward.
- Limited rewards have `limited: true` and a `remainingClaims` number that decreases as users claim them
- Unavailable rewards: `available: false` and `remainingClaims: 0` means the reward is fully claimed
- Active claim QRs are stored at the user level in mock data via `getActiveClaim(rewardId)`, returning `{ claimId, qrPayload, rewardId, createdAt, expiresAt }` or null
- Generating a new QR invalidates any existing QR for that reward

### Mock User
**User fields:**
- `hasClaimedThisPeriod: boolean` - True if user has claimed any reward this promo period
- `claimedRewardId?: string` - ID of the reward claimed (if hasClaimedThisPeriod is true)

**Default Mock User:**
- Name: Juan Dela Cruz
- Points: 450
- Stamps: 1 Dining (150), 1 Staycation (200), 2 Heritage (100 total)
- Missing: Adventure
- hasClaimedThisPeriod: false
- Status: NOT eligible for any reward (needs 700+ pts AND all 4 categories)

**Dev Scenarios (via setter in api.ts):**
1. **Default** - 450 pts, missing Adventure stamp (Locked state)
2. **Eligible** - 900 pts, stamps from all four categories (Eligible state)
3. **Already Claimed** - hasClaimedThisPeriod: true (Already Claimed state)

## User Flows

### Accessing Rewards
1. From header: Tap the points ("450 pts") → Navigate to `/rewards`
2. From Passport: Tap "View Rewards" button below the passport → Navigate to `/rewards`
3. From Account: Tap "Redemptions & Vouchers" row (if it exists) → Navigate to `/rewards`

### Browsing Rewards (List Screen)
1. User sees points summary card showing current points and category completion (check or missing icon for each of the 4 main categories)
2. User scrolls through reward cards, each showing image, title, points cost, status, and "Limited: N left" if applicable
3. User taps a reward card → Navigate to `/rewards/[id]`

### Viewing Reward Detail - Locked State
1. User sees reward image, title, description, points cost, and redemption location
2. Requirements checklist shows:
   - Points progress bar (e.g., "450 / 700 pts")
   - Category stamps with check or missing icons for each
   - "What's left" message (e.g., "Collect 1 Adventure stamp and 250 more points")
3. Button at bottom is disabled: "Reward Locked (Requirements Incomplete)"
4. User taps back arrow → Return to rewards list

### Viewing Reward Detail - Eligible State
1. User sees "READY TO CLAIM" chip at top
2. Requirements checklist shows all categories completed and points reached
3. Info box: "All Requirements Met! You have unlocked this reward..."
4. Orange "Generate Claim QR" button is enabled
5. Note below button: "Generating a code is optional. You can keep collecting points toward higher rewards."
6. User taps "Generate Claim QR" → Call API, transition to QR Generated state

### Viewing Reward Detail - QR Generated State
1. User sees summary card at top with reward icon, title, points, and location
2. Large QR code displayed with:
   - Countdown timer "Valid for MM:SS" (computed from expiresAt using Date.now() on each tick)
   - QR code (generated with react-native-qrcode-svg from qrPayload)
   - Ticket reference ID (claim ID, plain text, no copy icon)
   - Instructions: "Show this code to a tourism office officer. Points are deducted when the reward is claimed."
3. "Done ✓" button at bottom
4. User taps "Done" → Navigate back to rewards list
5. Reopening this reward's detail screen while QR is active (not expired) shows the same QR with remaining time

### Viewing Reward Detail - Expired State
1. Same layout as QR Generated, but:
2. Timer shows "Expired"
3. QR code is grayed out or hidden
4. Button changes to "Generate New QR" (enabled, accent color)
5. User taps "Generate New QR" → Generates new claim, invalidates old one, transitions to QR Generated state

### Viewing Reward Detail - Already Claimed State
1. User sees reward image, title, description (same layout as Locked)
2. Message: "You've already claimed a prize this promo period"
3. All other rewards also show this state (user-level flag, not per-reward)
4. Button at bottom is disabled: "Already Claimed"
5. User taps back arrow → Return to rewards list

### Viewing Reward Detail - No Longer Available State
1. User sees reward image, title, description (same layout as Locked)
2. Message: "This reward is no longer available" (for limited rewards that are fully claimed)
3. Button at bottom is disabled: "No Longer Available"
4. User taps back arrow → Return to rewards list

### Dev-Only Testing Features
**Dev Scenario Switcher (only visible when `__DEV__`):**
- Reuses existing dev mock scenario setter function from api.ts (check Scanner or Passport specs for pattern)
- Three scenarios:
  1. Default: 450 pts, missing Adventure stamp
  2. Eligible: 900 pts, all four categories  
  3. Already Claimed: hasClaimedThisPeriod = true
- On selection: calls setter in api.ts, invalidates queries, re-renders

**Simulate Officer Scan (only visible when `__DEV__` AND QR Generated):**
- Button: "Simulate Officer Scan"
- On press:
  - Call `simulateClaim` API function
  - Deduct points from mock user
  - Set hasClaimedThisPeriod = true and claimedRewardId on mock user
  - Reduce `remainingClaims` if limited
  - Invalidate queries
  - Show success message
  - Navigate back to rewards list

## Validation Rules

No user input validation needed for this spec. All interactions are taps on buttons and cards.

## Components Used

**Existing:**
- `ScreenContainer` (`@/components/ui/ScreenContainer`)
- `Button` (`@/components/ui/Button`)
- `Card` (`@/components/ui/Card`)
- `Chip` (`@/components/ui/Chip`)

**New:**
- `PointsSummaryCard` (`@/components/rewards/PointsSummaryCard`) - Shows current points and category completion
- `RewardCard` (`@/components/rewards/RewardCard`) - Individual reward card in list view
- `RewardRequirements` (`@/components/rewards/RewardRequirements`) - Category checklist and points progress
- `ClaimQRView` (`@/components/rewards/ClaimQRView`) - QR code display with timer
- Dev scenario switcher component (reuse existing from Scanner/Passport if available)

## Navigation

- **Back button behavior:**
  - Android hardware back button and on-screen back arrow both use `router.back()`
  - From reward detail → Returns to rewards list
  - From rewards list → Returns to previous screen (tabs or account)

- **Forward navigation:**
  - Header points tap → `/rewards`
  - Passport "View Rewards" button → `/rewards`
  - Account "Redemptions & Vouchers" row → `/rewards` (if row exists)
  - Reward card tap → `/rewards/[id]`
  - "Generate Claim QR" button → Transitions to QR Generated state (same screen)
  - "Generate New QR" button (Expired state) → Generates new QR, transitions to QR Generated state
  - "Done" button (QR Generated) → Back to rewards list

## Entry Points Verification

Per requirement, verify and fix these entry points by reading the code:

1. **Header points:** Check that `src/app/(tabs)/_layout.tsx` Header component's `onPointsPress` prop navigates to `/rewards`. Fix if missing.

2. **Passport "View Rewards" button:** Check that `src/app/(tabs)/passport.tsx` has a "View Rewards" button that navigates to `/rewards`. Fix if missing.

3. **Account "Redemptions & Vouchers" row:** Check if `src/app/(tabs)/account.tsx` has a "Redemptions & Vouchers" list item. If it exists, verify it navigates to `/rewards`. If it doesn't exist, note this in DIFFERENCES.md.

## Loading States

- Show loading spinner on buttons during API calls:
  - "Generate Claim QR" button: `loading` prop while calling API
  - "Generate New QR" button: `loading` prop while calling API
  - Rewards list: Show loading indicator while fetching rewards
  - Reward detail: Show loading indicator while fetching reward and eligibility
- Use React Query's `isLoading` and `isFetching` states

## Timer Logic (QR Generated State)

- Timer format: `MM:SS` (e.g., `14:57`)
- Compute remaining time from `expiresAt` timestamp: `Math.max(0, expiresAt.getTime() - Date.now())`
- Update every second using `setInterval`
- This approach ensures timer stays correct after app is backgrounded/resumed
- When remaining time reaches 0:
  - Transition to Expired state
  - Show "Expired" message
  - Gray out or hide QR code
  - Change button to "Generate New QR"
- Clean up interval on unmount

## QR Code Generation

- Use `react-native-qrcode-svg` library (already installed)
- QR payload: comes from `qrPayload` field in active claim object (format is `cvt:claim:<claimId>:<token>`, defined in CLAIM_QR_FORMAT constant)
- Example: `cvt:claim:reward-001-user-001-1730649291234:abc123def456`
- QR size: 200px
- QR color: primary blue (#004987) or black (#000000)
- Background: white
- Ticket reference ID: extract claim ID from qrPayload and display as plain text (no copy icon, no clipboard)

## Design Differences and Omissions

The following elements appear in the design images but are **intentionally omitted** or modified per product rules:

### Content Changes (Applied Everywhere)
1. **"Pillar Stamps" → "N of 4 categories collected"** - Remove "Pillar Stamps" terminology and the "• 200 pts" badge
2. **"higher tiers" → "higher rewards"** - Change wording throughout
3. **Screen title:** "Reward Details" (singular), not "Reward Detail Locked" or "Reward Detail Qr Generated"
4. **Redemption location:** Use `REDEMPTION_LOCATION` constant from `src/lib/constants.ts` (marked TBD pending Tourism Office confirmation). No opening hours anywhere.
5. **Remove:** "SECURITY VERIFIED" divider in QR card
6. **Remove:** "Present your digital passport along with this QR code at the redemption counter" text
7. **Remove:** Copy icon on claim ID (no clipboard package installed)
8. **All text in English only**

### Omitted (not in docs/app.md)
1. **Named reward tiers** - Design may show labels like "Cavite Historian". Omit.
2. **"Pending verification" row** - Not part of rewards flow
3. **Hardcoded pickup hours** - If design shows "Mon - Fri • 8:00 AM - 5:00 PM", omit hours
4. **Hardcoded points or dates** - Use constants and derive from data

### Modified (behavior trumps design)
5. **Points per category** - Use correct values from `POINTS_PER_CATEGORY` (Dining 150, Staycation 200, Adventure 100, Heritage 50)
6. **Category name "Dining"** - Everywhere, not "Food"
7. **Festival stamps are bonus only** - Do not count toward 4-category requirement
8. **Reward images** - No hosted Stitch URLs. Use local placeholder (neutral tinted background with gift icon) via expo-image until real photos exist. Add `imageSource` field to mock rewards for local images.

### Built Without Design (matching existing style)
9. **Expired state** - No design image. Built using QR Generated layout with "Expired" message and "Generate New QR" button.
10. **Already Claimed state** - No design image. Built using Locked layout with message.
11. **No Longer Available state** - No design image. Built using Locked layout with message.

## Accessibility

- All buttons have `accessibilityLabel` and `accessibilityRole`
- Category chips have `accessibilityState` indicating collected/missing
- Loading states are announced via `accessibilityLiveRegion`
- QR code has `accessibilityLabel` with the ticket reference ID

## Files to Modify/Create

### Routes (in `src/app/rewards/`)
- `index.tsx` - Replace placeholder with rewards list
- `[id].tsx` - Replace placeholder with reward detail

### Hooks (in `src/hooks/`)
- `useRewards.ts` - Hook for fetching all rewards
- `useRewardById.ts` - Hook for fetching single reward
- `useRewardEligibility.ts` - Hook for checking eligibility
- `useRewardsWithEligibility.ts` - Hook for fetching rewards with eligibility (for list screen)
- `useActiveClaim.ts` - Hook for fetching active claim QR
- `useGenerateClaimQR.ts` - Hook for generating claim QR
- `useSimulateClaim.ts` - Hook for dev-only officer scan simulation

### Components (in `src/components/rewards/`)
- `PointsSummaryCard.tsx` - Points and category stamps summary
- `RewardCard.tsx` - Individual reward card in list
- `RewardRequirements.tsx` - Category checklist and points progress
- `ClaimQRView.tsx` - QR code display with timer

### Constants (in `src/lib/constants.ts`)
- `CLAIM_QR_FORMAT = "cvt:claim:<claimId>:<token>" // TBD`
- `CLAIM_QR_EXPIRY_MINUTES = 15 // TBD`
- `REDEMPTION_LOCATION = "Provincial Tourism Center, Trece Martires" // TBD`

### Types (in `src/data/types.ts`)
- Update `User` interface: add `hasClaimedThisPeriod?: boolean` and `claimedRewardId?: string`
- Update `Reward` interface: add `imageSource?: any` for local placeholder images
- Add `ActiveClaim` interface: `{ claimId: string, qrPayload: string, rewardId: string, createdAt: Date, expiresAt: Date }`
- Already defined: `Reward`, `RewardEligibility` (update to check hasClaimedThisPeriod)

### API (in `src/data/api.ts`)
- Update `checkRewardEligibility` to enforce all 6 conditions (700+ pts, reward cost, all 4 categories, not claimed this period, not sold out)
- Add `getActiveClaim(rewardId: string): Promise<ActiveClaim | null>` - Returns active claim for reward or null
- Add `generateClaimQR(rewardId: string): Promise<ActiveClaim>` - Creates new claim, invalidates old one, stores in mock data
- Update `simulateClaim(claimId: string, rewardId: string): Promise<void>` - Deducts points, sets hasClaimedThisPeriod = true and claimedRewardId, reduces remainingClaims
- Add `setMockScenario(scenario: 'default' | 'eligible' | 'claimed'): void` - Dev-only setter for mock user state

### Entry Point Verification
- Check `src/app/(tabs)/_layout.tsx` Header `onPointsPress`
- Check `src/app/(tabs)/passport.tsx` "View Rewards" button
- Check `src/app/(tabs)/account.tsx` "Redemptions & Vouchers" row (if exists)

## Implementation Order

1. Add reward constants to `src/lib/constants.ts`
2. Update types in `src/data/types.ts` (User, Reward, ActiveClaim)
3. Update and extend API functions in `src/data/api.ts`
4. Create hooks
5. Create UI components
6. Implement rewards list screen
7. Implement reward detail screen with all states
8. Verify entry points by reading code, fix any that are missing
9. Test on device
10. Write DIFFERENCES.md

## Success Criteria

- Rewards list matches the design (with documented changes)
- All 6 reward detail states work correctly (Locked, Eligible, QR Generated, Expired, Already Claimed, No Longer Available)
- Points summary card shows current points and "N of 4 categories collected"
- Requirements checklist shows points progress and category stamps
- QR code generates and displays with countdown timer (computed from expiresAt)
- Timer stays correct after app is backgrounded
- Expired state shows "Generate New QR" button
- Already Claimed state affects all rewards (user-level flag)
- Dev scenario switcher and simulate officer scan work correctly
- Entry points (header, passport, account) navigate to rewards
- Android back button works at every step
- Loading states display during async operations
- No TypeScript or lint errors
- Code organized per project structure rules
- DIFFERENCES.md written with all deviations
