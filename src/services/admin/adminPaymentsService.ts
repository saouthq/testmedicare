/**
 * Admin Payments Service (mock)
 */
import { appendLog } from "./adminAuditService";

export const refundPayment = (id: string, payerName: string, amount: number) => {
  // TODO BACKEND: POST /api/admin/payments/:id/refund
  appendLog("payment_refunded", "payment", id, `Remboursement de ${amount} DT pour ${payerName}`);
  return { success: true };
};
