import DashboardLayout from "@/components/layout/DashboardLayout";
import { TrendingUp, Users, Calendar, Banknote, Clock, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const monthlyConsultations = [
  { month: "Sep", count: 98 }, { month: "Oct", count: 112 }, { month: "Nov", count: 105 },
  { month: "Déc", count: 87 }, { month: "Jan", count: 124 }, { month: "Fév", count: 94 },
];

const patientsByType = [
  { name: "Consultation", value: 45, color: "hsl(205, 85%, 45%)" },
  { name: "Suivi", value: 25, color: "hsl(160, 60%, 45%)" },
  { name: "Première visite", value: 15, color: "hsl(38, 92%, 50%)" },
  { name: "Contrôle", value: 15, color: "hsl(205, 30%, 70%)" },
];

const weeklyRevenue = [
  { day: "Lun", revenue: 280 }, { day: "Mar", revenue: 350 }, { day: "Mer", revenue: 175 },
  { day: "Jeu", revenue: 315 }, { day: "Ven", revenue: 245 }, { day: "Sam", revenue: 0 },
];

const stats = [
  { label: "Consultations ce mois", value: "94", change: "+12%", icon: Calendar, color: "text-primary" },
  { label: "Patients actifs", value: "342", change: "+5%", icon: Users, color: "text-accent" },
  { label: "CA mensuel", value: "4 340 DT", change: "+8%", icon: Banknote, color: "text-warning" },
  { label: "Durée moy. consultation", value: "22 min", change: "-3%", icon: Clock, color: "text-primary" },
  { label: "Taux d'occupation", value: "87%", change: "+2%", icon: TrendingUp, color: "text-accent" },
  { label: "Taux d'annulation", value: "4.2%", change: "-1%", icon: Activity, color: "text-destructive" },
];

const DoctorStats = () => {
  return (
    <DashboardLayout role="doctor" title="Statistiques">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map(s => (
            <div key={s.label} className="rounded-xl border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{s.label}</p><s.icon className={`h-5 w-5 ${s.color}`} /></div>
              <div className="flex items-end gap-2 mt-2">
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <span className={`text-xs font-medium ${s.change.startsWith("+") ? "text-accent" : s.change.startsWith("-") ? "text-destructive" : "text-muted-foreground"}`}>{s.change}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Consultations mensuelles</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyConsultations}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(205, 85%, 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Répartition par motif</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart><Pie data={patientsByType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={2}>{patientsByType.map((entry, i) => <Cell key={i} fill={entry.color} />)}</Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {patientsByType.map(p => (<div key={p.name} className="flex items-center gap-1.5 text-xs"><div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} /><span className="text-muted-foreground">{p.name} ({p.value}%)</span></div>))}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-card lg:col-span-2">
            <h3 className="font-semibold text-foreground mb-4">Revenus de la semaine</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }} tickFormatter={v => `${v} DT`} />
                <Tooltip formatter={(value: number) => [`${value} DT`, "Revenus"]} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(160, 60%, 45%)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorStats;
