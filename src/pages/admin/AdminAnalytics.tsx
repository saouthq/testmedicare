/**
 * AdminAnalytics — Unified analytics dashboard with tabs:
 * Vue d'ensemble | Revenus | Performance médecins | Satisfaction & NPS
 * Fusionné depuis: AdminAnalytics, AdminRevenue, AdminDoctorPerformance, AdminSatisfaction
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
  Star, ThumbsUp, ThumbsDown, AlertTriangle, Search, Eye, Clock, MessageSquare,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar,
  PieChart, Pie, Cell, CartesianGrid, LineChart, Line,
} from "recharts";

// ── Shared mock data ────────────────────
const PIE_COLORS = ["hsl(205,85%,45%)", "hsl(160,60%,45%)", "hsl(45,93%,47%)", "hsl(0,72%,51%)"];
const chartStyle = { borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' };
const tickStyle = { fontSize: 11, fill: 'hsl(var(--muted-foreground))' };

// ── Overview data ──
const userGrowthData = [
  { month: "Sep", patients: 1200, doctors: 250 }, { month: "Oct", patients: 1450, doctors: 270 },
  { month: "Nov", patients: 1700, doctors: 290 }, { month: "Déc", patients: 1950, doctors: 310 },
  { month: "Jan", patients: 2300, doctors: 330 }, { month: "Fév", patients: 2847, doctors: 342 },
];
const revenueByRegion = [
  { region: "Tunis", revenue: 18500 }, { region: "Ariana", revenue: 8200 }, { region: "Sousse", revenue: 6800 },
  { region: "Sfax", revenue: 5400 }, { region: "Monastir", revenue: 3200 }, { region: "Nabeul", revenue: 2800 },
  { region: "Bizerte", revenue: 2100 }, { region: "Autres", revenue: 1750 },
];
const rdvByType = [
  { name: "Consultation", value: 4200 }, { name: "Suivi", value: 1800 },
  { name: "Téléconsult", value: 1100 }, { name: "Urgence", value: 100 },
];
const topSpecialties = [
  { specialty: "Généraliste", count: 890, pct: 35 }, { specialty: "Cardiologue", count: 410, pct: 16 },
  { specialty: "Dermatologue", count: 380, pct: 15 }, { specialty: "Pédiatre", count: 320, pct: 13 },
  { specialty: "ORL", count: 280, pct: 11 }, { specialty: "Autres", count: 267, pct: 10 },
];
const kpis = [
  { label: "Utilisateurs actifs (30j)", value: "2,134", change: "+18%", up: true, icon: Users },
  { label: "RDV ce mois", value: "7,200", change: "+15%", up: true, icon: Calendar },
  { label: "Revenu mensuel", value: "48,750 DT", change: "+12%", up: true, icon: CreditCard },
  { label: "Taux de rétention", value: "87%", change: "+2%", up: true, icon: Activity },
  { label: "Téléconsultations", value: "1,100", change: "+35%", up: true, icon: Globe },
  { label: "Taux de conversion", value: "77%", change: "-1%", up: false, icon: TrendingUp },
];

// ── Revenue data ──
const monthlyRevenue = [
  { month: "Oct", subscriptions: 28000, teleconsult: 4200 }, { month: "Nov", subscriptions: 31000, teleconsult: 4800 },
  { month: "Déc", subscriptions: 34000, teleconsult: 5100 }, { month: "Jan", subscriptions: 37500, teleconsult: 5500 },
  { month: "Fév", subscriptions: 41200, teleconsult: 6100 }, { month: "Mar", subscriptions: 44800, teleconsult: 6950 },
];
const planBreakdown = [
  { name: "Gratuit", value: 0, users: 8500 }, { name: "Essentiel", value: 15680, users: 320 },
  { name: "Pro", value: 18705, users: 145 }, { name: "Cabinet+", value: 8970, users: 30 },
];
const PLAN_COLORS = ["hsl(var(--muted-foreground))", "hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--warning))"];
const roleRevenue = [
  { role: "Médecins", revenue: 35200 }, { role: "Pharmacies", revenue: 8400 },
  { role: "Laboratoires", revenue: 5300 }, { role: "Cliniques", revenue: 2850 },
];

// ── Performance data ──
interface DoctorPerf { id: string; name: string; specialty: string; rating: number; totalConsults: number; cancelRate: number; avgWaitMin: number; nps: number; complaints: number; revenueGenerated: number; activePatients: number; retention: number; }
const mockDoctorPerfs: DoctorPerf[] = [
  { id: "d1", name: "Dr. Ahmed Bouazizi", specialty: "Généraliste", rating: 4.8, totalConsults: 1247, cancelRate: 2.1, avgWaitMin: 8, nps: 72, complaints: 0, revenueGenerated: 2580, activePatients: 345, retention: 94 },
  { id: "d2", name: "Dr. Sonia Gharbi", specialty: "Dermatologue", rating: 4.6, totalConsults: 834, cancelRate: 5.3, avgWaitMin: 15, nps: 58, complaints: 1, revenueGenerated: 1680, activePatients: 210, retention: 88 },
  { id: "d3", name: "Dr. Karim Bouzid", specialty: "Cardiologue", rating: 4.9, totalConsults: 456, cancelRate: 1.2, avgWaitMin: 5, nps: 85, complaints: 0, revenueGenerated: 3420, activePatients: 180, retention: 97 },
  { id: "d4", name: "Dr. Nadia Hamdi", specialty: "Dermatologue", rating: 3.8, totalConsults: 312, cancelRate: 12.4, avgWaitMin: 28, nps: 25, complaints: 3, revenueGenerated: 890, activePatients: 95, retention: 71 },
  { id: "d5", name: "Dr. Fathi Mejri", specialty: "Psychiatre", rating: 4.2, totalConsults: 589, cancelRate: 8.1, avgWaitMin: 20, nps: 42, complaints: 2, revenueGenerated: 1950, activePatients: 165, retention: 82 },
  { id: "d6", name: "Dr. Leila Mansouri", specialty: "Pédiatre", rating: 4.7, totalConsults: 978, cancelRate: 3.0, avgWaitMin: 10, nps: 68, complaints: 0, revenueGenerated: 2100, activePatients: 290, retention: 92 },
];

// ── Satisfaction data ──
const npsHistory = [
  { month: "Sep", nps: 62 }, { month: "Oct", nps: 65 }, { month: "Nov", nps: 68 },
  { month: "Déc", nps: 64 }, { month: "Jan", nps: 71 }, { month: "Fév", nps: 74 }, { month: "Mar", nps: 72 },
];
const ratingDistribution = [
  { stars: "5★", count: 1245 }, { stars: "4★", count: 890 }, { stars: "3★", count: 342 },
  { stars: "2★", count: 98 }, { stars: "1★", count: 45 },
];
const recentReviews = [
  { id: 1, patient: "Amine B.", doctor: "Dr. Bouazizi", rating: 5, text: "Excellent médecin, très à l'écoute.", date: "10 Mar 2026" },
  { id: 2, patient: "Fatma T.", doctor: "Dr. Gharbi", rating: 4, text: "Bonne prise en charge, un peu d'attente.", date: "9 Mar 2026" },
  { id: 3, patient: "Salma D.", doctor: "Dr. Mejri", rating: 2, text: "Attente trop longue, consultation expédiée.", date: "8 Mar 2026" },
  { id: 4, patient: "Mohamed S.", doctor: "Dr. Mansour", rating: 5, text: "Excellente gynécologue, suivi parfait.", date: "8 Mar 2026" },
  { id: 5, patient: "Nadia J.", doctor: "Dr. Hamza", rating: 1, text: "Impossible d'avoir un RDV, aucun suivi.", date: "7 Mar 2026" },
];

const getNpsColor = (nps: number) => nps >= 50 ? "text-accent" : nps >= 0 ? "text-warning" : "text-destructive";
const getRatingColor = (r: number) => r >= 4.5 ? "text-accent" : r >= 3.5 ? "text-warning" : "text-destructive";

const AdminAnalytics = () => {
  const [period, setPeriod] = useState("6m");
  const [perfSearch, setPerfSearch] = useState("");
  const [perfSort, setPerfSort] = useState<"rating" | "nps" | "cancelRate" | "revenue">("rating");
  const [selectedDoc, setSelectedDoc] = useState<DoctorPerf | null>(null);

  const perfFiltered = useMemo(() => {
    let list = [...mockDoctorPerfs];
    if (perfSearch) { const q = perfSearch.toLowerCase(); list = list.filter(d => d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q)); }
    list.sort((a, b) => perfSort === "rating" ? b.rating - a.rating : perfSort === "nps" ? b.nps - a.nps : perfSort === "cancelRate" ? a.cancelRate - b.cancelRate : b.revenueGenerated - a.revenueGenerated);
    return list;
  }, [perfSearch, perfSort]);

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
                <p className={`text-[10px] font-medium mt-1 flex items-center gap-0.5 ${k.up ? "text-accent" : "text-destructive"}`}>
                  {k.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}{k.change}
                </p>
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
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />Revenus par gouvernorat</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByRegion} layout="vertical" margin={{ left: 10 }}>
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ ...tickStyle, fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="region" axisLine={false} tickLine={false} tick={tickStyle} width={65} />
                    <Tooltip formatter={(v: number) => [`${v.toLocaleString()} DT`, "Revenu"]} contentStyle={chartStyle} />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" />RDV par type</h3>
              <div className="h-52 flex items-center gap-6">
                <div className="h-full w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart><Pie data={rdvByType} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                      {rdvByType.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie><Tooltip formatter={(v: number) => [v.toLocaleString(), "RDV"]} contentStyle={chartStyle} /></PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {rdvByType.map((r, i) => (
                    <div key={r.name} className="flex items-center gap-2"><div className="h-3 w-3 rounded-sm shrink-0" style={{ background: PIE_COLORS[i] }} /><span className="text-xs text-foreground">{r.name}</span><span className="text-xs text-muted-foreground ml-auto">{r.value.toLocaleString()}</span></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Stethoscope className="h-4 w-4 text-primary" />Top spécialités</h3>
              <div className="space-y-3">
                {topSpecialties.map(s => (
                  <div key={s.specialty}><div className="flex items-center justify-between text-xs mb-1"><span className="text-foreground font-medium">{s.specialty}</span><span className="text-muted-foreground">{s.count} ({s.pct}%)</span></div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary/70 rounded-full" style={{ width: `${s.pct}%` }} /></div></div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ════ REVENUE ════ */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Banknote, value: "51,750 DT", label: "MRR", change: "+9.4%", color: "text-accent" },
              { icon: TrendingUp, value: "621,000 DT", label: "ARR projeté", color: "text-primary" },
              { icon: Users, value: "52 DT", label: "ARPU", color: "text-primary" },
              { icon: ArrowDownRight, value: "3.2%", label: "Taux de churn", color: "text-destructive" },
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
                <AreaChart data={monthlyRevenue}>
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
              <div className="flex items-center gap-6">
                <div className="h-48 w-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart><Pie data={planBreakdown.filter(p => p.value > 0)} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {planBreakdown.filter(p => p.value > 0).map((_, i) => <Cell key={i} fill={PLAN_COLORS[i + 1]} />)}
                    </Pie><Tooltip formatter={(v: number) => [`${v.toLocaleString()} DT`]} /></PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 flex-1">
                  {planBreakdown.map((p, i) => (
                    <div key={p.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full" style={{ background: PLAN_COLORS[i] }} /><span className="text-foreground">{p.name}</span></div>
                      <div className="text-right"><p className="font-bold text-foreground">{p.value > 0 ? `${p.value.toLocaleString()} DT` : "—"}</p><p className="text-[10px] text-muted-foreground">{p.users} utilisateurs</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4"><CreditCard className="h-4 w-4 text-accent" />Revenus par partenaire</h3>
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
            </div>
          </div>
        </TabsContent>

        {/* ════ PERFORMANCE ════ */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Star, value: (mockDoctorPerfs.reduce((s, d) => s + d.rating, 0) / mockDoctorPerfs.length).toFixed(1), label: "Note moyenne", color: "text-warning" },
              { icon: ThumbsUp, value: String(Math.round(mockDoctorPerfs.reduce((s, d) => s + d.nps, 0) / mockDoctorPerfs.length)), label: "NPS moyen", color: "text-accent" },
              { icon: Users, value: String(mockDoctorPerfs.length), label: "Médecins actifs", color: "text-primary" },
              { icon: AlertTriangle, value: String(mockDoctorPerfs.reduce((s, d) => s + d.complaints, 0)), label: "Plaintes ce mois", color: "text-destructive" },
            ].map((k, i) => (
              <div key={i} className={`rounded-xl border ${k.color === "text-destructive" ? "bg-destructive/5" : "bg-card"} p-5 shadow-card`}>
                <k.icon className={`h-5 w-5 ${k.color} mb-2`} />
                <p className="text-2xl font-bold text-foreground">{k.value}</p>
                <p className="text-xs text-muted-foreground">{k.label}</p>
              </div>
            ))}
          </div>
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
                    <td className="px-4 py-3 text-center"><span className={`font-bold ${getRatingColor(d.rating)}`}><Star className="h-3 w-3 inline mr-0.5" />{d.rating}</span></td>
                    <td className="px-4 py-3 text-center"><span className={`font-bold ${getNpsColor(d.nps)}`}>{d.nps}</span></td>
                    <td className="px-4 py-3 text-center text-foreground hidden md:table-cell">{d.totalConsults}</td>
                    <td className="px-4 py-3 text-center hidden md:table-cell"><span className={`font-medium ${d.cancelRate > 10 ? "text-destructive" : d.cancelRate > 5 ? "text-warning" : "text-accent"}`}>{d.cancelRate}%</span></td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell">{d.complaints > 0 ? <span className="text-xs font-medium bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">{d.complaints}</span> : <span className="text-xs text-accent">✓</span>}</td>
                    <td className="px-4 py-3 text-right"><Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setSelectedDoc(d)}><Eye className="h-4 w-4" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ════ SATISFACTION ════ */}
        <TabsContent value="satisfaction" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: TrendingUp, value: "72", label: "NPS global", color: "bg-primary/10 text-primary" },
              { icon: Star, value: "4.3/5", label: "Note moyenne", color: "bg-warning/10 text-warning" },
              { icon: MessageSquare, value: "2 620", label: "Avis total", color: "bg-accent/10 text-accent" },
              { icon: AlertTriangle, value: "3", label: "Alertes praticiens", color: "bg-destructive/10 text-destructive" },
            ].map((k, i) => (
              <Card key={i}><CardContent className="p-4 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl ${k.color.split(" ")[0]} flex items-center justify-center`}><k.icon className={`h-5 w-5 ${k.color.split(" ")[1]}`} /></div>
                <div><p className="text-2xl font-bold text-foreground">{k.value}</p><p className="text-xs text-muted-foreground">{k.label}</p></div>
              </CardContent></Card>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card><CardHeader><CardTitle className="text-base">Évolution du NPS</CardTitle></CardHeader><CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={npsHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip /><Line type="monotone" dataKey="nps" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Distribution des notes</CardTitle></CardHeader><CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ratingDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} /><YAxis dataKey="stars" type="category" tick={{ fontSize: 11 }} width={30} />
                  <Tooltip /><Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent></Card>
          </div>
          <Card><CardHeader><CardTitle className="text-base">Derniers avis</CardTitle></CardHeader><CardContent className="space-y-3">
            {recentReviews.map(r => (
              <div key={r.id} className="flex items-start gap-3 rounded-lg border p-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">{r.patient.split(" ").map(n => n[0]).join("")}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5"><span className="text-sm font-medium text-foreground">{r.patient}</span><span className="text-xs text-muted-foreground">→ {r.doctor}</span><span className="ml-auto text-xs text-muted-foreground">{r.date}</span></div>
                  <div className="flex gap-0.5 mb-1">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-warning text-warning" : "text-muted"}`} />)}</div>
                  <p className="text-xs text-muted-foreground">{r.text}</p>
                </div>
              </div>
            ))}
          </CardContent></Card>
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
                  { l: "Note", v: `${selectedDoc.rating}/5`, c: getRatingColor(selectedDoc.rating) },
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
            </ScrollArea>
          </>)}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default AdminAnalytics;
