import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/stores/authStore";
import LoadingPage from "@/components/shared/LoadingPage";

/**
 * RBAC Guard for admin routes.
 * Reads user from authStore (supports both Supabase and demo sessions).
 */
const AdminGuard = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingPage />;
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;
