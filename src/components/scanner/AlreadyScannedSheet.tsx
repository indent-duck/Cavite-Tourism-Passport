import { usePromoPeriod } from '@/hooks/usePromoPeriod';
import { ResultDivider, ResultInfoRow, ResultNote, ResultPanel, ResultSheet } from './ResultSheet';

/**
 * Already Scanned Sheet
 *
 * Displays already scanned modal with:
 * - Stamp icon with a "history" badge
 * - "Already Scanned" title
 * - Site name and collected date
 * - Promo period note
 * - "Dismiss" button, which opens the stamp in the Passport
 *
 * Matches design: design/screens/06-scanner/qr_modal_already_scanned/screen.png
 */

export interface AlreadyScannedSheetProps {
  visible: boolean;
  /** Tapping outside the modal or pressing back */
  onDismiss: () => void;
  siteName: string;
  collectedDate: Date;
  onViewPassport: () => void;
}

// Dates might be strings after serialization
function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export function AlreadyScannedSheet({
  visible,
  onDismiss,
  siteName,
  collectedDate,
  onViewPassport,
}: AlreadyScannedSheetProps) {
  const { data: promoPeriod } = usePromoPeriod();

  const collectedOn = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(toDate(collectedDate));

  const shortDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const promoRange = promoPeriod
    ? `${shortDate.format(toDate(promoPeriod.startDate))} – ${shortDate.format(toDate(promoPeriod.endDate))}`
    : null;

  return (
    <ResultSheet
      visible={visible}
      onDismiss={onDismiss}
      tone="info"
      icon="checkmark-done"
      badge="time"
      title="Already Scanned"
      message="You have already collected a stamp from this site."
      primaryAction={{ title: 'Dismiss', onPress: onViewPassport }}
    >
      <ResultPanel>
        <ResultInfoRow icon="location" label="SITE" value={siteName} />
        <ResultDivider />
        <ResultInfoRow icon="calendar" label="COLLECTED ON" value={collectedOn} />
      </ResultPanel>

      <ResultNote icon="information-circle-outline">
        You can collect one stamp per site during the promo period
        {promoRange && ` (${promoRange})`}.
      </ResultNote>
    </ResultSheet>
  );
}
