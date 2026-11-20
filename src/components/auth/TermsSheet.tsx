import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { LEGAL_EFFECTIVE_DATE, SIGNUP_LEGAL, type LegalDocId } from '@/data/signup-legal';
import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import {
    BottomSheetBackdrop,
    BottomSheetFooter,
    BottomSheetModal,
    BottomSheetScrollView,
    type BottomSheetBackdropProps,
    type BottomSheetFooterProps,
    type BottomSheetScrollViewMethods,
} from '@gorhom/bottom-sheet';
import { useCallback, useImperativeHandle, useRef, useState, type Ref } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface TermsSheetRef {
  /** Opens the sheet on the given document tab */
  present: (doc: LegalDocId) => void;
}

interface TermsSheetProps {
  ref?: Ref<TermsSheetRef>;
  /** Whether the user has already ticked the terms checkbox */
  accepted: boolean;
  /** Called when the user taps "I agree"; the sheet closes itself afterwards */
  onAccept: () => void;
}

const TABS: { label: string; value: LegalDocId }[] = [
  { label: 'Terms of Service', value: 'terms' },
  { label: 'Privacy Policy', value: 'privacy' },
];

/**
 * TermsSheet
 *
 * Bottom sheet on sign up step 1 that shows a short Terms of Service and
 * Privacy Policy in two tabs. Agreeing from here ticks the screen's terms
 * checkbox, so the user never has to leave the signup flow to read them.
 */
export function TermsSheet({ ref, accepted, onAccept }: TermsSheetProps) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const scrollRef = useRef<BottomSheetScrollViewMethods>(null);
  const insets = useSafeAreaInsets();
  const [docId, setDocId] = useState<LegalDocId>('terms');
  const [footerHeight, setFooterHeight] = useState(0);

  const doc = SIGNUP_LEGAL[docId];

  useImperativeHandle(ref, () => ({
    present: (nextDoc) => {
      Keyboard.dismiss();
      setDocId(nextDoc);
      sheetRef.current?.present();
    },
  }));

  const switchDoc = (nextDoc: LegalDocId) => {
    setDocId(nextDoc);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const close = () => sheetRef.current?.dismiss();

  const agree = () => {
    if (!accepted) onAccept();
    close();
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
    ),
    []
  );

  const renderFooter = (props: BottomSheetFooterProps) => (
    <BottomSheetFooter {...props}>
      <View
        style={[styles.footer, { paddingBottom: insets.bottom + spacing.base }]}
        onLayout={(event) => setFooterHeight(event.nativeEvent.layout.height)}
      >
        <Button
          title={accepted ? 'Done' : 'I agree'}
          onPress={agree}
          variant="accent"
          fullWidth
          icon={
            accepted ? undefined : <Ionicons name="checkmark" size={18} color={colors.background} />
          }
        />
      </View>
    </BottomSheetFooter>
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={['90%']}
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}
      handleIndicatorStyle={styles.handle}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title} accessibilityRole="header">
            Terms & Privacy
          </Text>
          <Text style={styles.meta}>{LEGAL_EFFECTIVE_DATE}</Text>
        </View>
        <Pressable
          onPress={close}
          hitSlop={8}
          style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Ionicons name="close" size={22} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.tabs}>
        <SegmentedControl options={TABS} selectedValue={docId} onValueChange={switchDoc} />
      </View>

      {/* Document */}
      <BottomSheetScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.content, { paddingBottom: footerHeight + spacing.lg }]}
      >
        <View style={styles.summary}>
          <Ionicons name="shield-checkmark" size={18} color={colors.primary} style={styles.lineIcon} />
          <Text style={styles.summaryText}>{doc.summary}</Text>
        </View>

        {doc.sections.map((section, index) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              {index + 1}. {section.title}
            </Text>
            <Text style={styles.body}>{section.body}</Text>
            {section.bullets?.map((bullet) => (
              <View key={bullet} style={styles.bullet}>
                <View style={styles.bulletDot} />
                <Text style={[styles.body, styles.flex]}>{bullet}</Text>
              </View>
            ))}
          </View>
        ))}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  handle: {
    backgroundColor: colors.border,
    width: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.headlineSmall,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
  },
  meta: {
    ...typography.bodySmall,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonPressed: {
    backgroundColor: colors.border,
  },
  tabs: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.lg,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.input,
    backgroundColor: colors.primaryTint,
  },
  summaryText: {
    ...typography.bodyMedium,
    fontFamily: 'Inter_500Medium',
    color: colors.primary,
    flex: 1,
  },
  lineIcon: {
    marginTop: 1,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.labelLarge,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
  },
  body: {
    ...typography.bodyMedium,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
  },
  bullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingLeft: spacing.xs,
  },
  // Sits on the first line of the bullet text
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: radii.full,
    backgroundColor: colors.accent,
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
