/**
 * Patients module — Repository interface.
 */
import type { SharedPatient } from "@/stores/sharedPatientsStore";

export interface PatientRepository {
  /** List all patients for a doctor */
  listByDoctor(doctorId: string): Promise<SharedPatient[]>;

  /** Get a single patient by ID */
  getById(id: number): Promise<SharedPatient | null>;

  /** Create a new patient */
  create(patient: Omit<SharedPatient, "id">): Promise<SharedPatient>;

  /** Update patient fields */
  update(id: number, data: Partial<SharedPatient>): Promise<void>;
}
