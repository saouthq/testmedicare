import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Users, Stethoscope, FlaskConical, Pill, TrendingUp, AlertTriangle, CreditCard, Activity, ArrowUpRight, Eye, ChevronRight, BarChart3, Shield, Clock, CheckCircle, XCircle, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const revenueData = [
  { month: "Sep", value: 32000 }, { month: "Oct", value: 35200 }, { month: "Nov", value: 38100 },
  { month: "Déc", value: 41500 }, { month: "Jan", value: 45200 }, { month: "Fév", value: 48750 },
];

const registrationData = [
  { day: "Lun", doctors: 3, patients: 18, others: 2 },
  { day: "Mar", doctors: 5, patients: 22, others: 1 },
  { day: "Mer", doctors: 2, patients: 15, others: 3 },
  { day: "Jeu", doctors: 4, patients: 25, others: 2 },
  { day: "Ven", doctors: 6, patients: 20, others: 4 },
  { day: "Sam", doctors: 1, patients: 8, others: 0 },
  { day: "Dim", doctors: 0, patients: 5, others: 0 },
];

const stats = [
  { label: "Utilisateurs totaux", value: "2,847", change: "+12%", icon: Users, color: "text-primary", link: "/dashboard/admin/users" },
  { label: "Médecins actifs", value: "342", change: "+8%", icon: Stethoscope, color: "text-accent", link: "/dashboard/admin/users" },
  { label: "Laboratoires", value: "45", change: "+3", icon: FlaskConical, color: "text-warning", link: "/dashboard/admin/users" },
  { label: "Pharmacies", value: "78", change: "+5", icon: Pill, color: "text-primary", link: "/dashboard/admin/users" },
];

const pendingApprovals = [
  { id: 1, name: "Dr. Karim Bouzid", role: "Médecin - Cardiologue", date: "18 Fév 2026", docs: "Diplôme + CIN", email: "karim@email.tn" },
  { id: 2, name: "Pharmacie El Amal", role: "Pharmacie - Sousse", date: "19 Fév 2026", docs: "Licence + Registre", email: "elamal@pharmacy.tn" },
  { id: 3, name: "Dr. Nadia Hamdi", role: "Médecin - Dermatologue", date: "20 Fév 2026", docs: "Diplôme + CIN", email: "nadia@email.tn" },
];

const recentActivity = [
  { type: "inscription", desc: "Dr. Karim Bouzid - Cardiologue", time: "Il y a 2h", status: "pending" },
  { type: "abonnement", desc: "Dr. Sonia Gharbi a souscrit Pro (129 DT/mois)", time: "Il y a 3h", status: "success" },
  { type: "signalement", desc: "Signalement sur Dr. Fathi Mejri - Avis suspect", time: "Il y a 5h", status: "warning" },
  { type: "inscription", desc: "Pharmacie El Amal - Sousse", time: "Il y a 6h", status: "pending" },
  { type: "paiement", desc: "Paiement reçu - Labo BioSanté (59 DT)", time: "Il y a 8h", status: "success" },
  { type: "signalement", desc: "Patient signale un profil médecin frauduleux", time: "Il y a 12h", status: "warning" },
];

