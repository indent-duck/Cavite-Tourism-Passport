---
name: Cavite Tourism Passport
colors:
  surface: '#faf9ff'
  surface-dim: '#ccdaff'
  surface-bright: '#faf9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8ff'
  surface-container-highest: '#d9e2ff'
  on-surface: '#0a1b39'
  on-surface-variant: '#424750'
  inverse-surface: '#21304f'
  inverse-on-surface: '#edf0ff'
  outline: '#727781'
  outline-variant: '#c2c6d2'
  surface-tint: '#28609f'
  primary: '#003260'
  on-primary: '#ffffff'
  primary-container: '#004987'
  on-primary-container: '#89baff'
  inverse-primary: '#a4c8ff'
  secondary: '#994700'
  on-secondary: '#ffffff'
  secondary-container: '#fc8127'
  on-secondary-container: '#602a00'
  tertiary: '#003a1b'
  on-tertiary: '#ffffff'
  tertiary-container: '#00542a'
  on-tertiary-container: '#61cc84'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d4e3ff'
  primary-fixed-dim: '#a4c8ff'
  on-primary-fixed: '#001c3a'
  on-primary-fixed-variant: '#004784'
  secondary-fixed: '#ffdbc8'
  secondary-fixed-dim: '#ffb68b'
  on-secondary-fixed: '#321200'
  on-secondary-fixed-variant: '#753400'
  tertiary-fixed: '#8df9ac'
  tertiary-fixed-dim: '#71dc92'
  on-tertiary-fixed: '#00210d'
  on-tertiary-fixed-variant: '#005229'
  background: '#faf9ff'
  on-background: '#0a1b39'
  surface-variant: '#d9e2ff'
  surface-card: '#F4F6FA'
  background-canvas: '#FFFFFF'
  text-secondary: '#6B7280'
  border-divider: '#E5E7EB'
  status-error: '#D64545'
  passport-leather: '#0B2A4A'
  passport-foil: '#F89C48'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.75rem
  margin: 1rem
  margin-lg: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system establishes a clean, modern civic-lifestyle experience tailored specifically for Android users exploring the historic and natural attractions of Cavite. The design reconciles two complementary aesthetics: a contemporary, functional Material Design 3 interface for site discovery, trip planning, and account management, contrasted with a tactile, skeuomorphic booklet motif exclusively reserved for the digital passport.

The interface evokes regional pride, adventure, administrative trust, and gamified exploration. It maintains generous whitespace, structured typographic clarity, and purposeful focal highlights. The overarching style adheres to Modern Cleanism—grounded by high-contrast typographic heirarchies, lightweight structural containers, and intuitive pill-shaped controls—allowing site photography and commemorative stamp assets to take center stage.

## Colors

The color system is derived from the official regional identity of Cavite: deep authoritative Navy Blue complemented by energetic, celebratory Vibrant Orange.

- **Primary (`#004987`)**: Anchors global structure, top navigation headers, active navigation tabs, and system identity markers.
- **Secondary (`#F47B20`)**: Reserved exclusively for high-intent conversion actions, key state highlights, active promo indicators, point counters, and the floating center QR scan trigger.
- **Tertiary (`#2E9E5B`)**: Serves as the success token across verified itinerary stops, collected stamps, and completed account verifications.
- **Neutral (`#1B2A49`)**: High-contrast, deep navy tone utilized for headlines, primary body content, and high-emphasis icons, ensuring readable contrast over `#FFFFFF` canvas backgrounds.

### Specialized Surfaces and Tokens
- **Surface Card (`#F4F6FA`)**: A cool, light gray-blue background applied to cards, grouped input clusters, search bars, and bottom sheets to distinguish content layers without heavy shadows.
- **Border Divider (`#E5E7EB`)**: Structural hair-thin separation for list rows and subtle outlined states.
- **Passport Booklet Colors (`passport-leather`: `#0B2A4A`, `passport-foil`: `#F89C48`)**: Restricted to the tactile Passport tab, simulating deep textured leather and hot-stamped gold-orange metallic foil.

## Typography

The typography uses Inter across all viewports to provide neutral, systematic legibility on Android devices. 

- **Display & Headlines:** Set in bold weights (`700` and `600`) using primary neutral `#1B2A49` to ensure authoritative structure in navigation bars, section headers, and modal announcements.
- **Body Text:** Uses regular weights (`400`) in `#1B2A49` for core data and `#6B7280` for secondary metadata (operating hours, addresses, helper notes).
- **Labels & Numbers:** Numbers representing points (e.g., `450 pts`) and passport credentials (`CVT-2027-000123`) utilize `title-md` and `label-lg` with tightened letterforms to preserve tabular alignment.

## Layout & Spacing

The layout is built for Android mobile screens in portrait orientation, adhering to a 4-column layout model with dynamic vertical fluid scaling.

