# Tech Stack and Conventions

## Platform
- Expo (managed workflow with **development builds**, not Expo Go), React Native, TypeScript in strict mode.
- **Android only.** Write no iOS-specific or web code.
- Routing: **Expo Router** (file-based). Use the Expo SDK version already in the project.

## Libraries in use
- Navigation and screens: `expo-router`, `react-native-screens`, `react-native-safe-area-context`
- Gestures and animation: `react-native-gesture-handler`, `react-native-reanimated`
- Maps: `@maplibre/maplibre-react-native` with `@protomaps/basemaps`
- Camera and location: `expo-camera` (QR scanning), `expo-location`
- UI helpers: `@gorhom/bottom-sheet`, `expo-image`, `expo-haptics`, `@expo/vector-icons`, `expo-font`, `expo-splash-screen`, `expo-linking`, `expo-web-browser`
- Data: `@tanstack/react-query` with persistence (`@tanstack/react-query-persist-client`, `@tanstack/query-async-storage-persister`, `@react-native-async-storage/async-storage`)
- Backend: `@supabase/supabase-js` (live project: Auth, Postgres with RLS, Storage, Edge Functions). Email goes through Brevo SMTP.
- Font: `@expo-google-fonts/inter` (Inter is the app font)
- Reward claim QR: `react-native-qrcode-svg` with `react-native-svg`
- Photos for stamp requests: `expo-image-picker`
- Push notifications: `expo-notifications` (FCM through Expo's push service; needs `google-services.json`)
- Google sign-in: `react-native-nitro-google-signin` with `react-native-nitro-modules` (Android Credential Manager, free), and `expo-crypto` for the sign-in nonce
- Keyboard handling: `react-native-keyboard-controller`

## Planned additions
- Forms and validation: `react-hook-form` with `zod` (not used so far; forms validate by hand)

## Do not install
`react-native-web`, `react-dom`, `expo-symbols`, and the old DM Sans, Fraunces, and Lora font packages.

## Styling
- Use React Native `StyleSheet` with tokens from `src/theme`. Do not use NativeWind or Tailwind. (If this decision changes, update this file.)
- Never hardcode colors, spacing, radii, or font sizes in components. Always import from `src/theme`.
- Tokens: primary `#004987`, accent `#F47B20`, background `#FFFFFF`, surface `#F4F6FA`, text `#1B2A49`, secondary text `#6B7280`, success `#2E9E5B`, error `#D64545`. Card radius 16, pill buttons and chips, Inter font.
- **Screen container padding:** Use `spacing.base` (16px) for horizontal padding in the main container of screens to match the design references. Use `spacing.sm` for top padding.
- The bottom navigation bar is fully opaque white. Scrollable screens need bottom padding so the tab bar never covers content.
- Respect safe areas and the Android system back button and gesture on every screen, including each step of multi-step flows.

## Using the Stitch designs
- The images in `design/screens/` are the visual reference. The matching HTML files are only for reading exact spacing, sizes, radii, and colors.
- Never copy the HTML or web code (including Tailwind classes) into the app. Rebuild every screen with React Native components and theme tokens.

## Data layer (Supabase)
- Flow: screen -> hook in `src/hooks` -> function in `src/data/api.ts` -> Supabase. `api.ts` is the only file that talks to Supabase (client in `src/lib/supabase.ts`). Screens and components never call Supabase or import mock data directly.
- The app never writes stamps, claims or points itself: it calls database functions (`collect_stamp`, `submit_stamp_request`, `generate_reward_claim`, `register_push_token`) that check the rules on the server. Row Level Security limits every table to what the signed-in user may see.
- Work that needs the secret key runs in Edge Functions (`supabase/functions/`, Deno, deployed from the Supabase Dashboard): `delete-account` so far. They are left out of the app's typecheck and lint.
- Still mock in `api.ts`: the contact number (`sendContactCode`, `verifyContactCode`, waiting for an SMS provider) and static content (About Cavite, FAQs), which stays in the app on purpose. `src/data/mock-data.ts` remains for those until launch.
- React Query is configured in one place: `src/lib/query-client.ts`. Bump `CACHE_VERSION` there when a cached data shape changes.
- All shared types live in `src/data/types.ts`.
- Database schema: `schema/supabase-schema.sql` (full) plus `supabase/migrations/` (changes since). Progress, setup and phone test checklists: `supabase/INTEGRATION-STATUS.md`. Both folders are git-ignored and exist only on the developer's machine.

## Environment variables
In `.env` (git-ignored; for EAS builds they must also be EAS environment variables):
- `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` (the publishable key, never the secret key)
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` (Google Cloud "Web application" OAuth client)
- `EXPO_PUBLIC_PROTOMAPS_API_KEY` (map tiles)

## Permissions
Request camera and location permission before showing the scanner screen. Handle the denied state with the blocked screen described in `product.md`.

## Testing and builds
- Test on a **physical Android phone only**. No Android Studio and no emulators are used in this project.
- The development build is created in the cloud with EAS (`eas build --profile development --platform android`) and installed on the phone as an APK. Do not use `npx expo run:android`.
- Day to day, run `npx expo start --dev-client` and open the app on the phone over Wi-Fi (use `--tunnel` if the network blocks it). Rebuild the dev client only when native packages or `app.json` plugin settings change. The last rebuild (2026-11-22) added `expo-notifications`, `expo-crypto` and the Google sign-in library.
- Before an EAS build, check that `package-lock.json` still has `@emnapi/core` and `@emnapi/runtime`: `npm install` on Windows drops them, and EAS's `npm ci` then fails.
- Each phone test round has a checklist in `supabase/INTEGRATION-STATUS.md` and its SQL in `supabase/testing.sql`.

## Code conventions
- Functional components with hooks. TypeScript strict, no `any`.
- Route files use default exports (required by Expo Router). All other modules use named exports.
- Use the `@/` import alias for `src/` (for example `@/theme`, `@/components/ui/Button`).
- Lint with ESLint and `eslint-config-expo`.
- No secrets in the repository: keys go in `.env` and EAS environment variables, and server secrets (the Supabase secret key, `GOOGLE_WEB_CLIENT_ID` for Edge Functions, the FCM service account key) stay in the Supabase and Expo dashboards. `google-services.json` is not secret and is committed (EAS builds need it).
