# Product: Cavite Tourism Passport

## What this is
A mobile app (Android only, portrait) that is the digital version of the Province of Cavite's physical tourism passport. Tourists browse partner sites, scan a QR code on-site to collect a stamp, earn points, and redeem a prize at the tourism office.

## Current phase: UI first
Build the UI only. All data comes from mock data through `src/data/api.ts`. No real backend, auth, or network calls yet. Logic is added in a later phase, so structure code so that swapping the mock layer for Supabase touches only `api.ts`.

## Sources of truth
- **Behavior and rules:** `docs/app.md` (feature list, rules, out-of-scope items). If it conflicts with the design files, `docs/app.md` wins.
- **Visuals:** `design/` (Stitch project brief and `design/screens/` images and HTML). If it conflicts with `docs/app.md` on looks, the design wins.
- Do not implement decorative elements in the design images that are not in `docs/app.md` (for example named reward tiers such as "Cavite Historian", "zones", an offline pending-stamp queue, or "Historical Milestone" tags).
- The Stitch PRD text describes a page-turn passport booklet. The final design is a Passport screen with a summary card and a toggle between an Identity Page view and a Visas & Stamps view, so follow the images in `design/screens/05-passport` and `docs/app.md`.

## Core rules (summary, details in docs/app.md)
- **Stamps:** collected by scanning a site's QR code on-site. A location check must pass first. The partner name, date, and time are recorded.
- **Points per stamp:** Dining 150, Staycation 200, Adventure 100, Heritage 50, Festival 50.
- **Festival** stamps are bonus points only and do not replace the stamp requirement from the four main categories. They are only available while the festival is active.
- **Duplicates:** each site earns points once per promo period.
- **Reward eligibility:** at least 700 points AND at least one stamp from each of Dining, Staycation, Adventure, and Heritage. Individual rewards may cost more than 700.
- **Claiming:** generating the claim QR is optional. The QR is single-use. Points are deducted when a reward is claimed. One prize per person per promo period. Some rewards are limited and can become unavailable.
- **Promo period:** a date range set by the Tourism Office. The app only shows it.
- Category name is **Dining** everywhere (never "Food").

## Navigation
- Bottom bar with 5 items: **Explore**, **Passport**, **Scan** (raised orange circular center button), **Discover**, **Account**.
- Explore has a segmented toggle: **Sites** and **Itineraries**. Sites has a List/Map switch.
- Discover has a segmented toggle: **Events** and **About Cavite**.
- Settings opens from a gear icon on the Account screen.
- Header on main tab screens shows the user name with "[n] pts" underneath. Tapping the points opens Rewards.
- Rewards also opens from a "View rewards" button below the passport on the Passport screen.

## Hard constraints
- No avatars or profile photos. The one exception is the holder slot on the Passport Identity Page, which shows the same generic person icon for every user (not a photo, and not user-uploadable).
- Never show contact details (phone, email) for sites or events. Directory search shows addresses.
- Site and event information panels have no scan button (scanning is only the center tab button) and no reminder button.
- Sign up has 3 steps: email, 6-digit code, then name, address, and password. No contact number at sign up (added later in Account with its own verification).
- Forgot password has 3 steps: email, code, new password, then a success state.
- No biometric login.
- The scanner opens only after camera and location permissions are granted. If declined, show a blocked screen with an "Open settings" button.
- Scanning needs an internet connection. Offline shows a notice, with no queueing.

## Out of scope for this project
Manual stamp requests (handled physically at sites), promo period reset, the admin dashboard, the officer claim-scanning tool, and push notification implementation (handled separately).

## Open decisions (do not hardcode in UI copy; use constants)
Geofence distance, claim QR expiry time, and the site QR payload format.
