# Implementation Plan: Rewards

## Overview

The Rewards feature implements the complete reward redemption UI for the Cavite Tourism Passport app. This includes a rewards list screen showing a points summary card and reward cards, and a reward detail screen with six states: Locked, Eligible, QR Generated, Expired, Already Claimed, and No Longer Available. All implementation is in TypeScript with strict mode enabled, using mock data through React Query hooks. Active claim QRs are stored in the mock data layer and read through hooks. The "one prize per promo period" rule is enforced at the user level via `hasClaimedThisPeriod` flag.

## Tasks

- [x] 1. Add reward constants and update types
  - [x] 1.1 Add constants to `src/lib/constants.ts`
    - `CLAIM_QR_FORMAT = "cvt:claim:<claimId>:<token>" // TBD`
    - `CLAIM_QR_EXPIRY_MINUTES = 15 // TBD`
    - `REDEMPTION_LOCATION = "Provincial Tourism Center, Trece Martires" // TBD`
    - _Requirements: Design Differences and Omissions #4, QR Code Generation_
  
  - [x] 1.2 Update User interface in `src/data/types.ts`
    - Add `hasClaimedThisPeriod?: boolean` - User has claimed a reward this promo period
    - Add `claimedRewardId?: string` - ID of the reward claimed (if hasClaimedThisPeriod is true)
    - _Requirements: Mock Reward Rules (user-level one prize per period)_
  
  - [x] 1.3 Add ActiveClaim interface to `src/data/types.ts`
    - `{ claimId: string, qrPayload: string, rewardId: string, createdAt: Date, expiresAt: Date }`
    - _Requirements: QR Code Generation, Timer Logic_
  
  - [x] 1.4 Update Reward interface in `src/data/types.ts`
    - Add `imageSource?: any` for local placeholder images (expo-image)
    - _Requirements: Design Differences and Omissions #8_

- [x] 2. Extend API layer with claim and eligibility functions
  - [x] 2.1 Read and update `checkRewardEligibility` in `src/data/api.ts`
    - Enforce all 6 conditions: at least 700 points, at least reward cost, at least one stamp in each of Dining/Staycation/Adventure/Heritage (Festival never counts), not already claimed this period (check user.hasClaimedThisPeriod), and reward is available (not sold out)
    - _Requirements: Mock Reward Rules (Eligibility Requirements)_
  
  - [x] 2.2 Add active claim storage to mock data
    - Create `mockActiveClaims: Map<string, ActiveClaim>` in `mock-data.ts` (key is rewardId)
    - Export as mutable for in-memory updates
    - _Requirements: Mock Reward Rules (Active claim QRs stored at user level)_
  
  - [x] 2.3 Add `getActiveClaim` function to `src/data/api.ts`
    - Function signature: `async function getActiveClaim(rewardId: string): Promise<ActiveClaim | null>`
    - Returns active claim for reward from mockActiveClaims Map, or null if none exists or expired
    - _Requirements: Viewing Reward Detail - QR Generated State #5_
  
  - [x] 2.4 Add `generateClaimQR` function to `src/data/api.ts`
    - Function signature: `async function generateClaimQR(rewardId: string): Promise<ActiveClaim>`
    - Creates new ActiveClaim with claimId, qrPayload (format from CLAIM_QR_FORMAT), rewardId, createdAt (now), expiresAt (now + CLAIM_QR_EXPIRY_MINUTES)
    - Stores in mockActiveClaims Map (overwrites any existing claim for this reward)
    - Returns the new ActiveClaim
    - _Requirements: Viewing Reward Detail - Eligible State #6, QR Code Generation_
  
  - [x] 2.5 Add `simulateClaim` function to `src/data/api.ts`
    - Function signature: `async function simulateClaim(claimId: string, rewardId: string): Promise<void>`
    - Find reward by rewardId in mockRewards
    - Deduct reward.pointsCost from currentMockUser.points
    - Set currentMockUser.hasClaimedThisPeriod = true and currentMockUser.claimedRewardId = rewardId
    - If reward.limited, decrement reward.remainingClaims
    - Remove claim from mockActiveClaims Map
    - _Requirements: Dev-Only Testing Features (Simulate Officer Scan)_
  
  - [x] 2.6 Add `setMockScenario` function to `src/data/api.ts`
    - Function signature: `function setMockScenario(scenario: 'default' | 'eligible' | 'claimed'): void`
    - Updates currentMockUser and currentMockStamps based on scenario:
      - 'default': 450 pts, stamps from Dining, Staycation, 2 Heritage, hasClaimedThisPeriod = false
      - 'eligible': 900 pts, stamps from all four categories, hasClaimedThisPeriod = false
      - 'claimed': hasClaimedThisPeriod = true, claimedRewardId = 'reward-001'
    - Export function for use by dev scenario switcher component
    - _Requirements: Dev-Only Testing Features (Dev Scenario Switcher), Mock User (Dev Scenarios)_

