/**
 * SecretaryStats — Statistiques complètes du cabinet.
 * KPIs, graphiques d'activité, répartition par médecin, tendances.
 * // TODO BACKEND: GET /api/secretary/stats
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import {
  Calendar, Users, Clock, TrendingUp, BarChart3, PieChart as PieChartIcon,
  Banknote, AlertTriangle, Stethoscope, CheckCircle2, XCircle, UserX
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line } from "recharts";

const weeklyData = [
  { day: "Lun", rdv: 18, done: 16, absent: 1, cancelled: 1 },
  { day: "Mar", rdv: 22, done: 20, absent: 0, cancelled: 2 },
  { day: "Mer", rdv: 12, done: 11, absent: 1, cancelled: 0 },
  { day: "Jeu", rdv: 20, done: 18, absent: 1, cancelled: 1 },
  { day: "Ven", rdv: 15, done: 13, absent: 0, cancelled: 2 },
  { day: "Sam", rdv: 8, done: 8, absent: 0, cancelled: 0 },
];

const monthlyRevenue = [
  { month: "Sep", revenue: 6800 }, { month: "Oct", revenue: 7200 },
  { month: "Nov", revenue: 6500 }, { month: "Déc", revenue: 5800 },
  { month: "Jan", revenue: 8100 }, { month: "Fév", revenue: 8450 },
];

const doctorDistribution = [
  { name: "Dr. Bouazizi", value: 45, color: "hsl(var(--primary))" },
  { name: "Dr. Gharbi", value: 30, color: "hsl(var(--accent))" },
  { name: "Dr. Hammami", value: 25, color: "hsl(var(--warning))" },
];

const paymentDistribution = [
  { name: "Assurance", value: 55, color: "hsl(var(--primary))" },
  { name: "Espèces", value: 25, color: "hsl(var(--accent))" },
  { name: "Chèque", value: 12, color: "hsl(var(--warning))" },
  { name: "Virement", value: 8, color: "hsl(var(--muted-foreground))" },
];

const waitTimeData = [
  { week: "S1", avg: 22 }, { week: "S2", avg: 18 },
  { week: "S3", avg: 15 }, { week: "S4", avg: 12 },
];

const hourlyLoad = [
  { hour: "08h", count: 3 }, { hour: "09h", count: 5 }, { hour: "10h", count: 6 },
  { hour: "11h", count: 4 }, { hour: "12h", count: 2 }, { hour: "14h", count: 5 },
  { hour: "15h", count: 4 }, { hour: "16h", count: 3 }, { hour: "17h", count: 2 },
];

type Period = "week" | "month";

const SecretaryStats = () => {
  const [period, setPeriod] = useState<Period>("week");

  const totalRdv = weeklyData.reduce((s, d) => s + d.rdv, 0);
  const totalDone = weeklyData.reduce((s, d) => s + d.done, 0);
  const totalAbsent = weeklyData.reduce((s, d) => s + d.absent, 0);
  const totalCancelled = weeklyData.reduce((s, d) => s + d.cancelled, 0);
  const occupancyRate = Math.round((totalDone / totalRdv) * 100);
  const absentRate = Math.round((totalAbsent / totalRdv) * 100);

  return (
    <DashboardLayout role="secretary" title="Statistiques du cabinet">
      <div className="space-y-6">
        {/* Period selector */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1 rounded-lg border bg-card p-0.5">
            {([
              { key: "week" as Period, label: "Cette semaine" },
              { key: "month" as Period, label: "Ce mois" },
            ]).map(p => (
              <button key={p.key} onClick={() => setPeriod(p.key)}
                className={`rounded-md px-4 py-2 text-xs font-medium transition-colors ${period === p.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {p.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => {}}>
            <BarChart3 className="h-3.5 w-3.5 mr-1" />Exporter PDF
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-6">
          {[
            { label: "Total RDV", value: String(totalRdv), icon: Calendar, color: "text-primary", bg: "bg-primary/10" },
            { label: "Réalisés", value: String(totalDone), icon: CheckCircle2, color: "text-accent", bg: "bg-accent/10" },
            { label: "Taux occupation", value: `${occupancyRate}%`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
            { label: "Absents", value: String(totalAbsent), icon: UserX, color: "text-destructive", bg: "bg-destructive/10" },
            { label: "Annulés", value: String(totalCancelled), icon: XCircle, color: "text-warning", bg: "bg-warning/10" },
            { label: "CA mensuel", value: "8 450 DT", icon: Banknote, color: "text-accent", bg: "bg-accent/10" },
          ].map(kpi => (
            <div key={kpi.label} className="rounded-xl border bg-card p-4 shadow-card">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${kpi.bg} mb-2`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
              <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
              <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Weekly activity */}
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />Activité de la semaine
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Bar dataKey="done" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Réalisés" />
                <Bar dataKey="absent" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="Absents" />
                <Bar dataKey="cancelled" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} name="Annulés" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue trend */}
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" />Évolution du chiffre d'affaires
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} formatter={(v: number) => `${v} DT`} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" fill="hsl(var(--accent) / 0.15)" strokeWidth={2} name="CA" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Doctor distribution */}
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-primary" />Répartition par médecin
            </h3>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={doctorDistribution} cx="50%" cy="50%" outerRadius={60} innerRadius={35} dataKey="value" strokeWidth={0}>
                    {doctorDistribution.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {doctorDistribution.map(d => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ background: d.color }} />
                      <span className="text-xs text-foreground">{d.name}</span>
                    </div>
                    <span className="text-xs font-bold text-foreground">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment methods */}
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Banknote className="h-4 w-4 text-accent" />Moyens de paiement
            </h3>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={paymentDistribution} cx="50%" cy="50%" outerRadius={60} innerRadius={35} dataKey="value" strokeWidth={0}>
                    {paymentDistribution.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {paymentDistribution.map(d => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ background: d.color }} />
                      <span className="text-xs text-foreground">{d.name}</span>
                    </div>
                    <span className="text-xs font-bold text-foreground">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Wait time trend */}
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />Temps d'attente moyen (min)
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={waitTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} formatter={(v: number) => `${v} min`} />
                <Line type="monotone" dataKey="avg" stroke="hsl(var(--warning))" strokeWidth={2} dot={{ fill: "hsl(var(--warning))", r: 4 }} name="Moy." />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Hourly load */}
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />Charge horaire moyenne
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={hourlyLoad}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="RDV" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <h4 className="text-sm font-semibold text-foreground mb-2">Taux de no-show</h4>
            <p className="text-3xl font-bold text-destructive">{absentRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">↓ 2% vs mois dernier</p>
            <div className="h-2 w-full bg-muted rounded-full mt-3"><div className="h-full bg-destructive rounded-full" style={{ width: `${absentRate}%` }} /></div>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <h4 className="text-sm font-semibold text-foreground mb-2">Patients fidèles</h4>
            <p className="text-3xl font-bold text-primary">78%</p>
            <p className="text-xs text-muted-foreground mt-1">Ont consulté 3+ fois</p>
            <div className="h-2 w-full bg-muted rounded-full mt-3"><div className="h-full bg-primary rounded-full" style={{ width: "78%" }} /></div>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <h4 className="text-sm font-semibold text-foreground mb-2">Satisfaction</h4>
            <p className="text-3xl font-bold text-accent">4.7/5</p>
            <p className="text-xs text-muted-foreground mt-1">127 avis vérifiés</p>
            <div className="h-2 w-full bg-muted rounded-full mt-3"><div className="h-full bg-accent rounded-full" style={{ width: "94%" }} /></div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SecretaryStats;
