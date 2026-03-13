/**
 * Appointments module — public API.
 */
export type { AppointmentRepository } from "./repository";

import { getAppMode } from "@/stores/authStore";
import { demoAppointmentRepo } from "./demoRepo";
import { supabaseAppointmentRepo } from "./supabaseRepo";
import type { AppointmentRepository } from "./repository";

export function getAppointmentRepo(): AppointmentRepository {
  return getAppMode() === "production" ? supabaseAppointmentRepo : demoAppointmentRepo;
}
