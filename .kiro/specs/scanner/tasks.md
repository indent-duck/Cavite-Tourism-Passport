# Implementation Plan: Scanner

## Overview

The Scanner spec implements the QR code scanning feature for collecting stamps at partner sites. It includes a multi-stage permission gate (primer â†’ system prompts â†’ blocked screen if denied), a full-screen camera viewfinder with QR detection, location verification (with a dev-mode bypass flag), and five result modals as bottom sheets. On success, the stamp and points are added to the mock user in memory and queries are invalidated to update the UI. A dev-only test panel provides buttons to trigger each result without scanning. No backend integration in this phaseâ€”all logic is mock-based.

## Tasks

- [x] 1. Add scanner constants and utilities
  - Add `DEV_SKIP_LOCATION_CHECK = true` constant to `src/lib/constants.ts` with comment "// Only true in __DEV__"
  - Add `parseSiteQr(payload: string): string | null` function to `src/lib/constants.ts` that extracts siteId from "cvt:site:<siteId>" format, returns null if malformed, with TBD comment noting SITE_QR_FORMAT is an open decision
  - Add Haversine distance calculation helper `getDistanceMeters(lat1, lon1, lat2, lon2): number` to new file `src/lib/geo.ts`
  - _Requirements: 3.1 (Geofence verification), open decision constants_

- [x] 2. Extend types and mock data for stamp collection
  - Add `CollectStampResult` type to `src/data/types.ts` with discriminated union: `{ success: true; stamp: Stamp } | { success: false; reason: 'invalid' | 'alreadyScanned' | 'locationFailed' | 'offline' }`
  - Add `collectStamp` function to `src/data/api.ts` that accepts `(payload: string, coords: { latitude: number; longitude: number } | null): Promise<CollectStampResult>`
  - Mock logic: parse payload with `parseSiteQr`, return invalid if malformed or unknown site, return alreadyScanned if stamp exists in `currentMockStamps` for this site, check Haversine distance unless `DEV_SKIP_LOCATION_CHECK` is true, return locationFailed if over GEOFENCE_DISTANCE_METERS, otherwise add new stamp to `currentMockStamps`, add points to `currentMockUser.points`, and return success with the new stamp
  - Export `currentMockStamps` and `currentMockUser` as mutable for in-memory updates during this UI-first phase
  - _Requirements: 2.2 (Collect stamp API), 3.1 (Location verification)_

- [x] 3. Create scanner hooks and mutations
  - Create `src/hooks/useCollectStamp.ts` as React Query mutation wrapping `collectStamp` from `api.ts`
  - On success, invalidate `['currentUser']` and `['stamps']` query keys to refresh header and Passport screen
  - Create `src/hooks/usePermissions.ts` with functions `useCameraPermission()` and `useLocationPermission()` wrapping `expo-camera` and `expo-location` permission hooks
  - Each returns `{ status, canAskAgain, requestPermission }` following Expo SDK permission conventions
  - _Requirements: 2.3 (Scanner hooks), 3.2 (Permission handling)_

- [x] 4. Implement permission gate screens
  - Replace `src/app/scanner.tsx` placeholder with full permission flow
  - Stage 1 (primer): show icon (camera outline), two short rows ("Camera: scan QR codes", "Location: confirm you are at the site"), "Continue" button (triggers permission requests sequentially), "Not now" button (closes scanner via `router.back()`)
  - Use existing UI component patterns (Button, ScreenContainer)
  - Stage 2: call `requestPermission()` for camera, then location, in sequence
  - Stage 3 (blocked): if either permission is denied, show blocked screen with title "Camera and location access needed", subtitle naming the missing permission, "Grant permission" button when `canAskAgain` is true (calls `requestPermission` again) or "Open settings" button (calls `Linking.openSettings()`) when false, plus close button
  - Add `useFocusEffect` hook to re-check permissions when app returns to foreground
  - Only advance to viewfinder when both permissions are granted
  - _Requirements: 3.2 (Permission primer and blocked screens)_

