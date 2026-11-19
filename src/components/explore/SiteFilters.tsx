import { Chip } from "@/components/ui/Chip";
import type { Category } from "@/data/types";
import { spacing } from "@/theme";
import {
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { ListMapSwitch } from "./ListMapSwitch";
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
  mode: "list" | "map";
  onModeChange: (mode: "list" | "map") => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * SiteFilters Component
 *
 * Search bar + List/Map switch row with category chips below.
 * Shared by the Explore list view and the floating overlay on the map view.
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
  mode,
  onModeChange,
  style,
}: SiteFiltersProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.searchRow}>
        <View style={styles.searchBarContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Search sites..."
          />
        </View>
        <ListMapSwitch value={mode} onValueChange={onModeChange} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContent}
        keyboardShouldPersistTaps="handled"
      >
        {CATEGORY_FILTERS.map((category) => (
          <Chip
            key={category}
            label={category}
            selected={selectedCategory === category}
            onPress={() => onCategoryChange(category)}
            testID={`category-chip-${category}`}
          />
        ))}
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
  searchBarContainer: {
    flex: 1,
  },
  chipsContent: {
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
  },
});
