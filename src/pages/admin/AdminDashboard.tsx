import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Users, Stethoscope, FlaskConical, Pill, TrendingUp, CreditCard, ArrowUpRight, BarChart3 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { mockAdminStats, mockAdminRevenue } from "@/data/mockData";

const AdminDashboard = () => {
  return (
    <DashboardLayout role="admin" title="Administration">
      <div className="space-y-6">
        {/* Stats */}
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

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Revenus mensuels</h3>
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

          <div className="rounded-xl border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><BarChart3 className="h-4 w-4 text-accent" />Inscriptions cette semaine</h3>
            </div>
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              [Graphique simplifié pour la démo]
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;