/**
 * useActionGating — Hook + component for checking if an action/button is enabled by admin.
 * Usage:
 *   const { isEnabled } = useActionGating();
 *   if (!isEnabled("patient.cancel_appointment")) return null;
 *
 * Or use the ActionGate component:
 *   <ActionGate actionId="patient.send_to_pharmacy"><Button>Send</Button></ActionGate>
 *
 * // TODO BACKEND: Replace with server-side permission checks
 */
import { type ReactNode } from "react";
import { useActionGatingStore, actionCatalog } from "@/stores/actionGatingStore";

export function useActionGating() {
  const [states] = useActionGatingStore();

  const isEnabled = (actionId: string): boolean => {
    return states[actionId] !== false;
  };

  return { isEnabled };
}

interface ActionGateProps {
  actionId: string;
  children: ReactNode;
  mode?: "hide" | "disable";
  fallback?: ReactNode;
}

export function ActionGate({ actionId, children, mode = "hide", fallback }: ActionGateProps) {
  const { isEnabled } = useActionGating();

  if (isEnabled(actionId)) {
    return children as React.JSX.Element;
  }

  if (mode === "disable") {
    if (fallback) return fallback as React.JSX.Element;
    const action = actionCatalog.find(a => a.id === actionId);
    return (
      <div
        className="opacity-40 pointer-events-none cursor-not-allowed"
        title={`${action?.label || actionId} — Désactivé par l'administrateur`}
      >
        {children}
      </div>
    );
  }

  return null;
}
