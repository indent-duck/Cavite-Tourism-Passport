# Rewards Screen States

## Design Images Examined

### Rewards List

**Source:** User-provided screenshot showing "Rewards Hub"

**Note:** This image should be saved as `rewards-list.png` in `design/screens/07-rewards/` for reference, but is currently not present in that folder.

**State shown:** List view with points summary and multiple rewards

**Elements:**
- Header with back arrow, title "Rewards Hub", and points badge "450 pts"
- Points summary card:
  - "TOTAL BALANCE: 450 pts"
  - "Category Stamp Milestones: **N of 4 categories collected**" (not "Pillar Stamps", no "• 200 pts" badge)
  - Four category chips: Dining ✓, Staycation ✓, Heritage ✓, Adventure ⚠
- Section header: "Official Souvenirs & Perks" with "N Items"
- Reward cards showing:
  - Local placeholder image (neutral background + gift icon)
  - Cavite Souvenir Kit (700 pts, Limited: 40 left, Locked)
  - Premium Cavite Centenary Souvenir Set (1,000 pts, Locked)
  - Staycation Discount Voucher (1,500 pts, "No longer available")
- Each card has title, description, location (REDEMPTION_LOCATION constant), points progress, and status

**Implementation notes:**
- Points summary card shows current points and "N of 4 categories collected" (not "Pillar Stamps")
- Category chips use theme colors and show check or warning icons
- Reward cards use local placeholder images via expo-image (reward.imageSource)
- Location uses REDEMPTION_LOCATION constant, no hours
- Cards are pressable and navigate to detail screen
- Status badges indicate Locked, Eligible, Claimed, or No longer available

---

### Reward Detail - Locked State

**Source:** `design/screens/07-rewards/reward_detail_locked.png` and `.html`

**State shown:** User has 450 pts, missing 1 Adventure stamp and 250 points

**Elements:**
- Header: **"Reward Details"** (not "Reward Detail Locked")
- Local placeholder image with overlays: "Limited: 40 left" (top-left), "700 pts required" (bottom-right)
- Title: "Cavite Souvenir Kit" with "OFFICIAL MERCH" badge
- Description: "Includes custom Cavite cotton tote, freshly roasted Amadeo Kapeng Barako, and brass Aguinaldo shrine keychain."
- Redemption location: Text from REDEMPTION_LOCATION constant ("Provincial Tourism Center, Trece Martires // TBD"), **no hours**
- Points Progress card:
  - "450 / 700 pts (64%)" with progress bar (orange fill)
  - Info message: "Collect 1 Adventure stamp and 250 more points"
- Category Passport Stamps card:
  - **"3 of 4 Ready"** badge (not "Pillar Stamps")
  - Dining ✓ Collected • 150 pts
  - Staycation ✓ Collected • 200 pts
  - Heritage ✓ 2 Collected • 100 pts
  - Adventure ⚠ Missing • Needs 1 stamp
- Claim Procedure info box explaining QR generation
- Button: "Reward Locked (Requirements Incomplete)" (disabled, gray)

**Implementation notes:**
- Layout: image, title, description, location, points progress, category stamps, info box, button
- Progress bar uses accent color for fill
- Category icons use theme colors
- Check icons for collected categories, warning icons for missing
- Button is disabled (surface background, textSecondary text, 40% opacity)

---

### Reward Detail - Eligible State

**Source:** `design/screens/07-rewards/reward_detail_eligible.png` and `.html`

**State shown:** User has 700+ pts and all 4 category stamps

**Elements:**
- Status chip at top: "✓ READY TO CLAIM" (green) and "Limited: 40 left" (orange)
- Local placeholder image with overlays: "Official Commemorative" and "Cavite Souvenir Kit" text, "700 pts" badge
- Description: Same as Locked
- Location: REDEMPTION_LOCATION constant text, **no hours** (omit if design shows "Mon - Fri • 8:00 AM - 5:00 PM")
- Points Progress card:
  - "700 / 700 pts (100%)" with full progress bar (green)
  - "Current Balance: 700 pts" | "TARGET REACHED"
- Passport Requirements card:
  - **"4 / 4 Completed"** badge (green, not "Pillar Stamps")
  - Dining ✓ Collected • 150 pts
  - Staycation ✓ Collected • 200 pts
  - Heritage ✓ 2 Collected • 100 pts
  - Adventure ✓ Collected • 100 pts (Picnic Grove)
- Info box: "All Requirements Met! You have unlocked this reward. You may generate your single-use claim QR now or continue saving for **higher rewards**." (use "higher rewards", not "higher tiers")
- Button: "Generate Claim QR" (orange/accent, enabled)
- Note below button: "Generating a code is optional. You can keep collecting points toward **higher rewards**." (use "higher rewards")

