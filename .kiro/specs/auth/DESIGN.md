# Auth Design Specifications

This document captures exact spacing, sizing, colors, and layout from the design HTML files. Use these values when building the React Native screens with theme tokens.

## Design System Mapping

### Colors (from HTML → theme tokens)

| HTML Color | Hex | Theme Token | Usage |
|------------|-----|-------------|-------|
| `primary` | `#003260` | `colors.primary` | Navy blue for headers, labels |
| `primary-container` | `#004987` | `colors.primary` (use primary) | Button backgrounds |
| `secondary-container` | `#fc8127` / `#F47B20` | `colors.accent` | Progress bars, highlights, CTAs |
| `background-canvas` | `#FFFFFF` | `colors.background` | Main background |
| `surface-card` | `#F4F6FA` | `colors.surface` | Input backgrounds, cards |
| `on-surface` | `#0a1b39` | `colors.text` | Primary text |
| `text-secondary` | `#6B7280` | `colors.textSecondary` | Secondary text, hints |
| `status-error` | `#D64545` | `colors.error` | Error messages |
| `tertiary-container` | `#00542a` | `colors.success` | Success states |
| `passport-leather` | `#0B2A4A` | `colors.passportLeather` | Heritage seal background |
| `passport-foil` | `#F89C48` | `colors.passportFoil` | Heritage seal accents |

### Spacing (from HTML → theme tokens)

| HTML Token | Pixels | Theme Token | Notes |
|------------|--------|-------------|-------|
| `space-xs` | 4px | `spacing.xs` | Minimal gaps |
| `space-sm` | 8px | `spacing.sm` | Small gaps |
| `space-md` | 16px | `spacing.base` | Standard gaps |
| `space-lg` | 24px | `spacing.xl` | Large gaps |
| `space-xl` | 32px | `spacing.xxl` | Extra large gaps |
| `margin` | 16px | `spacing.base` | Screen margins (left/right padding) |

### Typography (from HTML → theme tokens)

| HTML Token | Size | Line Height | Weight | Theme Token |
|------------|------|-------------|--------|-------------|
| `display-lg-mobile` | 28px | 36px | 700 | `typography.displayLargeMobile` |
| `headline-lg` | 24px | 32px | 700 | `typography.headlineLarge` |
| `headline-md` | 20px | 28px | 600 | `typography.headlineMedium` |
| `title-md` | 16px | 22px | 600 | `typography.titleMedium` |
| `body-lg` | 16px | 24px | 400 | `typography.bodyLarge` |
| `body-md` | 14px | 20px | 400 | `typography.bodyMedium` |
| `body-sm` | 12px | 16px | 400 | `typography.bodySmall` |
| `label-lg` | 14px | 20px | 600 | `typography.labelLarge` |
| `label-md` | 12px | 16px | 600 | `typography.labelMedium` |
| `label-sm` | 10px | 14px | 700 | `typography.labelSmall` |

### Border Radii (from HTML → theme tokens)

| HTML Value | Pixels | Theme Token | Usage |
|------------|--------|-------------|-------|
| `rounded-full` | 9999px | `radii.full` | Pill buttons, chips |
| `rounded-2xl` | 16px | `radii.card` | Cards, larger containers |
| `rounded-xl` | 12px | `radii.input` | Input fields |
| `rounded-lg` | 8px | `radii.card / 2` | Small cards |

## Screen-by-Screen Specifications

### Login Screen (`login.tsx`)

**Layout:**
- Screen padding: 16px horizontal, 16px vertical (`spacing.base`)
- Top heritage seal: 80px diameter circle, 8px margin bottom (`spacing.sm`)
- "Official Digital Pass" badge: pill shape with 8px horizontal padding, 2px vertical padding
- Headline "Cavite Tourism Passport": `displayLargeMobile`, 4px margin bottom
- Description: `bodyMedium`, 32px margin bottom (`spacing.xxl`)

