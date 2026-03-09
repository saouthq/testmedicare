/**
 * Admin Promotions Service — mock with localStorage persistence
 * TODO BACKEND: Replace with real API calls
 */
import type { Promotion, DoctorSubscription } from "@/types/promotion";
import { mockAdminPromotions, mockDoctorSubscriptions } from "@/data/mocks/promotions";
import { appendLog } from "./adminAuditService";

const PROMO_KEY = "medicare_admin_promotions";
const SUB_KEY = "medicare_doctor_subscriptions";

// ─── Persistence helpers ──────────────────────────────────────

const getStored = <T>(key: string, fallback: T[]): T[] => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
};

const save = <T>(key: string, data: T[]) => localStorage.setItem(key, JSON.stringify(data));

// ─── Promotions CRUD ──────────────────────────────────────────

export const getPromotions = (): Promotion[] => getStored(PROMO_KEY, mockAdminPromotions);

export const getPromotionById = (id: string): Promotion | undefined =>
  getPromotions().find(p => p.id === id);

export const createPromotion = (promo: Omit<Promotion, "id" | "usageCount" | "createdAt" | "status">, motif: string): Promotion => {
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
  return entry;
};

export const updatePromotion = (id: string, updates: Partial<Promotion>, motif: string): Promotion | null => {
  const list = getPromotions();
  const idx = list.findIndex(p => p.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates };
  save(PROMO_KEY, list);
  appendLog("update_promotion", "promotion", id, `Modification promo "${list[idx].name}" — ${motif}`);
  return list[idx];
};

export const togglePromotion = (id: string, motif: string): Promotion | null => {
  const list = getPromotions();
  const idx = list.findIndex(p => p.id === id);
  if (idx === -1) return null;
  list[idx].status = list[idx].status === "active" ? "inactive" : "active";
  save(PROMO_KEY, list);
  appendLog("toggle_promotion", "promotion", id, `${list[idx].status === "active" ? "Activation" : "Désactivation"} promo "${list[idx].name}" — ${motif}`);
  return list[idx];
};

export const duplicatePromotion = (id: string): Promotion | null => {
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
  return copy;
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
  // Mock: promo end = start + value months
  const end = new Date(subs[idx].startDate);
  end.setMonth(end.getMonth() + promo.value);
  subs[idx].promoEndDate = end.toISOString().slice(0, 10);
  subs[idx].history.push({ date: new Date().toISOString().slice(0, 10), event: `Promo "${promo.name}" appliquée manuellement` });

  // Increment promo usage
  const pIdx = promos.findIndex(p => p.id === promoId);
  if (pIdx !== -1) { promos[pIdx].usageCount++; save(PROMO_KEY, promos); }

  save(SUB_KEY, subs);
  appendLog("apply_promotion", "subscription", subId, `Promo "${promo.name}" appliquée à ${subs[idx].doctorName} — ${motif}`);
  return subs[idx];
};

/** Get the active promotion for the current doctor (mock: doctorId=1) */
export const getMyActivePromo = (doctorId = 1): { promoName: string; promoEndDate: string } | null => {
  const subs = getDoctorSubscriptions();
  const sub = subs.find(s => s.doctorId === doctorId && s.promoId);
  if (!sub || !sub.promoEndDate) return null;
  return { promoName: sub.promoName!, promoEndDate: sub.promoEndDate };
};