**Implementation notes:**
- Layout: status chip, image, description, location, points progress, requirements, info box, button, note
- Status chip uses success color for "READY TO CLAIM"
- Progress bar uses success color for 100% fill
- All category rows show check icons
- Info box uses success icon
- Button is enabled (accent background, white text)
- Note below button is in bodySmall, textSecondary

**Content changes applied:**
- "higher rewards" instead of "higher tiers"
- Location from REDEMPTION_LOCATION constant, no hours
- "4 / 4 Completed" badge, not "Pillar Stamps"

---

### Reward Detail - QR Generated State

**Source:** `design/screens/07-rewards/reward_detail_qr_generated.png` and `.html`

**State shown:** User generated claim QR, countdown timer active

**Elements:**
- Header: **"Reward Details"** (not "Reward Detail Qr Generated")
- Summary card at top:
  - Reward icon (gift, 56px circle, surface background)
  - "Cavite Souvenir Kit" title
  - REDEMPTION_LOCATION constant text (truncated with ...)
  - "700 pts" badge (orange)
- QR Card (large white card):
  - Header: "Single-Use Pass • Valid for MM:SS" (countdown timer in accent color, computed from activeClaim.expiresAt using Date.now())
  - QR code (200px, centered, generated from activeClaim.qrPayload, with corner bracket decorations)
  - "TICKET REFERENCE ID" label
  - Claim ID: extracted from activeClaim.qrPayload, **plain text** (no copy icon)
  - **No "SECURITY VERIFIED" divider** (removed)
  - Info row with icon: "Show this code to a tourism office officer. Points are deducted when the reward is claimed."
  - **Second warning row removed** ("Present your digital passport along with this QR code..." omitted)
- Button: "Done ✓" (primary blue, full width)

**Implementation notes:**
- Layout: summary card, QR card, button
- QR code is generated with react-native-qrcode-svg using activeClaim.qrPayload
- Countdown timer format: MM:SS (e.g., "14:57" = 14 minutes 57 seconds)
- Timer computed from activeClaim.expiresAt: `Math.max(0, expiresAt.getTime() - Date.now())`
- Timer updates every second via setInterval
- This approach ensures timer stays correct after app is backgrounded/resumed
- When timer reaches 0: parent component transitions to Expired state
- Corner brackets are decorative framing (static images/SVG), not part of QR code
- Claim ID is plain text (no copy icon, no clipboard)
- "Done" button navigates back to rewards list
- Reopening detail while QR is active shows the same QR with remaining time

**Content changes applied:**
- Screen title "Reward Details"
- Location from REDEMPTION_LOCATION constant
- Removed "SECURITY VERIFIED" divider
- Removed second instruction paragraph
- No copy icon on claim ID

---

### Reward Detail - Full QR View

**Source:** `design/screens/07-rewards/reward_claim_qr_full_view.png` and `.html`

**State shown:** Same as QR Generated state

**Elements:**
- Same as QR Generated state above

**Implementation notes:**
- This appears to be the same screen as reward_detail_qr_generated
- No additional implementation needed

---

## States WITHOUT Design Images (Built to Match Style)

### Reward Detail - Expired State

**No design image provided. Build using QR Generated state layout.**

**Elements:**
- Header: "Reward Details"
- Summary card (same as QR Generated)
- QR Card:
  - Header: "Single-Use Pass • **Expired**"
  - QR code grayed out or hidden
  - Ticket reference ID (same)
  - Info text (same)
- Button: "Generate New QR" (accent background, white text, enabled)

**Implementation notes:**
- Same layout as QR Generated state
- Timer shows "Expired" text instead of countdown
- QR code is either grayed out (50% opacity) or hidden entirely
- Button changes to "Generate New QR" (accent color, enabled)
- On button press: calls generateClaimQR mutation, invalidates old claim, transitions to QR Generated state
- This state is entered when activeClaim.expiresAt <= Date.now()

---

### Reward Detail - Already Claimed State

**No design image provided. Build using Locked state layout.**

**Elements:**
- Header: "Reward Details"
- Local placeholder image with overlays (same as Locked)
- Title and description (same as Locked)
- Redemption location (REDEMPTION_LOCATION constant, no hours)
- Message card (replaces points progress, category stamps, info box):
  - Info icon (textSecondary)
  - Text: "You've already claimed a prize this promo period"
- Button: "Already Claimed" (disabled, gray)

**Implementation notes:**
- Same layout as Locked state, but simpler (no requirements checklist)
- Message explains that user has already claimed their one prize this period
- This is a **user-level state**: when user.hasClaimedThisPeriod is true, ALL rewards show this state
- Button is disabled (surface background, textSecondary text, 40% opacity)
- This state takes precedence over all other states (checked first in state determination logic)

