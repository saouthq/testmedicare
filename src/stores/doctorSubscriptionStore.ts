/**
 * doctorSubscriptionStore.ts — Current doctor's plan, specialty, and activity.
 * Used to gate features across the doctor space.
 * Persists in localStorage for simulation purposes.
 *
 * // TODO BACKEND: Replace with real subscription API
 */
import { createStore, useStore } from "./crossRoleStore";
import type { ActivityType, PlanTier } from "@/stores/featureMatrixStore";

export interface DoctorSubscription {
  activity: ActivityType;
  specialty?: string;
  plan: PlanTier;
}

const initialSubscription: DoctorSubscription = {
  activity: "generaliste",
  specialty: undefined,
  plan: "pro", // default Pro for demo
};

export const doctorSubscriptionStore = createStore<DoctorSubscription>(
  "doctor_subscription",
  initialSubscription
);

export function useDoctorSubscription() {
  return useStore(doctorSubscriptionStore);
}

export function setDoctorPlan(plan: PlanTier) {
  doctorSubscriptionStore.set(prev => ({ ...prev, plan }));
}

export function setDoctorActivity(activity: ActivityType, specialty?: string) {
  doctorSubscriptionStore.set(prev => ({ ...prev, activity, specialty }));
}
