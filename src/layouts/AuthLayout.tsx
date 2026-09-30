import * as React from "react";
import { Link, Outlet } from "react-router-dom";
import { Lock } from "lucide-react";
import { AuthBackground } from "@/components/auth";
import { ROUTES } from "@/constants/routes";
import nexoraLogoSrc from "@/assets/logo/logo.png";
import type { AuthLayoutProps } from "@/types";

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-x-hidden bg-[#F8FAFC] text-neutral-900">
      {/* Decorative desktop project-management framing elements */}
      <AuthBackground />

      {/* Top Header Bar */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-6 pb-2 select-none md:px-12">
        <Link to={ROUTES.LOGIN} className="flex items-center gap-2">
          <img
            src={nexoraLogoSrc}
            alt="Nexora Logo"
            className="h-6 w-6 rounded-md object-contain"
          />
          <span className="text-base font-bold tracking-tight text-neutral-900">
            Nexora
          </span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-6 sm:px-6 md:py-8">
        {children ?? <Outlet />}

        {/* Security badge right below the card */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-neutral-400 select-none">
          <Lock className="h-3.5 w-3.5 text-neutral-400" />
          <span>256-bit SSL Encrypted</span>
        </div>
      </main>

      {/* Bottom Footer Bar */}
      <footer className="relative z-10 flex items-center justify-center px-6 py-4 text-xs text-neutral-400 select-none md:px-12 border-t border-neutral-200/50 text-center">
        <span>© 2025 Nexora Systems Inc. Intelligent Project Workspace.</span>
      </footer>
    </div>
  );
};