- [x] 3. Create reward data hooks
  - [x] 3.1 Create `src/hooks/useRewards.ts`
    - React Query hook wrapping `getRewards` from api.ts
    - Query key: `['rewards']`
    - _Requirements: Browsing Rewards_
  
  - [x] 3.2 Create `src/hooks/useRewardById.ts`
    - React Query hook wrapping `getRewardById` from api.ts
    - Query key: `['reward', id]`
    - _Requirements: Viewing Reward Detail states_
  
  - [x] 3.3 Create `src/hooks/useRewardEligibility.ts`
    - React Query hook wrapping `checkRewardEligibility` from api.ts
    - Query key: `['rewardEligibility', rewardId]`
    - Enabled only when rewardId is provided
    - _Requirements: Viewing Reward Detail states_
  
  - [x] 3.4 Create `src/hooks/useRewardsWithEligibility.ts`
    - Combines useRewards with eligibility checks for all rewards
    - Returns rewards array with eligibility data for each reward (for displaying on reward cards)
    - Single hook to avoid one query per card
    - _Requirements: Browsing Rewards (List Screen)_
  
  - [x] 3.5 Create `src/hooks/useActiveClaim.ts`
    - React Query hook wrapping `getActiveClaim` from api.ts
    - Query key: `['activeClaim', rewardId]`
    - Returns active claim or null
    - _Requirements: Viewing Reward Detail - QR Generated State_
  
  - [x] 3.6 Create `src/hooks/useGenerateClaimQR.ts`
    - React Query mutation hook wrapping `generateClaimQR` from api.ts
    - On success: invalidate `['activeClaim', rewardId]` query
    - _Requirements: Viewing Reward Detail - Eligible State #6_
  
  - [x] 3.7 Create `src/hooks/useSimulateClaim.ts`
    - React Query mutation hook wrapping `simulateClaim` from api.ts
    - On success: invalidate queries `['currentUser']`, `['rewards']`, `['reward', id]`, `['rewardEligibility', id]`, `['activeClaim', id]`
    - Dev-only hook (should only be called when `__DEV__` is true)
    - _Requirements: Dev-Only Testing Features (Simulate Officer Scan)_

- [ ] 4. Create reward UI components
  - [x] 4.1 Create `src/components/rewards/PointsSummaryCard.tsx`
    - Props: `{ points: number, stampCategories: Category[], testID?: string }`
    - Layout: White card, 16px padding/radius
    - Top: "TOTAL BALANCE" label, large points display, subtext "Earned across 4 Cavite Passport categories"
    - Bottom: "Category Stamp Milestones" label with "N of 4 categories collected" badge (not "Pillar Stamps", no pts badge)
    - Four category chips in 2x2 grid: Dining, Staycation, Heritage, Adventure
    - Each chip: icon, name, "Collected • N pts" or "Missing • Needs 1 stamp", check/warning icon
    - Use theme category colors
    - _Requirements: Browsing Rewards, Design Differences #1_
  
  - [x] 4.2 Create `src/components/rewards/RewardCard.tsx`
    - Props: `{ reward: Reward, onPress: () => void, eligibility?: RewardEligibility, testID?: string }`
    - Layout: Card with local placeholder image at top (neutral tinted background with gift icon via expo-image using reward.imageSource)
    - Image overlays: "Limited: N left" badge (top-left, orange), points badge (bottom-right, navy)
    - Title, description (2 lines max), location with pin icon
    - Points progress bar if eligibility provided and not eligible
    - Status badge based on reward state (Locked, Eligible, Claimed, No longer available)
    - Pressable with scale animation
    - _Requirements: Browsing Rewards, Design Differences #8_
  
  - [x] 4.3 Create `src/components/rewards/RewardRequirements.tsx`
    - Props: `{ eligibility: RewardEligibility, pointsCost: number, testID?: string }`
    - Layout: White card, 16px padding/radius
    - Points Progress section: current/target, progress bar, "Current Balance" / "TARGET REACHED" labels
    - "What's left" message if not eligible
    - Category Passport Stamps section with "N of 4 Ready" badge (not "Pillar Stamps")
    - Four category rows: icon, name, status, check/warning icon
    - Use theme category colors
    - _Requirements: Viewing Reward Detail - Locked State, Design Differences #1_
  
  - [x] 4.4 Create `src/components/rewards/ClaimQRView.tsx`
    - Props: `{ activeClaim: ActiveClaim, rewardTitle: string, rewardPoints: number, onDone: () => void, testID?: string }`
    - Layout: Summary card (reward icon, title, points, location from REDEMPTION_LOCATION constant), QR card, button
    - QR card: "Single-Use Pass • Valid for MM:SS" with countdown (computed from activeClaim.expiresAt using Date.now()), QR code (200px, from activeClaim.qrPayload), "TICKET REFERENCE ID" with claim ID as plain text (no copy icon), instructions (one paragraph, no "Present your digital passport..." text, no "SECURITY VERIFIED" divider)
    - Countdown: `Math.max(0, expiresAt.getTime() - Date.now())`, updates every second, stays correct after backgrounding
    - When timer reaches 0: parent component transitions to Expired state (not handled in this component)
    - "Done ✓" button (primary blue)
    - _Requirements: Viewing Reward Detail - QR Generated State, Timer Logic, QR Code Generation, Design Differences #5-7_

