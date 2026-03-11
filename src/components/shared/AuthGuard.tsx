import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Basic auth guard for dashboard routes.
 * Redirects to /login if no userRole is set in localStorage.
 * TODO BACKEND: Replace localStorage check with real session/JWT validation.
 */
const AuthGuard = ({ children, allowedRoles }: { children: ReactNode; allowedRoles?: string[] }) => {
  const location = useLocation();
  const role = localStorage.getItem("userRole");
  
  if (!role) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={`/dashboard/${role}`} replace />;
  }
  
  return <>{children}</>;
};

export default AuthGuard;
