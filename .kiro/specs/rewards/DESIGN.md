# Rewards Design Specifications

## Design Sources

**Images examined:**
- User-provided screenshot showing "Rewards Hub" list view (should be saved as `rewards-list.png` in `design/screens/07-rewards/` but is currently not present in that folder)
- `design/screens/07-rewards/reward_detail_locked.png`
- `design/screens/07-rewards/reward_detail_eligible.png`
- `design/screens/07-rewards/reward_detail_qr_generated.png`
- `design/screens/07-rewards/reward_claim_qr_full_view.png`

**HTML files read for measurements:**
- `design/screens/07-rewards/reward_detail_locked.html`
- `design/screens/07-rewards/reward_detail_eligible.png.html`
- `design/screens/07-rewards/reward_detail_qr_generated.html`
- `design/screens/07-rewards/reward_claim_qr_full_view.html`

**Tab bar check:** No tab bar is visible at the bottom of any reward detail images. Rewards routes remain root-level (`src/app/rewards/`), not nested in `(tabs)`.

**States without design images (built to match existing style):**
- Expired state (QR Generated layout with "Expired" message)
- Already Claimed state (Locked layout with message)
- No Longer Available state (Locked layout with message)

## Content Changes (Applied Throughout)

All design references must be adjusted with these content decisions:

1. **"Pillar Stamps" → "N of 4 categories collected"** - Remove "Pillar Stamps" terminology and the "• 200 pts" badge from category milestones
2. **"higher tiers" → "higher rewards"** - Change wording in all text
3. **Screen title:** "Reward Details" (singular), not "Reward Detail Locked" or "Reward Detail Qr Generated"
4. **Redemption location:** Use `REDEMPTION_LOCATION` constant ("Provincial Tourism Center, Trece Martires // TBD"). No opening hours anywhere.
5. **QR card changes:**
   - Remove "SECURITY VERIFIED" divider
   - Remove "Present your digital passport along with this QR code at the redemption counter" text
   - Keep only: "Show this code to a tourism office officer. Points are deducted when the reward is claimed."
6. **Claim ID:** Plain text only (no copy icon, no clipboard functionality)
7. **Reward images:** Local placeholder using expo-image (neutral tinted background with gift icon), not hosted Stitch URLs

## Screen Layouts

### Rewards List Screen (`/rewards`)

**Header:**
- Standard app header with back arrow and title "Reward Details"

**Content:**
1. **Points Summary Card**
   - White background, 16px padding, 16px radius, card shadow
   - "TOTAL BALANCE" label (labelSmall, textSecondary)
   - Large points display: "450 pts" (displayLarge, text color)
   - Subtext: "Earned across 4 Cavite Passport categories" (bodySmall, textSecondary)
   - "Category Stamp Milestones" label with badge: **"N of 4 categories collected"** (not "Pillar Stamps", no "• 200 pts")
   - Four category chips in 2x2 grid (8px gap):
     - Dining (green icon, check or missing mark)
     - Staycation (blue icon, check or missing mark)
     - Heritage (brown icon, check or missing mark)
     - Adventure (gray icon, check or missing mark)
   - Each chip: 36px height, 12px padding horizontal, category icon + name + status text, check (✓) or warning (⚠) icon
   - Collected: "Collected • N pts" (bodySmall, text color)
   - Missing: "Missing • Needs 1 stamp" (bodySmall, error color)

2. **Section Header**
   - "Official Souvenirs & Perks" (headlineMedium, text color)
   - Badge: "N Items" count (labelSmall, surface background, text color)
   - 16px margin top/bottom

3. **Reward Cards (FlatList)**
   - Each card: white background, 16px radius, card shadow, 16px margin bottom
   - **Image:** Local placeholder using expo-image (neutral tinted background with gift icon from reward.imageSource), aspect ratio 16:10, rounded top corners (16px)
   - Image overlays:
     - Top-left: "Limited: N left" badge (accent background, white text, 8px padding, 16px radius)
     - Bottom-right: Points badge (primary background, white text, 12px padding, 16px radius) "700 pts"
   - Content section: 16px padding
     - Title (titleMedium, text color)
     - Description (bodySmall, textSecondary), 2 lines max, ellipsis
     - Location row: pin icon (Ionicons 'location', textSecondary), address text from REDEMPTION_LOCATION constant (bodySmall, textSecondary)
     - Points progress bar (if not eligible): "450 / 700 pts (64%)" with progress bar (accent color fill)
     - Status badge based on state:
       - Locked: "Locked" (surface background, text color, 1px border)
       - Eligible: "Ready to Claim" (success background, white text)
       - Claimed: "Claimed" (textSecondary background, white text)
       - No longer available: "No longer available" (error background, white text)
   - Pressable with scale animation to 0.98