- [x] 5. Implement rewards list screen
  - [x] 5.1 Replace placeholder in `src/app/rewards/index.tsx`
    - Use `ScreenContainer` with `scrollable={true}`, back arrow in header, title "Reward Details"
    - Use `useCurrentUser` for current points
    - Use `useStamps` (existing hook) to get user's stamps (NOT currentMockStamps)
    - Use `useRewardsWithEligibility` to fetch rewards with eligibility for all (not one query per card)
    - Compute which categories have stamps from useStamps result
    - Layout: PointsSummaryCard, section header "Official Souvenirs & Perks" with count, FlatList of RewardCard
    - Each card onPress navigates to `/rewards/${reward.id}`
    - Handle loading, error, empty states
    - Bottom padding for safe area
    - _Requirements: Browsing Rewards, Design Differences #3_

- [ ] 6. Implement reward detail screen with all states
  - [x] 6.1 Set up reward detail screen structure
    - Replace placeholder in `src/app/rewards/[id].tsx`
    - Use `ScreenContainer` with `scrollable={true}`, back arrow in header, title "Reward Details"
    - Use `useLocalSearchParams` to get reward id
    - Use `useRewardById`, `useRewardEligibility`, `useCurrentUser`, `useActiveClaim`
    - Use `useGenerateClaimQR` mutation, `useSimulateClaim` mutation (dev only)
    - _Requirements: Viewing Reward Detail states_
  
  - [x] 6.2 Implement state determination logic
    - If `user.hasClaimedThisPeriod`: Already Claimed state
    - If `!reward.available && reward.limited && reward.remainingClaims === 0`: No Longer Available state
    - If `activeClaim && activeClaim.expiresAt > Date.now()`: QR Generated state
    - If `activeClaim && activeClaim.expiresAt <= Date.now()`: Expired state
    - If `eligibility.eligible`: Eligible state
    - Else: Locked state
    - _Requirements: Mock Reward Rules (user-level one prize per period), state logic_
  
  - [~] 6.3 Render Locked state
    - Local placeholder image (neutral background + gift icon, reward.imageSource), title, description, location (REDEMPTION_LOCATION constant, no hours)
    - RewardRequirements component
    - Disabled button "Reward Locked (Requirements Incomplete)"
    - _Requirements: Viewing Reward Detail - Locked State, Design Differences #4_
  
  - [ ] 6.4 Render Eligible state
    - "READY TO CLAIM" chip (success background), "Limited: N left" badge if applicable
    - Image, title, description, location
    - RewardRequirements (all complete)
    - Info box: "All Requirements Met! You have unlocked this reward. You may generate your single-use claim QR now or continue saving for higher rewards." (use "higher rewards", not "higher tiers")
    - "Generate Claim QR" button (accent, enabled, with loading state)
    - Note: "Generating a code is optional. You can keep collecting points toward higher rewards."
    - _Requirements: Viewing Reward Detail - Eligible State, Design Differences #2_
  
  - [ ] 6.5 Render QR Generated state
    - ClaimQRView component with activeClaim, reward info, onDone callback
    - onDone navigates back to rewards list
    - _Requirements: Viewing Reward Detail - QR Generated State_
  
  - [ ] 6.6 Render Expired state
    - Same layout as QR Generated, but:
    - Timer shows "Expired"
    - QR code grayed out or hidden
    - Button: "Generate New QR" (accent, enabled, with loading state)
    - onPress: calls generateClaimQR mutation, transitions to QR Generated state
    - _Requirements: Viewing Reward Detail - Expired State, Timer Logic_
  
  - [ ] 6.7 Render Already Claimed state
    - Same layout as Locked: image, title, description, location
    - Message card: "You've already claimed a prize this promo period"
    - Disabled button "Already Claimed"
    - _Requirements: Viewing Reward Detail - Already Claimed State_
  
  - [ ] 6.8 Render No Longer Available state
    - Same layout as Locked: image, title, description, location
    - Message card: "This reward is no longer available"
    - Disabled button "No Longer Available"
    - _Requirements: Viewing Reward Detail - No Longer Available State_
  
  - [ ] 6.9 Add dev-only testing features
    - Dev scenario switcher: renders only when `__DEV__`, calls `setMockScenario` from api.ts, invalidates all queries
    - Three scenarios: Default, Eligible, Already Claimed
    - Simulate officer scan button: only visible when `__DEV__` AND in QR Generated state, calls useSimulateClaim, shows success message, navigates back to list
    - _Requirements: Dev-Only Testing Features_

