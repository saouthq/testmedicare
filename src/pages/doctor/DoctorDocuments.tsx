/**
 * DoctorDocuments — Bibliothèque de modèles de documents
 * Certificats, courriers, arrêts maladie — CRUD + aperçu
 * Persisted via doctorDocumentsStore (localStorage + Supabase dual-mode)
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
import {
  useDoctorDocTemplates,
  createDocTemplate,
  updateDocTemplate,
  deleteDocTemplate,
  type DocTemplate,
} from "@/stores/doctorDocumentsStore";

const categoryLabels: Record<string, string> = {
  certificat: "Certificat", courrier: "Courrier", arret: "Arrêt maladie",
  compte_rendu: "Compte-rendu", autre: "Autre",
};
const categoryColors: Record<string, string> = {
  certificat: "bg-primary/10 text-primary", courrier: "bg-accent/10 text-accent-foreground",
  arret: "bg-destructive/10 text-destructive", compte_rendu: "bg-warning/10 text-warning",
  autre: "bg-muted text-muted-foreground",
};

const DoctorDocuments = () => {
  const [templates] = useDoctorDocTemplates();
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

  const handleSave = async () => {
    if (!form.name || !form.content) { toast.error("Nom et contenu requis"); return; }
    const vars = (form.content.match(/\{\{(\w+)\}\}/g) || []).map(v => v.replace(/\{\{|\}\}/g, ""));
    if (editMode && selected) {
      await updateDocTemplate(selected.id, { ...form, variables: vars });
      toast.success("Modèle mis à jour");
    } else {
      await createDocTemplate({ ...form, variables: vars });
      toast.success("Modèle créé");
    }
    setDrawerOpen(false);
  };

  const handleDuplicate = async (t: DocTemplate) => {
    await createDocTemplate({ name: `${t.name} (copie)`, category: t.category, content: t.content, variables: t.variables });
    toast.success("Modèle dupliqué");
  };

  const handleDelete = async (id: number) => {
    await deleteDocTemplate(id);
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

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Aucun modèle trouvé</p>
        </div>
      )}

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
