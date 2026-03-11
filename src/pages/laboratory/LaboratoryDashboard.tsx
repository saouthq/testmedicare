/**
 * Laboratory Dashboard — Modern KPI-driven dashboard with actionable insights.
 * Uses labStore for real-time data. Kanban-style quick view of pipeline.
 * // TODO BACKEND: GET /api/lab/dashboard
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import {
  FlaskConical, Clock, CheckCircle2, Send, Activity, AlertCircle,
  FileText, ChevronRight, Inbox, TrendingUp, Timer, Shield, Search,
  Eye, Upload, Stethoscope, ArrowRight, BarChart3, Package, Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useSharedLabDemands, updateLabDemandStatus, type SharedLabDemand } from "@/stores/labStore";

const statusConfig: Record<string, { label: string; cls: string; bgCls: string; icon: any }> = {
  received:       { label: "Reçue",         cls: "text-warning",          bgCls: "bg-warning/10 border-warning/30", icon: Inbox },
  in_progress:    { label: "En cours",      cls: "text-primary",          bgCls: "bg-primary/10 border-primary/30", icon: Activity },
  results_ready:  { label: "Résultat prêt", cls: "text-accent",           bgCls: "bg-accent/10 border-accent/30",   icon: CheckCircle2 },
  transmitted:    { label: "Transmis",      cls: "text-muted-foreground", bgCls: "bg-muted border-border",           icon: Send },
};

const LaboratoryDashboard = () => {
  const [demands] = useSharedLabDemands();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const received   = demands.filter(d => d.status === "received");
  const inProgress = demands.filter(d => d.status === "in_progress");
  const ready      = demands.filter(d => d.status === "results_ready");
  const transmitted = demands.filter(d => d.status === "transmitted");
  const urgentActive = demands.filter(d => d.priority === "urgent" && !["transmitted", "results_ready"].includes(d.status));

  // Recent activity (non-transmitted, matching search)
  const pipeline = useMemo(() => {
    return demands
      .filter(d => d.status !== "transmitted")
      .filter(d => !search || d.patient.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (a.priority === "urgent" && b.priority !== "urgent") return -1;
        if (b.priority === "urgent" && a.priority !== "urgent") return 1;
        const order = { received: 0, in_progress: 1, results_ready: 2, transmitted: 3 };
        return order[a.status] - order[b.status];
      });
  }, [demands, search]);

  // Top prescribers
  const topPrescribers = useMemo(() => {
    const counts: Record<string, number> = {};
    demands.forEach(d => { counts[d.prescriber] = (counts[d.prescriber] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [demands]);

  return (
    <DashboardLayout role="laboratory" title="Tableau de bord">
      <div className="space-y-5">
        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: "Reçues", value: received.length, icon: Inbox, color: "text-warning", bg: "bg-warning/10 border-warning/20", link: "/dashboard/laboratory/analyses", sub: `${urgentActive.length} urgente(s)` },
            { label: "En cours", value: inProgress.length, icon: Activity, color: "text-primary", bg: "bg-primary/10 border-primary/20", link: "/dashboard/laboratory/analyses" },
            { label: "Prêtes", value: ready.length, icon: CheckCircle2, color: "text-accent", bg: "bg-accent/10 border-accent/20", link: "/dashboard/laboratory/analyses", sub: "à transmettre" },
            { label: "Transmis", value: transmitted.length, icon: Send, color: "text-muted-foreground", bg: "bg-muted", link: "/dashboard/laboratory/results", sub: "ce mois" },
            { label: "Total", value: demands.length, icon: FlaskConical, color: "text-foreground", bg: "bg-card border", link: "/dashboard/laboratory/reporting" },
          ].map((kpi, i) => (
            <Link key={i} to={kpi.link}
              className={`rounded-xl border ${kpi.bg} p-3 flex items-center gap-3 hover:shadow-sm transition-all group`}>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${kpi.bg}`}>
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
              <div className="min-w-0">
                <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
                <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
                {kpi.sub && <p className="text-[9px] text-muted-foreground/70">{kpi.sub}</p>}
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </Link>
          ))}
        </div>

        {/* ── Urgent alert ── */}
        {urgentActive.length > 0 && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 animate-pulse" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-destructive">{urgentActive.length} demande(s) urgente(s)</p>
              <p className="text-[11px] text-muted-foreground">{urgentActive.map(d => d.patient).join(", ")}</p>
            </div>
            <Link to="/dashboard/laboratory/analyses">
              <Button size="sm" variant="destructive" className="text-xs">Traiter<ChevronRight className="h-3.5 w-3.5 ml-1" /></Button>
            </Link>
          </div>
        )}

        {/* ── Quick actions ── */}
        <div className="flex gap-2 flex-wrap">
          <Link to="/dashboard/laboratory/analyses"><Button size="sm" className="gradient-primary text-primary-foreground text-xs"><Inbox className="h-3.5 w-3.5 mr-1.5" />Inbox demandes</Button></Link>
          <Link to="/dashboard/laboratory/results"><Button size="sm" variant="outline" className="text-xs"><FileText className="h-3.5 w-3.5 mr-1.5" />Résultats transmis</Button></Link>
          <Link to="/dashboard/laboratory/patients"><Button size="sm" variant="outline" className="text-xs"><Eye className="h-3.5 w-3.5 mr-1.5" />Patients</Button></Link>
          <Link to="/dashboard/laboratory/quality"><Button size="sm" variant="outline" className="text-xs"><Shield className="h-3.5 w-3.5 mr-1.5" />Qualité & Stock</Button></Link>
          <Link to="/dashboard/laboratory/reporting"><Button size="sm" variant="outline" className="text-xs"><BarChart3 className="h-3.5 w-3.5 mr-1.5" />Statistiques</Button></Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* ── Pipeline (kanban-like) ── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground text-sm">Pipeline actif</h2>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 w-44 text-xs" />
              </div>
            </div>

            {/* Mini kanban columns */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: "received", label: "Reçues", items: pipeline.filter(d => d.status === "received") },
                { key: "in_progress", label: "En cours", items: pipeline.filter(d => d.status === "in_progress") },
                { key: "results_ready", label: "Prêtes", items: pipeline.filter(d => d.status === "results_ready") },
              ].map(col => {
                const cfg = statusConfig[col.key];
                const ColIcon = cfg.icon;
                return (
                  <div key={col.key} className="space-y-2">
                    <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border ${cfg.bgCls}`}>
                      <ColIcon className={`h-3.5 w-3.5 ${cfg.cls}`} />
                      <span className={`text-[11px] font-semibold ${cfg.cls}`}>{cfg.label}</span>
                      <span className={`text-[10px] ${cfg.cls} ml-auto font-bold`}>{col.items.length}</span>
                    </div>
                    <div className="space-y-1.5 min-h-[100px]">
                      {col.items.slice(0, 5).map(d => (
                        <button key={d.id} onClick={() => navigate("/dashboard/laboratory/analyses")}
                          className={`w-full text-left rounded-lg border bg-card p-2.5 shadow-card hover:shadow-card-hover transition-all ${
                            d.priority === "urgent" ? "border-l-3 border-l-destructive" : ""
                          }`}>
                          <div className="flex items-center gap-2">
                            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                              d.priority === "urgent" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                            }`}>{d.avatar}</div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-medium text-foreground truncate">{d.patient}</p>
                              <p className="text-[9px] text-muted-foreground truncate">{d.examens.join(", ")}</p>
                            </div>
                            {d.priority === "urgent" && <AlertCircle className="h-3 w-3 text-destructive shrink-0" />}
                          </div>
                          {d.pdfs.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <FileText className="h-2.5 w-2.5 text-accent" />
                              <span className="text-[8px] text-accent font-medium">{d.pdfs.length} PDF</span>
                            </div>
                          )}
                        </button>
                      ))}
                      {col.items.length === 0 && (
                        <div className="text-center py-4">
                          <CheckCircle2 className="h-5 w-5 text-muted-foreground/20 mx-auto" />
                          <p className="text-[9px] text-muted-foreground mt-1">Vide</p>
                        </div>
                      )}
                      {col.items.length > 5 && (
                        <Link to="/dashboard/laboratory/analyses" className="block text-center text-[10px] text-primary font-medium py-1">
                          +{col.items.length - 5} autres
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Sidebar: prescribers + stats ── */}
          <div className="space-y-4">
            {/* Top prescribers */}
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary" />Top prescripteurs
              </h3>
              <div className="space-y-2">
                {topPrescribers.map(([name, count], i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary">{i + 1}</span>
                      <span className="text-xs font-medium text-foreground">{name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick stats */}
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent" />Performance
              </h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Taux complétion</span>
                  <span className="text-xs font-bold text-accent">{demands.length > 0 ? Math.round(((ready.length + transmitted.length) / demands.length) * 100) : 0}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${demands.length > 0 ? ((ready.length + transmitted.length) / demands.length) * 100 : 0}%` }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Urgences actives</span>
                  <span className={`text-xs font-bold ${urgentActive.length > 0 ? "text-destructive" : "text-accent"}`}>{urgentActive.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">PDFs uploadés</span>
                  <span className="text-xs font-bold text-foreground">{demands.reduce((sum, d) => sum + d.pdfs.length, 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LaboratoryDashboard;
