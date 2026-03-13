import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/stores/authStore";
import LoadingPage from "./LoadingPage";

/**
 * Auth guard for dashboard routes.
 * Reads user from authStore (supports both Supabase and demo sessions).
 */
const AuthGuard = ({ children, allowedRoles }: { children: ReactNode; allowedRoles?: string[] }) => {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingPage />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/dashboard/${user.role}`} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
