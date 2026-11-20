import { ResultInfoRow, ResultNote, ResultPanel, ResultSheet } from './ResultSheet';

/**
 * Location Failed Sheet
 *
 * Displays location check failed modal with:
 * - Location icon with an error badge
 * - "Location Check Failed" title
 * - Panel with the target site (when known) and what went wrong
 * - Why GPS is checked, and a high-accuracy GPS tip
 * - "Try again" (re-checks the location for the same code) and "Close scanner" buttons
 *
 * Matches design: design/screens/06-scanner/qr_modal_location_check_failed/screen.png
 *
 * Note: Omits hardcoded distances ("150m boundary") per product.md
 */

export interface LocationFailedSheetProps {
  visible: boolean;
  /** Tapping outside the modal or pressing back */
  onDismiss: () => void;
  targetSiteName: string;
  targetMunicipality: string;
  onTryAgain: () => void;
  onClose: () => void;
}

export function LocationFailedSheet({
  visible,
  onDismiss,
  targetSiteName,
  targetMunicipality,
  onTryAgain,
  onClose,
}: LocationFailedSheetProps) {
  return (
    <ResultSheet
      visible={visible}
      onDismiss={onDismiss}
      tone="warning"
      icon="location"
      badge="close"
      title="Location Check Failed"
      message="You need to be at this site to collect its stamp."
      primaryAction={{ title: 'Try again', onPress: onTryAgain, testID: 'location-failed-try-again' }}
      secondaryAction={{ title: 'Close scanner', onPress: onClose, testID: 'location-failed-close' }}
    >
      <ResultPanel>
        {/* Target site (hidden when the site isn't known) */}
        {!!targetSiteName && (
          <ResultInfoRow
            icon="business"
            label="TARGET SITE"
            value={targetSiteName}
            detail={targetMunicipality || undefined}
          />
        )}
        <ResultNote icon="close-circle" tone="error">
          Device is outside the site verification zone.
        </ResultNote>
      </ResultPanel>

      <ResultNote icon="shield-checkmark-outline">
        Our verification system uses GPS to ensure you are physically present at the official
        partner establishment.
      </ResultNote>
      <ResultNote icon="information-circle-outline">
        Check that high-accuracy GPS location is turned on in your device settings.
      </ResultNote>
    </ResultSheet>
  );
}