**Bottom padding:** Safe area inset

### Reward Detail Screen - Locked State (`/rewards/[id]`)

**Header:**
- Back arrow and title **"Reward Details"** (not "Reward Detail Locked")

**Content:**
1. **Reward Image**
   - Local placeholder (neutral background + gift icon via expo-image, using reward.imageSource)
   - Full width, aspect ratio 16:10, rounded corners (16px)
   - Overlays:
     - Top-left: "Limited: N left" badge (if limited)
     - Bottom-right: "700 pts required" badge (primary background, white text)

2. **Title and Description**
   - Title: titleLarge, text color, 16px margin top
   - Category badge: "OFFICIAL MERCH" (surface background, text color, 8px padding, 8px radius, uppercase)
   - Description: bodyMedium, textSecondary, 8px margin top

3. **Redemption Location Section**
   - Label: "REDEMPTION LOCATION" (labelSmall, textSecondary, uppercase, 16px margin top)
   - Location row: pin icon + text from REDEMPTION_LOCATION constant (bodyMedium, text color)
   - **No opening hours**

4. **Points Progress Section**
   - Card: surface background, 16px padding, 16px radius, 16px margin top
   - Label: "Points Progress" with current/target: "450 / 700 pts (64%)" (bodyMedium, text color)
   - Progress bar: 8px height, full width, border radius 4px, surface background, accent fill
   - Message below: "Collect 1 Adventure stamp and 250 more points" (bodySmall, text color, info icon)

5. **Category Passport Stamps Section**
   - Card: surface background, 16px padding, 16px radius, 16px margin top
   - Header: "Category Passport Stamps" with **"N of 4 Ready"** badge (success background, white text) - not "Pillar Stamps"
   - Four category rows (12px gap):
     - Icon circle: 40px diameter, category color background (10% opacity), category color icon
     - Name and status: "Dining Category" / "Collected • 150 pts" (titleSmall / bodySmall)
     - Right icon: check (✓) for collected (success color), warning (⚠) for missing (error color)

6. **Claim Procedure Info Box**
   - Card: surface background, 16px padding, 16px radius, 16px margin top
   - QR icon (primary color)
   - Label: "Claim Procedure" (titleSmall, text color)
   - Text: "Once all 4 categories are stamped and 700 pts are reached, your unique claim QR code will be generated to redeem this kit on-site." (bodySmall, textSecondary)

7. **Action Button**
   - Full width, 48px height, pill shape (24px radius)
   - Disabled state: surface background, textSecondary text, 40% opacity
   - Text: "Reward Locked (Requirements Incomplete)"
   - 24px margin top

**Bottom padding:** Safe area inset

### Reward Detail Screen - Eligible State

Same layout as Locked, with these differences:

1. **Status Chip** (at top, above image)
   - "✓ READY TO CLAIM" (success background, white text, 12px padding, 16px radius)
   - "Limited: N left" badge next to it (accent background, white text)

2. **Points Progress Section**
   - "700 / 700 pts (100%)" (all green/success color)
   - "Current Balance: 700 pts" / "TARGET REACHED" labels

3. **Category Stamps Section**
   - **"4 / 4 Completed"** badge (success background, white text) - not "Pillar Stamps"
   - All four categories show check icons

4. **Info Box** (replaces Claim Procedure)
   - Success icon (check circle, success color)
   - Label: "All Requirements Met!" (titleSmall, text color)
   - Text: "You have unlocked this reward. You may generate your single-use claim QR now or continue saving for **higher rewards**." (bodySmall, textSecondary) - use "higher rewards" not "higher tiers"

5. **Action Button**
   - Enabled: accent background, white text
   - Text: "Generate Claim QR"

6. **Note Below Button**
   - "Generating a code is optional. You can keep collecting points toward **higher rewards**." (bodySmall, textSecondary) - use "higher rewards"

### Reward Detail Screen - QR Generated State

**Header:**
- Back arrow and title **"Reward Details"**

