import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { CreditCard, Search, Eye, Printer, CheckCircle2, Clock, AlertTriangle, RefreshCw, X, Banknote, Video, ChevronRight, Calendar, FileText, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type BillingTab = "subscription" | "teleconsult";
type InvoiceStatus = "paid" | "pending" | "failed" | "refunded";

/* ── Subscription data (mock) ── */
const subscriptionInfo = {
  plan: "Pro",
  price: "129 DT/mois",
  status: "active" as const,
  nextRenewal: "20 Mar 2026",
  cardLast4: "4821",
  cardBrand: "Visa",
};

const subscriptionInvoices = [
  { id: "SUB-2026-02", month: "Février 2026", amount: 129, status: "paid" as InvoiceStatus, date: "1 Fév 2026" },
  { id: "SUB-2026-01", month: "Janvier 2026", amount: 129, status: "paid" as InvoiceStatus, date: "1 Jan 2026" },
  { id: "SUB-2025-12", month: "Décembre 2025", amount: 129, status: "paid" as InvoiceStatus, date: "1 Déc 2025" },
  { id: "SUB-2025-11", month: "Novembre 2025", amount: 129, status: "failed" as InvoiceStatus, date: "1 Nov 2025" },
];

/* ── Teleconsult transactions (mock) ── */
const teleconsultTx = [
  { id: "TX-2026-0142", patient: "Youssef Belhadj", avatar: "YB", dateRdv: "20 Fév 2026 14:30", amount: 45, status: "pending" as InvoiceStatus, ref: "FAC-2026-0142", motif: "Résultats analyses" },
  { id: "TX-2026-0141", patient: "Rania Meddeb", avatar: "RM", dateRdv: "19 Fév 2026 10:00", amount: 35, status: "paid" as InvoiceStatus, ref: "FAC-2026-0141", motif: "Suivi cholestérol" },
  { id: "TX-2026-0139", patient: "Amine Ben Ali", avatar: "AB", dateRdv: "18 Fév 2026 16:00", amount: 45, status: "paid" as InvoiceStatus, ref: "FAC-2026-0139", motif: "Suivi diabète" },
  { id: "TX-2026-0137", patient: "Sami Ayari", avatar: "SA", dateRdv: "17 Fév 2026 09:00", amount: 35, status: "failed" as InvoiceStatus, ref: "FAC-2026-0137", motif: "Renouvellement ordonnance" },
  { id: "TX-2026-0135", patient: "Salma Dridi", avatar: "SD", dateRdv: "15 Fév 2026 11:30", amount: 45, status: "refunded" as InvoiceStatus, ref: "FAC-2026-0135", motif: "Consultation annulée" },
];

const statusConfig: Record<InvoiceStatus, { label: string; color: string; icon: any }> = {
  paid: { label: "Payé", color: "bg-accent/10 text-accent border-accent/20", icon: CheckCircle2 },
  pending: { label: "En attente", color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  failed: { label: "Échoué", color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
  refunded: { label: "Remboursé", color: "bg-muted text-muted-foreground border-border", icon: RefreshCw },
};

const DoctorBilling = () => {
  const [tab, setTab] = useState<BillingTab>("subscription");
  const [search, setSearch] = useState("");
  const [detailTx, setDetailTx] = useState<string | null>(null);
  const [showChangeCard, setShowChangeCard] = useState(false);

  const filteredTx = teleconsultTx.filter(tx =>
    !search || tx.patient.toLowerCase().includes(search.toLowerCase()) || tx.ref.toLowerCase().includes(search.toLowerCase())
  );

  const totalPaid = teleconsultTx.filter(t => t.status === "paid").reduce((s, t) => s + t.amount, 0);
  const totalPending = teleconsultTx.filter(t => t.status === "pending").reduce((s, t) => s + t.amount, 0);
  const selectedTx = detailTx ? teleconsultTx.find(t => t.id === detailTx) : null;

  return (
    <DashboardLayout role="doctor" title="Facturation">
      <div className="space-y-6">
        {/* Tab switch */}
        <div className="flex gap-1 rounded-lg border bg-card p-1 w-fit">
          <button onClick={() => setTab("subscription")} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${tab === "subscription" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            Abonnement plateforme
          </button>
          <button onClick={() => setTab("teleconsult")} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${tab === "teleconsult" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            Téléconsultations
          </button>
        </div>

        {/* ═══ SUBSCRIPTION TAB ═══ */}
        {tab === "subscription" && (
          <div className="space-y-6">
            {/* Plan info */}
            <div className="rounded-xl border bg-card shadow-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center"><Shield className="h-5 w-5 text-primary-foreground" /></div>
                    <div>
                      <h3 className="font-bold text-foreground text-lg">Plan {subscriptionInfo.plan}</h3>
                      <p className="text-sm text-muted-foreground">{subscriptionInfo.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-accent" />Actif</span>
                    <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />Renouvellement : {subscriptionInfo.nextRenewal}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">Changer de plan</Button>
              </div>
            </div>

            {/* Payment method */}
            <div className="rounded-xl border bg-card shadow-card p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" />Méthode de paiement</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-14 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">{subscriptionInfo.cardBrand}</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">•••• •••• •••• {subscriptionInfo.cardLast4}</p>
                    <p className="text-xs text-muted-foreground">Expire 12/2027</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowChangeCard(true)}>Modifier</Button>
              </div>
            </div>

            {/* Subscription invoices */}
            <div className="rounded-xl border bg-card shadow-card">
              <div className="border-b px-5 py-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />Historique factures abonnement</h3>
              </div>
              <div className="divide-y">
                {subscriptionInvoices.map(inv => {
                  const sc = statusConfig[inv.status];
                  return (
                    <div key={inv.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"><FileText className="h-4 w-4 text-primary" /></div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{inv.month}</p>
                          <p className="text-xs text-muted-foreground">{inv.date} · {inv.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-foreground">{inv.amount} DT</span>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${sc.color}`}>
                          <sc.icon className="h-3 w-3" />{sc.label}
                        </span>
                        <Button variant="ghost" size="sm" className="h-7 text-xs"><Eye className="h-3.5 w-3.5 mr-1" />Voir</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══ TELECONSULT TAB ═══ */}
        {tab === "teleconsult" && (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border bg-card p-4 shadow-card">
                <div className="flex items-center gap-2 mb-2"><Banknote className="h-4 w-4 text-accent" /><span className="text-xs text-muted-foreground">Encaissé ce mois</span></div>
                <p className="text-xl font-bold text-foreground">{totalPaid} DT</p>
              </div>
              <div className="rounded-xl border bg-card p-4 shadow-card">
                <div className="flex items-center gap-2 mb-2"><Clock className="h-4 w-4 text-warning" /><span className="text-xs text-muted-foreground">En attente</span></div>
                <p className="text-xl font-bold text-foreground">{totalPending} DT</p>
              </div>
              <div className="rounded-xl border bg-card p-4 shadow-card">
                <div className="flex items-center gap-2 mb-2"><Video className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">Transactions</span></div>
                <p className="text-xl font-bold text-foreground">{teleconsultTx.length}</p>
              </div>
            </div>

            {/* Transactions table */}
            <div className="rounded-xl border bg-card shadow-card">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b px-5 py-4 gap-3">
                <h2 className="font-semibold text-foreground flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" />Transactions téléconsultation</h2>
                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="text-left px-5 py-3 font-medium">Réf.</th>
                      <th className="text-left px-3 py-3 font-medium">Patient</th>
                      <th className="text-left px-3 py-3 font-medium">Date RDV</th>
                      <th className="text-left px-3 py-3 font-medium">Motif</th>
                      <th className="text-right px-3 py-3 font-medium">Montant</th>
                      <th className="text-center px-3 py-3 font-medium">Statut</th>
                      <th className="text-right px-5 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredTx.map(tx => {
                      const sc = statusConfig[tx.status];
                      return (
                        <tr key={tx.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setDetailTx(tx.id)}>
                          <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{tx.ref}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-[10px] font-medium shrink-0">{tx.avatar}</div>
                              <span className="text-sm font-medium text-foreground">{tx.patient}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-xs text-muted-foreground">{tx.dateRdv}</td>
                          <td className="px-3 py-3 text-xs text-muted-foreground">{tx.motif}</td>
                          <td className="px-3 py-3 text-sm font-semibold text-foreground text-right">{tx.amount} DT</td>
                          <td className="px-3 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${sc.color}`}>
                              <sc.icon className="h-3 w-3" />{sc.label}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); setDetailTx(tx.id); }}><Eye className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><Printer className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredTx.length === 0 && <div className="py-12 text-center text-sm text-muted-foreground">Aucune transaction trouvée</div>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Transaction detail drawer ── */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setDetailTx(null)}>
          <div className="w-full max-w-md rounded-2xl border bg-card shadow-elevated p-6 mx-4 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-foreground">Transaction {selectedTx.ref}</h3>
              <button onClick={() => setDetailTx(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Patient</p><p className="text-sm font-medium text-foreground mt-0.5">{selectedTx.patient}</p></div>
                <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Date RDV</p><p className="text-sm font-medium text-foreground mt-0.5">{selectedTx.dateRdv}</p></div>
                <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Motif</p><p className="text-sm font-medium text-foreground mt-0.5">{selectedTx.motif}</p></div>
                <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Type</p><p className="text-sm font-medium text-foreground mt-0.5 flex items-center gap-1"><Video className="h-3.5 w-3.5 text-primary" />Téléconsultation</p></div>
              </div>
              <div className="rounded-lg border p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Montant</p>
                  <p className="text-2xl font-bold text-foreground">{selectedTx.amount} DT</p>
                </div>
                {(() => { const sc = statusConfig[selectedTx.status]; return (
                  <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${sc.color}`}><sc.icon className="h-3.5 w-3.5" />{sc.label}</span>
                ); })()}
              </div>
              {/* Timeline (mock) */}
              <div className="rounded-lg bg-muted/30 p-4 space-y-3">
                <p className="text-xs font-semibold text-foreground">Timeline paiement</p>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" /><span>Autorisation carte · {selectedTx.dateRdv}</span></div>
                  {selectedTx.status === "paid" && <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" /><span>Capture effectuée</span></div>}
                  {selectedTx.status === "paid" && <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" /><span>Reçu envoyé au patient</span></div>}
                  {selectedTx.status === "pending" && <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-warning shrink-0" /><span>En attente de capture</span></div>}
                  {selectedTx.status === "failed" && <div className="flex items-center gap-2"><AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" /><span>Paiement refusé par la banque</span></div>}
                  {selectedTx.status === "refunded" && <div className="flex items-center gap-2"><RefreshCw className="h-3.5 w-3.5 text-muted-foreground shrink-0" /><span>Remboursement effectué</span></div>}
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground text-center">Passerelle de paiement carte (à connecter)</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 text-xs"><Printer className="h-3.5 w-3.5 mr-1.5" />Imprimer</Button>
                <Button variant="outline" className="flex-1 text-xs"><Eye className="h-3.5 w-3.5 mr-1.5" />Voir facture PDF</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Change card modal (mock) ── */}
      {showChangeCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setShowChangeCard(false)}>
          <div className="w-full max-w-sm rounded-2xl border bg-card shadow-elevated p-6 mx-4 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" />Modifier la carte</h3>
              <button onClick={() => setShowChangeCard(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-muted-foreground">Numéro de carte</label><Input placeholder="•••• •••• •••• ••••" className="mt-1 h-9 font-mono" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground">Expiration</label><Input placeholder="MM/AA" className="mt-1 h-9" /></div>
                <div><label className="text-xs font-medium text-muted-foreground">CVV</label><Input placeholder="•••" className="mt-1 h-9" type="password" /></div>
              </div>
              <p className="text-[11px] text-muted-foreground text-center">🔒 Paiement sécurisé · Passerelle carte (à connecter)</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowChangeCard(false)}>Annuler</Button>
                <Button className="flex-1 gradient-primary text-primary-foreground" onClick={() => setShowChangeCard(false)}>Enregistrer</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DoctorBilling;
