/**
 * AdminReports — Rapports planifiés et exports
 * Report definitions persisted in localStorage
 */
import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { appendLog } from "@/services/admin/adminAuditService";
import { FileDown, Clock, Calendar, Play, Pause, Download, FileText, Users, Banknote, BarChart3, Stethoscope, AlertTriangle, Info } from "lucide-react";
import { useAdminStore } from "@/stores/adminStore";

const STORAGE_KEY = "medicare_admin_reports";

interface ReportDef {
  id: string; name: string; description: string; iconName: string;
  frequency: "daily" | "weekly" | "monthly" | "manual";
  format: "csv" | "pdf" | "xlsx"; active: boolean;
  lastGenerated: string; nextRun: string;
}

interface ExportHistory {
  id: string; reportName: string; generatedAt: string; format: string; size: string; status: "ready" | "generating" | "failed";
}

const defaultReports: ReportDef[] = [
  { id: "1", name: "Utilisateurs inscrits", description: "Liste complète des utilisateurs avec rôle, statut et date d'inscription", iconName: "Users", frequency: "weekly", format: "csv", active: true, lastGenerated: "10 Mar 2026", nextRun: "17 Mar 2026" },
  { id: "2", name: "Revenus mensuels", description: "Détail des paiements, abonnements et transactions par période", iconName: "Banknote", frequency: "monthly", format: "xlsx", active: true, lastGenerated: "1 Mar 2026", nextRun: "1 Avr 2026" },
  { id: "3", name: "Rendez-vous", description: "Statistiques RDV par médecin, spécialité et statut", iconName: "Calendar", frequency: "weekly", format: "csv", active: true, lastGenerated: "10 Mar 2026", nextRun: "17 Mar 2026" },
  { id: "4", name: "Performance praticiens", description: "NPS, taux d'annulation, temps d'attente moyen par praticien", iconName: "Stethoscope", frequency: "monthly", format: "pdf", active: false, lastGenerated: "1 Fév 2026", nextRun: "—" },
  { id: "5", name: "Conformité RGPD", description: "Demandes de suppression, exports de données, consentements", iconName: "FileText", frequency: "monthly", format: "pdf", active: true, lastGenerated: "1 Mar 2026", nextRun: "1 Avr 2026" },
  { id: "6", name: "KPIs plateforme", description: "Dashboard consolidé : MAU, rétention, conversion, churn", iconName: "BarChart3", frequency: "daily", format: "csv", active: true, lastGenerated: "11 Mar 2026", nextRun: "12 Mar 2026" },
];

const iconMap: Record<string, any> = { Users, Banknote, Calendar, Stethoscope, FileText, BarChart3 };
const freqLabels: Record<string, string> = { daily: "Quotidien", weekly: "Hebdomadaire", monthly: "Mensuel", manual: "Manuel" };

const loadReports = (): ReportDef[] => {
  try { const stored = localStorage.getItem(STORAGE_KEY); if (stored) return JSON.parse(stored); } catch {}
  return defaultReports;
};
const saveReports = (reports: ReportDef[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));

