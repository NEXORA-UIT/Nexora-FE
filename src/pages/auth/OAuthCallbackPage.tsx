import * as React from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { Loader2, AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authApi } from "@/apis/auth.api";
import { ApiError } from "@/apis/client";
import { getUserFacingApiError } from "@/utils/api-error-message";
import { useAuthStore } from "@/stores/auth.store";
import { ROUTES } from "@/constants/routes";

export const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { provider } = useParams<{ provider: string }>();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const hasExecutedRef = React.useRef(false);

  const normalizedProvider = (provider || "").toLowerCase();
  const isGoogle = normalizedProvider === "google";
  const isGitHub = normalizedProvider === "github";
  const providerLabel = isGoogle ? "Google" : isGitHub ? "GitHub" : "OAuth";

  React.useEffect(() => {
    // In React 18+ StrictMode, effects run twice in development mode.
    // Guard against duplicate execution so the one-time OAuth code and state are not consumed or aborted prematurely.
    if (hasExecutedRef.current) return;
    hasExecutedRef.current = true;

    const processOAuthCallback = async () => {
      // 1. Validate supported provider
      if (!isGoogle && !isGitHub) {
        setIsLoading(false);
        setErrorMessage(`Unsupported authentication provider: "${provider}"`);
        return;
      }

      // 2. Check for provider-level errors or user cancellation
      const errorParam = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (errorParam) {
        setIsLoading(false);
        if (errorParam === "access_denied") {
          setErrorMessage(
            `Sign in with ${providerLabel} was cancelled. You can try again or use your email and password.`
          );
        } else {
          setErrorMessage(
            errorDescription ||
              `Authentication was rejected by ${providerLabel} (${errorParam}).`
          );
        }
        return;
      }

      // 3. Extract authorization code and state
      const code = searchParams.get("code");
      const state = searchParams.get("state");

      if (!code || !state) {
        setIsLoading(false);
        setErrorMessage(
          `Missing authorization code or security state parameter from ${providerLabel}.`
        );
        return;
      }

      // 4. Validate anti-CSRF state token from sessionStorage
      const stateStorageKey = `nexora_oauth_state_${normalizedProvider}`;
      const savedState = sessionStorage.getItem(stateStorageKey);

      if (!savedState) {
        setIsLoading(false);
        setErrorMessage(
          "Authentication state expired or could not be found. Please start sign-in again from the login page."
        );
        return;
      }

      if (savedState !== state) {
        sessionStorage.removeItem(stateStorageKey);
        setIsLoading(false);
        setErrorMessage(
          "Invalid OAuth state token. This may indicate an expired session or an unauthorized cross-site request."
        );
        return;
      }

      // 5. Exchange code and state with backend
      try {
        const tokens = isGoogle
          ? await authApi.handleGoogleOAuthCallback({ code, state })
          : await authApi.handleGitHubOAuthCallback({ code, state });

        // State is valid and successfully consumed; clear from sessionStorage
        sessionStorage.removeItem(stateStorageKey);

        // 6. Synchronize session with auth store
        setAuth(tokens);

        // 7. Redirect to authenticated landing
        navigate(ROUTES.HOME, { replace: true });
      } catch (err: unknown) {
        sessionStorage.removeItem(stateStorageKey);
        setIsLoading(false);

        if (err instanceof ApiError) {
          switch (err.code) {
            case "VERIFIED_EMAIL_REQUIRED":
              setErrorMessage(
                `Your ${providerLabel} account does not have a verified public email address. Please verify your email on ${providerLabel} or sign up with email.`
              );
              break;
            case "ACCOUNT_LINK_REQUIRED":
              setErrorMessage(
                `The email from your ${providerLabel} account already belongs to an existing Nexora user. Direct linking is not automatic for unlinked accounts.`
              );
              break;
            case "OAUTH_EMAIL_NOT_VERIFIED":
              setErrorMessage(
                `The email returned by ${providerLabel} is not marked as verified. Please verify your email address on ${providerLabel}.`
              );
              break;
            case "ACCOUNT_LOCKED":
              setErrorMessage(
                "Your Nexora account has been locked. Please contact your workspace administrator."
              );
              break;
            case "INVALID_OAUTH_STATE":
              setErrorMessage(
                "The OAuth login session was invalid or has expired in the backend. Please try logging in again."
              );
              break;
            default:
              setErrorMessage(
                getUserFacingApiError(
                  err,
                  `Failed to complete authentication with ${providerLabel}.`
                )
              );
              break;
          }
        } else {
          setErrorMessage(
            `An unexpected error occurred while verifying ${providerLabel} authentication.`
          );
        }
      }
    };

    void processOAuthCallback();
  }, [provider, normalizedProvider, isGoogle, isGitHub, providerLabel, searchParams, navigate, setAuth]);

  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200/80 bg-white p-8 text-center shadow-lg animate-in fade-in duration-200">
        {isLoading ? (
          <div className="space-y-5">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
              <Loader2 className="h-7 w-7 animate-spin" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-semibold text-neutral-900">
                Signing in with {providerLabel}
              </h2>
              <p className="text-xs text-neutral-500">
                Verifying authorization credentials and establishing your session...
              </p>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="space-y-5">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
              <AlertCircle className="h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-semibold text-neutral-900">
                Authentication Failed
              </h2>
              <p className="text-xs text-neutral-600 leading-relaxed max-w-sm mx-auto">
                {errorMessage}
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to={ROUTES.LOGIN} className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-9 gap-1.5 rounded-lg border-neutral-200 text-xs text-neutral-700"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to login</span>
                </Button>
              </Link>
              <Link to={ROUTES.LOGIN} className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full h-9 gap-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs shadow-xs"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Try again</span>
                </Button>
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
