/**
 * patientStore.ts — Patient profile state.
 * Dual-mode: Supabase (profiles) in production, localStorage for demo.
 */
import { createStore, useStore } from "./crossRoleStore";
import { useDualQuery } from "@/hooks/useDualData";
import { supabase } from "@/integrations/supabase/client";
import { getAppMode } from "./authStore";

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
export function usePatientProfile() {
  return useDualQuery<PatientProfile>({
    store: profileStore,
    tableName: "profiles",
    queryKey: ["patient_profile"],
    mapRowToLocal: (row: any) => ({
      firstName: row.first_name || "",
      lastName: row.last_name || "",
      email: row.email || "",
      phone: row.phone || "",
      dob: "",
      address: "",
      gouvernorat: row.gouvernorat || "Tunis",
      bloodType: "",
      insurance: "",
      insuranceNumber: row.assurance_number || "",
      treatingDoctor: "",
      allergies: [],
    }),
  });
}

// ── Actions ──
/** Update patient profile */
export async function updatePatientProfile(updates: Partial<PatientProfile>) {
  profileStore.set(prev => ({ ...prev, ...updates }));

  if (getAppMode() === "production") {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const row: Record<string, any> = {};
        if (updates.firstName) row.first_name = updates.firstName;
        if (updates.lastName) row.last_name = updates.lastName;
        if (updates.email) row.email = updates.email;
        if (updates.phone) row.phone = updates.phone;
        if (updates.gouvernorat) row.gouvernorat = updates.gouvernorat;
        if (updates.insuranceNumber) row.assurance_number = updates.insuranceNumber;
        if (Object.keys(row).length > 0) {
          await (supabase.from as any)("profiles").update(row).eq("id", session.user.id);
        }
      }
    } catch {}
  }
}

// Read-only access for non-React contexts
export const readProfile = () => profileStore.read();
