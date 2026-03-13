/**
 * Supabase implementation of ConsultationRepository.
 */
import { supabase } from "@/integrations/supabase/client";
import type { ConsultationRepository } from "./repository";
import type {
  Consultation,
  ConsultationVital,
  CreateConsultationInput,
  UpdateConsultationInput,
} from "./types";
import { mapConsultationRow, mapConsultationToRow, mapVitalRow } from "./mappers";

export const supabaseConsultationRepo: ConsultationRepository = {
  async listByDoctor(doctorId: string) {
    const { data, error } = await (supabase.from as any)("consultations")
      .select("*")
      .eq("doctor_id", doctorId)
      .order("created_at", { ascending: false });
    if (error) { console.error("[consultations] listByDoctor:", error); return []; }
    return (data || []).map(mapConsultationRow);
  },

  async listByPatient(patientId: number) {
    const { data, error } = await (supabase.from as any)("consultations")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });
    if (error) { console.error("[consultations] listByPatient:", error); return []; }
    return (data || []).map(mapConsultationRow);
  },

  async getById(id: string) {
    const { data, error } = await (supabase.from as any)("consultations")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return mapConsultationRow(data);
  },

  async getByAppointment(appointmentId: string) {
    const { data, error } = await (supabase.from as any)("consultations")
      .select("*")
      .eq("appointment_id", appointmentId)
      .maybeSingle();
    if (error || !data) return null;
    return mapConsultationRow(data);
  },

  async create(input: CreateConsultationInput) {
    const row = mapConsultationToRow({
      appointmentId: input.appointmentId || null,
      doctorId: input.doctorId,
      patientId: input.patientId,
      patientName: input.patientName,
      doctorName: input.doctorName,
      date: input.date,
      motif: input.motif,
      specialty: input.specialty || "",
      status: "in_progress",
    });
    const { data, error } = await (supabase.from as any)("consultations")
      .insert(row)
      .select()
      .single();
    if (error) throw error;
    return mapConsultationRow(data);
  },

  async update(input: UpdateConsultationInput) {
    const { id, ...rest } = input;
    const row = mapConsultationToRow(rest as any);
    const { data, error } = await (supabase.from as any)("consultations")
      .update(row)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapConsultationRow(data);
  },

  async getVitals(consultationId: string) {
    const { data, error } = await (supabase.from as any)("consultation_vitals")
      .select("*")
      .eq("consultation_id", consultationId)
      .order("id");
    if (error) { console.error("[vitals] getVitals:", error); return []; }
    return (data || []).map(mapVitalRow);
  },

  async saveVitals(consultationId: string, vitals) {
    // Delete existing vitals then insert new ones
    await (supabase.from as any)("consultation_vitals")
      .delete()
      .eq("consultation_id", consultationId);

    if (vitals.length > 0) {
      const rows = vitals.map(v => ({
        consultation_id: consultationId,
        label: v.label,
        value: v.value,
        unit: v.unit || "",
      }));
      await (supabase.from as any)("consultation_vitals").insert(rows);
    }
  },
};
