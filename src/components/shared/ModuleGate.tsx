/**
 * ModuleGate — Renders children only if the specified module is enabled.
 * If disabled, shows a maintenance/disabled screen.
 * Used to wrap entire pages or sections.
 */
import { useLocation } from "react-router-dom";
import { useAdminModules, platformModules } from "@/stores/adminModulesStore";
import { AlertTriangle, ArrowLeft, Settings, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface ModuleGateProps {
  /** Module ID to check */
  moduleId: string;
  children: ReactNode;
  /** Optional: role of the current user (for redirect) */
  role?: string;
}

export function ModuleGate({ moduleId, children, role }: ModuleGateProps) {
  const [states] = useAdminModules();
  const isEnabled = states[moduleId] !== false;

  if (isEnabled) return <>{children}</>;

  const mod = platformModules.find(m => m.id === moduleId);

  return <ModuleDisabledScreen moduleName={mod?.label || moduleId} description={mod?.description} role={role} />;
}

/**
 * RouteModuleGate — Automatically checks if the current route is in a disabled module.
 * Wrap page content with this for automatic gating.
 */
export function RouteModuleGate({ children, role }: { children: ReactNode; role?: string }) {
  const location = useLocation();
  const [states] = useAdminModules();

  for (const mod of platformModules) {
    if (states[mod.id] === false) {
      for (const prefix of mod.routePrefixes) {
        if (location.pathname.startsWith(prefix) || location.pathname === prefix) {
          return <ModuleDisabledScreen moduleName={mod.label} description={mod.description} role={role} />;
        }
      }
    }
  }

  return <>{children}</>;
}

function ModuleDisabledScreen({ moduleName, description, role }: { moduleName: string; description?: string; role?: string }) {
  const dashboardUrl = role ? `/dashboard/${role}` : "/";

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
          <ShieldOff className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Module désactivé</h2>
        <p className="text-muted-foreground mb-1">
          Le module <span className="font-semibold text-foreground">« {moduleName} »</span> est actuellement désactivé par l'administrateur.
        </p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 mb-6">{description}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-2 justify-center mt-6">
          <Link to={dashboardUrl}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1.5" />Retour au tableau de bord
            </Button>
          </Link>
        </div>
        <div className="mt-8 rounded-xl border border-warning/30 bg-warning/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">Maintenance en cours</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ce module a été temporairement désactivé. Veuillez contacter l'administrateur pour plus d'informations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModuleGate;
