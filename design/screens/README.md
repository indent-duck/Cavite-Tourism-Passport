# Screen Design Assets

This directory contains visual references for each screen in the Cavite Tourism Passport app. Each screen has been exported from the Stitch project.

**Important:** Never copy HTML or Tailwind code into the app. Rebuild each screen with React Native components using theme tokens from `src/theme`.

## Screen Inventory

### 01-auth/
Authentication flows including login, signup (3 steps), and forgot password (3 steps + success).

| File | Stitch Screen ID | Route |
|------|-----------------|-------|
| `login.png/html` | `64251fa1397649e498428a0867048365` | `app/(auth)/login.tsx` |
| `signup-email.png/html` | `201a24f2610543c7bb982dbc294d25b7` | `app/(auth)/signup/email.tsx` |
| `signup-verify.png/html` | `0d92b05033484815b77d6a5cabdbeaab` | `app/(auth)/signup/verify.tsx` |
| `signup-details.png/html` | `467becfa083841b89477ea9e14c2e176` | `app/(auth)/signup/details.tsx` |
| `forgot-email.png/html` | `8a74c3f90394426da2d4a8420fe38539` | `app/(auth)/forgot/email.tsx` |
| `forgot-verify.png/html` | `7a792c90244a429d8e16ee0975300cc9` | `app/(auth)/forgot/verify.tsx` |
| `forgot-new-password.png/html` | `0e9c2ca799aa415aac40fb4d2647e633` | `app/(auth)/forgot/new-password.tsx` |

### 02-explore/
Explore tab with Sites/Itineraries toggle, site information, and itinerary detail screens.

| File | Stitch Screen ID | Route |
|------|-----------------|-------|
| `explore_cavite_full_view_sites.png/html` | Not yet generated | `app/(tabs)/explore.tsx` (Sites view) |
| `explore_itineraries_full_view.png/html` | Not yet generated | `app/(tabs)/explore.tsx` (Itineraries view) |
| `site_information_full_view.png/html` | Not yet generated | `app/sites/[id].tsx` |
| `itinerary_detail.png/html` | Not yet generated | `app/itineraries/[id].tsx` |

### 05-passport/
**Note:** Passport is a scrollable screen (identity section at top, then stamps below), not a page-turn booklet.

| File | Stitch Screen ID | Route |
|------|-----------------|-------|
| `passport.png/html` | `ba784c5ab1034d8a97ce4b31b0c32067` or `de4c3a209b0b4ae8a2ab97fc2dd918a8` | `app/(tabs)/passport.tsx` (initial viewport) |
| `passport-identity-full.png/html` | `6f1e0de6132346518fee07ef88e1d37c` | `app/(tabs)/passport.tsx` (scrolled to show full identity) |
| `passport-stamps-full.png/html` | `c06d9d51684b4eb089e4770a3f8962d8` | `app/(tabs)/passport.tsx` (scrolled to show stamps) |

**Passport Identity Page details:**
- Holder slot shows a generic person icon (same for every user, not a photo)
- Summary shows "4 of 20" stamps and "20%" progress to match sample data
- Festival stamp is "+50 pts" (bonus points only)
- No "Pending Slot" state
- Button reads "View Rewards"
- Stamps are collected by scanning only

### 06-scanner/
QR scanner viewfinder and result modals.

| File | Stitch Screen ID | Route |
|------|-----------------|-------|
| `scanner-viewfinder.png/html` | `e867449bfd7949d08f5322c36ca95ccc` | `app/scanner.tsx` |
| `result-success.png/html` | `6737a2c094cf4895aac4cb59188aee6c` or `1ef221659e864afc9c175bfd23634e5e` | Modal overlay on scanner |
| `result-already-scanned.png/html` | `60fb146c5f614286bece7e38e204812b` or `ca67f2335756409aa4ed782a2567b16a` | Modal overlay on scanner |
| `result-location-failed.png/html` | `cd579beb811e4f3996098dd469efe495` or `a69113b4bf1e408fadbab6645fd0601d` | Modal overlay on scanner |
| `result-invalid-qr.png/html` | `2457e4f4802b4904a03a53e0beaa8a18` or `82508590daad4042a46b6bc8d11ed472` | Modal overlay on scanner |
| `result-no-internet.png/html` | `6640dd729aee413a9ce68908d378f669` or `51eca559064f48b1ae490bd2006ce1ba` | Modal overlay on scanner |

