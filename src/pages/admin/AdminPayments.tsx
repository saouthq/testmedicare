/**
 * Admin Payments — Migrated to AdminDataTable component
 * ~210 lines → ~120 lines (-43%)
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import { Banknote, RotateCcw, Eye, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";
import MotifDialog from "@/components/admin/MotifDialog";
import { useAdminPayments } from "@/stores/adminStore";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import type { AdminPayment } from "@/types/admin";

const statusLabels: Record<string, string> = { paid: "Payé", pending: "En attente", failed: "Échoué", refunded: "Remboursé" };
const statusColors: Record<string, string> = { paid: "bg-accent/10 text-accent", pending: "bg-warning/10 text-warning", failed: "bg-destructive/10 text-destructive", refunded: "bg-muted text-muted-foreground" };
const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-TN", { day: "numeric", month: "short", year: "numeric" });

const AdminPayments = () => {
  const { payments, setPayments } = useAdminPayments();
  const [refundTarget, setRefundTarget] = useState<string | null>(null);
  const [detailPayment, setDetailPayment] = useState<AdminPayment | null>(null);

  const stats = useMemo(() => ({
    totalRevenue: payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0),
    paidCount: payments.filter(p => p.status === "paid").length,
    pendingAmount: payments.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0),
    refundedAmount: payments.filter(p => p.status === "refunded").reduce((s, p) => s + p.amount, 0),
  }), [payments]);

  const handleRefundConfirm = (motif: string) => {
    if (!refundTarget) return;
    const p = payments.find(x => x.id === refundTarget);
    if (!p) return;
    setPayments(prev => prev.map(x => x.id === refundTarget ? { ...x, status: "refunded" as const } : x));
    appendLog("payment_refunded", "payment", refundTarget, `Remboursement ${p.amount} ${p.currency} à ${p.payerName} — Motif : ${motif}`);
    toast({ title: `${p.amount} ${p.currency} remboursé à ${p.payerName}` });
    setRefundTarget(null);
  };

  return (
    <DashboardLayout role="admin" title="Paiements & Transactions">
      <AdminDataTable<AdminPayment>
        data={payments}
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
                <Button size="sm" variant="ghost" className="h-7 text-xs text-warning" onClick={() => setRefundTarget(p.id)}>
                  <RotateCcw className="h-3 w-3 mr-1" />Rembourser
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
