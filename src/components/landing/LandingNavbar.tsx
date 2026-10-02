import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import nexoraLogoSrc from "@/assets/logo/logo.png";

export const LandingNavbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/95 backdrop-blur-md select-none">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Nexora Logo */}
        <Link to={ROUTES.LANDING} className="flex items-center gap-2.5">
          <img
            src={nexoraLogoSrc}
            alt="Nexora Logo"
            className="h-7 w-7 rounded-lg object-contain shadow-2xs"
          />
          <span className="text-lg font-bold tracking-tight text-neutral-900">
            Nexora
          </span>
        </Link>

        {/* Center: Navigation Anchor Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
          <a href="#features" className="hover:text-neutral-900 transition-colors">
            Features
          </a>
          <a href="#capabilities" className="hover:text-neutral-900 transition-colors">
            Capabilities
          </a>
          <a href="#knowledge" className="hover:text-neutral-900 transition-colors">
            Knowledge
          </a>
          <a href="#pricing" className="hover:text-neutral-900 transition-colors">
            Pricing
          </a>
        </nav>

        {/* Right: Auth Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.LOGIN}
            className="px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-900 transition-colors"
          >
            Log in
          </Link>

          <Button
            type="button"
            size="sm"
            className="h-9 rounded-lg bg-primary-600 px-4 text-xs font-medium text-white shadow-xs hover:bg-primary-700"
            onClick={() => navigate(ROUTES.REGISTER)}
          >
            Get started
          </Button>
        </div>
      </div>
    </header>
  );
};
