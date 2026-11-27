# Plan: detail maps and launch polish

_Written 2026-11-24. Platform: Android only._

Two map gaps from a review of the app against the PRD and `docs/app.md`
(#3, #12, #13, #23), plus the polish a Play Store release needs. The
before-launch list in `supabase/INTEGRATION-STATUS.md` (EAS environment
variables, test data, real QR codes, Brevo, notification icon, Play App
Signing SHA-1) still applies; this plan doesn't repeat it.

## Decisions needed

| # | Decision | Recommendation |
|---|---|---|
| 1 | Itinerary route line: straight dashed lines between stops, or road directions | Straight dashed lines. They show the order of the stops; road directions need a routing service and a stored route per itinerary, and "Open in Maps" already gives directions |
| 2 | Show the expressways, faded, on the itinerary map | Skip for the first version |
| 3 | Home-screen name | "Cavite Tourism Passport" (Android may cut it to "Cavite Tourism…"), or a shorter "Cavite Passport" |
| 4 | Splash and icon artwork, and permission to use the provincial seal | The Tourism Office supplies the logo; navy `#004987` splash with a white logo |
| 5 | Who owns the Play Console account | The Tourism Office's organization account, if they can get one (3.6) |
| 6 | Add EAS Update | Yes, so fixes during a promo period don't wait for a store review |
| 7 | Where the public privacy policy and account deletion pages live | A small static site the office controls, or the province's website |

## Order of work

1. **Maps (parts 1 and 2):** JavaScript only; test with a reload.
2. **Error boundary (3.4):** JavaScript only.
3. **One native build** once decisions 3, 4 and 6 are made: app name, icon
   and splash, the notification icon (before-launch list), light mode and
   EAS Update. Each is native config, so doing them together needs one build
   instead of several.
4. **Play Console (3.6):** start early, alongside the rest. A D-U-N-S number
   or the 14-day closed test takes weeks.

---

## 1. Site and event maps show a pin

**Now:** `LocationMapSection` renders `<CaviteMap height={280} />` with
nothing on it. Site and event details show the default Cavite view (center,
zoom 9) and the coordinates as text, not where the place is.

**Plan:**
- [x] `CaviteMap`: a `pins` prop for markers that aren't catalog sites
  (`id`, `latitude`, `longitude`, `color`, `icon`, `accessibilityLabel`),
  drawn like the site markers and included in `getCameraMove`, so a single
  pin gets the single-pin zoom (14). Explore and About Cavite don't pass
  `pins`, so they don't change.
- [x] `LocationMapSection`: takes the pin's color and icon, and passes
  `pins={[pin]}` and `fitOnLoad`. Without `fitOnLoad` the map stays on the
  Cavite view: Android drops camera moves made before the map's style loads
  (the expressway map fix, 2026-11-24).
- [x] Site detail (`src/app/sites/[id].tsx`): `CATEGORY_COLORS` /
  `CATEGORY_ICONS` for the site's category.
- [x] Event detail (`src/app/events/[id].tsx`): `EVENT_CATEGORY_COLORS` /
  `EVENT_CATEGORY_ICONS`.
- [ ] Optional: drop the coordinates line once the pin shows.

**Phone check:**
- [x] A site opens with its pin centered and zoomed in, in its category color
- [x] An event (a Festival and a Cultural one) opens the same way, in its event color
- [x] Pan away, then re-center: back on the pin
- [x] Dragging the map doesn't scroll the screen
- [x] Explore and About Cavite maps unchanged

## 2. Itinerary detail map

**Now:** `src/app/itineraries/[id].tsx` has the progress card and the
timeline, but no map. `docs/app.md` #12 and #13 call for the stops and their
route on a map.

**Plan:**
- [x] A map (about 260 high, like About Cavite) between the progress card
  and the timeline, framing every stop (`fitOnLoad`).
- [x] Numbered pins (1, 2, 3… in visiting order) in each stop's category
  color; stamped stops get the green check badge. `CaviteMap` pins get an
  optional `text` (the number) shown instead of the icon, and a `visited`
  flag. The screen already loads the sites and stamps.
- [x] A dashed line through the stops in order (decision 1). `MapRoute`
  gets a `dashed` option, drawn in its own layer filtered on it, so the
  solid expressway lines don't change.
- [x] Tapping a pin opens that site, like tapping its timeline card.
- [x] The page doesn't scroll while the map is dragged: `ScreenContainer`'s
  `scrollEnabled` with `onMapInteractionChange`, as on site detail.
- [x] Stops missing from the catalog are left off the map, as the timeline
  already does.
- [ ] Optional (decision 2): the expressway lines, faded, under the stops.

**Phone check:**
- [ ] Each itinerary opens with all its stops in view, numbered in timeline order, the dashed line following that order
- [ ] Stamped stops have the check badge, matching the timeline
- [ ] Tapping a pin opens the right site
- [ ] Re-center frames all the stops again
- [ ] Dragging the map doesn't scroll the page
- [ ] Explore, About Cavite, site and event maps unchanged

---

## 3. Launch polish

### 3.1 Home-screen name (native: new build)
- [ ] `expo.name` in `app.json` is "Cavite-Tourism-Passport", which Android
  shows under the icon. Change it (decision 3). Keep `slug` as it is: the
  EAS project is linked to it.
- The Play Store title is set separately in Play Console.

### 3.2 Icon and splash (native: new build; needs the artwork)
Still the Expo template:
- [ ] `expo-splash-screen` plugin: `backgroundColor` `#208AEF` (template
  blue) and `splash-icon.png`. Use the brand navy `#004987` and the real
  logo (`image` must be a PNG; `imageWidth` about 200).
- [ ] `android.adaptiveIcon`: `foregroundImage`, `backgroundImage`,
  `monochromeImage` (Android 13+ themed icons) and `backgroundColor`
  `#E6F4FE`. `backgroundImage` overrides `backgroundColor`.
- [ ] `icon` (`assets/images/icon.png`).
- [ ] The notification icon (before-launch list) in the same build.
- [ ] Play Store graphics are uploaded separately in Play Console: a 512×512
  icon, a 1024×500 feature graphic and screenshots.

### 3.3 Light mode only (native: new build)
- [ ] `userInterfaceStyle` is `"automatic"`, but the app has only a light
  design (nothing reads the system theme). On a phone in dark mode, the
  app's popups (`Alert`) turn dark over the light screens. Set it to
  `"light"`. Android needs `expo-system-ui`, which is already installed;
  `npx expo config --type introspect` shows whether it applied.
- [ ] Check: `adb shell "cmd uimode night yes"` (`no` undoes it). On
  Explore, deny location for Nearest until "Location access is off" shows:
  the popup is light, like the rest of the app.

### 3.4 Error boundary (JavaScript only)
- [ ] Export `ErrorBoundary` from `src/app/_layout.tsx` (props:
  `ErrorBoundaryProps` from `expo-router`, with `error` and `retry`). An
  error in a screen without its own boundary goes to the nearest parent's,
  so one at the root covers the app.
- [ ] Show "Something went wrong" with a Try again button (`retry`). It
  replaces the root layout while it shows, so it can't use what the layout
  provides (React Query, safe area): plain views and theme values only.
- [ ] Check: temporarily throw in a screen. After closing the dev error
  screen, the boundary shows; remove the throw and Try again recovers.
- Later, optional: crash reporting (e.g. Sentry) to see errors from users'
  phones.

### 3.5 EAS Update (decision 6; native: new build)
Sends JavaScript fixes to installed apps without a store review. Native
changes (3.1–3.3, new native modules) still need a store release.
- [ ] `npx expo install expo-updates`, then check `package-lock.json` still
  has `@emnapi/core` and `@emnapi/runtime` (EAS's `npm ci` fails without
  them).
- [ ] `npx eas-cli@latest update:configure`: writes `runtimeVersion` and
  `updates.url` to `app.json`, and a `channel` on the `preview` and
  `production` profiles in `eas.json`.
- [ ] Set `runtimeVersion` to `{ "policy": "fingerprint" }`, so an update
  only reaches builds with the same native code.
- [ ] New build. Publish with
  `npx eas-cli@latest update --channel production --environment production --message "..."`.
  The `EXPO_PUBLIC_*` variables must be in that EAS environment
  (before-launch list).

### 3.6 Google Play requirements (no code)
- [ ] **Developer account (decision 5):**
  - A **personal** account made after 2023-11-13 must run a closed test
    with at least 12 testers opted in for 14 days in a row before it can
    apply for production access
    ([Google](https://support.google.com/googleplay/android-developer/answer/14151465)).
    Plan for over two weeks, plus Google's review.
  - An **organization** account (the Provincial Government or the Tourism
    Office) needs a D-U-N-S number, which can take weeks. Third-party
    sources say organization accounts skip the 12-tester test; Google's page
    doesn't say so.
  - The app carries the Province's name and branding, so expect Play to ask
    for proof the publisher is authorized (a letter from the Tourism
    Office), unless the office publishes it from its own account.
- [ ] **Account deletion page:** apps with sign-up must link a web page
  where people can ask for their account and data to be deleted without the
  app ([Google](https://support.google.com/googleplay/android-developer/answer/13327111)).
  It names the app, gives the steps (e.g. email the helpdesk from the
  account's address), and says what's deleted and anything kept. The link
  goes in the Data safety form. The helpdesk then deletes the account the
  way the in-app delete does: the login and the user's
  `stamp-requests/{user id}/` photos.
- [ ] **Privacy policy URL:** a public copy of the in-app policy
  (`src/app/privacy.tsx`), on the same site as the deletion page.
- [ ] **Data safety form:** name, email and address (the account); precise
  location (sent with each scan for the GPS check); photos (stamp
  requests); app activity (stamps, claims); device ID (the push token). All
  sent over HTTPS; deletion in the app and through the web page.
- [ ] **Store listing and content rating:** title, descriptions, graphics
  (3.2), content rating questionnaire, target audience.
- [ ] **First release:** `npx eas-cli@latest build --profile production
  --platform android` makes the AAB. Google requires the first upload by
  hand in Play Console; `eas submit` works after that. Then add the Play App
  Signing SHA-1 for Google sign-in (before-launch list).
