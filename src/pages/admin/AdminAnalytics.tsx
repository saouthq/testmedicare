import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Users, Calendar, CreditCard, Activity, Globe, TrendingUp, ArrowUpRight, ArrowDownRight, MapPin, BarChart3 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const userGrowthData = [
  { month: "Sep", patients: 1200, doctors: 250 },
  { month: "Oct", patients: 1450, doctors: 270 },
  { month: "Nov", patients: 1700, doctors: 290 },
  { month: "Déc", patients: 1950, doctors: 310 },
  { month: "Jan", patients: 2300, doctors: 330 },
  { month: "Fév", patients: 2847, doctors: 342 },
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
            <div className="h-56 flex items-center justify-center text-muted-foreground">
              [Graphique simplifié pour la démo]
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;