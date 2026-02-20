import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  TrendingUp, Users, Stethoscope, Calendar, CreditCard, Download,
  ArrowUpRight, ArrowDownRight, BarChart3, Activity, MapPin, Globe
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const userGrowthData = [
  { month: "Sep", patients: 1200, doctors: 250, pharmacies: 55, labs: 30 },
  { month: "Oct", patients: 1450, doctors: 270, pharmacies: 58, labs: 32 },
  { month: "Nov", patients: 1700, doctors: 290, pharmacies: 62, labs: 35 },
  { month: "Déc", patients: 1950, doctors: 310, pharmacies: 68, labs: 38 },
  { month: "Jan", patients: 2300, doctors: 330, pharmacies: 73, labs: 42 },
  { month: "Fév", patients: 2847, doctors: 342, pharmacies: 78, labs: 45 },
];

const revenueByGouvernorat = [
  { name: "Tunis", value: 18500 },
  { name: "Sousse", value: 8200 },
  { name: "Sfax", value: 7100 },
  { name: "Ariana", value: 5600 },
  { name: "Nabeul", value: 3400 },
  { name: "Bizerte", value: 2900 },
  { name: "Autres", value: 3050 },
];

const conversionData = [
  { month: "Sep", inscriptions: 180, verifies: 145, actifs: 120 },
  { month: "Oct", inscriptions: 210, verifies: 175, actifs: 150 },
  { month: "Nov", inscriptions: 195, verifies: 160, actifs: 135 },
  { month: "Déc", inscriptions: 230, verifies: 195, actifs: 170 },
  { month: "Jan", inscriptions: 260, verifies: 225, actifs: 200 },
  { month: "Fév", inscriptions: 285, verifies: 250, actifs: 220 },
];

const appointmentData = [
  { month: "Sep", total: 4500, teleconsultation: 450 },
  { month: "Oct", total: 5200, teleconsultation: 620 },
  { month: "Nov", total: 5800, teleconsultation: 750 },
  { month: "Déc", total: 5100, teleconsultation: 680 },
  { month: "Jan", total: 6500, teleconsultation: 950 },
  { month: "Fév", total: 7200, teleconsultation: 1100 },
];

const COLORS = ["hsl(205,85%,45%)", "hsl(160,60%,45%)", "hsl(38,92%,50%)", "hsl(0,72%,55%)", "hsl(215,25%,50%)", "hsl(280,60%,50%)", "hsl(160,30%,60%)"];

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
          <Button variant="outline" size="sm" className="text-xs"><Download className="h-3.5 w-3.5 mr-1" />Exporter le rapport</Button>
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

        {/* Charts row 1 */}
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
            <div className="h-56 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={revenueByGouvernorat} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {revenueByGouvernorat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString()} DT`, "Revenu"]} contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {revenueByGouvernorat.map((g, i) => (
                <span key={i} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {g.name} ({g.value.toLocaleString()} DT)
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-accent" />Entonnoir de conversion</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conversionData} barGap={2}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                  <Bar dataKey="inscriptions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Inscriptions" />
                  <Bar dataKey="verifies" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Vérifiés" />
                  <Bar dataKey="actifs" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} name="Actifs" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" />Rendez-vous & Téléconsultations</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={appointmentData}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                  <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" strokeWidth={2} name="Total RDV" />
                  <Area type="monotone" dataKey="teleconsultation" stroke="hsl(var(--accent))" fill="hsl(var(--accent)/0.1)" strokeWidth={2} name="Téléconsultation" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;
