/**
 * Mappers between Supabase rows and domain types for consultations.
 */
import type { Consultation, ConsultationVital } from "./types";

export function mapConsultationRow(row: any): Consultation {
  return {
    id: row.id,
    appointmentId: row.appointment_id || null,
    doctorId: row.doctor_id,
    patientId: row.patient_id,
    patientName: row.patient_name || "",
    doctorName: row.doctor_name || "",
    date: row.date || "",
    status: row.status || "in_progress",
    motif: row.motif || "",
    symptoms: row.symptoms || "",
    examination: row.examination || "",
    diagnosis: row.diagnosis || "",
    conclusion: row.conclusion || "",
    carePlan: row.care_plan || "",
    notes: row.notes || "",
    specialty: row.specialty || "",
    durationMinutes: row.duration_minutes || 0,
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

export function mapConsultationToRow(c: Partial<Consultation>): Record<string, any> {
  const row: Record<string, any> = {};
  if (c.id !== undefined) row.id = c.id;
  if (c.appointmentId !== undefined) row.appointment_id = c.appointmentId;
  if (c.doctorId !== undefined) row.doctor_id = c.doctorId;
  if (c.patientId !== undefined) row.patient_id = c.patientId;
  if (c.patientName !== undefined) row.patient_name = c.patientName;
  if (c.doctorName !== undefined) row.doctor_name = c.doctorName;
  if (c.date !== undefined) row.date = c.date;
  if (c.status !== undefined) row.status = c.status;
  if (c.motif !== undefined) row.motif = c.motif;
  if (c.symptoms !== undefined) row.symptoms = c.symptoms;
  if (c.examination !== undefined) row.examination = c.examination;
  if (c.diagnosis !== undefined) row.diagnosis = c.diagnosis;
  if (c.conclusion !== undefined) row.conclusion = c.conclusion;
  if (c.carePlan !== undefined) row.care_plan = c.carePlan;
  if (c.notes !== undefined) row.notes = c.notes;
  if (c.specialty !== undefined) row.specialty = c.specialty;
  if (c.durationMinutes !== undefined) row.duration_minutes = c.durationMinutes;
  return row;
}

export function mapVitalRow(row: any): ConsultationVital {
  return {
    id: row.id,
    consultationId: row.consultation_id,
    label: row.label || "",
    value: row.value || "",
    unit: row.unit || "",
  };
}
