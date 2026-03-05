/**
 * Admin Users Service (mock)
 */
import { appendLog } from "./adminAuditService";

export const updateUserStatus = (userId: number, name: string, newStatus: string) => {
  // TODO BACKEND: PATCH /api/admin/users/:id/status
  appendLog("user_status_change", "user", String(userId), `Statut de ${name} changé en "${newStatus}"`);
  return { success: true };
};

export const approveUser = (userId: number, name: string) => {
  appendLog("user_approved", "user", String(userId), `Inscription de ${name} approuvée`);
  return { success: true };
};

export const rejectUser = (userId: number, name: string) => {
  appendLog("user_rejected", "user", String(userId), `Inscription de ${name} refusée`);
  return { success: true };
};
