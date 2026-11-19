import { useCurrentUser } from '@/hooks/useCurrentUser';
import { usePromoPeriod } from '@/hooks/usePromoPeriod';
import {
    PASSPORT_FOOTER,
    PASSPORT_HEADER_LABEL,
    PASSPORT_ISSUER_LINE,
    PASSPORT_SUBTITLE,
} from '@/lib/constants';
import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { PassportPage } from './PassportPage';

const MONO_FONT = Platform.select({ ios: 'Menlo', default: 'monospace' });
const MRZ_LENGTH = 44;

function toDate(date: Date | string): Date | null {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isNaN(dateObj.getTime()) ? null : dateObj;
}

/**
 * Format date as "01 JAN 2027"
 * Handles both Date objects and date strings
 */
function formatPassportDate(date: Date | string): string {
  const dateObj = toDate(date);
  if (!dateObj) {
    return 'INVALID DATE';
  }

  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
    .format(dateObj)
    .toUpperCase();
}

/** Uppercase, replace anything that isn't A-Z/0-9 with the MRZ filler "<" */
function mrzClean(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]+/g, '<');
}

function mrzPad(value: string): string {
  return value.padEnd(MRZ_LENGTH, '<').slice(0, MRZ_LENGTH);
}

/**
 * Builds a decorative, machine-readable-zone style pair of lines
 * from the holder's name, passport ID, and expiry date.
 */
function buildMrz(name: string, passportId: string, validThrough: Date | string): [string, string] {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const surname = parts.length > 1 ? parts[parts.length - 1] : parts[0] ?? '';
  const given = parts.length > 1 ? parts.slice(0, -1).join(' ') : '';

  const expiry = toDate(validThrough);
  const yymmdd = expiry
    ? `${String(expiry.getFullYear()).slice(-2)}${String(expiry.getMonth() + 1).padStart(2, '0')}${String(
        expiry.getDate(),
      ).padStart(2, '0')}`
    : '000000';

  const line1 = mrzPad(`P<PHL${mrzClean(surname)}<<${mrzClean(given)}`);
  const line2 = mrzPad(`${mrzClean(passportId).replace(/</g, '')}<PHL<CAV${yymmdd}`);
  return [line1, line2];
}

interface FieldProps {
  label: string;
  value: string;
  style?: StyleProp<ViewStyle>;
  valueStyle?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

function Field({ label, value, style, valueStyle, numberOfLines = 2 }: FieldProps) {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={[styles.fieldValue, valueStyle]} numberOfLines={numberOfLines}>
        {value}
      </Text>
    </View>
  );
}

/**
 * Identity Page card component
 *
 * Displays passport identity information including holder details,
 * passport ID, and validity dates from promo period.
 *
 * Validates: Requirements 2.4, 2.5
 */
export function IdentityCard() {
  const { data: currentUser } = useCurrentUser();
  const { data: promoPeriod } = usePromoPeriod();

  if (!currentUser || !promoPeriod) {
    return null;
  }

  const issuedDate = formatPassportDate(promoPeriod.startDate);
  const validThroughDate = formatPassportDate(promoPeriod.endDate);
  const [mrzLine1, mrzLine2] = buildMrz(currentUser.name, currentUser.passportId, promoPeriod.endDate);

  return (
    <PassportPage
      icon="shield-checkmark"
      title={PASSPORT_ISSUER_LINE}
      subtitle={PASSPORT_SUBTITLE}
      badge={PASSPORT_HEADER_LABEL}
      footerText={PASSPORT_FOOTER}
      pageNumber="01"
      testID="passport-identity-page"
    >
      <View style={styles.content}>
        {/* Holder photo + primary credentials */}
        <View style={styles.holderRow}>
          <View style={styles.photoFrame}>
            <View style={styles.photo}>
              <Ionicons name="person" size={64} color={colors.primary} style={styles.photoIcon} />
            </View>
            <View style={styles.photoCaption}>
              <Text style={styles.photoCaptionText}>HOLDER</Text>
            </View>
          </View>

          <View style={styles.holderFields}>
            <Field
              label="Passport ID"
              value={currentUser.passportId}
              style={styles.idField}
              valueStyle={styles.passportId}
              numberOfLines={1}
            />
            <Field label="Full Name" value={currentUser.name} />
          </View>
        </View>

        <Field label="Address" value={currentUser.address} />

        {/* Validity */}
        <View style={styles.datesRow}>
          <Field label="Issued" value={issuedDate} style={styles.dateField} valueStyle={styles.dateValue} numberOfLines={1} />
          <View style={styles.dateDivider} />
          <Field
            label="Valid Through"
            value={validThroughDate}
            style={styles.dateField}
            valueStyle={[styles.dateValue, styles.validThrough]}
            numberOfLines={1}
          />
        </View>

        {/* Machine-readable zone */}
        <View style={styles.mrz} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Text style={styles.mrzText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
            {mrzLine1}
          </Text>
          <Text style={styles.mrzText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
            {mrzLine2}
          </Text>
        </View>
      </View>
    </PassportPage>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
  },

  // Holder row
  holderRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  photoFrame: {
    width: 96,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.passportPaperBorder,
    backgroundColor: colors.background,
    padding: 3,
  },
  photo: {
    flex: 1,
    minHeight: 104,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  photoIcon: {
    opacity: 0.55,
    marginBottom: -8,
  },
  photoCaption: {
    backgroundColor: colors.passportLeather,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    paddingVertical: 3,
    alignItems: 'center',
  },
  photoCaptionText: {
    ...typography.labelSmall,
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    color: colors.passportFoil,
    letterSpacing: 1.5,
  },
  holderFields: {
    flex: 1,
    gap: spacing.sm,
  },

  // Fields
  field: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.passportPaperBorder,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  fieldLabel: {
    ...typography.labelSmall,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  fieldValue: {
    ...typography.bodyMedium,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    fontSize: 15,
    color: colors.text,
  },
  idField: {
    backgroundColor: colors.passportPaper,
  },
  passportId: {
    fontFamily: MONO_FONT,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5,
    color: colors.primary,
  },

  // Dates
  datesRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.passportPaper,
    borderWidth: 1,
    borderColor: colors.passportPaperBorder,
    borderRadius: radii.md,
  },
  dateField: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  dateDivider: {
    width: 1,
    marginVertical: spacing.sm,
    backgroundColor: colors.passportPaperBorder,
  },
  dateValue: {
    fontSize: 14,
  },
  validThrough: {
    color: colors.textTertiary,
  },

  // MRZ
  mrz: {
    backgroundColor: colors.passportPaper,
    borderWidth: 1,
    borderColor: colors.passportPaperBorder,
    borderRadius: radii.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    gap: 2,
    marginTop: spacing.xs,
  },
  mrzText: {
    fontFamily: MONO_FONT,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.5,
    color: colors.text,
    opacity: 0.75,
  },
});
