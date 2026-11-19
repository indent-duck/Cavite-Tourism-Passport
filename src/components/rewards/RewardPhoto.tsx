import type { Reward } from '@/data/types';
import { colors } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

export interface RewardPhotoProps {
  reward: Reward;
  /** Size of the gift icon shown when the reward has no photo */
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Reward photo, or a tinted gift placeholder when there is none.
 * Fills its container; size it with `style`.
 */
export function RewardPhoto({ reward, iconSize = 48, style }: RewardPhotoProps) {
  return (
    <View style={[styles.container, style]}>
      {reward.imageSource ? (
        <Image
          source={reward.imageSource}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <Ionicons name="gift" size={iconSize} color={colors.primary} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryTint,
  },
});
