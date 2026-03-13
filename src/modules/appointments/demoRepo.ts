/**
 * Demo implementation of AppointmentRepository.
 * Delegates to the existing sharedAppointmentsStore.
 */
import type { AppointmentRepository } from "./repository";
import type { SharedAppointment, AppointmentStatus } from "@/types/appointment";
import {
  sharedAppointmentsStore,
  createAppointment,
  updateAppointmentStatus,
  rescheduleAppointment,
  cancelAppointment,
} from "@/stores/sharedAppointmentsStore";

export const demoAppointmentRepo: AppointmentRepository = {
  async listByDoctor(doctorId: string) {
    // In demo mode, filter by doctor name (demo IDs aren't UUIDs)
    return sharedAppointmentsStore.read();
  },

  async listByPatient(patientId: number) {
    return sharedAppointmentsStore.read().filter(a => a.patientId === patientId);
  },

  async getById(id: string) {
    return sharedAppointmentsStore.read().find(a => a.id === id) || null;
  },

  async create(apt) {
    const id = createAppointment(apt);
    return sharedAppointmentsStore.read().find(a => a.id === id)!;
  },

  async updateStatus(id, status, extra) {
    updateAppointmentStatus(id, status, extra);
  },

  async reschedule(id, newDate, newTime) {
    rescheduleAppointment(id, newDate, newTime);
  },

  async cancel(id) {
    cancelAppointment(id);
  },
};
