import { DetailsChangeConfirmModal } from '@/components/account';
import {
  FormBanner,
  getAddressLineFieldProps,
  isSameAddressKind,
  MunicipalityPicker,
} from '@/components/auth';
import { Button } from '@/components/ui/Button';
import { FeedbackModal } from '@/components/ui/FeedbackModal';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextInput, type TextInputRef } from '@/components/ui/TextInput';
import type { ProfileUpdate } from '@/data/types';
import { useCurrentUser, useUpdateProfile } from '@/hooks';
import { formatAddress, getAddressPlace, getOutsidePlaceError, parseAddress } from '@/lib/address';
import { OUTSIDE_CAVITE } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';
import { hapticError, hapticSuccess } from '@/lib/haptics';
import { getFullName, getNameError, MAX_NAME_LENGTH, normalizeName } from '@/lib/names';
import { formatShortDate } from '@/lib/rewards';
import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState, type ReactNode } from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';

/**
 * Personal Details Screen (Settings → Account → Personal details)
 *
 * Edit the name and address entered at sign up: first name, last name, city
 * or municipality, and an optional barangay/street line, or for "Outside
 * Cavite" the city and province or country (same fields and address format as
 * sign up). Email and passport ID are shown read-only.
 *
 * The name and the address can each change once every
 * `detailsChangeCooldownDays` (30; the database enforces it, migration 008).
 * A locked one shows read-only with the date it unlocks, and saving a change
 * first confirms how long it will stay. Only what changed is sent.
 *
 * Save stays disabled until something changed. On success the `currentUser`
 * cache is updated in place, so the passport ID card and headers follow, and
 * a feedback dialog shows the saved name and city before returning to Settings.
 */
export default function EditProfileScreen() {
  // Fresh change locks, even if the cached user is recent (e.g. changed on another phone)
  const { data: user } = useCurrentUser({ refetchOnMount: 'always' });

  // The form mounts once the user has loaded, so its fields start prefilled
  if (!user) {
    return <Screen>{null}</Screen>;
  }
  return (
    <ProfileForm
      email={user.email}
      passportId={user.passportId}
      initialFirstName={user.firstName}
      initialLastName={user.lastName}
      initialAddress={user.address}
      nameLockedUntil={user.nameLockedUntil ?? null}
      addressLockedUntil={user.addressLockedUntil ?? null}
      cooldownDays={user.detailsChangeCooldownDays ?? 30}
    />
  );
}

function Screen({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <ScreenContainer
      showHeader
      headerTitle="Personal details"
      onBackPress={() => router.back()}
      scrollable
      keyboardAware
      edges={['top', 'left', 'right', 'bottom']}
      contentContainerStyle={styles.content}
      keyboardFooter={footer}
      testID="edit-profile-screen"
    >
      <StatusBar style="dark" />
      {children}
    </ScreenContainer>
  );
}

