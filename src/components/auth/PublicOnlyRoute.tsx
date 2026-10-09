import * as React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { ROUTES } from "@/constants/routes";

interface PublicOnlyRouteProps {
  children?: React.ReactNode;
}

/**
 * Route wrapper that prevents authenticated users from re-accessing login / register pages.
 * Authenticated users are redirected to their previous protected route or the homepage.
 */
export const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const location = useLocation();

  if (isAuthenticated && accessToken) {
    const from = (location.state as { from?: Location })?.from?.pathname || ROUTES.HOME;
    return <Navigate to={from} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
