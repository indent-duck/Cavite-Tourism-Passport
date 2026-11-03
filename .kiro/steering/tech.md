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
- Backend (installed but **not wired yet**): `@supabase/supabase-js`

## Planned additions
- Font: `@expo-google-fonts/inter` (Inter is the app font)
- QR code generation for the reward claim QR: `react-native-qrcode-svg` with `react-native-svg`
- Forms and validation: `react-hook-form` with `zod`

## Do not install
`react-native-web`, `react-dom`, `expo-symbols`, and the old DM Sans, Fraunces, and Lora font packages.

## Styling
- Use React Native `StyleSheet` with tokens from `src/theme`. Do not use NativeWind or Tailwind. (If this decision changes, update this file.)
- Never hardcode colors, spacing, radii, or font sizes in components. Always import from `src/theme`.
- Tokens: primary `#004987`, accent `#F47B20`, background `#FFFFFF`, surface `#F4F6FA`, text `#1B2A49`, secondary text `#6B7280`, success `#2E9E5B`, error `#D64545`. Card radius 16, pill buttons and chips, Inter font.
- **Screen container padding:** Use `spacing.sm` for horizontal and top padding in the main container of tab screens and full-screen layouts (not `spacing.base`). This provides tighter, more compact margins.
- The bottom navigation bar is fully opaque white. Scrollable screens need bottom padding so the tab bar never covers content.
- Respect safe areas and the Android system back button and gesture on every screen, including each step of multi-step flows.

## Using the Stitch designs
- The images in `design/screens/` are the visual reference. The matching HTML files are only for reading exact spacing, sizes, radii, and colors.
- Never copy the HTML or web code (including Tailwind classes) into the app. Rebuild every screen with React Native components and theme tokens.

## Data layer (UI-first phase)
- Screens and components **never import mock data directly**. Flow: screen -> hook in `src/hooks` -> function in `src/data/api.ts` -> mock data in `src/data/mock-data.ts`.
- `api.ts` returns mock data after a short artificial delay so loading states get designed. Later only `api.ts` changes (Supabase calls).
- React Query is configured in one place: `src/lib/query-client.ts`.
- All shared types live in `src/data/types.ts`.
- Actions such as collecting a stamp, generating a claim QR, and sign up are mock functions in `api.ts`. Sign up mock rule: any email passes, the code `123456` succeeds, and any other code shows the error state.
- Sample user in mock data: Juan Dela Cruz, Passport ID `CVT-2027-000123`, 450 pts, stamps from Dining, Staycation, and two Heritage sites, none from Adventure.

## Permissions
Request camera and location permission before showing the scanner screen. Handle the denied state with the blocked screen described in `product.md`.

## Testing and builds
- Test on a **physical Android phone only**. No Android Studio and no emulators are used in this project.
- The development build is created in the cloud with EAS (`eas build --profile development --platform android`) and installed on the phone as an APK. Do not use `npx expo run:android`.
- Day to day, run `npx expo start --dev-client` and open the app on the phone over Wi-Fi (use `--tunnel` if the network blocks it). Rebuild the dev client only when native packages or `app.json` plugin settings change.

## Code conventions
- Functional components with hooks. TypeScript strict, no `any`.
- Route files use default exports (required by Expo Router). All other modules use named exports.
- Use the `@/` import alias for `src/` (for example `@/theme`, `@/components/ui/Button`).
- Lint with ESLint and `eslint-config-expo`.
- No secrets in the repository. Supabase keys later go in environment variables.