- **Screen Margins:** Default screen margin is set to `1rem` (16px), expanding to `1.5rem` (24px) for expansive reading views (About Cavite, Reward Detail).
- **Gutters:** Standard horizontal gutter between multi-column items (e.g., photo galleries, dual stats) is `1rem`.
- **System Offsets:** Top layout bounds must account for the Android system status bar (`24dp` minimum safe area padding). Bottom layouts must reserve clearance for the 5-item Material navigation bar (`56dp` height plus system gesture pill margin).
- **Vertical Spacing Rhythm:** Standard stacked elements adhere to `space-sm` (8px) for label-to-input associations, `space-md` (16px) between grouped card elements, and `space-xl` (32px) between major thematic content blocks.

## Elevation & Depth

Visual hierarchy employs low-elevation tonal layering paired with soft ambient diffusion:

- **Level 0 (Flat Canvas):** `#FFFFFF` base canvas used for authentication, directory listings, and detail readouts.
- **Level 1 (Surface Cards & Inputs):** Rendered with `#F4F6FA` fill and a zero-blur outline (`border-divider` `#E5E7EB` at 1px). Used for destination preview cards, filter clusters, and account info containers.
- **Level 2 (Floating Action & Overlays):** The center Scan button and bottom action bars use an ambient drop shadow: `0px 4px 12px rgba(244, 123, 32, 0.28)` for the orange scan button and `0px 4px 16px rgba(27, 42, 73, 0.08)` for white navigation bars.
- **Passport Depth (Tactile Booklet):** The passport component uses an inner vignette gradient with a directional edge shadow (`0px 8px 24px rgba(11, 42, 74, 0.35)`) and realistic spine debossing to reproduce the thickness of physical passport cardstock.

## Shapes

The interface balances soft container corners with fully rounded interactive triggers:

- **Cards & Sheets (`1rem` / 16px):** Destination cards, itinerary summaries, modal dialogs, and verification containers strictly use 16px radii.
- **Pills (`9999px` / Full Radius):** Category chips, filter toggles, action buttons ("Open in Maps", "Generate claim QR"), points badges, and the center scan trigger are fully rounded to maintain tactile ergonomics.
- **Inner Form Fields:** Text input fields inherit `0.75rem` (12px) to nest naturally within standard 16px surface containers.

## Components

### Buttons & Interactive Controls
- **Primary Action:** Pill-shaped, background `#F47B20`, foreground `#FFFFFF`, height `48px`. Focused and active states darken to `#DB6812`.
- **Secondary / Outlined:** Pill-shaped, border 1.5px solid `#004987`, background transparent, foreground `#004987`.
- **Center Scan Trigger:** Raised circular button (`56px × 56px`), background `#F47B20`, icon `#FFFFFF`, elevated `6dp` above the navigation bar baseline.
- **Segmented Toggle:** Enclosed pill container (`#F4F6FA`) with a white floating pill indicating active selection (e.g., "Sites" vs "Itineraries", "Events" vs "About Cavite").

### Cards & Directories
- **Site Card:** Light gray-blue surface (`#F4F6FA`), 16px radius, full-bleed top image (16:9 ratio). Body contains category tag, primary navy title, address string in `#6B7280`, and visited badge (green circle check `#2E9E5B`). Phone and email contact details are excluded.
- **Itinerary Card:** Vertical stacked layout with cover photo, "Day tour" or "Overnight" pill tag, stop counter, and a horizontal linear progress indicator (`#2E9E5B` active fill, `#E5E7EB` track).

### Chips & Badges
- **Filter Chips:** Pill shape, 32px height. Inactive: `#FFFFFF` fill with `#E5E7EB` border and `#1B2A49` text. Active: `#004987` fill with `#FFFFFF` text.
- **Promo Indicator:** Compact pill badge with subtle border, featuring secondary orange text (`#F47B20`) over soft orange tint (`rgba(244, 123, 32, 0.08)`).
- **Points Header Token:** Persistent display of user points in `#F47B20` with bold numerical tracking directly under the profile identifier.

### Input Fields & Verification
- **Form Inputs:** 48px height, `#F4F6FA` surface fill, 12px border radius, placeholder `#6B7280`. Focus state gains 1.5px outline in `#004987`.
- **6-Digit Verification Code:** Six individual square blocks (`48px × 52px`), centered text, 12px radius, auto-focus border transitions.

### Passport Booklet
- **Cover Mode:** Authentic navy textured background (`#0B2A4A`) with debossed orange-gold foil accents (`#F89C48`) for the provincial crest, title, and passport ID.
- **Page Layout:** Cream/off-white paper texture with simulated guilloche security watermarks.
- **Stamp Slots:** Circular or framed dotted outlines (`#E5E7EB`) when uncollected; filled with slightly rotated, semi-translucent ink stamps (`#004987` or `#F47B20`) featuring site location, collection date, and verification timestamps.

### Modals & Dialogs
- **Bottom Drawers:** 24px top-radius sheets over a 40% `#1B2A49` backdrop blur. Used for permission prompts, QR result feedback, and expressway info cards.
- **Status Modals:** Centered icons (Success Green `#2E9E5B`, Error Red `#D64545`), explicit instructional headline, and single primary full-width pill button.