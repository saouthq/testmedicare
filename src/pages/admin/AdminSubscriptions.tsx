import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { CreditCard, TrendingUp, Users, ArrowUpRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { mockAdminRevenue, mockAdminSubscriptions } from "@/data/mockData";

const AdminSubscriptions = () => {
  return (
    <DashboardLayout role="admin" title="Abonnements & Facturation">
      <div className="space-y-6">
        {/* Revenue stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <CreditCard className="h-5 w-5 text-primary" />
            <p className="mt-3 text-2xl font-bold text-foreground">48,750 DT</p>
            <p className="text-xs text-muted-foreground">Revenus ce mois</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <Users className="h-5 w-5 text-accent" />
            <p className="mt-3 text-2xl font-bold text-foreground">465</p>
            <p className="text-xs text-muted-foreground">Abonnés actifs</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <TrendingUp className="h-5 w-5 text-accent" />
            <p className="mt-3 text-2xl font-bold text-foreground">94%</p>
            <p className="text-xs text-muted-foreground">Taux de rétention</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <ArrowUpRight className="h-5 w-5 text-warning" />
            <p className="mt-3 text-2xl font-bold text-foreground">22</p>
            <p className="text-xs text-muted-foreground">Nouveaux ce mois</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Évolution des revenus</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockAdminRevenue}>
                  <defs>
                    <linearGradient id="subRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `${v / 1000}k`} />
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString()} DT`, "Revenus"]} contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#subRevGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Plans</h3>
            <div className="space-y-4">
              {mockAdminSubscriptions.map((s, i) => (
                <div key={i} className="flex justify-between items-center border-b pb-2 last:border-0">
                  <span>{s.name}</span>
                  <span className="font-bold">{s.revenue}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSubscriptions;