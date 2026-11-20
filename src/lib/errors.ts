export const NETWORK_ERROR_MESSAGE = "Check your connection and try again.";

/**
 * User-facing message for a failed request.
 * Development builds show the raw error to aid debugging; release builds
 * show a friendly, generic message.
 */
export function getErrorMessage(error: Error): string {
  if (error instanceof FieldError) return error.message;
  return __DEV__ ? error.message : NETWORK_ERROR_MESSAGE;
}

/**
 * A value the server rejected that the user can fix in one form field (e.g.
 * a wrong current password), as opposed to a failed request. Forms show the
 * message under that field; getErrorMessage() always shows it as-is.
 */
export class FieldError<Field extends string = string> extends Error {
  readonly field: Field;

  constructor(field: Field, message: string) {
    super(message);
    this.name = 'FieldError';
    this.field = field;
  }
}
