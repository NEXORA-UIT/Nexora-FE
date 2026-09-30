import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NexoraLogo } from "@/components/common/NexoraLogo";
import { ROUTES } from "@/constants/routes";

export const UnderDevelopmentPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-[460px] rounded-2xl border border-neutral-200/80 bg-white p-8 shadow-2xl sm:p-10 text-center">
      {/* Brand Header */}
      <NexoraLogo />

      {/* Screen Heading & Message */}
      <div className="mt-6">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Feature Under Development
        </h1>
        <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
          This feature is currently under active development and will be available in an upcoming release.
        </p>
      </div>

      {/* Navigation Actions */}
      <div className="mt-8 flex items-center justify-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="md"
          className="rounded-lg"
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate(ROUTES.LOGIN);
            }
          }}
        >
          Go back
        </Button>
        <Button
          type="button"
          variant="primary"
          size="md"
          className="rounded-lg"
          onClick={() => navigate(ROUTES.LOGIN)}
        >
          Back to Sign in
        </Button>
      </div>
    </div>
  );
};
