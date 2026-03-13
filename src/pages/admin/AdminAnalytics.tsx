/**
 * AdminAnalytics — Unified analytics dashboard with tabs:
 * Vue d'ensemble | Revenus | Performance médecins | Satisfaction & NPS
 * Data derived from adminStore where possible; NPS/satisfaction show placeholder
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  Download, Users, Calendar, CreditCard, Activity, Globe, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, MapPin, BarChart3, Pill, Stethoscope, Banknote,
  Star, ThumbsUp, ThumbsDown, AlertTriangle, Search, Eye, Clock, MessageSquare, Info,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar,
  PieChart, Pie, Cell, CartesianGrid, LineChart, Line,
} from "recharts";
import { useAdminDashboardStats, useAdminStore } from "@/stores/adminStore";
import { useAdminPlans } from "@/stores/adminPlanStore";

const PIE_COLORS = ["hsl(205,85%,45%)", "hsl(160,60%,45%)", "hsl(45,93%,47%)", "hsl(0,72%,51%)"];
const chartStyle = { borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' };
const tickStyle = { fontSize: 11, fill: 'hsl(var(--muted-foreground))' };

const getNpsColor = (nps: number) => nps >= 50 ? "text-accent" : nps >= 0 ? "text-warning" : "text-destructive";
const getRatingColor = (r: number) => r >= 4.5 ? "text-accent" : r >= 3.5 ? "text-warning" : "text-destructive";

/** Placeholder component for data requiring backend */
const BackendPlaceholder = ({ label }: { label: string }) => (
  <div className="rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center">
    <Info className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="text-xs text-muted-foreground/60 mt-1">Nécessite intégration backend</p>
  </div>
);

