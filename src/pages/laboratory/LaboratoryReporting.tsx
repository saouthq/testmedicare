/**
 * LaboratoryReporting — Statistics & reporting for the lab space.
 * Charts: daily demand volume, exam type distribution, turnaround times.
 * // TODO BACKEND: GET /api/lab/stats
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useEffect, useMemo } from "react";
import {
  BarChart3, TrendingUp, Clock, CheckCircle2, Activity,
  Calendar, FlaskConical, Download, FileText, PieChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart as RPieChart, Pie, Cell,
} from "recharts";
import { useSharedLabDemands } from "@/stores/labStore";
import { toast } from "@/hooks/use-toast";

// Mock daily volume data
const dailyVolume = [
  { day: "Lun", received: 12, completed: 10 },
  { day: "Mar", received: 15, completed: 13 },
  { day: "Mer", received: 8, completed: 9 },
  { day: "Jeu", received: 18, completed: 16 },
  { day: "Ven", received: 14, completed: 12 },
  { day: "Sam", received: 6, completed: 5 },
  { day: "Dim", received: 2, completed: 2 },
];

const turnaroundData = [
  { month: "Sep", avg: 28 },
  { month: "Oct", avg: 26 },
  { month: "Nov", avg: 24 },
  { month: "Déc", avg: 22 },
  { month: "Jan", avg: 20 },
  { month: "Fév", avg: 18 },
];

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
  "hsl(210 40% 60%)",
  "hsl(280 40% 60%)",
];

type Period = "week" | "month" | "year";

const LaboratoryReporting = () => {
  const [period, setPeriod] = useState<Period>("week");

  // Store already seeded centrally by seedStores
  const [demands] = useSharedLabDemands();

  // Compute exam type distribution from actual store data
  const examDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    demands.forEach(d => d.examens.forEach(e => { counts[e] = (counts[e] || 0) + 1; }));
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [demands]);

  // KPIs
  const totalDemands = demands.length;
  const completedCount = demands.filter(d => d.status === "transmitted" || d.status === "results_ready").length;
  const avgTurnaround = "18h";
  const completionRate = totalDemands > 0 ? Math.round((completedCount / totalDemands) * 100) : 0;
  const urgentCount = demands.filter(d => d.priority === "urgent").length;
  const urgentRate = totalDemands > 0 ? Math.round((urgentCount / totalDemands) * 100) : 0;

  return (
    <DashboardLayout role="laboratory" title="Statistiques">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />Statistiques & Reporting
            </h2>
            <p className="text-sm text-muted-foreground">Activité du laboratoire et indicateurs de performance.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5 rounded-lg border bg-card p-0.5">
              {(["week", "month", "year"] as Period[]).map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {p === "week" ? "Semaine" : p === "month" ? "Mois" : "Année"}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => toast({ title: "Export CSV", description: "Rapport exporté (mock)" })}>
              <Download className="h-3.5 w-3.5 mr-1.5" />Exporter
            </Button>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total demandes", value: String(totalDemands), icon: FlaskConical, color: "text-primary", bg: "bg-primary/10" },
            { label: "Taux complétion", value: `${completionRate}%`, icon: CheckCircle2, color: "text-accent", bg: "bg-accent/10" },
            { label: "Délai moyen", value: avgTurnaround, icon: Clock, color: "text-warning", bg: "bg-warning/10" },
            { label: "Taux urgences", value: `${urgentRate}%`, icon: Activity, color: "text-destructive", bg: "bg-destructive/10" },
          ].map((kpi, i) => (
            <div key={i} className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{kpi.value}</p>
                  <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Daily volume */}
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />Volume quotidien
              </h3>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyVolume}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                  <Bar dataKey="received" name="Reçues" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" name="Traitées" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Exam distribution */}
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <PieChart className="h-4 w-4 text-accent" />Répartition examens
              </h3>
            </div>
            <div className="h-52 flex items-center gap-4">
              <div className="flex-1 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RPieChart>
                    <Pie data={examDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={2}>
                      {examDistribution.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                  </RPieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 min-w-0">
                {examDistribution.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] text-foreground truncate">{item.name}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Turnaround trend */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />Évolution du délai moyen (heures)
            </h3>
            <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">↓ En amélioration</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={turnaroundData}>
                <defs>
                  <linearGradient id="turnaroundGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} unit="h" />
                <Tooltip formatter={(v: number) => [`${v}h`, "Délai moyen"]} contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                <Area type="monotone" dataKey="avg" stroke="hsl(var(--warning))" fill="url(#turnaroundGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top prescribers */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="font-semibold text-foreground text-sm flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-primary" />Top prescripteurs
          </h3>
          <div className="space-y-2">
            {(() => {
              const prescriberCounts: Record<string, number> = {};
              demands.forEach(d => { prescriberCounts[d.prescriber] = (prescriberCounts[d.prescriber] || 0) + 1; });
              return Object.entries(prescriberCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([name, count], i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <span className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{i + 1}</span>
                      <span className="text-sm font-medium text-foreground">{name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">{count} demandes</span>
                      <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${(count / demands.length) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ));
            })()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LaboratoryReporting;
