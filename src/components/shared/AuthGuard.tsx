import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/stores/authStore";

/**
 * Auth guard for dashboard routes.
 * Reads role from authStore (single source of truth).
 * // TODO BACKEND: Replace with real session/JWT validation via API.
 */
const AuthGuard = ({ children, allowedRoles }: { children: ReactNode; allowedRoles?: string[] }) => {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/dashboard/${user.role}`} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
