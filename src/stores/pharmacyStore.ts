/**
 * pharmacyStore.ts — Pharmacy stock + prescriptions (localStorage + Supabase).
 * Cross-role: Doctor prescribes → Patient sends → Pharmacy processes.
 *
 * Dual-mode: Supabase when authenticated, localStorage fallback for demo.
 */
import { createStore, useStore } from "./crossRoleStore";
import { pushNotification } from "./notificationsStore";
import { useSupabaseTable, useSupabaseRealtime, useAuthReady } from "@/hooks/useSupabaseQuery";
import { supabase } from "@/integrations/supabase/client";
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
  return useStore(stockStore);
}

export function initStockIfEmpty(items: StockItem[]) {
  if (stockStore.read().length === 0) stockStore.set(items);
}

export function updateStockQuantity(id: number, quantity: number) {
  stockStore.set(prev => prev.map(item => {
    if (item.id !== id) return item;
    const status = quantity <= 0 ? "critical" : quantity < item.threshold ? "low" : "ok";
    return { ...item, quantity, status };
  }));
}

export function addStockItem(item: Omit<StockItem, "id">) {
  const id = Date.now();
  stockStore.set(prev => [...prev, { ...item, id }]);
}

// ─── Pharmacy Prescriptions ──────────────────────────────────

const rxStore = createStore<PharmacyPrescription[]>("medicare_pharmacy_prescriptions", []);

export const pharmacyRxStore = rxStore;

export function usePharmacyPrescriptions() {
  return useStore(rxStore);
}

/** Supabase-aware hook for pharmacy prescriptions */
export function usePharmacyPrescriptionsSupabase() {
  const { userId, isAuthenticated } = useAuthReady();
  const [localRx] = useStore(rxStore);

  const query = useSupabaseTable<PharmacyPrescription>({
    queryKey: ["pharmacy_prescriptions", userId || ""],
    tableName: "pharmacy_prescriptions",
    filters: userId ? { pharmacy_id: userId } : undefined,
    orderBy: { column: "created_at", ascending: false },
    enabled: isAuthenticated,
    fallbackData: localRx,
  });

  useSupabaseRealtime("pharmacy_prescriptions", [["pharmacy_prescriptions", userId || ""]], userId ? `pharmacy_id=eq.${userId}` : undefined);

  return query;
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

  // Try Supabase
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await (supabase.from as any)("pharmacy_prescriptions")
        .update({ status, pickup_time: extra?.pickupTime, comment: extra?.comment })
        .eq("id", id);
    }
  } catch {}

  // Notify patient
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

/** Update individual item availability */
export function updatePharmacyRxItemAvailability(
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
}

// ─── Categories (static reference) ──────────────────────────

export const PHARMACY_CATEGORIES = ["Tous", "Antibiotiques", "Antalgiques", "Anti-inflammatoires", "Antidiabétiques", "Antihypertenseurs", "Bronchodilatateurs", "Anti-acides", "Bêtabloquants"];
