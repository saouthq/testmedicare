/**
 * reportsStore.ts — Cross-role reports and disputes store.
 * Feeds: AdminModeration, AdminDisputes, ReportButton
 *
 * // TODO BACKEND: Replace with POST/GET /api/reports
 */
import { createStore } from "./crossRoleStore";
import { useDemoOnlyStore } from "@/hooks/useDualData";
import { appendLog } from "@/services/admin/adminAuditService";

export type ReportStatus = "pending" | "investigating" | "resolved" | "archived";
export type ReportType = "dispute" | "comment" | "doctor" | "patient" | "appointment" | "other";

export interface Report {
  id: string;
  type: ReportType;
  targetId: string;
  targetName: string;
  reason: string;
  details: string;
  reporter: string;
  reporterRole: string;
  createdAt: string;
  status: ReportStatus;
  resolution?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

const SEED_REPORTS: Report[] = [
  {
    id: "report-seed-1", type: "dispute", targetId: "apt-045", targetName: "RDV Dr. Bouazizi — 4 mars",
    reason: "Consultation non réalisée", details: "Le médecin n'était pas présent lors du RDV.",
    reporter: "Sami Ayari", reporterRole: "patient", createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), status: "pending",
  },
  {
    id: "report-seed-2", type: "comment", targetId: "review-1", targetName: "Avis sur Dr. Gharbi",
    reason: "Faux avis", details: "Cet avis semble être un spam commercial.",
    reporter: "Amine Ben Ali", reporterRole: "patient", createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), status: "investigating",
  },
  {
    id: "report-seed-3", type: "appointment", targetId: "apt-046", targetName: "RDV Dr. Gharbi — 5 mars",
    reason: "Retard excessif", details: "Attente de plus de 2h sans prévenir.",
    reporter: "Rania Meddeb", reporterRole: "patient", createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), status: "resolved",
    resolution: "Excuses du cabinet et crédit de consultation offert.", resolvedAt: new Date(Date.now() - 86400000).toISOString(), resolvedBy: "Admin",
  },
];

const store = createStore<Report[]>("medicare_reports", SEED_REPORTS);

export const reportsStore = store;

export function useReports() {
  return useStore(store);
}

/** Submit a new report */
export function submitReport(data: Omit<Report, "id" | "createdAt" | "status">): string {
  // TODO BACKEND: POST /api/reports
  const id = `report-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const report: Report = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  store.set(prev => [report, ...prev]);
  appendLog("report_created", "report", id, `Signalement: ${data.reason} sur ${data.targetName}`);
  return id;
}

/** Update report status (admin action) */
export function updateReportStatus(id: string, status: ReportStatus, resolution?: string) {
  // TODO BACKEND: PATCH /api/reports/:id
  store.set(prev => prev.map(r => r.id === id ? {
    ...r,
    status,
    resolution: resolution || r.resolution,
    resolvedAt: ["resolved", "archived"].includes(status) ? new Date().toISOString() : r.resolvedAt,
    resolvedBy: "Admin",
  } : r));
  appendLog(`report_${status}`, "report", id, `Signalement ${status}${resolution ? `: ${resolution}` : ""}`);
}

/** Get reports filtered by status */
export function getReportsByStatus(reports: Report[], status?: ReportStatus): Report[] {
  if (!status) return reports;
  return reports.filter(r => r.status === status);
}

/** Get report counts by status */
export function getReportCounts(reports: Report[]) {
  return {
    pending: reports.filter(r => r.status === "pending").length,
    investigating: reports.filter(r => r.status === "investigating").length,
    resolved: reports.filter(r => r.status === "resolved").length,
    archived: reports.filter(r => r.status === "archived").length,
    total: reports.length,
  };
}

/** Seed reports if empty */
export function seedReportsIfEmpty() {
  if (store.read().length > 0) return;
  store.set(SEED_REPORTS);
}