**Content:**
1. **Summary Card**
   - Surface background, 16px padding, 16px radius, 16px margin top
   - Horizontal layout:
     - Reward icon circle: 56px diameter, surface container background, gift icon (primary color)
     - Reward title and location: "Cavite Souvenir Kit" (titleMedium), text from REDEMPTION_LOCATION constant (bodySmall with pin icon)
     - Points badge: "700 pts" (accent background, white text, 8px padding, 16px radius)

2. **QR Card**
   - White background, 16px padding, 16px radius, shadow, 16px margin top
   - Header: "Single-Use Pass • Valid for MM:SS" (bodyMedium, center aligned, accent color for timer)
   - Timer counts down from activeClaim.expiresAt using Date.now() (stays correct after backgrounding)
   - QR code:
     - 200px size, center aligned
     - Generated with react-native-qrcode-svg from activeClaim.qrPayload
     - Corner brackets for framing (static decorative elements, not part of QR)
     - QR color: primary blue or black
     - Background: white
   - Ticket reference section:
     - Label: "TICKET REFERENCE ID" (labelSmall, textSecondary, uppercase, center aligned)
     - ID: extracted from activeClaim.qrPayload (titleMedium, text color, center aligned)
     - **No copy icon** (no clipboard functionality)
   - **No "SECURITY VERIFIED" divider** (removed)
   - Info row:
     - Info icon (Ionicons 'information-circle', textSecondary)
     - Text: "Show this code to a tourism office officer. Points are deducted when the reward is claimed." (bodySmall, textSecondary)
   - **Second info row removed** ("Present your digital passport along with this QR code..." omitted)

3. **Action Button**
   - Full width, 48px height, pill shape (24px radius)
   - Primary background, white text
   - Text: "Done ✓"
   - 24px margin top

**Bottom padding:** Safe area inset

### Reward Detail Screen - Expired State (No Design Image)

Same layout as QR Generated state, with these changes:

1. **Timer** shows "Expired" instead of countdown
2. **QR code** is grayed out or hidden
3. **Action Button** changes to:
   - Accent background, white text
   - Text: "Generate New QR"
   - On press: calls generateClaimQR mutation, transitions to QR Generated state

### Reward Detail Screen - Already Claimed State (No Design Image)

Same layout as Locked state, with these changes:

1. **Remove:** Points Progress Section, Category Stamps Section, Claim Procedure Info Box

2. **Add:** Message Section
   - Card: surface background, 16px padding, 16px radius, 16px margin top
   - Info icon (textSecondary)
   - Text: "You've already claimed a prize this promo period" (bodyMedium, text color)

3. **Action Button**
   - Disabled state: surface background, textSecondary text, 40% opacity
   - Text: "Already Claimed"

### Reward Detail Screen - No Longer Available State (No Design Image)

Same layout as Locked state, with these changes:

1. **Remove:** Points Progress Section, Category Stamps Section, Claim Procedure Info Box

2. **Add:** Message Section
   - Card: surface background, 16px padding, 16px radius, 16px margin top
   - Info icon (textSecondary)
   - Text: "This reward is no longer available" (bodyMedium, text color)

3. **Action Button**
   - Disabled state: surface background, textSecondary text, 40% opacity
   - Text: "No Longer Available"

## Color Palette (from theme)

- **Primary:** #004987 (Navy blue)
- **Accent:** #F47B20 (Orange)
- **Background:** #FFFFFF (Main canvas)
- **Surface:** #F4F6FA (Card backgrounds)
- **Text:** #1B2A49 (Primary text)
- **Text Secondary:** #6B7280 (Secondary text)
- **Success:** #2E9E5B (Success states)
- **Error:** #D64545 (Error states)
- **Border:** #E5E7EB (Dividers)

**Category Colors:**
- **Dining:** #00542A (Green)
- **Staycation:** #004987 (Navy blue, reuses primary)
- **Adventure:** #6B7280 (Gray, reuses textSecondary)
- **Heritage:** #8B4513 (Brown)

## Typography (from theme)

All text uses **Inter** font family.

- **displayLarge:** 32px, line height 40, weight 700, letter spacing -0.64
- **headlineLarge:** 24px, line height 32, weight 700, letter spacing -0.24
- **titleLarge:** 20px, line height 28, weight 600, letter spacing -0.2
- **titleMedium:** 18px, line height 24, weight 600, letter spacing -0.18
- **titleSmall:** 16px, line height 22, weight 600, letter spacing -0.16
- **bodyMedium:** 14px, line height 20, weight 400, letter spacing 0
- **bodySmall:** 12px, line height 16, weight 400, letter spacing 0
- **labelMedium:** 14px, line height 20, weight 500, letter spacing 0
- **labelSmall:** 12px, line height 16, weight 500, letter spacing 0

