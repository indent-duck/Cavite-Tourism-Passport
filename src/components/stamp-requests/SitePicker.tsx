import type { Site, Stamp, StampRequest } from '@/data/types';
import { getSiteStampState, type SiteStampState } from '@/lib/stamp-requests';
import { colors, radii, spacing, typography } from '@/theme';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/theme/categories';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetFlatList, BottomSheetModal, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useRef, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PickerField, renderSheetBackdrop, sheetStyles } from './PickerField';

interface SitePickerProps {
  sites: Site[];
  stamps: Stamp[];
  requests: StampRequest[];
  value: Site | null;
  onChange: (site: Site) => void;
  /** Pre-filled from the site screen; can't be changed */
  locked?: boolean;
  error?: string;
}

const STATE_LABELS: Partial<Record<SiteStampState, string>> = {
  stamped: 'Already stamped',
  pending: 'Pending review',
};

/**
 * SitePicker
 *
 * Form field that opens a searchable bottom sheet of partner sites. Sites the
 * user already has a stamp or a pending request for are shown but disabled.
 */
export function SitePicker({ sites, stamps, requests, value, onChange, locked, error }: SitePickerProps) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLowerCase();
  const filteredSites = normalizedQuery
    ? sites.filter(
        (site) =>
          site.name.toLowerCase().includes(normalizedQuery) ||
          site.municipality.toLowerCase().includes(normalizedQuery),
      )
    : sites;

  const open = () => {
    Keyboard.dismiss();
    sheetRef.current?.present();
  };

  const select = (site: Site) => {
    onChange(site);
    sheetRef.current?.dismiss();
  };

  return (
    <PickerField
      label="Site"
      value={value ? `${value.name}, ${value.municipality}` : undefined}
      placeholder="Select the site you visited"
      icon="location-outline"
      error={error}
      locked={locked}
      onPress={open}
      accessibilityHint="Opens a list of partner sites"
      testID="stamp-request-site-field"
    >
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={['85%']}
        enableDynamicSizing={false}
        backdropComponent={renderSheetBackdrop}
        handleIndicatorStyle={sheetStyles.handle}
        keyboardBehavior="extend"
        android_keyboardInputMode="adjustResize"
        onDismiss={() => setQuery('')}
      >
        <Text style={sheetStyles.title}>Which site stamped your passport?</Text>

        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <BottomSheetTextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name or municipality"
            placeholderTextColor={colors.textSecondary}
            style={styles.searchInput}
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel="Search sites"
          />
        </View>

        <BottomSheetFlatList
          data={filteredSites}
          keyExtractor={(site: Site) => site.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.base }}
          ListEmptyComponent={<Text style={styles.empty}>No sites match “{query.trim()}”.</Text>}
          renderItem={({ item: site }: { item: Site }) => {
            const selected = site.id === value?.id;
            const state = getSiteStampState(site.id, stamps, requests);
            const stateLabel = STATE_LABELS[state];
            const disabled = state !== 'available';
            const inkColor = CATEGORY_COLORS[site.category];

            return (
              <Pressable
                onPress={() => select(site)}
                disabled={disabled}
                style={({ pressed }) => [
                  sheetStyles.option,
                  (pressed || selected) && sheetStyles.optionActive,
                  disabled && sheetStyles.optionDisabled,
                ]}
                accessibilityRole="radio"
                accessibilityState={{ selected, disabled }}
                accessibilityLabel={`${site.name}, ${site.municipality}${stateLabel ? `, ${stateLabel}` : ''}`}
              >
                <View style={[styles.categoryIcon, { backgroundColor: `${inkColor}1A` }]}>
                  <Ionicons name={CATEGORY_ICONS[site.category]} size={18} color={inkColor} />
                </View>
                <View style={sheetStyles.optionText}>
                  <Text
                    style={[sheetStyles.optionName, selected && sheetStyles.optionNameSelected]}
                    numberOfLines={1}
                  >
                    {site.name}
                  </Text>
                  <Text style={sheetStyles.optionMeta} numberOfLines={1}>
                    {stateLabel ? `${site.municipality} · ${stateLabel}` : site.municipality}
                  </Text>
                </View>
                {selected && <Ionicons name="checkmark" size={20} color={colors.primary} />}
              </Pressable>
            );
          }}
        />
      </BottomSheetModal>
    </PickerField>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    borderRadius: radii.input,
    backgroundColor: colors.surface,
  },
  searchInput: {
    ...typography.bodyMedium,
    fontFamily: 'Inter_400Regular',
    color: colors.text,
    flex: 1,
    paddingVertical: spacing.sm,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
});
