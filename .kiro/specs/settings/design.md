# Design: Settings

## Overview

The Settings screen is a scrollable view accessible from the Account screen's gear icon or "Settings & Preferences" row. It provides four sections: Device & Alerts (push notifications toggle and location services status), FAQs & Help (accordion of frequently asked questions), Official Tourism Links (four external links to tourism resources), and app version information at the bottom. The design uses white cards on a light background, with consistent spacing, border radius, and shadows matching the app's theme. All data flows through hooks that call mock API functions, ensuring no direct imports of `api.ts` or `mock-data.ts` in components.

## Architecture

### Component Hierarchy

```
SettingsScreen (src/app/settings.tsx)
├── ScreenContainer (scrollable, with back arrow via Header)
│   ├── Header (title: "Settings & Help", back arrow)
│   └── ScrollView (pb-12 for tab bar padding if nested in tabs)
│       ├── Device & Alerts Section
│       │   ├── Section Header ("DEVICE & ALERTS" with icon)
│       │   └── Card
│       │       ├── Push Notifications Row (toggle switch)
│       │       ├── Divider
│       │       └── Location Services Row (read-only status)
│       ├── FAQs & Help Section
│       │   ├── Section Header ("FAQS & HELP" with icon and "Tap to read" hint)
│       │   └── FAQ Accordion (reuse Collapsible component)
│       │       ├── FAQ Item 1 (question + expandable answer)
│       │       ├── FAQ Item 2
│       │       ├── FAQ Item 3
│       │       └── FAQ Item 4
│       ├── Official Tourism Links Section
│       │   ├── Section Header ("OFFICIAL TOURISM LINKS" with icon)
│       │   └── Links List
│       │       ├── Link Card 1 (Biyaheng South)
│       │       ├── Link Card 2 (Cavite Tourism)
│       │       ├── Link Card 3 (DOT IV-A)
│       │       └── Link Card 4 (DILG IV-A)
│       └── Footer
│           ├── App Icon
│           ├── App Name & Version
│           └── Contact Helpdesk Button
```

### Data Flow

```
SettingsScreen
  ↓
useSettings hook (src/hooks/useSettings.ts)
  ↓
getSettings / updateSettings (src/data/api.ts)
  ↓
mockSettings (src/data/mock-data.ts)

FAQs:
mockFaqs (src/data/mock-data.ts)
  ↓
Rendered directly in SettingsScreen
```

### Route Structure

Check `design/screens/11-settings/settings.png`: **The tab bar is NOT visible**, so the route MUST be a root-level route at `src/app/settings.tsx` (not nested in `(tabs)`).

## Types

### Settings Type

```typescript
// src/data/types.ts

export interface Settings {
  pushNotificationsEnabled: boolean;
}
```

### FAQ Type

```typescript
// src/data/types.ts

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  icon?: string; // Optional icon name (Ionicons)
}
```

## Mock Data

### Mock Settings

```typescript
// src/data/mock-data.ts

export let mockSettings: Settings = {
  pushNotificationsEnabled: true, // Default: notifications enabled
};
```

### Mock FAQs

```typescript
// src/data/mock-data.ts

export const mockFaqs: FAQ[] = [
  {
    id: 'faq-1',
    question: 'How do I collect stamps with the QR scanner?',
    answer: 'Point camera at the official partner QR at the site counter/entrance while location is enabled. The app validates the stamp coordinates and securely logs your digital passport stamp badge immediately.',
    icon: 'qr-code-outline',
  },
  {
    id: 'faq-2',
    question: 'How do points and rewards redemption work?',
    answer: 'Each category earns points per stamp: Dining 150, Staycation 200, Adventure 100, Heritage 50, and Festival 50 (bonus only). To redeem rewards, you need at least 700 points AND at least one stamp from each of Dining, Staycation, Adventure, and Heritage. You can claim one prize per promo period at the Cavite Tourism Office.',
    icon: 'gift-outline',
  },
  {
    id: 'faq-3',
    question: 'Can I scan a site QR code more than once?',
    answer: 'Each site QR grants points once per active promotional season. Returning visits during the same promo period will not earn additional points, but you can collect stamps again in the next promo period.',
    icon: 'sync-outline',
  },
  {
    id: 'faq-4',
    question: 'What should I do if the scanner cannot verify my location?',
    answer: 'Ensure GPS is set to High Accuracy and camera permissions are granted. If you are indoors or in mountain areas with weak GPS, step outside near the entrance checkpoint or connect to the venue's Wi-Fi network.',
    icon: 'location-outline',
  },
];
```

## API Functions

### getSettings

```typescript
// src/data/api.ts

/**
 * Get user settings
 */
export async function getSettings(): Promise<Settings> {
  await randomDelay();
  return mockSettings;
}
```

### updateSettings

```typescript
// src/data/api.ts

/**
 * Update user settings
 */
export async function updateSettings(settings: Partial<Settings>): Promise<Settings> {
  await randomDelay();
  
  // Update mock settings (in-memory, for this UI-first phase)
  mockSettings = { ...mockSettings, ...settings };
  
  return mockSettings;
}
```

