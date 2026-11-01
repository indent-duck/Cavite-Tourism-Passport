# Scanner Spec

## Purpose

Implements the QR code scanning feature (#5 and #6 in `docs/app.md`) for the Cavite Tourism Passport app. Tourists scan a QR code at a partner site to collect a stamp, which is verified against their GPS location. The scanner includes permission handling, a full-screen camera viewfinder, location verification with a dev-mode bypass, and five result modals (success, invalid QR, already scanned, location failed, no internet).

## Scope

This spec covers:

1. **Permission Gate** (3 stages)
   - Primer screen: camera and location explanation with "Continue" and "Not now" buttons
   - System prompts: sequential camera and location permission requests
   - Blocked screen: shown when either permission is denied, with "Grant permission" or "Open settings" buttons plus close button

2. **Camera Viewfinder**
   - Full-screen CameraView with QR code detection
   - Overlay: top close button, centered reticle (4 orange corner brackets), bottom instruction text
   - Scanning pauses when any modal is visible
   - Debouncing prevents repeated scans of the same code

3. **Scan Handling and Location Verification**
   - On QR scan, pause scanning and show "Verifying..." state
   - Read device location with 10-second timeout
   - Parse payload with `parseSiteQr("cvt:site:<siteId>")` format (TBD, open decision)
   - Check Haversine distance against GEOFENCE_DISTANCE_METERS (150m, also TBD)
   - Dev-mode bypass: `DEV_SKIP_LOCATION_CHECK = true` in `__DEV__` only

4. **Mock Stamp Collection**
   - `collectStamp(payload, coords)` in `src/data/api.ts` returns discriminated union result
   - Invalid: malformed payload or unknown site
   - Already scanned: site exists in user's stamps
   - Location failed: distance exceeds geofence (unless dev flag is on)
   - Success: add stamp to `currentMockStamps`, add points to `currentMockUser.points`, invalidate queries
   - Points per category: Dining 150, Staycation 200, Adventure 100, Heritage 50, Festival 50

5. **Result Modals** (bottom sheets with `@gorhom/bottom-sheet`)
   - **Success**: stamp graphic (partner name, municipality, date/time, verification code), points earned, total balance, "View in Passport" button (closes scanner, opens Passport tab), "Scan Another Code" button
   - **Invalid QR**: error icon, troubleshooting tips (3 items), "Try Again" and "Cancel" buttons
   - **Already Scanned**: info icon, site name and collected date, promo period note, "View in Passport" and "Back to Scanner" buttons
   - **Location Failed**: warning icon, target site name, "Check Location & Retry" and "Dismiss" buttons
   - **No Internet**: offline icon, message, "Retry Connection" and "Close Scanner" buttons

6. **Dev Test Panel**
   - Collapsible panel on bottom-left of viewfinder (only in `__DEV__`)
   - Buttons to trigger each result without scanning: "Success (Site 1)", "Invalid QR", "Already Scanned", "Location Failed", "No Internet"
   - Never appears in release builds

## Out of Scope

- Backend integration (Supabase): all data is mock-based in this UI-first phase
- Offline queueing: if there's no internet, scanning is unavailable (no pending queue)
- Festival stamps: not included in mock sites for this spec (added later in Discover/Events spec)
- Biometric or PIN verification for scanning: not required
- Manual stamp requests: handled physically at sites, not in the app
- Push notifications for scan reminders: handled separately
- Named reward tiers ("Cavite Historian"), "Zone" labels, "Historical Milestone" tags, "Pending verification" rows: omitted per `product.md`

## Key Decisions

- QR payload format: `"cvt:site:<siteId>"` (TBD, open decision, marked in constants)
- Geofence distance: 150 meters (TBD, open decision)
- Dev-mode bypass: `DEV_SKIP_LOCATION_CHECK = true` only in `__DEV__`
- Location timeout: 10 seconds
- Scanning debounce: 2 seconds (ignore repeated scans of same payload)
- Camera permission: required before viewfinder shows
- Location permission: required before viewfinder shows
- Permission primer: custom screen (no design image, matches existing app style)
- Result modals: bottom sheets (not full-screen overlays)
- "View in Passport" button: closes scanner AND navigates to Passport tab
- Stamp collection: online-only (no network state listener in this spec, offline detection is manual)
- Duplicate check: by siteId in `currentMockStamps`
- Points: match POINTS_PER_CATEGORY exactly (Heritage 50, Dining 150, Staycation 200, Adventure 100, Festival 50)

## Design References

All design images are in `design/screens/06-scanner/`:

- `scanner-viewfinder.png` and `.html`: full-screen camera with overlay
- `qr_modal_stamp_collected_success/screen.png`: success modal with stamp graphic
- `qr_modal_already_scanned/screen.png`: already scanned modal
- `qr_modal_location_check_failed/screen.png`: location failed modal
- `qr_modal_invalid_qr_code/screen.png`: invalid QR modal
- `qr_modal_no_internet_connection/screen.png`: no internet modal

**Note:** The HTML files use Tailwind and web code. Read them only for exact spacing, sizes, radii, and colors. Never copy HTML or Tailwind into the app. Rebuild with React Native components and theme tokens from `src/theme`.

## Omissions from Design Images

The following decorative elements in the design images are NOT implemented (per `docs/app.md`):

- "Historical Milestone" tags
- "Cavite Historian" or other named reward tier labels
- "Zone" labels on site cards
- "Pending verification" rows in the no-internet modal
- Hardcoded distances (e.g., "150m boundary")
- Claims about physical signage or seals

Points must match the category values exactly (Heritage 50, Dining 150, Staycation 200, Adventure 100, Festival 50).

All omissions will be documented in `DIFFERENCES.md` at the end of the spec.

## Dependencies

- Foundation spec: theme tokens, Button, ScreenContainer, useCurrentUser hook, constants
- Expo SDK packages: `expo-camera`, `expo-location` (already installed)
- `@gorhom/bottom-sheet` (already installed)
- React Query: for `useCollectStamp` mutation and query invalidation

## Files Created/Modified

### Created
- `src/lib/geo.ts`: Haversine distance calculation
- `src/hooks/useCollectStamp.ts`: React Query mutation for stamp collection
- `src/hooks/usePermissions.ts`: Camera and location permission hooks
- `src/components/scanner/ScannerViewfinder.tsx`: Full-screen camera with overlay
- `src/components/scanner/ResultSheet.tsx`: Base bottom sheet wrapper
- `src/components/scanner/SuccessSheet.tsx`: Success result modal
- `src/components/scanner/InvalidQrSheet.tsx`: Invalid QR result modal
- `src/components/scanner/AlreadyScannedSheet.tsx`: Already scanned result modal
- `src/components/scanner/LocationFailedSheet.tsx`: Location failed result modal
- `src/components/scanner/NoInternetSheet.tsx`: No internet result modal
- `src/components/scanner/DevTestPanel.tsx`: Dev-only test panel (only in `__DEV__`)
- `.kiro/specs/scanner/DIFFERENCES.md`: List of omissions from design images

### Modified
- `src/lib/constants.ts`: Add `DEV_SKIP_LOCATION_CHECK`, `parseSiteQr` function
- `src/data/types.ts`: Add `CollectStampResult` type
- `src/data/api.ts`: Add `collectStamp` function, export mutable mock data
- `src/app/scanner.tsx`: Replace placeholder with full permission gate and scan flow

## Testing Checklist

- [ ] Primer screen shows before first scan
- [ ] "Continue" button requests camera, then location permissions
- [ ] "Not now" button closes scanner
- [ ] Blocked screen shows when either permission is denied
- [ ] "Grant permission" button re-requests permission when `canAskAgain` is true
- [ ] "Open settings" button opens device settings when `canAskAgain` is false
- [ ] Viewfinder shows only after both permissions are granted
- [ ] Close button on viewfinder closes scanner
- [ ] Android back button closes scanner at any stage
- [ ] Scanning a QR code shows "Verifying..." state
- [ ] Invalid QR payload shows InvalidQrSheet
- [ ] Scanning a site the user already collected shows AlreadyScannedSheet
- [ ] Scanning from outside geofence (with dev flag off) shows LocationFailedSheet
- [ ] Scanning from inside geofence (or with dev flag on) shows SuccessSheet
- [ ] Success modal shows correct site name, date/time, points earned, total balance
- [ ] "View in Passport" button closes scanner and opens Passport tab with updated stamp count
- [ ] "Scan Another Code" button dismisses modal and resumes scanning
- [ ] Dev test panel appears in dev builds (not in release)
- [ ] Dev test panel buttons trigger each result modal
- [ ] Points match POINTS_PER_CATEGORY exactly (Heritage 50, Dining 150, etc.)
- [ ] No "Historical Milestone" tags, "Cavite Historian" labels, "Zone" labels, or "Pending verification" rows

## Notes

- Camera uses `CameraView` from `expo-camera` (not the deprecated `Camera` component)
- Location uses `Location.getCurrentPositionAsync` with 10-second timeout
- Haversine formula: `2 * R * asin(sqrt(sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)))`
- Result modals are bottom sheets (drag handle, rounded top corners, bottom safe area padding)
- Duplicate scan check compares siteId in `currentMockStamps` array
- Mock stamps are added to `currentMockStamps` in memory (no persistence yet)
- Queries are invalidated on success: `['currentUser']` and `['stamps']`
- Android back button handled via `BackHandler` hook
- Permission primer has no design image, so it matches existing app patterns (Button, ScreenContainer)
- QR payload format and geofence distance are open decisions, marked TBD in constants
- Festival category not included in mock sites for this spec (bonus stamps added later)
- Offline detection is manual (no network state listener)
- All styling uses theme tokens, no hardcoded colors or spacing
