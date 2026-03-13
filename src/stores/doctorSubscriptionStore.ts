/**
 * doctorSubscriptionStore.ts — Current doctor's plan, specialty, and activity.
 * Used to gate features across the doctor space.
 * Dual-mode: localStorage (demo) / Supabase subscriptions table (production).
 */
import { createStore, useStore } from "./crossRoleStore";
import { getAppMode, readAuthUser } from "./authStore";
import { supabase } from "@/integrations/supabase/client";
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

export async function setDoctorPlan(plan: PlanTier) {
  doctorSubscriptionStore.set(prev => ({ ...prev, plan }));
  await syncSubscriptionToSupabase();
}

export async function setDoctorActivity(activity: ActivityType, specialty?: string) {
  doctorSubscriptionStore.set(prev => ({ ...prev, activity, specialty }));
  await syncSubscriptionToSupabase();
}

/** Load subscription from Supabase on login */
export async function loadDoctorSubscription() {
  if (getAppMode() !== "production") return;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const { data } = await (supabase.from as any)("subscriptions")
      .select("plan, activity, specialty")
      .eq("user_id", session.user.id)
      .maybeSingle();
    if (data) {
      doctorSubscriptionStore.set({
        plan: data.plan || "free",
        activity: data.activity || "generaliste",
        specialty: data.specialty || undefined,
      });
    }
  } catch (e) {
    console.warn("[loadDoctorSubscription] Supabase fetch failed:", e);
  }
}

async function syncSubscriptionToSupabase() {
  if (getAppMode() !== "production") return;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const sub = doctorSubscriptionStore.read();
    await (supabase.from as any)("subscriptions").upsert({
      user_id: session.user.id,
      plan: sub.plan,
      activity: sub.activity,
      specialty: sub.specialty || "",
      status: "active",
    }, { onConflict: "user_id" });
  } catch (e) {
    console.warn("[syncSubscriptionToSupabase] failed:", e);
  }
}
