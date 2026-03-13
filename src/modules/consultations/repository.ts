/**
 * Consultation Repository Interface — contract for data access.
 * Implementations: DemoConsultationRepo, SupabaseConsultationRepo
 */
import type {
  Consultation,
  ConsultationVital,
  CreateConsultationInput,
  UpdateConsultationInput,
} from "./types";

export interface ConsultationRepository {
  /** List consultations for a doctor */
  listByDoctor(doctorId: string): Promise<Consultation[]>;

  /** List consultations for a patient */
  listByPatient(patientId: number): Promise<Consultation[]>;

  /** Get single consultation by ID */
  getById(id: string): Promise<Consultation | null>;

  /** Get consultation linked to an appointment */
  getByAppointment(appointmentId: string): Promise<Consultation | null>;

  /** Create a new consultation */
  create(input: CreateConsultationInput): Promise<Consultation>;

  /** Update consultation fields */
  update(input: UpdateConsultationInput): Promise<Consultation>;

  /** Get vitals for a consultation */
  getVitals(consultationId: string): Promise<ConsultationVital[]>;

  /** Save vitals for a consultation (replaces all) */
  saveVitals(consultationId: string, vitals: Omit<ConsultationVital, "id" | "consultationId">[]): Promise<void>;
}
