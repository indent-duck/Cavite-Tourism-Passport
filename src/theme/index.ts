/**
 * Theme System - Cavite Tourism Passport
 *
 * Single source of truth for all design tokens.
 * Components must import these tokens - never hardcode visual values.
 */

// ============================================================================
// COLORS
// ============================================================================

export const colors = {
  // Primary palette
  primary: "#004987", // Navy blue for navigation, headers
  secondary: "#095495", // secondary blue accent color
  accent: "#F47B20", // Orange for CTAs, highlights
  background: "#FFFFFF", // Main canvas background
  surface: "#F4F6FA", // Card backgrounds

  // Text colors
  text: "#1B2A49", // Primary text
  textSecondary: "#6B7280", // Secondary text, metadata
  textTertiary: "#8B4513", // tertiary colore, dark orange

  // Semantic colors
  success: "#2E9E5B", // Success states, completed stamps
  successLight: "#E8F5E9", // Light green background for collected states
  successDark: "#1B5E20", // Dark green text for collected states
  error: "#D64545", // Error states, validation failures

  // Structural colors
  border: "#E5E7EB", // Dividers, input borders

  // Passport-specific colors
  passportCream: "#FFFDF7", // Passport body tint/background
  passportHeaderBorder: "#F47B20", // Orange border on passport header (reuses accent)
  passportLeather: "#0B2A4A",
  passportFoil: "#F89C48",

  // Category stamp colors
  categoryDining: "#00542A", // Green for Dining stamps
  categoryStaycation: "#095495", // Navy blue for Staycation stamps (reuses primary)
  categoryAdventure: "#6B7280", // Gray for Adventure stamps (reuses textSecondary)
  categoryHeritage: "#8B4513", // Brown for Heritage stamps (one fixed color)
  categoryFestival: "#F47B20", // Orange for Festival stamps (reuses accent)
} as const;

// ============================================================================
// SPACING
// ============================================================================

/**
 * Spacing scale in pixels.
 * Use these for margins, paddings, and gaps.
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

/**
 * Typography scale using Inter font family.
 * Includes fontSize, lineHeight, fontWeight, and letterSpacing.
 * Load Inter fonts via @expo-google-fonts/inter in app/_layout.tsx
 */
export const typography = {
  // Font family
  fontFamily: "Inter",

  // Display styles
  displayLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
    letterSpacing: -0.64,
  },
  displayLargeMobile: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
    letterSpacing: -0.28,
  },

  // Headline styles
  headlineLarge: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700" as const,
    letterSpacing: -0.24,
  },
  headlineMedium: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
  },
  headlineSmall: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600" as const,
  },

  // Title styles
  titleMedium: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600" as const,
  },

  // Body styles
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400" as const,
  },

  // Label styles
  labelLarge: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600" as const,
    letterSpacing: 0.14,
  },
  labelMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600" as const,
    letterSpacing: 0.24,
  },
  labelSmall: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "700" as const,
    letterSpacing: 0.4,
  },
} as const;

// ============================================================================
// BORDER RADII
// ============================================================================

/**
 * Border radius values in pixels.
 */
export const radii = {
  sm: 6,
  md: 10,
  card: 16,
  button: 24, // Pill shape
  chip: 16,
  input: 12,
  full: 9999,
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

/**
 * Shadow elevations for iOS and Android.
 * iOS uses shadow* properties, Android uses elevation.
 */
export const shadows = {
  card: {
    shadowColor: "#1B2A49",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  button: {
    shadowColor: "#F47B20",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 4,
  },
  tabBar: {
    shadowColor: "#1B2A49",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;
