import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import {
  FlaskConical, Clock, CheckCircle2, AlertCircle, Users,
  TrendingUp, ArrowUpRight, ChevronRight, FileText, Send,
  Banknote, BarChart3, Activity, Eye, Printer, Beaker
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const stats = [
  { label: "Analyses en cours", value: "28", change: "+5 aujourd'hui", icon: FlaskConical, color: "bg-primary/10 text-primary" },
  { label: "Résultats prêts", value: "15", change: "à envoyer", icon: CheckCircle2, color: "bg-accent/10 text-accent" },
  { label: "En attente prélèvement", value: "7", change: "3 urgents", icon: Clock, color: "bg-warning/10 text-warning" },
  { label: "CA du jour", value: "2 340 DT", change: "+12%", icon: Banknote, color: "bg-primary/10 text-primary" },
];

const analyses = [
  { patient: "Amine Ben Ali", type: "Bilan sanguin complet", doctor: "Dr. Bouazizi", status: "in_progress", date: "20 Fév", priority: "normal", avatar: "AB", amount: "85 DT" },
  { patient: "Fatma Trabelsi", type: "Analyse d'urine", doctor: "Dr. Gharbi", status: "ready", date: "19 Fév", priority: "normal", avatar: "FT", amount: "35 DT" },
  { patient: "Mohamed Sfar", type: "TSH - Thyroïde", doctor: "Dr. Hammami", status: "waiting", date: "20 Fév", priority: "urgent", avatar: "MS", amount: "45 DT" },
  { patient: "Nadia Jemni", type: "Glycémie à jeun", doctor: "Dr. Bouazizi", status: "ready", date: "18 Fév", priority: "normal", avatar: "NJ", amount: "25 DT" },
  { patient: "Sami Ayari", type: "Hémogramme (NFS)", doctor: "Dr. Bouazizi", status: "in_progress", date: "20 Fév", priority: "normal", avatar: "SA", amount: "40 DT" },
];

const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
  in_progress: { label: "En cours", class: "bg-primary/10 text-primary", icon: Activity },
  ready: { label: "Prêt", class: "bg-accent/10 text-accent", icon: CheckCircle2 },
  waiting: { label: "En attente", class: "bg-warning/10 text-warning", icon: Clock },
};

const weeklyOutput = [
  { day: "Lun", count: 45 },
  { day: "Mar", count: 52 },
  { day: "Mer", count: 38 },
  { day: "Jeu", count: 48 },
  { day: "Ven", count: 42 },
];

const LaboratoryDashboard = () => {
  return (
    <DashboardLayout role="laboratory" title="Tableau de bord">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border bg-card p-4 shadow-card hover:shadow-card-hover transition-all">
              <div className="flex items-center justify-between">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-[11px] text-accent mt-1 flex items-center gap-0.5">
                <ArrowUpRight className="h-3 w-3" />{s.change}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent analyses */}
          <div className="lg:col-span-2 rounded-xl border bg-card shadow-card">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-primary" />
                Analyses récentes
              </h2>
              <Link to="/dashboard/laboratory/analyses" className="text-sm text-primary hover:underline flex items-center gap-1">
                Tout voir <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y">
              {analyses.map((a, i) => {
                const config = statusConfig[a.status];
                return (
                  <div key={i} className={`flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors ${
                    a.priority === "urgent" ? "border-l-2 border-l-destructive" : ""
                  }`}>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                      {a.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground text-sm truncate">{a.patient}</p>
                        {a.priority === "urgent" && (
                          <span className="rounded-full bg-destructive/10 text-destructive px-2 py-0.5 text-[10px] font-medium">Urgent</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{a.type} · {a.doctor} · {a.date}</p>
                    </div>
                    <span className="text-xs font-semibold text-foreground shrink-0">{a.amount}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium flex items-center gap-1 shrink-0 ${config.class}`}>
                      <config.icon className="h-3 w-3" />
                      {config.label}
                    </span>
                    {a.status === "ready" && (
                      <Button variant="outline" size="sm" className="h-7 text-[11px] shrink-0">
                        <Send className="h-3 w-3 mr-1" />Envoyer
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Weekly output */}
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Production hebdomadaire
              </h3>
              <div className="space-y-3">
                {weeklyOutput.map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-muted-foreground w-8">{d.day}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(d.count / 60) * 100}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-foreground w-8 text-right">{d.count}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total semaine</span>
                <span className="text-sm font-bold text-foreground">{weeklyOutput.reduce((s, d) => s + d.count, 0)} analyses</span>
              </div>
            </div>

            {/* Top analyses */}
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Beaker className="h-4 w-4 text-accent" />
                Types les plus demandés
              </h3>
              <div className="space-y-3">
                {[
                  { type: "NFS / Hémogramme", count: 35, percent: 28 },
                  { type: "Glycémie à jeun", count: 28, percent: 22 },
                  { type: "Bilan lipidique", count: 22, percent: 18 },
                  { type: "TSH / Thyroïde", count: 18, percent: 14 },
                  { type: "Analyse d'urine", count: 15, percent: 12 },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-foreground flex-1 truncate">{t.type}</span>
                    <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${t.percent * 3}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground w-8 text-right">{t.count}</span>
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
