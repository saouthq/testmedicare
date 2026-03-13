/**
 * Supabase implementation of AppointmentRepository.
 */
import { supabase } from "@/integrations/supabase/client";
import type { AppointmentRepository } from "./repository";
import type { SharedAppointment, AppointmentStatus } from "@/types/appointment";
import { mapAppointmentRow, mapAppointmentToRow } from "@/lib/supabaseMappers";
import { computeEndTime } from "@/types/appointment";

export const supabaseAppointmentRepo: AppointmentRepository = {
  async listByDoctor(doctorId: string) {
    const { data, error } = await (supabase.from as any)("appointments")
      .select("*")
      .eq("doctor_id", doctorId)
      .order("date", { ascending: true });
    if (error) { console.error("[appointments] listByDoctor:", error); return []; }
    return (data || []).map(mapAppointmentRow);
  },

  async listByPatient(patientId: number) {
    const { data, error } = await (supabase.from as any)("appointments")
      .select("*")
      .eq("patient_id", patientId)
      .order("date", { ascending: false });
    if (error) { console.error("[appointments] listByPatient:", error); return []; }
    return (data || []).map(mapAppointmentRow);
  },

  async getById(id: string) {
    const { data, error } = await (supabase.from as any)("appointments")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return mapAppointmentRow(data);
  },

  async create(apt) {
    const endTime = computeEndTime(apt.startTime, apt.duration);
    const row = mapAppointmentToRow({ ...apt, endTime });
    const { data, error } = await (supabase.from as any)("appointments")
      .insert(row)
      .select()
      .single();
    if (error) throw error;
    return mapAppointmentRow(data);
  },

  async updateStatus(id, status, extra) {
    const row = mapAppointmentToRow({ status, ...extra });
    delete row.id;
    await (supabase.from as any)("appointments").update(row).eq("id", id);
  },

  async reschedule(id, newDate, newTime) {
    await (supabase.from as any)("appointments")
      .update({ date: newDate, start_time: newTime, status: "confirmed" })
      .eq("id", id);
  },

  async cancel(id) {
    await (supabase.from as any)("appointments")
      .update({ status: "cancelled" })
      .eq("id", id);
  },
};
