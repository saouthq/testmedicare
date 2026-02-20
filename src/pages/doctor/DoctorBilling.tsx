import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { CreditCard, Search, Filter, Eye, Printer, Download, CheckCircle2, Clock, AlertTriangle, RefreshCw, X, Banknote, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type InvoiceStatus = "paid" | "pending" | "failed" | "refunded";
type StatusFilter = "all" | InvoiceStatus;

interface Invoice {
  id: string;
  ref: string;
  patient: string;
  avatar: string;
  date: string;
  amount: number;
  status: InvoiceStatus;
  type: "teleconsultation" | "consultation";
  motif: string;
}

const invoices: Invoice[] = [
  { id: "1", ref: "FAC-2026-0142", patient: "Youssef Belhadj", avatar: "YB", date: "20 Fév 2026", amount: 45, status: "pending", type: "teleconsultation", motif: "Résultats analyses" },
  { id: "2", ref: "FAC-2026-0141", patient: "Rania Meddeb", avatar: "RM", date: "19 Fév 2026", amount: 35, status: "paid", type: "teleconsultation", motif: "Suivi cholestérol" },
  { id: "3", ref: "FAC-2026-0139", patient: "Amine Ben Ali", avatar: "AB", date: "18 Fév 2026", amount: 45, status: "paid", type: "teleconsultation", motif: "Suivi diabète" },
  { id: "4", ref: "FAC-2026-0137", patient: "Sami Ayari", avatar: "SA", date: "17 Fév 2026", amount: 35, status: "failed", type: "teleconsultation", motif: "Renouvellement ordonnance" },
  { id: "5", ref: "FAC-2026-0135", patient: "Salma Dridi", avatar: "SD", date: "15 Fév 2026", amount: 45, status: "refunded", type: "teleconsultation", motif: "Consultation annulée" },
  { id: "6", ref: "FAC-2026-0130", patient: "Nadia Jemni", avatar: "NJ", date: "12 Fév 2026", amount: 35, status: "paid", type: "teleconsultation", motif: "Douleurs articulaires" },
];

const statusConfig: Record<InvoiceStatus, { label: string; color: string; icon: any }> = {
  paid: { label: "Payé", color: "bg-accent/10 text-accent border-accent/20", icon: CheckCircle2 },
  pending: { label: "En attente", color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  failed: { label: "Échoué", color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
  refunded: { label: "Remboursé", color: "bg-muted text-muted-foreground border-border", icon: RefreshCw },
};

const DoctorBilling = () => {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [paymentModal, setPaymentModal] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const filtered = invoices.filter(inv => {
    if (filter !== "all" && inv.status !== filter) return false;
    if (search && !inv.patient.toLowerCase().includes(search.toLowerCase()) && !inv.ref.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const detailInv = detailId ? invoices.find(i => i.id === detailId) : null;
  const paymentInv = paymentModal ? invoices.find(i => i.id === paymentModal) : null;

  const simulatePayment = (success: boolean) => {
    setPaymentProcessing(true);
    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentModal(null);
      // In real app, this would update the invoice status
    }, 1500);
  };

  return (
    <DashboardLayout role="doctor" title="Facturation">
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2 mb-2"><Banknote className="h-4 w-4 text-accent" /><span className="text-xs text-muted-foreground">Encaissé ce mois</span></div>
            <p className="text-xl font-bold text-foreground">{totalPaid} DT</p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2 mb-2"><Clock className="h-4 w-4 text-warning" /><span className="text-xs text-muted-foreground">En attente</span></div>
            <p className="text-xl font-bold text-foreground">{totalPending} DT</p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2 mb-2"><Video className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">Téléconsultations</span></div>
            <p className="text-xl font-bold text-foreground">{invoices.length}</p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2 mb-2"><CreditCard className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">Mode de paiement</span></div>
            <p className="text-sm font-semibold text-foreground mt-1">Carte bancaire</p>
            <p className="text-[11px] text-muted-foreground">Passerelle de paiement</p>
          </div>
        </div>

        {/* Filters + search */}
        <div className="rounded-xl border bg-card shadow-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b px-5 py-4 gap-3">
            <h2 className="font-semibold text-foreground flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" />Factures téléconsultation</h2>
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
            </div>
          </div>

          <div className="flex gap-1.5 px-5 py-2.5 border-b overflow-x-auto">
            {([["all", "Toutes"], ["paid", "Payées"], ["pending", "En attente"], ["failed", "Échouées"], ["refunded", "Remboursées"]] as [StatusFilter, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all whitespace-nowrap ${filter === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="text-left px-5 py-3 font-medium">Réf.</th>
                  <th className="text-left px-3 py-3 font-medium">Patient</th>
                  <th className="text-left px-3 py-3 font-medium">Date</th>
                  <th className="text-left px-3 py-3 font-medium">Motif</th>
                  <th className="text-right px-3 py-3 font-medium">Montant</th>
                  <th className="text-center px-3 py-3 font-medium">Statut</th>
                  <th className="text-right px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(inv => {
                  const sc = statusConfig[inv.status];
                  return (
                    <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{inv.ref}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-[10px] font-medium shrink-0">{inv.avatar}</div>
                          <span className="text-sm font-medium text-foreground">{inv.patient}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">{inv.date}</td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">{inv.motif}</td>
                      <td className="px-3 py-3 text-sm font-semibold text-foreground text-right">{inv.amount} DT</td>
                      <td className="px-3 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${sc.color}`}>
                          <sc.icon className="h-3 w-3" />{sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailId(inv.id)}><Eye className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><Printer className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                          {inv.status === "pending" && (
                            <Button size="sm" className="h-7 text-xs gradient-primary text-primary-foreground" onClick={() => setPaymentModal(inv.id)}>Payer</Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="py-12 text-center text-sm text-muted-foreground">Aucune facture trouvée</div>}
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {detailInv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setDetailId(null)}>
          <div className="w-full max-w-md rounded-2xl border bg-card shadow-elevated p-6 mx-4 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-foreground">Facture {detailInv.ref}</h3>
              <button onClick={() => setDetailId(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Patient</p><p className="text-sm font-medium text-foreground mt-0.5">{detailInv.patient}</p></div>
                <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Date</p><p className="text-sm font-medium text-foreground mt-0.5">{detailInv.date}</p></div>
                <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Motif</p><p className="text-sm font-medium text-foreground mt-0.5">{detailInv.motif}</p></div>
                <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Type</p><p className="text-sm font-medium text-foreground mt-0.5 capitalize">{detailInv.type}</p></div>
              </div>
              <div className="rounded-lg border p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Montant</p>
                  <p className="text-2xl font-bold text-foreground">{detailInv.amount} DT</p>
                </div>
                {(() => { const sc = statusConfig[detailInv.status]; return (
                  <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${sc.color}`}><sc.icon className="h-3.5 w-3.5" />{sc.label}</span>
                ); })()}
              </div>
              <div className="rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground">
                <p><span className="font-medium">Mode de paiement :</span> Carte bancaire</p>
                <p className="mt-1"><span className="font-medium">Passerelle :</span> Passerelle de paiement carte (à configurer)</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 text-xs"><Printer className="h-3.5 w-3.5 mr-1.5" />Imprimer</Button>
                <Button variant="outline" className="flex-1 text-xs"><Download className="h-3.5 w-3.5 mr-1.5" />Télécharger PDF</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment simulation modal */}
      {paymentInv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => !paymentProcessing && setPaymentModal(null)}>
          <div className="w-full max-w-sm rounded-2xl border bg-card shadow-elevated p-6 mx-4 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" />Paiement par carte</h3>
              {!paymentProcessing && <button onClick={() => setPaymentModal(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>}
            </div>
            {paymentProcessing ? (
              <div className="py-8 text-center">
                <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground mt-4">Traitement en cours...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-xs text-muted-foreground">Montant à régler</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{paymentInv.amount} DT</p>
                  <p className="text-xs text-muted-foreground mt-1">{paymentInv.patient} · {paymentInv.motif}</p>
                </div>
                <div className="space-y-3">
                  <div><label className="text-xs font-medium text-muted-foreground">Numéro de carte</label><Input placeholder="•••• •••• •••• ••••" className="mt-1 h-9 font-mono" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs font-medium text-muted-foreground">Expiration</label><Input placeholder="MM/AA" className="mt-1 h-9" /></div>
                    <div><label className="text-xs font-medium text-muted-foreground">CVV</label><Input placeholder="•••" className="mt-1 h-9" type="password" /></div>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground text-center">🔒 Paiement sécurisé · Passerelle de paiement carte</p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setPaymentModal(null)}>Annuler</Button>
                  <Button className="flex-1 gradient-primary text-primary-foreground shadow-primary-glow" onClick={() => simulatePayment(true)}>
                    <CreditCard className="h-4 w-4 mr-1.5" />Payer {paymentInv.amount} DT
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DoctorBilling;
