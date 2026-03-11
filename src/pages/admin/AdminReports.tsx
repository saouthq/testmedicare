/**
 * AdminReports — Rapports planifiés et exports
 * // TODO BACKEND: Générer et stocker les exports CSV/PDF
 */
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { FileDown, Clock, Calendar, Play, Pause, Download, FileText, Users, Banknote, BarChart3, Stethoscope } from "lucide-react";

interface ReportDef {
  id: string;
  name: string;
  description: string;
  icon: any;
  frequency: "daily" | "weekly" | "monthly" | "manual";
  format: "csv" | "pdf" | "xlsx";
  active: boolean;
  lastGenerated: string;
  nextRun: string;
}

interface ExportHistory {
  id: string;
  reportName: string;
  generatedAt: string;
  format: string;
  size: string;
  status: "ready" | "generating" | "failed";
}

const initialReports: ReportDef[] = [
  { id: "1", name: "Utilisateurs inscrits", description: "Liste complète des utilisateurs avec rôle, statut et date d'inscription", icon: Users, frequency: "weekly", format: "csv", active: true, lastGenerated: "10 Mar 2026", nextRun: "17 Mar 2026" },
  { id: "2", name: "Revenus mensuels", description: "Détail des paiements, abonnements et transactions par période", icon: Banknote, frequency: "monthly", format: "xlsx", active: true, lastGenerated: "1 Mar 2026", nextRun: "1 Avr 2026" },
  { id: "3", name: "Rendez-vous", description: "Statistiques RDV par médecin, spécialité et statut", icon: Calendar, frequency: "weekly", format: "csv", active: true, lastGenerated: "10 Mar 2026", nextRun: "17 Mar 2026" },
  { id: "4", name: "Performance praticiens", description: "NPS, taux d'annulation, temps d'attente moyen par praticien", icon: Stethoscope, frequency: "monthly", format: "pdf", active: false, lastGenerated: "1 Fév 2026", nextRun: "—" },
  { id: "5", name: "Conformité RGPD", description: "Demandes de suppression, exports de données, consentements", icon: FileText, frequency: "monthly", format: "pdf", active: true, lastGenerated: "1 Mar 2026", nextRun: "1 Avr 2026" },
  { id: "6", name: "KPIs plateforme", description: "Dashboard consolidé : MAU, rétention, conversion, churn", icon: BarChart3, frequency: "daily", format: "csv", active: true, lastGenerated: "11 Mar 2026", nextRun: "12 Mar 2026" },
];

const initialHistory: ExportHistory[] = [
  { id: "1", reportName: "KPIs plateforme", generatedAt: "11 Mar 2026 08:00", format: "CSV", size: "245 Ko", status: "ready" },
  { id: "2", reportName: "Utilisateurs inscrits", generatedAt: "10 Mar 2026 06:00", format: "CSV", size: "1.2 Mo", status: "ready" },
  { id: "3", reportName: "Rendez-vous", generatedAt: "10 Mar 2026 06:00", format: "CSV", size: "890 Ko", status: "ready" },
  { id: "4", reportName: "Revenus mensuels", generatedAt: "1 Mar 2026 07:00", format: "XLSX", size: "2.1 Mo", status: "ready" },
  { id: "5", reportName: "Conformité RGPD", generatedAt: "1 Mar 2026 07:30", format: "PDF", size: "540 Ko", status: "ready" },
  { id: "6", reportName: "KPIs plateforme", generatedAt: "10 Mar 2026 08:00", format: "CSV", size: "—", status: "failed" },
];

const freqLabels: Record<string, string> = { daily: "Quotidien", weekly: "Hebdomadaire", monthly: "Mensuel", manual: "Manuel" };

const AdminReports = () => {
  const [reports, setReports] = useState(initialReports);
  const [history] = useState(initialHistory);

  const toggleReport = (id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
    toast.success("Planification mise à jour");
  };

  const changeFrequency = (id: string, freq: ReportDef["frequency"]) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, frequency: freq } : r));
    toast.success("Fréquence mise à jour");
  };

  const runNow = (name: string) => {
    toast.success(`Génération de "${name}" lancée`, { description: "Le rapport sera disponible dans quelques secondes." });
  };

  return (
    <DashboardLayout role="admin" title="Rapports & Exports">
      {/* KPIs */}
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

      {/* Reports configuration */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Rapports planifiés</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {reports.map(r => {
            const Icon = r.icon;
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

      {/* Export history */}
      <Card>
        <CardHeader><CardTitle className="text-base">Historique des exports</CardTitle></CardHeader>
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
                      <Button size="sm" variant="ghost" className="text-xs" onClick={() => toast.success("Téléchargement…")}>
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
