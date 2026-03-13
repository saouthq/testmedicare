/**
 * Supabase implementation of PatientRepository.
 */
import { supabase } from "@/integrations/supabase/client";
import type { PatientRepository } from "./repository";
import type { SharedPatient } from "@/stores/sharedPatientsStore";
import { mapPatientRow, mapPatientToRow } from "@/lib/supabaseMappers";

export const supabasePatientRepo: PatientRepository = {
  async listByDoctor(doctorId: string) {
    const { data, error } = await (supabase.from as any)("patients")
      .select("*")
      .eq("treating_doctor_id", doctorId)
      .order("last_name");
    if (error) { console.error("[patients] listByDoctor:", error); return []; }
    return (data || []).map(mapPatientRow);
  },

  async getById(id: number) {
    const { data, error } = await (supabase.from as any)("patients")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return mapPatientRow(data);
  },

  async create(patient) {
    const row = mapPatientToRow(patient);
    const { data, error } = await (supabase.from as any)("patients")
      .insert(row)
      .select()
      .single();
    if (error) throw error;
    return mapPatientRow(data);
  },

  async update(id, updates) {
    const row = mapPatientToRow(updates);
    delete row.id;
    await (supabase.from as any)("patients").update(row).eq("id", id);
  },
};