## Spacing (from theme)

- **xs:** 4px
- **sm:** 8px
- **md:** 12px
- **base:** 16px
- **lg:** 20px
- **xl:** 24px

## Border Radii (from theme)

- **card:** 16px
- **button:** 24px (pill shape)
- **chip:** 16px

## Icons

All icons use **Ionicons** from `@expo/vector-icons`:

- **Back arrow:** 'arrow-back'
- **Location pin:** 'location'
- **Check:** 'checkmark-circle' (success color)
- **Warning:** 'alert-circle' (error color)
- **Info:** 'information-circle' (textSecondary)
- **QR:** 'qr-code' (primary color)
- **Gift/Reward:** 'gift' (primary color, used in placeholder images)
- **Dining:** 'restaurant' (categoryDining color)
- **Staycation:** 'bed' (categoryStaycation color)
- **Adventure:** 'compass' (categoryAdventure color)
- **Heritage:** 'business' (categoryHeritage color)

## Animations

- **Button press:** Scale to 0.98 with spring animation
- **Card press:** Scale to 0.98 with spring animation
- **Countdown timer:** Update text every second (no animation, just text change)

## Measurements from HTML

**Container:**
- Max width: 390px (design width)
- Horizontal padding: 16px (px-4 in Tailwind)
- Vertical gaps: 16px (gap-4 in Tailwind)

**Cards:**
- Padding: 16px (p-4)
- Border radius: 16px (rounded-2xl)

**Buttons:**
- Height: 48px
- Border radius: 24px (pill shape)
- Padding horizontal: 24px

**Chips:**
- Height: 36px
- Border radius: 16px
- Padding horizontal: 12px

**Progress Bar:**
- Height: 8px
- Border radius: 4px

**Category Icon Circle:**
- Diameter: 40px
- Border radius: 20px (full circle)

**QR Code:**
- Size: 200px

## QR Code Technical Specs

**Library:** react-native-qrcode-svg (already installed)

**Payload:** From activeClaim.qrPayload field (format: `cvt:claim:<claimId>:<token>`)

**Example:** `cvt:claim:reward-001-user-001-1730649291234:abc123def456`

**QR Properties:**
- Size: 200
- Color: primary (#004987) or black (#000000)
- Background: white (#FFFFFF)
- Error correction level: 'M' (medium)

**Countdown Timer:**
- Format: MM:SS (e.g., "14:57")
- Computed: `Math.max(0, activeClaim.expiresAt.getTime() - Date.now())`
- Update: Every 1 second with setInterval
- Stays correct after app is backgrounded
- When reaches 0: Parent component transitions to Expired state

**Ticket Reference ID:**
- Extract claim ID from activeClaim.qrPayload
- Display as plain text (no copy icon, no clipboard)

## Placeholder Image

**Reward images:**
- Use expo-image to render local placeholder
- Neutral tinted background (surface color or light gray)
- Centered gift icon (Ionicons 'gift', primary color, 48px)
- Image source from reward.imageSource field
- Aspect ratio 16:10
- Until real photos exist, all rewards use this placeholder

## Dev-Only Features

**Dev Scenario Switcher:**
- Only visible when `__DEV__` is true
- Uses `setMockScenario` function from api.ts
- Three options:
  1. "Default (450 pts, missing Adventure)"
  2. "Eligible (900 pts, all categories)"
  3. "Already Claimed"
- On selection: updates mock data, invalidates queries, re-renders

**Simulate Officer Scan Button:**
- Only visible when `__DEV__` is true AND in QR Generated state
- Button: "Simulate Officer Scan" (primary background, white text)
- On press: calls simulateClaim, shows success, navigates to list

## Notes

- All measurements are in pixels
- Use theme tokens exclusively (no hardcoded colors, spacing, typography)
- Match design images as closely as possible using React Native components
- For states without design images, follow specified layouts
- The QR code in design is placeholder - render real QR with react-native-qrcode-svg
- Countdown timer format MM:SS is computed from expiresAt timestamp
- All text is in English only
- Screen title is always "Reward Details" (singular)
