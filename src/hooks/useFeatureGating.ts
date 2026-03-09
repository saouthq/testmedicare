/**
 * useFeatureGating — Hook to check if a feature is enabled for the current doctor plan.
 * Returns helpers to check, gate, and render upgrade prompts.
 *
 * Usage:
 *   const { can, gated, GateOverlay } = useFeatureGating();
 *   if (!can("teleconsult_video")) return <GateOverlay feature="Téléconsultation" />;
 */
import { useMemo } from "react";
import { useDoctorSubscription } from "@/stores/doctorSubscriptionStore";
import { getEnabledFeatures, type FeatureDef, type PlanTier, plansByActivity, featureCatalog } from "@/stores/featureMatrixStore";

export function useFeatureGating() {
  const [sub] = useDoctorSubscription();

  const enabledFeatures = useMemo(
    () => getEnabledFeatures(sub.activity, sub.plan, sub.specialty),
    [sub.activity, sub.plan, sub.specialty]
  );

  const enabledIds = useMemo(
    () => new Set(enabledFeatures.map(f => f.id)),
    [enabledFeatures]
  );

  /** Check if a feature is enabled */
  const can = (featureId: string): boolean => enabledIds.has(featureId);

  /** Get all features for current activity/plan */
  const features = enabledFeatures;

  /** Get the next plan that unlocks a feature */
  const getUpgradePlan = (featureId: string): PlanTier | null => {
    const plans = plansByActivity[sub.activity];
    const currentIdx = plans.findIndex(p => p.id === sub.plan);
    for (let i = currentIdx + 1; i < plans.length; i++) {
      const nextFeatures = getEnabledFeatures(sub.activity, plans[i].id, sub.specialty);
      if (nextFeatures.some(f => f.id === featureId)) return plans[i].id;
    }
    return null;
  };

  /** Get plan price for upgrade */
  const getUpgradePrice = (featureId: string): number | null => {
    const upgradePlan = getUpgradePlan(featureId);
    if (!upgradePlan) return null;
    const plan = plansByActivity[sub.activity].find(p => p.id === upgradePlan);
    return plan?.price ?? null;
  };

  return {
    can,
    features,
    plan: sub.plan,
    activity: sub.activity,
    specialty: sub.specialty,
    getUpgradePlan,
    getUpgradePrice,
    enabledIds,
  };
}

/** Map sidebar items to their required features */
export const sidebarFeatureMap: Record<string, string> = {
  "/dashboard/doctor/waiting-room": "patient_queue",
  "/dashboard/doctor/consultations": "patient_file_basic",
  "/dashboard/doctor/prescriptions": "prescription_basic",
  "/dashboard/doctor/billing": "stats_basic",
  "/dashboard/doctor/connect": "teleconsult_chat",
  "/dashboard/doctor/ai-assistant": "ai_assistant",
  "/dashboard/doctor/secretary": "shared_secretary",
  "/dashboard/doctor/stats": "stats_advanced",
};

/** Features that show blurred overlay instead of being hidden */
export const blurredFeatures = new Set([
  "stats_advanced",
  "ai_assistant",
  "teleconsult_video",
  "prescription_specialized",
]);