const AdminDashboard = () => {
  const [approvals, setApprovals] = useState(pendingApprovals);

  const handleApprove = (id: number) => {
    setApprovals(prev => prev.filter(a => a.id !== id));
  };
  const handleReject = (id: number) => {
    setApprovals(prev => prev.filter(a => a.id !== id));
  };

  return (
    <DashboardLayout role="admin" title="Administration">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Link key={i} to={s.link} className="rounded-xl border bg-card p-5 shadow-card hover:shadow-md transition-all group cursor-pointer">
              <div className="flex items-center justify-between">
                <s.icon className={`h-5 w-5 ${s.color}`} />
                <span className="text-xs font-medium text-accent flex items-center gap-0.5">{s.change}<ArrowUpRight className="h-3 w-3" /></span>
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1 group-hover:text-primary transition-colors">{s.label}</p>
            </Link>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Revenus mensuels</h3>
              <span className="text-xs text-accent font-medium bg-accent/10 px-2 py-0.5 rounded-full">+15% ce mois</span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `${v / 1000}k`} />
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString()} DT`, "Revenus"]} contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#revGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><BarChart3 className="h-4 w-4 text-accent" />Inscriptions cette semaine</h3>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={registrationData} barGap={2}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                  <Bar dataKey="patients" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Patients" />
                  <Bar dataKey="doctors" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Médecins" />
                  <Bar dataKey="others" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} name="Autres" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        {approvals.length > 0 && (
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Inscriptions en attente de validation
              <span className="text-xs bg-warning text-warning-foreground px-2 py-0.5 rounded-full ml-1">{approvals.length}</span>
            </h3>
            <div className="space-y-3">
              {approvals.map(a => (
                <div key={a.id} className="flex items-center justify-between rounded-lg bg-card border p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                      {a.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.role} • {a.date} • Documents : {a.docs}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => handleReject(a.id)}>
                      <XCircle className="h-3.5 w-3.5 mr-1" />Refuser
                    </Button>
                    <Button size="sm" className="gradient-primary text-primary-foreground text-xs" onClick={() => handleApprove(a.id)}>
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />Valider
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />Activité récente
              </h3>
              <Link to="/dashboard/admin/moderation" className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5">
                Voir tout<ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b last:border-0 hover:bg-muted/20 rounded-lg px-2 -mx-2 transition-colors cursor-pointer">
                  <div className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${a.status === "success" ? "bg-accent" : a.status === "warning" ? "bg-warning" : "bg-primary"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{a.desc}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
                  </div>
                  {a.status === "pending" && <span className="text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0">À valider</span>}
                  {a.status === "warning" && (
                    <Link to="/dashboard/admin/moderation" className="text-[10px] font-medium bg-warning/10 text-warning px-2 py-0.5 rounded-full shrink-0 hover:bg-warning/20">
                      Signalement
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Subscriptions Overview */}
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />Abonnements
              </h3>
              <Link to="/dashboard/admin/subscriptions" className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5">
                Détails<ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-4">
              {[
                { label: "Médecins", total: 342, breakdown: [{ plan: "Basic (39 DT)", count: 198, color: "bg-primary/10 text-primary" }, { plan: "Pro (129 DT)", count: 144, color: "bg-accent/10 text-accent" }], revenue: "33,294 DT" },
                { label: "Laboratoires", total: 45, breakdown: [{ plan: "Standard (59 DT)", count: 45, color: "bg-primary/10 text-primary" }], revenue: "2,655 DT" },
                { label: "Pharmacies", total: 78, breakdown: [{ plan: "Standard (59 DT)", count: 78, color: "bg-primary/10 text-primary" }], revenue: "4,602 DT" },
              ].map((s, i) => (
                <Link key={i} to="/dashboard/admin/subscriptions" className="block rounded-lg bg-muted/50 p-4 hover:bg-muted/80 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{s.label}</span>
                    <span className="text-sm font-bold text-foreground">{s.total} abonnés</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {s.breakdown.map((b, j) => (
                        <span key={j} className={`text-[10px] ${b.color} px-2 py-0.5 rounded-full`}>{b.plan} : {b.count}</span>
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-accent">{s.revenue}/mois</span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Revenu total mensuel</span>
              <span className="text-lg font-bold text-primary">48,750 DT</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Gérer les utilisateurs", icon: Users, link: "/dashboard/admin/users", color: "bg-primary/10 text-primary" },
            { label: "Voir les abonnements", icon: CreditCard, link: "/dashboard/admin/subscriptions", color: "bg-accent/10 text-accent" },
            { label: "Modération", icon: Shield, link: "/dashboard/admin/moderation", color: "bg-warning/10 text-warning" },
            { label: "Paramètres", icon: Clock, link: "/dashboard/admin/settings", color: "bg-muted text-muted-foreground" },
          ].map((a, i) => (
            <Link key={i} to={a.link} className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-card hover:shadow-md transition-all group">
              <div className={`p-2 rounded-lg ${a.color}`}><a.icon className="h-5 w-5" /></div>
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{a.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