### 07-rewards/
Rewards list and catalog.

| File | Stitch Screen ID | Route |
|------|-----------------|-------|
| `rewards-list.png/html` | `cceb4d15b9e14fb98cd2da83297e5b8c` | `app/rewards/index.tsx` |
| `rewards-list-full.png/html` | `5dd6d0d73df146da9b67d85cb56da607` | `app/rewards/index.tsx` (full scroll) |

### 08-discover/
Discover tab with Events/About Cavite toggle.

| File | Stitch Screen ID | Route |
|------|-----------------|-------|
| `discover-overview.png/html` | `a4a0ebe4e891432685549fe71f2c00d6` | `app/(tabs)/discover.tsx` (overview/landing) |
| `discover-events-full.png/html` | `983f087eaff041fc9adb6edf85d8d72e` | `app/(tabs)/discover.tsx` (Events view, full scroll) |
| `discover-about-full.png/html` | `2d5a2fa2e21b4be1a08cb22b692282d5` | `app/(tabs)/discover.tsx` (About Cavite, full scroll) |

### 09-events/
Event detail screens.

| File | Stitch Screen ID | Route |
|------|-----------------|-------|
| `event-detail.png/html` | `624ba738fd2942fb8525da7d6f4e5df0` | `app/events/[id].tsx` |
| `event-detail-full.png/html` | `b1d52e86cb114dec93a3d6804addb642` | `app/events/[id].tsx` (full scroll) |

### 10-account/
Account screen showing user info and passport ID.

| File | Stitch Screen ID | Route |
|------|-----------------|-------|
| `account.png/html` | `8cc60c3e5e494e52b321eec690c314d6` | `app/(tabs)/account.tsx` |

### 11-settings/
Settings and FAQs screen.

| File | Stitch Screen ID | Route |
|------|-----------------|-------|
| `settings.png/html` | `d1cbb229c2684d9ea7d04912092247e5` | `app/settings.tsx` |

## Missing States

The following screens and states are described in `docs/app.md` but do not have design assets:

- **Scanner permission screens:**
  - Permission primer screen (shown before first scan)
  - Permission blocked screen (when camera or location is denied, with "Open settings" button)
  
- **Forgot password:**
  - Success state (after password reset)
  
- **Account:**
  - Add contact number sheet (from Account screen, with verification)
  
- **Reward states:**
  - Reward locked (insufficient points or missing category stamps)
  - Reward eligible (meets criteria, ready to generate QR)
  - Reward claim QR generated (single-use QR display with expiry timer)
  - Reward already claimed (user already redeemed their one prize for this promo period)
  - Reward no longer available (limited quantity exhausted)
  
- **Explore:**
  - Map view (Sites shown on a map instead of list)
  
- **Global states:**
  - Empty states for all list and tab screens
  - Loading states for all list and tab screens
  - Error states for all list and tab screens

## Scale

- Image width: 390px (design width, scaled 2x for export = 780px image width)
- HTML container width: 780px
- Designs are **2x exports** (retina scale)

## Known Content Corrections

When building the app, apply these corrections from `product.md` and `docs/app.md`:

- **Heritage stamps give 50 points** (not any other value shown in designs)
- **There are no named reward tiers** (no "Cavite Historian", "Cavite Explorer", etc. labels)
- **No "Pending verification" row** in the no-internet scanner modal
- **No "Zone" labels** on site cards or detail panels
- **Category name is "Dining"** everywhere (never "Food")
- **Passport is a scrollable screen** with identity section at top and stamps below (not a page-turn booklet)
- **Festival stamps are bonus points only** (+50 pts) and do not count toward the 4-category requirement

## Notes

- Some screens have multiple Stitch IDs because the same content was generated multiple times with slight variations
- Screens marked "-full" show the same screen scrolled to bottom to capture full content
- Modal overlays (scanner results) are shown on top of the scanner viewfinder screen
- The HTML files use Tailwind and web components—translate to React Native StyleSheet with theme tokens
- All screens are Android mobile portrait (390px wide at 1x, 780px at 2x export)

## Download Instructions

To download the actual image and HTML files from Stitch:

1. Use the Stitch MCP `download_file` tool with each screen's file resource name
2. For images: use the `screenshot.name` value (e.g., `projects/18106579678473282566/files/10212987950388063370`)
3. For HTML: use the `htmlCode.name` value
4. Save images as `.png` and HTML as `.html` in the appropriate folder
