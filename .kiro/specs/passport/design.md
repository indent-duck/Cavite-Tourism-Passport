# Design: Passport

## Visual Reference

- **Primary source**: `design/screens/05-passport/passport-identity-full.png` and `passport-stamps-full.png`
- **HTML reference**: Use `.html` files for exact spacing, sizes, radii, and colors only
- **Never copy**: HTML structure, Tailwind classes, or web-specific code

## Screen Layout

### Overall Structure
1. Summary card (always visible)
2. Segmented toggle (Identity Page / Visas & Stamps)
3. Passport card (Identity Page OR Visas & Stamps based on toggle)
4. "View Rewards" button
5. Note text

### Summary Card Design

```
┌─────────────────────────────────────┐
│ 📖 Digital Passport  [●Active Season]│
│                                      │
│ ┌─────────┐  ┌─────────┐           │
│ │ Stamps  │  │ Balance │           │
│ │  N of   │  │  450    │           │
│ │ TOTAL   │  │  PTS    │           │
│ └─────────┘  └─────────┘           │
│                                      │
│ Overall Completion      ██████░░ 25%│
└─────────────────────────────────────┘
```

**Specs:**
- White background (#FFFFFF)
- 16px radius, card shadow from theme
- 16px padding
- Active Season badge: green dot (6px diameter) + text, emerald background
- Tiles: left tile blue background, right tile orange background
- Progress bar: gradient from orange to lighter orange, 8px height

### Identity Page Card Design

```
┌─────────────────────────────────────┐
│ 🛡️ Province of Cavite  [PASSPORT]   │ ← Navy header
│    Official Passport                │
├─────────────────────────────────────┤
│                                      │ ← Cream body
│    👤                                │
│   ICON       CVT-2027-000123        │
│              Passport ID             │
│                                      │
│              Juan Dela Cruz          │
│              Full Name               │
│                                      │
│              Imus, Cavite            │
│              Address                 │
│                                      │
│  Issued: 01 JAN 2027                │
│  Valid Through: 31 MAR 2027         │
│                                      │
├─────────────────────────────────────┤
│ Cavite Tourism Passport  PAGE 01    │ ← Beige footer
└─────────────────────────────────────┘
```

**Specs:**
- Header: navy background (colors.primary), orange bottom border (colors.passportHeaderBorder)
- Left side: shield icon, two-line text (issuer line and subtitle from constants)
- Right side: badge with label from constant
- Body: cream background (colors.passportCream), plain tint (no pattern)
- Person icon: Ionicons 'person-circle', 80px, primary color
- Field labels in English: "Passport ID", "Full Name", "Address", "Issued", "Valid Through"
- Passport ID: 'monospace' fontFamily
- Footer: beige background, 6px vertical padding
- All text in English only
- 16px radius, navy border

### Visas & Stamps Card Design

```
┌─────────────────────────────────────┐
│ 🎖️ Official Stamps     [4 STAMPED]  │ ← Navy header
├─────────────────────────────────────┤
│                                      │ ← Cream body
│  ┌─────────┐  ┌─────────┐          │
│  │ DINING  │  │HERITAGE │          │
│  │ Café A  │  │ Fort A  │          │ 2-column grid
│  │ Amadeo  │  │  Kawit  │          │
│  │JAN 14'27│  │FEB 20'27│          │
│  │ +150pts │  │ +50 pts │          │
│  │✓Stamped │  │✓Stamped │          │
│  └─────────┘  └─────────┘          │
│                                      │
│  ┌─────────┐  ┌─────────┐          │
│  │   🔒    │  │   🔒    │          │
│  │Adventure│  │Festival │          │ Uncollected
│  │ Site B  │  │  Fest A │          │
│  │Tagaytay │  │ Cavite  │          │
│  │[+100pts]│  │ [+50pts]│          │
│  │○Uncoll. │  │○Uncoll. │          │
│  └─────────┘  └─────────┘          │
│                                      │
├─────────────────────────────────────┤
│ OFFICIAL STAMP REGISTER  PAGE 02    │ ← Beige footer
└─────────────────────────────────────┘
```

**Specs:**
- Header: navy with title on left (from PASSPORT_STAMPS_TITLE constant) and "N STAMPED" pill badge (white text on dark navy) on right
- Body: cream background, 2-column grid (48% width each, 4% gap)
- Footer: beige background with text from PASSPORT_STAMPS_HEADER constant
- All text in English only
- **Collected**: Category color border (dashed), tinted background
  - Deterministic rotation transform (hash siteId)
  - Category label, site name, municipality
  - Date only: "JAN 14, 2027" format
  - Points and green check icon
- **Uncollected**: Gray border (dashed), white background
  - Lock icon (20px)
  - Gray text, orange points badge
  - No rotation

### Stamp Slot Colors (from theme)

- **Dining**: colors.categoryDining
- **Staycation**: colors.categoryStaycation
- **Adventure**: colors.categoryAdventure
- **Heritage**: colors.categoryHeritage (one fixed color)
- **Festival**: colors.categoryFestival

### Typography

- Title: titleMedium (16px, 600 weight)
- Body: bodyMedium (14px, 400 weight)
- Labels: labelMedium (12px, 600 weight)
- Small labels: labelSmall (10px, 700 weight)
- Passport ID: monospace font

### Spacing

- **Screen container padding**: `spacing.sm` for horizontal and top padding (tighter margins)
- Card padding: 16px
- Tile gap: 8px
- Section margins: 12-16px
- Slot padding: 12px
- Icon-text gap: 8px
- Toggle bottom margin: `spacing.xl` (more space between toggle and card below)

## Removed Elements

From design images but removed per product requirements:

1. ~~Machine-readable code strip~~ (encodes birth date/sex not collected)
2. ~~"URI / TYPE: P - REGULAR" field~~ (not needed)
3. ~~"Republika ng Pilipinas"~~ (changed to "Province of Cavite")
4. ~~"HOLDER PHOTO" caption~~ (redundant)
5. ~~Faint guilloche pattern~~ (plain tint instead)
6. ~~"Pending Slot" state~~ (Festival only shows Stamped/Uncollected)
7. ~~Alternating Heritage colors~~ (one fixed color)
8. ~~Filipino/Tagalog text~~ (all text translated to English only)
   - "PASAPORTE" → "PASSPORT"
   - "Republika ng Pilipinas" → "Province of Cavite"
   - "Opisyal na Pasaporte" → "Official Passport"
   - "OPISYAL NA TATAK" → "Official Stamps"
   - "OPISYAL NA REHISTRO NG TATAK" → "OFFICIAL STAMP REGISTER"
   - "Pangalan" → "Full Name"
   - "Tirahan" → "Address"
   - "Petsa ng Pagkaloob" → "Issued"
   - "May Bisa Hanggang" → "Valid Through"
   - Bilingual labels use English half only

## Interactive Behaviors

### View Toggle
- Click "Identity Page": show Identity card, hide Stamps card
- Click "Visas & Stamps (N)": hide Identity card, show Stamps card
- Active tab: primary blue background, white text
- Inactive tab: transparent, gray text
- View state is local only, changed by toggle

### Button Actions
- "View Rewards": navigate to /rewards

### States
- **Loading**: skeleton or spinner (stamps, sites, events loading)
- **Error**: error message + "Retry" button
- **Empty**: all slots uncollected, 0 stamps, 0% completion
- **Active Season badge**: only visible when promo is active

## Accessibility

- All touch targets: minimum 44x44px
- Icon labels: accessible names for screen readers
- Color contrast: WCAG AA minimum
- Text: scalable with system font size settings
- Tab order: logical top-to-bottom flow

## Responsive Considerations (Android only)

- Portrait orientation only
- Safe areas: top (Header applies it), left, right (ScreenContainer)
- Bottom padding: withTabBarPadding={true} prevents tab bar overlap
- Android back button: close passport, return to previous screen
- Keyboard: no text input on this screen

## Animation

- View toggle: smooth transition between Identity and Stamps cards
- Stamp slots: deterministic rotation (derived from siteId hash)
- No other animations required (scroll is native)

## Edge Cases

1. **No stamps**: Show all slots as uncollected, 0% completion
2. **No festivals**: Festival section still shows (at least one event has festivalStamp)
3. **Long names**: Truncate with ellipsis, test with "Battle of Binakayan-Dalahican Monument"
4. **Promo inactive**: Hide "Active Season" badge
5. **Missing promo dates**: Show placeholder or hide date fields

## Testing Checklist

- [ ] Summary card shows correct counts (N of TOTAL, points)
- [ ] Active Season badge shows only when promo is active
- [ ] Identity Page shows all user details correctly
- [ ] Identity Page uses English field labels only
- [ ] Stamps are grouped by category in correct order
- [ ] Collected stamps have deterministic rotation
- [ ] Collected stamps show date only (no time)
- [ ] Uncollected slots show lock icon
- [ ] Festival section shows at least one slot
- [ ] Toggle switches between views
- [ ] "View Rewards" button navigates to /rewards
- [ ] Scan a site, press Dismiss, open Passport tab, verify new stamp appears
- [ ] After collecting a stamp, verify stamp count and completion bar are updated
- [ ] After collecting a stamp, verify header points match
- [ ] Loading state shows while queries load
- [ ] Error state shows with retry button
- [ ] Empty state works (0 stamps, temporarily modified then reverted)
- [ ] No Filipino or Tagalog text appears anywhere (English only)
- [ ] Android back button works
- [ ] Safe areas respected
- [ ] Tab bar doesn't cover content
- [ ] All theme tokens used (no hex values)
- [ ] Monospace font for Passport ID
- [ ] All text from constants (no hardcoded strings)
