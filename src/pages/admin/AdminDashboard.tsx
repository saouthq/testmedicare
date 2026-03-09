/**
 * Admin Dashboard — Operational overview with actionable widgets
 * TODO BACKEND: Replace mock data with real API calls
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Users, ShieldCheck, MessageSquare, ScrollText, Pill, Clock,
  ArrowUpRight, ArrowRight, AlertTriangle, TrendingUp, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  mockAdminStats, mockAdminRevenue, mockAdminPendingApprovals,
  mockAdminRecentActivity, mockTopSearchedMeds, mockGuardPharmacies, mockAdminTickets
} from "@/data/mockData";
import { getLogs } from "@/services/admin/adminAuditService";

const AdminDashboard = () => {
  const [recentLogs, setRecentLogs] = useState(getLogs().slice(0, 5));
  const pendingValidations = mockAdminPendingApprovals.length;
  const openTickets = mockAdminTickets.filter(t => t.status === "open").length;
  const guardToday = mockGuardPharmacies.filter(p => p.isGuard).length;

  return (
    <DashboardLayout role="admin" title="Administration">
      <div className="space-y-6">
        {/* KPI Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {mockAdminStats.map((s, i) => (
            <Link key={i} to="/dashboard/admin/users" className="rounded-xl border bg-card p-5 shadow-card hover:shadow-md transition-all group cursor-pointer">
              <div className="flex items-center justify-between">
                <Users className={`h-5 w-5 ${s.color}`} />
                <span className="text-xs font-medium text-accent flex items-center gap-0.5">{s.change}<ArrowUpRight className="h-3 w-3" /></span>
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1 group-hover:text-primary transition-colors">{s.label}</p>
            </Link>
          ))}
        </div>

        {/* Action widgets row */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {/* Pending validations */}
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                <ShieldCheck className="h-4 w-4 text-warning" />Validations en attente
              </h3>
              <span className="text-xs font-bold bg-warning/10 text-warning px-2 py-0.5 rounded-full">{pendingValidations}</span>
            </div>
            <div className="space-y-2 mb-3">
              {mockAdminPendingApprovals.slice(0, 3).map(a => (
                <div key={a.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                  <div>
                    <p className="font-medium text-foreground text-xs">{a.name}</p>
                    <p className="text-[10px] text-muted-foreground">{a.role}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{a.date}</span>
                </div>
              ))}
            </div>
            <Link to="/dashboard/admin/verifications">
              <Button size="sm" className="w-full gradient-primary text-primary-foreground text-xs">
                <ArrowRight className="h-3 w-3 mr-1" />Traiter maintenant
              </Button>
            </Link>
          </div>

          {/* Support tickets */}
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                <MessageSquare className="h-4 w-4 text-primary" />Tickets support
              </h3>
              <span className="text-xs font-bold bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">{openTickets} ouverts</span>
            </div>
            <div className="space-y-2 mb-3">
              {mockAdminTickets.filter(t => t.status === "open").slice(0, 3).map(t => (
                <div key={t.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                  <div>
                    <p className="font-medium text-foreground text-xs">{t.subject}</p>
                    <p className="text-[10px] text-muted-foreground">{t.requester}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${t.priority === "high" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>
                    {t.priority === "high" ? "Urgent" : "Moyen"}
                  </span>
                </div>
              ))}
            </div>
            <Link to="/dashboard/admin/support">
              <Button size="sm" variant="outline" className="w-full text-xs">
                <ArrowRight className="h-3 w-3 mr-1" />Voir tous les tickets
              </Button>
            </Link>
          </div>

          {/* Quick info */}
          <div className="space-y-4">
            {/* Guard pharmacies today */}
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                  <Pill className="h-4 w-4 text-accent" />Pharmacies de garde
                </h3>
                <span className="text-xs font-bold text-accent">{guardToday} aujourd'hui</span>
              </div>
              <div className="space-y-1">
                {mockGuardPharmacies.filter(p => p.isGuard).map(p => (
                  <p key={p.id} className="text-xs text-muted-foreground">{p.name} — {p.city}</p>
                ))}
              </div>
              <Link to="/dashboard/admin/guard-pharmacies" className="text-xs text-primary hover:underline mt-2 inline-block">Gérer →</Link>
            </div>
            {/* Top meds */}
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />Top recherches médicaments
              </h3>
              {mockTopSearchedMeds.slice(0, 3).map((m, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1">
                  <span className="text-muted-foreground">{i + 1}. {m.name}</span>
                  <span className="font-medium text-foreground">{m.searches}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts + Recent logs */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" />Revenus mensuels</h3>
              <span className="text-xs text-accent font-medium bg-accent/10 px-2 py-0.5 rounded-full">+15% ce mois</span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockAdminRevenue}>
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

          {/* Recent audit logs */}
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><ScrollText className="h-4 w-4 text-accent" />Logs récents</h3>
              <Link to="/dashboard/admin/audit-logs" className="text-xs text-primary hover:underline">Tout voir</Link>
            </div>
            {recentLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucun log récent</p>
            ) : (
              <div className="space-y-3">
                {recentLogs.map(log => (
                  <div key={log.id} className="flex items-start gap-3 text-sm">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-foreground truncate">{log.summary}</p>
                      <p className="text-[10px] text-muted-foreground">{log.actorAdminName} · {new Date(log.createdAt).toLocaleString("fr-TN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent activity feed */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="font-semibold text-foreground mb-4">Activité récente</h3>
          <div className="space-y-3">
            {mockAdminRecentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-3 text-sm py-2 border-b last:border-0">
                <div className={`h-2 w-2 rounded-full shrink-0 ${a.status === "success" ? "bg-accent" : a.status === "warning" ? "bg-warning" : "bg-primary"}`} />
                <span className="flex-1 text-foreground text-xs">{a.desc}</span>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