function ProfileForm({
  email,
  passportId,
  initialFirstName,
  initialLastName,
  initialAddress,
  nameLockedUntil,
  addressLockedUntil,
  cooldownDays,
}: {
  email: string;
  passportId: string;
  initialFirstName: string;
  initialLastName: string;
  initialAddress: string;
  nameLockedUntil: Date | null;
  addressLockedUntil: Date | null;
  cooldownDays: number;
}) {
  const initial = parseAddress(initialAddress);

  // Fixed while the screen is open: a lock that runs out meanwhile lifts on the next visit
  const [openedAt] = useState(Date.now);
  const nameLocked = nameLockedUntil !== null && nameLockedUntil.getTime() > openedAt;
  const addressLocked = addressLockedUntil !== null && addressLockedUntil.getTime() > openedAt;
  // When a save now would let the name or address change again
  const relockDate = new Date(openedAt);
  relockDate.setDate(relockDate.getDate() + cooldownDays);

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [municipality, setMunicipality] = useState<string | null>(initial.municipality);
  const [street, setStreet] = useState(initial.line);
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [municipalityError, setMunicipalityError] = useState('');
  const [streetError, setStreetError] = useState('');
  const [formError, setFormError] = useState('');
  const [confirming, setConfirming] = useState(false);
  // "Name · City" just saved; shows the feedback dialog while set
  const [savedSummary, setSavedSummary] = useState<string | null>(null);
  // Several ways close the dialog (button, backdrop, Android back); leave only once
  const leaving = useRef(false);

  const updateProfile = useUpdateProfile();
  const firstNameRef = useRef<TextInputRef>(null);
  const lastNameRef = useRef<TextInputRef>(null);
  const streetRef = useRef<TextInputRef>(null);

  // A locked group shows what's saved (the server's values, if a save just
  // found it locked) and never counts as changed
  const shownFirstName = nameLocked ? initialFirstName : firstName;
  const shownLastName = nameLocked ? initialLastName : lastName;
  const shownMunicipality = addressLocked ? initial.municipality : municipality;
  const shownStreet = addressLocked ? initial.line : street;

  const nameChanged =
    !nameLocked &&
    (normalizeName(firstName) !== normalizeName(initialFirstName) ||
      normalizeName(lastName) !== normalizeName(initialLastName));
  const addressChanged =
    !addressLocked && (municipality !== initial.municipality || street.trim() !== initial.line);
  const hasChanges = nameChanged || addressChanged;

  // Check what changed, then confirm the lock that saving starts
  const handleSave = () => {
    setFormError('');

    const firstNameErrorMessage = nameChanged ? getNameError(firstName, 'First name') : '';
    const lastNameErrorMessage = nameChanged ? getNameError(lastName, 'Last name') : '';
    const municipalityErrorMessage =
      addressChanged && !municipality ? 'Select your city or municipality' : '';
    const streetErrorMessage =
      addressChanged && municipality === OUTSIDE_CAVITE ? getOutsidePlaceError(street) : '';
    setFirstNameError(firstNameErrorMessage);
    setLastNameError(lastNameErrorMessage);
    setMunicipalityError(municipalityErrorMessage);
    setStreetError(streetErrorMessage);

    if (
      firstNameErrorMessage ||
      lastNameErrorMessage ||
      municipalityErrorMessage ||
      streetErrorMessage
    ) {
      hapticError();
      if (firstNameErrorMessage) firstNameRef.current?.focus();
      else if (lastNameErrorMessage) lastNameRef.current?.focus();
      else if (streetErrorMessage) streetRef.current?.focus();
      return;
    }

    Keyboard.dismiss();
    setConfirming(true);
  };

  const save = async () => {
    setConfirming(false);

    const updates: ProfileUpdate = {};
    if (nameChanged) {
      updates.firstName = normalizeName(firstName);
      updates.lastName = normalizeName(lastName);
    }
    if (addressChanged && municipality) {
      updates.address = formatAddress(street, municipality);
    }

    try {
      const user = await updateProfile.mutateAsync(updates);
      setSavedSummary(`${getFullName(user)} · ${getAddressPlace(user.address)}`);
      hapticSuccess();
    } catch (saveError) {
      setFormError(
        saveError instanceof Error
          ? getErrorMessage(saveError)
          : 'Failed to save your details. Please try again.'
      );
      hapticError();
    }
  };

  const handleDone = () => {
    if (leaving.current) return;
    leaving.current = true;
    router.back();
  };

  return (
    <Screen
      footer={
        <Button
          title="Save changes"
          onPress={handleSave}
          variant="accent"
          fullWidth
          disabled={!hasChanges}
          loading={updateProfile.isPending}
          icon={<Ionicons name="checkmark" size={20} color={colors.background} />}
          testID="edit-profile-save"
        />
      }
    >
      {/* Fixed account identifiers */}
      <View style={styles.readOnlyCard}>
        <ReadOnlyRow icon="mail-outline" label="Email" value={email} />
        <View style={styles.readOnlyDivider} />
        <ReadOnlyRow icon="id-card-outline" label="Passport ID" value={passportId} />
      </View>
      <Text style={styles.readOnlyNote}>
        Your email and passport ID can’t be changed. Contact the helpdesk if your email is wrong.
      </Text>

      <View style={styles.form}>
        <TextInput
          ref={firstNameRef}
          label="First name"
          leftIcon="person-outline"
          value={shownFirstName}
          onChangeText={(text) => {
            setFirstName(text);
            setFirstNameError('');
            setFormError('');
          }}
          placeholder="e.g. Juan"
          autoCapitalize="words"
          autoComplete="given-name"
          textContentType="givenName"
          maxLength={MAX_NAME_LENGTH}
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => lastNameRef.current?.focus()}
          error={firstNameError}
          editable={!nameLocked}
          testID="edit-profile-first-name"
        />

        <TextInput
          ref={lastNameRef}
          label="Last name"
          leftIcon="person-outline"
          value={shownLastName}
          onChangeText={(text) => {
            setLastName(text);
            setLastNameError('');
            setFormError('');
          }}
          placeholder="e.g. Dela Cruz"
          autoCapitalize="words"
          autoComplete="family-name"
          textContentType="familyName"
          maxLength={MAX_NAME_LENGTH}
          returnKeyType="done"
          error={lastNameError}
          editable={!nameLocked}
          testID="edit-profile-last-name"
        />
        {nameLocked && nameLockedUntil ? (
          <LockedNote>
            You can change your name again on {formatShortDate(nameLockedUntil)}.
          </LockedNote>
        ) : null}

        <MunicipalityPicker
          label="City or municipality"
          value={shownMunicipality}
          onChange={(selected) => {
            // Street text means nothing as a place outside Cavite, and vice versa
            if (!isSameAddressKind(selected, municipality)) {
              setStreet('');
              setStreetError('');
            }
            setMunicipality(selected);
            setMunicipalityError('');
            setFormError('');
          }}
          error={municipalityError}
          disabled={addressLocked}
        />

        <TextInput
          ref={streetRef}
          {...getAddressLineFieldProps(shownMunicipality)}
          value={shownStreet}
          onChangeText={(text) => {
            setStreet(text);
            setStreetError('');
            setFormError('');
          }}
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={hasChanges ? handleSave : undefined}
          error={streetError}
          editable={!addressLocked}
        />
        {addressLocked && addressLockedUntil ? (
          <LockedNote>
            You can change your address again on {formatShortDate(addressLockedUntil)}.
          </LockedNote>
        ) : null}

        {formError ? <FormBanner message={formError} /> : null}
      </View>

      <DetailsChangeConfirmModal
        visible={confirming}
        nameUntil={nameChanged ? formatShortDate(relockDate) : undefined}
        addressUntil={addressChanged ? formatShortDate(relockDate) : undefined}
        onConfirm={save}
        onCancel={() => setConfirming(false)}
      />

      <FeedbackModal
        visible={savedSummary !== null}
        onDone={handleDone}
        icon="person"
        title="Details updated"
        message="Your passport now shows your new details."
        note={savedSummary ? { icon: 'id-card-outline', text: savedSummary } : undefined}
        buttonTitle="Back to Settings"
        testID="details-updated"
      />
    </Screen>
  );
}

