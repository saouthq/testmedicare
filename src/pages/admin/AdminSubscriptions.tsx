import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { CreditCard, TrendingUp, Users, CheckCircle, XCircle, Clock, ArrowUpRight, Stethoscope, FlaskConical, Pill, Edit, Eye, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

type TabFilter = "all" | "doctors" | "laboratories" | "pharmacies";

const revenueHistory = [
  { month: "Sep", value: 32000 }, { month: "Oct", value: 35200 }, { month: "Nov", value: 38100 },
  { month: "Déc", value: 41500 }, { month: "Jan", value: 45200 }, { month: "Fév", value: 48750 },
];

const pieData = [
  { name: "Médecin Basic", value: 198, fill: "hsl(var(--primary))" },
  { name: "Médecin Pro", value: 144, fill: "hsl(var(--accent))" },
  { name: "Laboratoire", value: 45, fill: "hsl(var(--warning))" },
  { name: "Pharmacie", value: 78, fill: "hsl(var(--muted-foreground))" },
];

const plans = [
  { name: "Médecin Basic", price: "39 DT/mois", target: "Médecins", features: ["Agenda en ligne", "Prise de RDV", "Fiche praticien", "5 SMS/mois"], subscribers: 198, icon: Stethoscope, revenue: "7,722 DT" },
  { name: "Médecin Pro", price: "129 DT/mois", target: "Médecins", features: ["Tout Basic +", "Téléconsultation", "Gestion secrétaire", "Ordonnances numériques", "SMS illimités", "Statistiques avancées"], subscribers: 144, icon: Stethoscope, popular: true, revenue: "18,576 DT" },
  { name: "Laboratoire", price: "59 DT/mois", target: "Laboratoires", features: ["Gestion analyses", "Résultats en ligne", "Notifications patients", "Historique complet"], subscribers: 45, icon: FlaskConical, revenue: "2,655 DT" },
  { name: "Pharmacie", price: "59 DT/mois", target: "Pharmacies", features: ["Ordonnances numériques", "Gestion stock", "Alertes rupture", "Historique délivrance"], subscribers: 78, icon: Pill, revenue: "4,602 DT" },
];

const initialTransactions = [
  { id: "TXN-001", user: "Dr. Sonia Gharbi", plan: "Médecin Pro", amount: "129 DT", date: "20 Fév 2026", status: "success" as string },
  { id: "TXN-002", user: "Labo BioSanté", plan: "Laboratoire", amount: "59 DT", date: "19 Fév 2026", status: "success" as string },
  { id: "TXN-003", user: "Dr. Karim Bouzid", plan: "Médecin Basic", amount: "39 DT", date: "18 Fév 2026", status: "pending" as string },
  { id: "TXN-004", user: "Pharmacie Pasteur", plan: "Pharmacie", amount: "59 DT", date: "17 Fév 2026", status: "success" as string },
  { id: "TXN-005", user: "Dr. Fathi Mejri", plan: "Médecin Pro", amount: "129 DT", date: "15 Fév 2026", status: "failed" as string },
  { id: "TXN-006", user: "Dr. Ahmed Bouazizi", plan: "Médecin Pro", amount: "129 DT", date: "14 Fév 2026", status: "success" as string },
  { id: "TXN-007", user: "Pharmacie El Amal", plan: "Pharmacie", amount: "59 DT", date: "13 Fév 2026", status: "success" as string },
];

const AdminSubscriptions = () => {
  const [tab, setTab] = useState<TabFilter>("all");
  const [transactions, setTransactions] = useState(initialTransactions);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [txFilter, setTxFilter] = useState<"all" | "success" | "pending" | "failed">("all");

  const filteredPlans = plans.filter(p => {
    if (tab === "doctors") return p.target === "Médecins";
    if (tab === "laboratories") return p.target === "Laboratoires";
    if (tab === "pharmacies") return p.target === "Pharmacies";
    return true;
  });

  const filteredTx = transactions.filter(t => txFilter === "all" || t.status === txFilter);

  const handleRetry = (id: string) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: "success" } : t));
  };

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
                <AreaChart data={revenueHistory}>
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
            <h3 className="font-semibold text-foreground mb-4">Répartition des abonnés</h3>
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip formatter={(v: number, name: string) => [`${v} abonnés`, name]} contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
                  {d.name} ({d.value})
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Plans */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Plans d'abonnement</h3>
            <div className="flex gap-1 rounded-lg border bg-card p-0.5">
              {([
                { key: "all" as TabFilter, label: "Tous" },
                { key: "doctors" as TabFilter, label: "Médecins" },
                { key: "laboratories" as TabFilter, label: "Labos" },
                { key: "pharmacies" as TabFilter, label: "Pharmacies" },
              ]).map(f => (
                <button key={f.key} onClick={() => setTab(f.key)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${tab === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{f.label}</button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredPlans.map((p, i) => (
              <div key={i} className={`rounded-xl border bg-card p-5 shadow-card relative cursor-pointer hover:shadow-md transition-all ${p.popular ? "border-primary ring-1 ring-primary/20" : ""} ${expandedPlan === p.name ? "ring-2 ring-primary/30" : ""}`} onClick={() => setExpandedPlan(expandedPlan === p.name ? null : p.name)}>
                {p.popular && <span className="absolute -top-2.5 left-4 text-[10px] font-bold bg-primary text-primary-foreground px-3 py-0.5 rounded-full">POPULAIRE</span>}
                <p.icon className="h-6 w-6 text-primary mb-3" />
                <h4 className="font-bold text-foreground">{p.name}</h4>
                <p className="text-2xl font-bold text-primary mt-2">{p.price}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">{p.subscribers} abonnés</p>
                  <p className="text-xs font-semibold text-accent">{p.revenue}/mois</p>
                </div>
                <ul className="mt-4 space-y-2">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs text-foreground">
                      <CheckCircle className="h-3.5 w-3.5 text-accent shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                {expandedPlan === p.name && (
                  <div className="mt-4 pt-4 border-t">
                    <Button size="sm" variant="outline" className="w-full text-xs"><Edit className="h-3 w-3 mr-1" />Modifier le plan</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Transactions */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <div className="p-5 border-b flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Dernières transactions</h3>
            <div className="flex gap-1 rounded-lg border bg-muted/30 p-0.5">
              {([
                { key: "all" as const, label: "Toutes" },
                { key: "success" as const, label: "Payées" },
                { key: "pending" as const, label: "En attente" },
                { key: "failed" as const, label: "Échouées" },
              ]).map(f => (
                <button key={f.key} onClick={() => setTxFilter(f.key)} className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${txFilter === f.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{f.label}</button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Utilisateur</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Plan</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Montant</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTx.map(t => (
                  <tr key={t.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.id}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{t.user}</td>
                    <td className="px-4 py-3 text-foreground">{t.plan}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{t.amount}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.date}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.status === "success" ? "bg-accent/10 text-accent" : t.status === "pending" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}`}>
                        {t.status === "success" ? "Payé" : t.status === "pending" ? "En attente" : "Échoué"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {t.status === "failed" && (
                        <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleRetry(t.id)}>Relancer</Button>
                      )}
                      {t.status === "success" && (
                        <Button size="sm" variant="ghost" className="text-xs h-7"><Eye className="h-3 w-3 mr-1" />Voir</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSubscriptions;
