import * as Crypto from 'expo-crypto';
import {
  GoogleOneTapSignIn,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from 'react-native-nitro-google-signin';

/**
 * Google's "Web application" OAuth client ID (Google Cloud Console). The
 * Android client ID must never go here: Google only issues ID tokens for
 * the Web client, and Supabase checks the token was made for it.
 */
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

/** What the Google account picker hands back, ready for Supabase */
export interface GoogleCredential {
  /** Google ID token (a JWT) for supabase.auth.signInWithIdToken */
  idToken: string;
  /** The raw nonce; Google got its SHA-256 hash, Supabase gets this */
  nonce: string;
  email: string | null;
  givenName: string | null;
  familyName: string | null;
}

/**
 * Show Google's account picker (Android Credential Manager) and return the
 * chosen account's ID token, or null if the user closed the picker.
 *
 * Every call uses a fresh nonce: its SHA-256 hash goes into the ID token,
 * and Supabase hashes the raw value to check the token was made for this
 * sign-in and isn't a replayed one.
 */
export async function pickGoogleAccount(): Promise<GoogleCredential | null> {
  if (!WEB_CLIENT_ID) {
    throw new Error(
      "Google sign-in isn't set up in this build (EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is missing).",
    );
  }

  const nonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, nonce);
  GoogleOneTapSignIn.configure({ webClientId: WEB_CLIENT_ID, nonce: hashedNonce });

  try {
    await GoogleOneTapSignIn.checkPlayServices();
    // The "Sign in with Google" dialog listing every Google account on the
    // phone, which is what a tapped "Continue with Google" button should show
    const response = await GoogleOneTapSignIn.presentExplicitSignIn();
    if (!isSuccessResponse(response)) {
      return null; // closed by the user
    }
    const { idToken, user } = response.data;
    return {
      idToken,
      nonce,
      email: user.email,
      givenName: user.givenName,
      familyName: user.familyName,
    };
  } catch (error) {
    if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) {
      return null;
    }
    throw googleError(error);
  }
}

/**
 * Forget the Google account choice on this phone, so the next sign-in asks
 * which account to use. Failing to clear it doesn't matter, so errors are ignored.
 */
export async function forgetGoogleAccount(): Promise<void> {
  try {
    await GoogleOneTapSignIn.signOut();
  } catch {
    // Nothing was saved, or Play Services is unavailable
  }
}

/** A message for a failed Google sign-in */
function googleError(error: unknown): Error {
  if (isErrorWithCode(error)) {
    switch (error.code) {
      case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
        return new Error('Google sign-in needs Google Play services. Please update them and try again.');
      case statusCodes.DEVELOPER_ERROR:
        return new Error(
          "Google sign-in isn't set up correctly for this build. Please log in with your email instead.",
        );
    }
  }
  return error instanceof Error ? error : new Error('Google sign-in failed. Please try again.');
}
