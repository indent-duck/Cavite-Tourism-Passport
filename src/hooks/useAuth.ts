import {
    resetPassword as apiResetPassword,
    sendVerificationCode as apiSendVerificationCode,
    signIn as apiSignIn,
    signInWithGoogle as apiSignInWithGoogle,
    signUp as apiSignUp,
} from '@/data/api';
import type { User, VerificationPurpose } from '@/data/types';
import { pickGoogleAccount } from '@/lib/google-sign-in';
import { queryClient } from '@/lib/query-client';
import { useCallback, useState } from 'react';

export interface GoogleSignInResult {
  user: User;
  /** Names from the Google account, to prefill sign-up step 3 */
  givenName: string | null;
  familyName: string | null;
}

/**
 * Hook for authentication operations with loading and error state management
 *
 * Wraps auth API functions with loading and error state.
 * Navigation is handled by screens, not by this hook.
 * Signing in or finishing sign-up starts from an empty query cache, so
 * nothing cached for a previous user on this phone can show up.
 *
 * Requirements: Auth API abstraction with UI state
 */
export function useAuth() {
  // Sign In
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  const signIn = useCallback(async (email: string, password: string): Promise<User> => {
    setSignInLoading(true);
    setSignInError(null);

    try {
      const user = await apiSignIn(email, password);
      queryClient.clear();
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in. Please try again.';
      setSignInError(errorMessage);
      throw error;
    } finally {
      setSignInLoading(false);
    }
  }, []);

  // Sign Up
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);

  const signUp = useCallback(
    async (
      firstName: string,
      lastName: string,
      address: string,
      password: string | null
    ): Promise<User> => {
      setSignUpLoading(true);
      setSignUpError(null);

      try {
        const user = await apiSignUp(firstName, lastName, address, password);
        queryClient.clear();
        return user;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create account. Please try again.';
        setSignUpError(errorMessage);
        throw error;
      } finally {
        setSignUpLoading(false);
      }
    },
    []
  );

  // Continue with Google: the account picker, then Supabase. Resolves null
  // when the user closes the picker. A user whose firstName is empty is new
  // and still needs sign-up step 3.
  const [googleLoading, setGoogleLoading] = useState(false);

  const signInWithGoogle = useCallback(async (): Promise<GoogleSignInResult | null> => {
    setGoogleLoading(true);
    try {
      const credential = await pickGoogleAccount();
      if (!credential) return null;
      const user = await apiSignInWithGoogle(credential.idToken, credential.nonce);
      queryClient.clear();
      return { user, givenName: credential.givenName, familyName: credential.familyName };
    } finally {
      setGoogleLoading(false);
    }
  }, []);

  // Send Verification Code
  const [sendCodeLoading, setSendCodeLoading] = useState(false);
  const [sendCodeError, setSendCodeError] = useState<string | null>(null);

  const sendCode = useCallback(async (email: string, purpose: VerificationPurpose): Promise<void> => {
    setSendCodeLoading(true);
    setSendCodeError(null);

    try {
      await apiSendVerificationCode(email, purpose);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send verification code. Please try again.';
      setSendCodeError(errorMessage);
      throw error;
    } finally {
      setSendCodeLoading(false);
    }
  }, []);

  // Reset Password
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null);

  const resetPassword = useCallback(async (email: string, newPassword: string): Promise<void> => {
    setResetPasswordLoading(true);
    setResetPasswordError(null);

    try {
      await apiResetPassword(email, newPassword);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password. Please try again.';
      setResetPasswordError(errorMessage);
      throw error;
    } finally {
      setResetPasswordLoading(false);
    }
  }, []);

  return {
    signIn: {
      fn: signIn,
      loading: signInLoading,
      error: signInError,
    },
    signUp: {
      fn: signUp,
      loading: signUpLoading,
      error: signUpError,
    },
    google: {
      fn: signInWithGoogle,
      loading: googleLoading,
    },
    sendCode: {
      fn: sendCode,
      loading: sendCodeLoading,
      error: sendCodeError,
    },
    resetPassword: {
      fn: resetPassword,
      loading: resetPasswordLoading,
      error: resetPasswordError,
    },
  };
}
