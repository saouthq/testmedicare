/**
 * Prescriptions module — public API.
 */
export type { PrescriptionRepository } from "./repository";

import { getAppMode } from "@/stores/authStore";
import { demoPrescriptionRepo } from "./demoRepo";
import { supabasePrescriptionRepo } from "./supabaseRepo";
import type { PrescriptionRepository } from "./repository";

export function getPrescriptionRepo(): PrescriptionRepository {
  return getAppMode() === "production" ? supabasePrescriptionRepo : demoPrescriptionRepo;
}
