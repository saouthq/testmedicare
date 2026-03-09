/**
 * billingStore.ts — Cross-role billing store (secretary ↔ doctor).
 * Secretary creates invoices → doctor sees them. Both can mark as paid.
 *
 * // TODO BACKEND: Replace with API + real-time subscriptions
 */
import { createStore, useStore } from "./crossRoleStore";
import { pushNotification } from "./notificationsStore";

export interface SharedInvoice {
  id: string;
  patient: string;
  avatar: string;
  doctor: string;
  date: string;
  amount: number;
  type: string;
  payment: string;
  status: "paid" | "pending" | "overdue";
  assurance: string;
  createdBy: "secretary" | "doctor" | "system";
}

const store = createStore<SharedInvoice[]>("medicare_billing", []);

export const billingStore = store;

export function useSharedBilling() {
  return useStore(store);
}

export function initBillingStoreIfEmpty(invoices: SharedInvoice[]) {
  const current = store.read();
  if (current.length === 0) {
    store.set(invoices);
  }
}

/** Create a new invoice (from secretary or doctor) */
export function createInvoice(invoice: Omit<SharedInvoice, "id">) {
  const id = `FAC-${Date.now().toString(36).toUpperCase()}`;
  store.set(prev => [{ ...invoice, id }, ...prev]);

  // Notify the other role
  if (invoice.createdBy === "secretary") {
    pushNotification({
      type: "generic",
      title: "Nouvelle facture créée",
      message: `Facture ${id} · ${invoice.patient} · ${invoice.amount} DT`,
      targetRole: "doctor",
      actionLink: "/dashboard/doctor/billing",
    });
  }

  return id;
}

/** Mark invoice as paid */
export function markInvoicePaid(id: string, paymentMethod: string) {
  store.set(prev => prev.map(inv =>
    inv.id === id ? { ...inv, status: "paid", payment: paymentMethod } : inv
  ));
}

/** Get billing stats */
export function getBillingStats(invoices: SharedInvoice[]) {
  const paid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const pending = invoices.filter(i => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const overdue = invoices.filter(i => i.status === "overdue").reduce((s, i) => s + i.amount, 0);
  return { paid, pending, overdue, total: paid + pending + overdue };
}
