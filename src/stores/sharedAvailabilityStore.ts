/**
 * sharedAvailabilityStore.ts — Centralized doctor availability.
 * Used by: DoctorSettings/AvailabilityTab, DoctorSchedule/AvailModal,
 *          SecretaryAgenda, SecretaryOffice, PublicBooking
 *
 * // TODO BACKEND: Replace with API
 */
import { createStore, useStore } from "./crossRoleStore";
import type { AvailabilityConfig, AvailabilityDay } from "@/types/appointment";

const defaultDays: Record<string, AvailabilityDay> = {
  Lundi:    { active: true,  start: "08:00", end: "18:00", breakStart: "12:00", breakEnd: "14:00" },
  Mardi:    { active: true,  start: "08:00", end: "18:00", breakStart: "12:00", breakEnd: "14:00" },
  Mercredi: { active: true,  start: "08:00", end: "12:00", breakStart: "",      breakEnd: "" },
  Jeudi:    { active: true,  start: "08:00", end: "18:00", breakStart: "12:00", breakEnd: "14:00" },
  Vendredi: { active: true,  start: "08:00", end: "17:00", breakStart: "12:00", breakEnd: "14:00" },
  Samedi:   { active: true,  start: "08:00", end: "13:00", breakStart: "",      breakEnd: "" },
  Dimanche: { active: false, start: "09:00", end: "12:00", breakStart: "",      breakEnd: "" },
};

const initialConfig: AvailabilityConfig = {
  days: defaultDays,
  slotDuration: 30,
  doctor: "Dr. Ahmed Bouazizi",
};

const store = createStore<AvailabilityConfig>("medicare_availability", initialConfig);

export const sharedAvailabilityStore = store;

export function useSharedAvailability() {
  return useStore(store);
}

export function updateAvailabilityDay(dayName: string, update: Partial<AvailabilityDay>) {
  store.set(prev => ({
    ...prev,
    days: { ...prev.days, [dayName]: { ...prev.days[dayName], ...update } },
  }));
}

export function setSlotDuration(duration: number) {
  store.set(prev => ({ ...prev, slotDuration: duration }));
}

/** Get break times for the current config */
export function getBreakTime(config: AvailabilityConfig): { start: string; end: string } | null {
  // Find the most common break across active days
  const breaks = Object.values(config.days)
    .filter(d => d.active && d.breakStart && d.breakEnd);
  if (breaks.length === 0) return null;
  return { start: breaks[0].breakStart, end: breaks[0].breakEnd };
}

/** Get all weekday names in order */
export const WEEK_DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
export const WEEK_DAYS_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
