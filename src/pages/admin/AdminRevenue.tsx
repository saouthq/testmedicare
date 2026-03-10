/**
 * AdminRevenue — Centre de revenus détaillé avec breakdown par type, plan, mois
 * TODO BACKEND: Replace with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import {
  Banknote, TrendingUp, CreditCard, Users, ArrowUpRight, Download,
  Calendar, PieChart as PieChartIcon, BarChart3, ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid,
} from "recharts";

const monthlyRevenue = [
  { month: "Oct", subscriptions: 28000, teleconsult: 4200, total: 32200 },
  { month: "Nov", subscriptions: 31000, teleconsult: 4800, total: 35800 },
  { month: "Déc", subscriptions: 34000, teleconsult: 5100, total: 39100 },
  { month: "Jan", subscriptions: 37500, teleconsult: 5500, total: 43000 },
  { month: "Fév", subscriptions: 41200, teleconsult: 6100, total: 47300 },
  { month: "Mar", subscriptions: 44800, teleconsult: 6950, total: 51750 },
];

const planBreakdown = [
  { name: "Gratuit", value: 0, users: 8500 },
  { name: "Essentiel", value: 15680, users: 320 },
  { name: "Pro", value: 18705, users: 145 },
  { name: "Cabinet+", value: 8970, users: 30 },
];
const COLORS = ["hsl(var(--muted-foreground))", "hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--warning))"];

const roleRevenue = [
  { role: "Médecins", revenue: 35200 },
  { role: "Pharmacies", revenue: 8400 },
  { role: "Laboratoires", revenue: 5300 },
  { role: "Cliniques", revenue: 2850 },
];

const AdminRevenue = () => {
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");

  const totalMRR = 51750;
  const growth = 9.4;
  const arpu = 52;
  const churnRate = 3.2;

  return (
    <DashboardLayout role="admin" title="Centre de Revenus">
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <Banknote className="h-5 w-5 text-accent mb-2" />
            <p className="text-2xl font-bold text-foreground">{totalMRR.toLocaleString()} DT</p>
            <p className="text-xs text-muted-foreground">MRR</p>
            <span className="text-xs text-accent flex items-center gap-0.5 mt-1"><ArrowUpRight className="h-3 w-3" />+{growth}%</span>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <TrendingUp className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{(totalMRR * 12).toLocaleString()} DT</p>
            <p className="text-xs text-muted-foreground">ARR projeté</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <Users className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{arpu} DT</p>
            <p className="text-xs text-muted-foreground">ARPU</p>
          </div>
          <div className="rounded-xl border bg-destructive/5 p-5 shadow-card">
            <ArrowDownRight className="h-5 w-5 text-destructive mb-2" />
            <p className="text-2xl font-bold text-destructive">{churnRate}%</p>
            <p className="text-xs text-muted-foreground">Taux de churn</p>
          </div>
        </div>

        {/* Revenue chart */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />Évolution des revenus
            </h3>
            <div className="flex gap-1 rounded-lg border p-0.5">
              {(["month", "quarter", "year"] as const).map(p => (
                <button key={p} onClick={() => setPeriod(p)} className={`rounded-md px-3 py-1 text-xs font-medium ${period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                  {p === "month" ? "Mois" : p === "quarter" ? "Trimestre" : "Année"}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="subGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="tcGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `${v / 1000}k`} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} formatter={(v: number) => [`${v.toLocaleString()} DT`]} />
                <Area type="monotone" dataKey="subscriptions" name="Abonnements" stroke="hsl(var(--primary))" fill="url(#subGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="teleconsult" name="Téléconsult" stroke="hsl(var(--accent))" fill="url(#tcGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Plan breakdown pie */}
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
              <PieChartIcon className="h-4 w-4 text-primary" />Revenus par plan
            </h3>
            <div className="flex items-center gap-6">
              <div className="h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={planBreakdown.filter(p => p.value > 0)} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {planBreakdown.filter(p => p.value > 0).map((_, i) => <Cell key={i} fill={COLORS[i + 1]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v.toLocaleString()} DT`]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 flex-1">
                {planBreakdown.map((p, i) => (
                  <div key={p.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ background: COLORS[i] }} />
                      <span className="text-foreground">{p.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{p.value > 0 ? `${p.value.toLocaleString()} DT` : "—"}</p>
                      <p className="text-[10px] text-muted-foreground">{p.users} utilisateurs</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue by role */}
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
              <CreditCard className="h-4 w-4 text-accent" />Revenus par type de partenaire
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleRevenue}>
                  <XAxis dataKey="role" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `${v / 1000}k`} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} formatter={(v: number) => [`${v.toLocaleString()} DT`]} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Export */}
        <div className="flex justify-end">
          <Button variant="outline" size="sm" className="text-xs">
            <Download className="h-3.5 w-3.5 mr-1" />Exporter le rapport financier (CSV)
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminRevenue;
