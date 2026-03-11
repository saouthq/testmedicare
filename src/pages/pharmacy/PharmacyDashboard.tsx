/**
 * Pharmacy Dashboard — Counters + today's prescriptions
 * Patient-sent model.
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  FileText, Pill, CheckCircle2, Package, AlertTriangle,
  ChevronRight, Inbox, Clock, AlertCircle, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { usePharmacyPrescriptions } from "@/stores/pharmacyStore";

const statusCfg: Record<string, { label: string; cls: string }> = {
  received:     { label: "Reçue",              cls: "bg-warning/10 text-warning" },
  preparing:    { label: "En préparation",     cls: "bg-primary/10 text-primary" },
  ready_pickup: { label: "Prête à retirer",    cls: "bg-accent/10 text-accent" },
  delivered:    { label: "Délivrée",           cls: "bg-muted text-muted-foreground" },
  partial:      { label: "Partielle",          cls: "bg-warning/10 text-warning" },
  unavailable:  { label: "Indisponible",       cls: "bg-destructive/10 text-destructive" },
};

const PharmacyDashboard = () => {
  const [allRx] = usePharmacyPrescriptions();
  const rx = allRx;
  const received  = rx.filter(p => p.status === "received").length;
  const preparing = rx.filter(p => p.status === "preparing").length;
  const ready     = rx.filter(p => p.status === "ready_pickup").length;
  const problems  = rx.filter(p => p.status === "partial" || p.status === "unavailable").length;

  // Active (non-delivered, non-final)
  const active = rx.filter(p => !["delivered"].includes(p.status));

  return (
    <DashboardLayout role="pharmacy" title="Tableau de bord">
      <div className="space-y-6">
        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to="/dashboard/pharmacy/prescriptions" className="rounded-xl border bg-warning/5 border-warning/20 p-3 flex items-center gap-3 hover:shadow-sm transition-all">
            <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center"><Inbox className="h-5 w-5 text-warning" /></div>
            <div><p className="text-lg font-bold text-warning">{received}</p><p className="text-[10px] text-muted-foreground">Reçues</p></div>
          </Link>
          <Link to="/dashboard/pharmacy/prescriptions" className="rounded-xl border bg-primary/5 border-primary/20 p-3 flex items-center gap-3 hover:shadow-sm transition-all">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Clock className="h-5 w-5 text-primary" /></div>
            <div><p className="text-lg font-bold text-primary">{preparing}</p><p className="text-[10px] text-muted-foreground">En préparation</p></div>
          </Link>
          <Link to="/dashboard/pharmacy/prescriptions" className="rounded-xl border bg-accent/5 border-accent/20 p-3 flex items-center gap-3 hover:shadow-sm transition-all">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-accent" /></div>
            <div><p className="text-lg font-bold text-accent">{ready}</p><p className="text-[10px] text-muted-foreground">Prêtes</p></div>
          </Link>
          {problems > 0 ? (
            <Link to="/dashboard/pharmacy/prescriptions" className="rounded-xl border bg-destructive/5 border-destructive/20 p-3 flex items-center gap-3 hover:shadow-sm transition-all">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
              <div><p className="text-lg font-bold text-destructive">{problems}</p><p className="text-[10px] text-muted-foreground">Problèmes</p></div>
            </Link>
          ) : (
            <div className="rounded-xl border p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center"><Package className="h-5 w-5 text-muted-foreground" /></div>
              <div><p className="text-lg font-bold text-foreground">{rx.length}</p><p className="text-[10px] text-muted-foreground">Total</p></div>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* ── Active prescriptions ── */}
          <div className="lg:col-span-2 rounded-xl border bg-card shadow-card">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />Ordonnances à traiter
                <span className="bg-warning/10 text-warning text-xs font-bold px-2 py-0.5 rounded-full">{active.length}</span>
              </h2>
              <Link to="/dashboard/pharmacy/prescriptions" className="text-sm text-primary hover:underline flex items-center gap-1">
                Tout voir<ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y">
              {active.slice(0, 6).map(p => {
                const cfg = statusCfg[p.status];
                const hasProblems = p.items.some(i => i.availability !== "available");
                return (
                  <div key={p.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                        p.urgent ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                      }`}>{p.avatar}</div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-foreground text-sm">{p.patient}</p>
                          {p.urgent && <span className="rounded-full bg-destructive/10 text-destructive px-2 py-0.5 text-[10px] font-medium">Urgent</span>}
                          {p.assurance !== "Sans assurance" && (
                            <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                              <Shield className="h-2.5 w-2.5" />{p.assurance}
                            </span>
                          )}
                          {hasProblems && <span className="text-[9px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5"><AlertCircle className="h-2.5 w-2.5" />Dispo partielle</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">{p.doctor} · {p.items.length} médicament(s) · {p.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.cls}`}>{cfg.label}</span>
                      <span className="text-sm font-semibold text-foreground">{p.total}</span>
                    </div>
                  </div>
                );
              })}
              {active.length === 0 && (
                <div className="p-8 text-center">
                  <CheckCircle2 className="h-10 w-10 text-accent/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Aucune ordonnance en attente</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-6">
            {/* Stock alerts */}
            <div className="rounded-xl border border-destructive/20 bg-card shadow-card">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" />Alertes stock</h3>
                <Link to="/dashboard/pharmacy/stock" className="text-xs text-primary hover:underline">Gérer</Link>
              </div>
              <div className="divide-y">
                {[
                  { name: "Ventoline 100µg", remaining: 5, threshold: 20 },
                  { name: "Oméprazole 20mg", remaining: 8, threshold: 30 },
                ].map((s, i) => (
                  <div key={i} className="p-4 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-destructive/10"><Package className="h-4 w-4 text-destructive" /></div>
                    <div className="flex-1"><p className="text-xs font-medium text-foreground">{s.name}</p><span className="text-[10px] font-semibold text-destructive">{s.remaining}/{s.threshold}</span></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="rounded-xl border bg-card shadow-card p-5 space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><Pill className="h-4 w-4 text-accent" />Actions rapides</h3>
              <Link to="/dashboard/pharmacy/prescriptions"><Button size="sm" className="w-full gradient-primary text-primary-foreground text-xs"><Inbox className="h-3.5 w-3.5 mr-1.5" />Ordonnances</Button></Link>
              <Link to="/dashboard/pharmacy/stock"><Button size="sm" variant="outline" className="w-full text-xs"><Package className="h-3.5 w-3.5 mr-1.5" />Stock</Button></Link>
              <Link to="/dashboard/pharmacy/history"><Button size="sm" variant="outline" className="w-full text-xs"><FileText className="h-3.5 w-3.5 mr-1.5" />Historique</Button></Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PharmacyDashboard;
