import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { CreditCard, TrendingUp, Users, CheckCircle, XCircle, Clock, ArrowUpRight, Stethoscope, FlaskConical, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";

type TabFilter = "all" | "doctors" | "laboratories" | "pharmacies";

const plans = [
  { name: "Médecin Basic", price: "39 DT/mois", target: "Médecins", features: ["Agenda en ligne", "Prise de RDV", "Fiche praticien", "5 SMS/mois"], subscribers: 198, icon: Stethoscope },
  { name: "Médecin Pro", price: "129 DT/mois", target: "Médecins", features: ["Tout Basic +", "Téléconsultation", "Gestion secrétaire", "Ordonnances numériques", "SMS illimités", "Statistiques avancées"], subscribers: 144, icon: Stethoscope, popular: true },
  { name: "Laboratoire", price: "59 DT/mois", target: "Laboratoires", features: ["Gestion analyses", "Résultats en ligne", "Notifications patients", "Historique complet"], subscribers: 45, icon: FlaskConical },
  { name: "Pharmacie", price: "59 DT/mois", target: "Pharmacies", features: ["Ordonnances numériques", "Gestion stock", "Alertes rupture", "Historique délivrance"], subscribers: 78, icon: Pill },
];

const transactions = [
  { id: "TXN-001", user: "Dr. Sonia Gharbi", plan: "Médecin Pro", amount: "129 DT", date: "20 Fév 2026", status: "success" },
  { id: "TXN-002", user: "Labo BioSanté", plan: "Laboratoire", amount: "59 DT", date: "19 Fév 2026", status: "success" },
  { id: "TXN-003", user: "Dr. Karim Bouzid", plan: "Médecin Basic", amount: "39 DT", date: "18 Fév 2026", status: "pending" },
  { id: "TXN-004", user: "Pharmacie Pasteur", plan: "Pharmacie", amount: "59 DT", date: "17 Fév 2026", status: "success" },
  { id: "TXN-005", user: "Dr. Fathi Mejri", plan: "Médecin Pro", amount: "129 DT", date: "15 Fév 2026", status: "failed" },
];

const AdminSubscriptions = () => {
  const [tab, setTab] = useState<TabFilter>("all");

  const filteredPlans = plans.filter(p => {
    if (tab === "doctors") return p.target === "Médecins";
    if (tab === "laboratories") return p.target === "Laboratoires";
    if (tab === "pharmacies") return p.target === "Pharmacies";
    return true;
  });

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
              <div key={i} className={`rounded-xl border bg-card p-5 shadow-card relative ${p.popular ? "border-primary ring-1 ring-primary/20" : ""}`}>
                {p.popular && <span className="absolute -top-2.5 left-4 text-[10px] font-bold bg-primary text-primary-foreground px-3 py-0.5 rounded-full">POPULAIRE</span>}
                <p.icon className="h-6 w-6 text-primary mb-3" />
                <h4 className="font-bold text-foreground">{p.name}</h4>
                <p className="text-2xl font-bold text-primary mt-2">{p.price}</p>
                <p className="text-xs text-muted-foreground mt-1">{p.subscribers} abonnés</p>
                <ul className="mt-4 space-y-2">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs text-foreground">
                      <CheckCircle className="h-3.5 w-3.5 text-accent shrink-0" />{f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <div className="p-5 border-b">
            <h3 className="font-semibold text-foreground">Dernières transactions</h3>
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
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
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
