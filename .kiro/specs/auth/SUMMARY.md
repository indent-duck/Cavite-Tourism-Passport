# Auth Spec Summary

## Quick Reference

**Spec Name:** Authentication  
**Status:** Ready for implementation  
**Priority:** MVP (must complete before other specs)  
**Estimated Effort:** 2-3 days for experienced React Native developer  

## What This Spec Covers

Complete UI implementation for:
1. **Login** - Email and password authentication
2. **Sign Up** - 3-step flow (email → verify → details)
3. **Forgot Password** - 3-step flow + success screen (email → verify → new password → success)

**Total screens:** 8 routes in `src/app/(auth)/`

## Key Features

- Multi-step flows with progress indicators
- 6-digit email verification codes
- Countdown timers with resend functionality
- Form validation (email format, password strength, matching confirmation)
- Loading states on all async operations
- Keyboard-aware layouts (inputs and buttons stay visible)
- Android back button support
- Mock authentication (UI-first, no backend yet)

## Mock Rules (for Testing)

- **Login:** Any email/password succeeds, except password `"wrong"` → shows error
- **Verification:** Code `"123456"` succeeds, all others fail
- **Sign Up:** Always succeeds after valid verification
- **Reset Password:** Always succeeds after valid verification

## Dependencies

**Existing:**
- Theme system (`src/theme`)
- UI components: `Button`, `TextInput`, `ScreenContainer`, `StepIndicator`
- API layer: `src/data/api.ts` (mock functions already exist)
- Routing: Expo Router (file-based, `src/app/(auth)/`)

**To Create:**
- Constants: `VERIFICATION_CODE_LENGTH`, `RESEND_CODE_TIMEOUT`, `MIN_PASSWORD_LENGTH`
- Hooks: `useAuth`, `useVerification`
- Optional: `CodeInput` component (6-digit code entry), `PasswordStrengthIndicator`

## Design Sources

**Images:** `design/screens/01-auth/*.png` (7 screens, no design for forgot/success)  
**HTML:** `design/screens/01-auth/*.html` (for exact spacing and colors, not to be copied)

## Files Modified

**Routes (8 files):**
- `src/app/(auth)/login.tsx` ✏️ Replace placeholder
- `src/app/(auth)/signup/email.tsx` ✏️ Replace placeholder
- `src/app/(auth)/signup/verify.tsx` ✏️ Replace placeholder
- `src/app/(auth)/signup/details.tsx` ✏️ Replace placeholder
- `src/app/(auth)/forgot/email.tsx` ✏️ Replace placeholder
- `src/app/(auth)/forgot/verify.tsx` ✏️ Replace placeholder
- `src/app/(auth)/forgot/new-password.tsx` ✏️ Replace placeholder
- `src/app/(auth)/forgot/success.tsx` ✏️ Replace placeholder

**New files (3-5):**
- `src/lib/constants.ts` ➕ Create (if doesn't exist) or update
- `src/hooks/useAuth.ts` ➕ Create
- `src/hooks/useVerification.ts` ➕ Create
- `src/components/ui/CodeInput.tsx` ➕ Optional (if standard TextInput insufficient)
- `src/components/ui/PasswordStrengthIndicator.tsx` ➕ Optional (can be inline)

## Known Omissions (per Product Rules)

These elements appear in designs but are **intentionally omitted:**
- Biometric login (fingerprint icon on login)
- Contact number field at sign up (added later in Account settings)
- Decorative branding elements (full heritage seal graphic with "1898", guilloche rings)
- "Passport Ready To Issue" preview card on signup-details (decorative)

## Testing Checklist (Short Version)

- [ ] Login with valid credentials → Explore tab
- [ ] Login with password "wrong" → error message
- [ ] All "Forgot password?" and "Sign up" links work
- [ ] Sign up flow: email → code "123456" → details → Explore tab
- [ ] Forgot password flow: email → code "123456" → new password → success → login
- [ ] Countdown timers work (60s → 0 → "Resend code")
- [ ] All validations work (email format, password min 8 chars, matching confirmation)
- [ ] Android back button works at every step
- [ ] Keyboard does not cover inputs or buttons
- [ ] `npx tsc --noEmit` → 0 errors
- [ ] `npx expo lint` → 0 errors

## Navigation Map

```
login.tsx
├─→ /forgot/email (Forgot password? link)
│   ├─→ /forgot/verify
│   │   ├─→ /forgot/new-password
│   │   │   ├─→ /forgot/success
│   │   │   │   └─→ /login (Log in button)
│   │   │   └─→ /login (Cancel link)
│   │   └─→ /forgot/email (Edit email)
│   └─→ /login (Remember password? link)
├─→ /signup/email (Sign up link)
│   ├─→ /signup/verify
│   │   ├─→ /signup/details
│   │   │   └─→ /(tabs)/explore (Create account)
│   │   └─→ /signup/email (Edit email)
│   └─→ /login (Log in link)
└─→ /(tabs)/explore (Log in button)
```

## Implementation Approach

**Recommended order:**
1. Foundation (constants, hooks) → 1-2 hours
2. Login screen → 2-3 hours
3. Sign up flow → 4-6 hours
4. Forgot password flow → 3-4 hours
5. Testing and polish → 2-3 hours

**Total:** ~12-18 hours (1.5-2.5 days)

## Success Criteria

- ✅ All screens visually match design images (with documented differences)
- ✅ All user flows work end-to-end
- ✅ Mock authentication rules implemented correctly
- ✅ Form validation shows appropriate errors
- ✅ Loading and error states display correctly
- ✅ Keyboard handling works on phone
- ✅ Android back button works everywhere
- ✅ Zero TypeScript and lint errors
- ✅ Code follows project structure rules (thin routes, hooks for data, reusable components)

## Blocked By

None. This spec has no dependencies on other specs and can be started immediately.

## Blocks

All other specs depend on Auth because users must log in before accessing the main app. Start with Auth first.

## Related Docs

- `README.md` - Full spec with all details
- `DESIGN.md` - Visual specifications (spacing, colors, sizes)
- `TASKS.md` - Step-by-step implementation tasks
- `docs/app.md` - Product feature list and behavior rules
- `design/screens/README.md` - Design asset inventory
- `.kiro/steering/product.md` - Product rules and constraints
- `.kiro/steering/tech.md` - Tech stack and conventions
- `.kiro/steering/structure.md` - Project structure rules

## Notes

- This is a **UI-first** implementation. All auth functions are mocked.
- The next phase will replace `src/data/api.ts` with Supabase calls, but screens and hooks stay the same.
- No native packages or plugins need to be installed for this spec (all UI is React Native components).
- Test on a **physical Android phone only** (not emulator, not iOS).
- Use `npx expo start --dev-client` for day-to-day testing; rebuild the dev client only if native code or plugins change (they don't for this spec).
