/**
 * Admin Dashboard — All KPIs derived from central admin store
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import {
  Users, ShieldCheck, MessageSquare, ScrollText, Pill, Clock,
  ArrowUpRight, ArrowRight, TrendingUp, BarChart3,
  Gavel, CreditCard, Flag, Activity, Server, Zap, Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getLogs } from "@/services/admin/adminAuditService";
import { useAdminDashboardStats, useAdminStore } from "@/stores/adminStore";

const revenueChartData = [
  { month: "Sep", value: 28000 }, { month: "Oct", value: 32000 },
  { month: "Nov", value: 36000 }, { month: "Déc", value: 38000 },
  { month: "Jan", value: 42000 }, { month: "Fév", value: 48750 },
];
const topSearchedMeds = [
  { name: "Doliprane 1000mg", searches: "12,450" },
  { name: "Augmentin 1g", searches: "8,200" },
  { name: "Ventoline", searches: "6,800" },
  { name: "Amoxicilline 500mg", searches: "5,400" },
  { name: "Voltarène gel", searches: "4,100" },
];

const AdminDashboard = () => {
  const stats = useAdminDashboardStats();
  const [state] = useAdminStore();
  const recentLogs = useMemo(() => getLogs().slice(0, 5), []);

  const pendingApps = state.onboardingApplications.filter(a => a.status === "pending").slice(0, 3);
  const openTickets = state.tickets.filter(t => t.status === "open");
  const openDisputes = state.disputes.filter(d => d.status === "open" || d.status === "investigating");
  const guardCount = state.guardPharmacies.filter(p => p.isGuard).length;

  const recentActivity = useMemo(() => [
    { desc: `${stats.activeUsers} utilisateurs actifs`, time: "Maintenant", status: "success" },
    { desc: `${stats.pendingVerifications} validation(s) KYC en attente`, time: "Aujourd'hui", status: stats.pendingVerifications > 0 ? "warning" : "success" },
    { desc: `${stats.openTickets} ticket(s) support ouvert(s)`, time: "Aujourd'hui", status: stats.openTickets > 0 ? "warning" : "success" },
    { desc: `MRR : ${stats.mrr.toLocaleString()} DT`, time: "Ce mois", status: "info" },
    { desc: `${stats.failedPayments} paiement(s) échoué(s)`, time: "Ce mois", status: stats.failedPayments > 0 ? "warning" : "success" },
  ], [stats]);

  return (
    <DashboardLayout role="admin" title="Administration">
      <div className="space-y-6">
        {/* KPI Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Users, label: "Utilisateurs", link: "/dashboard/admin/users", value: stats.totalUsers.toLocaleString(), change: `${stats.activeUsers} actifs`, color: "text-primary" },
            { icon: Gavel, label: "Litiges ouverts", link: "/dashboard/admin/resolution", value: String(stats.openDisputes + stats.investigatingDisputes), change: "À traiter", color: "text-destructive" },
            { icon: ShieldCheck, label: "Validations KYC", link: "/dashboard/admin/verifications", value: String(stats.pendingVerifications), change: "En attente", color: "text-warning" },
            { icon: CreditCard, label: "Revenus (MRR)", link: "/dashboard/admin/payments", value: `${stats.mrr.toLocaleString()} DT`, change: `${stats.totalRevenue.toLocaleString()} DT total`, color: "text-accent" },
          ].map((kpi, i) => (
            <Link key={i} to={kpi.link} className="rounded-xl border bg-card p-5 shadow-card hover:shadow-md transition-all group cursor-pointer">
              <div className="flex items-center justify-between">
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                <span className="text-xs font-medium text-accent flex items-center gap-0.5">{kpi.change}<ArrowUpRight className="h-3 w-3" /></span>
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1 group-hover:text-primary transition-colors">{kpi.label}</p>
            </Link>
          ))}
        </div>

        {/* System Health Banner */}
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
              <Server className="h-4 w-4 text-accent" />Santé système
            </h3>
            <span className="text-xs font-medium bg-accent/10 text-accent px-2 py-0.5 rounded-full flex items-center gap-1">
              <Activity className="h-3 w-3" />Opérationnel
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Uptime", value: "99.97%", color: "text-accent" },
              { label: "Temps réponse", value: "142ms", color: "text-primary" },
              { label: "En ligne", value: "234", color: "text-foreground" },
              { label: "Requêtes/min", value: "1,247", color: "text-foreground" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action widgets row */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm"><ShieldCheck className="h-4 w-4 text-warning" />Validations</h3>
              <span className="text-xs font-bold bg-warning/10 text-warning px-2 py-0.5 rounded-full">{stats.pendingVerifications}</span>
            </div>
            <div className="space-y-2 mb-3">
              {pendingApps.map(a => (
                <div key={a.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                  <div><p className="font-medium text-foreground text-xs">{a.entityName}</p><p className="text-[10px] text-muted-foreground">{a.entityType}</p></div>
                  <span className="text-[10px] text-muted-foreground">{a.submittedAt.split("T")[0]}</span>
                </div>
              ))}
              {pendingApps.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">Aucune en attente</p>}
            </div>
            <Link to="/dashboard/admin/verifications"><Button size="sm" className="w-full gradient-primary text-primary-foreground text-xs"><ArrowRight className="h-3 w-3 mr-1" />Traiter</Button></Link>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm"><MessageSquare className="h-4 w-4 text-primary" />Tickets</h3>
              <span className="text-xs font-bold bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">{openTickets.length}</span>
            </div>
            <div className="space-y-2 mb-3">
              {openTickets.slice(0, 3).map(t => (
                <div key={t.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                  <div><p className="font-medium text-foreground text-xs truncate max-w-[140px]">{t.subject}</p><p className="text-[10px] text-muted-foreground">{t.requester}</p></div>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${t.priority === "high" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>{t.priority === "high" ? "Urgent" : "Moyen"}</span>
                </div>
              ))}
            </div>
            <Link to="/dashboard/admin/resolution"><Button size="sm" variant="outline" className="w-full text-xs"><ArrowRight className="h-3 w-3 mr-1" />Voir les tickets</Button></Link>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm"><Gavel className="h-4 w-4 text-destructive" />Litiges</h3>
              <span className="text-xs font-bold bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">{openDisputes.length} ouverts</span>
            </div>
            <div className="space-y-2 mb-3">
              {openDisputes.slice(0, 3).map(d => (
                <div key={d.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                  <div><p className="font-medium text-foreground text-xs truncate max-w-[140px]">{d.subject}</p><p className="text-[10px] text-muted-foreground">{d.patientName}</p></div>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${d.priority === "high" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>{d.priority === "high" ? "Urgent" : "Moyen"}</span>
                </div>
              ))}
            </div>
            <Link to="/dashboard/admin/resolution"><Button size="sm" variant="outline" className="w-full text-xs text-destructive border-destructive/30"><ArrowRight className="h-3 w-3 mr-1" />Gérer les litiges</Button></Link>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between mb-2"><h3 className="font-semibold text-foreground flex items-center gap-2 text-sm"><Pill className="h-4 w-4 text-accent" />Garde</h3><span className="text-xs font-bold text-accent">{guardCount}</span></div>
              <div className="space-y-1">{state.guardPharmacies.filter(p => p.isGuard).slice(0, 2).map(p => (<p key={p.id} className="text-xs text-muted-foreground truncate">{p.name} — {p.city}</p>))}</div>
              <Link to="/dashboard/admin/guard-pharmacies" className="text-xs text-primary hover:underline mt-2 inline-block">Gérer →</Link>
            </div>
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between mb-2"><h3 className="font-semibold text-foreground flex items-center gap-2 text-sm"><Flag className="h-4 w-4 text-warning" />Signalements</h3><span className="text-xs font-bold text-warning">{stats.pendingReports}</span></div>
              <Link to="/dashboard/admin/resolution" className="text-xs text-primary hover:underline">Modérer →</Link>
            </div>
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between mb-2"><h3 className="font-semibold text-foreground flex items-center gap-2 text-sm"><Bell className="h-4 w-4 text-primary" />Campagnes</h3><span className="text-xs font-bold text-primary">{stats.activeCampaigns} actives</span></div>
              <Link to="/dashboard/admin/campaigns" className="text-xs text-primary hover:underline">Voir →</Link>
            </div>
          </div>
        </div>

        {/* Charts + Logs */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" />Revenus mensuels</h3>
              <span className="text-xs text-accent font-medium bg-accent/10 px-2 py-0.5 rounded-full">MRR {stats.mrr.toLocaleString()} DT</span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData}>
                  <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} /><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient></defs>
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
              <h3 className="font-semibold text-foreground flex items-center gap-2"><ScrollText className="h-4 w-4 text-accent" />Audit logs récents</h3>
              <Link to="/dashboard/admin/logs" className="text-xs text-primary hover:underline">Tout voir</Link>
            </div>
            {recentLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucun log récent. Les actions admin apparaîtront ici.</p>
            ) : (
              <div className="space-y-3">
                {recentLogs.map(log => (
                  <div key={log.id} className="flex items-start gap-3 text-sm">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-foreground truncate">{log.summary}</p>
                      <p className="text-[10px] text-muted-foreground">{log.actorAdminName} · {new Date(log.createdAt).toLocaleString("fr-TN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top meds + Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4"><TrendingUp className="h-4 w-4 text-primary" />Top recherches médicaments</h3>
            {topSearchedMeds.map((m, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-2 border-b last:border-0">
                <span className="text-muted-foreground">{i + 1}. {m.name}</span>
                <span className="font-medium text-foreground">{m.searches}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Zap className="h-4 w-4 text-warning" />Activité en temps réel</h3>
            <div className="space-y-3">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-center gap-3 text-sm py-2 border-b last:border-0">
                  <div className={`h-2 w-2 rounded-full shrink-0 ${a.status === "success" ? "bg-accent" : a.status === "warning" ? "bg-warning" : "bg-primary"}`} />
                  <span className="flex-1 text-foreground text-xs">{a.desc}</span>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
