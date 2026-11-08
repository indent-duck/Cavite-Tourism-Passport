import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendContactCode as apiSendContactCode, verifyContactCode as apiVerifyContactCode } from '@/data/api';
import { useState } from 'react';

/**
 * Hook for contact number verification flow
 * 
 * Provides sendCode and verifyCode functions with loading and error state management.
 * After successful verification, invalidates the currentUser query to refetch updated data.
 * 
 * Requirements: Hook for contact verification flow
 */
export function useContactVerification() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Send SMS verification code mutation
  const sendCodeMutation = useMutation({
    mutationFn: apiSendContactCode,
    onSuccess: () => {
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to send verification code. Please try again.');
    },
  });

  // Verify SMS code mutation
  const verifyCodeMutation = useMutation({
    mutationFn: ({ contactNumber, code }: { contactNumber: string; code: string }) =>
      apiVerifyContactCode(contactNumber, code),
    onSuccess: (success) => {
      if (success) {
        setError(null);
        // Invalidate currentUser query to refetch updated user data with contact number
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      } else {
        setError('Invalid verification code. Please try again.');
      }
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to verify code. Please try again.');
    },
  });

  const sendCode = async (contactNumber: string): Promise<boolean> => {
    setError(null);
    const result = await sendCodeMutation.mutateAsync(contactNumber);
    return result;
  };

  const verifyCode = async (contactNumber: string, code: string): Promise<boolean> => {
    setError(null);
    const result = await verifyCodeMutation.mutateAsync({ contactNumber, code });
    return result;
  };

  return {
    sendCode,
    verifyCode,
    isLoading: sendCodeMutation.isPending || verifyCodeMutation.isPending,
    error,
  };
}
