/**
 * ErrorFallback Components
 *
 * What shows when a screen crashes while rendering, instead of the app
 * closing. Wired up in `src/app/_layout.tsx`:
 * - ScreenErrorFallback replaces only the screen that crashed. The
 *   navigators stay, so the tab bar and the back button keep working.
 * - AppErrorFallback replaces the whole app, for an error in a layout. It
 *   shows outside the root layout's providers (React Query, gestures,
 *   keyboard), so it uses none of them: only views, theme values and the
 *   safe area, which Expo Router provides above the root layout.
 *
 * Error boundaries catch errors thrown while rendering, not in event
 * handlers or promises; those still show as they do now.
 */

import { colors, spacing } from '@/theme';
import { router, type ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from './Button';
import { StateView } from './StateView';

const TITLE = 'Something went wrong';
const MESSAGE =
  'Try again. If it keeps happening, close the app and open it again.';

interface ErrorFallbackViewProps extends ErrorBoundaryProps {
  onGoBack?: () => void;
}

function ErrorFallbackView({ error, retry, onGoBack }: ErrorFallbackViewProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StateView
        variant="error"
        title={TITLE}
        // The actual error only in development; it means nothing to users
        message={__DEV__ ? error.message : MESSAGE}
        actionLabel="Try again"
        onAction={retry}
        testID="error-fallback"
      />
      {onGoBack && <Button title="Go back" onPress={onGoBack} variant="text" />}
    </SafeAreaView>
  );
}

/** Screen-level boundary: offers Go back when there's a screen to go back to */
export function ScreenErrorFallback(props: ErrorBoundaryProps) {
  const canGoBack = router.canGoBack();
  return (
    <ErrorFallbackView {...props} onGoBack={canGoBack ? () => router.back() : undefined} />
  );
}

/** App-level boundary (root layout's `ErrorBoundary` export) */
export function AppErrorFallback(props: ErrorBoundaryProps) {
  // The root layout hides the splash screen once fonts load; if it crashed
  // before that, the splash would stay up over this screen
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return <ErrorFallbackView {...props} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
    backgroundColor: colors.background,
  },
});
