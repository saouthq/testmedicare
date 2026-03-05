import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

/**
 * RBAC Guard for admin routes (mock).
 * TODO BACKEND: Replace with real auth/role check.
 */
const AdminGuard = ({ children }: { children: ReactNode }) => {
  // Check mock session
  const role = localStorage.getItem("userRole");
  if (role !== "admin") {
    // For demo purposes, auto-set admin role when visiting admin routes
    // In production, this would redirect to /login
    localStorage.setItem("userRole", "admin");
  }
  return <>{children}</>;
};

export default AdminGuard;
