/**
 * healthStore.ts — Patient health data (documents, treatments, allergies, etc.).
 * Cross-role: Doctor adds prescriptions/documents → Patient sees them.
 *
 * Dual-mode: localStorage in Demo, Supabase (patients + health_records) in Production.
 */
import { createStore } from "./crossRoleStore";
import { useDemoOnlyStore } from "@/hooks/useDualData";
import { getAppMode, readAuthUser } from "./authStore";
import { supabase } from "@/integrations/supabase/client";
import type { HealthDocument, Antecedent, Treatment, Allergy, Habit, FamilyHistory, Surgery, Vaccination, HealthMeasure } from "@/types";

export interface HealthState {
  documents: HealthDocument[];
  antecedents: Antecedent[];
  treatments: Treatment[];
  allergies: Allergy[];
  habits: Habit[];
  familyHistory: FamilyHistory[];
  surgeries: Surgery[];
  vaccinations: Vaccination[];
  measures: HealthMeasure[];
}

const EMPTY: HealthState = {
  documents: [], antecedents: [], treatments: [], allergies: [],
  habits: [], familyHistory: [], surgeries: [], vaccinations: [], measures: [],
};

const store = createStore<HealthState>("medicare_health", EMPTY);

export const healthStore = store;

export function useHealth() {
  return useDemoOnlyStore(store, EMPTY);
}

export function initHealthStoreIfEmpty(data: HealthState) {
  const current = store.read();
  if (current.documents.length === 0 && current.treatments.length === 0) {
    store.set(data);
  }
}

// ─── Supabase sync helpers ──────────────────────────────────
async function getPatientId(): Promise<number | null> {
  const user = readAuthUser();
  if (!user) return null;
  const { data: patients } = await (supabase.from as any)("patients")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);
  return patients?.[0]?.id ?? null;
}

async function syncAllergiesToSupabase(allergies: Allergy[]) {
  if (getAppMode() !== "production") return;
  try {
    const patientId = await getPatientId();
    if (!patientId) return;
    await (supabase.from as any)("patients")
      .update({ allergies: allergies.map(a => ({ name: a.name, severity: a.severity, reaction: a.reaction })) })
      .eq("id", patientId);
  } catch {}
}

async function syncAntecedentsToSupabase(antecedents: Antecedent[]) {
  if (getAppMode() !== "production") return;
  try {
    const patientId = await getPatientId();
    if (!patientId) return;
    await (supabase.from as any)("patients")
      .update({ antecedents: antecedents.map(a => ({ name: a.name, date: a.date, details: a.details })) })
      .eq("id", patientId);
  } catch {}
}

async function syncHealthRecordToSupabase(recordType: string, title: string, data: any, date?: string) {
  if (getAppMode() !== "production") return;
  try {
    const user = readAuthUser();
    if (!user) return;
    await (supabase.from as any)("health_records").insert({
      patient_user_id: user.id,
      record_type: recordType,
      title,
      data,
      date: date || new Date().toISOString().slice(0, 10),
    });
  } catch (e) {
    console.warn("[syncHealthRecord] failed:", e);
  }
}

// ─── Actions ─────────────────────────────────────────────────

export function addDocument(doc: HealthDocument) {
  store.set(prev => ({ ...prev, documents: [doc, ...prev.documents] }));
  syncHealthRecordToSupabase("document", doc.name || "Document", doc, doc.date);
}

export function addTreatment(t: Treatment) {
  store.set(prev => ({ ...prev, treatments: [...prev.treatments, t] }));
  syncHealthRecordToSupabase("treatment", t.name, t);
}

export function updateTreatment(name: string, update: Partial<Treatment>) {
  store.set(prev => ({
    ...prev,
    treatments: prev.treatments.map(t => t.name === name ? { ...t, ...update } : t),
  }));
}

export function addAllergy(a: Allergy) {
  store.set(prev => {
    const updated = { ...prev, allergies: [...prev.allergies, a] };
    syncAllergiesToSupabase(updated.allergies);
    return updated;
  });
}

export function removeAllergy(name: string) {
  store.set(prev => {
    const updated = { ...prev, allergies: prev.allergies.filter(a => a.name !== name) };
    syncAllergiesToSupabase(updated.allergies);
    return updated;
  });
}

export function addAntecedent(a: Antecedent) {
  store.set(prev => {
    const updated = { ...prev, antecedents: [...prev.antecedents, a] };
    syncAntecedentsToSupabase(updated.antecedents);
    return updated;
  });
}

export function addVaccination(v: Vaccination) {
  store.set(prev => ({ ...prev, vaccinations: [...prev.vaccinations, v] }));
  syncHealthRecordToSupabase("vaccination", v.name, v, v.lastDate);
}

export function addMeasure(m: HealthMeasure) {
  store.set(prev => ({ ...prev, measures: [m, ...prev.measures] }));
  syncHealthRecordToSupabase("measure", m.type || "Mesure", m, m.date);
}

export function addSurgery(s: Surgery) {
  store.set(prev => ({ ...prev, surgeries: [...prev.surgeries, s] }));
  syncHealthRecordToSupabase("surgery", s.name, s, s.date);
}

export function addHabit(h: Habit) {
  store.set(prev => ({ ...prev, habits: [...prev.habits, h] }));
  syncHealthRecordToSupabase("habit", h.label, h);
}

export function updateHabit(label: string, value: string) {
  store.set(prev => ({
    ...prev,
    habits: prev.habits.map(h => h.label === label ? { ...h, value } : h),
  }));
}

export function addFamilyHistory(f: FamilyHistory) {
  store.set(prev => ({ ...prev, familyHistory: [...prev.familyHistory, f] }));
  syncHealthRecordToSupabase("family_history", f.condition || f.member, f);
}
