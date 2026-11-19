import * as Haptics from 'expo-haptics';

/** Short error buzz for failed form validation or a rejected submit. */
export function hapticError() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {
    // Haptics are best-effort; ignore devices without a vibration motor
  });
}
