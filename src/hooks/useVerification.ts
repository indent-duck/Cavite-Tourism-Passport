import { sendVerificationCode, verifyCode as verifyCodeApi } from '@/data/api';
import type { VerificationPurpose } from '@/data/types';
import { RESEND_CODE_TIMEOUT } from '@/lib/constants';
import { useCallback, useEffect, useState } from 'react';

interface UseVerificationReturn {
  verifyCode: (email: string, code: string) => Promise<boolean>;
  resendCode: (email: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  countdown: number;
  canResend: boolean;
}

/**
 * Code entry state for an emailed 6-digit code: verifying, resending, and the
 * resend countdown
 *
 * @param purpose Which flow the code belongs to (sign-up or password reset)
 */
export function useVerification(purpose: VerificationPurpose): UseVerificationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(RESEND_CODE_TIMEOUT);

  // Countdown timer effect
  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const intervalId = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Clean up interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [countdown]);

  const verifyCode = useCallback(async (email: string, code: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await verifyCodeApi(email, code, purpose);
      setLoading(false);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Verification failed. Please try again.';
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  }, [purpose]);

  const resendCode = useCallback(async (email: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await sendVerificationCode(email, purpose);
      setCountdown(RESEND_CODE_TIMEOUT); // Reset countdown
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to resend code. Please try again.';
      setError(errorMessage);
      setLoading(false);
    }
  }, [purpose]);

  const canResend = countdown === 0;

  return {
    verifyCode,
    resendCode,
    loading,
    error,
    countdown,
    canResend,
  };
}
