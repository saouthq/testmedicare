/**
 * Admin RDV Supervision — search, stats, cancel override with motif
 * TODO BACKEND: Replace mock data with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, Calendar, XCircle, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";
import MotifDialog from "@/components/admin/MotifDialog";

const initialApts = [
  { id: 1, patientName: "Fatma Trabelsi", doctorName: "Dr. Bouazizi", date: "20 Fév 2026 14:30", type: "presentiel", status: "confirmed", city: "Tunis" },
  { id: 2, patientName: "Ali Ben Salem", doctorName: "Dr. Gharbi", date: "20 Fév 2026 15:00", type: "teleconsultation", status: "confirmed", city: "Ariana" },
  { id: 3, patientName: "Sarra Mejri", doctorName: "Dr. Hammami", date: "21 Fév 2026 09:00", type: "presentiel", status: "pending", city: "Tunis" },
  { id: 4, patientName: "Mohamed Kaabi", doctorName: "Dr. Chebbi", date: "21 Fév 2026 10:30", type: "teleconsultation", status: "cancelled", city: "Sousse" },
  { id: 5, patientName: "Ines Mansour", doctorName: "Dr. Karray", date: "22 Fév 2026 11:00", type: "presentiel", status: "absent", city: "Tunis" },
];

const statusLabels: Record<string, string> = { confirmed: "Confirmé", pending: "En attente", cancelled: "Annulé", absent: "Absent" };
const statusColors: Record<string, string> = { confirmed: "bg-accent/10 text-accent", pending: "bg-warning/10 text-warning", cancelled: "bg-muted text-muted-foreground", absent: "bg-destructive/10 text-destructive" };

const AdminAppointments = () => {
  const [search, setSearch] = useState("");
  const [apts, setApts] = useState(initialApts);
  const [statusFilter, setStatusFilter] = useState("all");
  const [motifAction, setMotifAction] = useState<{ id: number; type: "cancel" | "absent" } | null>(null);

  const filtered = apts.filter(a => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (search && !a.patientName.toLowerCase().includes(search.toLowerCase()) && !a.doctorName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const absentCount = apts.filter(a => a.status === "absent").length;
  const totalCount = apts.length;
  const noShowRate = totalCount > 0 ? Math.round((absentCount / totalCount) * 100) : 0;

  const handleMotifConfirm = (motif: string) => {
    if (!motifAction) return;
    const apt = apts.find(a => a.id === motifAction.id);
    if (!apt) return;

    if (motifAction.type === "cancel") {
      setApts(prev => prev.map(a => a.id === motifAction.id ? { ...a, status: "cancelled" } : a));
      appendLog("appointment_cancelled_override", "appointment", String(motifAction.id), `RDV annulé (admin override) — ${apt.patientName} / ${apt.doctorName} — Motif : ${motif}`);
      toast({ title: "RDV annulé par l'admin" });
    } else {
      setApts(prev => prev.map(a => a.id === motifAction.id ? { ...a, status: "absent" } : a));
      appendLog("appointment_absent_override", "appointment", String(motifAction.id), `Marqué absent (admin) — ${apt.patientName} — Motif : ${motif}`);
      toast({ title: "Marqué absent" });
    }
    setMotifAction(null);
  };

  return (
    <DashboardLayout role="admin" title="Supervision RDV">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-3 text-center">
            <p className="text-lg font-bold text-foreground">{totalCount}</p>
            <p className="text-[11px] text-muted-foreground">Total RDV</p>
          </div>
          <div className="rounded-lg border bg-accent/5 p-3 text-center">
            <p className="text-lg font-bold text-accent">{apts.filter(a => a.status === "confirmed").length}</p>
            <p className="text-[11px] text-muted-foreground">Confirmés</p>
          </div>
          <div className="rounded-lg border bg-destructive/5 p-3 text-center">
            <p className="text-lg font-bold text-destructive">{absentCount}</p>
            <p className="text-[11px] text-muted-foreground">Absents</p>
          </div>
          <div className="rounded-lg border bg-warning/5 p-3 text-center">
            <p className="text-lg font-bold text-warning">{noShowRate}%</p>
            <p className="text-[11px] text-muted-foreground">Taux no-show</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher patient ou médecin..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-lg border bg-card px-3 py-2 text-sm">
            <option value="all">Tous statuts</option>
            {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Patient</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Médecin</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium text-foreground">{a.patientName}</td>
                  <td className="px-4 py-3 text-foreground">{a.doctorName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.date}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${a.type === "teleconsultation" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{a.type === "teleconsultation" ? "Téléconsult" : "Cabinet"}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[a.status]}`}>{statusLabels[a.status]}</span></td>
                  <td className="px-4 py-3 text-right">
                    {(a.status === "confirmed" || a.status === "pending") && (
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => setMotifAction({ id: a.id, type: "cancel" })}>Annuler</Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-warning" onClick={() => setMotifAction({ id: a.id, type: "absent" })}>Absent</Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {motifAction && (
        <MotifDialog
          open={!!motifAction}
          onClose={() => setMotifAction(null)}
          onConfirm={handleMotifConfirm}
          title={motifAction.type === "cancel" ? "Annuler le RDV (override admin)" : "Marquer absent (override admin)"}
          description="Cette action sera enregistrée dans les audit logs."
          confirmLabel={motifAction.type === "cancel" ? "Annuler le RDV" : "Marquer absent"}
          destructive
        />
      )}
    </DashboardLayout>
  );
};

export default AdminAppointments;
