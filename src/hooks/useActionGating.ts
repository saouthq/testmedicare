/**
 * useActionGating — Hook + component for checking if an action/button is enabled by admin.
 * Usage:
 *   const { isEnabled } = useActionGating();
 *   if (!isEnabled("patient.cancel_appointment")) return null;
 *
 * Or use the <ActionGate> component:
 *   <ActionGate actionId="patient.send_to_pharmacy">
 *     <Button>Envoyer à la pharmacie</Button>
 *   </ActionGate>
 *
 * // TODO BACKEND: Replace with server-side permission checks
 */
import { type ReactNode } from "react";
import { isActionEnabled, useActionGatingStore, actionCatalog } from "@/stores/actionGatingStore";

export function useActionGating() {
  // Subscribe to store changes so components re-render when admin toggles actions
  const [states] = useActionGatingStore();

  const isEnabled = (actionId: string): boolean => {
    return states[actionId] !== false;
  };

  return { isEnabled };
}

/**
 * ActionGate — Renders children only if the action is enabled.
 * Optionally shows a disabled state instead of hiding.
 */
interface ActionGateProps {
  actionId: string;
  children: ReactNode;
  /** "hide" = render nothing, "disable" = render greyed out with tooltip */
  mode?: "hide" | "disable";
  /** Fallback to render when disabled (only for "disable" mode) */
  fallback?: ReactNode;
}

export function ActionGate({ actionId, children, mode = "hide", fallback }: ActionGateProps) {
  const { isEnabled } = useActionGating();

  if (isEnabled(actionId)) {
    return <>{children}</>;
  }

  if (mode === "disable") {
    if (fallback) return <>{fallback}</>;
    const action = actionCatalog.find(a => a.id === actionId);
    return (
      <div className="opacity-40 pointer-events-none cursor-not-allowed" title={`${action?.label || actionId} — Désactivé par l'administrateur`}>
        {children}
      </div>
    );
  }

  return null;
}
