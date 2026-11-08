import { sendVerificationCode, verifyCode as verifyCodeApi } from '@/data/api';
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

export function useVerification(): UseVerificationReturn {
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
      const result = await verifyCodeApi(email, code);
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
  }, []);

  const resendCode = useCallback(async (email: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await sendVerificationCode(email);
      setCountdown(RESEND_CODE_TIMEOUT); // Reset countdown
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to resend code. Please try again.';
      setError(errorMessage);
      setLoading(false);
    }
  }, []);

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
