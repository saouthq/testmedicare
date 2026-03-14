/**
 * healthStore.ts — Patient health data (documents, treatments, allergies, etc.).
 * Cross-role: Doctor adds prescriptions/documents → Patient sees them.
 *
 * Dual-mode: localStorage in Demo, Supabase (patients + health_records) in Production.
 */
import { createStore } from "./crossRoleStore";
import { useDualQuery } from "@/hooks/useDualData";
import { getAppMode, readAuthUser } from "./authStore";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuthReady } from "@/hooks/useSupabaseQuery";
import { useSyncExternalStore, useMemo } from "react";
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

/**
 * Map health_records rows into HealthState categories.
 */
function mapHealthRecordsToState(records: any[], patientRow: any): HealthState {
  const state: HealthState = { ...EMPTY, documents: [], antecedents: [], treatments: [], allergies: [], habits: [], familyHistory: [], surgeries: [], vaccinations: [], measures: [] };

  // Pull allergies and antecedents from patient row (stored as JSONB)
  if (patientRow) {
    if (Array.isArray(patientRow.allergies)) {
      state.allergies = patientRow.allergies.map((a: any) => ({
        name: a.name || a,
        severity: a.severity || "Modéré",
        reaction: a.reaction || "",
      }));
    }
    if (Array.isArray(patientRow.antecedents)) {
      state.antecedents = patientRow.antecedents.map((a: any) => ({
        name: a.name || a,
        date: a.date || "",
        details: a.details || "",
      }));
    }
  }

  // Categorize health_records by record_type
  for (const r of records) {
    const data = typeof r.data === "object" ? r.data : {};
    switch (r.record_type) {
      case "document":
        state.documents.push({ name: r.title || "Document", type: data.type || "Document", date: r.date || "", source: data.source || "", size: data.size || "" });
        break;
      case "treatment":
        state.treatments.push({ name: r.title || "", dose: data.dose || "", since: data.since || "", ...data });
        break;
      case "vaccination":
        state.vaccinations.push({ name: r.title || "", doses: data.doses || 1, lastDate: r.date || data.lastDate || "", nextDate: data.nextDate || "", ...data });
        break;
      case "measure":
        state.measures.push({ label: r.title || "", value: data.value || "", date: r.date || "", unit: data.unit || "" });
        break;
      case "surgery":
        state.surgeries.push({ name: r.title || "", date: r.date || "", hospital: data.hospital || "", ...data });
        break;
      case "habit":
        state.habits.push({ label: r.title || "", value: data.value || "", ...data });
        break;
      case "family_history":
        state.familyHistory.push({ name: r.title || "", details: data.details || "", relation: data.relation || "", ...data });
        break;
      default:
        // Unknown type → treat as document
        state.documents.push({ name: r.title || "Document", type: r.record_type, date: r.date || "", source: "", size: "" });
    }
  }

  return state;
}

/**
 * useHealth — Dual-mode hook.
 * Demo: returns localStorage data.
 * Production: fetches from health_records + patients tables.
 */
export function useHealth(): [HealthState, (v: HealthState | ((p: HealthState) => HealthState)) => void] {
  const mode = getAppMode();
  const isProduction = mode === "production";
  const { isReady } = useAuthReady();

  // Always subscribe to local store
  const localData = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  // Fetch health_records from Supabase
  const healthQuery = useQuery<any[]>({
    queryKey: ["health_records"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return [];
      const { data, error } = await (supabase.from as any)("health_records")
        .select("*")
        .eq("patient_user_id", session.user.id)
        .order("created_at", { ascending: false });
      if (error) { console.error("[healthStore] health_records:", error); return []; }
      return data || [];
    },
    enabled: isProduction && isReady,
  });

  // Fetch patient row for allergies/antecedents
  const patientQuery = useQuery<any>({
    queryKey: ["patient_health_data"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;
      const { data, error } = await (supabase.from as any)("patients")
        .select("allergies, antecedents")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (error) { console.error("[healthStore] patient:", error); return null; }
      return data;
    },
    enabled: isProduction && isReady,
  });

  // Combine into HealthState for production
  const prodData = useMemo(() => {
    if (!isProduction) return localData;
    return mapHealthRecordsToState(healthQuery.data || [], patientQuery.data);
  }, [isProduction, healthQuery.data, patientQuery.data, localData]);

  if (isProduction) {
    return [prodData, store.set];
  }

  return [localData, store.set];
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
  syncHealthRecordToSupabase("measure", m.label || "Mesure", m, m.date);
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
  syncHealthRecordToSupabase("family_history", f.name || f.details, f);
}
