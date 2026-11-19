import type { Site } from "@/data/types";
import { CATEGORY_COLORS, CATEGORY_ICONS, categoryTint } from "@/theme/categories";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

export interface SitePhotoProps {
  site: Site;
  /** Size of the category icon shown when there is no photo */
  iconSize?: number;
}

/**
 * Site cover photo. Without one, shows a tile tinted in the site's category
 * color with the category icon, so photo-less cards still read as designed.
 */
export function SitePhoto({ site, iconSize = 40 }: SitePhotoProps) {
  if (site.imageUrl) {
    return (
      <Image
        source={{ uri: site.imageUrl }}
        style={styles.fill}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
        recyclingKey={site.id}
        accessible={false}
      />
    );
  }

  return (
    <View
      style={[
        styles.fill,
        styles.placeholder,
        { backgroundColor: categoryTint(site.category) },
      ]}
    >
      <Ionicons
        name={CATEGORY_ICONS[site.category]}
        size={iconSize}
        color={CATEGORY_COLORS[site.category]}
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
