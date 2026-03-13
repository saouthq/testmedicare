/**
 * DoctorStats — Statistiques dérivées des stores centralisés.
 * // TODO BACKEND: Replace with analytics API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import FeatureGate from "@/components/shared/FeatureGate";
import { TrendingUp, Users, Calendar, Banknote, Clock, Activity, Download, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { useSharedAppointments } from "@/stores/sharedAppointmentsStore";
import { useSharedBilling } from "@/stores/billingStore";
import { useReviews, getAverageRating } from "@/stores/reviewsStore";

type Period = "week" | "month" | "quarter" | "year";

const periodLabels: Record<Period, string> = {
  week: "Cette semaine",
  month: "Ce mois",
  quarter: "Ce trimestre",
  year: "Cette année",
};

function getDaysBack(period: Period): number {
  switch (period) {
    case "week": return 7;
    case "month": return 30;
    case "quarter": return 90;
    case "year": return 365;
  }
}

const DoctorStats = () => {
  const [period, setPeriod] = useState<Period>("month");
  const [appointments] = useSharedAppointments();
  const [invoices] = useSharedBilling();
  const [reviews] = useReviews();

  const stats = useMemo(() => {
    const now = new Date();
    const daysBack = getDaysBack(period);
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - daysBack);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    // Filter appointments in period
    const periodAppts = appointments.filter(a => a.date >= cutoffStr);
    const doneAppts = periodAppts.filter(a => a.status === "done");
    const cancelledAppts = periodAppts.filter(a => a.status === "cancelled");
    const teleconsultAppts = doneAppts.filter(a => a.teleconsultation);

    // Invoices in period
    const periodInvoices = invoices.filter(inv => inv.date >= cutoffStr);
    const totalRevenue = periodInvoices.reduce((s, inv) => s + inv.amount, 0);

    // Unique patients
    const uniquePatients = new Set(doneAppts.map(a => a.patient)).size;

    // Cancellation rate
    const totalBooked = periodAppts.filter(a => a.status !== "pending").length;
    const cancellationRate = totalBooked > 0 ? ((cancelledAppts.length / totalBooked) * 100).toFixed(1) : "0";

    // Teleconsult percentage
    const teleconsultPct = doneAppts.length > 0 ? Math.round((teleconsultAppts.length / doneAppts.length) * 100) : 0;

    // Reviews
    const avgRating = getAverageRating(1); // Doctor ID 1
    const reviewCount = reviews.filter(r => r.doctorId === 1).length;

    return { doneCount: doneAppts.length, uniquePatients, totalRevenue, cancellationRate, teleconsultPct, avgRating, reviewCount, doneAppts, periodInvoices };
  }, [appointments, invoices, reviews, period]);

  // Build chart data - group done appointments by label
  const consultationsChart = useMemo(() => {
    const groups: Record<string, number> = {};
    stats.doneAppts.forEach(a => {
      const label = period === "week" 
        ? ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"][new Date(a.date).getDay()]
        : period === "month"
          ? `S${Math.ceil(new Date(a.date).getDate() / 7)}`
          : new Date(a.date).toLocaleString("fr", { month: "short" });
      groups[label] = (groups[label] || 0) + 1;
    });
    return Object.entries(groups).map(([month, count]) => ({ month, count }));
  }, [stats.doneAppts, period]);

  const revenueChart = useMemo(() => {
    const groups: Record<string, number> = {};
    stats.periodInvoices.forEach(inv => {
      const label = period === "week"
        ? ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"][new Date(inv.date).getDay()]
        : period === "month"
          ? `S${Math.ceil(new Date(inv.date).getDate() / 7)}`
          : new Date(inv.date).toLocaleString("fr", { month: "short" });
      groups[label] = (groups[label] || 0) + inv.amount;
    });
    return Object.entries(groups).map(([day, revenue]) => ({ day, revenue }));
  }, [stats.periodInvoices, period]);

  const patientsByType = useMemo(() => {
    const types: Record<string, number> = {};
    stats.doneAppts.forEach(a => {
      types[a.type] = (types[a.type] || 0) + 1;
    });
    const colors = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--warning))", "hsl(var(--muted-foreground))"];
    return Object.entries(types).map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }));
  }, [stats.doneAppts]);

  const avgPerPeriod = consultationsChart.length > 0 ? Math.round(stats.doneCount / consultationsChart.length) : 0;

  const hasData = stats.doneCount > 0 || stats.totalRevenue > 0;

  const kpiCards = [
    { label: "Consultations", value: String(stats.doneCount), icon: Calendar, color: "text-primary" },
    { label: "Patients vus", value: String(stats.uniquePatients), icon: Users, color: "text-accent" },
    { label: "Chiffre d'affaires", value: `${stats.totalRevenue.toLocaleString()} DT`, icon: Banknote, color: "text-warning" },
    { label: "Satisfaction", value: stats.avgRating > 0 ? `${stats.avgRating}/5` : "—", icon: TrendingUp, color: "text-accent" },
    { label: "Taux d'annulation", value: `${stats.cancellationRate}%`, icon: Activity, color: "text-destructive" },
    { label: "Téléconsultation", value: `${stats.teleconsultPct}%`, icon: Clock, color: "text-primary" },
  ];

  return (
    <DashboardLayout role="doctor" title="Statistiques">
      <FeatureGate featureId="stats_advanced">
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
          {kpiCards.map(s => (
            <div key={s.label} className="rounded-xl border bg-card p-5 shadow-card hover:shadow-card-hover transition-all">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div className="flex items-end gap-2 mt-2">
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{periodLabels[period]}</p>
            </div>
          ))}
        </div>

        {!hasData ? (
          <div className="rounded-xl border bg-card p-12 text-center shadow-card">
            <Calendar className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Données insuffisantes</p>
            <p className="text-xs text-muted-foreground mt-1">Les statistiques apparaîtront après vos premières consultations terminées.</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Consultations chart */}
            <div className="rounded-xl border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Consultations · {periodLabels[period]}</h3>
                <span className="text-xs text-muted-foreground">Moy. {avgPerPeriod}/période</span>
              </div>
              {consultationsChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={consultationsChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">Pas encore de données</div>
              )}
            </div>

            {/* Patient distribution */}
            <div className="rounded-xl border bg-card p-5 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Répartition par motif</h3>
              {patientsByType.length > 0 ? (
                <>
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
                        <span className="text-muted-foreground">{p.name} ({p.value})</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">Pas encore de données</div>
              )}
            </div>

            {/* Revenue chart */}
            <div className="rounded-xl border bg-card p-5 shadow-card lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Revenus · {periodLabels[period]}</h3>
                <span className="text-sm font-bold text-foreground">{stats.totalRevenue.toLocaleString()} DT</span>
              </div>
              {revenueChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={revenueChart}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${v} DT`} />
                    <Tooltip formatter={(value: number) => [`${value} DT`, "Revenus"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#revenueGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">Pas encore de données</div>
              )}
            </div>
          </div>
        )}

        {/* Performance indicators */}
        <div className="rounded-xl border bg-card shadow-card p-5">
          <h3 className="font-semibold text-foreground mb-4">Indicateurs de performance</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Patients fidélisés", value: stats.uniquePatients > 0 ? `${Math.min(100, Math.round((stats.uniquePatients / Math.max(1, stats.doneCount)) * 100))}%` : "—", desc: "Taux de patients uniques", color: "bg-primary" },
              { label: "Satisfaction", value: stats.avgRating > 0 ? `${stats.avgRating}/5` : "—", desc: `Basée sur ${stats.reviewCount} avis`, color: "bg-accent" },
              { label: "Taux d'annulation", value: `${stats.cancellationRate}%`, desc: periodLabels[period], color: "bg-warning" },
              { label: "Téléconsultation", value: `${stats.teleconsultPct}%`, desc: "Part des consultations", color: "bg-primary" },
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
      </FeatureGate>
    </DashboardLayout>
  );
};

export default DoctorStats;
