import * as React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import nexoraLogoSrc from "@/assets/logo/logo.png";

export const LandingFooter: React.FC = () => (
  <footer className="border-t border-neutral-200 bg-white py-12 sm:py-16">
    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-5 lg:px-8">
      <div className="col-span-2 space-y-3">
        <Link to={ROUTES.LANDING} className="flex items-center gap-2">
          <img src={nexoraLogoSrc} alt="Nexora" className="h-6 w-6 rounded-md object-contain" />
          <span className="text-base font-bold tracking-tight text-neutral-900">Nexora</span>
        </Link>
        <p className="max-w-sm text-xs leading-relaxed text-neutral-500">
          A shared workspace for planning boards, coordinating tasks, and keeping project work clear.
        </p>
        <p className="pt-2 text-[11px] text-neutral-400">© 2026 Nexora Systems Inc.</p>
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Product</h2>
        <ul className="space-y-2 text-xs text-neutral-500">
          <li><a href="#features" className="hover:text-neutral-900">Visual Boards</a></li>
          <li><Link to={ROUTES.KNOWLEDGE_BASE} className="hover:text-neutral-900">Knowledge Base</Link></li>
          <li><Link to={ROUTES.AI_ASSISTANT} className="hover:text-neutral-900">AI Assistant · not implemented</Link></li>
        </ul>
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Guides</h2>
        <ul className="space-y-2 text-xs text-neutral-500">
          <li><Link to={ROUTES.HELP} className="hover:text-neutral-900">Help &amp; Guides</Link></li>
          <li><a href="#capabilities" className="hover:text-neutral-900">Team workflows</a></li>
          <li><Link to={ROUTES.LOGIN} className="hover:text-neutral-900">Sign in</Link></li>
        </ul>
      </div>
    </div>
  </footer>
);
