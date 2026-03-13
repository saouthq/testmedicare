/**
 * appConfig.ts — Centralized application configuration.
 * Controls Demo vs Production mode via:
 *   1. VITE_APP_MODE env var (build-time source of truth)
 *   2. SimulationPanel runtime override (localStorage, only in non-production builds)
 *
 * Usage:
 *   import { getAppMode, isProduction, isDemo } from "@/lib/appConfig";
 */
import { getAppMode as getStoredMode, setAppMode, type AppMode } from "@/stores/authStore";

/**
 * Resolve the effective app mode:
 * 1. If VITE_APP_MODE is "production" → always production (no override allowed)
 * 2. If localStorage has an explicit override → use it (dev/staging only)
 * 3. Default: "demo"
 */
export function getAppMode(): AppMode {
  const envMode = import.meta.env.VITE_APP_MODE as string | undefined;
  
  // In production builds, VITE_APP_MODE is the absolute source of truth
  if (envMode === "production") return "production";

  // In non-production builds, allow SimulationPanel override
  const stored = getStoredMode();
  if (stored) return stored;

  return "demo";
}

export function isProduction(): boolean {
  return getAppMode() === "production";
}

export function isDemo(): boolean {
  return getAppMode() === "demo";
}

/** Whether the SimulationPanel should be visible */
export function showSimulationPanel(): boolean {
  // Never show in production builds
  return import.meta.env.VITE_APP_MODE !== "production";
}

// Re-export for convenience
export { setAppMode };
export type { AppMode };
