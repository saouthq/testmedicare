/**
 * Admin Validations KYC — Enhanced with timeline, relance, notes internes, stats
 * Connected to partnerRegistrationStore for new registrations from BecomePartner
 * TODO BACKEND: Replace with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo, useEffect } from "react";
import {
  CheckCircle, XCircle, FileText, Eye, Calendar, MapPin, Mail, Clock,
  Send, RefreshCw, MessageSquare, AlertTriangle, Shield, Gift, CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";
import MotifDialog from "@/components/admin/MotifDialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { getRegistrations, updateRegistrationStatus, addRegistrationEvent } from "@/stores/partnerRegistrationStore";
import type { PartnerRegistration } from "@/stores/partnerRegistrationStore";

type Tab = "doctors" | "labs" | "pharmacies";

interface VerifEvent {
  id: string;
  type: "submitted" | "note" | "relance" | "approved" | "rejected" | "docs_requested";
  text: string;
  author: string;
  createdAt: string;
}

interface Verification {
  id: string;
  entityType: "doctor" | "lab" | "pharmacy";
  entityName: string;
  specialty: string;
  city: string;
  email: string;
  phone: string;
  submittedAt: string;
  status: string;
  docs: string[];
  events: VerifEvent[];
}

const initialVerifications: Verification[] = [
  {
    id: "v-1", entityType: "doctor", entityName: "Dr. Karim Bouzid", specialty: "Cardiologue",
    city: "Tunis", email: "karim@email.tn", phone: "+216 71 111 222", submittedAt: "08 Mar 2026", status: "pending",
    docs: ["Diplôme de médecine", "CIN recto/verso", "Attestation d'inscription à l'Ordre"],
    events: [
      { id: "e1", type: "submitted", text: "Dossier soumis avec 3 documents", author: "Dr. Karim Bouzid", createdAt: "2026-03-08T10:00:00" },
    ],
  },
  {
    id: "v-2", entityType: "doctor", entityName: "Dr. Nadia Hamdi", specialty: "Dermatologue",
    city: "Ariana", email: "nadia@email.tn", phone: "+216 71 333 444", submittedAt: "09 Mar 2026", status: "pending",
    docs: ["Diplôme de médecine", "CIN recto/verso"],
    events: [
      { id: "e2", type: "submitted", text: "Dossier soumis avec 2 documents", author: "Dr. Nadia Hamdi", createdAt: "2026-03-09T08:00:00" },
    ],
  },
  {
    id: "v-3", entityType: "lab", entityName: "Labo MedTest", specialty: "Analyses médicales",
    city: "Sousse", email: "medtest@lab.tn", phone: "+216 73 555 666", submittedAt: "07 Mar 2026", status: "pending",
    docs: ["Autorisation d'exercice", "Registre de commerce", "Certificat d'accréditation", "CIN gérant"],
    events: [
      { id: "e3", type: "submitted", text: "Dossier soumis avec 4 documents", author: "Labo MedTest", createdAt: "2026-03-07T14:00:00" },
      { id: "e4", type: "note", text: "Certificat d'accréditation à vérifier auprès du TUNAC", author: "Admin", createdAt: "2026-03-08T09:00:00" },
    ],
  },
  {
    id: "v-4", entityType: "pharmacy", entityName: "Pharmacie El Amal", specialty: "Officine",
    city: "Sousse", email: "elamal@pharmacy.tn", phone: "+216 73 222 333", submittedAt: "06 Mar 2026", status: "pending",
    docs: ["Licence de pharmacie", "Registre de commerce", "CIN titulaire"],
    events: [
      { id: "e5", type: "submitted", text: "Dossier soumis avec 3 documents", author: "Pharmacie El Amal", createdAt: "2026-03-06T11:00:00" },
      { id: "e6", type: "relance", text: "Relance envoyée par email pour complément (autorisation DPHM manquante)", author: "Admin", createdAt: "2026-03-07T10:00:00" },
    ],
  },
  {
    id: "v-5", entityType: "doctor", entityName: "Dr. Sami Trabelsi", specialty: "Généraliste",
    city: "Sfax", email: "sami@email.tn", phone: "+216 74 111 222", submittedAt: "01 Mar 2026", status: "approved",
    docs: ["Diplôme", "CIN"],
    events: [
      { id: "e7", type: "submitted", text: "Dossier soumis", author: "Dr. Sami Trabelsi", createdAt: "2026-03-01T09:00:00" },
      { id: "e8", type: "approved", text: "Dossier approuvé — Tous les documents conformes", author: "Admin", createdAt: "2026-03-02T14:00:00" },
    ],
  },
  {
    id: "v-6", entityType: "lab", entityName: "Labo XYZ", specialty: "Analyses",
    city: "Tunis", email: "xyz@lab.tn", phone: "+216 71 999 000", submittedAt: "25 Fév 2026", status: "rejected",
    docs: ["Document incomplet"],
    events: [
      { id: "e9", type: "submitted", text: "Dossier soumis avec 1 document", author: "Labo XYZ", createdAt: "2026-02-25T10:00:00" },
      { id: "e10", type: "docs_requested", text: "Documents complémentaires demandés (autorisation, RC)", author: "Admin", createdAt: "2026-02-26T09:00:00" },
      { id: "e11", type: "rejected", text: "Dossier refusé — Aucun complément reçu après relance", author: "Admin", createdAt: "2026-03-05T16:00:00" },
    ],
  },
];

const tabMap: Record<Tab, string> = { doctors: "doctor", labs: "lab", pharmacies: "pharmacy" };
const statusColors: Record<string, string> = { pending: "bg-warning/10 text-warning", approved: "bg-accent/10 text-accent", rejected: "bg-destructive/10 text-destructive" };
const statusLabels: Record<string, string> = { pending: "En attente", approved: "Approuvé", rejected: "Refusé" };
const eventIcons: Record<string, any> = { submitted: FileText, note: MessageSquare, relance: Send, approved: CheckCircle, rejected: XCircle, docs_requested: AlertTriangle };
const eventColors: Record<string, string> = { submitted: "text-primary", note: "text-muted-foreground", relance: "text-warning", approved: "text-accent", rejected: "text-destructive", docs_requested: "text-warning" };

const AdminVerifications = () => {
  const [tab, setTab] = useState<Tab>("doctors");

  // Merge hardcoded verifications with registrations from partner store
  const buildVerifications = (): Verification[] => {
    const base = [...initialVerifications];
    const registrations = getRegistrations();

    // Convert registrations to Verification format
    registrations.forEach(reg => {
      const entityType = reg.type === "lab" ? "lab" : reg.type === "pharmacy" ? "pharmacy" : reg.type === "clinic" ? "pharmacy" : "doctor";
      const entityName = reg.type === "doctor"
        ? `Dr. ${reg.firstName} ${reg.lastName}`
        : reg.organization || `${reg.firstName} ${reg.lastName}`;

      // Don't add duplicates (check by id)
      if (base.some(v => v.id === reg.id)) return;

      base.unshift({
        id: reg.id,
        entityType,
        entityName,
        specialty: reg.specialty || reg.activity,
        city: reg.city,
        email: reg.email,
        phone: reg.phone,
        submittedAt: new Date(reg.submittedAt).toLocaleDateString("fr-TN", { day: "2-digit", month: "short", year: "numeric" }),
        status: reg.status,
        docs: reg.docs,
        events: reg.events as VerifEvent[],
        // Extra fields for display
        _plan: reg.plan,
        _planPrice: reg.planPrice,
        _billing: reg.billing,
        _promoApplied: reg.promoApplied,
        _registrationId: reg.id,
      } as Verification & Record<string, any>);
    });

    return base;
  };

  const [verifications, setVerifications] = useState(buildVerifications);
  const [motifAction, setMotifAction] = useState<{ id: string; type: "approve" | "reject" } | null>(null);
  const [drawerItem, setDrawerItem] = useState<Verification | null>(null);
  const [adminNote, setAdminNote] = useState("");

  // Refresh from store periodically (for cross-tab sync)
  useEffect(() => {
    const interval = setInterval(() => {
      setVerifications(buildVerifications());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const filtered = verifications.filter(v => v.entityType === tabMap[tab]);

  const stats = useMemo(() => ({
    total: verifications.length,
    pending: verifications.filter(v => v.status === "pending").length,
    approved: verifications.filter(v => v.status === "approved").length,
    rejected: verifications.filter(v => v.status === "rejected").length,
    avgDays: "2.4",
  }), [verifications]);

  const handleMotifConfirm = (motif: string) => {
    if (!motifAction) return;
    const v = verifications.find(x => x.id === motifAction.id);
    if (!v) return;

    const event: VerifEvent = {
      id: `e-${Date.now()}`, author: "Admin", createdAt: new Date().toISOString(),
      type: motifAction.type === "approve" ? "approved" : "rejected",
      text: `${motifAction.type === "approve" ? "Approuvé" : "Refusé"} — Motif : ${motif}`,
    };

    const newStatus = motifAction.type === "approve" ? "approved" : "rejected";
    setVerifications(prev => prev.map(x => x.id === motifAction.id ? { ...x, status: newStatus, events: [...x.events, event] } : x));

    // Also update registration store if this came from partner registration
    if (v.id.startsWith("reg-")) {
      updateRegistrationStatus(v.id, newStatus as any, motif);
    }

    appendLog(`verification_${newStatus}`, "verification", motifAction.id, `${v.entityName} ${newStatus === "approved" ? "approuvé(e)" : "refusé(e)"} — Motif : ${motif}`);
    toast({ title: `${v.entityName} ${newStatus === "approved" ? "approuvé(e)" : "refusé(e)"}`, variant: newStatus === "rejected" ? "destructive" : "default" });
    setMotifAction(null);
    if (drawerItem?.id === motifAction.id) {
      setDrawerItem(prev => prev ? { ...prev, status: newStatus, events: [...prev.events, event] } : null);
    }
  };

  const handleRelance = () => {
    if (!drawerItem) return;
    const event: VerifEvent = {
      id: `e-${Date.now()}`, author: "Admin", createdAt: new Date().toISOString(),
      type: "relance", text: "Relance envoyée par email pour complément de dossier",
    };
    setVerifications(prev => prev.map(x => x.id === drawerItem.id ? { ...x, events: [...x.events, event] } : x));
    setDrawerItem(prev => prev ? { ...prev, events: [...prev.events, event] } : null);

    if (drawerItem.id.startsWith("reg-")) {
      addRegistrationEvent(drawerItem.id, "relance", "Relance envoyée par email pour complément de dossier");
    }

    appendLog("verification_relance", "verification", drawerItem.id, `Relance envoyée à ${drawerItem.entityName}`);
    toast({ title: "Relance envoyée", description: `Email envoyé à ${drawerItem.email}` });
  };

  const handleAddNote = () => {
    if (!drawerItem || !adminNote.trim()) return;
    const event: VerifEvent = {
      id: `e-${Date.now()}`, author: "Admin", createdAt: new Date().toISOString(),
      type: "note", text: adminNote.trim(),
    };
    setVerifications(prev => prev.map(x => x.id === drawerItem.id ? { ...x, events: [...x.events, event] } : x));
    setDrawerItem(prev => prev ? { ...prev, events: [...prev.events, event] } : null);
    setAdminNote("");
    toast({ title: "Note ajoutée" });
  };

  return (
    <DashboardLayout role="admin" title="Validations KYC">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border bg-card p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-[11px] text-muted-foreground">Total dossiers</p>
          </div>
          <div className="rounded-xl border bg-warning/5 p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-warning">{stats.pending}</p>
            <p className="text-[11px] text-muted-foreground">En attente</p>
          </div>
          <div className="rounded-xl border bg-accent/5 p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-accent">{stats.approved}</p>
            <p className="text-[11px] text-muted-foreground">Approuvés</p>
          </div>
          <div className="rounded-xl border bg-destructive/5 p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-destructive">{stats.rejected}</p>
            <p className="text-[11px] text-muted-foreground">Refusés</p>
          </div>
          <div className="rounded-xl border bg-primary/5 p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-primary">{stats.avgDays}j</p>
            <p className="text-[11px] text-muted-foreground">Délai moyen</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg border bg-card p-0.5 w-fit">
          {([["doctors", "Médecins"], ["labs", "Laboratoires"], ["pharmacies", "Pharmacies"]] as [Tab, string][]).map(([k, label]) => {
            const count = verifications.filter(v => v.entityType === tabMap[k]).length;
            const pending = verifications.filter(v => v.entityType === tabMap[k] && v.status === "pending").length;
            return (
              <button key={k} onClick={() => setTab(k)} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {label} ({count}){pending > 0 && <span className="ml-1 text-[10px] bg-warning/20 text-warning px-1.5 py-0.5 rounded-full">{pending}</span>}
              </button>
            );
          })}
        </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aucun dossier</p>
            </div>
          )}
          {filtered.map(v => (
            <div key={v.id} className="rounded-xl border bg-card p-5 shadow-card hover:shadow-md transition-all cursor-pointer" onClick={() => setDrawerItem(v)}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">{v.entityName}</h4>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[v.status]}`}>{statusLabels[v.status]}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                     <span>{v.specialty}</span>
                     <span>·</span>
                     <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{v.city}</span>
                     <span>·</span>
                     <span>{v.docs.length} doc(s)</span>
                     <span>·</span>
                     <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{v.submittedAt}</span>
                     {(v as any)._plan && (
                       <span className="flex items-center gap-1 text-primary"><CreditCard className="h-3 w-3" />{(v as any)._plan} — {(v as any)._planPrice} DT</span>
                     )}
                     {(v as any)._promoApplied && (
                       <span className="flex items-center gap-1 text-accent"><Gift className="h-3 w-3" />{(v as any)._promoApplied}</span>
                     )}
                     {v.events.filter(e => e.type === "relance").length > 0 && (
                       <span className="text-warning flex items-center gap-1"><RefreshCw className="h-3 w-3" />{v.events.filter(e => e.type === "relance").length} relance(s)</span>
                     )}
                  </p>
                </div>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={e => { e.stopPropagation(); setDrawerItem(v); }}>
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              {v.status === "pending" && (
                <div className="mt-3 flex items-center gap-2">
                  <Button size="sm" className="gradient-primary text-primary-foreground" onClick={e => { e.stopPropagation(); setMotifAction({ id: v.id, type: "approve" }); }}>
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />Approuver
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive" onClick={e => { e.stopPropagation(); setMotifAction({ id: v.id, type: "reject" }); }}>
                    <XCircle className="h-3.5 w-3.5 mr-1" />Refuser
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

      {/* Dossier drawer with timeline */}
      <Sheet open={!!drawerItem} onOpenChange={() => { setDrawerItem(null); setAdminNote(""); }}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
          {drawerItem && (
            <>
              <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
                <SheetTitle>Dossier — {drawerItem.entityName}</SheetTitle>
                <SheetDescription className="sr-only">Détail du dossier KYC</SheetDescription>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[drawerItem.status]}`}>{statusLabels[drawerItem.status]}</span>
                  <span className="text-xs text-muted-foreground">{drawerItem.specialty}</span>
                </div>
              </SheetHeader>

              <ScrollArea className="flex-1 px-6 py-4">
                <div className="space-y-5">
                  {/* Contact info */}
                  <div className="rounded-lg border p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{drawerItem.city}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="h-4 w-4" />{drawerItem.email}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="h-4 w-4" />Soumis le {drawerItem.submittedAt}</div>
                  </div>

                  {/* Documents */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1">
                      <FileText className="h-4 w-4 text-primary" />Documents soumis ({drawerItem.docs.length})
                    </h4>
                    <div className="space-y-2">
                      {drawerItem.docs.map((doc, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                          <FileText className="h-5 w-5 text-primary shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{doc}</p>
                            <p className="text-[10px] text-muted-foreground">PDF/Image</p>
                          </div>
                          <Button size="sm" variant="ghost" className="text-xs h-7">Voir</Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1">
                      <Clock className="h-4 w-4 text-accent" />Historique ({drawerItem.events.length})
                    </h4>
                    <div className="space-y-3">
                      {drawerItem.events.map(event => {
                        const Icon = eventIcons[event.type] || FileText;
                        const color = eventColors[event.type] || "text-muted-foreground";
                        return (
                          <div key={event.id} className="flex items-start gap-3">
                            <div className="mt-0.5 shrink-0">
                              <Icon className={`h-4 w-4 ${color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground">{event.text}</p>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                                <span>{event.author}</span>
                                <span>·</span>
                                <span>{new Date(event.createdAt).toLocaleString("fr-TN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="border-t px-6 py-4 space-y-3 shrink-0">
                {/* Admin note */}
                <div className="flex gap-2">
                  <Input placeholder="Ajouter une note interne..." value={adminNote} onChange={e => setAdminNote(e.target.value)}
                    className="text-xs" onKeyDown={e => e.key === "Enter" && handleAddNote()} />
                  <Button size="sm" variant="outline" onClick={handleAddNote} disabled={!adminNote.trim()}>
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {drawerItem.status === "pending" && (
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" className="flex-1 gradient-primary text-primary-foreground" onClick={() => setMotifAction({ id: drawerItem.id, type: "approve" })}>
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />Approuver
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-destructive" onClick={() => setMotifAction({ id: drawerItem.id, type: "reject" })}>
                      <XCircle className="h-3.5 w-3.5 mr-1" />Refuser
                    </Button>
                    <Button size="sm" variant="outline" className="text-warning border-warning/30" onClick={handleRelance}>
                      <RefreshCw className="h-3.5 w-3.5 mr-1" />Relancer
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
