/**
 * healthStore.ts — Patient health data (documents, treatments, allergies, etc.).
 * Cross-role: Doctor adds prescriptions/documents → Patient sees them.
 *
 * // TODO BACKEND: Replace with API
 */
import { createStore } from "./crossRoleStore";
import { useDemoOnlyStore } from "@/hooks/useDualData";
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

// ─── Actions ─────────────────────────────────────────────────

export function addDocument(doc: HealthDocument) {
  store.set(prev => ({ ...prev, documents: [doc, ...prev.documents] }));
}

export function addTreatment(t: Treatment) {
  store.set(prev => ({ ...prev, treatments: [...prev.treatments, t] }));
}

export function updateTreatment(name: string, update: Partial<Treatment>) {
  store.set(prev => ({
    ...prev,
    treatments: prev.treatments.map(t => t.name === name ? { ...t, ...update } : t),
  }));
}

export function addAllergy(a: Allergy) {
  store.set(prev => ({ ...prev, allergies: [...prev.allergies, a] }));
}

export function removeAllergy(name: string) {
  store.set(prev => ({ ...prev, allergies: prev.allergies.filter(a => a.name !== name) }));
}

export function addAntecedent(a: Antecedent) {
  store.set(prev => ({ ...prev, antecedents: [...prev.antecedents, a] }));
}

export function addVaccination(v: Vaccination) {
  store.set(prev => ({ ...prev, vaccinations: [...prev.vaccinations, v] }));
}

export function addMeasure(m: HealthMeasure) {
  store.set(prev => ({ ...prev, measures: [m, ...prev.measures] }));
}

export function addSurgery(s: Surgery) {
  store.set(prev => ({ ...prev, surgeries: [...prev.surgeries, s] }));
}

export function addHabit(h: Habit) {
  store.set(prev => ({ ...prev, habits: [...prev.habits, h] }));
}

export function updateHabit(label: string, value: string) {
  store.set(prev => ({
    ...prev,
    habits: prev.habits.map(h => h.label === label ? { ...h, value } : h),
  }));
}

export function addFamilyHistory(f: FamilyHistory) {
  store.set(prev => ({ ...prev, familyHistory: [...prev.familyHistory, f] }));
}
