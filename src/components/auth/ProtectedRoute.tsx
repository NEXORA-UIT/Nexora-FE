import * as React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { ROUTES } from "@/constants/routes";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

/**
 * Route wrapper that ensures the user is authenticated with a valid access token.
 * Unauthenticated users are redirected to the Login page with the return location preserved.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const location = useLocation();

  if (!isAuthenticated || !accessToken) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
