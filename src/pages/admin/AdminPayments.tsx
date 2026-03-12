/**
 * Admin Payments — Full workflows: mark paid, retry, invoice, user link, date filter
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import { Banknote, RotateCcw, Eye, CheckCircle, RefreshCw, FileText, ExternalLink, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";
import MotifDialog from "@/components/admin/MotifDialog";
import { useAdminPayments } from "@/stores/adminStore";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import type { AdminPayment } from "@/types/admin";
import { useNavigate } from "react-router-dom";

const statusLabels: Record<string, string> = { paid: "Payé", pending: "En attente", failed: "Échoué", refunded: "Remboursé" };
const statusColors: Record<string, string> = { paid: "bg-accent/10 text-accent", pending: "bg-warning/10 text-warning", failed: "bg-destructive/10 text-destructive", refunded: "bg-muted text-muted-foreground" };
const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-TN", { day: "numeric", month: "short", year: "numeric" });

type MotifTarget = { type: "refund" | "mark_paid"; id: string } | null;

const AdminPayments = () => {
  const navigate = useNavigate();
  const { payments, setPayments } = useAdminPayments();
  const [motifTarget, setMotifTarget] = useState<MotifTarget>(null);
  const [detailPayment, setDetailPayment] = useState<AdminPayment | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const dateFiltered = useMemo(() => {
    if (!dateFrom && !dateTo) return payments;
    return payments.filter(p => {
      const d = new Date(p.createdAt);
      if (dateFrom && d < new Date(dateFrom)) return false;
      if (dateTo && d > new Date(dateTo + "T23:59:59")) return false;
      return true;
    });
  }, [payments, dateFrom, dateTo]);

  const stats = useMemo(() => ({
    totalRevenue: dateFiltered.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0),
    paidCount: dateFiltered.filter(p => p.status === "paid").length,
    pendingAmount: dateFiltered.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0),
    failedCount: dateFiltered.filter(p => p.status === "failed").length,
    refundedAmount: dateFiltered.filter(p => p.status === "refunded").reduce((s, p) => s + p.amount, 0),
  }), [dateFiltered]);

  const handleMotifConfirm = (motif: string) => {
    if (!motifTarget) return;
    const p = payments.find(x => x.id === motifTarget.id);
    if (!p) return;

    if (motifTarget.type === "refund") {
      setPayments(prev => prev.map(x => x.id === motifTarget.id ? { ...x, status: "refunded" as const } : x));
      appendLog("payment_refunded", "payment", motifTarget.id, `Remboursement ${p.amount} ${p.currency} à ${p.payerName} — Motif : ${motif}`);
      toast({ title: `${p.amount} ${p.currency} remboursé à ${p.payerName}` });
    } else if (motifTarget.type === "mark_paid") {
      setPayments(prev => prev.map(x => x.id === motifTarget.id ? { ...x, status: "paid" as const } : x));
      appendLog("payment_marked_paid", "payment", motifTarget.id, `Paiement de ${p.payerName} marqué payé — Motif : ${motif}`);
      toast({ title: `Paiement de ${p.payerName} marqué comme payé` });
    }
    setMotifTarget(null);
    if (detailPayment?.id === motifTarget.id) setDetailPayment(null);
  };

  const handleRetry = (p: AdminPayment) => {
    appendLog("payment_retry", "payment", p.id, `Relance paiement échoué pour ${p.payerName}`);
    toast({ title: "Relance envoyée (mock)", description: `Email de relance envoyé à ${p.payerName}` });
  };

  const handleGenerateInvoice = (p: AdminPayment) => {
    appendLog("invoice_generated", "payment", p.id, `Facture générée pour ${p.payerName} — ${p.amount} ${p.currency}`);
    toast({ title: "Facture générée (mock)", description: `Facture #INV-${p.reference} téléchargée` });
  };

  return (
    <DashboardLayout role="admin" title="Paiements & Transactions">
      {/* Date range filter */}
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <Label className="text-[10px] text-muted-foreground">Du</Label>
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-8 text-xs w-36 mt-0.5" />
        </div>
        <div>
          <Label className="text-[10px] text-muted-foreground">Au</Label>
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-8 text-xs w-36 mt-0.5" />
        </div>
        {(dateFrom || dateTo) && (
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { setDateFrom(""); setDateTo(""); }}>
            <RefreshCw className="h-3 w-3 mr-1" />Reset
          </Button>
        )}
      </div>

      <AdminDataTable<AdminPayment>
        data={dateFiltered}
        searchPlaceholder="Rechercher par payeur ou référence..."
        searchFn={(item, q) => item.payerName.toLowerCase().includes(q) || item.reference.toLowerCase().includes(q)}
        onRowClick={setDetailPayment}
        emptyIcon={Banknote}
        emptyTitle="Aucun paiement"
        emptyDescription="Aucune transaction enregistrée."
        stats={[
          { label: "Revenus encaissés", value: `${stats.totalRevenue.toLocaleString()} DT`, color: "text-accent" },
          { label: "Transactions réussies", value: stats.paidCount, color: "text-primary" },
          { label: "En attente", value: `${stats.pendingAmount} DT`, color: "text-warning" },
          { label: "Échoués", value: stats.failedCount, color: "text-destructive" },
          { label: "Remboursés", value: `${stats.refundedAmount} DT`, color: "text-muted-foreground" },
        ]}
        filters={[
          { key: "type", label: "Type", options: [
            { value: "all", label: "Tous" },
            { value: "subscription", label: "Abonnement" },
            { value: "teleconsult", label: "Téléconsult" },
          ]},
          { key: "status", label: "Statut", options: [
            { value: "all", label: "Tous" },
            { value: "paid", label: "Payé" },
            { value: "pending", label: "En attente" },
            { value: "failed", label: "Échoué" },
            { value: "refunded", label: "Remboursé" },
          ]},
        ]}
        columns={[
          { key: "payerName", label: "Payeur", render: p => <span className="font-medium text-foreground">{p.payerName}</span> },
          { key: "reference", label: "Référence", render: p => <span className="text-xs text-muted-foreground font-mono">{p.reference}</span> },
          { key: "type", label: "Type", render: p => <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{p.type === "subscription" ? "Abonnement" : "Téléconsult"}</span> },
          { key: "amount", label: "Montant", render: p => <span className="font-bold text-foreground">{p.amount} {p.currency}</span>, sortable: true, sortFn: (a, b) => a.amount - b.amount },
          { key: "createdAt", label: "Date", render: p => <span className="text-muted-foreground text-xs">{formatDate(p.createdAt)}</span>, hideOnMobile: true },
          { key: "status", label: "Statut", render: p => <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[p.status]}`}>{statusLabels[p.status]}</span> },
          { key: "actions", label: "Actions", className: "text-right", render: p => (
            <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
              {p.status === "paid" && (
                <Button size="sm" variant="ghost" className="h-7 text-xs text-warning" onClick={() => setMotifTarget({ type: "refund", id: p.id })}>
                  <RotateCcw className="h-3 w-3 mr-1" />Rembourser
                </Button>
              )}
              {p.status === "pending" && (
                <Button size="sm" variant="ghost" className="h-7 text-xs text-accent" onClick={() => setMotifTarget({ type: "mark_paid", id: p.id })}>
                  <CheckCircle className="h-3 w-3 mr-1" />Payé
                </Button>
              )}
              {p.status === "failed" && (
                <Button size="sm" variant="ghost" className="h-7 text-xs text-primary" onClick={() => handleRetry(p)}>
                  <RefreshCw className="h-3 w-3 mr-1" />Relancer
                </Button>
              )}
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setDetailPayment(p)}>
                <Eye className="h-3.5 w-3.5" />
              </Button>
            </div>
          )},
        ]}
        exportCsv={{
          filename: "payments",
          headers: ["Référence", "Payeur", "Email", "Type", "Montant", "Statut", "Méthode", "Date"],
          rowFn: p => [p.reference, p.payerName, p.payerEmail, p.type === "subscription" ? "Abonnement" : "Téléconsult", `${p.amount} ${p.currency}`, statusLabels[p.status], p.method, p.createdAt],
        }}
      />

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

              {/* Actions */}
              <div className="space-y-2">
                {detailPayment.status === "paid" && (
                  <>
                    <Button size="sm" variant="outline" className="w-full text-warning" onClick={() => { setDetailPayment(null); setMotifTarget({ type: "refund", id: detailPayment.id }); }}>
                      <RotateCcw className="h-4 w-4 mr-1" />Rembourser
                    </Button>
                    <Button size="sm" variant="outline" className="w-full" onClick={() => handleGenerateInvoice(detailPayment)}>
                      <FileText className="h-4 w-4 mr-1" />Générer facture
                    </Button>
                  </>
                )}
                {detailPayment.status === "pending" && (
                  <Button size="sm" className="w-full gradient-primary text-primary-foreground" onClick={() => { setDetailPayment(null); setMotifTarget({ type: "mark_paid", id: detailPayment.id }); }}>
                    <CheckCircle className="h-4 w-4 mr-1" />Marquer comme payé
                  </Button>
                )}
                {detailPayment.status === "failed" && (
                  <Button size="sm" variant="outline" className="w-full" onClick={() => handleRetry(detailPayment)}>
                    <RefreshCw className="h-4 w-4 mr-1" />Relancer le paiement
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="w-full text-xs text-muted-foreground" onClick={() => { setDetailPayment(null); navigate("/dashboard/admin/users"); }}>
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />Voir le profil du payeur
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <MotifDialog
        open={!!motifTarget}
        onClose={() => setMotifTarget(null)}
        onConfirm={handleMotifConfirm}
        title={motifTarget?.type === "mark_paid" ? "Marquer comme payé" : "Rembourser le paiement"}
        description={payments.find(p => p.id === motifTarget?.id)?.payerName || ""}
        confirmLabel={motifTarget?.type === "mark_paid" ? "Confirmer le paiement" : "Confirmer le remboursement"}
        destructive={motifTarget?.type === "refund"}
      />
    </DashboardLayout>
  );
};

export default AdminPayments;
