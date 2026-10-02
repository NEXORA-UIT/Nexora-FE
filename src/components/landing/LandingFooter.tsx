import * as React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import nexoraLogoSrc from "@/assets/logo/logo.png";

export const LandingFooter: React.FC = () => {
  return (
    <footer className="border-t border-neutral-200 bg-white py-12 sm:py-16 select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand Info */}
          <div className="col-span-2 space-y-3">
            <Link to={ROUTES.LANDING} className="flex items-center gap-2">
              <img
                src={nexoraLogoSrc}
                alt="Nexora Logo"
                className="h-6 w-6 rounded-md object-contain"
              />
              <span className="text-base font-bold tracking-tight text-neutral-900">
                Nexora
              </span>
            </Link>
            <p className="max-w-sm text-xs leading-relaxed text-neutral-500">
              Intelligent project management workspace for modern teams.
              Visual boards, document collaboration, and smart assistance in one platform.
            </p>
            <p className="pt-2 text-[11px] text-neutral-400">
              © 2025 Nexora Systems Inc. All rights reserved.
            </p>
          </div>

          {/* Column 1: Product */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Product
            </span>
            <ul className="space-y-2 text-xs text-neutral-500">
              <li>
                <a href="#features" className="hover:text-neutral-900 transition-colors">
                  Visual Boards
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-neutral-900 transition-colors">
                  AI Assistant
                </a>
              </li>
              <li>
                <a href="#knowledge" className="hover:text-neutral-900 transition-colors">
                  Knowledge Base
                </a>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-neutral-900 transition-colors">
                  Team Activity Stream
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Solutions */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Solutions
            </span>
            <ul className="space-y-2 text-xs text-neutral-500">
              <li>
                <Link to={ROUTES.UNDER_DEVELOPMENT} className="hover:text-neutral-900 transition-colors">
                  Software Teams
                </Link>
              </li>
              <li>
                <Link to={ROUTES.UNDER_DEVELOPMENT} className="hover:text-neutral-900 transition-colors">
                  Product Management
                </Link>
              </li>
              <li>
                <Link to={ROUTES.UNDER_DEVELOPMENT} className="hover:text-neutral-900 transition-colors">
                  System Architecture
                </Link>
              </li>
              <li>
                <Link to={ROUTES.UNDER_DEVELOPMENT} className="hover:text-neutral-900 transition-colors">
                  Sprint Planning
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Support */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Trust & Legal
            </span>
            <ul className="space-y-2 text-xs text-neutral-500">
              <li>
                <Link to={ROUTES.UNDER_DEVELOPMENT} className="hover:text-neutral-900 transition-colors">
                  Security Overview
                </Link>
              </li>
              <li>
                <Link to={ROUTES.UNDER_DEVELOPMENT} className="hover:text-neutral-900 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to={ROUTES.UNDER_DEVELOPMENT} className="hover:text-neutral-900 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to={ROUTES.UNDER_DEVELOPMENT} className="hover:text-neutral-900 transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};
