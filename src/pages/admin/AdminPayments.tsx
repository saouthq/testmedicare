/**
 * Admin Payments — with motif-required refund
 * TODO BACKEND: Replace with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, CreditCard, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";
import MotifDialog from "@/components/admin/MotifDialog";

const initialPayments = [
  { id: "pay-1", type: "subscription", amount: 129, currency: "DT", status: "paid", createdAt: "20 Fév 2026", payerName: "Dr. Ahmed Bouazizi" },
  { id: "pay-2", type: "teleconsult", amount: 35, currency: "DT", status: "paid", createdAt: "19 Fév 2026", payerName: "Fatma Trabelsi" },
  { id: "pay-3", type: "subscription", amount: 49, currency: "DT", status: "pending", createdAt: "18 Fév 2026", payerName: "Dr. Sonia Gharbi" },
  { id: "pay-4", type: "teleconsult", amount: 60, currency: "DT", status: "failed", createdAt: "17 Fév 2026", payerName: "Ali Ben Salem" },
  { id: "pay-5", type: "subscription", amount: 129, currency: "DT", status: "refunded", createdAt: "15 Fév 2026", payerName: "Dr. Khaled Hammami" },
];

const statusLabels: Record<string, string> = { paid: "Payé", pending: "En attente", failed: "Échoué", refunded: "Remboursé" };
const statusColors: Record<string, string> = { paid: "bg-accent/10 text-accent", pending: "bg-warning/10 text-warning", failed: "bg-destructive/10 text-destructive", refunded: "bg-muted text-muted-foreground" };

const AdminPayments = () => {
  const [search, setSearch] = useState("");
  const [payments, setPayments] = useState(initialPayments);
  const [refundTarget, setRefundTarget] = useState<string | null>(null);

  const filtered = payments.filter(p => !search || p.payerName.toLowerCase().includes(search.toLowerCase()));

  const handleRefundConfirm = (motif: string) => {
    if (!refundTarget) return;
    const p = payments.find(x => x.id === refundTarget);
    if (!p) return;
    setPayments(prev => prev.map(x => x.id === refundTarget ? { ...x, status: "refunded" } : x));
    appendLog("payment_refunded", "payment", refundTarget, `Remboursement ${p.amount} ${p.currency} à ${p.payerName} — Motif : ${motif}`);
    toast({ title: `${p.amount} ${p.currency} remboursé à ${p.payerName}` });
    setRefundTarget(null);
  };

  return (
    <DashboardLayout role="admin" title="Paiements & Transactions">
      <div className="space-y-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher un payeur..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>

        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Payeur</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Montant</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium text-foreground">{p.payerName}</td>
                  <td className="px-4 py-3"><span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{p.type === "subscription" ? "Abonnement" : "Téléconsult"}</span></td>
                  <td className="px-4 py-3 font-bold text-foreground">{p.amount} {p.currency}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.createdAt}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[p.status]}`}>{statusLabels[p.status]}</span></td>
                  <td className="px-4 py-3 text-right">
                    {p.status === "paid" && (
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-warning" onClick={() => setRefundTarget(p.id)}>
                        <RotateCcw className="h-3 w-3 mr-1" />Rembourser
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
