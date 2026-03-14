/**
 * patientStore.ts — Patient profile state.
 * Dual-mode: Supabase (profiles + patients) in production, localStorage for demo.
 */
import { createStore, useStore } from "./crossRoleStore";
import { useDualQuery } from "@/hooks/useDualData";
import { supabase } from "@/integrations/supabase/client";
import { getAppMode } from "./authStore";
import { useQuery } from "@tanstack/react-query";
import { useAuthReady } from "@/hooks/useSupabaseQuery";
import { useSyncExternalStore, useMemo } from "react";

// ── Patient Profile ──
export interface PatientProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  gouvernorat: string;
  bloodType: string;
  insurance: string;
  insuranceNumber: string;
  treatingDoctor: string;
  allergies: string[];
}

const defaultProfile: PatientProfile = {
  firstName: "Amine",
  lastName: "Ben Ali",
  email: "amine@email.tn",
  phone: "+216 22 345 678",
  dob: "1991-03-15",
  address: "El Manar, Tunis",
  gouvernorat: "Tunis",
  bloodType: "A+",
  insurance: "maghrebia",
  insuranceNumber: "MAG-2024-001234",
  treatingDoctor: "Dr. Ahmed Bouazizi",
  allergies: ["Pénicilline", "Acariens"],
};

// ── Store ──
const profileStore = createStore<PatientProfile>("medicare_patient_profile", defaultProfile);

// ── Hooks ──
/**
 * usePatientProfile — Dual-mode hook.
 * Demo: returns localStorage data.
 * Production: merges profiles + patients tables for complete medical profile.
 */
export function usePatientProfile(): [PatientProfile, (v: PatientProfile | ((p: PatientProfile) => PatientProfile)) => void, { isLoading: boolean; isProduction: boolean }] {
  const mode = getAppMode();
  const isProduction = mode === "production";
  const { isReady } = useAuthReady();

  const localData = useSyncExternalStore(profileStore.subscribe, profileStore.getSnapshot, profileStore.getSnapshot);

  // Fetch from profiles table
  const profileQuery = useQuery<any>({
    queryKey: ["patient_profile_row"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;
      const { data, error } = await (supabase.from as any)("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();
      if (error) { console.error("[patientStore] profiles:", error); return null; }
      return data;
    },
    enabled: isProduction && isReady,
  });

  // Fetch from patients table (for medical fields: dob, blood_type, allergies, insurance)
  const patientQuery = useQuery<any>({
    queryKey: ["patient_medical_row"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;
      const { data, error } = await (supabase.from as any)("patients")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (error) { console.error("[patientStore] patients:", error); return null; }
      return data;
    },
    enabled: isProduction && isReady,
  });

  const prodData = useMemo((): PatientProfile => {
    if (!isProduction) return localData;

    const p = profileQuery.data;
    const pt = patientQuery.data;
    if (!p && !pt) return { ...defaultProfile, firstName: "", lastName: "", email: "", phone: "" };

    // Extract allergies as string[] from JSONB
    let allergies: string[] = [];
    if (pt?.allergies && Array.isArray(pt.allergies)) {
      allergies = pt.allergies.map((a: any) => typeof a === "string" ? a : a.name || "");
    }

    return {
      firstName: p?.first_name || pt?.first_name || "",
      lastName: p?.last_name || pt?.last_name || "",
      email: p?.email || pt?.email || "",
      phone: p?.phone || pt?.phone || "",
      dob: pt?.dob || "",
      address: "",
      gouvernorat: p?.gouvernorat || pt?.gouvernorat || "Tunis",
      bloodType: pt?.blood_type || "",
      insurance: pt?.insurance || "",
      insuranceNumber: p?.assurance_number || pt?.insurance_number || "",
      treatingDoctor: pt?.treating_doctor_name || "",
      allergies,
    };
  }, [isProduction, profileQuery.data, patientQuery.data, localData]);

  if (isProduction) {
    const isLoading = (profileQuery.isLoading && !profileQuery.data) || (patientQuery.isLoading && !patientQuery.data);
    return [prodData, profileStore.set, { isLoading, isProduction: true }];
  }

  return [localData, profileStore.set, { isLoading: false, isProduction: false }];
}

// ── Actions ──
/** Update patient profile */
export async function updatePatientProfile(updates: Partial<PatientProfile>) {
  profileStore.set(prev => ({ ...prev, ...updates }));

  if (getAppMode() === "production") {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Update profiles table (identity fields)
        const profileRow: Record<string, any> = {};
        if (updates.firstName) profileRow.first_name = updates.firstName;
        if (updates.lastName) profileRow.last_name = updates.lastName;
        if (updates.email) profileRow.email = updates.email;
        if (updates.phone) profileRow.phone = updates.phone;
        if (updates.gouvernorat) profileRow.gouvernorat = updates.gouvernorat;
        if (updates.insuranceNumber) profileRow.assurance_number = updates.insuranceNumber;
        if (Object.keys(profileRow).length > 0) {
          await (supabase.from as any)("profiles").update(profileRow).eq("id", session.user.id);
        }

        // Update patients table (medical fields)
        const patientRow: Record<string, any> = {};
        if (updates.dob) patientRow.dob = updates.dob;
        if (updates.bloodType) patientRow.blood_type = updates.bloodType;
        if (updates.insurance) patientRow.insurance = updates.insurance;
        if (updates.insuranceNumber) patientRow.insurance_number = updates.insuranceNumber;
        if (updates.allergies) patientRow.allergies = updates.allergies.map(a => ({ name: a }));
        if (Object.keys(patientRow).length > 0) {
          await (supabase.from as any)("patients").update(patientRow).eq("user_id", session.user.id);
        }
      }
    } catch (e) {
      console.warn("[updatePatientProfile] Supabase update failed:", e);
    }
  }
}

// Read-only access for non-React contexts
export const readProfile = () => profileStore.read();
