# Cavite Tourism Passport

The digital version of the Province of Cavite's tourism passport. Tourists
browse partner sites, scan a QR code on-site to collect a stamp, earn points,
and claim a prize at the tourism office with a single-use QR pass.

**Android only** (portrait). Built with Expo (development builds, not Expo
Go), React Native, TypeScript and Expo Router, with a Supabase backend.

## Status (2026-11-22)

| Area | Status |
| ---- | ------ |
| Auth: email sign-up with a 6-digit code, log in, forgot password, change password | ✅ Live on Supabase |
| Continue with Google (log in and sign up) | ✅ Live |
| Catalog: sites, itineraries, events, expressways, rewards, promo period | ✅ Live |
| QR stamps with server-side location check, digital passport, points | ✅ Live |
| Stamp requests (photo of a physical stamp, reviewed by an admin) | ✅ Live; reviewed in the Supabase SQL editor until the admin dashboard exists |
| Rewards: eligibility, single-use claim pass, live pass banner | ✅ Live; redeemed in the SQL editor until the officer tool exists |
| Delete account (Edge Function) | ✅ Live |
| Push notifications: permission, token, opening tapped notifications | ✅ Live |
| Push notifications: sending from the server (stamp request results, promo-end reminders, admin broadcasts) | ✅ Live; broadcasts are sent from the SQL editor until the admin dashboard exists |
| Contact number verification by SMS | ⏳ Waiting for an SMS provider |
| Catalog photos, real app icon and notification icon | ⏳ Before launch |

Every feature marked live passed a phone test round on Android. The detailed
progress, setup steps and test checklists are in
`supabase/INTEGRATION-STATUS.md`, which is git-ignored (see "Files that
aren't in git").

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

   On Windows, check afterwards that `package-lock.json` still lists
   `@emnapi/core` and `@emnapi/runtime`. npm drops them there, and EAS
   builds then fail at `npm ci`. Add packages with `npx expo install <package>`.

2. Create `.env` in the project folder:

   ```
   EXPO_PUBLIC_SUPABASE_URL=...
   EXPO_PUBLIC_SUPABASE_ANON_KEY=...        # Supabase publishable key, never the secret key
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...     # Google Cloud "Web application" OAuth client ID
   EXPO_PUBLIC_PROTOMAPS_API_KEY=...        # map tiles
   ```

3. Build the development client in the cloud and install the APK on an
   Android phone (only needed again when native packages or `app.json`
   plugins change):

   ```bash
   npx eas-cli@latest build --profile development --platform android
   ```

4. Start the dev server and open the app on the phone:

   ```bash
   npx expo start --dev-client
   ```

Before calling a change done:

```bash
npx tsc --noEmit   # typecheck
npx expo lint      # lint
```

## How it's organized

- `src/app/`: screens (Expo Router routes)
- `src/components/`, `src/hooks/`, `src/lib/`, `src/theme/`: UI, data hooks, helpers, design tokens
- `src/data/api.ts`: the only file that talks to Supabase. Screens use hooks, hooks use `api.ts`.
- `google-services.json`: Firebase config for push notifications (not secret, committed for EAS)
- `docs/app.md`: the feature list and behavior rules
- `.kiro/steering/`: product, tech and structure conventions
- `design/`: visual references (not part of the app)

## Backend

Supabase provides Auth (email codes sent through Brevo SMTP, and Google),
Postgres with Row Level Security, Storage (stamp request photos) and Edge
Functions. The app never writes stamps, claims or points directly; database
functions check the rules on the server. The `delete-account` and
`send-push` Edge Functions are deployed from the Supabase Dashboard. Push
notifications are queued by the database, and a cron job (pg_cron, pg_net)
wakes `send-push` to send them through Expo's push service.

Server-side secrets stay in the dashboards, not in the repository:

- **Supabase:** the secret key, the Edge Function secrets `GOOGLE_WEB_CLIENT_ID`
  and `PUSH_SEND_SECRET`, and the Vault secrets `project_url` and `push_send_secret`
- **Expo:** the FCM service account key
- **Google Cloud:** the OAuth clients

## Files that aren't in git

`supabase/` and `schema/supabase-schema.sql` are git-ignored and exist only on
the developer's machine. Keep a backup of them:

- `schema/supabase-schema.sql`: the full database
- `supabase/migrations/`: database changes since the schema was first run
- `supabase/functions/`: Edge Function source
- `supabase/INTEGRATION-STATUS.md`: progress, setup and phone test checklists
- `supabase/testing.sql`: SQL for the current test round
- `supabase/seed-dev.sql`: development data
- `supabase/templates/`: email templates

## Out of scope

The admin dashboard, the officer claim-scanning tool and the promo period
reset are separate projects.
