# Project Structure

## Folder layout

```
app/                         # Expo Router routes only, kept thin
  _layout.tsx
  (auth)/
    _layout.tsx
    login.tsx
    signup/
      email.tsx
      verify.tsx
      details.tsx
    forgot/
      email.tsx
      verify.tsx
      new-password.tsx
      success.tsx
  (tabs)/
    _layout.tsx              # custom tab bar with raised center Scan button
    explore.tsx              # Sites | Itineraries toggle
    passport.tsx
    scan.tsx                 # placeholder, tab button opens /scanner
    discover.tsx             # Events | About Cavite toggle
    account.tsx
  scanner.tsx                # permission gate, viewfinder, result modals
  sites/[id].tsx             # Site Information Panel
  itineraries/[id].tsx       # Itinerary Detail
  events/[id].tsx            # Event Information Panel
  rewards/index.tsx          # Rewards list
  rewards/[id].tsx           # Reward Detail
  settings.tsx

src/
  components/
    ui/                      # shared: Button, TextInput, Card, Chip, StepIndicator, ScreenContainer, Header
    explore/
    passport/
    scanner/
    rewards/
    discover/
    account/
  theme/                     # colors, spacing, typography, radii
  data/
    types.ts
    mock-data.ts             # the single file of seed data
    api.ts                   # mock now, Supabase later
  hooks/                     # useSites, useStamps, useRewards, and so on
  lib/
    query-client.ts

design/                      # visual references, not part of the app bundle
  <stitch project brief>.md
  screens/
    README.md                # screen name, Stitch screen ID, and route
    01-auth/ ... 11-settings/

docs/
  app.md                     # feature list and behavior rules (source of truth for behavior)

.kiro/
  steering/                  # product.md, tech.md, structure.md
  specs/                     # one folder per feature area
```

## Rules
- Route files in `app/` stay thin. They compose components and hooks and contain no business logic or data access.
- Feature components live in `src/components/<feature>/`. Components used by more than one feature go in `src/components/ui/`.
- Hooks are the only layer that calls `api.ts`. Components never call it directly.
- Detail screens are separate routes (`sites/[id]`, `events/[id]`, `itineraries/[id]`, `rewards/[id]`) with a back arrow. As root-level stack routes they cover the tab bar. If the design images show the tab bar on a detail screen, nest that route inside `(tabs)` instead.
- The Scan tab is a placeholder route. Its tab button opens `/scanner` instead of showing a tab screen.
- Segmented toggles (Sites/Itineraries, Events/About Cavite) are local view state inside their tab screen, not separate routes.

## Naming
- Component files: `PascalCase.tsx` (for example `SiteCard.tsx`).
- Hooks: `useThing.ts`.
- Route files and other modules: lowercase kebab-case, with Expo Router dynamic segments like `[id]`.
- Design screenshots: numbered folder per screen, lowercase kebab-case file per state (for example `06-scanner/result-success.png`).
- Constants for open decisions (geofence distance, claim QR expiry) go in `src/lib/constants.ts`, never inline in components.

## Spec organization
Create one spec per feature area, in this order: foundation, auth, explore and sites, scanner and stamps, passport, rewards, discover, itineraries, account and settings. Each spec lives in `.kiro/specs/<name>/` and follows these steering files.
