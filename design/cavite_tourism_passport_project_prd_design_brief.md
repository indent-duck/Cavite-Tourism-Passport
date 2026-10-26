# Product Requirement Document (PRD): Cavite Tourism Passport

**Document Version:** 1.0.0  
**Status:** Approved / Prototype Ready  
**Platform:** Mobile (Android Native conventions, Portrait only)  
**Primary Target Audience:** Domestic and international tourists, day-trippers, weekend travelers, and Cavite locals exploring cultural, culinary, adventure, and heritage sites across Cavite Province.

---

## 1. Executive Summary & Vision

The **Cavite Tourism Passport** is a mobile application developed for the Provincial Government of Cavite and the Cavite Provincial Tourism and Cultural Affairs Office. It serves as the official digital adaptation of the province’s physical tourism passport.

Tourists explore registered partner establishments and heritage landmarks across Cavite’s towns and cities, scan location-gated QR codes on-site to collect digital ink stamps, accumulate exploration points, and redeem physical commemorative souvenirs and promotional perks at authorized tourism redemption desks.

### Core Objectives
1. **Promote Dispersed Provincial Tourism:** Encourage visits across all clusters of Cavite—from coastal heritage sites in Kawit and Noveleta to upland culinary and agro-tourism destinations in Tagaytay, Silang, and Amadeo.
2. **Drive Repeat Engagement:** Gamify exploration with collectible digital stamps, category badges, itinerary tracking, and tangible point redemption tiers.
3. **Streamline Site Verification:** Provide a zero-friction, GPS-verified QR scanning mechanism that guarantees visitors are physically present at legitimate sites.

---

## 2. Target Persona & User Journey

### Primary Persona: *Juan Dela Cruz*
* **Profile:** Urban explorer / weekend traveler from Metro Manila or neighboring CALABARZON provinces.
* **Goals:** Discover scenic spots, historical shrines, and local culinary gems without getting lost or overwhelmed.
* **Pain Points:** Scattered information on operating hours, unclear expressway exits/routes, lack of incentives for visiting lesser-known municipal sites.

### Key End-to-End User Flow
```
[Sign Up / Authentication] 
       ↓
[Browse Explore / Itineraries] → [View Site / Event Info] → [Open in Maps / Get Directions]
       ↓
[Arrive at Destination] → [Scan QR Code (Location Verified)] 
       ↓
[Earn Points + Ink Stamp in Digital Passport Booklet]
       ↓
[Unlock Rewards Tiers] → [Generate Single-Use Claim QR] → [Redeem at Tourism Office]
```

---

## 3. Product Architecture & Navigation

The application uses an Android Material 3 mobile navigation paradigm featuring a 5-item bottom bar anchored by a raised center action button, a persistent header with live points balance and promo period tracking, and dedicated stack views for modals and deep detail panels.

### 3.1 Global Header (Main Tab Screens)
* **User Identity:** Display user name (`Juan Dela Cruz`) and current accumulated points balance (`450 pts` in brand accent orange).
* **Interactive Trigger:** Tapping the points chip navigates directly to the **Rewards** screen.
* **Promo Banner:** Displays active campaign window (e.g., `"Promo: Jan 1 – Mar 31, 2027"`) on Explore and Passport screens.
* **Negative Constraints:** Strictly **no profile picture / avatar placeholders** across the entire UI.

### 3.2 Bottom Navigation Bar (5 Items)
1. **Explore (Tab 1):** Partner directory, curated itineraries, category filters, and interactive map view.
2. **Passport (Tab 2):** Skewmorphic digital booklet with page-turn interaction, user details, and collected ink stamps.
3. **Scan (Center Button):** Raised circular orange button triggering camera/location permission gate and clean QR scanner.
4. **Discover (Tab 4):** Segmented views for province-wide Events/Festivals and the comprehensive "About Cavite" encyclopedia & expressway guide.
5. **Account (Tab 5):** Digital passport ID card, profile information, verified contact number linking, and settings access.

---

## 4. Detailed Functional Specifications

### Screen 1: Authentication & Onboarding
* **1.1 Login Screen:**
  * Clean white backdrop; Cavite Tourism brand seal; email & password inputs; primary "Log in" action button.
  * Secondary links: "Forgot password?" and "Create an account (Sign up)".
  * *Constraint:* Standard credentials only; zero fingerprint or biometric bypass elements.
