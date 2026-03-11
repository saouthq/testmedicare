/**
 * doctorPrescriptionsStore.ts — Doctor-side prescription management.
 * Cross-role: Doctor creates → Patient sees → Pharmacy receives.
 *
 * // TODO BACKEND: Replace with API
 */
import { createStore, useStore } from "./crossRoleStore";
import { pushNotification } from "./notificationsStore";
import type { Prescription } from "@/types";

const store = createStore<Prescription[]>("medicare_doctor_prescriptions", []);

export const doctorPrescriptionsStore = store;

export function useDoctorPrescriptions() {
  return useStore(store);
}

export function initDoctorPrescriptionsIfEmpty(items: Prescription[]) {
  if (store.read().length === 0) store.set(items);
}

/** Create a new prescription (from consultation) */
export function createPrescription(rx: Omit<Prescription, "id">) {
  const id = `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
  const full: Prescription = { ...rx, id };
  store.set(prev => [full, ...prev]);

  // Notify patient
  pushNotification({
    type: "prescription",
    title: "Nouvelle ordonnance",
    message: `${rx.doctor} vous a prescrit une ordonnance (${rx.items.length} médicament${rx.items.length > 1 ? "s" : ""}).`,
    targetRole: "patient",
    actionLink: "/dashboard/patient/prescriptions",
  });

  return id;
}

/** Mark prescription as sent */
export function markPrescriptionSent(id: string) {
  store.set(prev => prev.map(rx => rx.id === id ? { ...rx, sent: true } : rx));
}

/** Duplicate a prescription */
export function duplicatePrescription(id: string) {
  const original = store.read().find(rx => rx.id === id);
  if (!original) return null;
  const newId = `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
  const dup: Prescription = {
    ...original,
    id: newId,
    date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
    sent: false,
  };
  store.set(prev => [dup, ...prev]);
  return newId;
}
