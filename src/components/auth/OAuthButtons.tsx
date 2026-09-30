import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GoogleIcon, GitHubIcon } from "@/components/common/Icons";
import { ROUTES } from "@/constants/routes";

import type { OAuthButtonsProps } from "@/types";

export const OAuthButtons: React.FC<OAuthButtonsProps> = ({
  onGoogleClick,
  onGitHubClick,
  separatorText = "Or continue with",
  className,
}) => {
  const navigate = useNavigate();

  const handleGoogle = onGoogleClick ?? (() => navigate(ROUTES.UNDER_DEVELOPMENT));
  const handleGitHub = onGitHubClick ?? (() => navigate(ROUTES.UNDER_DEVELOPMENT));

  return (
    <div className={className}>
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
          className="h-10 rounded-lg border-neutral-200 bg-white text-sm font-medium text-neutral-800 hover:bg-neutral-50 shadow-xs"
          onClick={handleGoogle}
        >
          <GoogleIcon className="mr-2.5 h-4 w-4 shrink-0" />
          Continue with Google
        </Button>
        <Button
          type="button"
          variant="outline"
          fullWidth
          size="md"
          className="h-10 rounded-lg border-neutral-200 bg-white text-sm font-medium text-neutral-800 hover:bg-neutral-50 shadow-xs"
          onClick={handleGitHub}
        >
          <GitHubIcon className="mr-2.5 h-4 w-4 shrink-0 text-neutral-900" />
          Continue with GitHub
        </Button>
      </div>
    </div>
  );
};
