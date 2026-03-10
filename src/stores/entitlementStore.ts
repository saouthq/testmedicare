/**
 * entitlementStore.ts — Unified entitlement system.
 * Combines: plan features + per-account overrides + system feature flags + subscription status.
 * Single source of truth for "can user X do Y?"
 *
 * Per-account overrides: force ON/OFF a feature for a specific user with optional expiration.
 * System flags: global ON/OFF for features (like chat, teleconsult).
 * Subscription status: impayé/suspendu blocks sensitive features.
 *
 * // TODO BACKEND: Replace with server-side entitlement checks
 */
import { createStore, useStore } from "./crossRoleStore";
import { appendLog } from "@/services/admin/adminAuditService";

// ── Per-Account Overrides ──
export interface AccountOverride {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  featureId: string;
  featureLabel: string;
  forced: "on" | "off";
  reason: string;
  expiresAt?: string; // ISO date, optional
  createdBy: string;
  createdAt: string;
}

const overridesStore = createStore<AccountOverride[]>("medicare_account_overrides", [
  {
    id: "ov-1",
    userId: "doc-1",
    userName: "Dr. Ahmed Bouazizi",
    userRole: "doctor",
    featureId: "teleconsult_video",
    featureLabel: "Téléconsultation vidéo",
    forced: "on",
    reason: "Accès gratuit de test pour partenaire stratégique",
    expiresAt: "2026-06-01",
    createdBy: "Admin",
    createdAt: "2026-01-15",
  },
  {
    id: "ov-2",
    userId: "doc-5",
    userName: "Dr. Karim Bouzid",
    userRole: "doctor",
    featureId: "ai_assistant",
    featureLabel: "Assistant IA diagnostic",
    forced: "off",
    reason: "Abus signalé, accès IA retiré temporairement",
    expiresAt: "2026-04-01",
    createdBy: "Admin",
    createdAt: "2026-02-10",
  },
]);

export function useAccountOverrides() {
  return useStore(overridesStore);
}

export function getAccountOverrides(): AccountOverride[] {
  return overridesStore.read();
}

