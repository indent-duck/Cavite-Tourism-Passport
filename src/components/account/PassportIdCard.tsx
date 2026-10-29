import { radii, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

interface PassportIdCardProps {
  userName: string;
  municipality: string;
  passportId: string;
}

/**
 * PassportIdCard Component
 * 
 * Displays the user's digital Cavite Tourism Passport ID card with:
 * - Official header with shield icon and title
 * - Active status badge
 * - Passport ID number
 * - Holder information (name and municipality)
 * - Simplified QR code representation
 * - Security decorative elements
 * 
 * Matches the design in design/screens/10-account/account.png
 */
export function PassportIdCard({ userName, municipality, passportId }: PassportIdCardProps) {

  return (
    <View style={styles.container}>
      {/* Decorative backdrop circles */}
      <Svg style={styles.backdropCircle1} width={160} height={160} viewBox="0 0 160 160">
        <Defs>
          <RadialGradient id="orangeGradient" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="#F89C48" stopOpacity="0.1" />
            <Stop offset="100%" stopColor="#F89C48" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={80} cy={80} r={80} fill="url(#orangeGradient)" />
      </Svg>

      <Svg style={styles.backdropCircle2} width={128} height={128} viewBox="0 0 128 128">
        <Circle cx={64} cy={64} r={64} fill="rgba(255, 255, 255, 0.05)" />
      </Svg>

      {/* Card Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.shieldContainer}>
            <Ionicons name="shield-checkmark" size={20} color="#F89C48" />
          </View>
          <View style={styles.headerTextGroup}>
            <Text style={styles.headerSubtitle}>REPUBLIC OF THE PHILIPPINES</Text>
            <Text style={styles.headerTitle}>Cavite Tourism Passport</Text>
          </View>
        </View>

        <View style={styles.activeBadge}>
          <View style={styles.activeDot} />
          <Text style={styles.activeBadgeText}>Active</Text>
        </View>
      </View>

      {/* Card Body */}
      <View style={styles.body}>
        <View style={styles.bodyLeft}>
          {/* Passport ID */}
          <Text style={styles.idLabel}>PASSPORT ID NUMBER</Text>
          <Text style={styles.idValue}>{passportId}</Text>

          {/* Holder Info */}
          <View style={styles.holderGroup}>
            <Text style={styles.holderLabel}>HOLDER NAME</Text>
            <Text style={styles.holderName} numberOfLines={1}>{userName}</Text>
            <View style={styles.municipalityRow}>
              <Ionicons name="location" size={13} color="#F89C48" />
              <Text style={styles.municipalityText}>{municipality}</Text>
            </View>
          </View>
        </View>

        {/* QR Code */}
        <View style={styles.qrContainer}>
          <View style={styles.qrCode}>
            <SimplifiedQRCode />
          </View>
          <Text style={styles.qrLabel}>SCAN ID</Text>
        </View>
      </View>

      {/* Card Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerLeft}>Provincial Tourism Board</Text>
        <Text style={styles.footerRight}>Official Pass 2027</Text>
      </View>
    </View>
  );
}

/**
 * SimplifiedQRCode Component
 * 
 * Renders a simplified QR code pattern matching the design.
 * Not a real scannable QR code - just for visual representation.
 */
function SimplifiedQRCode() {
  return (
    <Svg width={64} height={64} viewBox="0 0 64 64">
      <Defs>
        <LinearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#003260" />
          <Stop offset="100%" stopColor="#004987" />
        </LinearGradient>
      </Defs>

      {/* Corner markers (top-left) */}
      <Rect x={4} y={4} width={16} height={16} stroke="url(#primaryGradient)" strokeWidth={2} fill="none" />
      <Rect x={8} y={8} width={8} height={8} fill="url(#primaryGradient)" />

      {/* Corner markers (top-right) */}
      <Rect x={44} y={4} width={16} height={16} stroke="url(#primaryGradient)" strokeWidth={2} fill="none" />
      <Rect x={48} y={8} width={8} height={8} fill="url(#primaryGradient)" />

      {/* Corner markers (bottom-left) */}
      <Rect x={4} y={44} width={16} height={16} stroke="url(#primaryGradient)" strokeWidth={2} fill="none" />
      <Rect x={8} y={48} width={8} height={8} fill="url(#primaryGradient)" />

      {/* Center orange accent */}
      <Circle cx={32} cy={32} r={4} fill="#F89C48" />

      {/* Data pattern dots */}
      <Path
        d="M26 12h2v2h-2zm4 0h2v2h-2zm4 0h2v2h-2zm4 0h2v2h-2z
           M24 16h2v2h-2zm8 0h2v2h-2zm8 0h2v2h-2z
           M26 20h2v2h-2zm8 0h2v2h-2zm4 0h2v2h-2z
           M24 24h2v2h-2zm4 0h2v2h-2zm12 0h2v2h-2z
           M26 28h2v2h-2zm4 0h2v2h-2zm8 0h2v2h-2z
           M24 36h2v2h-2zm8 0h2v2h-2zm8 0h2v2h-2z
           M26 40h2v2h-2zm4 0h2v2h-2zm8 0h2v2h-2z
           M24 48h2v2h-2zm8 0h2v2h-2zm4 0h2v2h-2zm4 0h2v2h-2z
           M26 52h2v2h-2zm4 0h2v2h-2zm8 0h2v2h-2z"
        fill="url(#primaryGradient)"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.card,
    backgroundColor: '#0B2A4A',
    padding: spacing.base,
    borderWidth: 1,
    borderColor: '#1e4875',
    overflow: 'hidden',
    position: 'relative',
    ...{
      shadowColor: '#1B2A49',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.16,
      shadowRadius: 12,
      elevation: 6,
    },
  },

  // Backdrop decorative circles
  backdropCircle1: {
    position: 'absolute',
    bottom: -32,
    right: -32,
  },
  backdropCircle2: {
    position: 'absolute',
    top: -24,
    left: -24,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: spacing.md,
    marginBottom: spacing.sm + 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    flex: 1,
  },
  shieldContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(248, 156, 72, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextGroup: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 9,
    fontWeight: '500',
    color: 'rgba(212, 227, 255, 0.8)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6EE7B7',
  },

  // Body
  body: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    gap: spacing.md,
  },
  bodyLeft: {
    flex: 1,
  },

  // Passport ID
  idLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(212, 227, 255, 0.7)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  idValue: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '700',
    color: '#F89C48',
    letterSpacing: 1.6,
  },

  // Holder info
  holderGroup: {
    marginTop: spacing.md,
  },
  holderLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(212, 227, 255, 0.7)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  holderName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  municipalityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  municipalityText: {
    fontSize: 11,
    color: 'rgba(212, 227, 255, 0.8)',
  },

  // QR Code
  qrContainer: {
    alignItems: 'center',
  },
  qrCode: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.input,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...{
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
  },
  qrLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#003260',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginTop: 4,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  footerLeft: {
    fontSize: 11,
    color: 'rgba(212, 227, 255, 0.75)',
  },
  footerRight: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F89C48',
  },
});