/** Under a locked group: when it can change again */
function LockedNote({ children }: { children: ReactNode }) {
  return (
    <View style={styles.lockedNote}>
      <Ionicons name="lock-closed" size={14} color={colors.textSecondary} />
      <Text style={styles.lockedNoteText}>{children}</Text>
    </View>
  );
}

function ReadOnlyRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View
      style={styles.readOnlyRow}
      accessible
      accessibilityLabel={`${label}: ${value}. Can't be changed`}
    >
      <Ionicons name={icon} size={20} color={colors.textSecondary} />
      <View style={styles.readOnlyText}>
        <Text style={styles.readOnlyLabel}>{label}</Text>
        <Text style={styles.readOnlyValue} numberOfLines={1} ellipsizeMode="middle">
          {value}
        </Text>
      </View>
      <Ionicons name="lock-closed" size={14} color={colors.textSecondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.base,
    gap: spacing.sm,
  },
  readOnlyCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
  },
  readOnlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  readOnlyDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  readOnlyText: {
    flex: 1,
    gap: 2,
  },
  readOnlyLabel: {
    ...typography.bodySmall,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
  },
  readOnlyValue: {
    ...typography.labelLarge,
    fontFamily: 'Inter_600SemiBold',
    color: colors.text,
  },
  readOnlyNote: {
    ...typography.bodySmall,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    paddingHorizontal: spacing.xs,
  },
  form: {
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  lockedNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    marginTop: -spacing.sm, // sits under the field above, not a full form gap away
  },
  lockedNoteText: {
    ...typography.bodySmall,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    flex: 1,
  },
});
