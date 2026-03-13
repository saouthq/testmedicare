/**
 * sharedAvailabilityStore.ts — Centralized doctor availability.
 * Dual-mode: localStorage in Demo, Supabase in Production.
 */
import { createStore } from "./crossRoleStore";
import type { AvailabilityConfig, AvailabilityDay } from "@/types/appointment";
import { getAppMode, readAuthUser } from "./authStore";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthReady } from "@/hooks/useSupabaseQuery";
import { mapAvailabilityRows } from "@/lib/supabaseMappers";
import { useSyncExternalStore, useEffect } from "react";

const defaultDays: Record<string, AvailabilityDay> = {
  Lundi:    { active: true,  start: "08:00", end: "18:00", breakStart: "12:00", breakEnd: "14:00" },
  Mardi:    { active: true,  start: "08:00", end: "18:00", breakStart: "12:00", breakEnd: "14:00" },
  Mercredi: { active: true,  start: "08:00", end: "12:00", breakStart: "",      breakEnd: "" },
  Jeudi:    { active: true,  start: "08:00", end: "18:00", breakStart: "12:00", breakEnd: "14:00" },
  Vendredi: { active: true,  start: "08:00", end: "17:00", breakStart: "12:00", breakEnd: "14:00" },
  Samedi:   { active: true,  start: "08:00", end: "13:00", breakStart: "",      breakEnd: "" },
  Dimanche: { active: false, start: "09:00", end: "12:00", breakStart: "",      breakEnd: "" },
};

function cloneDefaultDays(): Record<string, AvailabilityDay> {
  return Object.fromEntries(
    Object.entries(defaultDays).map(([k, v]) => [k, { ...v }])
  );
}

function normalizeConfig(partial?: Partial<AvailabilityConfig> | null): AvailabilityConfig {
  return {
    days: { ...cloneDefaultDays(), ...(partial?.days || {}) },
    slotDuration: partial?.slotDuration || 30,
    doctor: partial?.doctor || readAuthUser()?.doctorName || "Dr. Ahmed Bouazizi",
  };
}

const initialConfig: AvailabilityConfig = normalizeConfig();
const store = createStore<AvailabilityConfig>("medicare_availability", initialConfig);

export const sharedAvailabilityStore = store;

export function useSharedAvailability(): [AvailabilityConfig, (v: AvailabilityConfig | ((p: AvailabilityConfig) => AvailabilityConfig)) => void] {
  const mode = getAppMode();
  const { isReady } = useAuthReady();
  const localData = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  const query = useQuery({
    queryKey: ["doctor_availability", "me"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;
      const { data, error } = await (supabase.from as any)("doctor_availability")
        .select("*")
        .eq("doctor_id", session.user.id);
      if (error || !data) return null;
      const days = mapAvailabilityRows(data);
      const slotDuration = data[0]?.slot_duration || 30;
      return normalizeConfig({ days, slotDuration });
    },
    enabled: mode === "production" && isReady,
  });

  // Hydrate central store from Supabase once loaded so ALL workflows use the same source.
  useEffect(() => {
    if (mode !== "production" || !query.data) return;
    store.set((prev) => {
      const merged = normalizeConfig(query.data);
      const prevStr = JSON.stringify(prev);
      const nextStr = JSON.stringify(merged);
      return prevStr === nextStr ? prev : merged;
    });
  }, [mode, query.data]);

  return [localData, store.set];
}

/** Persist availability day to Supabase */
async function supabaseUpsertDay(dayName: string, day: AvailabilityDay, slotDuration: number) {
  if (getAppMode() !== "production") return;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const row = {
      active: day.active,
      start_time: day.start || "08:00",
      end_time: day.end || "18:00",
      break_start: day.breakStart || null,
      break_end: day.breakEnd || null,
      slot_duration: slotDuration,
    };

    const { data: updatedRows, error: updateError } = await (supabase.from as any)("doctor_availability")
      .update(row)
      .eq("doctor_id", session.user.id)
      .eq("day_name", dayName)
      .select("id");

    if (updateError) throw updateError;

    if (!updatedRows || updatedRows.length === 0) {
      const { error: insertError } = await (supabase.from as any)("doctor_availability").insert({
        doctor_id: session.user.id,
        day_name: dayName,
        ...row,
      });
      if (insertError) throw insertError;
    }
  } catch (e) {
    console.warn("[availability] Supabase upsert failed:", e);
  }
}

export function updateAvailabilityDay(dayName: string, update: Partial<AvailabilityDay>) {
  store.set(prev => {
    const newDays = { ...prev.days, [dayName]: { ...prev.days[dayName], ...update } };
    const newConfig = { ...prev, days: newDays };
    supabaseUpsertDay(dayName, newDays[dayName], prev.slotDuration);
    return newConfig;
  });
}

export function setSlotDuration(duration: number) {
  store.set(prev => {
    const newConfig = { ...prev, slotDuration: duration };
    if (getAppMode() === "production") {
      Object.entries(prev.days).forEach(([dayName, day]) => {
        supabaseUpsertDay(dayName, day, duration);
      });
    }
    return newConfig;
  });
}

/** Save entire availability config to Supabase + ensure doctor appears in directory */
export async function saveAvailabilityToSupabase() {
  if (getAppMode() !== "production") return;
  const config = store.read();
  await Promise.all(
    Object.entries(config.days).map(([dayName, day]) => supabaseUpsertDay(dayName, day, config.slotDuration))
  );

  // Auto-upsert doctors_directory so the doctor appears in public search
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const { data: profile } = await (supabase.from as any)("profiles")
      .select("first_name, last_name, email, phone")
      .eq("id", session.user.id)
      .maybeSingle();
    
    if (profile) {
      const hasActiveDays = Object.values(config.days).some(d => d.active);
      await (supabase.from as any)("doctors_directory").upsert({
        id: session.user.id,
        city: "Tunis",
        specialty: readAuthUser()?.establishment ? "Médecin" : "Médecin généraliste",
        accepts_new_patients: hasActiveDays,
        verified: true,
        teleconsultation: true,
        consultation_price: 35,
        address: "Tunis, Tunisie",
        phone: profile.phone || "",
        languages: ["Français", "Arabe"],
      }, { onConflict: "id" });
    }
  } catch (e) {
    console.warn("[saveAvailabilityToSupabase] doctors_directory upsert failed:", e);
  }
}

/** Get break times for the current config */
export function getBreakTime(config: AvailabilityConfig): { start: string; end: string } | null {
  const breaks = Object.values(config.days)
    .filter(d => d.active && d.breakStart && d.breakEnd);
  if (breaks.length === 0) return null;
  return { start: breaks[0].breakStart, end: breaks[0].breakEnd };
}

/** Get all weekday names in order */
export const WEEK_DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
export const WEEK_DAYS_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];