* **1.2 Sign-Up Flow (3-Step Guided Process):**
  * *Step 1 (Enter Email):* Email input field, input validation, progress tracker ("Step 1 of 3").
  * *Step 2 (Verify Code):* Display entered email, 6-digit OTP code input block, "Resend code" countdown link, "Verify" button.
  * *Step 3 (Your Details):* Full name, permanent address, secure password creation. *Constraint:* No contact number requested during initial registration.
* **1.3 Password Recovery Flow (3-Step Guided Process):**
  * Step 1: Input registered email address.
  * Step 2: 6-digit verification code check.
  * Step 3: "Set New Password" form with confirmation input and success dialog.

### Screen 2: Explore (Main Directory)
* **Segmented Mode Toggle:** Fixed toggle between **Sites** and **Itineraries**.
* **Sites View:**
  * Omnibox search bar with search-by-municipality and keyword filtering.
  * Category pill chips: `All`, `Dining`, `Staycation`, `Adventure`, `Heritage`.
  * Site Card list displaying: Cover photo, site name, category tag, full physical address, point value (e.g., `+50 pts`), and visited stamp indicator.
  * *Constraint:* **Strictly no contact details** (phone, email) in the directory listings.
  * View toggle: Switch seamlessly between List view and Map view with cluster pins.
* **Itineraries View:**
  * Four curated editorial journeys: *Day Tour A*, *Day Tour B*, *Overnight Tour A*, *Overnight Tour B*.
  * Progress tracker badge (e.g., `"2 of 4 stops stamped"`), route summary, and thumbnail collage.

### Screen 3: Site Information Panel
* **Header:** Clean top bar with Android back arrow (`←`) and page title. No save/bookmark or profile icons.
* **Gallery:** Full-width photographic carousel with 16:9 aspect ratio and thumbnail reel.
* **Metadata & Status:** Category pill, visited checkmark indicator (`Visited`), and address.
* **Operational Details:** Operating days/hours, general amenities, and historical/experiential overview.
* **Navigation Action:** Prominent **"Open in Maps"** button paired with a localized map pin preview.
* *Constraints:* No in-screen QR scan button; zero contact phone/email fields.

### Screen 4: Itinerary Detail
* Ordered sequence of tourist stops with numbered path nodes.
* Auto-checking status indicators (green checkmark once on-site stamp is verified in database).
* Integrated interactive route map showing sequenced waypoints and connecting highways.

### Screen 5: Digital Passport Booklet
* **Interactive Passport Component:**
  * Closed state: Navy blue booklet with debossed gold/orange provincial seal and user Passport ID (`CVT-2027-000123`).
  * Page 1 (Identity): Full traveler credentials, issued date, and official provincial verification mark. Zero user headshot/portrait photos.
  * Stamp Pages: Categorized stamp slots for `Dining`, `Staycation`, `Adventure`, `Heritage`, and bonus `Festival` stamps.
  * Visual treatment: Ink-stamped aesthetic with date, time, and municipal seal for acquired stamps; dashed outlines for unvisited slots.
* **Progress Footer:** Clear tally ("5 of 20 stamps collected") and secondary **"View Rewards"** button.

### Screen 6: QR Scanner & Permission Architecture
* **Permission Gate:**
  * Clear primer dialog detailing need for Camera (viewfinder) and Fine GPS Location (geofenced site confirmation).
  * Blocked fallback state if permissions are denied with direct deep link to Android App Settings.
* **Camera Viewfinder:**
  * Edge-to-edge camera viewport, high-contrast corner reticle frame, top exit button (`✕`), and contextual prompt: *"Point your camera at the site's QR code"*.
  * Clean layout without distracting camera telemetry, coordinate overlays, or extraneous controls.
* **Result Modal States:**
  1. *Stamp Collected (Success):* Visual ink stamp reveal, partner name, timestamp, point credit (`+100 pts`), and "View in Passport" action.
  2. *Invalid QR Code (Error):* Warning icon, troubleshooting text, "Try again" CTA.
  3. *Already Scanned (Notice):* *"You already collected this stamp during this promo period."*
  4. *Location Check Failed (Error):* Geofence mismatch warning requiring physical presence on site.
  5. *No Internet Connection (Notice):* Offline cache warning requiring connectivity for verification.

