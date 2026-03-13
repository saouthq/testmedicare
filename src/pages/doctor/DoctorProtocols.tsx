/**
 * DoctorProtocols — Protocoles de soins et modèles de consultation.
 * Templates réutilisables pour consultations, notes, prescriptions.
 * Persisted via doctorProtocolsStore (localStorage + Supabase dual-mode)
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import {
  BookOpen, Plus, Search, Edit, Trash2, Copy, CheckCircle2,
  FileText, Stethoscope, Pill, ClipboardList, Star, Clock, X, Save, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import {
  useDoctorProtocols,
  createProtocol,
  updateProtocol,
  deleteProtocol,
  type Protocol,
  type ProtocolType,
} from "@/stores/doctorProtocolsStore";

const typeConfig: Record<ProtocolType, { label: string; icon: any; cls: string }> = {
  consultation: { label: "Consultation", icon: Stethoscope, cls: "bg-primary/10 text-primary" },
  prescription: { label: "Prescription", icon: Pill, cls: "bg-accent/10 text-accent" },
  procedure: { label: "Procédure", icon: ClipboardList, cls: "bg-warning/10 text-warning" },
  followup: { label: "Suivi", icon: Clock, cls: "bg-primary/10 text-primary" },
};

const DoctorProtocols = () => {
  const [protocols] = useDoctorProtocols();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | ProtocolType>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [showDelete, setShowDelete] = useState<number | null>(null);

  // New protocol form
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<ProtocolType>("consultation");
  const [newDesc, setNewDesc] = useState("");
  const [newSteps, setNewSteps] = useState("");
  const [newMeds, setNewMeds] = useState("");

  const selected = selectedId ? protocols.find(p => p.id === selectedId) : null;

  const filtered = protocols.filter(p => {
    if (filterType !== "all" && p.type !== filterType) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createProtocol({
      name: newName, type: newType, specialty: "Généraliste",
      description: newDesc, steps: newSteps.split("\n").filter(Boolean),
      meds: newMeds ? newMeds.split("\n").filter(Boolean) : undefined,
      favorite: false,
    });
    setShowNew(false);
    setNewName(""); setNewDesc(""); setNewSteps(""); setNewMeds("");
    toast({ title: "Protocole créé", description: newName });
  };

  const handleDelete = async (id: number) => {
    await deleteProtocol(id);
    if (selectedId === id) setSelectedId(null);
    setShowDelete(null);
    toast({ title: "Protocole supprimé" });
  };

  const handleToggleFav = async (id: number) => {
    const p = protocols.find(pr => pr.id === id);
    if (p) await updateProtocol(id, { favorite: !p.favorite });
  };

  const handleDuplicate = async (id: number) => {
    const orig = protocols.find(p => p.id === id);
    if (!orig) return;
    await createProtocol({
      name: `${orig.name} (copie)`, type: orig.type, specialty: orig.specialty,
      description: orig.description, steps: orig.steps, meds: orig.meds,
      examens: orig.examens, duration: orig.duration, favorite: false,
    });
    toast({ title: "Protocole dupliqué" });
  };

  return (
    <DashboardLayout role="doctor" title="Protocoles & Modèles">
      <div className="space-y-5">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-0.5 rounded-lg border bg-card p-0.5">
              {([
                { key: "all" as const, label: "Tous" },
                { key: "consultation" as const, label: "Consultations" },
                { key: "prescription" as const, label: "Prescriptions" },
                { key: "followup" as const, label: "Suivis" },
                { key: "procedure" as const, label: "Procédures" },
              ]).map(f => (
                <button key={f.key} onClick={() => setFilterType(f.key)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filterType === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-8 w-44 text-xs" />
            </div>
          </div>
          <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm" onClick={() => setShowNew(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />Nouveau protocole
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* List */}
          <div className="lg:col-span-2 space-y-3">
            {filtered.map(p => {
              const cfg = typeConfig[p.type];
              return (
                <div key={p.id} onClick={() => setSelectedId(p.id)}
                  className={`rounded-xl border bg-card p-4 shadow-card hover:shadow-card-hover transition-all cursor-pointer ${selectedId === p.id ? "ring-2 ring-primary" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.cls}`}>
                      <cfg.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground text-sm">{p.name}</h4>
                        {p.favorite && <Star className="h-3.5 w-3.5 text-warning fill-warning" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${cfg.cls}`}>{cfg.label}</span>
                        <span>{p.steps.length} étapes</span>
                        <span>Utilisé {p.usageCount}x</span>
                        <span>Dernier: {p.lastUsed}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); handleToggleFav(p.id); }}>
                        <Star className={`h-3.5 w-3.5 ${p.favorite ? "text-warning fill-warning" : "text-muted-foreground"}`} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); handleDuplicate(p.id); }}>
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); setShowDelete(p.id); }}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Aucun protocole trouvé</p>
              </div>
            )}
          </div>

          {/* Detail sidebar */}
          <div className="rounded-xl border bg-card shadow-card p-5">
            {selected ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${typeConfig[selected.type].cls}`}>
                    {(() => { const I = typeConfig[selected.type].icon; return <I className="h-6 w-6" />; })()}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{selected.name}</h3>
                    <p className="text-xs text-muted-foreground">{selected.specialty} · {selected.duration || "—"}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{selected.description}</p>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Étapes</h4>
                    <div className="space-y-1.5">
                      {selected.steps.map((s, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 mt-0.5">{i + 1}</span>
                          <span className="text-xs text-foreground">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selected.meds && selected.meds.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Prescription type</h4>
                      <div className="space-y-1">
                        {selected.meds.map((m, i) => (
                          <div key={i} className="flex items-center gap-2 rounded-lg bg-accent/5 px-3 py-2">
                            <Pill className="h-3.5 w-3.5 text-accent shrink-0" />
                            <span className="text-xs text-foreground">{m}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selected.examens && selected.examens.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Examens</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.examens.map((e, i) => (
                          <span key={i} className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">{e}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 space-y-2">
                    <Button size="sm" className="w-full gradient-primary text-primary-foreground text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Appliquer en consultation
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">Sélectionnez un protocole</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setShowNew(false)}>
          <div className="bg-card rounded-2xl border shadow-elevated p-6 w-full max-w-lg mx-4 animate-fade-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" />Nouveau protocole</h3>
              <button onClick={() => setShowNew(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-4">
              <div><Label className="text-xs">Nom</Label><Input value={newName} onChange={e => setNewName(e.target.value)} className="mt-1" placeholder="Ex: Suivi diabète type 2" /></div>
              <div><Label className="text-xs">Type</Label>
                <select value={newType} onChange={e => setNewType(e.target.value as ProtocolType)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm">
                  <option value="consultation">Consultation</option>
                  <option value="prescription">Prescription</option>
                  <option value="followup">Suivi</option>
                  <option value="procedure">Procédure</option>
                </select>
              </div>
              <div><Label className="text-xs">Description</Label><Textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={2} className="mt-1" /></div>
              <div><Label className="text-xs">Étapes (1 par ligne)</Label><Textarea value={newSteps} onChange={e => setNewSteps(e.target.value)} rows={4} className="mt-1" placeholder="Étape 1&#10;Étape 2&#10;..." /></div>
              <div><Label className="text-xs">Médicaments (optionnel, 1 par ligne)</Label><Textarea value={newMeds} onChange={e => setNewMeds(e.target.value)} rows={3} className="mt-1" /></div>
              <Button className="w-full gradient-primary text-primary-foreground" onClick={handleCreate}>
                <Save className="h-4 w-4 mr-2" />Créer le protocole
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!showDelete}
        onConfirm={() => showDelete && handleDelete(showDelete)}
        onCancel={() => setShowDelete(null)}
        title="Supprimer le protocole"
        description="Cette action est irréversible."
        variant="danger"
        confirmLabel="Supprimer"
      />
    </DashboardLayout>
  );
};

export default DoctorProtocols;
