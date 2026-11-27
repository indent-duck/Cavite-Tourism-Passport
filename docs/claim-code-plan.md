# Plan: claim codes instead of claim QRs

_Written 2026-11-27. Platform: Android only._

When a user claims a reward, the app shows a 6-digit code instead of a QR
code. At the desk the user reads it out, an admin finds it in the admin panel
(Lakbay-Cavite-Web), checks the holder, then grants or denies the claim.
Points are still deducted only when a claim is granted.

**Why:** nobody built the officer scanner. Claims can only be redeemed in
the SQL editor (`supabase/INTEGRATION-STATUS.md`). A QR flow still needs a
camera tool somewhere: a webcam in the panel or an officer mode in the app.
Codes reuse the panel the office already uses, and the review works like
stamp requests do. Codes also work at a desk with only a laptop, can be read
out loud, and don't fail on a dim or cracked screen. "Deny, with a reason"
is new: today a claim can only be redeemed or left to expire.

**What stays the same:** one live code per user (a new one cancels the old
one), one granted reward per promo period, and the server checks every rule
again when a claim is granted (`claim_block_reason`). Codes expire, and the
prize is handed over in person.

## Decisions

All seven answered on 2026-11-27: each as recommended.

| # | Decision | Answer |
|---|---|---|
| 1 | How long a code stays valid (now 15 min, `app_settings`) | 30 minutes. 15 assumed a scan right away; with a queue at the desk a code could run out while the user waits or while the admin checks it. It can still be changed in `app_settings` |
| 2 | Who can grant and deny | Admins only for now, because the panel only lets admins sign in. The database function also accepts officers (`is_staff`, as `redeem_reward_claim` does today), so a claims-only officer view can come later |
| 3 | How the admin checks it's the right person | The panel shows the holder's name and passport ID, and the code screen in the app shows them too: the admin compares the two. Ask for a valid ID only when in doubt (office policy) |
| 4 | Deny reasons | Presets plus a note: "Name or passport ID doesn't match", "Prize not available at the desk", "Other" (note required). The user sees the reason |
| 5 | After a denial | The user can get a new code right away. A denial ends only that code |
| 6 | Push notification on grant or deny | Skip. The user is at the desk and the screen updates within ~5 s (it already polls). A push on denial, like `notify_stamp_request_reviewed`, can be added later |
| 7 | The old QR token and `redeem_reward_claim` | Drop both. The migration cancels any live passes (test data only) |

## Is a 6-digit code safe enough?

Yes, because of what's around it:
- Only staff can look up a code or act on it. Users read only their own
  claims (RLS), and the review function checks the caller's role.
- A code works only while it's live (decision 1) and only for its holder.
- The admin sees the holder's name and passport ID before granting
  (decision 3). A guessed code at the desk shows someone else's name.

A code is unique among live claims only (1,000,000 possible, a handful live
at a time). Old codes get reused, so history screens show the date and
claim ID, not just the code.

## Order of work

1. **Database (part 1):** migration 010 and `schema/supabase-schema.sql`.
   The current app reads `token`, so run the migration and reload the
   updated app together (as with migration 007).
2. **App (part 2):** JavaScript only; test with a reload, no new build.
3. **Admin panel (part 3):** re-sync `reference/` first.
4. **Test round (part 4):** `supabase/testing.sql`, phone and panel.

---

## 1. Database

_Follow-up, migration 011 (2026-11-27): when a reward sells out (including
when the last one is granted) or is made unavailable or hidden, its waiting
codes are cancelled, so a restock starts with a new code instead of the old
one coming back. Found while testing the sold-out case._

`supabase/migrations/010_claim_codes.sql`, and the same changes in
`schema/supabase-schema.sql` (table, functions, grants, header comments,
the API map at the end).

_Parts 1 to 3 written 2026-11-27. Migration 010 run and the phone checks
passed the same day; the admin panel isn't tested yet._

- [x] `reward_claim_status` gets `'denied'`. Postgres can't use a new enum
  value in the transaction that adds it, and the SQL editor runs the file as
  one transaction, so only function bodies name it and the new constraint
  compares `status::text`. The migration runs in one go.
- [x] `reward_claims`:
  - `code text` (nullable, for old rows), `check (code ~ '^[0-9]{6}$')`
  - `denied_at`, `denied_by`, `denial_reason` (up to 300 characters), and a
    check that `denied_at` is set exactly when the status is `denied`
  - `reward_claims_live_code`: unique `code` where `status = 'generated'`
  - `token` dropped
- [x] `private.random_claim_code()`: 6 digits from `gen_random_uuid()` (not
  `random()`, which is predictable). `generate_reward_claim` inserts with
  it and tries again (up to 5 times) if a live claim has that code. It
  returns `code` instead of `qr_payload`. Everything else stays: the
  account lock, the rule checks, cancelling the previous code.
- [x] `redeem_reward_claim(text)` dropped;
  `review_reward_claim(p_claim_id bigint, p_approve boolean, p_reason text default null)`,
  staff only:
  - Grant: the old redeem logic (lock account, claim, reward; check
    expired, period ended, `claim_block_reason`; take one from stock; mark
    `claimed`). Returns the holder and reward.
  - Deny: needs a reason (`reasonRequired` otherwise). Marks the claim
    `denied` with `denied_at`, `denied_by` and `denial_reason`. No points,
    no stock.
  - Refusals: `notFound`, `alreadyReviewed` (with `status` and
    `reviewed_at`), `replaced` (the user got a newer code), `expired`,
    `periodEnded`, and the `claim_block_reason` reasons. After the last
    two kinds the code stays live, so it can still be denied.
