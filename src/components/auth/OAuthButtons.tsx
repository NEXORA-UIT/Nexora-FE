import * as React from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleIcon, GitHubIcon } from "@/components/common/Icons";
import { authApi } from "@/apis/auth.api";
import { ApiError } from "@/apis/client";
import { getUserFacingApiError } from "@/utils/api-error-message";
import type { OAuthButtonsProps } from "@/types";

export const OAuthButtons: React.FC<OAuthButtonsProps> = ({
  onGoogleClick,
  onGitHubClick,
  separatorText = "Or continue with",
  className,
}) => {
  const [loadingProvider, setLoadingProvider] = React.useState<"google" | "github" | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleGoogle = async () => {
    if (onGoogleClick) {
      onGoogleClick();
      return;
    }
    setErrorMessage(null);
    setLoadingProvider("google");
    try {
      const { authorizationUrl, loginToken } = await authApi.startGoogleOAuth();
      sessionStorage.setItem("nexora_oauth_state_google", loginToken);
      window.location.assign(authorizationUrl);
    } catch (err: unknown) {
      setLoadingProvider(null);
      if (err instanceof ApiError) {
        if (err.status === 503 || err.code === "OAUTH_NOT_CONFIGURED") {
          setErrorMessage(
            "Google OAuth is not configured on the server. Please verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend configuration."
          );
        } else {
          setErrorMessage(getUserFacingApiError(err, "Failed to initiate Google sign-in."));
        }
      } else {
        setErrorMessage("An unexpected error occurred while contacting Google.");
      }
    }
  };

  const handleGitHub = async () => {
    if (onGitHubClick) {
      onGitHubClick();
      return;
    }
    setErrorMessage(null);
    setLoadingProvider("github");
    try {
      const { authorizationUrl, loginToken } = await authApi.startGitHubOAuth();
      sessionStorage.setItem("nexora_oauth_state_github", loginToken);
      window.location.assign(authorizationUrl);
    } catch (err: unknown) {
      setLoadingProvider(null);
      if (err instanceof ApiError) {
        if (err.status === 503 || err.code === "OAUTH_NOT_CONFIGURED") {
          setErrorMessage(
            "GitHub OAuth is not configured on the server. Please verify GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in backend configuration."
          );
        } else {
          setErrorMessage(getUserFacingApiError(err, "Failed to initiate GitHub sign-in."));
        }
      } else {
        setErrorMessage("An unexpected error occurred while contacting GitHub.");
      }
    }
  };

  return (
    <div className={className}>
      {/* OAuth Error Alert */}
      {errorMessage && (
        <div className="mb-3 flex items-start gap-2 rounded-xl bg-error-50 p-3 text-xs font-medium text-error-800 border border-error-200/80 animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-error-600 mt-0.5" />
          <span className="leading-snug">{errorMessage}</span>
        </div>
      )}

      {/* OAuth Separator */}
      <div className="relative my-4 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200" />
        </div>
        <span className="relative bg-white px-3 text-xs text-neutral-400 select-none">
          {separatorText}
        </span>
      </div>

      {/* OAuth Buttons */}
      <div className="space-y-2.5">
        <Button
          type="button"
          variant="outline"
          fullWidth
          size="md"
          disabled={loadingProvider !== null}
          className="h-10 rounded-lg border-neutral-200 bg-white text-sm font-medium text-neutral-800 hover:bg-neutral-50 shadow-xs"
          onClick={handleGoogle}
        >
          {loadingProvider === "google" ? (
            <Loader2 className="mr-2.5 h-4 w-4 animate-spin text-neutral-600" />
          ) : (
            <GoogleIcon className="mr-2.5 h-4 w-4 shrink-0" />
          )}
          {loadingProvider === "google" ? "Connecting to Google..." : "Continue with Google"}
        </Button>
        <Button
          type="button"
          variant="outline"
          fullWidth
          size="md"
          disabled={loadingProvider !== null}
          className="h-10 rounded-lg border-neutral-200 bg-white text-sm font-medium text-neutral-800 hover:bg-neutral-50 shadow-xs"
          onClick={handleGitHub}
        >
          {loadingProvider === "github" ? (
            <Loader2 className="mr-2.5 h-4 w-4 animate-spin text-neutral-600" />
          ) : (
            <GitHubIcon className="mr-2.5 h-4 w-4 shrink-0 text-neutral-900" />
          )}
          {loadingProvider === "github" ? "Connecting to GitHub..." : "Continue with GitHub"}
        </Button>
      </div>
    </div>
  );
};
