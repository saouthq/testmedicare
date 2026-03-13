/**
 * Demo implementation of ConsultationRepository.
 * Uses localStorage via crossRoleStore for persistence.
 */
import { createStore } from "@/stores/crossRoleStore";
import type { ConsultationRepository } from "./repository";
import type {
  Consultation,
  ConsultationVital,
  CreateConsultationInput,
  UpdateConsultationInput,
} from "./types";

// ─── localStorage stores ────────────────────────────────────
const consultationsStore = createStore<Consultation[]>("medicare_consultations", []);
const vitalsStore = createStore<ConsultationVital[]>("medicare_consultation_vitals", []);

export { consultationsStore, vitalsStore };

function generateId(): string {
  return `CONS-${Date.now().toString(36).toUpperCase()}`;
}

export const demoConsultationRepo: ConsultationRepository = {
  async listByDoctor(doctorId: string) {
    return consultationsStore.read().filter(c => c.doctorId === doctorId);
  },

  async listByPatient(patientId: number) {
    return consultationsStore.read().filter(c => c.patientId === patientId);
  },

  async getById(id: string) {
    return consultationsStore.read().find(c => c.id === id) || null;
  },

  async getByAppointment(appointmentId: string) {
    return consultationsStore.read().find(c => c.appointmentId === appointmentId) || null;
  },

  async create(input: CreateConsultationInput) {
    const now = new Date().toISOString();
    const consultation: Consultation = {
      id: generateId(),
      appointmentId: input.appointmentId || null,
      doctorId: input.doctorId,
      patientId: input.patientId,
      patientName: input.patientName,
      doctorName: input.doctorName,
      date: input.date,
      status: "in_progress",
      motif: input.motif,
      symptoms: "",
      examination: "",
      diagnosis: "",
      conclusion: "",
      carePlan: "",
      notes: "",
      specialty: input.specialty || "",
      durationMinutes: 0,
      createdAt: now,
      updatedAt: now,
    };
    consultationsStore.set(prev => [...prev, consultation]);
    return consultation;
  },

  async update(input: UpdateConsultationInput) {
    let updated: Consultation | null = null;
    consultationsStore.set(prev =>
      prev.map(c => {
        if (c.id !== input.id) return c;
        updated = {
          ...c,
          ...(input.symptoms !== undefined && { symptoms: input.symptoms }),
          ...(input.examination !== undefined && { examination: input.examination }),
          ...(input.diagnosis !== undefined && { diagnosis: input.diagnosis }),
          ...(input.conclusion !== undefined && { conclusion: input.conclusion }),
          ...(input.carePlan !== undefined && { carePlan: input.carePlan }),
          ...(input.notes !== undefined && { notes: input.notes }),
          ...(input.status !== undefined && { status: input.status }),
          ...(input.durationMinutes !== undefined && { durationMinutes: input.durationMinutes }),
          updatedAt: new Date().toISOString(),
        };
        return updated;
      })
    );
    return updated || consultationsStore.read().find(c => c.id === input.id)!;
  },

  async getVitals(consultationId: string) {
    return vitalsStore.read().filter(v => v.consultationId === consultationId);
  },

  async saveVitals(consultationId: string, vitals) {
    vitalsStore.set(prev => {
      const other = prev.filter(v => v.consultationId !== consultationId);
      const newVitals: ConsultationVital[] = vitals.map((v, i) => ({
        ...v,
        id: Date.now() + i,
        consultationId,
      }));
      return [...other, ...newVitals];
    });
  },
};
