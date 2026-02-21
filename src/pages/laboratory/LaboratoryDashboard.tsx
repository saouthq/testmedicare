import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import {
  FlaskConical, Clock, CheckCircle2,
  ChevronRight, Send,
  Banknote, BarChart3, Activity,
  Timer, Package, ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { mockLabStats, mockLabAnalysesFull } from "@/data/mockData";

const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
  in_progress: { label: "En cours", class: "bg-primary/10 text-primary", icon: Activity },
  ready: { label: "Prêt", class: "bg-accent/10 text-accent", icon: CheckCircle2 },
  waiting: { label: "En attente", class: "bg-warning/10 text-warning", icon: Clock },
};

const pendingPrelevements = [
  { patient: "Mohamed Sfar", type: "TSH", time: "09:30", urgent: true, avatar: "MS" },
  { patient: "Leila Chahed", type: "NFS + CRP", time: "10:00", urgent: false, avatar: "LC" },
  { patient: "Karim Mansour", type: "Bilan rénal", time: "10:30", urgent: true, avatar: "KM" },
];

const LaboratoryDashboard = () => {
  const [sentIds, setSentIds] = useState<number[]>([]);

  const handleSend = (i: number) => setSentIds(prev => [...prev, i]);

  return (
    <DashboardLayout role="laboratory" title="Tableau de bord">
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {mockLabStats.map((s) => (
            <div key={s.label} className="rounded-xl border bg-card p-4 shadow-card hover:shadow-card-hover transition-all">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${s.color}`}><FlaskConical className="h-5 w-5" /></div>
              <p className="mt-3 text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-[11px] text-accent mt-1 flex items-center gap-0.5"><ArrowUpRight className="h-3 w-3" />{s.change}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Active analyses */}
            <div className="rounded-xl border bg-card shadow-card">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <h2 className="font-semibold text-foreground flex items-center gap-2"><FlaskConical className="h-4 w-4 text-primary" />Analyses en cours</h2>
                <Link to="/dashboard/laboratory/analyses" className="text-sm text-primary hover:underline flex items-center gap-1">Tout voir <ChevronRight className="h-4 w-4" /></Link>
              </div>
              <div className="divide-y">
                {mockLabAnalysesFull.map((a, i) => {
                  const config = statusConfig[a.status];
                  const isSent = sentIds.includes(i);
                  return (
                    <div key={i} className={`px-5 py-3 hover:bg-muted/30 transition-colors ${a.priority === "urgent" ? "border-l-2 border-l-destructive" : ""}`}>
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">{a.avatar}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground text-sm truncate">{a.patient}</p>
                            {a.priority === "urgent" && <span className="rounded-full bg-destructive/10 text-destructive px-2 py-0.5 text-[10px] font-medium">Urgent</span>}
                          </div>
                          <p className="text-xs text-muted-foreground">{a.type} · {a.doctor}</p>
                          {a.status === "in_progress" && a.progress && (
                            <div className="flex items-center gap-2 mt-1">
                              <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${a.progress}%` }} />
                              </div>
                              <span className="text-[10px] font-medium text-primary">{a.progress}%</span>
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-foreground shrink-0">{a.amount}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium flex items-center gap-1 shrink-0 ${config.class}`}>
                          <config.icon className="h-3 w-3" />{config.label}
                        </span>
                        {a.status === "ready" && !isSent && (
                          <Button variant="outline" size="sm" className="h-7 text-[11px] shrink-0" onClick={() => handleSend(i)}>
                            <Send className="h-3 w-3 mr-1" />Envoyer
                          </Button>
                        )}
                        {isSent && <span className="text-[10px] text-accent font-medium">✓ Envoyé</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pending prélèvements */}
            <div className="rounded-xl border border-warning/30 bg-card shadow-card">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Timer className="h-4 w-4 text-warning" />Prélèvements en attente
                  <span className="bg-warning/10 text-warning text-xs font-bold px-2 py-0.5 rounded-full">{pendingPrelevements.length}</span>
                </h3>
              </div>
              <div className="divide-y">
                {pendingPrelevements.map((p, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${p.urgent ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>{p.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{p.patient}</p>
                        {p.urgent && <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full font-medium">Urgent</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">{p.type} · RDV {p.time}</p>
                    </div>
                    <Button size="sm" className="h-7 text-[11px] gradient-primary text-primary-foreground">
                      <CheckCircle2 className="h-3 w-3 mr-1" />Enregistrer
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Weekly output (simplified) */}
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" />Production hebdomadaire</h3>
              {/* Mock chart simplified */}
              <div className="h-32 flex items-end justify-between px-2">
                {[45, 52, 38, 48, 42].map((val, i) => (
                  <div key={i} className="w-8 bg-primary/20 rounded-t-sm" style={{ height: `${val}%` }} />
                ))}
              </div>
            </div>

            {/* Supplies */}
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Package className="h-4 w-4 text-warning" />Consommables</h3>
              <div className="space-y-3">
                {[
                  { name: "Tubes EDTA", qty: 120, status: "ok" },
                  { name: "Tubes secs", qty: 15, status: "low" },
                  { name: "Aiguilles 21G", qty: 8, status: "critical" },
                ].map((c, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-foreground flex-1">{c.name}</span>
                    <span className={`text-[10px] font-semibold ${c.status === "critical" ? "text-destructive" : c.status === "low" ? "text-warning" : "text-foreground"}`}>{c.qty}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LaboratoryDashboard;