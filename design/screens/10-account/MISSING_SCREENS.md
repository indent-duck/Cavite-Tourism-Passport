# Missing Screen Images

The following screens are referenced in the account spec but do not have actual PNG files:

## Files to Download

### 1. logout-confirmation.png
- **Description:** Log out confirmation modal overlay
- **Referenced in:** 
  - `.kiro/specs/account/README.md`
  - `.kiro/specs/account/DESIGN.md`
  - `.kiro/specs/account/tasks.md`
- **Status:** Placeholder file was deleted, needs actual PNG from Stitch project

### 2. privacy-policy-terms.png
- **Description:** Privacy Policy & Terms screen
- **Referenced in:**
  - `.kiro/specs/account/README.md`
  - `.kiro/specs/account/DESIGN.md`
  - `.kiro/specs/account/tasks.md`
- **Status:** Placeholder file was deleted, needs actual PNG from Stitch project

## Action Required

Download the actual PNG screenshots from the Stitch project using the `mcp_stitch_download_file` tool or similar method. The files should be:
- Actual PNG images (not text placeholders)
- 780px wide (2x export at 390px design width)
- Android mobile portrait orientation

## How to Download

If you have access to the Stitch project:
1. List all screens in the project
2. Find the screens matching "logout confirmation" and "privacy policy"
3. Download the screenshot files using the appropriate Stitch screen IDs
4. Save them as `logout-confirmation.png` and `privacy-policy-terms.png` in this folder

## Workaround

Until the actual design images are available, developers can:
- Reference similar modal designs from other screens (e.g., scanner result modals)
- Follow the detailed layout descriptions in `.kiro/specs/account/DESIGN.md`
- Use the standard modal patterns and theme tokens from `src/theme`
