/**
 * Patients module — public API.
 */
export type { PatientRepository } from "./repository";

import { getAppMode } from "@/stores/authStore";
import { demoPatientRepo } from "./demoRepo";
import { supabasePatientRepo } from "./supabaseRepo";
import type { PatientRepository } from "./repository";

export function getPatientRepo(): PatientRepository {
  return getAppMode() === "production" ? supabasePatientRepo : demoPatientRepo;
}
