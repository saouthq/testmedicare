/**
 * appConfig.ts — Centralized application configuration.
 * Controls Demo vs Production mode via:
 *   1. VITE_APP_MODE env var (build-time default)
 *   2. SimulationPanel runtime override (localStorage)
 *
 * Usage:
 *   import { getAppMode, isProduction, isDemo } from "@/lib/appConfig";
 */
import { getAppMode as getStoredMode, setAppMode, type AppMode } from "@/stores/authStore";

/**
 * Resolve the effective app mode:
 * 1. If localStorage has an explicit override → use it
 * 2. Else fall back to VITE_APP_MODE env var
 * 3. Default: "demo"
 */
export function getAppMode(): AppMode {
  const stored = getStoredMode();
  // If user explicitly set mode via SimulationPanel, respect it
  if (stored) return stored;

  const envMode = import.meta.env.VITE_APP_MODE as string | undefined;
  if (envMode === "production") return "production";
  return "demo";
}

export function isProduction(): boolean {
  return getAppMode() === "production";
}

export function isDemo(): boolean {
  return getAppMode() === "demo";
}

// Re-export for convenience
export { setAppMode };
export type { AppMode };