- [x] `app_settings`: `claim_qr_expiry_minutes` renamed to
  `claim_code_expiry_minutes`, set to 30.
- [x] Live passes from before codes are cancelled (expired if past time).
- [x] Grants: `review_reward_claim` and `generate_reward_claim` to
  `authenticated` (they check the caller themselves).
- [x] `schema/supabase-schema.sql` has the same changes.
- [x] `supabase/seed-dev.sql`: the "Grant or deny reward claims" block lists
  live codes and calls `review_reward_claim` (grant and deny examples), and
  the expiry tip uses the new key.

## 2. App

- [x] `src/data/types.ts`: `ActiveClaim.qrPayload` became `code`; new
  `ClaimDenial`. The unused `ClaimQR` type is gone.
- [x] `src/data/api.ts`: `CLAIM_COLUMNS` selects `code`; `generateClaimQR`
  became `generateClaimCode`; new `getLatestDenial(rewardId)`: the user's
  latest claim in the active period, if it was for this reward and denied.
- [x] Hooks: `useGenerateClaimCode` (was `useGenerateClaimQR`; also clears
  cached denials) and `useClaimDenial`. When a live code that hadn't expired
  disappears, `useActiveClaim` refreshes the user, rewards and the denial
  before dropping it, so the screen goes straight to CLAIMED or denied, and
  a reopened reward still shows the denial. (One query instead of a
  separate `getClaimOutcome`.)
- [x] `ClaimCodeView` (was `ClaimQRView`): the code large in monospace,
  grouped `482 917` (`formatClaimCode`), read digit by digit by screen
  readers (`spellClaimCode`); the countdown; the holder's name and passport
  ID; the screen kept awake; expired: greyed out with the EXPIRED stamp.
- [x] Reward detail: `code-active`, `code-expired` and `denied` states.
  Denied: "Your claim wasn't approved. Reason: … No points were deducted."
  with "Get a new code" (or "Find … sites" if the user no longer qualifies).
- [x] Wording: confirmation ("Get claim code", 30 minutes), hub banner (shows
  the code), "Code ready" chip, How to claim steps, the rewards FAQ, the
  privacy text, the delete account warning.
- [x] `react-native-qrcode-svg` removed (and the unused `qrInk` color).
  `npm uninstall` pruned `@emnapi/core` and `@emnapi/runtime` from
  `package-lock.json` again; both were put back.
- [x] `CACHE_VERSION` 10, so cached passes without a code are dropped.
- [x] Docs: `supabase/INTEGRATION-STATUS.md` and `docs/app.md` (#11; the
  officer verification tool is gone from the out-of-scope list).
- [x] `npx expo lint` and `npx tsc --noEmit` pass.

## 3. Admin panel (Lakbay-Cavite-Web)

- [ ] `node reference/sync.mjs` to copy the new schema and api.
- [ ] `src/data/database.ts`: `RewardClaimStatus` gets `'denied'`; the
  claim row gets `code`, `denied_at`, `denied_by`, `denial_reason`.
- [ ] **Reward claims** pages, in the stamp requests' pattern, with a
  sidebar entry:
  - `reward-claims` index: a code box at the top, focused on load (takes
    `482917` or `482 917`, Enter searches). Below it, the live codes,
    newest first: code, name, passport ID, reward, time left, refreshed
    every ~10 s. "No live claim with that code" when nothing matches,
    with a hint if that code expired recently.
  - `reward-claims/$id` review: holder (name, passport ID, member since),
    reward (name, cost, stock left), whether they qualify (points,
    categories, claimed this period, reusing the account summary in
    `accounts.ts`), and time left. **Grant** asks for a confirmation, then
    says "Hand over the <reward>". **Deny** opens the reasons (decision 4).
    A refusal from the server (sold out, expired, already reviewed) shows
    in words, not as an error code.
  - Optional: today's granted and denied claims below the list.
- [ ] Account detail: `CLAIM_LABELS` gets `denied` (with the reason), and
  `generated` becomes "Code ready (not yet reviewed)". Keep not selecting
  the code there.
- [ ] Optional: "Claims waiting" on the dashboard.

## 4. Test round

`supabase/testing.sql` (replaced for this round): list live codes, grant
and deny in SQL, 1-minute codes, undo test claims.

**Phone:**
- [x] Claim a ready reward: a 6-digit code, the countdown, your name and
  passport ID, and `reward_claims` has a `generated` row with that code
- [x] Get a code for reward A, then for B: A shows "Claim" again, A's row is
  `cancelled`, B has a different code
- [x] Hub banner and "Code ready" chip show the code and time left
- [x] Grant in the panel with the screen open: the CLAIMED stamp within
  ~5 s, points drop by the cost, a limited reward's stock drops by 1, other
  rewards say you've claimed this period
- [x] Deny with a reason: the denied banner with that reason within ~5 s,
  points unchanged. Leave and reopen the reward: still there. "Get a new
  code" gives a new code
- [x] 1-minute codes: the expired view, then "Get a new code" works
- [x] Screen reader reads the code digit by digit

**Panel:**
- [ ] Type the code with or without the space: the review page opens
- [ ] A wrong code: "No live claim with that code"
- [ ] An expired code can't be granted (`expired`, in words)
- [ ] Two tabs, grant in one, then grant or deny in the other: "already
  granted" with the time
- [ ] Set the reward's `quantity_remaining = 0`, then grant: "sold out", the
  claim stays live, and the admin can deny it
- [ ] Account detail shows granted and denied claims with the reason
