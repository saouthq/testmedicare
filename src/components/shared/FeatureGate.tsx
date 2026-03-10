/**
 * FeatureGate — Wraps children with an upgrade overlay if feature is not enabled.
 * Integrates with: plan entitlements, system feature flags, subscription status.
 * Supports: blur, hide, banner modes + blocked subscription message.
 */
import { Crown, Lock, Zap, AlertTriangle, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useFeatureGating } from "@/hooks/useFeatureGating";
import { featureCatalog, plansByActivity } from "@/stores/featureMatrixStore";
import { isFeatureFlagEnabled } from "@/stores/entitlementStore";
import type { ReactNode } from "react";

interface FeatureGateProps {
  featureId: string;
  children: ReactNode;
  /** "blur" shows content behind blurred overlay, "hide" renders nothing, "banner" shows inline banner */
  mode?: "blur" | "hide" | "banner";
}

export function FeatureGate({ featureId, children, mode = "blur" }: FeatureGateProps) {
  const { can, plan, activity, getUpgradePlan, getUpgradePrice, isBlocked, blockReason, canWithReason } = useFeatureGating();

  // System feature flag check
  const flagEnabled = isFeatureFlagEnabled(featureId);

  // If feature is fully available, render children
  if (can(featureId) && flagEnabled && !isBlocked) return <>{children}</>;

  const feature = featureCatalog.find(f => f.id === featureId);
  const upgradePlan = getUpgradePlan(featureId);
  const upgradePrice = getUpgradePrice(featureId);
  const upgradePlanLabel = upgradePlan
    ? plansByActivity[activity]?.find(p => p.id === upgradePlan)?.label || upgradePlan
    : "Pro";

  // Determine the blocking reason
  const isSystemDisabled = !flagEnabled;
  const { reason } = canWithReason(featureId);

  if (mode === "hide") return null;

  // System-disabled banner
  if (isSystemDisabled) {
    if (mode === "banner") {
      return (
        <div className="rounded-xl border border-warning/20 bg-warning/5 p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-6 w-6 text-warning" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{feature?.label || featureId}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Cette fonctionnalité est temporairement indisponible.</p>
          </div>
        </div>
      );
    }
    return (
      <div className="relative">
        <div className="blur-[3px] pointer-events-none select-none opacity-40">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px] z-10">
          <div className="rounded-2xl border bg-card shadow-elevated p-6 mx-4 max-w-sm text-center animate-fade-in">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-warning/10 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Temporairement indisponible</h3>
            <p className="text-sm text-muted-foreground mt-2">{feature?.label || "Cette fonctionnalité"} est en maintenance. Réessayez plus tard.</p>
          </div>
        </div>
      </div>
    );
  }

  // Subscription blocked (impayé, suspendu, expiré)
  if (isBlocked) {
    if (mode === "banner") {
      return (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
            <Ban className="h-6 w-6 text-destructive" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Accès restreint</p>
            <p className="text-xs text-muted-foreground mt-0.5">{blockReason}</p>
          </div>
          <Link to="/dashboard/doctor/billing">
            <Button size="sm" variant="outline" className="text-destructive border-destructive/30 shrink-0">Régulariser</Button>
          </Link>
        </div>
      );
    }
    return (
      <div className="relative">
        <div className="blur-[3px] pointer-events-none select-none opacity-40">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px] z-10">
          <div className="rounded-2xl border border-destructive/20 bg-card shadow-elevated p-6 mx-4 max-w-sm text-center animate-fade-in">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
              <Ban className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Accès restreint</h3>
            <p className="text-sm text-muted-foreground mt-2">{blockReason}</p>
            <Link to="/dashboard/doctor/billing">
              <Button className="w-full mt-4 bg-destructive text-destructive-foreground hover:bg-destructive/90">Régulariser mon abonnement</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Plan upgrade needed
  if (mode === "banner") {
    return (
      <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 p-5 flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-primary-glow">
          <Crown className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{feature?.label || featureId}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{reason || feature?.description || "Disponible avec un plan supérieur."}</p>
        </div>
        <Link to="/dashboard/doctor/billing">
          <Button size="sm" className="gradient-primary text-primary-foreground shadow-primary-glow shrink-0">
            <Zap className="h-3.5 w-3.5 mr-1" />
            {upgradePlanLabel} · {upgradePrice || "—"} DT/mois
          </Button>
        </Link>
      </div>
    );
  }

  // Blur mode (default)
  return (
    <div className="relative">
      <div className="blur-[3px] pointer-events-none select-none opacity-60">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[1px] z-10">
        <div className="rounded-2xl border bg-card shadow-elevated p-6 mx-4 max-w-sm text-center animate-fade-in">
          <div className="mx-auto h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center mb-4 shadow-primary-glow">
            <Lock className="h-6 w-6 text-primary-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground">{feature?.label || "Fonctionnalité Premium"}</h3>
          <p className="text-sm text-muted-foreground mt-2">{reason || feature?.description || "Cette fonctionnalité nécessite un plan supérieur."}</p>
          <Link to="/dashboard/doctor/billing">
            <Button className="w-full mt-4 gradient-primary text-primary-foreground shadow-primary-glow">
              <Zap className="h-4 w-4 mr-2" />
              Passer au {upgradePlanLabel} · {upgradePrice || "—"} DT/mois
            </Button>
          </Link>
          <p className="text-[10px] text-muted-foreground mt-2">Essai gratuit 14 jours · Sans engagement</p>
        </div>
      </div>
    </div>
  );
}

export default FeatureGate;