---

### Reward Detail - No Longer Available State

**No design image provided. Build using Locked state layout.**

**Elements:**
- Header: "Reward Details"
- Local placeholder image with overlays (same as Locked, but "Limited: 0 left" if showing count)
- Title and description (same as Locked)
- Redemption location (REDEMPTION_LOCATION constant, no hours)
- Message card (replaces points progress, category stamps, info box):
  - Info icon (textSecondary)
  - Text: "This reward is no longer available"
- Button: "No Longer Available" (disabled, gray)

**Implementation notes:**
- Same layout as Locked state, but simpler (no requirements checklist)
- Message explains that limited reward is fully claimed (remainingClaims: 0)
- Button is disabled (surface background, textSecondary text, 40% opacity)
- This state is entered when !reward.available && reward.limited && reward.remainingClaims === 0

---

## State Decision Logic (Reward Detail Screen)

```typescript
// Pseudocode for determining which state to show

if (user.hasClaimedThisPeriod) {
  // User has already claimed ANY reward this promo period (user-level flag)
  return "AlreadyClaimed";
}

if (!reward.available && reward.limited && reward.remainingClaims === 0) {
  // Limited reward is fully claimed
  return "NoLongerAvailable";
}

const activeClaim = await getActiveClaim(reward.id);

if (activeClaim && activeClaim.expiresAt > Date.now()) {
  // User has generated a claim QR and it's still valid
  return "QRGenerated";
}

if (activeClaim && activeClaim.expiresAt <= Date.now()) {
  // User has generated a claim QR but it expired
  return "Expired";
}

if (eligibility.eligible) {
  // User meets all requirements (700+ pts, all 4 categories stamped, enough pts for this reward, not claimed, not sold out)
  return "Eligible";
}

// Default: User doesn't meet requirements
return "Locked";
```

## State Transitions

```
Locked → Eligible (when user collects enough stamps and points)
Eligible → QR Generated (when user taps "Generate Claim QR")
QR Generated → Expired (when timer reaches 0)
Expired → QR Generated (when user taps "Generate New QR")
QR Generated → Rewards List (when user taps "Done")
Any state → Rewards List (when user taps back arrow)

User-level state changes:
Any state → Already Claimed (when user.hasClaimedThisPeriod becomes true, affects ALL rewards)

Dev-only transitions:
Any state → Any state (via dev scenario switcher calling setMockScenario)
QR Generated → Already Claimed (via "Simulate Officer Scan" button)
```

## Summary Table

| State | Design Image | Elements | Button | Button State |
|-------|-------------|----------|--------|--------------|
| **List** | User screenshot (missing from folder) | Points summary (N of 4 categories collected), reward cards (local placeholders), location (REDEMPTION_LOCATION) | N/A | N/A |
| **Locked** | reward_detail_locked.png | Image, title, description, location (REDEMPTION_LOCATION, no hours), points progress, category stamps (N of 4 Ready), info box | "Reward Locked (Requirements Incomplete)" | Disabled |
| **Eligible** | reward_detail_eligible.png | Status chip, image, description, location (REDEMPTION_LOCATION), points progress (100%), requirements (4/4 Completed), info box (higher rewards), note (higher rewards) | "Generate Claim QR" | Enabled (accent) |
| **QR Generated** | reward_detail_qr_generated.png | Summary card, QR card with timer (computed from expiresAt), QR (from qrPayload), claim ID (plain text, no copy), shortened instructions (no SECURITY VERIFIED, no second paragraph) | "Done ✓" | Enabled (primary) |
| **Expired** | None (built to match QR Generated) | Same as QR Generated, timer shows "Expired", QR grayed/hidden | "Generate New QR" | Enabled (accent) |
| **Already Claimed** | None (built to match Locked) | Image, title, description, location (REDEMPTION_LOCATION), message (user-level, affects all rewards) | "Already Claimed" | Disabled |
| **No Longer Available** | None (built to match Locked) | Image, title, description, location (REDEMPTION_LOCATION), message | "No Longer Available" | Disabled |

## Content Changes Applied Across All States

1. **Screen title:** "Reward Details" (singular), not "Reward Detail Locked" or "Reward Detail Qr Generated"
2. **"Pillar Stamps" → "N of 4 categories collected"** or "N of 4 Ready" / "4 / 4 Completed"
3. **Remove "• 200 pts" badge** from category milestones
4. **"higher tiers" → "higher rewards"** in all text
5. **Location:** Use REDEMPTION_LOCATION constant, no opening hours anywhere
6. **QR card:** Remove "SECURITY VERIFIED" divider, shorten instructions to one paragraph
7. **Claim ID:** Plain text, no copy icon
8. **Reward images:** Local placeholder (neutral background + gift icon via expo-image)
