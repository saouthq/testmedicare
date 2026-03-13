/**
 * usePatientId — Resolves the current patient's ID from auth context.
 * In demo mode: returns the hardcoded patientId from the demo user.
 * In production: queries the patients table to find the patient record linked to the auth user.
 */
import { useMemo } from "react";
import { useAuth, getAppMode } from "@/stores/authStore";
import { useSharedPatients } from "@/stores/sharedPatientsStore";

export function usePatientId(): number | null {
  const { user } = useAuth();
  const mode = getAppMode();

  // Demo mode: use patientId from demo user config
  if (mode === "demo" || user?.isDemo) {
    return user?.patientId ?? 1;
  }

  // Production: patientId is resolved by the patients table user_id matching auth user id
  // We return null and let the query filter by user_id on the server side via RLS
  return user?.patientId ?? null;
}

/**
 * Hook that returns the patient's appointments filtered by their ID.
 * Works in both demo and production modes.
 */
export function usePatientFilter() {
  const patientId = usePatientId();
  const mode = getAppMode();

  return useMemo(() => ({
    patientId,
    isProduction: mode === "production",
    // In production, RLS handles filtering on the server side
    // In demo, we filter client-side by patientId
    filterFn: <T extends { patientId?: number | null }>(items: T[]): T[] => {
      if (mode === "production") return items; // RLS handles it
      if (!patientId) return items;
      return items.filter(item => item.patientId === patientId);
    },
  }), [patientId, mode]);
}
