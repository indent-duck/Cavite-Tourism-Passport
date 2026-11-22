import { Chip } from "@/components/ui/Chip";
import type { Category } from "@/data/types";
import { colors, spacing } from "@/theme";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/theme/categories";
import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SearchBar } from "./SearchBar";

export type CategoryFilter = "All" | Category;

/** Categories offered as filter chips on the Explore tab (Festival lives under Discover) */
export const CATEGORY_FILTERS: readonly CategoryFilter[] = [
  "All",
  "Dining",
  "Staycation",
  "Adventure",
  "Heritage",
];

export interface SiteFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
  /** Sites matching the current search, per chip */
  counts?: Partial<Record<CategoryFilter, number>>;
  /** Rendered to the right of the search bar, e.g. the list/map switch */
  trailing?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * SiteFilters Component
 *
 * Search bar (with an optional trailing control) and category chips below.
 * Each chip carries its category's icon and color (shared with site cards and
 * map pins) and how many sites match the current search.
 * Pinned at the top of the Explore Sites view in both list and map mode.
 *
 * Lays out edge-to-edge: it pads its own content horizontally so the chip
 * row can scroll to the screen edges. Inside a padded parent, pass a
 * negative horizontal margin via `style`.
 */
export function SiteFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  counts,
  trailing,
  style,
}: SiteFiltersProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <SearchBar value={searchQuery} onChangeText={onSearchChange} />
        </View>
        {trailing}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chips}
        contentContainerStyle={styles.chipsContent}
        keyboardShouldPersistTaps="handled"
      >
        {CATEGORY_FILTERS.map((category) => {
          const selected = selectedCategory === category;
          const color =
            category === "All" ? colors.primary : CATEGORY_COLORS[category];

          return (
            <Chip
              key={category}
              label={category}
              count={counts?.[category]}
              selected={selected}
              onPress={() => onCategoryChange(category)}
              backgroundColor={selected ? color : undefined}
              elevated
              icon={
                <Ionicons
                  name={category === "All" ? "apps" : CATEGORY_ICONS[category]}
                  size={14}
                  color={selected ? colors.background : color}
                />
              }
              testID={`category-chip-${category}`}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  searchBar: {
    flex: 1,
  },
  // Takes back the extra padding below, so the spacing around the row is
  // what it was before the chips had shadows
  chips: {
    marginVertical: -spacing.xs,
  },
  chipsContent: {
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    // Room for the chips' padded touch area and their shadows, which a
    // horizontal ScrollView would clip
    paddingVertical: spacing.sm,
  },
});
