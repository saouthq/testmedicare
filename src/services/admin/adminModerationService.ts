/**
 * Admin Moderation Service (mock)
 */
import { appendLog } from "./adminAuditService";

export const hideReview = (id: string, doctorName: string) => {
  appendLog("review_hidden", "review", id, `Avis masqué sur ${doctorName}`);
  return { success: true };
};

export const restoreReview = (id: string, doctorName: string) => {
  appendLog("review_restored", "review", id, `Avis restauré sur ${doctorName}`);
  return { success: true };
};

export const closeReport = (id: string, reason: string) => {
  appendLog("report_closed", "report", id, `Signalement clôturé — ${reason}`);
  return { success: true };
};
