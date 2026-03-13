/**
 * adminConfigSync.ts — Shared utility for syncing admin config stores to Supabase.
 * Uses the admin_config key-value table for all admin-level configuration.
 */
import { supabase } from "@/integrations/supabase/client";
import { getAppMode } from "./authStore";

/**
 * Save a config value to the admin_config table.
 */
export async function saveAdminConfig(key: string, value: any) {
  if (getAppMode() !== "production") return;
  try {
    await (supabase.from as any)("admin_config").upsert(
      { key, value, updated_by: "admin", updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );
  } catch (e) {
    console.warn(`[saveAdminConfig] Failed for key "${key}":`, e);
  }
}

/**
 * Load a config value from the admin_config table.
 * Returns null if not found or not in production mode.
 */
export async function loadAdminConfig<T>(key: string): Promise<T | null> {
  if (getAppMode() !== "production") return null;
  try {
    const { data, error } = await (supabase.from as any)("admin_config")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error || !data) return null;
    return data.value as T;
  } catch {
    return null;
  }
}
