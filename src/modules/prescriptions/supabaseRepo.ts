/**
 * Supabase implementation of PrescriptionRepository.
 */
import { supabase } from "@/integrations/supabase/client";
import type { PrescriptionRepository } from "./repository";
import type { Prescription } from "@/types/prescription";
import { mapPrescriptionRow, mapPrescriptionToRow } from "@/lib/supabaseMappers";

export const supabasePrescriptionRepo: PrescriptionRepository = {
  async listByDoctor(doctorId: string) {
    const { data, error } = await (supabase.from as any)("prescriptions")
      .select("*")
      .eq("doctor_id", doctorId)
      .order("created_at", { ascending: false });
    if (error) { console.error("[prescriptions] listByDoctor:", error); return []; }
    return (data || []).map(mapPrescriptionRow);
  },

  async listByPatient(patientId: number) {
    const { data, error } = await (supabase.from as any)("prescriptions")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });
    if (error) { console.error("[prescriptions] listByPatient:", error); return []; }
    return (data || []).map(mapPrescriptionRow);
  },

  async getById(id: string) {
    const { data, error } = await (supabase.from as any)("prescriptions")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return mapPrescriptionRow(data);
  },

  async create(rx) {
    const row = mapPrescriptionToRow(rx);
    const { data, error } = await (supabase.from as any)("prescriptions")
      .insert(row)
      .select()
      .single();
    if (error) throw error;
    return mapPrescriptionRow(data);
  },

  async update(id, updates) {
    const row = mapPrescriptionToRow(updates);
    delete row.id;
    await (supabase.from as any)("prescriptions").update(row).eq("id", id);
  },

  async sendToPharmacy(id, pharmacy) {
    await (supabase.from as any)("prescriptions")
      .update({ pharmacy, sent: true })
      .eq("id", id);
  },
};