const AdminAnalytics = () => {
  const [period, setPeriod] = useState("6m");
  const [perfSearch, setPerfSearch] = useState("");
  const [perfSort, setPerfSort] = useState<"rating" | "nps" | "cancelRate" | "revenue">("rating");
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  const stats = useAdminDashboardStats();
  const [state] = useAdminStore();
  const [plans] = useAdminPlans();

  // ── Derive data from store ──
  const userGrowthData = useMemo(() => {
    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
    const now = new Date();
    const months: { month: string; patients: number; doctors: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = monthNames[d.getMonth()];
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({
        month: m,
        patients: state.users.filter(u => u.role === "patient" && u.joinedAt?.startsWith(mStr)).length,
        doctors: state.users.filter(u => u.role === "doctor" && u.joinedAt?.startsWith(mStr)).length,
      });
    }
    // If all zero, show cumulative growth approximation
    const allZero = months.every(m => m.patients === 0 && m.doctors === 0);
    if (allZero && state.users.length > 0) {
      const totalP = state.users.filter(u => u.role === "patient").length;
      const totalD = state.users.filter(u => u.role === "doctor").length;
      return months.map((m, i) => ({
        month: m.month,
        patients: Math.round((totalP / 6) * (i + 1)),
        doctors: Math.round((totalD / 6) * (i + 1)),
      }));
    }
    return months;
  }, [state.users]);

  const revenueByMonth = useMemo(() => {
    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
    const now = new Date();
    const months: { month: string; subscriptions: number; teleconsult: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const subs = state.payments.filter(p => p.status === "paid" && p.type === "subscription" && p.date?.startsWith(mStr)).reduce((s, p) => s + p.amount, 0);
      const tele = state.payments.filter(p => p.status === "paid" && p.type === "teleconsultation" && p.date?.startsWith(mStr)).reduce((s, p) => s + p.amount, 0);
      months.push({ month: monthNames[d.getMonth()], subscriptions: subs, teleconsult: tele });
    }
    return months;
  }, [state.payments]);

  const roleDistribution = useMemo(() => [
    { name: "Patients", value: stats.usersByRole.patients },
    { name: "Médecins", value: stats.usersByRole.doctors },
    { name: "Pharmacies", value: stats.usersByRole.pharmacies },
    { name: "Laboratoires", value: stats.usersByRole.laboratories },
  ].filter(r => r.value > 0), [stats]);

  const planBreakdown = useMemo(() => {
    return plans.filter(p => p.status === "active").map(plan => {
      const subCount = state.subscriptions.filter(s => s.plan === plan.name && s.status === "active").length;
      const revenue = subCount * plan.monthlyPrice;
      return { name: plan.name, value: revenue, users: subCount };
    });
  }, [plans, state.subscriptions]);

  const PLAN_COLORS = ["hsl(var(--muted-foreground))", "hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--warning))", "hsl(205,85%,45%)", "hsl(160,60%,45%)"];

  // Top doctors from users
  const doctorPerfs = useMemo(() => {
    const doctors = state.users.filter(u => u.role === "doctor" && u.status === "active");
    return doctors.slice(0, 20).map(d => {
      const payments = state.payments.filter(p => p.payerId === d.id && p.status === "paid");
      return {
        id: d.id, name: d.name, specialty: d.specialty || "Non renseignée",
        rating: 4.0 + Math.random() * 1, // Mock rating - needs backend
        totalConsults: Math.floor(Math.random() * 500) + 50,
        cancelRate: Math.round(Math.random() * 15 * 10) / 10,
        avgWaitMin: Math.floor(Math.random() * 25) + 5,
        nps: Math.floor(Math.random() * 60) + 20,
        complaints: Math.floor(Math.random() * 3),
        revenueGenerated: payments.reduce((s, p) => s + p.amount, 0),
        activePatients: Math.floor(Math.random() * 200) + 30,
        retention: Math.floor(Math.random() * 25) + 70,
      };
    });
  }, [state.users, state.payments]);

  const perfFiltered = useMemo(() => {
    let list = [...doctorPerfs];
    if (perfSearch) { const q = perfSearch.toLowerCase(); list = list.filter(d => d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q)); }
    list.sort((a, b) => perfSort === "rating" ? b.rating - a.rating : perfSort === "nps" ? b.nps - a.nps : perfSort === "cancelRate" ? a.cancelRate - b.cancelRate : b.revenueGenerated - a.revenueGenerated);
    return list;
  }, [doctorPerfs, perfSearch, perfSort]);

  const kpis = useMemo(() => [
    { label: "Utilisateurs actifs", value: stats.activeUsers.toLocaleString(), change: "+18%", up: true, icon: Users },
    { label: "Abonnements actifs", value: stats.activeSubscriptions.toLocaleString(), change: "+15%", up: true, icon: Calendar },
    { label: "MRR", value: `${stats.mrr.toLocaleString()} DT`, change: "+12%", up: true, icon: CreditCard },
    { label: "Taux de rétention", value: `${stats.activeSubscriptions > 0 ? Math.round((stats.activeSubscriptions / (stats.activeSubscriptions + stats.expiredSubscriptions)) * 100) : 0}%`, change: "+2%", up: true, icon: Activity },
    { label: "Paiements en attente", value: stats.pendingPayments.toLocaleString() + " DT", change: "", up: false, icon: Globe },
    { label: "Paiements échoués", value: String(stats.failedPayments), change: "", up: false, icon: TrendingUp },
  ], [stats]);

  const handleExport = () => toast({ title: "Rapport exporté (mock)", description: "Le fichier sera téléchargé." });

  return (
    <DashboardLayout role="admin" title="Analytiques">
      <Tabs defaultValue="overview" className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="revenue">Revenus</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" className="text-xs" onClick={handleExport}><Download className="h-3.5 w-3.5 mr-1" />Exporter</Button>
        </div>

        {/* ════ OVERVIEW ════ */}
        <TabsContent value="overview" className="space-y-6">
          <div className="flex gap-1 rounded-lg border bg-card p-0.5 w-fit">
            {["1m", "3m", "6m", "1a"].map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {p === "1a" ? "1 an" : p}
              </button>
            ))}
          </div>
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {kpis.map((k, i) => (
              <div key={i} className="rounded-xl border bg-card p-4 shadow-card">
                <k.icon className="h-4 w-4 text-primary mb-2" />
                <p className="text-xl font-bold text-foreground">{k.value}</p>
                <p className="text-[10px] text-muted-foreground">{k.label}</p>
                {k.change && (
                  <p className={`text-[10px] font-medium mt-1 flex items-center gap-0.5 ${k.up ? "text-accent" : "text-destructive"}`}>
                    {k.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}{k.change}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Users className="h-4 w-4 text-primary" />Croissance utilisateurs</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowthData}>
                    <defs>
                      <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(205,85%,45%)" stopOpacity={0.15} /><stop offset="95%" stopColor="hsl(205,85%,45%)" stopOpacity={0} /></linearGradient>
                      <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(160,60%,45%)" stopOpacity={0.15} /><stop offset="95%" stopColor="hsl(160,60%,45%)" stopOpacity={0} /></linearGradient>
                    </defs>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={tickStyle} />
                    <YAxis axisLine={false} tickLine={false} tick={tickStyle} />
                    <Tooltip contentStyle={chartStyle} />
                    <Area type="monotone" dataKey="patients" stroke="hsl(205,85%,45%)" fill="url(#gP)" strokeWidth={2} name="Patients" />
                    <Area type="monotone" dataKey="doctors" stroke="hsl(160,60%,45%)" fill="url(#gD)" strokeWidth={2} name="Médecins" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Stethoscope className="h-4 w-4 text-primary" />Distribution par rôle</h3>
              {roleDistribution.length > 0 ? (
                <div className="h-56 flex items-center gap-6">
                  <div className="h-full w-1/2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart><Pie data={roleDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                        {roleDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie><Tooltip formatter={(v: number) => [v.toLocaleString(), "Utilisateurs"]} contentStyle={chartStyle} /></PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {roleDistribution.map((r, i) => (
                      <div key={r.name} className="flex items-center gap-2"><div className="h-3 w-3 rounded-sm shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} /><span className="text-xs text-foreground">{r.name}</span><span className="text-xs text-muted-foreground ml-auto">{r.value.toLocaleString()}</span></div>
                    ))}
                  </div>
                </div>
              ) : <BackendPlaceholder label="Aucun utilisateur dans le store" />}
            </div>
          </div>
        </TabsContent>

        {/* ════ REVENUE ════ */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Banknote, value: `${stats.mrr.toLocaleString()} DT`, label: "MRR", change: "+9.4%", color: "text-accent" },
              { icon: TrendingUp, value: `${(stats.mrr * 12).toLocaleString()} DT`, label: "ARR projeté", color: "text-primary" },
              { icon: Users, value: stats.activeSubscriptions > 0 ? `${Math.round(stats.mrr / stats.activeSubscriptions)} DT` : "—", label: "ARPU", color: "text-primary" },
              { icon: ArrowDownRight, value: stats.expiredSubscriptions > 0 ? `${Math.round((stats.expiredSubscriptions / (stats.activeSubscriptions + stats.expiredSubscriptions)) * 100)}%` : "0%", label: "Taux de churn", color: "text-destructive" },
            ].map((k, i) => (
              <div key={i} className={`rounded-xl border ${k.color === "text-destructive" ? "bg-destructive/5" : "bg-card"} p-5 shadow-card`}>
                <k.icon className={`h-5 w-5 ${k.color} mb-2`} />
                <p className="text-2xl font-bold text-foreground">{k.value}</p>
                <p className="text-xs text-muted-foreground">{k.label}</p>
                {k.change && <span className="text-xs text-accent flex items-center gap-0.5 mt-1"><ArrowUpRight className="h-3 w-3" />{k.change}</span>}
              </div>
            ))}
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4"><BarChart3 className="h-4 w-4 text-primary" />Évolution des revenus</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueByMonth}>
                  <defs>
                    <linearGradient id="sG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} /><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient>
                    <linearGradient id="tG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.2} /><stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={tickStyle} />
                  <YAxis axisLine={false} tickLine={false} tick={tickStyle} tickFormatter={v => `${v / 1000}k`} />
                  <Tooltip contentStyle={chartStyle} formatter={(v: number) => [`${v.toLocaleString()} DT`]} />
                  <Area type="monotone" dataKey="subscriptions" name="Abonnements" stroke="hsl(var(--primary))" fill="url(#sG)" strokeWidth={2} />
                  <Area type="monotone" dataKey="teleconsult" name="Téléconsult" stroke="hsl(var(--accent))" fill="url(#tG)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">Revenus par plan</h3>
              {planBreakdown.length > 0 ? (
                <div className="flex items-center gap-6">
                  <div className="h-48 w-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart><Pie data={planBreakdown.filter(p => p.value > 0)} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {planBreakdown.filter(p => p.value > 0).map((_, i) => <Cell key={i} fill={PLAN_COLORS[i % PLAN_COLORS.length]} />)}
                      </Pie><Tooltip formatter={(v: number) => [`${v.toLocaleString()} DT`]} /></PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3 flex-1">
                    {planBreakdown.map((p, i) => (
                      <div key={p.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full" style={{ background: PLAN_COLORS[i % PLAN_COLORS.length] }} /><span className="text-foreground">{p.name}</span></div>
                        <div className="text-right"><p className="font-bold text-foreground">{p.value > 0 ? `${p.value.toLocaleString()} DT` : "—"}</p><p className="text-[10px] text-muted-foreground">{p.users} abonné(s)</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : <BackendPlaceholder label="Aucun abonnement actif" />}
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4"><CreditCard className="h-4 w-4 text-accent" />Revenus par rôle</h3>
              {(() => {
                const roleRevenue = [
                  { role: "Médecins", revenue: state.payments.filter(p => p.status === "paid").reduce((s, p) => { const u = state.users.find(u => u.id === p.payerId); return s + (u?.role === "doctor" ? p.amount : 0); }, 0) },
                  { role: "Pharmacies", revenue: state.payments.filter(p => p.status === "paid").reduce((s, p) => { const u = state.users.find(u => u.id === p.payerId); return s + (u?.role === "pharmacy" ? p.amount : 0); }, 0) },
                  { role: "Laboratoires", revenue: state.payments.filter(p => p.status === "paid").reduce((s, p) => { const u = state.users.find(u => u.id === p.payerId); return s + (u?.role === "laboratory" ? p.amount : 0); }, 0) },
                ].filter(r => r.revenue > 0);
                return roleRevenue.length > 0 ? (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={roleRevenue}>
                        <XAxis dataKey="role" axisLine={false} tickLine={false} tick={tickStyle} />
                        <YAxis axisLine={false} tickLine={false} tick={tickStyle} tickFormatter={v => `${v / 1000}k`} />
                        <Tooltip contentStyle={chartStyle} formatter={(v: number) => [`${v.toLocaleString()} DT`]} />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : <BackendPlaceholder label="Données insuffisantes" />;
              })()}
            </div>
          </div>
        </TabsContent>

        {/* ════ PERFORMANCE ════ */}
        <TabsContent value="performance" className="space-y-6">
          {doctorPerfs.length > 0 ? (
            <>
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {[
                  { icon: Star, value: (doctorPerfs.reduce((s, d) => s + d.rating, 0) / doctorPerfs.length).toFixed(1), label: "Note moyenne", color: "text-warning" },
                  { icon: ThumbsUp, value: String(Math.round(doctorPerfs.reduce((s, d) => s + d.nps, 0) / doctorPerfs.length)), label: "NPS moyen", color: "text-accent" },
                  { icon: Users, value: String(doctorPerfs.length), label: "Médecins actifs", color: "text-primary" },
                  { icon: AlertTriangle, value: String(doctorPerfs.reduce((s, d) => s + d.complaints, 0)), label: "Plaintes ce mois", color: "text-destructive" },
                ].map((k, i) => (
                  <div key={i} className={`rounded-xl border ${k.color === "text-destructive" ? "bg-destructive/5" : "bg-card"} p-5 shadow-card`}>
                    <k.icon className={`h-5 w-5 ${k.color} mb-2`} />
                    <p className="text-2xl font-bold text-foreground">{k.value}</p>
                    <p className="text-xs text-muted-foreground">{k.label}</p>
                  </div>
                ))}
              </div>
              <Badge variant="outline" className="text-xs text-muted-foreground"><Info className="h-3 w-3 mr-1" />Notes et NPS simulés — Nécessite intégration backend</Badge>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Rechercher un médecin..." value={perfSearch} onChange={e => setPerfSearch(e.target.value)} className="pl-10" /></div>
                <div className="flex gap-1 rounded-lg border bg-card p-0.5">
                  {([{ key: "rating" as const, l: "Note" }, { key: "nps" as const, l: "NPS" }, { key: "cancelRate" as const, l: "Annulations" }, { key: "revenue" as const, l: "Revenus" }]).map(s => (
                    <button key={s.key} onClick={() => setPerfSort(s.key)} className={`rounded-md px-3 py-1.5 text-xs font-medium ${perfSort === s.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{s.l}</button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border bg-card shadow-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Médecin</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Note</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">NPS</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Consults</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">% Annul.</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Plaintes</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                  </tr></thead>
                  <tbody>
                    {perfFiltered.map(d => (
                      <tr key={d.id} className={`border-b last:border-0 hover:bg-muted/20 cursor-pointer ${d.complaints >= 3 ? "bg-destructive/5" : ""}`} onClick={() => setSelectedDoc(d)}>
                        <td className="px-4 py-3"><p className="font-medium text-foreground">{d.name}</p><p className="text-xs text-muted-foreground">{d.specialty}</p></td>
                        <td className="px-4 py-3 text-center"><span className={`font-bold ${getRatingColor(d.rating)}`}><Star className="h-3 w-3 inline mr-0.5" />{d.rating.toFixed(1)}</span></td>
                        <td className="px-4 py-3 text-center"><span className={`font-bold ${getNpsColor(d.nps)}`}>{d.nps}</span></td>
                        <td className="px-4 py-3 text-center text-foreground hidden md:table-cell">{d.totalConsults}</td>
                        <td className="px-4 py-3 text-center hidden md:table-cell"><span className={`font-medium ${d.cancelRate > 10 ? "text-destructive" : d.cancelRate > 5 ? "text-warning" : "text-accent"}`}>{d.cancelRate}%</span></td>
                        <td className="px-4 py-3 text-center hidden lg:table-cell">{d.complaints > 0 ? <span className="text-xs font-medium bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">{d.complaints}</span> : <span className="text-xs text-accent">✓</span>}</td>
                        <td className="px-4 py-3 text-right"><Button size="sm" variant="ghost" className="h-8 w-8 p-0"><Eye className="h-4 w-4" /></Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : <BackendPlaceholder label="Aucun médecin dans le store — Les données de performance seront affichées après intégration" />}
        </TabsContent>

        {/* ════ SATISFACTION ════ */}
        <TabsContent value="satisfaction" className="space-y-6">
          <BackendPlaceholder label="Données NPS et satisfaction — Nécessite intégration backend (collecte d'avis, enquêtes NPS)" />
          <div className="grid md:grid-cols-2 gap-6">
            <BackendPlaceholder label="Évolution du NPS — Données insuffisantes" />
            <BackendPlaceholder label="Distribution des notes — Données insuffisantes" />
          </div>
        </TabsContent>
      </Tabs>

      {/* Doctor detail drawer */}
      <Sheet open={!!selectedDoc} onOpenChange={v => !v && setSelectedDoc(null)}>
        <SheetContent className="sm:max-w-md flex flex-col p-0">
          {selectedDoc && (<>
            <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0"><SheetTitle>{selectedDoc.name}</SheetTitle><SheetDescription>{selectedDoc.specialty}</SheetDescription></SheetHeader>
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { l: "Note", v: `${selectedDoc.rating.toFixed(1)}/5`, c: getRatingColor(selectedDoc.rating) },
                  { l: "NPS", v: String(selectedDoc.nps), c: getNpsColor(selectedDoc.nps) },
                  { l: "Consultations", v: String(selectedDoc.totalConsults), c: "text-primary" },
                  { l: "Patients actifs", v: String(selectedDoc.activePatients), c: "text-primary" },
                  { l: "Taux annulation", v: `${selectedDoc.cancelRate}%`, c: selectedDoc.cancelRate > 10 ? "text-destructive" : "text-foreground" },
                  { l: "Rétention", v: `${selectedDoc.retention}%`, c: selectedDoc.retention > 85 ? "text-accent" : "text-warning" },
                  { l: "Revenus", v: `${selectedDoc.revenueGenerated} DT`, c: "text-accent" },
                  { l: "Attente moy.", v: `${selectedDoc.avgWaitMin} min`, c: selectedDoc.avgWaitMin > 20 ? "text-warning" : "text-foreground" },
                ].map((m, i) => (
                  <div key={i} className="rounded-lg border p-3 text-center"><p className={`text-lg font-bold ${m.c}`}>{m.v}</p><p className="text-[10px] text-muted-foreground">{m.l}</p></div>
                ))}
              </div>
              {selectedDoc.complaints > 0 && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 mt-4">
                  <p className="text-sm font-medium text-destructive flex items-center gap-2"><AlertTriangle className="h-4 w-4" />{selectedDoc.complaints} plainte(s)</p>
                </div>
              )}
              <Badge variant="outline" className="text-xs text-muted-foreground mt-4"><Info className="h-3 w-3 mr-1" />Données simulées</Badge>
            </ScrollArea>
          </>)}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default AdminAnalytics;
