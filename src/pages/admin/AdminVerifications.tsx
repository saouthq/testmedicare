/**
 * Admin Validations / KYC — Approve/Reject with mandatory motif + dossier drawer
 * TODO BACKEND: Replace with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { CheckCircle, XCircle, FileText, Eye, Calendar, MapPin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";
import MotifDialog from "@/components/admin/MotifDialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type Tab = "doctors" | "labs" | "pharmacies";

const initialVerifications = [
  { id: "v-1", entityType: "doctor" as const, entityName: "Dr. Karim Bouzid", specialty: "Cardiologue", city: "Tunis", email: "karim@email.tn", submittedAt: "18 Fév 2026", status: "pending", docs: ["Diplôme de médecine", "CIN recto/verso", "Attestation d'inscription à l'Ordre"] },
  { id: "v-2", entityType: "doctor" as const, entityName: "Dr. Nadia Hamdi", specialty: "Dermatologue", city: "Ariana", email: "nadia@email.tn", submittedAt: "20 Fév 2026", status: "pending", docs: ["Diplôme de médecine", "CIN recto/verso"] },
  { id: "v-3", entityType: "lab" as const, entityName: "Labo MedTest", specialty: "Analyses médicales", city: "Sousse", email: "medtest@lab.tn", submittedAt: "19 Fév 2026", status: "pending", docs: ["Autorisation d'exercice", "Registre de commerce", "Certificat d'accréditation", "CIN gérant"] },
  { id: "v-4", entityType: "pharmacy" as const, entityName: "Pharmacie El Amal", specialty: "Officine", city: "Sousse", email: "elamal@pharmacy.tn", submittedAt: "19 Fév 2026", status: "pending", docs: ["Licence de pharmacie", "Registre de commerce", "CIN titulaire"] },
  { id: "v-5", entityType: "doctor" as const, entityName: "Dr. Sami Trabelsi", specialty: "Généraliste", city: "Sfax", email: "sami@email.tn", submittedAt: "15 Fév 2026", status: "approved", docs: ["Diplôme", "CIN"] },
  { id: "v-6", entityType: "lab" as const, entityName: "Labo XYZ", specialty: "Analyses", city: "Tunis", email: "xyz@lab.tn", submittedAt: "12 Fév 2026", status: "rejected", docs: ["Document incomplet"] },
];

const tabMap: Record<Tab, string> = { doctors: "doctor", labs: "lab", pharmacies: "pharmacy" };
const statusColors: Record<string, string> = { pending: "bg-warning/10 text-warning", approved: "bg-accent/10 text-accent", rejected: "bg-destructive/10 text-destructive" };
const statusLabels: Record<string, string> = { pending: "En attente", approved: "Approuvé", rejected: "Refusé" };

const AdminVerifications = () => {
  const [tab, setTab] = useState<Tab>("doctors");
  const [verifications, setVerifications] = useState(initialVerifications);
  const [motifAction, setMotifAction] = useState<{ id: string; type: "approve" | "reject" } | null>(null);
  const [drawerItem, setDrawerItem] = useState<typeof initialVerifications[0] | null>(null);

  const filtered = verifications.filter(v => v.entityType === tabMap[tab]);

  const handleMotifConfirm = (motif: string) => {
    if (!motifAction) return;
    const v = verifications.find(x => x.id === motifAction.id);
    if (!v) return;

    if (motifAction.type === "approve") {
      setVerifications(prev => prev.map(x => x.id === motifAction.id ? { ...x, status: "approved" } : x));
      appendLog("verification_approved", "verification", motifAction.id, `${v.entityName} approuvé(e) — Motif : ${motif}`);
      toast({ title: `${v.entityName} approuvé(e)` });
    } else {
      setVerifications(prev => prev.map(x => x.id === motifAction.id ? { ...x, status: "rejected" } : x));
      appendLog("verification_rejected", "verification", motifAction.id, `${v.entityName} refusé(e) — Motif : ${motif}`);
      toast({ title: `${v.entityName} refusé(e)`, variant: "destructive" });
    }
    setMotifAction(null);
  };

  return (
    <DashboardLayout role="admin" title="Validations KYC">
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
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {v.specialty} · {v.city} · Soumis le {v.submittedAt} · {v.docs.length} document(s)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[v.status]}`}>{statusLabels[v.status]}</span>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setDrawerItem(v)} title="Voir dossier">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {v.status === "pending" && (
                <div className="mt-4 flex items-center gap-2">
                  <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => setMotifAction({ id: v.id, type: "approve" })}>
                    <CheckCircle className="h-4 w-4 mr-1" />Approuver
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive" onClick={() => setMotifAction({ id: v.id, type: "reject" })}>
                    <XCircle className="h-4 w-4 mr-1" />Refuser
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Motif dialog */}
      {motifAction && (
        <MotifDialog
          open={!!motifAction}
          onClose={() => setMotifAction(null)}
          onConfirm={handleMotifConfirm}
          title={motifAction.type === "approve" ? "Approuver l'inscription" : "Refuser l'inscription"}
          description={verifications.find(v => v.id === motifAction.id)?.entityName || ""}
          confirmLabel={motifAction.type === "approve" ? "Approuver" : "Refuser"}
          destructive={motifAction.type === "reject"}
        />
      )}

      {/* Dossier drawer */}
      <Sheet open={!!drawerItem} onOpenChange={() => setDrawerItem(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {drawerItem && (
            <>
              <SheetHeader>
                <SheetTitle>Dossier — {drawerItem.entityName}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" />{drawerItem.city}</div>
                  <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" />{drawerItem.email}</div>
                  <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" />Soumis le {drawerItem.submittedAt}</div>
                </div>
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Documents soumis</h4>
                  <div className="space-y-2">
                    {drawerItem.docs.map((doc, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                        <FileText className="h-5 w-5 text-primary shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{doc}</p>
                          <p className="text-[10px] text-muted-foreground">Placeholder — PDF/Image</p>
                        </div>
                        <Button size="sm" variant="ghost" className="text-xs h-7">Voir</Button>
                      </div>
                    ))}
                  </div>
                </div>
                {drawerItem.status === "pending" && (
                  <div className="pt-4 border-t flex gap-2">
                    <Button size="sm" className="flex-1 gradient-primary text-primary-foreground" onClick={() => { setDrawerItem(null); setMotifAction({ id: drawerItem.id, type: "approve" }); }}>
                      <CheckCircle className="h-4 w-4 mr-1" />Approuver
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-destructive" onClick={() => { setDrawerItem(null); setMotifAction({ id: drawerItem.id, type: "reject" }); }}>
                      <XCircle className="h-4 w-4 mr-1" />Refuser
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default AdminVerifications;
