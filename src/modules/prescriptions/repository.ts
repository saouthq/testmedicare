/**
 * Prescriptions module — Repository interface.
 */
import type { Prescription } from "@/types/prescription";

export interface PrescriptionRepository {
  /** List prescriptions for a doctor */
  listByDoctor(doctorId: string): Promise<Prescription[]>;

  /** List prescriptions for a patient */
  listByPatient(patientId: number): Promise<Prescription[]>;

  /** Get a single prescription */
  getById(id: string): Promise<Prescription | null>;

  /** Create a new prescription */
  create(rx: Omit<Prescription, "id">): Promise<Prescription>;

  /** Update a prescription */
  update(id: string, data: Partial<Prescription>): Promise<void>;

  /** Send prescription to pharmacy */
  sendToPharmacy(id: string, pharmacy: string): Promise<void>;
}
