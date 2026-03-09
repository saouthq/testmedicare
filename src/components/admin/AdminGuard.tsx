import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

/**
 * RBAC Guard for admin routes.
 * TODO BACKEND: Replace localStorage check with real auth/role verification via API.
 * NEVER auto-set admin role. If not admin → redirect to /login.
 */
const AdminGuard = ({ children }: { children: ReactNode }) => {
  const role = localStorage.getItem("userRole");
  if (role !== "admin") {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default AdminGuard;
