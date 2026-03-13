/**
 * pharmacyStore.ts — Pharmacy stock + prescriptions.
 * Dual-mode: Supabase when production, localStorage for demo.
 */
import { createStore, useStore } from "./crossRoleStore";
import { pushNotification } from "./notificationsStore";
import { useDualQuery } from "@/hooks/useDualData";
import { supabase } from "@/integrations/supabase/client";
import { getAppMode, readAuthUser } from "./authStore";
import type { PharmacyPrescription } from "@/types";

// ─── Stock ───────────────────────────────────────────────────

export interface StockItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  threshold: number;
  status: "ok" | "low" | "critical";
  price: string;
  expiry: string;
  supplier: string;
}

const stockStore = createStore<StockItem[]>("medicare_pharmacy_stock", []);

export function usePharmacyStock() {
  return useDualQuery<StockItem[]>({
    store: stockStore,
    tableName: "pharmacy_stock",
    queryKey: ["pharmacy_stock"],
    mapRowToLocal: (row: any): StockItem => ({
      id: row.id,
      name: row.name || "",
      category: row.category || "",
      quantity: row.quantity ?? 0,
      threshold: row.threshold ?? 10,
      status: row.status || "ok",
      price: row.price || "0 DT",
      expiry: row.expiry || "",
      supplier: row.supplier || "",
    }),
    orderBy: { column: "created_at", ascending: false },
  });
}

export function initStockIfEmpty(items: StockItem[]) {
  if (stockStore.read().length === 0) stockStore.set(items);
}

export async function updateStockQuantity(id: number, quantity: number) {
  stockStore.set(prev => prev.map(item => {
    if (item.id !== id) return item;
    const status = quantity <= 0 ? "critical" : quantity < item.threshold ? "low" : "ok";
    return { ...item, quantity, status };
  }));

  if (getAppMode() === "production") {
    try {
      const item = stockStore.read().find(i => i.id === id);
      const status = item?.status || "ok";
      await (supabase.from as any)("pharmacy_stock")
        .update({ quantity, status })
        .eq("id", id);
    } catch {}
  }
}

export async function addStockItem(item: Omit<StockItem, "id">) {
  const id = Date.now();
  stockStore.set(prev => [...prev, { ...item, id }]);

  if (getAppMode() === "production") {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      await (supabase.from as any)("pharmacy_stock").insert({
        pharmacy_id: session.user.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        threshold: item.threshold,
        status: item.status,
        price: item.price,
        expiry: item.expiry,
        supplier: item.supplier,
      });
    } catch {}
  }
}

export async function removeStockItem(id: number) {
  stockStore.set(prev => prev.filter(i => i.id !== id));

  if (getAppMode() === "production") {
    try {
      await (supabase.from as any)("pharmacy_stock").delete().eq("id", id);
    } catch {}
  }
}

// ─── Pharmacy Prescriptions ──────────────────────────────────

const rxStore = createStore<PharmacyPrescription[]>("medicare_pharmacy_prescriptions", []);

export const pharmacyRxStore = rxStore;

function mapPharmacyRxRow(row: any): PharmacyPrescription {
  return {
    id: row.id,
    patient: row.patient_name || "",
    avatar: row.patient_avatar || "",
    doctor: row.doctor_name || "",
    date: row.date || "",
    items: row.items || [],
    status: row.status || "received",
    total: row.total || "0 DT",
    assurance: row.assurance || "",
    urgent: row.urgent || false,
    patientPhone: row.patient_phone || "",
    pickupTime: row.pickup_time || "",
    comment: row.comment || "",
  };
}

export function usePharmacyPrescriptions() {
  return useDualQuery<PharmacyPrescription[]>({
    store: rxStore,
    tableName: "pharmacy_prescriptions",
    queryKey: ["pharmacy_prescriptions"],
    mapRowToLocal: mapPharmacyRxRow,
    orderBy: { column: "created_at", ascending: false },
  });
}

/** Legacy compat */
export function usePharmacyPrescriptionsSupabase() {
  const [data] = usePharmacyPrescriptions();
  return { data, isLoading: false };
}

export function initPharmacyRxIfEmpty(items: PharmacyPrescription[]) {
  if (rxStore.read().length === 0) rxStore.set(items);
}

/** Update prescription status */
export async function updatePharmacyRxStatus(
  id: string,
  status: PharmacyPrescription["status"],
  extra?: { pickupTime?: string; comment?: string }
) {
  rxStore.set(prev => prev.map(rx =>
    rx.id === id ? { ...rx, status, ...extra } : rx
  ));

  if (getAppMode() === "production") {
    try {
      await (supabase.from as any)("pharmacy_prescriptions")
        .update({ status, pickup_time: extra?.pickupTime, comment: extra?.comment })
        .eq("id", id);
    } catch {}
  }

  const rx = rxStore.read().find(r => r.id === id);
  if (rx && status === "ready_pickup") {
    pushNotification({
      type: "pharmacy_ready",
      title: "Ordonnance prête",
      message: `Votre ordonnance ${id} est prête à retirer${extra?.pickupTime ? ` à ${extra.pickupTime}` : ""}.`,
      targetRole: "patient",
      actionLink: "/dashboard/patient/prescriptions",
    });
  }
}

/** Update individual item availability — syncs to Supabase */
export async function updatePharmacyRxItemAvailability(
  rxId: string,
  itemName: string,
  availability: "available" | "unavailable" | "partial",
  alternative?: string
) {
  rxStore.set(prev => prev.map(rx => {
    if (rx.id !== rxId) return rx;
    return {
      ...rx,
      items: rx.items.map(item =>
        item.name === itemName ? { ...item, availability, alternative } : item
      ),
    };
  }));

  if (getAppMode() === "production") {
    try {
      const rx = rxStore.read().find(r => r.id === rxId);
      if (rx) {
        await (supabase.from as any)("pharmacy_prescriptions")
          .update({ items: rx.items })
          .eq("id", rxId);
      }
    } catch (e) {
      console.warn("[updatePharmacyRxItemAvailability] Supabase update failed:", e);
    }
  }
}

// ─── Categories (static reference) ──────────────────────────

export const PHARMACY_CATEGORIES = ["Tous", "Antibiotiques", "Antalgiques", "Anti-inflammatoires", "Antidiabétiques", "Antihypertenseurs", "Bronchodilatateurs", "Anti-acides", "Bêtabloquants"];
