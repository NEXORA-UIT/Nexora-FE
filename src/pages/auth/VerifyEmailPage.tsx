import * as React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, MailCheck, ArrowRight } from "lucide-react";
import { AuthCard } from "@/components/auth";
import { NexoraLogo } from "@/components/common/NexoraLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi, ApiError } from "@/apis";
import { useAuthStore } from "@/stores";
import { ROUTES } from "@/constants/routes";

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const initialToken = searchParams.get("token") || "";
  const [tokenInput, setTokenInput] = React.useState(initialToken);
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">(
    initialToken ? "loading" : "idle"
  );
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleVerify = React.useCallback(
    async (tokenToVerify: string) => {
      const cleanToken = tokenToVerify.trim();
      if (!cleanToken) {
        setErrorMessage("Please enter a valid verification code.");
        setStatus("error");
        return;
      }

      setStatus("loading");
      setErrorMessage(null);

      try {
        const tokens = await authApi.verifyRegistration({ token: cleanToken });
        setAuth(tokens);
        setStatus("success");
      } catch (err: unknown) {
        setStatus("error");
        if (err instanceof ApiError) {
          if (err.code === "INVALID_REGISTRATION_TOKEN") {
            setErrorMessage(
              "The verification link is invalid or has expired (valid for 15 minutes)."
            );
          } else if (err.code === "EMAIL_TAKEN") {
            setErrorMessage("This account has already been verified.");
          } else {
            setErrorMessage(
              err.message || "Account verification failed. Please try again."
            );
          }
        } else {
          setErrorMessage("Account verification failed. Please try again.");
        }
      }
    },
    [setAuth]
  );

  React.useEffect(() => {
    if (initialToken) {
      void handleVerify(initialToken);
    }
  }, [initialToken, handleVerify]);

  return (
    <AuthCard>
      <NexoraLogo />

      {status === "loading" && (
        <div className="mt-8 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 mb-4 animate-pulse">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            Verifying your account...
          </h1>
          <p className="mt-2 text-sm text-neutral-500 max-w-xs leading-relaxed">
            Please wait while we verify your token and activate your account.
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="mt-6 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            Email verified successfully!
          </h1>
          <p className="mt-2 text-sm text-neutral-600 max-w-xs leading-relaxed">
            Your Nexora account is now active and ready to use.
          </p>
          <div className="mt-6 w-full space-y-3">
            <Button
              type="button"
              className="w-full h-11 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl gap-2 shadow-xs"
              onClick={() => navigate(ROUTES.HOME)}
            >
              <span>Continue to Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full h-10 border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl text-sm"
              onClick={() => navigate(ROUTES.LOGIN)}
            >
              Back to Sign in
            </Button>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="mt-6 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4">
            <XCircle className="h-8 w-8 text-rose-600" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            Verification failed
          </h1>
          <p className="mt-2 text-sm text-neutral-600 max-w-xs leading-relaxed">
            {errorMessage || "The verification link is invalid or has expired."}
          </p>
          <div className="mt-6 w-full space-y-3">
            <Button
              type="button"
              className="w-full h-11 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl shadow-xs"
              onClick={() => navigate(ROUTES.REGISTER)}
            >
              Register again
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full h-10 border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl text-sm"
              onClick={() => navigate(ROUTES.LOGIN)}
            >
              Back to Sign in
            </Button>
          </div>
        </div>
      )}

      {status === "idle" && (
        <div className="mt-6">
          <div className="flex flex-col items-center text-center mb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 mb-3">
              <MailCheck className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              Enter verification code
            </h1>
            <p className="mt-1 text-sm text-neutral-500 max-w-xs leading-relaxed">
              Paste the verification token from your email to activate your account.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleVerify(tokenInput);
            }}
            className="space-y-4"
          >
            <div>
              <Input
                type="text"
                placeholder="Enter verification token..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="h-11 rounded-xl text-sm"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl shadow-xs"
            >
              Verify Account
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                className="text-xs text-neutral-500 hover:text-neutral-800 transition-colors"
                onClick={() => navigate(ROUTES.LOGIN)}
              >
                ← Back to sign in
              </button>
            </div>
          </form>
        </div>
      )}
    </AuthCard>
  );
};
