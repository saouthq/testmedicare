import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/stores/authStore";

/**
 * RBAC Guard for admin routes.
 * Reads role from authStore (single source of truth).
 * // TODO BACKEND: Replace with real auth/role verification via API + server-side RBAC.
 */
const AdminGuard = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;
