import {
  MIN_PASSWORD_LENGTH,
  PASSWORD_REQUIRES_NUMBER,
  PASSWORD_REQUIRES_SPECIAL,
  PASSWORD_REQUIRES_UPPERCASE,
} from '@/lib/constants';

/** Whether a new password meets every rule shown by <PasswordCriteria> */
export function isValidPassword(password: string): boolean {
  if (password.length < MIN_PASSWORD_LENGTH) return false;
  if (PASSWORD_REQUIRES_NUMBER && !/\d/.test(password)) return false;
  if (PASSWORD_REQUIRES_UPPERCASE && !/[A-Z]/.test(password)) return false;
  if (PASSWORD_REQUIRES_SPECIAL && !/[!@#$%^&*]/.test(password)) return false;
  return true;
}
