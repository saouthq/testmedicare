/**
 * Admin Payments — Stats, filters, detail drawer, CSV export, refund with motif
 * TODO BACKEND: Replace with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import { Search, CreditCard, RotateCcw, Download, Eye, TrendingUp, ArrowUpRight, Clock, Banknote } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";
import MotifDialog from "@/components/admin/MotifDialog";

interface Payment {
  id: string;
  type: "subscription" | "teleconsult";
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  payerName: string;
  payerEmail: string;
  method: string;
  reference: string;
}

const initialPayments: Payment[] = [
  { id: "pay-1", type: "subscription", amount: 129, currency: "DT", status: "paid", createdAt: "2026-03-08", payerName: "Dr. Ahmed Bouazizi", payerEmail: "ahmed@email.tn", method: "Carte bancaire", reference: "SUB-20260308-001" },
  { id: "pay-2", type: "teleconsult", amount: 35, currency: "DT", status: "paid", createdAt: "2026-03-07", payerName: "Fatma Trabelsi", payerEmail: "fatma@email.tn", method: "Carte bancaire", reference: "TC-20260307-042" },
  { id: "pay-3", type: "subscription", amount: 49, currency: "DT", status: "pending", createdAt: "2026-03-06", payerName: "Dr. Sonia Gharbi", payerEmail: "sonia@email.tn", method: "Virement", reference: "SUB-20260306-003" },
  { id: "pay-4", type: "teleconsult", amount: 60, currency: "DT", status: "failed", createdAt: "2026-03-05", payerName: "Ali Ben Salem", payerEmail: "ali@email.tn", method: "Carte bancaire", reference: "TC-20260305-018" },
  { id: "pay-5", type: "subscription", amount: 129, currency: "DT", status: "refunded", createdAt: "2026-03-03", payerName: "Dr. Khaled Hammami", payerEmail: "khaled@email.tn", method: "Carte bancaire", reference: "SUB-20260303-002" },
  { id: "pay-6", type: "teleconsult", amount: 35, currency: "DT", status: "paid", createdAt: "2026-03-02", payerName: "Sarra Mejri", payerEmail: "sarra@email.tn", method: "Carte bancaire", reference: "TC-20260302-007" },
  { id: "pay-7", type: "subscription", amount: 129, currency: "DT", status: "paid", createdAt: "2026-03-01", payerName: "Dr. Nadia Hamdi", payerEmail: "nadia@email.tn", method: "Carte bancaire", reference: "SUB-20260301-005" },
  { id: "pay-8", type: "teleconsult", amount: 45, currency: "DT", status: "paid", createdAt: "2026-02-28", payerName: "Mohamed Kaabi", payerEmail: "mohamed@email.tn", method: "Carte bancaire", reference: "TC-20260228-033" },
];

const statusLabels: Record<string, string> = { paid: "Payé", pending: "En attente", failed: "Échoué", refunded: "Remboursé" };
const statusColors: Record<string, string> = { paid: "bg-accent/10 text-accent", pending: "bg-warning/10 text-warning", failed: "bg-destructive/10 text-destructive", refunded: "bg-muted text-muted-foreground" };

const AdminPayments = () => {
  const [search, setSearch] = useState("");
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [typeFilter, setTypeFilter] = useState<"all" | "subscription" | "teleconsult">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending" | "failed" | "refunded">("all");
  const [refundTarget, setRefundTarget] = useState<string | null>(null);
  const [detailPayment, setDetailPayment] = useState<Payment | null>(null);

  const filtered = useMemo(() => payments.filter(p => {
    if (typeFilter !== "all" && p.type !== typeFilter) return false;
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (search && !p.payerName.toLowerCase().includes(search.toLowerCase()) && !p.reference.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [payments, typeFilter, statusFilter, search]);

  const stats = useMemo(() => ({
    totalRevenue: payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0),
    totalCount: payments.length,
    paidCount: payments.filter(p => p.status === "paid").length,
    pendingAmount: payments.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0),
    refundedAmount: payments.filter(p => p.status === "refunded").reduce((s, p) => s + p.amount, 0),
  }), [payments]);

  const handleRefundConfirm = (motif: string) => {
    if (!refundTarget) return;
    const p = payments.find(x => x.id === refundTarget);
    if (!p) return;
    setPayments(prev => prev.map(x => x.id === refundTarget ? { ...x, status: "refunded" } : x));
    appendLog("payment_refunded", "payment", refundTarget, `Remboursement ${p.amount} ${p.currency} à ${p.payerName} — Motif : ${motif}`);
    toast({ title: `${p.amount} ${p.currency} remboursé à ${p.payerName}` });
    setRefundTarget(null);
  };

  const handleExportCSV = () => {
    const csv = ["Référence,Payeur,Email,Type,Montant,Statut,Méthode,Date"]
      .concat(filtered.map(p => `"${p.reference}","${p.payerName}","${p.payerEmail}","${p.type === "subscription" ? "Abonnement" : "Téléconsult"}","${p.amount} ${p.currency}","${statusLabels[p.status]}","${p.method}","${p.createdAt}"`))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `payments_${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export CSV téléchargé" });
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-TN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <DashboardLayout role="admin" title="Paiements & Transactions">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <Banknote className="h-5 w-5 text-accent mb-2" />
            <p className="text-2xl font-bold text-foreground">{stats.totalRevenue.toLocaleString()} DT</p>
            <p className="text-xs text-muted-foreground">Revenus encaissés</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <TrendingUp className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{stats.paidCount}</p>
            <p className="text-xs text-muted-foreground">Transactions réussies</p>
          </div>
          <div className="rounded-xl border bg-warning/5 p-5 shadow-card">
            <Clock className="h-5 w-5 text-warning mb-2" />
            <p className="text-2xl font-bold text-warning">{stats.pendingAmount} DT</p>
            <p className="text-xs text-muted-foreground">En attente</p>
          </div>
          <div className="rounded-xl border bg-muted/30 p-5 shadow-card">
            <RotateCcw className="h-5 w-5 text-muted-foreground mb-2" />
            <p className="text-2xl font-bold text-muted-foreground">{stats.refundedAmount} DT</p>
            <p className="text-xs text-muted-foreground">Remboursés</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher par payeur ou référence..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-2">
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="rounded-lg border bg-card px-3 py-2 text-sm">
              <option value="all">Tous types</option>
              <option value="subscription">Abonnement</option>
              <option value="teleconsult">Téléconsult</option>
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="rounded-lg border bg-card px-3 py-2 text-sm">
              <option value="all">Tous statuts</option>
              <option value="paid">Payé</option>
              <option value="pending">En attente</option>
              <option value="failed">Échoué</option>
              <option value="refunded">Remboursé</option>
            </select>
            <Button variant="outline" size="sm" className="text-xs h-9" onClick={handleExportCSV}>
              <Download className="h-3.5 w-3.5 mr-1" />CSV
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Payeur</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Référence</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Montant</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Date</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20 cursor-pointer" onClick={() => setDetailPayment(p)}>
                  <td className="px-4 py-3 font-medium text-foreground">{p.payerName}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{p.reference}</td>
                  <td className="px-4 py-3"><span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{p.type === "subscription" ? "Abonnement" : "Téléconsult"}</span></td>
                  <td className="px-4 py-3 font-bold text-foreground">{p.amount} {p.currency}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell text-xs">{formatDate(p.createdAt)}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[p.status]}`}>{statusLabels[p.status]}</span></td>
                  <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {p.status === "paid" && (
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-warning" onClick={() => setRefundTarget(p.id)}>
                          <RotateCcw className="h-3 w-3 mr-1" />Rembourser
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setDetailPayment(p)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail drawer */}
      <Sheet open={!!detailPayment} onOpenChange={() => setDetailPayment(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Détail du paiement</SheetTitle>
            <SheetDescription className="sr-only">Informations de transaction</SheetDescription>
          </SheetHeader>
          {detailPayment && (
            <div className="space-y-4 mt-4">
              <div className="rounded-lg border p-4 space-y-3">
                {[
                  { label: "Référence", value: detailPayment.reference },
                  { label: "Payeur", value: detailPayment.payerName },
                  { label: "Email", value: detailPayment.payerEmail },
                  { label: "Type", value: detailPayment.type === "subscription" ? "Abonnement" : "Téléconsultation" },
                  { label: "Méthode", value: detailPayment.method },
                  { label: "Date", value: formatDate(detailPayment.createdAt) },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="font-medium text-foreground">{r.value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground font-semibold">Montant</span>
                  <span className="text-lg font-bold text-foreground">{detailPayment.amount} {detailPayment.currency}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Statut</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[detailPayment.status]}`}>{statusLabels[detailPayment.status]}</span>
                </div>
              </div>
              {detailPayment.status === "paid" && (
                <Button size="sm" variant="outline" className="w-full text-warning" onClick={() => { setDetailPayment(null); setRefundTarget(detailPayment.id); }}>
                  <RotateCcw className="h-4 w-4 mr-1" />Rembourser
                </Button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      <MotifDialog
        open={!!refundTarget}
        onClose={() => setRefundTarget(null)}
        onConfirm={handleRefundConfirm}
        title="Rembourser le paiement"
        description={payments.find(p => p.id === refundTarget)?.payerName || ""}
        confirmLabel="Confirmer le remboursement"
        destructive
      />
    </DashboardLayout>
  );
};

export default AdminPayments;
