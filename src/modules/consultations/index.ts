/**
 * Consultations module — public API.
 * Resolves the active repository based on app mode.
 */
export type { Consultation, ConsultationVital, CreateConsultationInput, UpdateConsultationInput, ConsultationStatus } from "./types";
export type { ConsultationRepository } from "./repository";
export { mapConsultationRow, mapConsultationToRow, mapVitalRow } from "./mappers";
export { consultationsStore, vitalsStore } from "./demoRepo";

import { getAppMode } from "@/stores/authStore";
import { demoConsultationRepo } from "./demoRepo";
import { supabaseConsultationRepo } from "./supabaseRepo";
import type { ConsultationRepository } from "./repository";

/** Get the active consultation repository based on current app mode */
export function getConsultationRepo(): ConsultationRepository {
  return getAppMode() === "production" ? supabaseConsultationRepo : demoConsultationRepo;
}