## Hook: useSettings

```typescript
// src/hooks/useSettings.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings } from '@/data/api';
import { Settings } from '@/data/types';

export function useSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  });

  const mutation = useMutation({
    mutationFn: (newSettings: Partial<Settings>) => updateSettings(newSettings),
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(['settings'], updatedSettings);
    },
  });

  const updateSetting = (key: keyof Settings, value: boolean) => {
    mutation.mutate({ [key]: value });
  };

  return {
    settings,
    isLoading,
    updateSetting,
    isUpdating: mutation.isPending,
  };
}
```

## Constants

### Social Links

```typescript
// src/lib/constants.ts

// Social Links (TBD - pending Tourism Office URLs)
export const SOCIAL_LINKS = {
  BIYAHENG_SOUTH: 'https://example.com/biyaheng-south', // TBD
  CAVITE_TOURISM: 'https://example.com/cavite-tourism', // TBD
  DOT_4A: 'https://example.com/dot-region4a', // TBD
  DILG_4A: 'https://example.com/dilg-region4a', // TBD
};
```

## UI Components

### Settings Screen

**File:** `src/app/settings.tsx`

**Structure:**

1. **ScreenContainer** with `scrollable={true}`, `showHeader={true}`, `headerTitle="Settings & Help"`, `showBackButton={true}`
2. **Main Content** (paddingHorizontal: 16, paddingVertical: 20, gap: 24)
   - **Device & Alerts Section**
     - Section header with tune icon, "DEVICE & ALERTS" title (uppercase, 12px, bold, primary)
     - White card with border radius 16, border, shadow
       - Push Notifications Row
         - Icon in colored circle (notifications_active)
         - Title "Push Notifications" (15px, semibold)
         - Subtitle "Get alerts for new stamp locations, events, and promo deadlines." (12px, text secondary)
         - Toggle switch (on = primary color, off = gray)
       - Divider
       - Location Services Row (read-only)
         - Icon in colored circle (location_on)
         - Title "Location Services" (14px, semibold)
         - Subtitle "Used for geo-verifying site stamps" (12px, text secondary)
         - "Active" badge (green, with animated green dot)
   - **FAQs & Help Section**
     - Section header with quiz icon, "FAQS & HELP" title (uppercase, 12px, bold, primary), "Tap to read" hint (11px, medium, text secondary)
     - FAQ Accordion (gap: 10)
       - FAQ Item 1 (expanded by default in design, but start collapsed in code)
         - Pressable header with icon, question title (14px, semibold), chevron (rotates when expanded)
         - Expandable answer (13px, text secondary, background: light gray, border radius 12, padding 12)
       - FAQ Items 2-4 (same structure, collapsed by default)
   - **Official Tourism Links Section**
     - Section header with account_balance icon, "OFFICIAL TOURISM LINKS" title (uppercase, 12px, bold, primary)
     - Links grid (gap: 10)
       - Link Card 1: Biyaheng South
         - Icon in colored circle (explore, amber background)
         - Title "Biyaheng South" (14px, semibold) with verified badge
         - Subtitle "Official South Luzon Tourism guide" (12px, text secondary)
         - External link icon in circle
       - Link Card 2: Cavite Provincial Tourism
         - Icon in colored circle (assured_workload, primary background)
         - Title "Cavite Provincial Tourism" (14px, semibold) with verified badge
         - Subtitle "Cavite Provincial Capitol, Trece Martires" (12px, text secondary)
         - External link icon in circle
       - Link Card 3: DOT IV-A
         - Icon in colored circle (travel_explore, emerald background)
         - Title "DOT IV-A" (14px, semibold)
         - Subtitle "Department of Tourism CALABARZON" (12px, text secondary)
         - External link icon in circle
       - Link Card 4: DILG IV-A
         - Icon in colored circle (shield, blue background)
         - Title "DILG IV-A" (14px, semibold)
         - Subtitle "Dept. of the Interior & Local Government" (12px, text secondary)
         - External link icon in circle
   - **Footer** (paddingTop: 16, border top, center-aligned)
     - App icon (48px, rounded square, primary background, badge icon)
     - App name "Cavite Tourism Passport" (14px, bold, primary)
     - Version "v{APP_VERSION} (Official Provincial Android Build)" (12px, medium, text secondary)
     - Contact Helpdesk button (rounded full, surface background, primary text, 13px, semibold, with icon)
     - "Official Digital System • Province of Cavite" (11px, text secondary, with green dot)

### Opening External Links

Use `expo-linking` to open URLs:

```typescript
import * as Linking from 'expo-linking';

const handleLinkPress = async (url: string) => {
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
  } else {
    Alert.alert('Error', 'Cannot open this link.');
  }
};
```

Or use `expo-web-browser` for in-app browser:

```typescript
import * as WebBrowser from 'expo-web-browser';

const handleLinkPress = async (url: string) => {
  await WebBrowser.openBrowserAsync(url);
};
```

