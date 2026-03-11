/**
 * DoctorDocuments — Bibliothèque de modèles de documents
 * Certificats, courriers, arrêts maladie — CRUD + aperçu
 * // TODO BACKEND: Persister les modèles, générer PDF
 */
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, Plus, Copy, Eye, Trash2, Search, Pencil } from "lucide-react";

interface DocTemplate {
  id: number;
  name: string;
  category: "certificat" | "courrier" | "arret" | "compte_rendu" | "autre";
  content: string;
  variables: string[];
  usageCount: number;
  lastUsed: string;
  createdAt: string;
}

const categoryLabels: Record<string, string> = {
  certificat: "Certificat", courrier: "Courrier", arret: "Arrêt maladie",
  compte_rendu: "Compte-rendu", autre: "Autre",
};
const categoryColors: Record<string, string> = {
  certificat: "bg-primary/10 text-primary", courrier: "bg-accent/10 text-accent-foreground",
  arret: "bg-destructive/10 text-destructive", compte_rendu: "bg-warning/10 text-warning",
  autre: "bg-muted text-muted-foreground",
};

const initialTemplates: DocTemplate[] = [
  { id: 1, name: "Certificat médical standard", category: "certificat", content: "Je soussigné Dr. {{NOM_MEDECIN}}, certifie avoir examiné ce jour {{DATE}} M./Mme {{NOM_PATIENT}}, né(e) le {{DATE_NAISSANCE}}.\n\nL'état de santé du patient nécessite un repos de {{DUREE}} jours à compter du {{DATE_DEBUT}}.\n\nCertificat établi à la demande de l'intéressé(e) pour servir et valoir ce que de droit.", variables: ["NOM_MEDECIN", "DATE", "NOM_PATIENT", "DATE_NAISSANCE", "DUREE", "DATE_DEBUT"], usageCount: 45, lastUsed: "10 Mar 2026", createdAt: "Jan 2025" },
  { id: 2, name: "Arrêt maladie", category: "arret", content: "Arrêt de travail pour maladie\n\nPatient : {{NOM_PATIENT}}\nDurée : {{DUREE}} jours\nDu {{DATE_DEBUT}} au {{DATE_FIN}}\nDiagnostic : {{DIAGNOSTIC}}\n\nDr. {{NOM_MEDECIN}}", variables: ["NOM_PATIENT", "DUREE", "DATE_DEBUT", "DATE_FIN", "DIAGNOSTIC", "NOM_MEDECIN"], usageCount: 32, lastUsed: "8 Mar 2026", createdAt: "Jan 2025" },
  { id: 3, name: "Lettre d'adressage", category: "courrier", content: "Cher(e) Confrère/Consœur,\n\nJe vous adresse M./Mme {{NOM_PATIENT}}, âgé(e) de {{AGE}} ans, pour {{MOTIF}}.\n\nAntécédents notables : {{ANTECEDENTS}}\nTraitement en cours : {{TRAITEMENT}}\n\nJe vous remercie de votre avis éclairé.\n\nConfraternellement,\nDr. {{NOM_MEDECIN}}", variables: ["NOM_PATIENT", "AGE", "MOTIF", "ANTECEDENTS", "TRAITEMENT", "NOM_MEDECIN"], usageCount: 18, lastUsed: "5 Mar 2026", createdAt: "Fév 2025" },
  { id: 4, name: "Certificat d'aptitude sportive", category: "certificat", content: "Je soussigné Dr. {{NOM_MEDECIN}}, certifie que M./Mme {{NOM_PATIENT}} a été examiné(e) ce jour et ne présente pas de contre-indication apparente à la pratique du sport en compétition / loisir.\n\nCertificat valable 1 an.", variables: ["NOM_MEDECIN", "NOM_PATIENT"], usageCount: 12, lastUsed: "1 Mar 2026", createdAt: "Mar 2025" },
  { id: 5, name: "Compte-rendu opératoire", category: "compte_rendu", content: "COMPTE-RENDU OPÉRATOIRE\n\nPatient : {{NOM_PATIENT}}\nDate : {{DATE}}\nIntervention : {{INTERVENTION}}\n\nDéroulement : {{DEROULEMENT}}\n\nSuites opératoires : {{SUITES}}\n\nDr. {{NOM_MEDECIN}}", variables: ["NOM_PATIENT", "DATE", "INTERVENTION", "DEROULEMENT", "SUITES", "NOM_MEDECIN"], usageCount: 7, lastUsed: "20 Fév 2026", createdAt: "Avr 2025" },
];

