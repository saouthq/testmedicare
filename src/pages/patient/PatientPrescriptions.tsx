/**
 * PatientPrescriptions — Multi-pharmacy send + cross-role tracking via stores.
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { FileText, Download, Eye, Pill, Shield, Send, Printer, ChevronDown, X, Search, MapPin, Clock, Phone, CheckCircle2, AlertCircle, Package, RefreshCw, RotateCcw } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { requestRenewal } from "@/stores/doctorStore";

import { type PrescriptionWithPharmacies, type PharmacyResponse } from "@/data/mockData";
import { usePharmaciesDirectory } from "@/stores/directoryStore";
import { useDoctorPrescriptions } from "@/stores/doctorPrescriptionsStore";
import { useSharedPrescriptions, sendPrescriptionToPharmacies } from "@/stores/prescriptionsStore";
import { useActionGating } from "@/hooks/useActionGating";

const MAX_PHARMACIES = 6;

const statusConfig: Record<PharmacyResponse["status"], { label: string; class: string; icon: any }> = {
  pending: { label: "En attente", class: "bg-muted text-muted-foreground", icon: Clock },
  preparing: { label: "En préparation", class: "bg-warning/10 text-warning", icon: Package },
  ready: { label: "Prête à retirer", class: "bg-accent/10 text-accent", icon: CheckCircle2 },
  unavailable: { label: "Non disponible", class: "bg-destructive/10 text-destructive", icon: AlertCircle },
};

const PatientPrescriptions = () => {
  const [filter, setFilter] = useState("all");
  const [doctorRx] = useDoctorPrescriptions();
  const { isEnabled } = useActionGating();
  const directoryPharmacies = usePharmaciesDirectory();
  // Build partner pharmacies from directory store
  const mockPartnerPharmacies = directoryPharmacies.map(p => ({
    id: p.id?.toString() || `ph-${p.name}`,
    name: p.name,
    address: `${p.address || ""}, ${p.city || ""}`.trim(),
    distance: "—",
    phone: p.phone || "",
    openNow: true,
  }));
  
  // Build prescriptions from doctor prescriptions store
  const prescriptions: PrescriptionWithPharmacies[] = doctorRx.map(rx => ({
    ...rx,
    patient: rx.patient || "",
    sent: rx.sent,
    sentToPharmacies: [],
  }));
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sendingToPharmacy, setSendingToPharmacy] = useState<string | null>(null);
  const [pharmacySearch, setPharmacySearch] = useState("");
  const [selectedPharmacies, setSelectedPharmacies] = useState<string[]>([]);

  // Read cross-role shared prescriptions
  const [sharedPrescriptions] = useSharedPrescriptions();

  // Merge local mock data with shared store data for display
  const mergedPrescriptions = prescriptions.map((p) => {
    const shared = sharedPrescriptions.find((sp) => sp.id === p.id);
    if (shared) {
      // Map shared pharmacy responses to local format
      const sharedResponses: PharmacyResponse[] = shared.sentToPharmacies.map((sph) => ({
        pharmacyId: sph.pharmacyId,
        pharmacyName: sph.pharmacyName,
        status: sph.status,
        respondedAt: sph.respondedAt,
        pickupTime: sph.pickupTime,
        alternatives: sph.alternatives,
      }));
      // Merge: keep local + add shared
      const existingIds = (p.sentToPharmacies || []).map((ph) => ph.pharmacyId);
      const newOnes = sharedResponses.filter((r) => !existingIds.includes(r.pharmacyId));
      return {
        ...p,
        sentToPharmacies: [
          ...(p.sentToPharmacies || []).map((existing) => {
            const updated = sharedResponses.find((sr) => sr.pharmacyId === existing.pharmacyId);
            return updated || existing;
          }),
          ...newOnes,
        ],
      };
    }
    return p;
  });

  const filtered = filter === "all" ? mergedPrescriptions : mergedPrescriptions.filter(p => p.status === filter);

  const filteredPharmacies = mockPartnerPharmacies.filter(ph =>
    ph.name.toLowerCase().includes(pharmacySearch.toLowerCase()) ||
    ph.address.toLowerCase().includes(pharmacySearch.toLowerCase())
  );

  const togglePharmacySelection = (id: string) => {
    setSelectedPharmacies(prev => {
      if (prev.includes(id)) return prev.filter(p => p !== id);
      if (prev.length >= MAX_PHARMACIES) {
        toast({ title: "Limite atteinte", description: `Maximum ${MAX_PHARMACIES} pharmacies.`, variant: "destructive" });
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleSendToPharmacies = (id: string) => {
    if (!isEnabled("patient.send_to_pharmacy")) {
      toast({ title: "Action désactivée", description: "L’envoi vers pharmacie est désactivé par l’administrateur." });
      return;
    }

    const p = mergedPrescriptions.find((rx) => rx.id === id);
    if (!p) return;

    const pharmacies = selectedPharmacies.map((phId) => {
      const ph = mockPartnerPharmacies.find((p) => p.id === phId);
      return { id: phId, name: ph?.name || "" };
    });

    // Write to cross-role store
    sendPrescriptionToPharmacies(
      {
        id: p.id,
        patientName: "Amine Ben Ali", // TODO: get from session
        doctorName: p.doctor,
        date: p.date,
        items: p.items,
        assurance: p.assurance,
        total: p.total,
      },
      pharmacies
    );

    setSendingToPharmacy(null);
    setSelectedPharmacies([]);
    setPharmacySearch("");
    toast({ title: "Ordonnance envoyée", description: `Envoyée à ${pharmacies.length} pharmacie(s). Visible côté pharmacie.` });
  };

  const handleCancelSend = () => {
    setSendingToPharmacy(null);
    setSelectedPharmacies([]);
    setPharmacySearch("");
  };

  const getSentCount = (p: PrescriptionWithPharmacies) => (p.sentToPharmacies || []).length;
  const canSendMore = (p: PrescriptionWithPharmacies) => getSentCount(p) < MAX_PHARMACIES;

  return (
    <DashboardLayout role="patient" title="Mes ordonnances">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1 rounded-lg border bg-card p-1 w-fit">
            {[{ key: "all", label: "Toutes", count: mergedPrescriptions.length }, { key: "active", label: "Actives", count: mergedPrescriptions.filter(p => p.status === "active").length }, { key: "expired", label: "Expirées", count: mergedPrescriptions.filter(p => p.status === "expired").length }].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {f.label} ({f.count})
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filtered.map((p) => (
            <div key={p.id} className="rounded-xl border bg-card shadow-card overflow-hidden">
              <div className="p-5 cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`h-11 w-11 rounded-lg flex items-center justify-center shrink-0 ${p.status === "active" ? "bg-accent/10" : "bg-muted"}`}>
                      <FileText className={`h-5 w-5 ${p.status === "active" ? "text-accent" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{p.id}</h3>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${p.status === "active" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                          {p.status === "active" ? "Active" : "Expirée"}
                        </span>
                        {p.assurance && <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium"><Shield className="h-3 w-3" />Assuré</span>}
                        {getSentCount(p) > 0 && (
                          <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">📦 {getSentCount(p)} pharmacie(s)</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{p.doctor} · {p.date}</p>
                      <div className="mt-3 space-y-1">
                        {p.items.map((item, i) => (
                          <p key={i} className="text-sm text-foreground flex items-center gap-2"><Pill className="h-3.5 w-3.5 text-primary" />{item}</p>
                        ))}
                      </div>
                      <p className="text-sm font-bold text-foreground mt-2">{p.total}</p>
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${expandedId === p.id ? "rotate-180" : ""}`} />
                </div>
              </div>
              
              {expandedId === p.id && (
                <div className="border-t px-5 py-4 bg-muted/10 space-y-4">
                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => toast({ title: "Aperçu ordonnance (mock)" })}><Eye className="h-4 w-4 mr-1" />Voir le détail</Button>
                    <Button variant="outline" size="sm" onClick={() => toast({ title: "Téléchargement PDF (mock)" })}><Download className="h-4 w-4 mr-1" />Télécharger PDF</Button>
                    <Button variant="outline" size="sm" onClick={() => toast({ title: "Impression (mock)" })}><Printer className="h-4 w-4 mr-1" />Imprimer</Button>
                    {p.status === "active" && canSendMore(p) && sendingToPharmacy !== p.id && isEnabled("patient.send_to_pharmacy") && (
                      <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => setSendingToPharmacy(p.id)}>
                        <Send className="h-4 w-4 mr-1" />Envoyer à une pharmacie
                      </Button>
                    )}
                    {p.status === "active" && isEnabled("patient.request_renewal") && (
                      <Button variant="outline" size="sm" onClick={() => {
                        const renewalId = requestRenewal({
                          patientName: "Amine Ben Ali",
                          patientAvatar: "AB",
                          prescriptionId: p.id,
                          items: p.items,
                        });
                        if (!renewalId) {
                          toast({ title: "Action désactivée", description: "Le renouvellement est désactivé par l’administrateur." });
                          return;
                        }
                        toast({ title: "Demande envoyée", description: `Demande de renouvellement de ${p.id} envoyée à ${p.doctor}. Visible dans son dashboard.` });
                      }}>
                        <RotateCcw className="h-4 w-4 mr-1" />Demander un renouvellement
                      </Button>
                    )}
                  </div>

                  {/* Pharmacy tracking */}
                  {(p.sentToPharmacies || []).length > 0 && (
                    <div className="rounded-xl border bg-card p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-foreground">Suivi des pharmacies</h4>
                        <span className="text-xs text-muted-foreground">{getSentCount(p)}/{MAX_PHARMACIES}</span>
                      </div>
                      <div className="space-y-2">
                        {(p.sentToPharmacies || []).map((ph, idx) => {
                          const config = statusConfig[ph.status];
                          const Icon = config.icon;
                          return (
                            <div key={idx} className="rounded-lg border p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-foreground">{ph.pharmacyName}</p>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${config.class}`}>
                                      <Icon className="h-3 w-3" />{config.label}
                                    </span>
                                  </div>
                                  {ph.respondedAt && <p className="text-[11px] text-muted-foreground mt-0.5">Répondu à {ph.respondedAt}</p>}
                                  {ph.pickupTime && <p className="text-xs text-accent font-medium mt-1">📍 Retrait : {ph.pickupTime}</p>}
                                  {ph.alternatives && ph.alternatives.map((alt, i) => (
                                    <p key={i} className="text-xs text-muted-foreground mt-1">💊 {alt.medication} → {alt.alternative}</p>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Pharmacy search/selection panel */}
                  {sendingToPharmacy === p.id && isEnabled("patient.send_to_pharmacy") && (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <Send className="h-4 w-4 text-primary" />Choisir des pharmacies (max {MAX_PHARMACIES - getSentCount(p)})
                        </h4>
                        <button onClick={handleCancelSend} className="text-muted-foreground hover:text-foreground">
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Rechercher une pharmacie (nom, adresse)..."
                          value={pharmacySearch}
                          onChange={e => setPharmacySearch(e.target.value)}
                          className="pl-10 bg-background"
                        />
                      </div>

                      {selectedPharmacies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedPharmacies.map(id => {
                            const ph = mockPartnerPharmacies.find(p => p.id === id);
                            return (
                              <span key={id} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                {ph?.name}
                                <button onClick={() => togglePharmacySelection(id)}><X className="h-3 w-3" /></button>
                              </span>
                            );
                          })}
                        </div>
                      )}

                      <div className="max-h-56 overflow-y-auto space-y-2">
                        {filteredPharmacies
                          .filter(ph => !(p.sentToPharmacies || []).some(s => s.pharmacyId === ph.id))
                          .map(ph => (
                          <button
                            key={ph.id}
                            onClick={() => togglePharmacySelection(ph.id)}
                            className={`w-full text-left rounded-lg border p-3 transition-all ${
                              selectedPharmacies.includes(ph.id)
                                ? "border-primary bg-primary/10 ring-1 ring-primary"
                                : "bg-background hover:border-primary/50 hover:bg-muted/30"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-foreground">{ph.name}</p>
                                  {ph.openNow ? (
                                    <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded-full font-medium">Ouvert</span>
                                  ) : (
                                    <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-medium">Fermé</span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                  <MapPin className="h-3 w-3 shrink-0" />{ph.address}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[11px] text-muted-foreground">{ph.distance}</span>
                                  <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                                    <Phone className="h-3 w-3" />{ph.phone}
                                  </span>
                                </div>
                              </div>
                              {selectedPharmacies.includes(ph.id) && (
                                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                              )}
                            </div>
                          </button>
                        ))}
                        {filteredPharmacies.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">Aucune pharmacie trouvée</p>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-primary/10">
                        <Button variant="outline" size="sm" onClick={handleCancelSend}>Annuler</Button>
                        <Button
                          size="sm"
                          className="gradient-primary text-primary-foreground"
                          disabled={selectedPharmacies.length === 0}
                          onClick={() => handleSendToPharmacies(p.id)}
                        >
                          <Send className="h-3.5 w-3.5 mr-1" />
                          Envoyer ({selectedPharmacies.length})
                        </Button>
                      </div>
                    </div>
                  )}

                  {p.status === "active" && !sendingToPharmacy && getSentCount(p) === 0 && (
                    <p className="text-xs text-muted-foreground">💡 Vous pouvez envoyer cette ordonnance à jusqu'à {MAX_PHARMACIES} pharmacies pour comparer les disponibilités.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientPrescriptions;
