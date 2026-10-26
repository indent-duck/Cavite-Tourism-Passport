import { sendVerificationCode, verifyCode as apiVerifyCode } from '@/data/api';
import { RESEND_CODE_TIMEOUT } from '@/lib/constants';
import { useCallback, useEffect, useState } from 'react';

/**
 * Hook for email verification code management
 * 
 * Provides code verification, resend functionality, and countdown timer.
 * Mock rule: code "123456" succeeds, all others fail.
 * 
 * Validates: Requirements 1.2.10 (Verification Hook)
 */
export function useVerification() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(RESEND_CODE_TIMEOUT);
  const [isCountdownActive, setIsCountdownActive] = useState(true);

  // Countdown timer effect
  useEffect(() => {
    if (!isCountdownActive || countdown === 0) {
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsCountdownActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, isCountdownActive]);

  // Verify the code
  const verifyCode = useCallback(async (email: string, code: string) => {
    setLoading(true);
    setError(null);

    try {
      const isValid = await apiVerifyCode(email, code);
      
      if (!isValid) {
        throw new Error('Invalid verification code');
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Verification failed. Please try again.';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Resend the verification code
  const resendCode = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      await sendVerificationCode(email);
      
      // Reset countdown
      setCountdown(RESEND_CODE_TIMEOUT);
      setIsCountdownActive(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend code. Please try again.';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Start countdown (call this when entering the verification screen)
  const startCountdown = useCallback(() => {
    setCountdown(RESEND_CODE_TIMEOUT);
    setIsCountdownActive(true);
  }, []);

  // Can resend when countdown reaches 0
  const canResend = countdown === 0;

  return {
    verifyCode,
    resendCode,
    startCountdown,
    countdown,
    canResend,
    loading,
    error,
  };
}
