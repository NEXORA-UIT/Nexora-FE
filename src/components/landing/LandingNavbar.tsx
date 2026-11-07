import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import nexoraLogoSrc from "@/assets/logo/logo.png";
import { gsap, useGSAP, isReducedMotion } from "@/lib/motion";

export const LandingNavbar: React.FC = () => {
  const navigate = useNavigate();
  const navRef = React.useRef<HTMLElement | null>(null);
  const progressBarRef = React.useRef<HTMLDivElement | null>(null);
  const [isScrolled, setIsScrolled] = React.useState(false);

  // Monitor scroll position to morph navbar into floating island dock
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const scrolled = window.scrollY > 48;
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Animate the reading progress bar along the bottom edge
  useGSAP(
    () => {
      if (isReducedMotion() || !progressBarRef.current) return;

      const progressTween = gsap.to(progressBarRef.current, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.15,
        },
      });

      return () => {
        progressTween.scrollTrigger?.kill();
        progressTween.kill();
      };
    },
    { scope: navRef }
  );

  return (
    <header
      ref={navRef}
      className={`sticky top-0 z-40 w-full select-none transition-all duration-300 ease-out ${
        isScrolled ? "pt-3 px-3 sm:px-6 pointer-events-none" : "pt-0 px-0 pointer-events-auto"
      }`}
    >
      <div
        className={`mx-auto flex items-center justify-between transition-all duration-300 ease-out relative overflow-hidden pointer-events-auto ${
          isScrolled
            ? "h-14 max-w-5xl rounded-full border border-neutral-200/90 bg-white/90 px-4 sm:px-6 shadow-md backdrop-blur-md"
            : "h-16 max-w-7xl border-b border-neutral-200/80 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md"
        }`}
      >
        {/* Left: Nexora Logo */}
        <Link
          to={ROUTES.LANDING}
          className="group flex items-center gap-2.5 transition-transform duration-150 hover:opacity-95"
        >
          <img
            src={nexoraLogoSrc}
            alt="Nexora Logo"
            className="h-7 w-7 rounded-lg object-contain shadow-2xs transition-transform duration-200 group-hover:scale-105"
          />
          <span className="text-lg font-bold tracking-tight text-neutral-900 group-hover:text-primary-700 transition-colors">
            Nexora
          </span>
        </Link>

        {/* Center: Navigation Anchor Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
          <a
            href="#capabilities"
            className="hover:text-primary-600 transition-colors duration-150"
          >
            Capabilities
          </a>
          <a
            href="#features"
            className="hover:text-primary-600 transition-colors duration-150"
          >
            Features
          </a>
          <a
            href="#knowledge"
            className="hover:text-primary-600 transition-colors duration-150"
          >
            Ecosystem
          </a>
        </nav>

        {/* Right: Auth Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.LOGIN}
            className="px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:text-primary-600 transition-colors"
          >
            Log in
          </Link>

          <Button
            type="button"
            size="sm"
            className={`bg-primary-600 px-4 text-xs font-medium text-white shadow-xs hover:bg-primary-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
              isScrolled ? "h-8.5 rounded-full" : "h-9 rounded-lg"
            }`}
            onClick={() => navigate(ROUTES.REGISTER)}
          >
            Get started
          </Button>
        </div>

        {/* Bottom edge scroll reading progress bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-neutral-100/60 pointer-events-none"
          aria-hidden="true"
        >
          <div
            ref={progressBarRef}
            className="h-full bg-primary-600 origin-left"
            style={{ transform: "scaleX(0)", transformOrigin: "left" }}
          />
        </div>
      </div>
    </header>
  );
};
