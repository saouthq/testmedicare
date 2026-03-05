/**
 * Admin Verification Service (mock)
 */
import { appendLog } from "./adminAuditService";

export const approveVerification = (id: string, entityName: string) => {
  // TODO BACKEND: PATCH /api/admin/verifications/:id/approve
  appendLog("verification_approved", "verification", id, `${entityName} approuvé(e)`);
  return { success: true };
};

export const rejectVerification = (id: string, entityName: string, reason: string) => {
  // TODO BACKEND: PATCH /api/admin/verifications/:id/reject
  appendLog("verification_rejected", "verification", id, `${entityName} refusé(e) — ${reason}`);
  return { success: true };
};