### Screen 7 & 9: Discover Cavite & Expressways
* **Segmented Toggle:** Toggle between **Events** and **About Cavite**.
* **Events View:**
  * Chronological feed of town fiestas, culinary fairs, and cultural festivities.
  * Date calendar badge, event title, municipality, and "Happening now" tags.
* **About Cavite & Expressway Guide:**
  * Curated thematic articles: *Historical and Topographical Riches*, *Culinary Delights*, *Cultural Immersions*.
  * Interactive Provincial Map: Visualizing towns, agricultural hubs, historical nodes, and expressway corridors.
  * Dedicated Expressway Cards: Interactive route cards for **CAVITEX**, **CAVITEX C5 Link**, and **CALAX** detailing access interchanges and travel times.

### Screen 8 & 10: Account & Settings
* **Account Screen:**
  * Digital ID Card displaying user's unique identifier (`CVT-2027-000123`).
  * Traveler profile details (Name, Registered Address, Email).
  * Verified Contact Number row with modal entry and OTP verification.
  * Settings shortcut (Gear icon) and prominent "Log out" button.
* **Settings & FAQs:**
  * Global Push Notifications toggle switch.
  * Accordion-style Frequently Asked Questions & Guidelines.
  * Verified Tourism Directory links: *Biyaheng South*, *Cavite Tourism*, *DOT IV-A*, *DILG IV-A*.

### Screen 11 & 12: Rewards Catalog & Claim QR
* **Rewards Catalog:**
  * Points summary widget with stamp category fulfillment checkmarks (`Dining ✓`, `Staycation ✓`, `Adventure ✕`, `Heritage ✓`).
  * Tiered reward cards (e.g., *Cavite Souvenir Kit* - 700 pts, *Premium Souvenir Set* - 1,000 pts).
* **Reward Detail & Claim QR:**
  * Eligibility checklist with real-time remaining point calculation.
  * State transitions: `Locked` → `Eligible` ("Generate Claim QR") → `QR Generated` (single-use token for tourism desk officer scanning).
  * System rules: Single claim per promo window restriction and "Limited quantity" badges.

### Screen 13: Event Information Panel
* Mirror layout of the Site Information Panel for visual cohesion.
* Hero photo carousel, event tags, happening now/upcoming indicator, date/time window, and "Open in Maps" action.
* Commemorative bonus indicator: `Festival stamp available: +50 bonus pts`.

---

## 5. Design System & Technical Constraints

| Property | Value / Standard | Notes |
| :--- | :--- | :--- |
| **Primary Color** | `#004987` (Deep Navy) | Headers, booklet covers, active nav states |
| **Accent Color** | `#F47B20` (Cavite Orange) | Raised scan button, CTAs, point counters |
| **Background** | `#FFFFFF` (Pure White) | Dominant container background |
| **Surface** | `#F4F6FA` (Light Gray-Blue) | Cards, segmented controls, inputs |
| **Text Primary** | `#1B2A49` (Dark Navy) | Headings, labels, primary copy |
| **Text Secondary**| `#6B7280` (Muted Slate) | Subtitles, addresses, helper text |
| **Success Color** | `#2E9E5B` (Emerald Green) | Visited badges, verified stamps |
| **Error Color** | `#D64545` (Crimson Red) | Scanned error modals, invalid codes |
| **Corner Radius** | `16px` (`rounded-2xl`) | Cards, dialogs, modals |
| **Button Shapes** | Pill (`rounded-full`) | Category chips, primary CTA buttons |
| **Typography** | `Inter`, Clean Sans-Serif | High legibility at small mobile scales |
| **Navigation** | Solid White (`#FFFFFF`) | Fully opaque, zero transparent bleed-through |

---

## 6. Non-Functional & Security Requirements

1. **Location Spoofing Prevention:** QR scans must validate device GPS coordinates against geofenced site boundaries within a ±150m threshold before awarding stamps.
2. **Offline Resilience:** App must gracefully notify users of offline conditions during verification without crashing or freezing.
3. **Single Claim Integrity:** Generated claim QR tokens are single-use and expire within 15 minutes of generation to prevent duplicate claims.
4. **Responsive Scroll Architecture:** All scrollable content areas must provide adequate clearance padding (`pb-28` to `pb-32`) to prevent UI elements from being clipped by the persistent bottom navigation bar.
