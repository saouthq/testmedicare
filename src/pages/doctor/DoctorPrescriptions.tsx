import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { FileText, Plus, Send, Printer, Shield, User, Pill, Eye, ChevronDown, CheckCircle, Download, Trash2, Search, Copy, RefreshCw, X, Calendar, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockDoctorPrescriptions } from "@/data/mockData";

type PrescriptionFilter = "all" | "active" | "draft" | "expired";

const DoctorPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState(mockDoctorPrescriptions);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newPatient, setNewPatient] = useState("");
  const [newItems, setNewItems] = useState([{ medication: "", dosage: "", duration: "", instructions: "" }]);
  const [newCnam, setNewCnam] = useState(true);
  const [newNotes, setNewNotes] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<PrescriptionFilter>("all");
  const [renewId, setRenewId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const handleSend = (id: string) => {
    setPrescriptions(prev => prev.map(p => p.id === id ? { ...p, sent: true } : p));
  };

  const handleAddNew = () => {
    if (!newPatient) return;
    const newId = `ORD-2026-${(46 + prescriptions.length).toString().padStart(3, "0")}`;
    setPrescriptions(prev => [{
      id: newId, patient: newPatient, date: "20 Fév 2026",
      items: newItems.filter(i => i.medication).map(i => `${i.medication} — ${i.dosage}${i.duration ? ` — ${i.duration}` : ""}${i.instructions ? ` (${i.instructions})` : ""}`),
      sent: false, cnam: newCnam, total: "— DT", status: "active", doctor: "Dr. Bouazizi", pharmacy: null
    }, ...prev]);
    setShowNewForm(false);
    resetNewForm();
    setExpandedId(newId);
  };

  const resetNewForm = () => {
    setNewPatient("");
    setNewItems([{ medication: "", dosage: "", duration: "", instructions: "" }]);
    setNewCnam(true);
    setNewNotes("");
  };

  const handleDuplicate = (p: typeof prescriptions[0]) => {
    setShowNewForm(true);
    setNewPatient(p.patient);
    setNewItems(p.items.map(item => {
      const parts = item.split(" — ");
      return { medication: parts[0] || "", dosage: parts[1] || "", duration: "", instructions: "" };
    }));
    setNewCnam(p.cnam);
  };

  const handleRenew = (id: string) => {
    const original = prescriptions.find(p => p.id === id);
    if (!original) return;
    const newId = `ORD-2026-${(46 + prescriptions.length).toString().padStart(3, "0")}`;
    setPrescriptions(prev => [{
      ...original,
      id: newId,
      date: "20 Fév 2026",
      sent: false,
      status: "active",
    }, ...prev]);
    setRenewId(null);
    setExpandedId(newId);
  };

  const filtered = prescriptions.filter(p => {
    if (search && !p.patient.toLowerCase().includes(search.toLowerCase()) && !p.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "active") return p.status === "active" && p.sent;
    if (filter === "draft") return !p.sent;
    if (filter === "expired") return p.status === "expired";
    return true;
  });

  const previewPrescription = previewId ? prescriptions.find(p => p.id === previewId) : null;

  return (
    <DashboardLayout role="doctor" title="Ordonnances">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Rechercher (patient, n°)..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 w-52 text-xs" />
            </div>
            <div className="flex gap-0.5 rounded-lg border bg-card p-0.5">
              {([
                { key: "all" as PrescriptionFilter, label: "Toutes", count: prescriptions.length },
                { key: "draft" as PrescriptionFilter, label: "Brouillons", count: prescriptions.filter(p => !p.sent).length },
                { key: "active" as PrescriptionFilter, label: "Actives", count: prescriptions.filter(p => p.status === "active" && p.sent).length },
                { key: "expired" as PrescriptionFilter, label: "Expirées", count: prescriptions.filter(p => p.status === "expired").length },
              ]).map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {f.label} ({f.count})
                </button>
              ))}
            </div>
          </div>
          <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm" onClick={() => { setShowNewForm(!showNewForm); if (showNewForm) resetNewForm(); }}>
            <Plus className="h-4 w-4 mr-2" />{showNewForm ? "Annuler" : "Nouvelle ordonnance"}
          </Button>
        </div>

        {showNewForm && (
          <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-6 shadow-card space-y-4 animate-fade-in">
            <h3 className="font-semibold text-foreground flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />Nouvelle ordonnance</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label className="text-xs">Patient *</Label><Input value={newPatient} onChange={e => setNewPatient(e.target.value)} placeholder="Nom du patient" className="mt-1" /></div>
              <div className="flex items-end gap-3">
                <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={newCnam} onChange={e => setNewCnam(e.target.checked)} className="rounded border-input" /><Shield className="h-3 w-3 text-primary" />CNAM</label>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Médicaments</Label>
              {newItems.map((item, i) => (
                <div key={i} className="grid gap-2 grid-cols-2 sm:grid-cols-5 items-center">
                  <Input value={item.medication} onChange={e => { const u = [...newItems]; u[i].medication = e.target.value; setNewItems(u); }} placeholder="Médicament" className="col-span-1 sm:col-span-1" />
                  <Input value={item.dosage} onChange={e => { const u = [...newItems]; u[i].dosage = e.target.value; setNewItems(u); }} placeholder="Posologie" />
                  <Input value={item.duration} onChange={e => { const u = [...newItems]; u[i].duration = e.target.value; setNewItems(u); }} placeholder="Durée" />
                  <Input value={item.instructions} onChange={e => { const u = [...newItems]; u[i].instructions = e.target.value; setNewItems(u); }} placeholder="Instructions" />
                  {newItems.length > 1 && <button onClick={() => setNewItems(prev => prev.filter((_, j) => j !== i))} className="text-destructive h-9 flex items-center justify-center"><Trash2 className="h-4 w-4" /></button>}
                </div>
              ))}
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setNewItems(prev => [...prev, { medication: "", dosage: "", duration: "", instructions: "" }])}><Plus className="h-3 w-3 mr-1" />Ajouter médicament</Button>
            </div>
            <div><Label className="text-xs">Notes / Instructions spéciales</Label><textarea value={newNotes} onChange={e => setNewNotes(e.target.value)} rows={2} placeholder="Instructions pour le patient ou le pharmacien..." className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none" /></div>
            <div className="flex gap-2">
              <Button className="gradient-primary text-primary-foreground" onClick={handleAddNew} disabled={!newPatient}><CheckCircle className="h-4 w-4 mr-1" />Créer l'ordonnance</Button>
              <Button variant="outline" onClick={() => { setShowNewForm(false); resetNewForm(); }}>Annuler</Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {filtered.map((p) => (
            <div key={p.id} className="rounded-xl border bg-card shadow-card overflow-hidden">
              <div className="p-5 cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><FileText className="h-5 w-5 text-primary" /></div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{p.id}</h3>
                        {p.sent ? <span className="rounded-full bg-accent/10 text-accent px-2.5 py-0.5 text-xs font-medium">✓ Envoyée</span> : <span className="rounded-full bg-warning/10 text-warning px-2.5 py-0.5 text-xs font-medium">Brouillon</span>}
                        {p.status === "expired" && <span className="rounded-full bg-muted text-muted-foreground px-2.5 py-0.5 text-xs font-medium">Expirée</span>}
                        {p.cnam && <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium"><Shield className="h-3 w-3" />CNAM</span>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{p.patient} · <Calendar className="h-3 w-3" />{p.date}</p>
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
                <div className="border-t px-5 py-4 bg-muted/10 space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    {!p.sent && <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => handleSend(p.id)}><Send className="h-4 w-4 mr-1" />Envoyer au patient</Button>}
                    <Button variant="outline" size="sm" onClick={() => setPreviewId(p.id)}><Eye className="h-4 w-4 mr-1" />Aperçu</Button>
                    <Button variant="outline" size="sm"><Printer className="h-4 w-4 mr-1" />Imprimer</Button>
                    <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />PDF</Button>
                    <Button variant="outline" size="sm" onClick={() => handleDuplicate(p)}><Copy className="h-4 w-4 mr-1" />Dupliquer</Button>
                    {p.status === "expired" && (
                      <Button variant="outline" size="sm" className="text-accent border-accent/30" onClick={() => handleRenew(p.id)}>
                        <RefreshCw className="h-4 w-4 mr-1" />Renouveler
                      </Button>
                    )}
                  </div>
                  {p.pharmacy && (
                    <p className="text-xs text-accent flex items-center gap-1.5"><CheckCircle className="h-3 w-3" />Envoyée à {p.pharmacy}</p>
                  )}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Aucune ordonnance trouvée</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview modal */}
      {previewPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setPreviewId(null)}>
          <div className="bg-card rounded-2xl border shadow-elevated p-8 w-full max-w-lg mx-4 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground">Aperçu ordonnance</h3>
              <button onClick={() => setPreviewId(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              {/* Header */}
              <div className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-foreground">Dr. Ahmed Bouazizi</p>
                    <p className="text-xs text-muted-foreground">Médecin généraliste</p>
                    <p className="text-xs text-muted-foreground">15 Av. de la Liberté, El Manar, Tunis</p>
                    <p className="text-xs text-muted-foreground">Tél: +216 71 234 567</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{previewPrescription.date}</p>
                    <p className="text-xs font-mono text-muted-foreground">{previewPrescription.id}</p>
                  </div>
                </div>
              </div>
              {/* Patient */}
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Patient</p>
                <p className="font-semibold text-foreground">{previewPrescription.patient}</p>
              </div>
              {/* Items */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Prescription</p>
                {previewPrescription.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg border p-3">
                    <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-sm text-foreground">{item}</p>
                  </div>
                ))}
              </div>
              {previewPrescription.cnam && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <p className="text-xs text-primary font-medium">Prise en charge CNAM</p>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1"><Printer className="h-4 w-4 mr-2" />Imprimer</Button>
                <Button className="flex-1 gradient-primary text-primary-foreground"><Download className="h-4 w-4 mr-2" />Télécharger PDF</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DoctorPrescriptions;
