/**
 * AdminSpecialties — Full CRUD specialty management with workflows.
 * Add, edit, delete specialties. Configure features, KYC docs, motifs, vitals, billing.
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import {
  Search, Stethoscope, CheckCircle2, Users, BarChart3, Shield, ToggleLeft, ToggleRight,
  Plus, Pencil, Trash2, X, Save, Video, Bot, FileText, Heart, ChevronDown, ChevronUp,
  ClipboardList, Thermometer, Banknote, BookOpen, AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  useSpecialties, addSpecialty, updateSpecialty, deleteSpecialty, toggleSpecialty,
  type ManagedSpecialty, type SpecialtyCategory,
} from "@/stores/specialtyStore";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

const categoryLabels: Record<SpecialtyCategory, string> = {
  generaliste: "Généraliste",
  specialiste: "Spécialiste",
  dentiste: "Dentaire",
  paramedical: "Paramédical",
};

const categoryColors: Record<SpecialtyCategory, string> = {
  generaliste: "bg-primary/10 text-primary",
  specialiste: "bg-accent/10 text-accent",
  dentiste: "bg-warning/10 text-warning",
  paramedical: "bg-muted text-muted-foreground",
};

const emptySpec: Omit<ManagedSpecialty, "id" | "createdAt" | "updatedAt" | "activeDoctors"> = {
  label: "", icon: "🩺", category: "specialiste", enabled: true,
  features: [], requiredDocs: [], motifs: [], defaultAmount: 50,
  teleconsultEnabled: true, aiEnabled: false,
  noteSections: ["Motif", "Anamnèse", "Examen clinique", "Diagnostic", "Plan"],
  customVitals: ["TA", "FC", "Température"],
};

const AdminSpecialties = () => {
  const [specs] = useSpecialties();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<SpecialtyCategory | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptySpec);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = specs;
    if (catFilter !== "all") list = list.filter(s => s.category === catFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => s.label.toLowerCase().includes(q));
    }
    return list;
  }, [specs, search, catFilter]);

  const totalDoctors = specs.reduce((s, sp) => s + sp.activeDoctors, 0);
  const enabledCount = specs.filter(s => s.enabled).length;

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptySpec });
    setDialogOpen(true);
  };

  const openEdit = (s: ManagedSpecialty) => {
    setEditingId(s.id);
    setForm({
      label: s.label, icon: s.icon, category: s.category, enabled: s.enabled,
      features: [...s.features], requiredDocs: [...s.requiredDocs], motifs: [...s.motifs],
      defaultAmount: s.defaultAmount, teleconsultEnabled: s.teleconsultEnabled,
      aiEnabled: s.aiEnabled, noteSections: [...s.noteSections], customVitals: [...s.customVitals],
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.label.trim()) { toast({ title: "Nom requis" }); return; }
    if (editingId) {
      updateSpecialty(editingId, form);
      toast({ title: `${form.label} mis à jour` });
    } else {
      addSpecialty(form);
      toast({ title: `${form.label} créé` });
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const spec = specs.find(s => s.id === deleteId);
    deleteSpecialty(deleteId);
    toast({ title: `${spec?.label} supprimé` });
    setDeleteId(null);
  };

  const addToList = (field: "features" | "requiredDocs" | "motifs" | "noteSections" | "customVitals") => {
    if (!newItem.trim()) return;
    setForm(prev => ({ ...prev, [field]: [...prev[field], newItem.trim()] }));
    setNewItem("");
  };

  const removeFromList = (field: "features" | "requiredDocs" | "motifs" | "noteSections" | "customVitals", idx: number) => {
    setForm(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) }));
  };

  const emojiOptions = ["🩺", "❤️", "👁️", "🔬", "👶", "👂", "🧠", "⚡", "🌸", "🦷", "🦴", "💊", "🫁", "🦠", "🧬", "🏥", "💉", "🔭", "🧪", "🩻", "🦿", "🫀", "🧘", "👃", "🦶", "🤰"];

  return (
    <DashboardLayout role="admin" title="Gestion des Spécialités">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Stethoscope, value: specs.length, label: "Spécialités", color: "bg-primary/10 text-primary" },
            { icon: CheckCircle2, value: enabledCount, label: "Actives", color: "bg-accent/10 text-accent" },
            { icon: Users, value: totalDoctors, label: "Praticiens inscrits", color: "bg-warning/10 text-warning" },
            { icon: BarChart3, value: Math.round(specs.reduce((s, sp) => s + sp.features.length, 0) / specs.length), label: "Moy. features/spé", color: "bg-muted text-foreground" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border bg-card p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl ${s.color} flex items-center justify-center`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher une spécialité..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {(["all", "generaliste", "specialiste", "dentiste", "paramedical"] as const).map(c => (
              <button
                key={c}
                onClick={() => setCatFilter(c)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  catFilter === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {c === "all" ? "Toutes" : categoryLabels[c]}
              </button>
            ))}
          </div>
          <Button onClick={openCreate} className="gradient-primary text-primary-foreground shadow-primary-glow shrink-0">
            <Plus className="h-4 w-4 mr-1.5" />Nouvelle spécialité
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Spécialité</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Catégorie</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Praticiens</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Tarif</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Features</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Options</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Statut</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <>
                    <tr key={s.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{s.icon}</span>
                          <div>
                            <span className="font-medium text-foreground">{s.label}</span>
                            <p className="text-[11px] text-muted-foreground">{s.motifs.slice(0, 3).join(" · ")}</p>
                          </div>
                          {expandedId === s.id ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[s.category]}`}>
                          {categoryLabels[s.category]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-foreground font-medium hidden md:table-cell">{s.activeDoctors}</td>
                      <td className="px-4 py-3 text-center text-foreground hidden md:table-cell">{s.defaultAmount} DT</td>
                      <td className="px-4 py-3 text-center hidden lg:table-cell">
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{s.features.length}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {s.teleconsultEnabled && <span title="Téléconsultation"><Video className="h-3.5 w-3.5 text-primary" /></span>}
                          {s.aiEnabled && <span title="IA"><Bot className="h-3.5 w-3.5 text-accent" /></span>}
                          <span title={`${s.requiredDocs.length} docs KYC`}><FileText className="h-3.5 w-3.5 text-muted-foreground" /></span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={(e) => { e.stopPropagation(); toggleSpecialty(s.id); toast({ title: s.enabled ? `${s.label} désactivé` : `${s.label} activé` }); }}
                          className={s.enabled ? "text-accent" : "text-muted-foreground"}>
                          {s.enabled ? <ToggleRight className="h-6 w-6 mx-auto" /> : <ToggleLeft className="h-6 w-6 mx-auto" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); openEdit(s); }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          {s.activeDoctors === 0 && (
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteId(s.id); }}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedId === s.id && (
                      <tr key={`${s.id}-detail`}>
                        <td colSpan={8} className="px-4 py-4 bg-muted/10 border-b">
                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Fonctionnalités</p>
                              <div className="space-y-1">
                                {s.features.map((f, i) => (
                                  <div key={i} className="flex items-center gap-1.5 text-xs text-foreground">
                                    <CheckCircle2 className="h-3 w-3 text-accent shrink-0" />{f}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Motifs de consultation</p>
                              <div className="space-y-1">
                                {s.motifs.map((m, i) => (
                                  <div key={i} className="flex items-center gap-1.5 text-xs text-foreground">
                                    <ClipboardList className="h-3 w-3 text-primary shrink-0" />{m}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Documents KYC requis</p>
                              <div className="space-y-1">
                                {s.requiredDocs.map((d, i) => (
                                  <div key={i} className="flex items-center gap-1.5 text-xs text-foreground">
                                    <Shield className="h-3 w-3 text-warning shrink-0" />{d}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Constantes vitales</p>
                              <div className="space-y-1">
                                {s.customVitals.map((v, i) => (
                                  <div key={i} className="flex items-center gap-1.5 text-xs text-foreground">
                                    <Thermometer className="h-3 w-3 text-muted-foreground shrink-0" />{v}
                                  </div>
                                ))}
                              </div>
                              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 mt-3">Sections de notes</p>
                              <div className="space-y-1">
                                {s.noteSections.map((n, i) => (
                                  <div key={i} className="flex items-center gap-1.5 text-xs text-foreground">
                                    <BookOpen className="h-3 w-3 text-muted-foreground shrink-0" />{n}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info */}
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Gestion des spécialités</p>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                <li>• <strong>Désactiver</strong> empêche les nouvelles inscriptions et masque la spécialité dans les recherches publiques.</li>
                <li>• <strong>Supprimer</strong> n'est possible que si aucun praticien n'est inscrit (0 praticiens actifs).</li>
                <li>• <strong>Créer une spécialité</strong> la rend disponible à l'inscription et configure automatiquement l'espace consultation.</li>
                <li>• Le <strong>tarif par défaut</strong> est indicatif — chaque praticien fixe librement ses tarifs.</li>
                <li>• Les <strong>motifs</strong>, <strong>sections de notes</strong> et <strong>constantes</strong> personnalisent l'interface de consultation.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <DialogTitle>{editingId ? "Modifier la spécialité" : "Nouvelle spécialité"}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 px-6 py-4">
            <Tabs defaultValue="general" className="space-y-4">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="features">Fonctionnalités</TabsTrigger>
                <TabsTrigger value="clinical">Clinique</TabsTrigger>
                <TabsTrigger value="kyc">KYC</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Nom de la spécialité *</label>
                    <Input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} placeholder="Ex: Endocrinologue" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Catégorie</label>
                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as SpecialtyCategory }))}
                      className="mt-1 w-full h-10 rounded-md border bg-background px-3 text-sm">
                      {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Icône</label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {emojiOptions.map(e => (
                        <button key={e} onClick={() => setForm(p => ({ ...p, icon: e }))}
                          className={`h-8 w-8 rounded-md text-lg flex items-center justify-center transition-colors ${form.icon === e ? "bg-primary/10 ring-2 ring-primary" : "bg-muted hover:bg-muted/80"}`}>
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Tarif par défaut (DT)</label>
                      <Input type="number" value={form.defaultAmount} onChange={e => setForm(p => ({ ...p, defaultAmount: Number(e.target.value) }))} className="mt-1" />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.teleconsultEnabled} onChange={e => setForm(p => ({ ...p, teleconsultEnabled: e.target.checked }))} className="rounded" />
                        <Video className="h-4 w-4 text-primary" />
                        <span className="text-sm">Téléconsultation</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.aiEnabled} onChange={e => setForm(p => ({ ...p, aiEnabled: e.target.checked }))} className="rounded" />
                        <Bot className="h-4 w-4 text-accent" />
                        <span className="text-sm">Assistant IA</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.enabled} onChange={e => setForm(p => ({ ...p, enabled: e.target.checked }))} className="rounded" />
                        <CheckCircle2 className="h-4 w-4 text-accent" />
                        <span className="text-sm">Active (visible à l'inscription)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="features" className="space-y-4">
                <ListEditor label="Fonctionnalités de l'espace consultation" items={form.features} field="features"
                  onAdd={addToList} onRemove={removeFromList} newItem={newItem} setNewItem={setNewItem}
                  placeholder="Ex: ECG intégré, Schéma dentaire..." icon={<CheckCircle2 className="h-3.5 w-3.5 text-accent" />} />
                <ListEditor label="Motifs de consultation prédéfinis" items={form.motifs} field="motifs"
                  onAdd={addToList} onRemove={removeFromList} newItem={newItem} setNewItem={setNewItem}
                  placeholder="Ex: Suivi HTA, Douleur thoracique..." icon={<ClipboardList className="h-3.5 w-3.5 text-primary" />} />
              </TabsContent>

              <TabsContent value="clinical" className="space-y-4">
                <ListEditor label="Sections de notes de consultation" items={form.noteSections} field="noteSections"
                  onAdd={addToList} onRemove={removeFromList} newItem={newItem} setNewItem={setNewItem}
                  placeholder="Ex: Examen cardiovasculaire..." icon={<BookOpen className="h-3.5 w-3.5 text-muted-foreground" />} />
                <ListEditor label="Constantes vitales à relever" items={form.customVitals} field="customVitals"
                  onAdd={addToList} onRemove={removeFromList} newItem={newItem} setNewItem={setNewItem}
                  placeholder="Ex: PIO OD, AV OG..." icon={<Thermometer className="h-3.5 w-3.5 text-muted-foreground" />} />
              </TabsContent>

              <TabsContent value="kyc" className="space-y-4">
                <ListEditor label="Documents requis pour la vérification KYC" items={form.requiredDocs} field="requiredDocs"
                  onAdd={addToList} onRemove={removeFromList} newItem={newItem} setNewItem={setNewItem}
                  placeholder="Ex: DES Cardiologie, Inscription Ordre..." icon={<Shield className="h-3.5 w-3.5 text-warning" />} />
              </TabsContent>
            </Tabs>
          </ScrollArea>
          <DialogFooter className="px-6 py-4 border-t shrink-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} className="gradient-primary text-primary-foreground">
              <Save className="h-4 w-4 mr-1.5" />{editingId ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Supprimer la spécialité"
        description={`Êtes-vous sûr de vouloir supprimer "${specs.find(s => s.id === deleteId)?.label}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        variant="danger"
      />
    </DashboardLayout>
  );
};

/** Reusable list editor component */
function ListEditor({ label, items, field, onAdd, onRemove, newItem, setNewItem, placeholder, icon }: {
  label: string;
  items: string[];
  field: "features" | "requiredDocs" | "motifs" | "noteSections" | "customVitals";
  onAdd: (field: any) => void;
  onRemove: (field: any, idx: number) => void;
  newItem: string;
  setNewItem: (v: string) => void;
  placeholder: string;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      <div className="mt-2 space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 group">
            {icon}
            <span className="text-sm text-foreground flex-1">{item}</span>
            <button onClick={() => onRemove(field, i)} className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <Input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder={placeholder}
          className="h-8 text-sm" onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); onAdd(field); } }} />
        <Button size="sm" className="h-8" variant="outline" onClick={() => onAdd(field)}>
          <Plus className="h-3.5 w-3.5 mr-1" />Ajouter
        </Button>
      </div>
    </div>
  );
}

export default AdminSpecialties;
