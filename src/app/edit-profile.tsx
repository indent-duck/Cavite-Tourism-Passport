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
import { useCurrentUser, useUpdateProfile } from '@/hooks';
import { formatAddress, getAddressPlace, getOutsidePlaceError, parseAddress } from '@/lib/address';
import { OUTSIDE_CAVITE } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';
import { hapticError, hapticSuccess } from '@/lib/haptics';
import { getFullName, getNameError, MAX_NAME_LENGTH, normalizeName } from '@/lib/names';
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
 * Save stays disabled until something changed. On success the `currentUser`
 * cache is updated in place, so the passport ID card and headers follow, and
 * a feedback dialog shows the saved name and city before returning to Settings.
 */
export default function EditProfileScreen() {
  const { data: user } = useCurrentUser();

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
}: {
  email: string;
  passportId: string;
  initialFirstName: string;
  initialLastName: string;
  initialAddress: string;
}) {
  const initial = parseAddress(initialAddress);

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [municipality, setMunicipality] = useState<string | null>(initial.municipality);
  const [street, setStreet] = useState(initial.line);
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [municipalityError, setMunicipalityError] = useState('');
  const [streetError, setStreetError] = useState('');
  const [formError, setFormError] = useState('');
  // "Name · City" just saved; shows the feedback dialog while set
  const [savedSummary, setSavedSummary] = useState<string | null>(null);
  // Several ways close the dialog (button, backdrop, Android back); leave only once
  const leaving = useRef(false);

  const updateProfile = useUpdateProfile();
  const firstNameRef = useRef<TextInputRef>(null);
  const lastNameRef = useRef<TextInputRef>(null);
  const streetRef = useRef<TextInputRef>(null);

  const hasChanges =
    normalizeName(firstName) !== initialFirstName ||
    normalizeName(lastName) !== initialLastName ||
    municipality !== initial.municipality ||
    street.trim() !== initial.line;

  const handleSave = async () => {
    setFormError('');

    const firstNameErrorMessage = getNameError(firstName, 'First name');
    const lastNameErrorMessage = getNameError(lastName, 'Last name');
    setFirstNameError(firstNameErrorMessage);
    setLastNameError(lastNameErrorMessage);
    const streetErrorMessage = municipality === OUTSIDE_CAVITE ? getOutsidePlaceError(street) : '';
    setMunicipalityError(municipality ? '' : 'Select your city or municipality');
    setStreetError(streetErrorMessage);

    if (firstNameErrorMessage || lastNameErrorMessage || !municipality || streetErrorMessage) {
      hapticError();
      if (firstNameErrorMessage) firstNameRef.current?.focus();
      else if (lastNameErrorMessage) lastNameRef.current?.focus();
      else if (streetErrorMessage) streetRef.current?.focus();
      return;
    }

    const saved = {
      firstName: normalizeName(firstName),
      lastName: normalizeName(lastName),
      address: formatAddress(street, municipality),
    };

    try {
      await updateProfile.mutateAsync(saved);
      Keyboard.dismiss();
      setSavedSummary(`${getFullName(saved)} · ${getAddressPlace(saved.address)}`);
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
          value={firstName}
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
          testID="edit-profile-first-name"
        />

        <TextInput
          ref={lastNameRef}
          label="Last name"
          leftIcon="person-outline"
          value={lastName}
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
          testID="edit-profile-last-name"
        />

        <MunicipalityPicker
          label="City or municipality"
          value={municipality}
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
        />

        <TextInput
          ref={streetRef}
          {...getAddressLineFieldProps(municipality)}
          value={street}
          onChangeText={(text) => {
            setStreet(text);
            setStreetError('');
            setFormError('');
          }}
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={hasChanges ? handleSave : undefined}
          error={streetError}
        />

        {formError ? <FormBanner message={formError} /> : null}
      </View>

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
});
