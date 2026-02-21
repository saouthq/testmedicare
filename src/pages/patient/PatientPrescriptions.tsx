import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { FileText, Download, Eye, Pill, Shield, Send, Printer, ChevronDown, X, Search, MapPin, Star, Clock, Phone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { mockPatientPrescriptions as initialPrescriptions, mockPartnerPharmacies } from "@/data/mockData";

const PatientPrescriptions = () => {
  const [filter, setFilter] = useState("all");
  const [prescriptions, setPrescriptions] = useState(initialPrescriptions);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sendingToPharmacy, setSendingToPharmacy] = useState<string | null>(null);
  const [pharmacySearch, setPharmacySearch] = useState("");
  const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null);

  const filtered = filter === "all" ? prescriptions : prescriptions.filter(p => p.status === filter);

  const filteredPharmacies = mockPartnerPharmacies.filter(ph =>
    ph.name.toLowerCase().includes(pharmacySearch.toLowerCase()) ||
    ph.address.toLowerCase().includes(pharmacySearch.toLowerCase())
  );

  const handleSendToPharmacy = (id: string) => {
    const pharmacy = mockPartnerPharmacies.find(ph => ph.id === selectedPharmacy);
    if (!pharmacy) return;
    setPrescriptions(prev => prev.map(p => p.id === id ? { ...p, pharmacy: pharmacy.name } : p));
    setSendingToPharmacy(null);
    setSelectedPharmacy(null);
    setPharmacySearch("");
  };

  const handleCancelSend = () => {
    setSendingToPharmacy(null);
    setSelectedPharmacy(null);
    setPharmacySearch("");
  };

  return (
    <DashboardLayout role="patient" title="Mes ordonnances">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1 rounded-lg border bg-card p-1 w-fit">
            {[{ key: "all", label: "Toutes", count: prescriptions.length }, { key: "active", label: "Actives", count: prescriptions.filter(p => p.status === "active").length }, { key: "expired", label: "Expirées", count: prescriptions.filter(p => p.status === "expired").length }].map(f => (
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
                        {p.cnam && <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium"><Shield className="h-3 w-3" />CNAM</span>}
                        {p.pharmacy && <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">📦 {p.pharmacy}</span>}
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
                <div className="border-t px-5 py-4 bg-muted/10">
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" />Voir le détail</Button>
                    <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Télécharger PDF</Button>
                    <Button variant="outline" size="sm"><Printer className="h-4 w-4 mr-1" />Imprimer</Button>
                    {p.status === "active" && !p.pharmacy && sendingToPharmacy !== p.id && (
                      <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => setSendingToPharmacy(p.id)}>
                        <Send className="h-4 w-4 mr-1" />Envoyer à une pharmacie
                      </Button>
                    )}
                  </div>

                  {/* Pharmacy search/selection panel */}
                  {sendingToPharmacy === p.id && (
                    <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <Send className="h-4 w-4 text-primary" />Choisir une pharmacie partenaire
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

                      <div className="max-h-56 overflow-y-auto space-y-2">
                        {filteredPharmacies.map(ph => (
                          <button
                            key={ph.id}
                            onClick={() => setSelectedPharmacy(ph.id)}
                            className={`w-full text-left rounded-lg border p-3 transition-all ${
                              selectedPharmacy === ph.id
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
                                  <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                                    <Star className="h-3 w-3 text-warning" />{ph.rating}
                                  </span>
                                  <span className="text-[11px] text-muted-foreground">{ph.distance}</span>
                                  <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                                    <Phone className="h-3 w-3" />{ph.phone}
                                  </span>
                                </div>
                              </div>
                              {selectedPharmacy === ph.id && (
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
                          disabled={!selectedPharmacy}
                          onClick={() => handleSendToPharmacy(p.id)}
                        >
                          <Send className="h-3.5 w-3.5 mr-1" />
                          Confirmer l'envoi
                        </Button>
                      </div>
                    </div>
                  )}

                  {p.status === "active" && !sendingToPharmacy && (
                    <p className="text-xs text-muted-foreground mt-3">💡 Vous pouvez envoyer cette ordonnance directement à une pharmacie partenaire pour préparer vos médicaments.</p>
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
