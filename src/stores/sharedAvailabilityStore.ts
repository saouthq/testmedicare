/**
 * sharedAvailabilityStore.ts — Centralized doctor availability.
 * Dual-mode: localStorage in Demo, Supabase in Production.
 */
import { createStore, useStore } from "./crossRoleStore";
import type { AvailabilityConfig, AvailabilityDay } from "@/types/appointment";
import { getAppMode } from "./authStore";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthReady } from "@/hooks/useSupabaseQuery";
import { mapAvailabilityRows } from "@/lib/supabaseMappers";
import { useSyncExternalStore } from "react";

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

export function useSharedAvailability(): [AvailabilityConfig, (v: AvailabilityConfig | ((p: AvailabilityConfig) => AvailabilityConfig)) => void] {
  const mode = getAppMode();
  const { isReady } = useAuthReady();
  const localData = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  const query = useQuery({
    queryKey: ["doctor_availability"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)("doctor_availability").select("*");
      if (error || !data || data.length === 0) return null;
      const days = mapAvailabilityRows(data);
      const slotDuration = data[0]?.slot_duration || 30;
      return { days, slotDuration, doctor: "" } as AvailabilityConfig;
    },
    enabled: mode === "production" && isReady,
  });

  if (mode === "production" && query.data) {
    return [query.data, store.set];
  }

  return [localData, store.set];
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