**Form container:**
- Background: `surface` (#F4F6FA)
- Border radius: 12px (`radii.input`)
- Padding: 16px (`spacing.base`)
- Shadow: `shadows.card`

**Inputs:**
- Height: 48px
- Background: `background` (white)
- Border radius: 24px (pill shape, `radii.full`)
- Padding: 14px horizontal (left icon at 14px, right icon at 12px)
- Icon size: 20px
- Gap between inputs: 16px (`spacing.base`)

**"Forgot password?" link:**
- Position: right-aligned below password field
- Typography: `labelMedium`
- Color: `primary`
- Padding top: 4px

**"Log in" button:**
- Height: 48px
- Full width
- Background: `primary` (#004987)
- Text: `labelLarge`, white
- Icon: arrow_forward, 18px
- Gap between text and icon: 8px
- Margin top: 8px (`spacing.sm`)

**"Don't have an account? Sign up":**
- Center-aligned
- Gap between text and link: 6px
- Typography: `bodyMedium` for text, `labelLarge` for link
- Color: `textSecondary` for text, `accent` for link
- Margin top: 24px (`spacing.xl`)

**Provincial footnote:**
- Positioned at bottom (use `marginTop: 'auto'` in flex container)
- Center-aligned
- Icon: shield, 14px
- Typography: `labelSmall` for header, `bodySmall` for subtext
- Color: `textSecondary`
- Opacity: 0.7

---

### Sign Up - Step 1: Email (`signup/email.tsx`)

**Top bar (back button + step indicator):**
- Height: 40px
- Back button: 40px circle, `surface` background
- Step indicator: "STEP 1 OF 3", `labelSmall`, uppercase, pill badge with `surface` background
- Gap: `marginBottom: 16px`

**Progress bar:**
- Height: 6px (1.5px from HTML × 4 for visibility on mobile)
- Background: `surface`
- Fill: `accent` at 33.33% width
- Border radius: full
- Margin bottom: 32px (`spacing.xxl`)

**Delight badge (book icon + "Official Tourism Identity"):**
- Icon container: 44px square, `primary-fixed` background (#d4e3ff), border radius 12px
- Icon: menu_book, 24px, filled
- Label: "Official Tourism Identity" (uppercase `labelSmall`), "Province of Cavite" (`labelMedium`)
- Margin bottom: 16px

**Headline:**
- "Create your digital passport": `displayLargeMobile`
- Description: `bodyMedium`, `textSecondary`
- Margin bottom: 32px

**Email input:**
- Label: "Email Address" with "Official verification" hint (right-aligned)
- Icon: mail, 20px, left at 16px
- Height: 48px
- Background: `surface`
- Border radius: 16px
- Margin bottom: 4px

**Hint text below input:**
- "We will never share your private details."
- Typography: `bodySmall`, `textSecondary`
- Min height: 16px (for live validation messages)

**Info card ("Civic Exploration ID"):**
- Icon: verified_user, 22px, in 40px circle
- Background: `surface`
- Border radius: 16px
- Padding: 16px
- Margin: 24px vertical gap (`spacing.xl`)

**Terms checkbox:**
- Checkbox: 20px square, `surface` background when unchecked, `accent` when checked
- Check icon: 16px white
- Label: `bodySmall`, `textSecondary`
- Links in label: `labelMedium`, `primary`, underlined
- Gap: 8px between checkbox and label
- Margin top: 8px

**"Continue" button:**
- Height: 48px
- Full width
- Background: `primary`
- Text: "Continue", `labelLarge`, white
- Icon: arrow_forward, 18px
- Margin top: 16px

**"Already have an account? Log in":**
- Same styling as login screen's sign up link
- Margin top: 32px, margin bottom: 16px

---

### Sign Up - Step 2: Verify (`signup/verify.tsx`)

**Top bar:**
- Back button: 40px, -8px left margin for alignment
- Step indicator: "Step 2 of 3" with shield icon (filled), 16px
- Spacing: 4px margin bottom

**Progress bar:**
- 66.67% fill (2 of 3 steps)
- Margin bottom: 24px

**Hero section:**
- Centered layout
- Icon container: 80px diameter, `surface` background, pulsing animation circle
- Inner icon: mark_email_unread, 32px, `accent` color, filled
- Pin badge: 24px circle at bottom-right, `primary` background, pin icon 14px
- Margin bottom: 16px

**Headline:**
- "Check your email": `displayLargeMobile`, `primary`
- Description: `bodyMedium`, `textSecondary`, max width 310px centered
- Email shown inline: `titleMedium`, `text` (bold)
- "Edit email" link: `labelMedium`, `accent` with edit icon 14px
- Margin bottom: 24px

**Code input (6 boxes):**
- Grid: 6 columns, 8px gap
- Each box: 54px height, 12px border radius
- Background: `surface` for empty/filled, `surface-container-lowest` (lighter) for focused
- Text: `headlineLarge` (24px), `primary`, bold
- Empty indicator: 8px dot, `outline-variant` color, 60% opacity
- Focused box: vertical blinking cursor, 24px height, 2px width, `accent` color
- Container max width: 340px, 4px horizontal padding

**Countdown timer:**
- Icon: schedule, 18px, `textSecondary`
- Text: `bodyMedium`, `textSecondary`
- Timer value: `labelLarge`, `primary`, bold, tabular-nums
- Gap: 8px between icon and text
- Margin top: 16px

**"Verify" button:**
- Same as other primary buttons
- Margin: 24px bottom

**Help card:**
- Background: `surface`
- Border radius: 12px
- Padding: 16px
- Icon: help_outline, 18px in 32px circle
- Title: `titleMedium`, `primary`
- Body: `bodySmall`, `textSecondary`
- Margin top: auto (pushes to bottom)

---

### Sign Up - Step 3: Details (`signup/details.tsx`)

**Top bar:**
- Back button: 40px circle, `surface-container` background
- Step indicator: "Step 3 of 3" with dot indicator, pill badge
- Margin bottom: 16px

**Progress bar:**
- 100% fill (3 of 3 steps)
- Margin bottom: 24px

**Header:**
- Badge: shield icon + "FINAL STEP" (uppercase `labelMedium`), `accent` color
- Headline: "Your personal details", `displayLargeMobile`, `primary`, bold
- Description: `bodyMedium`, `textSecondary`
- Margin bottom: 24px

**Form fields:**
- Gap between fields: 12-16px
- Label: `labelMedium`, `primary`, bold
- Right hint: `labelSmall`, `textSecondary` or `accent`
- Input height: 48px
- Icon: 20px, left at 14px
- Background: `surface`
- Border radius: 12px

**Full Name:**
- Icon: badge
- Placeholder: "e.g. Juan Dela Cruz"
- Hint: "As shown on valid ID"

**Residential Address:**
- Icon: location_on
- Dropdown arrow: 20px, right at 12px
- Hint: "Cavite Local" (`accent`)
- Municipality chips below:
  - Height: 28px (auto)
  - Padding: 10px horizontal, 4px vertical
  - Border radius: full
  - Active: `primary-fixed` background (#d4e3ff), `on-primary-fixed` text
  - Inactive: `surface` background, `on-surface` text
  - Gap: 6px
  - Horizontal scroll, no scrollbar visible
  - Margin top: 4px

**Password:**
- Icon: lock
- Visibility toggle: 20px, right at 14px
- Strength indicator above: 4 dots (10px × 4px each), 2px gap, plus "Strong" label
- Colors: `success` when strong

**Confirm Password:**
- Icon: lock_reset
- Same styling as Password field

**"Passport Ready To Issue" preview card (optional):**
- Background: `surface`
- Border radius: 12px
- Padding: 14px
- Icon: menu_book in 40px square, `passportLeather` background, `passportFoil` text
- "CVT-2025-XXXXX": `titleMedium`, `primary`, bold
- Verified badge: pill, check_circle filled icon 16px, `success` color
- Margin top: 8px

**"Create account" button:**
- Height: 48px
- Background: `primary`
- Icon: check, 20px, filled
- Margin top: 8px

**Trust seal footer:**
- Background: `surface`
- Border radius: 12px
- Padding: 12px
- Icon: shield, 15px, filled, in 24px circle, `primary-fixed` background
- Text: `bodySmall`, `textSecondary`, with bold emphasis on "Philippine Data Privacy Act of 2012"
- Margin top: 24px

---

### Forgot Password - Step 1: Email (`forgot/email.tsx`)

**Top bar:**
- Back button: left
- Title: "Password Recovery" in header (not step indicator)
- User icon: top-right badge (24px circle, `primary` background)

**Step indicator:**
- "STEP 1 OF 3", pill badge, small
- Positioned below back button
- Margin bottom: 8px

**Icon section:**
- Mail icon: 32px, in layered circles (similar to verify screen)
- Margin bottom: 16px

**Headline:**
- "Forgot your password?": `displayLargeMobile`, `primary`
- Description: Multi-line, `bodyMedium`, `textSecondary`
- Margin bottom: 24px

**Email input:**
- Same styling as signup email
- Label: "Email Address", right hint: "Official verification"
- Checkmark below for valid email (optional)

**Security notice:**
- Icon: shield, `textSecondary`
- Text: `bodySmall`, two lines
- Background: light info background (optional)
- Margin: 16px vertical

**"Send verification code" button:**
- Height: 48px
- Background: `accent` (orange)
- Icon: arrow_forward
- Full width

**"Remember your password? Log in":**
- Same styling as other footer links
- Margin top: 24px

**Footer (optional):**
- "PROVINCIAL TOURISM ASSISTANCE"
- "Need help? Contact support@cavite.gov.ph"
- Typography: `labelSmall`, `bodySmall`
- Color: `textSecondary`
- Margin top: auto

---

### Forgot Password - Step 2: Verify (`forgot/verify.tsx`)

**Same layout as Sign Up Step 2: Verify** with these changes:
- Title in top bar: "Otp Verification" or "Password Recovery"
- Step indicator: "Step 2 of 3"
- Button text: "Verify Code"
- Help card text adjusted for password reset context

---

### Forgot Password - Step 3: New Password (`forgot/new-password.tsx`)

**Top bar:**
- Back button: left
- Title: "New Password Reset" in header
- Step indicator: "Step 3 of 3", top-right
- Margin bottom: 16px

**Step label:**
- "ACCOUNT RECOVERY", uppercase `labelMedium`, `primary`
- Margin bottom: 8px

**Icon section:**
- Lock icon with refresh: 32px, in circle, `primary-container` background
- Margin bottom: 16px

**Headline:**
- "Set new password": `displayLargeMobile`, `primary`
- Description: `bodyMedium`, `textSecondary`, includes password criteria summary
- Margin bottom: 24px

**New Password input:**
- Label: "New Password", right hint: "Strong" with strength indicator
- Icon: lock
- Visibility toggle: visibility/visibility_off icon
- Height: 48px

**Confirm Password input:**
- Same as New Password

**Password criteria checklist:**
- Icon: check_circle (filled when met), 16px
- Text: `bodySmall`, `textSecondary` when not met, `success` when met
- Items:
  - At least 8 characters
  - Includes a number (0-9)
  - Includes an uppercase letter (A-Z)
  - Includes a special character (!@#$%^&*)
- Margin: 8px vertical

**"Reset Password & Log in" button:**
- Height: 48px
- Background: `primary`
- Icon: check_circle, 20px, filled
- Full width
- Margin top: 16px

**"Cancel and return to sign in":**
- Typography: `bodyMedium`, `textSecondary` with `primary` link
- Center-aligned
- Margin top: 16px

**Trust seal footer (optional):**
- Same as signup-details footer
- Margin top: 24px

---

### Forgot Password - Success (`forgot/success.tsx`)

**No design provided. Build to match auth screen style:**

**Layout:**
- Centered vertical layout
- Top spacing: 64px or use flex with `justifyContent: 'center'`

**Success icon:**
- check_circle or verified, 64px, `success` color, filled
- In 120px circle background, `success` color at 10% opacity
- Margin bottom: 24px

**Headline:**
- "Password reset successful!": `displayLargeMobile`, `primary`
- Center-aligned
- Margin bottom: 16px

**Message:**
- "Your password has been successfully reset. You can now log in with your new password."
- Typography: `bodyMedium`, `textSecondary`
- Max width: 300px, center-aligned
- Margin bottom: 32px

**"Log in" button:**
- Height: 48px
- Background: `primary`
- Icon: arrow_forward, 18px
- Full width (or max 300px centered)
- Margin bottom: 16px

---

## Additional UI Patterns

### Step Indicator Badge
- Pill shape, `surface` background
- Padding: 4px horizontal, 2px vertical (or use auto with text padding)
- Typography: `labelSmall`, uppercase, 0.4em letter-spacing
- Optional icon: 16px before text, 6px gap
- Optional dot: 6px diameter, `accent` color, 6px gap before text

### Progress Bar
- Height: 6px (adjust for React Native visibility)
- Background: `surface`
- Fill: `accent`, animated transition (500ms ease-out)
- Border radius: full
- Width percentages:
  - Step 1: 33.33%
  - Step 2: 66.67%
  - Step 3: 100%

### Back Button
- Size: 40px circle
- Background: `surface` or `surface-container`
- Icon: arrow_back, 20-24px, `text` color
- Active state: scale 0.95
- Positioned with -8px left margin if edge-aligned

### Input with Icon
- Container height: 48px
- Icon: 20px, positioned absolutely at left 14px
- Text padding: left 44px (14 icon margin + 20 icon + 10 gap), right 14px
- Right icon (clear, toggle): positioned at right 12px, 28px touch target

### Button (Primary Action)
- Height: 48px
- Padding horizontal: 24px
- Border radius: full (pill)
- Text: `labelLarge`, white or contrasting color
- Icon: 18-20px, 8px gap from text
- Shadow: `shadows.button` for accent buttons
- Active: scale 0.99

### Info Card / Help Card
- Background: `surface`
- Border radius: 12-16px
- Padding: 12-16px
- Icon: 18-22px, in circle (32-40px)
- Title: `titleMedium`, `primary`
- Body: `bodySmall`, `textSecondary`
- Shadow: `shadows.card` (optional)

### Link Text
- Inline: `labelMedium` or `titleMedium`, `primary` or `accent` color
- Underline: optional, 2px offset
- Active: opacity 0.75
- Adjacent to body text: match surrounding line height

---

## React Native Implementation Notes

1. **Border radius for pill buttons:** Use `radii.full` (9999) or half of height
2. **Shadow on Android:** Use `elevation` prop, not `shadowOpacity`
3. **Input padding:** Account for icon width + gap when setting `paddingLeft`
4. **Percentage widths:** For progress bar, use `width: '33.33%'` in `StyleSheet` or calculated `Dimensions`
5. **Tabular numbers:** Use `fontVariant: ['tabular-nums']` for countdown timer
6. **Letter spacing:** React Native expects absolute values, not `em`. Convert `0.02em` at 12px = 0.24px
7. **Uppercase text:** Use `textTransform: 'uppercase'` in style, not manual caps
8. **Icon sizes:** Use `@expo/vector-icons` with `size` prop, position with `position: 'absolute'`
9. **Safe areas:** Wrap in `<ScreenContainer edges={['top', 'left', 'right']}>` for status bar handling

---

**Reference:** All pixel values are from the 2× export designs (390px width → 780px image width). Divide by 2 for 1× values if needed, but React Native uses logical pixels, so use the design values directly.
