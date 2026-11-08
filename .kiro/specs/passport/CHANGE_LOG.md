# Passport Spec Change Log

## Change 1: Collected Stamps Only (Chronological Order)

**Date:** 2026-11-03  
**Status:** Documented (not yet implemented in code)

### What Changed

The Visas & Stamps view now shows **only collected stamps** in **chronological order** (most recent first), instead of showing all available stamp slots grouped by category with collected/uncollected states.

### Previous Design

- Showed all stamp slots (collected + uncollected) grouped by category
- Uncollected slots displayed as locked placeholders with gray borders and lock icons
- Category order: Dining, Staycation, Adventure, Heritage, Festival
- Mixed visual states (colored collected stamps + gray locked slots)

### New Design

- **Shows only collected stamps** - no uncollected/locked placeholder slots
- **Chronological order** - sorted by `collectedAt` timestamp, most recent first
- **Category badges** - each stamp displays a category badge at the top (e.g., "DINING", "HERITAGE")
  - Badge uses category color as background
  - White text, uppercase
- **Simpler implementation** - no need to track all available sites/events or render locked states
- **Better empty state** - when user has 0 stamps, shows:
  - Centered icon (map or compass)
  - Title: "Start Your Journey!"
  - Message: "Scan QR codes at partner sites to collect your first stamp."

### Rationale

**User Experience Benefits:**
1. **Achievement focus** - Emphasizes what the user has accomplished rather than what's missing
2. **Less clutter** - Cleaner view without locked placeholders
3. **Natural story** - Chronological order tells the journey story like a travel journal
4. **Better empty state** - Encouraging message instead of many locked slots
5. **Physical passport metaphor** - Physical passports only show stamps you've collected

**Progress Communication:**
- Summary card already shows "N of TOTAL" stamps and completion percentage
- Missing categories are communicated in Rewards screen (locked rewards show reason: "Missing stamps from: Adventure, Heritage")
- FAQ/Help section explains reward requirements
- No need to duplicate progress information in the stamps view

**Technical Benefits:**
1. **Simpler logic** - No need to map all sites/events to slots
2. **Less conditional rendering** - All stamps use the same "collected" appearance
3. **Better performance** - Fewer components rendered (only collected stamps, not all possible slots)
4. **Cleaner code** - No mixed state management

### Files Updated

**Documentation:**
- `.kiro/specs/passport/design.md` - Updated Visas & Stamps Card section
- `.kiro/specs/passport/requirements.md` - Updated requirements 2.6, 2.7, removed 2.8 (uncollected state)
- `.kiro/steering/tech.md` - No changes needed (general rules still apply)

**Code (pending implementation):**
- `src/components/passport/StampsCard.tsx` - Will be updated to:
  - Sort stamps by `collectedAt` descending
  - Remove site grouping logic
  - Remove uncollected slot rendering
  - Add empty state UI
- `src/components/passport/StampSlot.tsx` - Will be updated to:
  - Add category badge at top of each stamp
  - Remove uncollected state styling and logic
  - Simplify to single "collected" appearance

### Implementation Notes

**Data Flow:**
```typescript
// Before: All sites + all events → map to slots → check collected state
const allSlots = [...sites, ...festivalEvents].map(item => ({
  site: item,
  stamp: findStampForSite(stamps, item.id),
  category: item.category,
}));

// After: Filter collected stamps → sort by date → render
const collectedStamps = stamps
  .sort((a, b) => b.collectedAt.getTime() - a.collectedAt.getTime());
```

**Empty State:**
```typescript
{stamps.length === 0 ? (
  <EmptyState />
) : (
  <StampGrid stamps={collectedStamps} />
)}
```

**Category Badge:**
- Small pill at top of each stamp
- Background: category color (e.g., colors.categoryDining)
- Text: category name in uppercase (e.g., "DINING")
- White text for contrast

### Migration Path

Since this is still in the UI-first phase with no production users:
1. Update documentation ✅ (completed)
2. Update components in next implementation session
3. Test on device with various stamp counts (0, 1, 4, 10+)
4. Verify empty state is encouraging and clear
5. Verify chronological sorting works correctly

### Open Questions

None - design decision finalized with user approval.
