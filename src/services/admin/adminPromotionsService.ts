/**
 * Admin Promotions Service — dual-mode: localStorage + Supabase promotions table
 */
import type { Promotion, DoctorSubscription } from "@/types/promotion";
import { mockAdminPromotions, mockDoctorSubscriptions } from "@/data/mocks/promotions";
import { appendLog } from "./adminAuditService";
import { supabase } from "@/integrations/supabase/client";
import { getAppMode } from "@/stores/authStore";

const PROMO_KEY = "medicare_admin_promotions";
const SUB_KEY = "medicare_doctor_subscriptions";

const getStored = <T>(key: string, fallback: T[]): T[] => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
};

const save = <T>(key: string, data: T[]) => localStorage.setItem(key, JSON.stringify(data));

// ─── Supabase sync helpers ────────────────────────────────────

function mapPromoToRow(p: Partial<Promotion>) {
  return {
    name: p.name || "",
    type: p.type || "free_months",
    value: p.value || 0,
    start_date: p.startDate || "",
    end_date: p.endDate || "",
    target: p.target || "all",
    status: p.status || "inactive",
    new_doctors_only: p.newDoctorsOnly ?? true,
    require_signup_during_period: p.requireSignupDuringPeriod ?? true,
    auto_apply: p.autoApply ?? true,
    require_code: p.requireCode ?? false,
    promo_code: p.promoCode || "",
    notes: p.notes || "",
    usage_count: p.usageCount || 0,
  };
}

function mapRowToPromo(row: any): Promotion {
  return {
    id: row.id,
    name: row.name || "",
    type: row.type || "free_months",
    value: row.value || 0,
    startDate: row.start_date || "",
    endDate: row.end_date || "",
    target: row.target || "all",
    status: row.status || "inactive",
    newDoctorsOnly: row.new_doctors_only ?? true,
    requireSignupDuringPeriod: row.require_signup_during_period ?? true,
    autoApply: row.auto_apply ?? true,
    requireCode: row.require_code ?? false,
    promoCode: row.promo_code || "",
    notes: row.notes || "",
    usageCount: row.usage_count || 0,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

// ─── Promotions CRUD ──────────────────────────────────────────

export const getPromotions = (): Promotion[] => getStored(PROMO_KEY, mockAdminPromotions);

export const getPromotionById = (id: string): Promotion | undefined =>
  getPromotions().find(p => p.id === id);

export const createPromotion = async (promo: Omit<Promotion, "id" | "usageCount" | "createdAt" | "status">, motif: string): Promise<Promotion> => {
  const entry: Promotion = {
    ...promo,
    id: `promo-${Date.now()}`,
    status: "inactive",
    usageCount: 0,
    createdAt: new Date().toISOString(),
  };
  const list = getPromotions();
  list.unshift(entry);
  save(PROMO_KEY, list);
  appendLog("create_promotion", "promotion", entry.id, `Création promo "${entry.name}" — ${motif}`);

  if (getAppMode() === "production") {
    try {
      await (supabase.from as any)("promotions").insert({ id: entry.id, ...mapPromoToRow(entry) });
    } catch {}
  }

  return entry;
};

export const updatePromotion = async (id: string, updates: Partial<Promotion>, motif: string): Promise<Promotion | null> => {
  const list = getPromotions();
  const idx = list.findIndex(p => p.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates };
  save(PROMO_KEY, list);
  appendLog("update_promotion", "promotion", id, `Modification promo "${list[idx].name}" — ${motif}`);

  if (getAppMode() === "production") {
    try {
      await (supabase.from as any)("promotions").update(mapPromoToRow(list[idx])).eq("id", id);
    } catch {}
  }

  return list[idx];
};

export const togglePromotion = async (id: string, motif: string): Promise<Promotion | null> => {
  const list = getPromotions();
  const idx = list.findIndex(p => p.id === id);
  if (idx === -1) return null;
  list[idx].status = list[idx].status === "active" ? "inactive" : "active";
  save(PROMO_KEY, list);
  appendLog("toggle_promotion", "promotion", id, `${list[idx].status === "active" ? "Activation" : "Désactivation"} promo "${list[idx].name}" — ${motif}`);

  if (getAppMode() === "production") {
    try {
      await (supabase.from as any)("promotions").update({ status: list[idx].status }).eq("id", id);
    } catch {}
  }

  return list[idx];
};

export const duplicatePromotion = async (id: string): Promise<Promotion | null> => {
  const source = getPromotionById(id);
  if (!source) return null;
  const copy: Promotion = {
    ...source,
    id: `promo-${Date.now()}`,
    name: `${source.name} (copie)`,
    status: "inactive",
    usageCount: 0,
    createdAt: new Date().toISOString(),
  };
  const list = getPromotions();
  list.unshift(copy);
  save(PROMO_KEY, list);
  appendLog("duplicate_promotion", "promotion", copy.id, `Duplication de "${source.name}"`);

  if (getAppMode() === "production") {
    try {
      await (supabase.from as any)("promotions").insert({ id: copy.id, ...mapPromoToRow(copy) });
    } catch {}
  }

  return copy;
};

export const deletePromotion = async (id: string, motif: string) => {
  const list = getPromotions().filter(p => p.id !== id);
  save(PROMO_KEY, list);
  appendLog("delete_promotion", "promotion", id, `Promotion supprimée — ${motif}`);

  if (getAppMode() === "production") {
    try {
      await (supabase.from as any)("promotions").delete().eq("id", id);
    } catch {}
  }
};

/** Load promotions from Supabase into localStorage */
export const loadPromotionsFromSupabase = async () => {
  if (getAppMode() !== "production") return;
  try {
    const { data } = await (supabase.from as any)("promotions").select("*").order("created_at", { ascending: false });
    if (data && data.length > 0) {
      save(PROMO_KEY, data.map(mapRowToPromo));
    }
  } catch {}
};

// ─── Doctor Subscriptions ─────────────────────────────────────

export const getDoctorSubscriptions = (): DoctorSubscription[] => getStored(SUB_KEY, mockDoctorSubscriptions);

export const applyPromotionToDoctor = (subId: string, promoId: string, motif: string): DoctorSubscription | null => {
  const subs = getDoctorSubscriptions();
  const promos = getPromotions();
  const idx = subs.findIndex(s => s.id === subId);
  const promo = promos.find(p => p.id === promoId);
  if (idx === -1 || !promo) return null;

  subs[idx].promoId = promo.id;
  subs[idx].promoName = promo.name;
  const end = new Date(subs[idx].startDate);
  end.setMonth(end.getMonth() + promo.value);
  subs[idx].promoEndDate = end.toISOString().slice(0, 10);
  subs[idx].history.push({ date: new Date().toISOString().slice(0, 10), event: `Promo "${promo.name}" appliquée manuellement` });

  const pIdx = promos.findIndex(p => p.id === promoId);
  if (pIdx !== -1) { promos[pIdx].usageCount++; save(PROMO_KEY, promos); }

  save(SUB_KEY, subs);
  appendLog("apply_promotion", "subscription", subId, `Promo "${promo.name}" appliquée à ${subs[idx].doctorName} — ${motif}`);
  return subs[idx];
};

export const getMyActivePromo = (doctorId = 1): { promoName: string; promoEndDate: string } | null => {
  const subs = getDoctorSubscriptions();
  const sub = subs.find(s => s.doctorId === doctorId && s.promoId);
  if (!sub || !sub.promoEndDate) return null;
  return { promoName: sub.promoName!, promoEndDate: sub.promoEndDate };
};
