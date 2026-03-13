/**
 * Admin Audit Log Service — Dual mode:
 * Demo: persisted in localStorage
 * Production: writes to Supabase audit_logs table
 */
import { supabase } from "@/integrations/supabase/client";
import { getAppMode } from "@/stores/authStore";

export interface AuditLogEntry {
  id: string;
  actorAdminName: string;
  actorRole: string;
  actionType: string;
  targetType: string;
  targetId: string;
  summary: string;
  createdAt: string;
}

const STORAGE_KEY = "medicare_admin_audit_logs";

const getStoredLogs = (): AuditLogEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveLogs = (logs: AuditLogEntry[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
};

export const appendLog = (
  actionType: string,
  targetType: string,
  targetId: string,
  summary: string,
  actorAdminName = "Admin",
  actorRole = "superadmin"
): AuditLogEntry => {
  const entry: AuditLogEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    actorAdminName,
    actorRole,
    actionType,
    targetType,
    targetId,
    summary,
    createdAt: new Date().toISOString(),
  };

  // Always store locally for immediate display
  const logs = getStoredLogs();
  logs.unshift(entry);
  saveLogs(logs.slice(0, 500));

  // In production, also write to Supabase
  if (getAppMode() === "production") {
    supabase.from("audit_logs").insert({
      action: actionType,
      entity_type: targetType,
      entity_id: targetId,
      details: { summary } as any,
      user_name: actorAdminName,
    }).then(({ error }) => {
      if (error) console.error("[audit] Supabase write failed:", error);
    });
  }

  return entry;
};

export const getLogs = (filters?: {
  actionType?: string;
  targetType?: string;
  search?: string;
}): AuditLogEntry[] => {
  let logs = getStoredLogs();
  if (filters?.actionType) logs = logs.filter(l => l.actionType === filters.actionType);
  if (filters?.targetType) logs = logs.filter(l => l.targetType === filters.targetType);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    logs = logs.filter(l => l.summary.toLowerCase().includes(q) || l.actorAdminName.toLowerCase().includes(q));
  }
  return logs;
};

export const clearLogs = () => localStorage.removeItem(STORAGE_KEY);
