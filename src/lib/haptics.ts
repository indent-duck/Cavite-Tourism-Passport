import * as Haptics from 'expo-haptics';

/** Success tap for a completed submit. */
export function hapticSuccess() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {
    // Haptics are best-effort; ignore devices without a vibration motor
  });
}

/** Short error buzz for failed form validation or a rejected submit. */
export function hapticError() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {
    // Haptics are best-effort; ignore devices without a vibration motor
  });
}
