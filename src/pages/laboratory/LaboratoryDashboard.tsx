import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import {
  FlaskConical, Clock, CheckCircle2,
  ChevronRight, Send, Activity,
  Timer, AlertCircle, User, Shield, Beaker
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { mockLabAnalyses } from "@/data/mockData";

const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
  in_progress: { label: "En cours", class: "bg-primary/10 text-primary", icon: Activity },
  ready: { label: "Prêt", class: "bg-accent/10 text-accent", icon: CheckCircle2 },
  waiting: { label: "En attente", class: "bg-warning/10 text-warning", icon: Clock },
};

const pendingPrelevements = [
  { patient: "Mohamed Sfar", type: "TSH", time: "09:30", urgent: true, avatar: "MS", doctor: "Dr. Hammami" },
  { patient: "Leila Chahed", type: "NFS + CRP", time: "10:00", urgent: false, avatar: "LC", doctor: "Dr. Bouazizi" },
  { patient: "Karim Mansour", type: "Bilan rénal", time: "10:30", urgent: true, avatar: "KM", doctor: "Dr. Gharbi" },
];

const LaboratoryDashboard = () => {
  const [sentIds, setSentIds] = useState<number[]>([]);
  const [registeredIds, setRegisteredIds] = useState<number[]>([]);

  const handleSend = (i: number) => setSentIds(prev => [...prev, i]);
  const handleRegister = (i: number) => setRegisteredIds(prev => [...prev, i]);

  return (
    <DashboardLayout role="laboratory" title="Tableau de bord">
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Pending prélèvements - priority */}
            <div className="rounded-xl border border-warning/30 bg-card shadow-card">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Timer className="h-4 w-4 text-warning" />Prélèvements en attente
                  <span className="bg-warning/10 text-warning text-xs font-bold px-2 py-0.5 rounded-full">{pendingPrelevements.filter((_, i) => !registeredIds.includes(i)).length}</span>
                </h3>
              </div>
              {pendingPrelevements.every((_, i) => registeredIds.includes(i)) ? (
                <div className="p-8 text-center">
                  <CheckCircle2 className="h-8 w-8 text-accent/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Tous les prélèvements ont été enregistrés</p>
                </div>
              ) : (
                <div className="divide-y">
                  {pendingPrelevements.map((p, i) => {
                    if (registeredIds.includes(i)) return null;
                    return (
                      <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${p.urgent ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>{p.avatar}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{p.patient}</p>
                            {p.urgent && <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full font-medium">Urgent</span>}
                          </div>
                          <p className="text-xs text-muted-foreground">{p.type} · {p.doctor} · RDV {p.time}</p>
                        </div>
                        <Button size="sm" className="h-7 text-[11px] gradient-primary text-primary-foreground" onClick={() => handleRegister(i)}>
                          <Beaker className="h-3 w-3 mr-1" />Enregistrer
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Active analyses */}
            <div className="rounded-xl border bg-card shadow-card">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <h2 className="font-semibold text-foreground flex items-center gap-2"><FlaskConical className="h-4 w-4 text-primary" />Analyses en cours</h2>
                <Link to="/dashboard/laboratory/analyses" className="text-sm text-primary hover:underline flex items-center gap-1">Tout voir <ChevronRight className="h-4 w-4" /></Link>
              </div>
              <div className="divide-y">
                {mockLabAnalyses.map((a, i) => {
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
          </div>

          {/* Right sidebar - Consommables only */}
          <div className="space-y-6">
            <div className="rounded-xl border border-destructive/20 bg-card shadow-card p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />Alertes consommables
              </h3>
              <div className="space-y-3">
                {[
                  { name: "Tubes EDTA", qty: 120, threshold: 150, status: "ok" },
                  { name: "Tubes secs", qty: 15, threshold: 50, status: "low" },
                  { name: "Aiguilles 21G", qty: 8, threshold: 30, status: "critical" },
                  { name: "Gants latex M", qty: 45, threshold: 100, status: "low" },
                ].map((c, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${c.status === "critical" ? "bg-destructive" : c.status === "low" ? "bg-warning" : "bg-accent"}`} />
                    <span className="text-xs text-foreground flex-1">{c.name}</span>
                    <span className={`text-[11px] font-bold ${c.status === "critical" ? "text-destructive" : c.status === "low" ? "text-warning" : "text-foreground"}`}>
                      {c.qty}/{c.threshold}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-semibold text-foreground mb-3">Accès rapide</h3>
              <div className="space-y-2">
                <Link to="/dashboard/laboratory/analyses">
                  <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                    <FlaskConical className="h-3.5 w-3.5 mr-2 text-primary" />Toutes les analyses
                  </Button>
                </Link>
                <Link to="/dashboard/laboratory/results">
                  <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-accent" />Résultats à envoyer
                  </Button>
                </Link>
                <Link to="/dashboard/laboratory/patients">
                  <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                    <User className="h-3.5 w-3.5 mr-2 text-muted-foreground" />Patients
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LaboratoryDashboard;
