/**
 * Consultation domain types — single source of truth.
 */

export type ConsultationStatus = "in_progress" | "completed" | "cancelled";

export interface Consultation {
  id: string;
  appointmentId: string | null;
  doctorId: string;
  patientId: number | null;
  patientName: string;
  doctorName: string;
  date: string;
  status: ConsultationStatus;
  motif: string;
  symptoms: string;
  examination: string;
  diagnosis: string;
  conclusion: string;
  carePlan: string;
  notes: string;
  specialty: string;
  durationMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConsultationVital {
  id: number;
  consultationId: string;
  label: string;
  value: string;
  unit: string;
}

export interface CreateConsultationInput {
  appointmentId?: string;
  doctorId: string;
  patientId: number | null;
  patientName: string;
  doctorName: string;
  date: string;
  motif: string;
  specialty?: string;
}

export interface UpdateConsultationInput {
  id: string;
  symptoms?: string;
  examination?: string;
  diagnosis?: string;
  conclusion?: string;
  carePlan?: string;
  notes?: string;
  status?: ConsultationStatus;
  durationMinutes?: number;
}
