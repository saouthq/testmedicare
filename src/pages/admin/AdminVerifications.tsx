import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { CheckCircle, XCircle, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { approveVerification, rejectVerification } from "@/services/admin/adminVerificationService";
import { toast } from "@/hooks/use-toast";

type Tab = "doctors" | "labs" | "pharmacies";

const initialVerifications = [
  { id: "v-1", entityType: "doctor" as const, entityName: "Dr. Karim Bouzid", city: "Tunis", submittedAt: "18 Fév 2026", status: "pending", docsCount: 3 },
  { id: "v-2", entityType: "doctor" as const, entityName: "Dr. Nadia Hamdi", city: "Ariana", submittedAt: "20 Fév 2026", status: "pending", docsCount: 2 },
  { id: "v-3", entityType: "lab" as const, entityName: "Labo MedTest", city: "Sousse", submittedAt: "19 Fév 2026", status: "pending", docsCount: 4 },
  { id: "v-4", entityType: "pharmacy" as const, entityName: "Pharmacie El Amal", city: "Sousse", submittedAt: "19 Fév 2026", status: "pending", docsCount: 3 },
  { id: "v-5", entityType: "doctor" as const, entityName: "Dr. Sami Trabelsi", city: "Sfax", submittedAt: "15 Fév 2026", status: "approved", docsCount: 2 },
  { id: "v-6", entityType: "lab" as const, entityName: "Labo XYZ", city: "Tunis", submittedAt: "12 Fév 2026", status: "rejected", docsCount: 1 },
];

const tabMap: Record<Tab, string> = { doctors: "doctor", labs: "lab", pharmacies: "pharmacy" };
const statusColors: Record<string, string> = { pending: "bg-warning/10 text-warning", approved: "bg-accent/10 text-accent", rejected: "bg-destructive/10 text-destructive" };
const statusLabels: Record<string, string> = { pending: "En attente", approved: "Approuvé", rejected: "Refusé" };

const AdminVerifications = () => {
  const [tab, setTab] = useState<Tab>("doctors");
  const [verifications, setVerifications] = useState(initialVerifications);
  const [rejectReason, setRejectReason] = useState("");

  const filtered = verifications.filter(v => v.entityType === tabMap[tab]);

  const handleApprove = (id: string) => {
    const v = verifications.find(x => x.id === id);
    if (!v) return;
    approveVerification(id, v.entityName);
    setVerifications(prev => prev.map(x => x.id === id ? { ...x, status: "approved" } : x));
    toast({ title: `${v.entityName} approuvé(e)` });
  };

  const handleReject = (id: string) => {
    const v = verifications.find(x => x.id === id);
    if (!v) return;
    rejectVerification(id, v.entityName, rejectReason || "Documents non conformes");
    setVerifications(prev => prev.map(x => x.id === id ? { ...x, status: "rejected" } : x));
    toast({ title: `${v.entityName} refusé(e)`, variant: "destructive" });
  };

  return (
    <DashboardLayout role="admin" title="Validations">
      <div className="space-y-6">
        <div className="flex gap-1 rounded-lg border bg-card p-0.5 w-fit">
          {([["doctors", "Médecins"], ["labs", "Laboratoires"], ["pharmacies", "Pharmacies"]] as [Tab, string][]).map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {label} ({verifications.filter(v => v.entityType === tabMap[k]).length})
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map(v => (
            <div key={v.id} className="rounded-xl border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">{v.entityName}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{v.city} · Soumis le {v.submittedAt} · {v.docsCount} document(s)</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[v.status]}`}>{statusLabels[v.status]}</span>
              </div>
              {v.status === "pending" && (
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => handleApprove(v.id)}>
                    <CheckCircle className="h-4 w-4 mr-1" />Approuver
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleReject(v.id)}>
                    <XCircle className="h-4 w-4 mr-1" />Refuser
                  </Button>
                  <Input placeholder="Motif du refus..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="h-9 w-48 text-xs" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminVerifications;
