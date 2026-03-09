/**
 * Admin Moderation — No star ratings, text reports only, motif-required actions
 * TODO BACKEND: Replace with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { AlertTriangle, Flag, CheckCircle, XCircle, ChevronDown, User, Shield, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockAdminReports } from "@/data/mockData";
import MotifDialog from "@/components/admin/MotifDialog";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";

type ModerationFilter = "all" | "pending" | "resolved" | "rejected";

const priorityColors: Record<string, string> = { high: "bg-destructive/10 text-destructive", medium: "bg-warning/10 text-warning", low: "bg-muted text-muted-foreground" };
const priorityLabels: Record<string, string> = { high: "Urgent", medium: "Moyen", low: "Faible" };
const statusColors: Record<string, string> = { pending: "bg-warning/10 text-warning", resolved: "bg-accent/10 text-accent", rejected: "bg-muted text-muted-foreground" };
const statusLabels: Record<string, string> = { pending: "En attente", resolved: "Résolu", rejected: "Rejeté" };
const typeIcons: Record<string, string> = { profil: "👤", comportement: "⚠️", contenu: "📷" };

type MotifAction = { id: number; type: "resolve" | "reject" | "suspend" } | null;

const AdminModeration = () => {
  const [filter, setFilter] = useState<ModerationFilter>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [reports, setReports] = useState(mockAdminReports);
  const [motifAction, setMotifAction] = useState<MotifAction>(null);

  const filtered = reports.filter(r => {
    if (filter === "pending") return r.status === "pending";
    if (filter === "resolved") return r.status === "resolved";
    if (filter === "rejected") return r.status === "rejected";
    return true;
  });

  const handleMotifConfirm = (motif: string) => {
    if (!motifAction) return;
    const r = reports.find(x => x.id === motifAction.id);
    if (!r) return;

    if (motifAction.type === "resolve") {
      setReports(prev => prev.map(x => x.id === motifAction.id ? { ...x, status: "resolved" } : x));
      appendLog("report_resolved", "moderation", String(motifAction.id), `Signalement résolu — ${r.reason} — Motif : ${motif}`);
      toast({ title: "Signalement résolu" });
    } else if (motifAction.type === "reject") {
      setReports(prev => prev.map(x => x.id === motifAction.id ? { ...x, status: "rejected" } : x));
      appendLog("report_rejected", "moderation", String(motifAction.id), `Signalement rejeté — ${r.reason} — Motif : ${motif}`);
      toast({ title: "Signalement rejeté" });
    } else {
      setReports(prev => prev.map(x => x.id === motifAction.id ? { ...x, status: "resolved" } : x));
      appendLog("user_suspended_via_report", "moderation", String(motifAction.id), `Compte suspendu suite signalement — ${r.target} — Motif : ${motif}`);
      toast({ title: "Compte suspendu" });
    }
    setMotifAction(null);
    setExpandedId(null);
  };

  const pendingCount = reports.filter(r => r.status === "pending").length;

  const motifConfig: Record<string, { title: string; label: string; destructive: boolean }> = {
    resolve: { title: "Résoudre le signalement", label: "Résoudre", destructive: false },
    reject: { title: "Rejeter le signalement", label: "Rejeter", destructive: false },
    suspend: { title: "Suspendre le compte", label: "Suspendre", destructive: true },
  };

  return (
    <DashboardLayout role="admin" title="Modération & Signalements">
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <Flag className="h-5 w-5 text-warning" />
            <p className="mt-3 text-2xl font-bold text-foreground">{reports.length}</p>
            <p className="text-xs text-muted-foreground">Signalements total</p>
          </div>
          <div className="rounded-xl border bg-destructive/5 p-5 shadow-card">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p className="mt-3 text-2xl font-bold text-destructive">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">En attente</p>
          </div>
          <div className="rounded-xl border bg-accent/5 p-5 shadow-card">
            <CheckCircle className="h-5 w-5 text-accent" />
            <p className="mt-3 text-2xl font-bold text-accent">{reports.filter(r => r.status === "resolved").length}</p>
            <p className="text-xs text-muted-foreground">Résolus</p>
          </div>
        </div>

        <div className="flex gap-1 rounded-lg border bg-card p-0.5 w-fit">
          {([
            { key: "all" as ModerationFilter, label: "Tous", count: reports.length },
            { key: "pending" as ModerationFilter, label: "En attente", count: pendingCount },
            { key: "resolved" as ModerationFilter, label: "Résolus", count: reports.filter(r => r.status === "resolved").length },
            { key: "rejected" as ModerationFilter, label: "Rejetés", count: reports.filter(r => r.status === "rejected").length },
          ]).map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Flag className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aucun signalement</p>
            </div>
          )}
          {filtered.map(r => (
            <div key={r.id} className={`rounded-xl border bg-card shadow-card overflow-hidden ${r.status === "pending" && r.priority === "high" ? "border-destructive/30" : ""}`}>
              <div className="p-4 cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}>
                <div className="flex items-start gap-4">
                  <div className={`mt-1 p-2 rounded-lg ${r.priority === "high" ? "bg-destructive/10" : r.priority === "medium" ? "bg-warning/10" : "bg-muted"}`}>
                    <span className="text-lg">{typeIcons[r.type] || "🚩"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-foreground text-sm">{r.reason}</h4>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityColors[r.priority]}`}>{priorityLabels[r.priority]}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[r.status]}`}>{statusLabels[r.status]}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{r.reporter}</span>
                      <span>→ {r.target}</span>
                      <span>{r.date}</span>
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${expandedId === r.id ? "rotate-180" : ""}`} />
                </div>
              </div>
              {expandedId === r.id && (
                <div className="border-t px-4 py-4 bg-muted/10 space-y-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Détails</p>
                    <p className="text-sm text-foreground">{r.details}</p>
                  </div>
                  {r.status === "pending" && (
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => setMotifAction({ id: r.id, type: "resolve" })}>
                        <CheckCircle className="h-4 w-4 mr-1" />Résoudre
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setMotifAction({ id: r.id, type: "reject" })}>
                        <XCircle className="h-4 w-4 mr-1" />Rejeter
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive border-destructive/30" onClick={() => setMotifAction({ id: r.id, type: "suspend" })}>
                        <Ban className="h-4 w-4 mr-1" />Suspendre le compte
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {motifAction && (
        <MotifDialog
          open={!!motifAction}
          onClose={() => setMotifAction(null)}
          onConfirm={handleMotifConfirm}
          title={motifConfig[motifAction.type].title}
          confirmLabel={motifConfig[motifAction.type].label}
          destructive={motifConfig[motifAction.type].destructive}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminModeration;
