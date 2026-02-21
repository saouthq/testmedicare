import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { TrendingUp, Users, Calendar, Banknote, Clock, Activity, Download, ChevronDown, ArrowUp, ArrowDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

type Period = "week" | "month" | "quarter" | "year";

const periodData: Record<Period, { consultations: { month: string; count: number }[]; revenue: { day: string; revenue: number }[] }> = {
  week: {
    consultations: [
      { month: "Lun", count: 14 }, { month: "Mar", count: 18 }, { month: "Mer", count: 8 },
      { month: "Jeu", count: 16 }, { month: "Ven", count: 12 }, { month: "Sam", count: 6 },
    ],
    revenue: [
      { day: "Lun", revenue: 490 }, { day: "Mar", revenue: 630 }, { day: "Mer", revenue: 280 },
      { day: "Jeu", revenue: 560 }, { day: "Ven", revenue: 420 }, { day: "Sam", revenue: 210 },
    ],
  },
  month: {
    consultations: [
      { month: "S1", count: 48 }, { month: "S2", count: 52 }, { month: "S3", count: 45 }, { month: "S4", count: 55 },
    ],
    revenue: [
      { day: "S1", revenue: 1680 }, { day: "S2", revenue: 1820 }, { day: "S3", revenue: 1575 }, { day: "S4", revenue: 1925 },
    ],
  },
  quarter: {
    consultations: [
      { month: "Déc", count: 87 }, { month: "Jan", count: 124 }, { month: "Fév", count: 94 },
    ],
    revenue: [
      { day: "Déc", revenue: 3045 }, { day: "Jan", revenue: 4340 }, { day: "Fév", revenue: 3290 },
    ],
  },
  year: {
    consultations: [
      { month: "Mar", count: 102 }, { month: "Avr", count: 95 }, { month: "Mai", count: 110 },
      { month: "Jun", count: 88 }, { month: "Jul", count: 65 }, { month: "Aoû", count: 45 },
      { month: "Sep", count: 98 }, { month: "Oct", count: 112 }, { month: "Nov", count: 105 },
      { month: "Déc", count: 87 }, { month: "Jan", count: 124 }, { month: "Fév", count: 94 },
    ],
    revenue: [
      { day: "Mar", revenue: 3570 }, { day: "Avr", revenue: 3325 }, { day: "Mai", revenue: 3850 },
      { day: "Jun", revenue: 3080 }, { day: "Jul", revenue: 2275 }, { day: "Aoû", revenue: 1575 },
      { day: "Sep", revenue: 3430 }, { day: "Oct", revenue: 3920 }, { day: "Nov", revenue: 3675 },
      { day: "Déc", revenue: 3045 }, { day: "Jan", revenue: 4340 }, { day: "Fév", revenue: 3290 },
    ],
  },
};

const patientsByType = [
  { name: "Consultation", value: 45, color: "hsl(var(--primary))" },
  { name: "Suivi", value: 25, color: "hsl(var(--accent))" },
  { name: "Première visite", value: 15, color: "hsl(var(--warning))" },
  { name: "Contrôle", value: 15, color: "hsl(var(--muted-foreground))" },
];

const periodLabels: Record<Period, string> = {
  week: "Cette semaine",
  month: "Ce mois",
  quarter: "Ce trimestre",
  year: "Cette année",
};

const DoctorStats = () => {
  const [period, setPeriod] = useState<Period>("month");

  const data = periodData[period];
  const totalConsult = data.consultations.reduce((s, c) => s + c.count, 0);
  const totalRevenue = data.revenue.reduce((s, r) => s + r.revenue, 0);
  const avgPerDay = Math.round(totalConsult / data.consultations.length);

  const stats = [
    { label: "Consultations", value: String(totalConsult), change: "+12%", up: true, icon: Calendar, color: "text-primary" },
    { label: "Patients actifs", value: "342", change: "+5%", up: true, icon: Users, color: "text-accent" },
    { label: "Chiffre d'affaires", value: `${totalRevenue.toLocaleString()} DT`, change: "+8%", up: true, icon: Banknote, color: "text-warning" },
    { label: "Durée moy. consultation", value: "22 min", change: "-3 min", up: false, icon: Clock, color: "text-primary" },
    { label: "Taux d'occupation", value: "87%", change: "+2%", up: true, icon: TrendingUp, color: "text-accent" },
    { label: "Taux d'annulation", value: "4.2%", change: "-1%", up: false, icon: Activity, color: "text-destructive" },
  ];

  return (
    <DashboardLayout role="doctor" title="Statistiques">
      <div className="space-y-6">
        {/* Period selector + export */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1 rounded-lg border bg-card p-1 w-fit">
            {(["week", "month", "quarter", "year"] as Period[]).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {periodLabels[p]}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs"><Download className="h-3.5 w-3.5 mr-1" />Exporter PDF</Button>
            <Button variant="outline" size="sm" className="text-xs"><Download className="h-3.5 w-3.5 mr-1" />Export Excel</Button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map(s => (
            <div key={s.label} className="rounded-xl border bg-card p-5 shadow-card hover:shadow-card-hover transition-all">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div className="flex items-end gap-2 mt-2">
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <span className={`text-xs font-medium flex items-center gap-0.5 ${
                  (s.label === "Taux d'annulation" ? !s.up : s.up) ? "text-accent" : "text-destructive"
                }`}>
                  {s.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {s.change}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">vs période précédente</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Consultations chart */}
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Consultations · {periodLabels[period]}</h3>
              <span className="text-xs text-muted-foreground">Moy. {avgPerDay}/période</span>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.consultations}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                  labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Patient distribution */}
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Répartition par motif</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={patientsByType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={2}>
                  {patientsByType.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {patientsByType.map(p => (
                <div key={p.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-muted-foreground">{p.name} ({p.value}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue chart */}
          <div className="rounded-xl border bg-card p-5 shadow-card lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Revenus · {periodLabels[period]}</h3>
              <span className="text-sm font-bold text-foreground">{totalRevenue.toLocaleString()} DT</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.revenue}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${v} DT`} />
                <Tooltip
                  formatter={(value: number) => [`${value} DT`, "Revenus"]}
                  contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance indicators */}
        <div className="rounded-xl border bg-card shadow-card p-5">
          <h3 className="font-semibold text-foreground mb-4">Indicateurs de performance</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Patients fidélisés", value: "78%", desc: "Reviennent dans les 6 mois", color: "bg-primary" },
              { label: "Satisfaction", value: "4.8/5", desc: "Basée sur 156 avis", color: "bg-accent" },
              { label: "Délai moyen RDV", value: "3.2j", desc: "Temps d'attente patient", color: "bg-warning" },
              { label: "Téléconsultation", value: "23%", desc: "Part des consultations", color: "bg-primary" },
            ].map((ind, i) => (
              <div key={i} className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`h-2 w-2 rounded-full ${ind.color}`} />
                  <p className="text-xs text-muted-foreground">{ind.label}</p>
                </div>
                <p className="text-xl font-bold text-foreground">{ind.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{ind.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorStats;
