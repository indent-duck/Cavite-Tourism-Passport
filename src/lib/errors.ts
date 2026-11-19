export const NETWORK_ERROR_MESSAGE = "Check your connection and try again.";

/**
 * User-facing message for a failed request.
 * Development builds show the raw error to aid debugging; release builds
 * show a friendly, generic message.
 */
export function getErrorMessage(error: Error): string {
  return __DEV__ ? error.message : NETWORK_ERROR_MESSAGE;
}
