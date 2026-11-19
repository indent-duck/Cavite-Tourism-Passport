import type { Event } from "@/data/types";
import { EVENT_CATEGORY_COLORS, EVENT_CATEGORY_ICONS } from "@/theme/categories";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

export interface EventPhotoProps {
  event: Event;
  /** Size of the category icon shown when there is no photo */
  iconSize?: number;
}

/**
 * Event cover photo. Without one, shows a tile tinted in the event's
 * category color with the category icon (same approach as SitePhoto), so
 * photo-less cards still read as designed. Fills its parent.
 */
export function EventPhoto({ event, iconSize = 40 }: EventPhotoProps) {
  if (event.imageUrl) {
    return (
      <Image
        source={{ uri: event.imageUrl }}
        style={styles.fill}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
        recyclingKey={event.id}
        accessible={false}
      />
    );
  }

  const color = EVENT_CATEGORY_COLORS[event.category];

  return (
    <View style={[styles.fill, styles.placeholder, { backgroundColor: `${color}1A` }]}>
      <Ionicons
        name={EVENT_CATEGORY_ICONS[event.category]}
        size={iconSize}
        color={color}
        style={styles.icon}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    opacity: 0.5,
  },
});
