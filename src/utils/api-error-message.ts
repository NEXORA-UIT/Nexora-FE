type ApiErrorLike = {
  code: string;
  status: number;
};

const ERROR_MESSAGES_BY_CODE: Record<string, string> = {
  INVALID_CREDENTIALS: "The email or password is incorrect.",
  ACCOUNT_LOCKED: "Your account has been locked. Please contact support.",
  RATE_LIMITED: "Too many attempts. Please wait a moment and try again.",
  MAIL_NOT_CONFIGURED: "Email verification is temporarily unavailable. Please try again later.",
  EMAIL_ALREADY_EXISTS: "An account with this email already exists.",
  VERIFIED_EMAIL_REQUIRED: "Verify your email before continuing.",
  ACCOUNT_LINK_REQUIRED: "Sign in to the existing account to link this provider.",
};

const ERROR_MESSAGES_BY_STATUS: Record<number, string> = {
  401: "Your session has expired. Please sign in again.",
  403: "You do not have permission to perform this action.",
  404: "The requested item could not be found.",
  409: "This action conflicts with the current state. Refresh and try again.",
  429: "Too many requests. Please wait a moment and try again.",
};

const isApiErrorLike = (error: unknown): error is ApiErrorLike => {
  if (typeof error !== "object" || error === null) return false;

  const candidate = error as Partial<ApiErrorLike>;
  return typeof candidate.code === "string" && typeof candidate.status === "number";
};

export const getUserFacingApiError = (
  error: unknown,
  fallback: string
): string => {
  if (!isApiErrorLike(error)) return fallback;

  const knownMessage = ERROR_MESSAGES_BY_CODE[error.code];
  if (knownMessage) return knownMessage;

  const statusMessage = ERROR_MESSAGES_BY_STATUS[error.status];
  if (statusMessage) return statusMessage;
  if (error.status >= 500) return "Something went wrong on our end. Please try again.";

  return fallback;
};
