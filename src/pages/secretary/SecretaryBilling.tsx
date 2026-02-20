import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Plus, Download, Banknote, FileText, CheckCircle2, Clock,
  AlertCircle, TrendingUp, CreditCard, ArrowUpRight,
  Eye, Printer, Send, Receipt, Shield
} from "lucide-react";

const stats = [
  { label: "CA du mois", value: "8 450 DT", change: "+8%", icon: Banknote, color: "bg-primary/10 text-primary" },
  { label: "En attente", value: "8", change: "1 575 DT", icon: Clock, color: "bg-warning/10 text-warning" },
  { label: "Payées ce mois", value: "156", change: "6 875 DT", icon: CheckCircle2, color: "bg-accent/10 text-accent" },
  { label: "Impayés", value: "3", change: "320 DT", icon: AlertCircle, color: "bg-destructive/10 text-destructive" },
];

const invoices = [
  { id: "FAC-2026-087", patient: "Amine Ben Ali", doctor: "Dr. Bouazizi", date: "20 Fév", amount: 35, type: "Consultation G", payment: "CNAM", status: "paid", avatar: "AB", cnam: true },
  { id: "FAC-2026-086", patient: "Fatma Trabelsi", doctor: "Dr. Gharbi", date: "20 Fév", amount: 60, type: "Cardio", payment: "—", status: "pending", avatar: "FT", cnam: true },
  { id: "FAC-2026-085", patient: "Mohamed Sfar", doctor: "Dr. Bouazizi", date: "19 Fév", amount: 35, type: "Consultation G", payment: "Espèces", status: "paid", avatar: "MS", cnam: false },
  { id: "FAC-2026-084", patient: "Nadia Jemni", doctor: "Dr. Hammami", date: "19 Fév", amount: 80, type: "1ère consultation", payment: "—", status: "pending", avatar: "NJ", cnam: true },
  { id: "FAC-2026-083", patient: "Sami Ayari", doctor: "Dr. Bouazizi", date: "18 Fév", amount: 35, type: "Consultation G", payment: "Chèque", status: "paid", avatar: "SA", cnam: true },
  { id: "FAC-2026-082", patient: "Youssef Belhadj", doctor: "Dr. Bouazizi", date: "18 Fév", amount: 35, type: "Téléconsultation", payment: "Virement", status: "paid", avatar: "YB", cnam: false },
  { id: "FAC-2026-080", patient: "Rania Meddeb", doctor: "Dr. Gharbi", date: "15 Fév", amount: 60, type: "Suivi", payment: "—", status: "overdue", avatar: "RM", cnam: true },
  { id: "FAC-2026-078", patient: "Salma Dridi", doctor: "Dr. Bouazizi", date: "12 Fév", amount: 150, type: "Bilan complet", payment: "—", status: "overdue", avatar: "SD", cnam: true },
];

const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
  paid: { label: "Payée", class: "bg-accent/10 text-accent", icon: CheckCircle2 },
  pending: { label: "En attente", class: "bg-warning/10 text-warning", icon: Clock },
  overdue: { label: "Impayée", class: "bg-destructive/10 text-destructive", icon: AlertCircle },
};

const paymentMethods = [
  { method: "CNAM", count: 45, icon: Shield },
  { method: "Espèces", count: 28, icon: Banknote },
  { method: "Chèque", count: 15, icon: Receipt },
  { method: "Virement", count: 12, icon: CreditCard },
];

const SecretaryBilling = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = invoices.filter(i => {
    if (filter !== "all" && i.status !== filter) return false;
    if (search && !i.patient.toLowerCase().includes(search.toLowerCase()) && !i.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout role="secretary" title="Facturation">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {stats.map(s => (
            <div key={s.label} className="rounded-xl border bg-card p-4 shadow-card hover:shadow-card-hover transition-all">
              <div className="flex items-center justify-between">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-[11px] text-accent mt-1 flex items-center gap-0.5">
                {s.change.startsWith("+") && <ArrowUpRight className="h-3 w-3" />}
                {s.change}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1 rounded-lg border bg-card p-0.5">
              {[
                { key: "all", label: "Toutes" },
                { key: "pending", label: "En attente" },
                { key: "paid", label: "Payées" },
                { key: "overdue", label: "Impayées" },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Rechercher..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-9 w-48 text-xs" 
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs"><Download className="h-3.5 w-3.5 mr-1" />Exporter</Button>
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm">
              <Plus className="h-3.5 w-3.5 mr-1" />Nouvelle facture
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Invoices table */}
          <div className="lg:col-span-3 rounded-xl border bg-card shadow-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-3 text-[11px] font-medium text-muted-foreground">Facture</th>
                  <th className="p-3 text-[11px] font-medium text-muted-foreground">Patient</th>
                  <th className="p-3 text-[11px] font-medium text-muted-foreground hidden md:table-cell">Médecin</th>
                  <th className="p-3 text-[11px] font-medium text-muted-foreground hidden sm:table-cell">Type</th>
                  <th className="p-3 text-[11px] font-medium text-muted-foreground">Montant</th>
                  <th className="p-3 text-[11px] font-medium text-muted-foreground hidden lg:table-cell">Paiement</th>
                  <th className="p-3 text-[11px] font-medium text-muted-foreground">Statut</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(inv => {
                  const config = statusConfig[inv.status];
                  return (
                    <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <p className="text-xs font-semibold text-foreground">{inv.id}</p>
                        <p className="text-[10px] text-muted-foreground">{inv.date}</p>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">
                            {inv.avatar}
                          </div>
                          <div>
                            <span className="text-xs font-medium text-foreground">{inv.patient}</span>
                            {inv.cnam && (
                              <p className="text-[9px] text-primary font-medium">CNAM</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">{inv.doctor}</td>
                      <td className="p-3 text-xs text-muted-foreground hidden sm:table-cell">{inv.type}</td>
                      <td className="p-3 text-xs font-bold text-foreground">{inv.amount} DT</td>
                      <td className="p-3 text-xs text-muted-foreground hidden lg:table-cell">{inv.payment}</td>
                      <td className="p-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium flex items-center gap-1 w-fit ${config.class}`}>
                          <config.icon className="h-3 w-3" />
                          {config.label}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Eye className="h-3 w-3 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Printer className="h-3 w-3 text-muted-foreground" />
                          </Button>
                          {inv.status === "overdue" && (
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Send className="h-3 w-3 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Payment methods breakdown */}
          <div className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-semibold text-foreground mb-4">Moyens de paiement</h3>
            <div className="space-y-3">
              {paymentMethods.map(pm => (
                <div key={pm.method} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <pm.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground">{pm.method}</p>
                    <div className="h-1.5 w-full bg-muted rounded-full mt-1">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(pm.count / 100) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-foreground">{pm.count}%</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t">
              <h4 className="text-xs font-medium text-muted-foreground mb-3">Résumé du mois</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total facturé</span>
                  <span className="font-semibold text-foreground">8 450 DT</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Part CNAM</span>
                  <span className="font-semibold text-foreground">5 915 DT</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Part mutuelle</span>
                  <span className="font-semibold text-foreground">1 690 DT</span>
                </div>
                <div className="flex justify-between text-xs pt-2 border-t">
                  <span className="text-muted-foreground">Reste à charge patients</span>
                  <span className="font-bold text-foreground">845 DT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SecretaryBilling;
