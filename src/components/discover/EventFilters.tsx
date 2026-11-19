import { Chip } from "@/components/ui/Chip";
import type { Event, EventCategory } from "@/data/types";
import { getEventPoints } from "@/lib/event-utils";
import { colors, spacing } from "@/theme";
import { EVENT_CATEGORY_COLORS, EVENT_CATEGORY_ICONS } from "@/theme/categories";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet } from "react-native";

export type EventFilter = "All" | EventCategory | "Points";

interface FilterOption {
  value: EventFilter;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const FILTER_OPTIONS: readonly FilterOption[] = [
  { value: "All", label: "All", icon: "apps", color: colors.primary },
  {
    value: "Festival",
    label: "Festivals",
    icon: EVENT_CATEGORY_ICONS.Festival,
    color: EVENT_CATEGORY_COLORS.Festival,
  },
  {
    value: "Cultural",
    label: "Cultural",
    icon: EVENT_CATEGORY_ICONS.Cultural,
    color: EVENT_CATEGORY_COLORS.Cultural,
  },
  { value: "Points", label: "Earns points", icon: "star", color: colors.accent },
];

export function matchesEventFilter(event: Event, filter: EventFilter): boolean {
  if (filter === "All") return true;
  if (filter === "Points") return getEventPoints(event) !== undefined;
  return event.category === filter;
}

export interface EventFiltersProps {
  events: readonly Event[];
  selected: EventFilter;
  onChange: (filter: EventFilter) => void;
}

/**
 * Horizontally scrolling filter chips for the Events list, each with how
 * many of `events` it matches. Bleeds past its parent's horizontal padding
 * so the row scrolls to the screen edges.
 */
export function EventFilters({ events, selected, onChange }: EventFiltersProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.content}
    >
      {FILTER_OPTIONS.map((option) => {
        const isSelected = selected === option.value;
        const count = events.filter((event) => matchesEventFilter(event, option.value)).length;

        return (
          <Chip
            key={option.value}
            label={option.label}
            count={count}
            selected={isSelected}
            onPress={() => onChange(option.value)}
            backgroundColor={isSelected ? option.color : undefined}
            icon={
              <Ionicons
                name={option.icon}
                size={14}
                color={isSelected ? colors.background : option.color}
              />
            }
            testID={`event-filter-${option.value}`}
          />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginHorizontal: -spacing.base,
  },
  content: {
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    // Room for the chips' padded touch area
    paddingVertical: spacing.xs,
  },
});
