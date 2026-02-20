import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Plus, Download, Euro, FileText, CheckCircle2, Clock,
  AlertCircle, TrendingUp, Users, Calendar
} from "lucide-react";

const stats = [
  { label: "CA du mois", value: "12 450 €", icon: Euro, color: "text-primary" },
  { label: "Factures en attente", value: "8", icon: Clock, color: "text-warning" },
  { label: "Factures payées", value: "156", icon: CheckCircle2, color: "text-accent" },
  { label: "Impayés", value: "3", icon: AlertCircle, color: "text-destructive" },
];

const invoices = [
  { id: "FAC-2026-087", patient: "Marie Dupont", doctor: "Dr. Martin", date: "20 Fév 2026", amount: 25, type: "Consultation", payment: "Carte vitale", status: "paid" },
  { id: "FAC-2026-086", patient: "Jean Bernard", doctor: "Dr. Lefebvre", date: "20 Fév 2026", amount: 50, type: "Consultation spécialiste", payment: "En attente", status: "pending" },
  { id: "FAC-2026-085", patient: "Claire Moreau", doctor: "Dr. Martin", date: "19 Fév 2026", amount: 25, type: "Consultation", payment: "CB", status: "paid" },
  { id: "FAC-2026-084", patient: "Paul Petit", doctor: "Dr. Durand", date: "19 Fév 2026", amount: 70, type: "Première consultation", payment: "En attente", status: "pending" },
  { id: "FAC-2026-083", patient: "Sophie Leroy", doctor: "Dr. Martin", date: "18 Fév 2026", amount: 25, type: "Consultation", payment: "Chèque", status: "paid" },
  { id: "FAC-2026-080", patient: "Luc Garcia", doctor: "Dr. Lefebvre", date: "15 Fév 2026", amount: 50, type: "Suivi", payment: "Impayé", status: "overdue" },
];

const statusConfig: Record<string, { label: string; class: string }> = {
  paid: { label: "Payée", class: "bg-accent/10 text-accent" },
  pending: { label: "En attente", class: "bg-warning/10 text-warning" },
  overdue: { label: "Impayée", class: "bg-destructive/10 text-destructive" },
};

const SecretaryBilling = () => {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? invoices : invoices.filter(i => i.status === filter);

  return (
    <DashboardLayout role="secretary" title="Facturation">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(s => (
            <div key={s.label} className="rounded-xl border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
          <div className="flex gap-1 rounded-lg border bg-card p-1">
            {[
              { key: "all", label: "Toutes" },
              { key: "pending", label: "En attente" },
              { key: "paid", label: "Payées" },
              { key: "overdue", label: "Impayées" },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Exporter</Button>
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm">
              <Plus className="h-4 w-4 mr-1" />Nouvelle facture
            </Button>
          </div>
        </div>

        {/* Invoices table */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="p-4 text-sm font-medium text-muted-foreground">N° Facture</th>
                <th className="p-4 text-sm font-medium text-muted-foreground">Patient</th>
                <th className="p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Médecin</th>
                <th className="p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                <th className="p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Type</th>
                <th className="p-4 text-sm font-medium text-muted-foreground">Montant</th>
                <th className="p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Paiement</th>
                <th className="p-4 text-sm font-medium text-muted-foreground">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-muted/50 transition-colors">
                  <td className="p-4 text-sm font-medium text-foreground">{inv.id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {inv.patient.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className="text-sm text-foreground">{inv.patient}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">{inv.doctor}</td>
                  <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">{inv.date}</td>
                  <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">{inv.type}</td>
                  <td className="p-4 text-sm font-semibold text-foreground">{inv.amount} €</td>
                  <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">{inv.payment}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[inv.status].class}`}>
                      {statusConfig[inv.status].label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SecretaryBilling;