Choose `expo-web-browser` for a better in-app experience (recommended).

### Reusing Collapsible Component

The existing `src/components/ui/collapsible.tsx` component can be adapted for FAQs, but the design requires custom styling. Consider creating a custom FAQ accordion component for this screen instead of reusing Collapsible (which has a different visual style).

**Custom FAQ Item:**

```tsx
interface FAQItemProps {
  faq: FAQ;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ faq, isOpen, onToggle }: FAQItemProps) {
  return (
    <View style={styles.faqCard}>
      <Pressable
        style={styles.faqHeader}
        onPress={onToggle}
      >
        <View style={styles.faqHeaderLeft}>
          <View style={styles.faqIcon}>
            <Ionicons name={faq.icon || 'help-circle-outline'} size={17} color={colors.primary} />
          </View>
          <Text style={styles.faqQuestion}>{faq.question}</Text>
        </View>
        <Ionicons
          name="chevron-down"
          size={20}
          color={colors.primary}
          style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
        />
      </Pressable>
      {isOpen && (
        <View style={styles.faqAnswerContainer}>
          <View style={styles.faqAnswerBox}>
            <Text style={styles.faqAnswer}>{faq.answer}</Text>
          </View>
        </View>
      )}
    </View>
  );
}
```

## Visual Design Tokens

From `design/screens/11-settings/settings.html`:

- Section header icons: 20px, filled, primary color
- Section header titles: 15px, bold, primary, uppercase, tracking 0.8px
- Card background: `colors.background` (#FFFFFF)
- Card border: `colors.border` with opacity 0.6
- Card border radius: 16px (radii.card)
- Card shadow: shadows.card
- Toggle on background: `colors.primaryContainer` (#004987)
- Toggle off background: `#C2C6D2` (outline-variant)
- Toggle knob: white, 20px width/height, border radius full
- FAQ answer background: `#F4F7FC`
- FAQ answer border: `#E3EAF4`
- Link card active press scale: 0.99
- Verified badge icon: filled star or checkmark, `#F89C48` (passport-foil) or primary
- Active badge: emerald background, emerald border, emerald text, with pulsing green dot
- Footer icon container: 48px, border radius 16px, primary background, border passport-foil

## Behavior

### Push Notifications Toggle

- Tapping the toggle calls `updateSetting('pushNotificationsEnabled', !currentValue)`
- The toggle animates the knob position and background color
- The state is persisted via `updateSettings` API function (mock, in-memory for now)

### FAQ Accordion

- Each FAQ item starts collapsed (despite design showing FAQ 1 expanded)
- Tapping a question expands or collapses its answer
- The chevron icon rotates 180 degrees when expanded
- Only one FAQ can be open at a time (optional: allow multiple open)

### External Links

- Tapping a link opens the URL in `expo-web-browser` (in-app browser) or `expo-linking` (external browser)
- Use `WebBrowser.openBrowserAsync(url)` for a better in-app experience
- Show error alert if URL cannot be opened

### Android Back Button

- From Settings screen, Android back button navigates back to Account screen
- Use `expo-router`'s built-in navigation handling (no custom listener needed if using Header's back button)

## Differences from Design

### Intentional Omissions
- The design shows FAQ 1 expanded by default, but the code implementation starts all FAQs collapsed for consistency
- The design HTML uses Tailwind classes and web components; the React Native implementation uses StyleSheet and theme tokens
- The "Contact Tourism Helpdesk" button in the footer is non-functional (placeholder, no email integration in this spec)

### TBD Placeholders
- Social link URLs are example.com placeholders (marked TBD in constants)
- The geofence distance and claim QR expiry are not mentioned in FAQs (TBD values)

## Edge Cases

- **No internet connection:** Settings screen still loads (mock data is local)
- **Toggle spam:** Rapid toggling is debounced by React Query's mutation state (only one update at a time)
- **Invalid URLs:** Show error alert if link cannot be opened
- **Long FAQ answers:** Answers wrap and expand vertically (no horizontal scroll)

## Testing Checklist

- [ ] Settings screen opens from Account screen via gear icon
- [ ] Settings screen opens from Account screen via "Settings & Preferences" row
- [ ] Back arrow navigates back to Account screen
- [ ] Android back button navigates back to Account screen
- [ ] Push notifications toggle switches on and off
- [ ] Push notifications state persists after closing and reopening app
- [ ] Location Services status shows "Active" badge (read-only)
- [ ] FAQs expand and collapse with animated chevron
- [ ] FAQ answers match the rules in `docs/app.md` (points per category, reward eligibility)
- [ ] FAQ answers do NOT mention geofence distance or claim QR expiry
- [ ] Four social links display correctly
- [ ] Tapping a social link opens in browser (in-app or external)
- [ ] App version displays correctly from `APP_VERSION` constant
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No linting errors (`npx expo lint`)
- [ ] DIFFERENCES.md lists all visual/behavioral differences from design images