const AdminReports = () => {
  const [state] = useAdminStore();
  const [reports, setReports] = useState(loadReports);
  const [history] = useState<ExportHistory[]>([
    { id: "1", reportName: "KPIs plateforme", generatedAt: "11 Mar 2026 08:00", format: "CSV", size: "245 Ko", status: "ready" },
    { id: "2", reportName: "Utilisateurs inscrits", generatedAt: "10 Mar 2026 06:00", format: "CSV", size: "1.2 Mo", status: "ready" },
    { id: "3", reportName: "Rendez-vous", generatedAt: "10 Mar 2026 06:00", format: "CSV", size: "890 Ko", status: "ready" },
    { id: "4", reportName: "Revenus mensuels", generatedAt: "1 Mar 2026 07:00", format: "XLSX", size: "2.1 Mo", status: "ready" },
    { id: "5", reportName: "Conformité RGPD", generatedAt: "1 Mar 2026 07:30", format: "PDF", size: "540 Ko", status: "ready" },
    { id: "6", reportName: "KPIs plateforme", generatedAt: "10 Mar 2026 08:00", format: "CSV", size: "—", status: "failed" },
  ]);

  const updateReports = useCallback((updater: (prev: ReportDef[]) => ReportDef[]) => {
    setReports(prev => { const next = updater(prev); saveReports(next); return next; });
  }, []);

  const toggleReport = (id: string) => {
    updateReports(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
    appendLog("report_toggled", "reports", id, `Planification rapport ${id} modifiée`);
    toast({ title: "Planification mise à jour" });
  };

  const changeFrequency = (id: string, freq: ReportDef["frequency"]) => {
    updateReports(prev => prev.map(r => r.id === id ? { ...r, frequency: freq } : r));
    appendLog("report_frequency_changed", "reports", id, `Fréquence rapport modifiée → ${freq}`);
    toast({ title: "Fréquence mise à jour" });
  };

  const runNow = (report: ReportDef) => {
    // Generate real CSV from admin store
    let csv = "";
    const now = new Date().toLocaleDateString("fr-TN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    
    if (report.iconName === "Users") {
      csv = "Nom,Email,Rôle,Statut,Inscription\n" + state.users.map(u => `"${u.name}","${u.email}","${u.role}","${u.status}","${u.joined}"`).join("\n");
    } else if (report.iconName === "Banknote") {
      csv = "Payeur,Montant,Devise,Statut,Type,Date\n" + state.payments.map(p => `"${p.payerName}","${p.amount}","${p.currency}","${p.status}","${p.type}","${p.createdAt}"`).join("\n");
    } else if (report.iconName === "Calendar") {
      csv = "ID,Statut,Date\n" + `Total: ${state.users.length} utilisateurs`;
    } else if (report.iconName === "Stethoscope") {
      csv = "Médecin,Abonnement,Statut\n" + state.users.filter(u => u.role === "doctor").map(u => `"${u.name}","${u.subscription}","${u.status}"`).join("\n");
    } else if (report.iconName === "FileText") {
      csv = "Demande,Utilisateur,Email,Type,Statut,Date\n" + state.dataRequests.map(r => `"${r.id}","${r.userName}","${r.userEmail}","${r.type}","${r.status}","${r.createdAt}"`).join("\n");
    } else {
      csv = "Métrique,Valeur\n" + `Utilisateurs,${state.users.length}\nAbonnements actifs,${state.subscriptions.filter(s => s.status === "active").length}\nMRR,${state.subscriptions.filter(s => s.status === "active").reduce((s, sub) => s + sub.monthlyPrice, 0)} DT`;
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${report.name.replace(/\s/g, "_").toLowerCase()}_${new Date().toISOString().split("T")[0]}.${report.format}`; a.click();
    URL.revokeObjectURL(url);

    updateReports(prev => prev.map(r => r.id === report.id ? { ...r, lastGenerated: now } : r));
    appendLog("report_generated", "reports", report.id, `Rapport "${report.name}" généré et téléchargé`);
    toast({ title: `Rapport "${report.name}" téléchargé`, description: `Format ${report.format.toUpperCase()}` });
  };

  return (
    <DashboardLayout role="admin" title="Rapports & Exports">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><FileDown className="h-5 w-5 text-primary" /></div>
          <div><p className="text-2xl font-bold text-foreground">{reports.length}</p><p className="text-xs text-muted-foreground">Rapports configurés</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center"><Play className="h-5 w-5 text-accent-foreground" /></div>
          <div><p className="text-2xl font-bold text-foreground">{reports.filter(r => r.active).length}</p><p className="text-xs text-muted-foreground">Planifications actives</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center"><Clock className="h-5 w-5 text-warning" /></div>
          <div><p className="text-2xl font-bold text-foreground">{history.filter(h => h.status === "ready").length}</p><p className="text-xs text-muted-foreground">Exports disponibles</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center"><FileText className="h-5 w-5 text-destructive" /></div>
          <div><p className="text-2xl font-bold text-foreground">{history.filter(h => h.status === "failed").length}</p><p className="text-xs text-muted-foreground">Échecs</p></div>
        </CardContent></Card>
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Rapports planifiés</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {reports.map(r => {
            const Icon = iconMap[r.iconName] || FileText;
            return (
              <div key={r.id} className={`flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border p-4 ${!r.active ? "opacity-50" : ""}`}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Icon className="h-4 w-4 text-primary" /></div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{r.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px]">{r.format.toUpperCase()}</Badge>
                      <span className="text-[10px] text-muted-foreground">Dernier : {r.lastGenerated}</span>
                      {r.active && <span className="text-[10px] text-muted-foreground">Prochain : {r.nextRun}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Select value={r.frequency} onValueChange={v => changeFrequency(r.id, v as ReportDef["frequency"])}>
                    <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(freqLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => runNow(r.name)}>
                    <Play className="h-3 w-3 mr-1" />Lancer
                  </Button>
                  <Switch checked={r.active} onCheckedChange={() => toggleReport(r.id)} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Historique des exports</CardTitle>
            <Badge variant="outline" className="text-xs text-muted-foreground"><Info className="h-3 w-3 mr-1" />Historique en mémoire</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Rapport</TableHead><TableHead>Date</TableHead><TableHead>Format</TableHead>
              <TableHead>Taille</TableHead><TableHead>Statut</TableHead><TableHead />
            </TableRow></TableHeader>
            <TableBody>
              {history.map(h => (
                <TableRow key={h.id}>
                  <TableCell className="font-medium text-sm">{h.reportName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{h.generatedAt}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{h.format}</Badge></TableCell>
                  <TableCell className="text-xs">{h.size}</TableCell>
                  <TableCell>
                    <Badge variant={h.status === "ready" ? "default" : h.status === "generating" ? "secondary" : "destructive"} className="text-[10px]">
                      {h.status === "ready" ? "Prêt" : h.status === "generating" ? "En cours" : "Échoué"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {h.status === "ready" && (
                      <Button size="sm" variant="ghost" className="text-xs" onClick={() => toast({ title: "Export non disponible", description: "Nécessite backend" })}>
                        <Download className="h-3.5 w-3.5 mr-1" />Télécharger
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AdminReports;
