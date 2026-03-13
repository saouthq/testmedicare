/**
 * Appointments module — Repository interface.
 */
import type { SharedAppointment, AppointmentStatus } from "@/types/appointment";

export interface AppointmentRepository {
  /** List appointments for a doctor */
  listByDoctor(doctorId: string): Promise<SharedAppointment[]>;

  /** List appointments for a patient */
  listByPatient(patientId: number): Promise<SharedAppointment[]>;

  /** Get a single appointment */
  getById(id: string): Promise<SharedAppointment | null>;

  /** Create a new appointment */
  create(apt: Omit<SharedAppointment, "id" | "endTime">): Promise<SharedAppointment>;

  /** Update appointment status + optional fields */
  updateStatus(id: string, status: AppointmentStatus, extra?: Partial<SharedAppointment>): Promise<void>;

  /** Reschedule an appointment */
  reschedule(id: string, newDate: string, newTime: string): Promise<void>;

  /** Cancel an appointment */
  cancel(id: string): Promise<void>;
}
