import { FormBanner } from '@/components/auth/FormBanner';
import { InfoBanner } from '@/components/detail/InfoBanner';
import { SitePicker } from '@/components/stamp-requests/SitePicker';
import { StampPhotoField } from '@/components/stamp-requests/StampPhotoField';
import { VisitDatePicker } from '@/components/stamp-requests/VisitDatePicker';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StateView } from '@/components/ui/StateView';
import { TextInput } from '@/components/ui/TextInput';
import type { Site, SubmitStampRequestResult } from '@/data/types';
import { usePromoPeriod } from '@/hooks/usePromoPeriod';
import { useSites } from '@/hooks/useSites';
import { useStampRequests } from '@/hooks/useStampRequests';
import { useStamps } from '@/hooks/useStamps';
import { useSubmitStampRequest } from '@/hooks/useSubmitStampRequest';
import { hapticError, hapticSuccess } from '@/lib/haptics';
import { getVisitDateOptions } from '@/lib/stamp-requests';
import { colors, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

const NOTE_MAX_LENGTH = 300;

const FAILURE_MESSAGES: Record<Extract<SubmitStampRequestResult, { success: false }>['reason'], string> = {
  alreadyStamped: 'This stamp is already in your digital passport.',
  alreadyPending: 'You already have a request for this site under review.',
  invalidDate: 'The visit date must be within the current promo period and not in the future.',
  siteNotFound: 'This site is no longer available. Please choose another one.',
};

/**
 * Request a Stamp (form)
 *
 * For a stamp in the user's physical passport (e.g. at a site with no QR
 * station): pick the site and visit date, attach a photo of the stamp, and
 * send it for admin review. Once approved, the stamp is added to the digital
 * passport.
 *
 * `?siteId=` pre-fills and locks the site (from the site screen or "Submit
 * again" on a rejected request).
 */
export default function NewStampRequestScreen() {
  const { siteId } = useLocalSearchParams<{ siteId?: string }>();

  const sitesQuery = useSites();
  const stampsQuery = useStamps();
  const requestsQuery = useStampRequests();
  const promoQuery = usePromoPeriod();
  const submit = useSubmitStampRequest();

  const [pickedSite, setPickedSite] = useState<Site | null>(null);
  const [pickedDate, setPickedDate] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const [siteError, setSiteError] = useState('');
  const [dateError, setDateError] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [formError, setFormError] = useState('');

  const sites = sitesQuery.data ?? [];
  const lockedSite = siteId ? (sites.find((site) => site.id === siteId) ?? null) : null;
  const site = lockedSite ?? pickedSite;

  const dateOptions = promoQuery.data ? getVisitDateOptions(promoQuery.data) : [];
  // Defaults to the newest selectable day (today, while the promo is running)
  const visitedOn = pickedDate ?? dateOptions[0]?.key ?? null;

  const isLoading =
    sitesQuery.isLoading || stampsQuery.isLoading || requestsQuery.isLoading || promoQuery.isLoading;
  const hasError = sitesQuery.isError || stampsQuery.isError || requestsQuery.isError || promoQuery.isError;

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/passport');
  };

  const handleSubmit = async () => {
    const nextSiteError = site ? '' : 'Choose the site that stamped your passport.';
    const nextDateError = visitedOn ? '' : 'Choose the date of your visit.';
    const nextPhotoError = photoUri ? '' : 'Add a photo of the stamp in your physical passport.';
    setSiteError(nextSiteError);
    setDateError(nextDateError);
    setPhotoError(nextPhotoError);
    setFormError('');

    if (!site || !visitedOn || !photoUri) {
      hapticError();
      return;
    }

    try {
      const result = await submit.mutateAsync({
        siteId: site.id,
        visitedOn,
        photoUri,
        note: note.trim() || undefined,
      });

      if (!result.success) {
        setFormError(FAILURE_MESSAGES[result.reason]);
        hapticError();
        return;
      }

      hapticSuccess();
      // Back to the history screen if the form was opened from it, otherwise
      // replace the form with it (so it isn't stacked twice)
      router.dismissTo({ pathname: '/stamp-requests', params: { submitted: '1' } });
    } catch {
      setFormError('Could not send your request. Check your connection and try again.');
      hapticError();
    }
  };

  if (isLoading || hasError) {
    return (
      <ScreenContainer
        showHeader
        headerTitle="Request a stamp"
        onBackPress={handleBack}
        edges={['top', 'left', 'right', 'bottom']}
        testID="new-stamp-request-screen"
      >
        {isLoading ? (
          <StateView variant="loading" style={styles.state} />
        ) : (
          <StateView
            variant="error"
            title="Unable to load the form"
            message="Please check your connection and try again."
            actionLabel="Retry"
            onAction={() => {
              sitesQuery.refetch();
              stampsQuery.refetch();
              requestsQuery.refetch();
              promoQuery.refetch();
            }}
            style={styles.state}
          />
        )}
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      showHeader
      headerTitle="Request a stamp"
      onBackPress={handleBack}
      scrollable
      keyboardAware
      edges={['top', 'left', 'right', 'bottom']}
      contentContainerStyle={styles.content}
      testID="new-stamp-request-screen"
      keyboardFooter={
        <Button
          title="Send for review"
          onPress={handleSubmit}
          variant="accent"
          fullWidth
          loading={submit.isPending}
          icon={<Ionicons name="paper-plane" size={18} color={colors.background} />}
          testID="stamp-request-submit"
        />
      }
    >
      <InfoBanner
        icon="book-outline"
        tint={colors.primaryTint}
        color={colors.primary}
        title="Stamped your physical passport?"
        body="Send us a photo of the stamp. Once our team approves it, the stamp and its points are added to your digital passport."
      />

      <View style={styles.form}>
        <SitePicker
          sites={sites}
          stamps={stampsQuery.data ?? []}
          requests={requestsQuery.data ?? []}
          value={site}
          onChange={(nextSite) => {
            setPickedSite(nextSite);
            setSiteError('');
            setFormError('');
          }}
          locked={!!lockedSite}
          error={siteError}
        />

        <VisitDatePicker
          options={dateOptions}
          value={visitedOn}
          onChange={(key) => {
            setPickedDate(key);
            setDateError('');
            setFormError('');
          }}
          error={dateError}
        />

        <StampPhotoField
          value={photoUri}
          onChange={(uri) => {
            setPhotoUri(uri);
            setPhotoError('');
          }}
          error={photoError}
        />

        <TextInput
          label="Note (optional)"
          value={note}
          onChangeText={setNote}
          placeholder="Anything our team should know about this stamp?"
          multiline
          numberOfLines={3}
          maxLength={NOTE_MAX_LENGTH}
          testID="stamp-request-note"
        />

        {formError ? <FormBanner message={formError} /> : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.base,
  },
  form: {
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  state: {
    flex: 1,
    paddingVertical: spacing.huge,
  },
});
