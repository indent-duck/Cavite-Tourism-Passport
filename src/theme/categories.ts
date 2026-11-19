/**
 * Category colors and icons, shared by every place a category appears
 * (stamps, site cards, map pins, filter chips, rewards) so a category looks
 * the same everywhere.
 */

import type { Category } from "@/data/types";
import type { Ionicons } from "@expo/vector-icons";
import { colors } from "./index";

export const CATEGORY_COLORS: Record<Category, string> = {
  Dining: colors.categoryDining,
  Staycation: colors.categoryStaycation,
  Adventure: colors.categoryAdventure,
  Heritage: colors.categoryHeritage,
  Festival: colors.categoryFestival,
};

export const CATEGORY_ICONS: Record<Category, keyof typeof Ionicons.glyphMap> = {
  Dining: "restaurant",
  Staycation: "bed",
  Adventure: "trail-sign",
  Heritage: "library",
  Festival: "sparkles",
};

/** Category color at low opacity, for tinted backgrounds (`alpha` is 2-digit hex) */
export function categoryTint(category: Category, alpha = "1A"): string {
  return `${CATEGORY_COLORS[category]}${alpha}`;
}