- [ ] 7. Checkpoint - Test, verify entry points, and document
  - [ ] 7.1 Verify entry points by reading code
    - Read `src/app/(tabs)/_layout.tsx` and verify Header `onPointsPress` navigates to `/rewards`, fix if missing
    - Read `src/app/(tabs)/passport.tsx` and verify "View Rewards" button navigates to `/rewards`, fix if missing
    - Read `src/app/(tabs)/account.tsx` and check if "Redemptions & Vouchers" row exists, verify it navigates to `/rewards` if present, note in DIFFERENCES.md if absent
    - _Requirements: Entry Points Verification_
  
  - [ ] 7.2 Test all flows on physical Android device
    - Verify rewards list shows correct points summary and reward cards
    - Verify reward detail shows correct state for each scenario
    - Verify QR code generates and displays with countdown timer (test backgrounding app)
    - Verify timer stays correct after app is backgrounded/resumed
    - Verify expired state shows "Generate New QR" button
    - Verify already claimed state affects all rewards
    - Verify dev scenario switcher and simulate officer scan work (when `__DEV__`)
    - Verify Android back button works on all screens
    - Verify loading states display
    - _Requirements: Success Criteria, Timer Logic_
  
  - [ ] 7.3 Run linters and write DIFFERENCES.md
    - Run `npx tsc --noEmit` and verify no TypeScript errors
    - Run `npx expo lint` and verify no lint errors
    - Write `.kiro/specs/rewards/DIFFERENCES.md` documenting all deviations per requirements (content changes, omissions, modifications, built-without-design states, entry points status)
    - _Requirements: Success Criteria_

## Notes

- react-native-qrcode-svg and react-native-svg are already installed (do not reinstall)
- Rewards routes are root-level (`src/app/rewards/`), NOT nested in `(tabs)`, so use ScreenContainer's default edges (top, left, right) plus bottom inset
- No tab bar is visible in reward detail images (confirmed by checking design images)
- PointsSummaryCard shows "N of 4 categories collected" badge, not "Pillar Stamps" or "• 200 pts"
- Screen header title is "Reward Details" (singular) everywhere, not "Reward Detail Locked" or "Reward Detail Qr Generated"
- Redemption location uses REDEMPTION_LOCATION constant, no opening hours anywhere
- QR card removes "SECURITY VERIFIED" divider and shortens instruction text
- Claim ID is plain text (no copy icon, no clipboard)
- Reward images use local placeholder (neutral background + gift icon) via expo-image until real photos exist
- Active claim QRs are stored in mockActiveClaims Map in mock data, read through useActiveClaim hook
- Timer is computed from expiresAt using Date.now() on each tick, so it stays correct after backgrounding
- hasClaimedThisPeriod is user-level flag, affects all rewards (not per-reward claimedByUser)
- Dev scenario switcher uses setMockScenario function from api.ts (check Scanner/Passport specs for existing pattern)
- All components use TypeScript strict mode (no `any` types)
- Use `@/` import alias for `src/` imports

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1.1", "1.2", "1.3", "1.4"]
    },
    {
      "id": 1,
      "tasks": ["2.1", "2.2"]
    },
    {
      "id": 2,
      "tasks": ["2.3", "2.4", "2.5", "2.6"]
    },
    {
      "id": 3,
      "tasks": ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7"]
    },
    {
      "id": 4,
      "tasks": ["4.1", "4.2", "4.3", "4.4"]
    },
    {
      "id": 5,
      "tasks": ["5.1", "6.1", "6.2"]
    },
    {
      "id": 6,
      "tasks": ["6.3", "6.4", "6.5", "6.6", "6.7", "6.8", "6.9"]
    },
    {
      "id": 7,
      "tasks": ["7.1", "7.2", "7.3"]
    }
  ]
}
```
