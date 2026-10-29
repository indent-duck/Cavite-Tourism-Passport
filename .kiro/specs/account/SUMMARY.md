# Account Spec Summary

## Purpose

Implement the Account tab screen showing the user's digital passport ID, profile information, activity stats, and account management features including contact number verification and sign out.

## Key Deliverables

1. **Account Screen** (`src/app/(tabs)/account.tsx`)
   - Digital passport ID card with QR code and copy functionality
   - Activity stats (stamps, points, promo period)
   - Account details (name, address, email, contact number)
   - Navigation links (Settings, Redemptions, Privacy)
   - Log out button

2. **Add Contact Number Flow** (bottom sheet)
   - Phone input with +63 prefix and validation
   - 6-digit OTP verification (mock: "123456" succeeds)
   - Success confirmation
   - No contact number collected at sign up—only added here

3. **New Components**
   - `AddContactSheet` (bottom sheet for contact verification)
   - `PassportIdCard` (optional separate component for ID card)

4. **New Hooks**
   - `useContactVerification` (sendCode, verifyCode)
   - `useSignOut` (signOut with cache clearing)

5. **New API Functions**
   - `sendContactCode` (mock, always succeeds)
   - `verifyContactCode` (mock, "123456" succeeds)
   - `signOut` (mock, resets user state)

6. **Type Updates**
   - Add `contactVerified?: boolean` to User interface
   - Ensure `contactNumber?: string` exists (already present)

## Design Reference

- **Image:** `design/screens/10-account/account.png`
- **Route:** `src/app/(tabs)/account.tsx`
- **Stitch ID:** `8cc60c3e5e494e52b321eec690c314d6`

## Key Behaviors

- **No confirmation for log out:** Sign out immediately (account.png shows no confirmation)
- **Contact verification:** Code "123456" succeeds, all others fail
- **Cache clearing:** Sign out clears both in-memory and persisted React Query cache
- **Navigation:** Log out uses `router.replace` to prevent back button issues
- **Philippine mobile format:** Accept 09XX XXX XXXX or +639XX XXX XXXX
- **Keyboard handling:** Bottom sheet must not be covered by keyboard

## Out of Scope

- Edit profile (name, address, email)
- Change password
- Delete account
- Profile photo upload
- Redemption history screen
- Privacy policy screen

## Testing

Must test on a physical Android phone:
- Account screen renders correctly with all sections
- Copy Passport ID works with feedback
- Add contact number flow works end-to-end
- Invalid OTP code shows error
- Log out clears cache and navigates to login
- Android back button works correctly
- Keyboard does not cover inputs

## Success Criteria

- [ ] Account screen matches account.png design
- [ ] All data flows through hooks → api.ts → mock-data.ts
- [ ] Contact verification flow works with "123456" code
- [ ] Log out clears cache and navigates correctly
- [ ] TypeScript strict mode passes (`npx tsc --noEmit`)
- [ ] ESLint passes (`npx expo lint`)
- [ ] Tested on physical Android phone
- [ ] DIFFERENCES.md documents all design deviations

## Dependencies

- **Foundation spec:** Theme system, ScreenContainer, Header, Button, TextInput, CodeInput, Card
- **Auth spec:** Verification pattern (CodeInput, countdown timer)
- **Settings spec:** Settings screen (opened from gear icon)

## Estimated Complexity

**Medium**
- Moderate complexity bottom sheet with 3 stages
- ID card design requires careful styling
- Cache clearing logic needs testing
- No complex business logic or API integration
