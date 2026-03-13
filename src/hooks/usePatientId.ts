/**
 * usePatientId — Resolves the current patient's ID from auth context.
 * In demo mode: returns the hardcoded patientId from the demo user.
 * In production: queries the patients table to find the patient record linked to the auth user.
 */
import { useMemo } from "react";
import { useAuth, getAppMode } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePatientId(): number | null {
  const { user } = useAuth();
  const mode = getAppMode();

  // Demo mode: use patientId from demo user config
  if (mode === "demo" || user?.isDemo) {
    return user?.patientId ?? 1;
  }

  // Production: patientId is resolved via the query below or from cached user
  return user?.patientId ?? null;
}

/**
 * Hook that resolves patient ID from Supabase patients table in production.
 * Returns { patientId, isLoading }.
 */
export function useResolvedPatientId() {
  const { user } = useAuth();
  const mode = getAppMode();

  const query = useQuery({
    queryKey: ["resolved_patient_id", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)("patients")
        .select("id")
        .eq("user_id", user!.id)
        .single();
      if (error || !data) return null;
      return data.id as number;
    },
    enabled: mode === "production" && !!user?.id && user.role === "patient" && !user.patientId,
    staleTime: Infinity,
  });

  if (mode === "demo" || user?.isDemo) {
    return { patientId: user?.patientId ?? 1, isLoading: false };
  }

  if (user?.patientId) {
    return { patientId: user.patientId, isLoading: false };
  }

  return { patientId: query.data ?? null, isLoading: query.isLoading };
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
