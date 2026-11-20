import type { StampTarget } from '@/data/types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/theme/categories';
import { ResultInfoRow, ResultPanel, ResultSheet } from './ResultSheet';

/**
 * Stamp Unavailable Sheet
 *
 * A valid code that can't be stamped right now:
 * - no promo period (season) is running
 * - a festival code scanned outside the festival's dates
 *
 * Calendar icon, title and message, the festival (when known) in the
 * festival color, and "Scan again" / "Close scanner" buttons. Same frame as
 * the other scanner result popups.
 */

export interface StampUnavailableSheetProps {
  visible: boolean;
  /** Tapping outside the modal or pressing back */
  onDismiss: () => void;
  title: string;
  message: string;
  /** The festival the code belongs to, if known */
  target?: StampTarget;
  /** Shown under the target, e.g. the festival's dates */
  detail?: string;
  onScanAgain: () => void;
  onClose: () => void;
}

export function StampUnavailableSheet({
  visible,
  onDismiss,
  title,
  message,
  target,
  detail,
  onScanAgain,
  onClose,
}: StampUnavailableSheetProps) {
  // "Kawit · Mar 1 – 5, 2027", skipping whichever part is missing
  const targetDetail = [target?.municipality, detail].filter(Boolean).join(' · ');

  return (
    <ResultSheet
      visible={visible}
      onDismiss={onDismiss}
      tone="warning"
      icon="calendar-outline"
      badge="time"
      title={title}
      message={message}
      primaryAction={{
        title: 'Scan again',
        onPress: onScanAgain,
        testID: 'stamp-unavailable-scan-again',
      }}
      secondaryAction={{ title: 'Close scanner', onPress: onClose, testID: 'stamp-unavailable-close' }}
    >
      {target && (
        <ResultPanel>
          <ResultInfoRow
            icon={CATEGORY_ICONS.Festival}
            label="FESTIVAL"
            value={target.name}
            detail={targetDetail || undefined}
            color={CATEGORY_COLORS.Festival}
          />
        </ResultPanel>
      )}
    </ResultSheet>
  );
}
