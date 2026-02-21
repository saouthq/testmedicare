import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { CreditCard, Search, Eye, Printer, CheckCircle2, Clock, AlertTriangle, RefreshCw, X, Banknote, Video, ArrowRight, Calendar, FileText, Shield, Crown, Zap, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockSubscriptionInfo, mockPlans, mockSubscriptionInvoices, mockTeleconsultTransactions, InvoiceStatus } from "@/data/mockData";

type BillingTab = "subscription" | "teleconsult";

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

  const filteredTx = mockTeleconsultTransactions.filter(tx =>
    !search || tx.patient.toLowerCase().includes(search.toLowerCase()) || tx.ref.toLowerCase().includes(search.toLowerCase())
  );
  const totalPaid = mockTeleconsultTransactions.filter(t => t.status === "paid").reduce((s, t) => s + t.amount, 0);
  const totalPending = mockTeleconsultTransactions.filter(t => t.status === "pending").reduce((s, t) => s + t.amount, 0);
  const selectedTx = detailTx ? mockTeleconsultTransactions.find(t => t.id === detailTx) : null;

  return (
    <DashboardLayout role="doctor" title="Facturation">
      <div className="space-y-6">
        {/* Tab switch */}
        <div className="flex gap-1 rounded-lg border bg-card p-1 w-fit">
          <button onClick={() => setTab("subscription")} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${tab === "subscription" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            Abonnement
          </button>
          <button onClick={() => setTab("teleconsult")} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${tab === "teleconsult" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            Téléconsultations
          </button>
        </div>

        {/* ═══ SUBSCRIPTION TAB ═══ */}
        {tab === "subscription" && (
          <div className="space-y-6">
            {/* Pro upgrade banner – eye-catching */}
            {mockSubscriptionInfo.plan === "Basic" && (
              <div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center shrink-0 shadow-primary-glow">
                    <Crown className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">Passez au plan Pro</h3>
                    <p className="text-sm text-muted-foreground mt-1">Débloquez la téléconsultation, les ordonnances numériques, la gestion secrétaire et les statistiques avancées.</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {["Téléconsultation vidéo", "SMS illimités", "Multi-cabinet"].map(f => (
                        <span key={f} className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                          <Star className="h-3 w-3" />{f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button className="gradient-primary text-primary-foreground shadow-primary-glow h-12 px-6 text-sm font-semibold shrink-0">
                    <Zap className="h-4 w-4 mr-2" />Passer au Pro · 129 DT/mois
                  </Button>
                </div>
              </div>
            )}

            {/* Plans comparison */}
            <div className="grid gap-5 sm:grid-cols-2">
              {mockPlans.map(plan => (
                <div key={plan.key} className={`rounded-xl border bg-card p-5 shadow-card relative ${plan.popular ? "border-primary ring-2 ring-primary/20" : ""}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1"><Crown className="h-3 w-3" />RECOMMANDÉ</span>
                    </div>
                  )}
                  <div className="text-center mb-5">
                    <h4 className="text-lg font-bold text-foreground">{plan.name}</h4>
                    <div className="mt-2"><span className="text-3xl font-bold text-foreground">{plan.price}</span><span className="text-muted-foreground ml-1">{plan.period}</span></div>
                  </div>
                  <ul className="space-y-2 mb-5">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-foreground"><CheckCircle className="h-4 w-4 text-accent shrink-0" />{f}</li>
                    ))}
                    {plan.notIncluded.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground line-through"><span className="h-4 w-4 shrink-0" />{f}</li>
                    ))}
                  </ul>
                  {mockSubscriptionInfo.plan === plan.name ? (
                    <Button variant="outline" className="w-full" disabled>Plan actuel</Button>
                  ) : (
                    <Button className="w-full gradient-primary text-primary-foreground shadow-primary-glow"><Zap className="h-4 w-4 mr-1" />Passer au {plan.name}</Button>
                  )}
                </div>
              ))}
            </div>

            {/* Payment method */}
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" />Méthode de paiement</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-14 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">{mockSubscriptionInfo.cardBrand}</div>
                  <div><p className="text-sm font-medium text-foreground">•••• •••• •••• {mockSubscriptionInfo.cardLast4}</p><p className="text-xs text-muted-foreground">Expire 12/2027</p></div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowChangeCard(true)}>Modifier</Button>
              </div>
            </div>

            {/* Subscription invoices */}
            <div className="rounded-xl border bg-card shadow-card">
              <div className="border-b px-5 py-4"><h3 className="font-semibold text-foreground flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />Historique factures</h3></div>
              <div className="divide-y">
                {mockSubscriptionInvoices.map(inv => {
                  const sc = statusConfig[inv.status];
                  return (
                    <div key={inv.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"><FileText className="h-4 w-4 text-primary" /></div>
                        <div><p className="text-sm font-medium text-foreground">{inv.month}</p><p className="text-xs text-muted-foreground">{inv.date} · {inv.id}</p></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-foreground">{inv.amount} DT</span>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${sc.color}`}><sc.icon className="h-3 w-3" />{sc.label}</span>
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
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border bg-card p-4 shadow-card"><div className="flex items-center gap-2 mb-2"><Banknote className="h-4 w-4 text-accent" /><span className="text-xs text-muted-foreground">Encaissé ce mois</span></div><p className="text-xl font-bold text-foreground">{totalPaid} DT</p></div>
              <div className="rounded-xl border bg-card p-4 shadow-card"><div className="flex items-center gap-2 mb-2"><Clock className="h-4 w-4 text-warning" /><span className="text-xs text-muted-foreground">En attente</span></div><p className="text-xl font-bold text-foreground">{totalPending} DT</p></div>
              <div className="rounded-xl border bg-card p-4 shadow-card"><div className="flex items-center gap-2 mb-2"><Video className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">Transactions</span></div><p className="text-xl font-bold text-foreground">{mockTeleconsultTransactions.length}</p></div>
            </div>

            <div className="rounded-xl border bg-card shadow-card">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b px-5 py-4 gap-3">
                <h2 className="font-semibold text-foreground flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" />Transactions téléconsultation</h2>
                <div className="relative w-full sm:w-56"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" /></div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left px-5 py-3 font-medium">Réf.</th><th className="text-left px-3 py-3 font-medium">Patient</th><th className="text-left px-3 py-3 font-medium">Date RDV</th><th className="text-left px-3 py-3 font-medium">Motif</th><th className="text-right px-3 py-3 font-medium">Montant</th><th className="text-center px-3 py-3 font-medium">Statut</th><th className="text-right px-5 py-3 font-medium">Actions</th></tr></thead>
                  <tbody className="divide-y">
                    {filteredTx.map(tx => {
                      const sc = statusConfig[tx.status];
                      return (
                        <tr key={tx.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setDetailTx(tx.id)}>
                          <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{tx.ref}</td>
                          <td className="px-3 py-3"><div className="flex items-center gap-2"><div className="h-7 w-7 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-[10px] font-medium shrink-0">{tx.avatar}</div><span className="text-sm font-medium text-foreground">{tx.patient}</span></div></td>
                          <td className="px-3 py-3 text-xs text-muted-foreground">{tx.dateRdv}</td>
                          <td className="px-3 py-3 text-xs text-muted-foreground">{tx.motif}</td>
                          <td className="px-3 py-3 text-sm font-semibold text-foreground text-right">{tx.amount} DT</td>
                          <td className="px-3 py-3 text-center"><span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${sc.color}`}><sc.icon className="h-3 w-3" />{sc.label}</span></td>
                          <td className="px-5 py-3 text-right"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); setDetailTx(tx.id); }}><Eye className="h-3.5 w-3.5 text-muted-foreground" /></Button><Button variant="ghost" size="icon" className="h-7 w-7"><Printer className="h-3.5 w-3.5 text-muted-foreground" /></Button></td>
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

      {/* Transaction detail drawer */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setDetailTx(null)}>
          <div className="w-full max-w-md rounded-2xl border bg-card shadow-elevated p-6 mx-4 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5"><h3 className="text-lg font-semibold text-foreground">Transaction {selectedTx.ref}</h3><button onClick={() => setDetailTx(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button></div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Patient</p><p className="text-sm font-medium text-foreground mt-0.5">{selectedTx.patient}</p></div>
                <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Date RDV</p><p className="text-sm font-medium text-foreground mt-0.5">{selectedTx.dateRdv}</p></div>
                <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Motif</p><p className="text-sm font-medium text-foreground mt-0.5">{selectedTx.motif}</p></div>
                <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Type</p><p className="text-sm font-medium text-foreground mt-0.5 flex items-center gap-1"><Video className="h-3.5 w-3.5 text-primary" />Téléconsultation</p></div>
              </div>
              <div className="rounded-lg border p-4 flex items-center justify-between">
                <div><p className="text-xs text-muted-foreground">Montant</p><p className="text-2xl font-bold text-foreground">{selectedTx.amount} DT</p></div>
                {(() => { const sc = statusConfig[selectedTx.status]; return <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${sc.color}`}><sc.icon className="h-3.5 w-3.5" />{sc.label}</span>; })()}
              </div>
              <div className="rounded-lg bg-muted/30 p-4 space-y-3">
                <p className="text-xs font-semibold text-foreground">Timeline paiement</p>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-3"><div className="h-2 w-2 rounded-full bg-accent" /><p>Autorisation carte — 20 Fév 14:25</p></div>
                  <div className="flex items-center gap-3"><div className="h-2 w-2 rounded-full bg-accent" /><p>Fin consultation — 20 Fév 14:50</p></div>
                  <div className="flex items-center gap-3"><div className="h-2 w-2 rounded-full bg-accent" /><p>Capture paiement — 20 Fév 14:51</p></div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" variant="outline"><Printer className="h-4 w-4 mr-2" />Reçu</Button>
                <Button className="flex-1 gradient-primary text-primary-foreground shadow-primary-glow">Envoyer facture</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DoctorBilling;