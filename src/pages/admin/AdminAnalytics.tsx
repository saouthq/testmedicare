/**
 * Admin Analytics — KPIs, charts, trends
 * TODO BACKEND: Replace mock data with real analytics API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Users, Calendar, CreditCard, Activity, Globe, TrendingUp, ArrowUpRight, ArrowDownRight, MapPin, BarChart3, Pill, Stethoscope } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { toast } from "@/hooks/use-toast";

const userGrowthData = [
  { month: "Sep", patients: 1200, doctors: 250 },
  { month: "Oct", patients: 1450, doctors: 270 },
  { month: "Nov", patients: 1700, doctors: 290 },
  { month: "Déc", patients: 1950, doctors: 310 },
  { month: "Jan", patients: 2300, doctors: 330 },
  { month: "Fév", patients: 2847, doctors: 342 },
];

const revenueByRegion = [
  { region: "Tunis", revenue: 18500 },
  { region: "Ariana", revenue: 8200 },
  { region: "Sousse", revenue: 6800 },
  { region: "Sfax", revenue: 5400 },
  { region: "Monastir", revenue: 3200 },
  { region: "Nabeul", revenue: 2800 },
  { region: "Bizerte", revenue: 2100 },
  { region: "Autres", revenue: 1750 },
];

const rdvByType = [
  { name: "Consultation", value: 4200 },
  { name: "Suivi", value: 1800 },
  { name: "Téléconsult", value: 1100 },
  { name: "Urgence", value: 100 },
];
const PIE_COLORS = ["hsl(205,85%,45%)", "hsl(160,60%,45%)", "hsl(45,93%,47%)", "hsl(0,72%,51%)"];

const topSpecialties = [
  { specialty: "Généraliste", count: 890, pct: 35 },
  { specialty: "Cardiologue", count: 410, pct: 16 },
  { specialty: "Dermatologue", count: 380, pct: 15 },
  { specialty: "Pédiatre", count: 320, pct: 13 },
  { specialty: "ORL", count: 280, pct: 11 },
  { specialty: "Autres", count: 267, pct: 10 },
];

const kpis = [
  { label: "Utilisateurs actifs (30j)", value: "2,134", change: "+18%", up: true, icon: Users },
  { label: "RDV ce mois", value: "7,200", change: "+15%", up: true, icon: Calendar },
  { label: "Revenu mensuel", value: "48,750 DT", change: "+12%", up: true, icon: CreditCard },
  { label: "Taux de rétention", value: "87%", change: "+2%", up: true, icon: Activity },
  { label: "Téléconsultations", value: "1,100", change: "+35%", up: true, icon: Globe },
  { label: "Taux de conversion", value: "77%", change: "-1%", up: false, icon: TrendingUp },
];

const AdminAnalytics = () => {
  const [period, setPeriod] = useState("6m");

  const handleExport = () => {
    toast({ title: "Rapport exporté (mock)", description: "Le fichier PDF sera téléchargé." });
  };

  return (
    <DashboardLayout role="admin" title="Analytiques">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1 rounded-lg border bg-card p-0.5">
            {["1m", "3m", "6m", "1a"].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {p === "1a" ? "1 an" : p}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="text-xs" onClick={handleExport}><Download className="h-3.5 w-3.5 mr-1" />Exporter le rapport</Button>
        </div>

        {/* KPIs */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {kpis.map((k, i) => (
            <div key={i} className="rounded-xl border bg-card p-4 shadow-card">
              <k.icon className="h-4 w-4 text-primary mb-2" />
              <p className="text-xl font-bold text-foreground">{k.value}</p>
              <p className="text-[10px] text-muted-foreground">{k.label}</p>
              <p className={`text-[10px] font-medium mt-1 flex items-center gap-0.5 ${k.up ? "text-accent" : "text-destructive"}`}>
                {k.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}{k.change}
              </p>
            </div>
          ))}
        </div>

        {/* Charts row 1 — Growth + Revenue by region */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Users className="h-4 w-4 text-primary" />Croissance utilisateurs</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthData}>
                  <defs>
                    <linearGradient id="gPatients" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(205,85%,45%)" stopOpacity={0.15} /><stop offset="95%" stopColor="hsl(205,85%,45%)" stopOpacity={0} /></linearGradient>
                    <linearGradient id="gDoctors" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(160,60%,45%)" stopOpacity={0.15} /><stop offset="95%" stopColor="hsl(160,60%,45%)" stopOpacity={0} /></linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                  <Area type="monotone" dataKey="patients" stroke="hsl(205,85%,45%)" fill="url(#gPatients)" strokeWidth={2} name="Patients" />
                  <Area type="monotone" dataKey="doctors" stroke="hsl(160,60%,45%)" fill="url(#gDoctors)" strokeWidth={2} name="Médecins" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />Revenus par gouvernorat</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByRegion} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="region" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={65} />
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString()} DT`, "Revenu"]} contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts row 2 — RDV types + Specialties */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" />RDV par type</h3>
            <div className="h-52 flex items-center gap-6">
              <div className="h-full w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={rdvByType} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                      {rdvByType.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [v.toLocaleString(), "RDV"]} contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {rdvByType.map((r, i) => (
                  <div key={r.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm shrink-0" style={{ background: PIE_COLORS[i] }} />
                    <span className="text-xs text-foreground">{r.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{r.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Stethoscope className="h-4 w-4 text-primary" />Top spécialités</h3>
            <div className="space-y-3">
              {topSpecialties.map(s => (
                <div key={s.specialty}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-foreground font-medium">{s.specialty}</span>
                    <span className="text-muted-foreground">{s.count} ({s.pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary/70 rounded-full transition-all" style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;