export function createOverride(override: Omit<AccountOverride, "id" | "createdAt">, motif: string): AccountOverride {
  const entry: AccountOverride = {
    ...override,
    id: `ov-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  overridesStore.set(prev => [entry, ...prev]);
  appendLog("override_created", "override", entry.id, `Override ${entry.forced.toUpperCase()} "${entry.featureLabel}" pour ${entry.userName} — ${motif}`);
  return entry;
}

export function removeOverride(id: string, motif: string) {
  const ov = getAccountOverrides().find(o => o.id === id);
  overridesStore.set(prev => prev.filter(o => o.id !== id));
  if (ov) appendLog("override_removed", "override", id, `Override supprimé: "${ov.featureLabel}" pour ${ov.userName} — ${motif}`);
}

export function isOverrideActive(ov: AccountOverride): boolean {
  if (!ov.expiresAt) return true;
  return new Date(ov.expiresAt) > new Date();
}

// ── System Feature Flags ──
export interface SystemFeatureFlag {
  id: string;
  featureId: string;
  label: string;
  enabled: boolean;
  reason?: string;
  updatedBy: string;
  updatedAt: string;
}

const defaultFlags: SystemFeatureFlag[] = [
  { id: "flag-chat", featureId: "teleconsult_chat", label: "Messagerie patient sécurisée", enabled: true, updatedBy: "Système", updatedAt: "2026-01-01" },
  { id: "flag-video", featureId: "teleconsult_video", label: "Téléconsultation vidéo", enabled: true, updatedBy: "Système", updatedAt: "2026-01-01" },
  { id: "flag-ai", featureId: "ai_assistant", label: "Assistant IA diagnostic", enabled: true, updatedBy: "Système", updatedAt: "2026-01-01" },
  { id: "flag-rx-send", featureId: "prescription_digital_send", label: "Envoi numérique pharmacie", enabled: true, updatedBy: "Système", updatedAt: "2026-01-01" },
  { id: "flag-lab-auto", featureId: "lab_auto_integration", label: "Intégration automates labo", enabled: true, updatedBy: "Système", updatedAt: "2026-01-01" },
  { id: "flag-screen-share", featureId: "teleconsult_screen_share", label: "Partage d'écran", enabled: true, updatedBy: "Système", updatedAt: "2026-01-01" },
  { id: "flag-recording", featureId: "teleconsult_recording", label: "Enregistrement consultation", enabled: false, reason: "Fonctionnalité en cours de développement", updatedBy: "Système", updatedAt: "2026-01-01" },
  { id: "flag-api", featureId: "api_integrations", label: "API & Intégrations", enabled: true, updatedBy: "Système", updatedAt: "2026-01-01" },
];

const flagsStore = createStore<SystemFeatureFlag[]>("medicare_system_flags", defaultFlags);

export function useSystemFlags() {
  return useStore(flagsStore);
}

export function getSystemFlags(): SystemFeatureFlag[] {
  return flagsStore.read();
}

export function isFeatureFlagEnabled(featureId: string): boolean {
  const flags = getSystemFlags();
  const flag = flags.find(f => f.featureId === featureId);
  if (!flag) return true; // no flag = enabled by default
  return flag.enabled;
}

export function toggleFeatureFlag(featureId: string, enabled: boolean, reason: string, admin: string) {
  flagsStore.set(prev => prev.map(f =>
    f.featureId === featureId
      ? { ...f, enabled, reason, updatedBy: admin, updatedAt: new Date().toISOString() }
      : f
  ));
  const flag = getSystemFlags().find(f => f.featureId === featureId);
  appendLog(
    enabled ? "feature_flag_enabled" : "feature_flag_disabled",
    "system_flag",
    featureId,
    `Flag "${flag?.label || featureId}" ${enabled ? "activé" : "désactivé"} — ${reason}`
  );
}

// ── Enhanced Subscription Status ──
export type SubscriptionStatus = "active" | "trial" | "expired" | "unpaid" | "suspended" | "cancelled";

export const subscriptionStatusConfig: Record<SubscriptionStatus, { label: string; color: string; blocksFeatures: boolean }> = {
  active: { label: "Actif", color: "bg-accent/10 text-accent border-accent/20", blocksFeatures: false },
  trial: { label: "Essai", color: "bg-warning/10 text-warning border-warning/20", blocksFeatures: false },
  expired: { label: "Expiré", color: "bg-destructive/10 text-destructive border-destructive/20", blocksFeatures: true },
  unpaid: { label: "Impayé", color: "bg-destructive/10 text-destructive border-destructive/20", blocksFeatures: true },
  suspended: { label: "Suspendu", color: "bg-destructive/10 text-destructive border-destructive/20", blocksFeatures: true },
  cancelled: { label: "Annulé", color: "bg-muted text-muted-foreground border-border", blocksFeatures: true },
};

// ── Unified check: can user access feature? ──
export function checkEntitlement(
  featureId: string,
  userId: string,
  planFeatures: Set<string>,
  subStatus: SubscriptionStatus
): { allowed: boolean; reason?: string } {
  // 1. System flag
  if (!isFeatureFlagEnabled(featureId)) {
    return { allowed: false, reason: "Cette fonctionnalité est temporairement désactivée par l'administrateur." };
  }

  // 2. Per-account override
  const overrides = getAccountOverrides().filter(o => o.userId === userId && o.featureId === featureId && isOverrideActive(o));
  if (overrides.length > 0) {
    const latest = overrides[0];
    if (latest.forced === "on") return { allowed: true };
    if (latest.forced === "off") return { allowed: false, reason: `Accès retiré : ${latest.reason}` };
  }

  // 3. Subscription status
  const statusConf = subscriptionStatusConfig[subStatus];
  if (statusConf.blocksFeatures) {
    return { allowed: false, reason: `Votre abonnement est ${statusConf.label.toLowerCase()}. Veuillez régulariser votre situation.` };
  }

  // 4. Plan features
  if (!planFeatures.has(featureId)) {
    return { allowed: false, reason: "Disponible dans un plan supérieur." };
  }

  return { allowed: true };
}
