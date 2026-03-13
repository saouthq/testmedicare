/**
 * billingStore.ts — Cross-role billing store (secretary ↔ doctor).
 * Dual-mode: localStorage in Demo, Supabase in Production.
 */
import { createStore, useStore } from "./crossRoleStore";
import { pushNotification } from "./notificationsStore";
import { useSupabaseTable, useSupabaseRealtime, useAuthReady } from "@/hooks/useSupabaseQuery";
import { supabase } from "@/integrations/supabase/client";
import { useDualQuery } from "@/hooks/useDualData";
import { mapInvoiceRow } from "@/lib/supabaseMappers";

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
  return useDualQuery<SharedInvoice[]>({
    store,
    tableName: "invoices",
    queryKey: ["invoices"],
    mapRowToLocal: mapInvoiceRow,
    orderBy: { column: "created_at", ascending: false },
  });
}

/** Supabase-aware hook */
export function useSharedBillingSupabase() {
  const { userId, isAuthenticated } = useAuthReady();
  const [localInvoices] = useStore(store);

  const query = useSupabaseTable<SharedInvoice>({
    queryKey: ["invoices", userId || ""],
    tableName: "invoices",
    orderBy: { column: "created_at", ascending: false },
    enabled: isAuthenticated,
    fallbackData: localInvoices,
  });

  useSupabaseRealtime("invoices", [["invoices", userId || ""]]);

  return query;
}

export function initBillingStoreIfEmpty(invoices: SharedInvoice[]) {
  const current = store.read();
  if (current.length === 0) {
    store.set(invoices);
  }
}

/** Create a new invoice */
export async function createInvoice(invoice: Omit<SharedInvoice, "id">) {
  const id = `FAC-${Date.now().toString(36).toUpperCase()}`;
  store.set(prev => [{ ...invoice, id }, ...prev]);

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await (supabase.from as any)("invoices").insert({
        id,
        doctor_id: session.user.id,
        patient_name: invoice.patient,
        patient_avatar: invoice.avatar,
        doctor_name: invoice.doctor,
        date: invoice.date,
        amount: invoice.amount,
        type: invoice.type,
        payment: invoice.payment,
        status: invoice.status,
        assurance: invoice.assurance,
        created_by: invoice.createdBy,
      });
    }
  } catch {}

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
export async function markInvoicePaid(id: string, paymentMethod: string) {
  store.set(prev => prev.map(inv =>
    inv.id === id ? { ...inv, status: "paid", payment: paymentMethod } : inv
  ));
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await (supabase.from as any)("invoices").update({ status: "paid", payment: paymentMethod }).eq("id", id);
    }
  } catch {}
}

/** Get billing stats */
export function getBillingStats(invoices: SharedInvoice[]) {
  const paid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const pending = invoices.filter(i => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const overdue = invoices.filter(i => i.status === "overdue").reduce((s, i) => s + i.amount, 0);
  return { paid, pending, overdue, total: paid + pending + overdue };
}
