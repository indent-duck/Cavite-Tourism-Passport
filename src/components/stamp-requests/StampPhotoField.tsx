import { Button } from '@/components/ui/Button';
import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

interface StampPhotoFieldProps {
  /** Local URI of the chosen photo */
  value: string | null;
  onChange: (uri: string | null) => void;
  error?: string;
}

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  quality: 0.7,
};

/**
 * StampPhotoField
 *
 * Photo of the stamp in the physical passport, the admin's evidence for the
 * request. Take one with the camera or pick one from the gallery; once chosen
 * it shows a preview with Retake / Remove.
 */
export function StampPhotoField({ value, onChange, error }: StampPhotoFieldProps) {
  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      if (!permission.canAskAgain) {
        Alert.alert(
          'Camera access needed',
          'Allow camera access in Settings to take a photo of your stamp, or choose one from your gallery.',
          [
            { text: 'Not now', style: 'cancel' },
            { text: 'Open settings', onPress: () => Linking.openSettings() },
          ],
        );
      }
      return;
    }

    const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
    if (!result.canceled) onChange(result.assets[0].uri);
  };

  const chooseFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
    if (!result.canceled) onChange(result.assets[0].uri);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Photo of the stamp</Text>

      {value ? (
        <View style={styles.previewWrap}>
          <Image
            source={{ uri: value }}
            style={styles.preview}
            contentFit="cover"
            accessibilityLabel="Photo of your passport stamp"
          />
          <View style={styles.previewActions}>
            <Pressable
              onPress={takePhoto}
              style={styles.previewAction}
              accessibilityRole="button"
              accessibilityLabel="Retake photo"
              hitSlop={spacing.xs}
            >
              <Ionicons name="camera-outline" size={18} color={colors.primary} />
              <Text style={styles.previewActionText}>Retake</Text>
            </Pressable>
            <Pressable
              onPress={chooseFromGallery}
              style={styles.previewAction}
              accessibilityRole="button"
              accessibilityLabel="Choose a different photo from gallery"
              hitSlop={spacing.xs}
            >
              <Ionicons name="images-outline" size={18} color={colors.primary} />
              <Text style={styles.previewActionText}>Gallery</Text>
            </Pressable>
            <Pressable
              onPress={() => onChange(null)}
              style={styles.previewAction}
              accessibilityRole="button"
              accessibilityLabel="Remove photo"
              hitSlop={spacing.xs}
            >
              <Ionicons name="trash-outline" size={18} color={colors.error} />
              <Text style={[styles.previewActionText, styles.removeText]}>Remove</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={[styles.empty, error ? styles.emptyError : null]}>
          <View style={styles.emptyIcon}>
            <Ionicons name="camera-outline" size={28} color={colors.primary} />
          </View>
          <Text style={styles.emptyHint}>
            Make sure the whole stamp and its date are clear and readable.
          </Text>
          <View style={styles.emptyButtons}>
            <Button
              title="Take photo"
              onPress={takePhoto}
              variant="primary"
              size="compact"
              icon={<Ionicons name="camera" size={16} color={colors.background} />}
              testID="stamp-request-take-photo"
            />
            <Button
              title="Gallery"
              onPress={chooseFromGallery}
              variant="outline"
              size="compact"
              icon={<Ionicons name="images-outline" size={16} color={colors.primary} />}
              testID="stamp-request-choose-photo"
            />
          </View>
        </View>
      )}

      {error ? (
        <View style={styles.errorRow} accessibilityLiveRegion="polite">
          <Ionicons name="alert-circle" size={14} color={colors.error} />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.xs + 2,
  },
  label: {
    ...typography.labelMedium,
    fontFamily: 'Inter_600SemiBold',
    color: colors.text,
    paddingHorizontal: spacing.xs,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.base,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  emptyError: {
    borderColor: colors.error,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHint: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  emptyButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  previewWrap: {
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  preview: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  previewAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  previewActionText: {
    ...typography.labelLarge,
    color: colors.primary,
  },
  removeText: {
    color: colors.error,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
    flex: 1,
  },
});