const DoctorDocuments = () => {
  const [templates, setTemplates] = useState<DocTemplate[]>(initialTemplates);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selected, setSelected] = useState<DocTemplate | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", category: "certificat" as DocTemplate["category"], content: "" });

  const filtered = templates
    .filter(t => catFilter === "all" || t.category === catFilter)
    .filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => {
    setEditMode(false);
    setForm({ name: "", category: "certificat", content: "" });
    setDrawerOpen(true);
  };

  const openEdit = (t: DocTemplate) => {
    setEditMode(true);
    setSelected(t);
    setForm({ name: t.name, category: t.category, content: t.content });
    setDrawerOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.content) { toast.error("Nom et contenu requis"); return; }
    const vars = (form.content.match(/\{\{(\w+)\}\}/g) || []).map(v => v.replace(/\{\{|\}\}/g, ""));
    if (editMode && selected) {
      setTemplates(prev => prev.map(t => t.id === selected.id ? { ...t, ...form, variables: vars } : t));
      toast.success("Modèle mis à jour");
    } else {
      setTemplates(prev => [{ id: Date.now(), ...form, variables: vars, usageCount: 0, lastUsed: "—", createdAt: "Mar 2026" }, ...prev]);
      toast.success("Modèle créé");
    }
    setDrawerOpen(false);
  };

  const handleDuplicate = (t: DocTemplate) => {
    setTemplates(prev => [{ ...t, id: Date.now(), name: `${t.name} (copie)`, usageCount: 0, lastUsed: "—" }, ...prev]);
    toast.success("Modèle dupliqué");
  };

  const handleDelete = (id: number) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast.success("Modèle supprimé");
  };

  return (
    <DashboardLayout role="doctor" title="Documents & Modèles">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{templates.length}</p>
          <p className="text-xs text-muted-foreground">Modèles</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{templates.reduce((s, t) => s + t.usageCount, 0)}</p>
          <p className="text-xs text-muted-foreground">Documents générés</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{templates.filter(t => t.category === "certificat").length}</p>
          <p className="text-xs text-muted-foreground">Certificats</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{templates.filter(t => t.category === "courrier").length}</p>
          <p className="text-xs text-muted-foreground">Courriers</p>
        </CardContent></Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher…" className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {Object.entries(categoryLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" />Nouveau modèle</Button>
      </div>

      {/* Templates grid */}
      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map(t => (
          <Card key={t.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-medium text-sm text-foreground truncate">{t.name}</span>
                </div>
                <Badge variant="outline" className={`text-[10px] shrink-0 ${categoryColors[t.category]}`}>{categoryLabels[t.category]}</Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{t.content.slice(0, 120)}…</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>{t.usageCount} utilisations</span>
                  <span>Dernier : {t.lastUsed}</span>
                  <span>{t.variables.length} variables</span>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelected(t); setPreviewOpen(true); }}><Eye className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDuplicate(t)}><Copy className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(t.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview drawer */}
      <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader><SheetTitle>{selected?.name}</SheetTitle></SheetHeader>
          {selected && (
            <div className="mt-4 space-y-4">
              <Badge variant="outline" className={categoryColors[selected.category]}>{categoryLabels[selected.category]}</Badge>
              <div className="rounded-lg border bg-muted/30 p-4 whitespace-pre-wrap text-sm font-mono text-foreground">{selected.content}</div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Variables détectées :</p>
                <div className="flex flex-wrap gap-1.5">{selected.variables.map(v => <Badge key={v} variant="secondary" className="text-[10px]">{`{{${v}}}`}</Badge>)}</div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit/Create drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader><SheetTitle>{editMode ? "Modifier le modèle" : "Nouveau modèle"}</SheetTitle></SheetHeader>
          <div className="space-y-4 mt-4">
            <div><Label>Nom du modèle *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><Label>Catégorie</Label>
              <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v as DocTemplate["category"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(categoryLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Contenu *</Label>
              <p className="text-[10px] text-muted-foreground mb-1">Utilisez {`{{VARIABLE}}`} pour les champs dynamiques</p>
              <Textarea rows={12} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Contenu du document…" />
            </div>
            <Button className="w-full" onClick={handleSave}>{editMode ? "Mettre à jour" : "Créer le modèle"}</Button>
          </div>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default DoctorDocuments;