- [x] 5. Implement camera viewfinder
  - Create `src/components/scanner/ScannerViewfinder.tsx` component
  - Full-screen CameraView from `expo-camera` with `barCodeScannerSettings={{ barCodeTypes: ['qr'] }}`
  - Overlay: top close button (Ionicons 'close', 44px diameter, semi-transparent black background with backdrop blur), centered reticle (4 orange corner brackets, 256px square, matching `design/screens/06-scanner/scanner-viewfinder.png`), bottom text "Point your camera at the site's QR code" in white on semi-transparent black pill
  - Pause scanning while any modal is visible (via prop)
  - Ignore repeated scans of the same payload within 2 seconds (debounce)
  - On first scan, call `onScanCode(payload)` callback
  - Close button calls `router.back()`
  - Android back button also closes scanner (via `BackHandler` hook)
  - _Requirements: 3.3 (Viewfinder UI and scanning logic)_

- [x] 6. Implement scan handling and location check
  - In `scanner.tsx`, when `onScanCode` fires, pause scanning and show "Verifying..." state (small centered spinner with text)
  - Call `Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced, timeout: 10000 })` with 10-second timeout
  - If location read times out or services are off, set `coords` to null (will trigger locationFailed from mock)
  - Call `collectStampMutation.mutate({ payload, coords })`
  - On mutation success or error, show the appropriate result modal
  - _Requirements: 3.4 (Location read and mutation trigger)_

- [x] 7. Create result modal bottom sheets
  - Create `src/components/scanner/ResultSheet.tsx` base component wrapping `@gorhom/bottom-sheet` with drag handle, rounded top corners (24px), white background, bottom safe area padding
  - Create five variants as separate components in `src/components/scanner/` folder:
    - `SuccessSheet.tsx`: stamp graphic (circular badge with site name, municipality, verification code, date/time), "+N pts" label for category points, total balance, "View in Passport" button (closes scanner, navigates to Passport tab), "Scan Another Code" button (dismisses modal, resumes scanning)
    - `InvalidQrSheet.tsx`: error icon, "Invalid QR Code" title, troubleshooting tips list (3 items from design), "Try Again" button (dismisses modal, resumes scanning), "Cancel" button (closes scanner)
    - `AlreadyScannedSheet.tsx`: info icon, "Already Scanned" title, site name and collected date, note about one stamp per promo period with dates from `usePromoPeriod`, "View in Passport" button, "Back to Scanner" button (dismisses modal)
    - `LocationFailedSheet.tsx`: warning icon, "Location Check Failed" title, message, target site name, "Check Location & Retry" button (dismisses modal, retries scan flow), "Dismiss" button (closes scanner)
    - `NoInternetSheet.tsx`: offline icon, "No Internet Connection" title, message, "Retry Connection" button (dismisses modal, retries), "Close Scanner" button (closes scanner)
  - Match spacing, colors, and text from design images in `design/screens/06-scanner/qr_modal_*/screen.png`
  - Omit: "Historical Milestone" tags, "Cavite Historian" tier labels, "Zone" labels, "Pending verification" rows, hardcoded distances, claims about physical signage, and any reward tier references
  - Points must match POINTS_PER_CATEGORY values (Heritage 50, Dining 150, Staycation 200, Adventure 100)
  - _Requirements: 3.5 (Result modals matching design)_

- [x] 8. Wire result modals to scanner screen
  - In `scanner.tsx`, maintain state for which modal is visible: `null | 'success' | 'invalid' | 'alreadyScanned' | 'locationFailed' | 'offline'`
  - Pass mutation result to the appropriate modal component
  - "View in Passport" button: call `router.back()` to close scanner, then `router.push('/(tabs)/passport')`
  - "Scan Another Code" / "Back to Scanner" / "Try Again" buttons: dismiss modal, resume scanning
  - "Cancel" / "Dismiss" / "Close Scanner" buttons: call `router.back()` to close scanner
  - _Requirements: 3.6 (Modal routing and actions)_

