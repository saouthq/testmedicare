/**
 * Laboratory Dashboard — KPIs + today's demands to process
 * Demand-driven model: lab receives demands from doctors only.
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import {
  FlaskConical, Clock, CheckCircle2, Send, Activity,
  Timer, Shield, Search, Eye, AlertCircle, FileText,
  ChevronRight, Inbox, Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { mockLabDemands, type LabDemand } from "@/data/mocks/lab";

const statusConfig: Record<string, { label: string; cls: string; icon: any }> = {
  received:       { label: "Reçue",          cls: "bg-warning/10 text-warning border-warning/30", icon: Inbox },
  in_progress:    { label: "En cours",       cls: "bg-primary/10 text-primary border-primary/30", icon: Activity },
  results_ready:  { label: "Résultat prêt",  cls: "bg-accent/10 text-accent border-accent/30",   icon: CheckCircle2 },
  transmitted:    { label: "Transmis",        cls: "bg-muted text-muted-foreground",               icon: Send },
};

const LaboratoryDashboard = () => {
  const [demands] = useState<LabDemand[]>(mockLabDemands);
  const [search, setSearch] = useState("");

  const received  = demands.filter(d => d.status === "received").length;
  const inProgress = demands.filter(d => d.status === "in_progress").length;
  const ready     = demands.filter(d => d.status === "results_ready").length;
  const transmitted = demands.filter(d => d.status === "transmitted").length;
  const urgentActive = demands.filter(d => d.priority === "urgent" && d.status !== "transmitted").length;

  // Today's demands to process (non-transmitted)
  const toProcess = demands
    .filter(d => d.status !== "transmitted")
    .filter(d => !search || d.patient.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (a.priority === "urgent" && b.priority !== "urgent") return -1;
      if (b.priority === "urgent" && a.priority !== "urgent") return 1;
      const order = { received: 0, in_progress: 1, results_ready: 2, transmitted: 3 };
      return order[a.status] - order[b.status];
    });

  return (
    <DashboardLayout role="laboratory" title="Tableau de bord">
      <div className="space-y-5">
        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to="/dashboard/laboratory/analyses"
            className="rounded-xl border bg-warning/5 border-warning/20 p-3 flex items-center gap-3 hover:shadow-sm transition-all">
            <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center"><Inbox className="h-5 w-5 text-warning" /></div>
            <div><p className="text-lg font-bold text-warning">{received}</p><p className="text-[10px] text-muted-foreground">Reçues</p></div>
          </Link>
          <Link to="/dashboard/laboratory/analyses"
            className="rounded-xl border bg-primary/5 border-primary/20 p-3 flex items-center gap-3 hover:shadow-sm transition-all">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Activity className="h-5 w-5 text-primary" /></div>
            <div><p className="text-lg font-bold text-primary">{inProgress}</p><p className="text-[10px] text-muted-foreground">En cours</p></div>
          </Link>
          <Link to="/dashboard/laboratory/analyses"
            className="rounded-xl border bg-accent/5 border-accent/20 p-3 flex items-center gap-3 hover:shadow-sm transition-all">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-accent" /></div>
            <div><p className="text-lg font-bold text-accent">{ready}</p><p className="text-[10px] text-muted-foreground">Résultat prêt</p></div>
          </Link>
          <Link to="/dashboard/laboratory/results"
            className="rounded-xl border p-3 flex items-center gap-3 hover:shadow-sm transition-all">
            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center"><Send className="h-5 w-5 text-muted-foreground" /></div>
            <div><p className="text-lg font-bold text-foreground">{transmitted}</p><p className="text-[10px] text-muted-foreground">Transmis</p></div>
          </Link>
        </div>

        {/* ── Urgent alert ── */}
        {urgentActive > 0 && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 flex items-center gap-3 animate-pulse">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm font-medium text-destructive">{urgentActive} demande(s) urgente(s) à traiter</p>
            <Link to="/dashboard/laboratory/analyses" className="ml-auto">
              <Button size="sm" variant="destructive" className="text-xs">Voir<ChevronRight className="h-3.5 w-3.5 ml-1" /></Button>
            </Link>
          </div>
        )}

        {/* ── Quick actions ── */}
        <div className="flex gap-2 flex-wrap">
          <Link to="/dashboard/laboratory/analyses"><Button size="sm" className="gradient-primary text-primary-foreground text-xs"><Inbox className="h-3.5 w-3.5 mr-1.5" />Inbox demandes</Button></Link>
          <Link to="/dashboard/laboratory/results"><Button size="sm" variant="outline" className="text-xs"><FileText className="h-3.5 w-3.5 mr-1.5" />Historique résultats</Button></Link>
          <Link to="/dashboard/laboratory/patients"><Button size="sm" variant="outline" className="text-xs"><Eye className="h-3.5 w-3.5 mr-1.5" />Patients</Button></Link>
        </div>

        {/* ── Today's demands ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground text-sm">À traiter aujourd'hui</h2>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 w-44 text-xs" />
            </div>
          </div>
          <div className="space-y-2">
            {toProcess.map(d => {
              const cfg = statusConfig[d.status];
              return (
                <Link key={d.id} to="/dashboard/laboratory/analyses"
                  className={`block rounded-xl border bg-card p-4 shadow-card hover:shadow-card-hover transition-all ${
                    d.priority === "urgent" ? "border-l-4 border-l-destructive" : ""
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      d.priority === "urgent" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                    }`}>{d.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground text-sm">{d.patient}</span>
                        {d.priority === "urgent" && <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full font-medium">URGENT</span>}
                        {d.assurance !== "Sans assurance" && (
                          <span className="flex items-center gap-0.5 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                            <Shield className="h-2.5 w-2.5" />{d.assurance}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{d.examens.join(", ")} · {d.prescriber}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-foreground">{d.amount}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium border flex items-center gap-1 ${cfg.cls}`}>
                        <cfg.icon className="h-3 w-3" />{cfg.label}
                      </span>
                      {d.pdfs.length > 0 && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><FileText className="h-3 w-3" />{d.pdfs.length}</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
            {toProcess.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-accent/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Toutes les demandes sont traitées !</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LaboratoryDashboard;
