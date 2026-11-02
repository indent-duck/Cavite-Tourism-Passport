# Scanner Result Modals - Design Differences

This document lists intentional omissions from the design images in `design/screens/06-scanner/qr_modal_*/screen.png` per `docs/app.md` and `product.md` requirements.

## Omissions from Design Images

### All Result Modals
- ❌ **"Historical Milestone" tags** - Not implemented (decorative only, not in app.md)
- ❌ **"Cavite Historian" tier labels** - Not implemented (named reward tiers omitted per product.md)
- ❌ **"Zone" labels** - Not implemented (decorative only, not in app.md)
- ❌ **Hardcoded distances** (e.g., "150m boundary") - Not hardcoded in UI copy (uses constant from `src/lib/constants.ts` instead)
- ❌ **Claims about physical signage or seals** - Generalized to avoid assumptions about physical implementation

### Success Modal (`qr_modal_stamp_collected_success/screen.png`)
- ✅ Points match POINTS_PER_CATEGORY exactly:
  - Heritage: 50 pts
  - Dining: 150 pts
  - Staycation: 200 pts
  - Adventure: 100 pts
  - Festival: 50 pts (not in mock data for this spec)
- ✅ Stamp badge shows site name, municipality, verification code (stamp ID), and date/time
- ✅ No reward tier labels displayed

### Invalid QR Modal (`qr_modal_invalid_qr_code/screen.png`)
- ✅ All 3 troubleshooting tips included
- ✅ "Official Seal Partner" note included (without specific seal imagery)
- ❌ No references to specific physical seal appearance

### Already Scanned Modal (`qr_modal_already_scanned/screen.png`)
- ✅ Shows site name and collected date
- ✅ Promo period dates from `usePromoPeriod` hook (not hardcoded)
- ✅ No decorative "zone" or "tier" labels

### Location Failed Modal (`qr_modal_location_check_failed/screen.png`)
- ✅ Shows target site name and municipality
- ❌ **Hardcoded distance "150m boundary"** - Not displayed in UI (geofence distance is a constant, not shown to user)
- ✅ Generic verification message without specific distance values
- ✅ GPS tip included

### No Internet Modal (`qr_modal_no_internet_connection/screen.png`)
- ❌ **"Pending verification" row** - Not implemented (offline queueing is out of scope per product.md)
- ❌ **"Detected Target: Emilio Aguinaldo Shrine"** section - Not implemented (no offline queue)
- ✅ Network tip included
- ✅ Generic message about requiring internet connection

## Implementation Notes

1. All modals use theme tokens from `src/theme` - no hardcoded colors or spacing
2. All modals are bottom sheets with drag handle, not full-screen overlays
3. Button actions are passed as props for maximum flexibility
4. All text uses Inter font family from typography scale
5. Icons use Ionicons from `@expo/vector-icons`
6. Safe area insets respected for bottom padding
7. Points values come from `POINTS_PER_CATEGORY` constant in `src/data/types.ts`
8. Promo period dates come from `usePromoPeriod` hook
9. Date formatting uses `Intl.DateTimeFormat` for consistency
10. All modals support accessibility via semantic React Native components

## Design Fidelity

Where the design images show specific visual elements that are **functional** (stamps, points, dates, site names, error messages), these are implemented accurately. Where they show **decorative elements** that are not defined in `docs/app.md` or are explicitly marked as out-of-scope in `product.md`, these are omitted.

The result modals prioritize:
1. **Functional accuracy** - Show correct data, allow correct actions
2. **Visual consistency** - Match app theme and design system
3. **Content clarity** - Clear messages without unsupported assumptions
4. **Scope adherence** - Only implement what's defined in requirements