- [x] 9. Create dev-only test panel
  - Create `src/components/scanner/DevTestPanel.tsx` component that only renders when `__DEV__` is true
  - Collapsible panel overlaid on bottom-left corner of scanner viewfinder with semi-transparent background
  - Buttons to trigger each result: "Success (Site 1)", "Invalid QR", "Already Scanned", "Location Failed", "No Internet"
  - Each button calls the appropriate test function that sets mock data and triggers the modal
  - "Success" button picks a site from mock data that the user has not scanned yet
  - Panel never appears in release builds
  - _Requirements: 3.7 (Dev test panel for QR-free testing)_

- [ ] 10. Checkpoint and write DIFFERENCES.md
  - Run `npx tsc --noEmit` and fix any TypeScript errors
  - Run `npx expo lint` and fix any linting errors
  - Test on physical Android phone: test all permission states, scan a test QR code (or use dev panel), verify each result modal, verify "View in Passport" updates stamp count and points
  - Write `.kiro/specs/scanner/DIFFERENCES.md` listing every omission from the design images: no "Historical Milestone" tags, no "Cavite Historian" labels, no "Zone" labels, no "Pending verification" rows, no hardcoded distances, no physical signage references, points match category values exactly (Heritage 50, etc.)
  - Confirm with user if any issues arise

## Notes

- No new native packages are installed (expo-camera and expo-location already installed in foundation)
- Do not edit `app.json` for this spec
- Camera viewfinder uses CameraView from `expo-camera` (not the deprecated Camera component)
- Location check uses `Location.getCurrentPositionAsync` with 10-second timeout
- Haversine formula for distance: `2 * R * asin(sqrt(sinÂ²(Î”lat/2) + cos(lat1) * cos(lat2) * sinÂ²(Î”lon/2)))`
- GEOFENCE_DISTANCE_METERS = 150 (from constants, already marked TBD)
- DEV_SKIP_LOCATION_CHECK is true only in `__DEV__` mode, never in release builds
- Result modals are bottom sheets with drag handle, not full-screen overlays
- "View in Passport" button closes scanner AND navigates to Passport tab
- Mock user: Juan Dela Cruz, 450 pts, 4 stamps (Dining, Staycation, 2 Heritage), zero Adventure or Festival stamps
- Sample sites must include at least one from each category for testing
- Scanned stamps are added to `currentMockStamps` in memory (later phase: persist to Supabase)
- Points are added to `currentMockUser.points` and queries invalidated
- All result modals use theme tokens, no hardcoded colors
- Android back button closes scanner at any stage
- Permission primer has no design image, so match existing auth screen style
- QR payload format is "cvt:site:<siteId>" (TBD, open decision)
- Success modal shows the stamp graphic with partner name, municipality, date/time (from collectedAt), verification code (from stamp ID), points earned (+N pts), and new total balance
- Test panel buttons are for dev convenience only, never shown in production
- InvalidQrSheet shows 3 troubleshooting tips from the design image
- LocationFailedSheet shows target site name (from the scanned payload)
- NoInternetSheet does not show "Pending verification" row (omitted per product.md)
- Use `@gorhom/bottom-sheet` for all result modals
- Stamp collection is online-only; offline detection is manual (no network state listener in this spec)
- Duplicate scan check: compare siteId in `currentMockStamps` to the scanned site
- Festival category is not included in the mock sites for this spec (Festival stamps are bonus only, added in later Discover/Events spec)

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1", "2"]
    },
    {
      "id": 1,
      "tasks": ["3"]
    },
    {
      "id": 2,
      "tasks": ["4", "5"]
    },
    {
      "id": 3,
      "tasks": ["6", "7"]
    },
    {
      "id": 4,
      "tasks": ["8", "9"]
    },
    {
      "id": 5,
      "tasks": ["10"]
    }
  ]
}
```
