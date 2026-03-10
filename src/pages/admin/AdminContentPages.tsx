/**
 * AdminContentPages — Gestion du contenu public (pages légales, FAQ, bannières, annonces)
 * TODO BACKEND: Replace with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import {
  FileText, Globe, Edit2, Eye, ToggleLeft, ToggleRight, Plus,
  Megaphone, HelpCircle, Shield, Save, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";

interface ContentPage {
  id: string;
  title: string;
  type: "legal" | "faq" | "announcement" | "banner";
  status: "published" | "draft";
  lastModified: string;
  content: string;
}

const initialPages: ContentPage[] = [
  { id: "cp-1", title: "Conditions Générales d'Utilisation", type: "legal", status: "published", lastModified: "2026-02-15", content: "Les présentes CGU régissent l'utilisation de la plateforme Medicare..." },
  { id: "cp-2", title: "Politique de Confidentialité", type: "legal", status: "published", lastModified: "2026-02-10", content: "Medicare s'engage à protéger la vie privée des utilisateurs..." },
  { id: "cp-3", title: "Politique de Cookies", type: "legal", status: "published", lastModified: "2026-01-20", content: "Nous utilisons des cookies pour améliorer votre expérience..." },
  { id: "cp-4", title: "Comment prendre un rendez-vous ?", type: "faq", status: "published", lastModified: "2026-03-01", content: "Recherchez un médecin, choisissez un créneau et confirmez..." },
  { id: "cp-5", title: "Comment annuler un rendez-vous ?", type: "faq", status: "published", lastModified: "2026-03-01", content: "Allez dans Mes RDV, cliquez sur le RDV et sélectionnez Annuler..." },
  { id: "cp-6", title: "Maintenance prévue le 15 mars", type: "announcement", status: "draft", lastModified: "2026-03-08", content: "Une maintenance est prévue le 15 mars de 2h à 4h du matin." },
  { id: "cp-7", title: "Bannière promo : -20% premier mois", type: "banner", status: "published", lastModified: "2026-03-05", content: "Offre spéciale : -20% sur votre premier mois d'abonnement Pro !" },
];

const typeLabels: Record<string, string> = { legal: "Page légale", faq: "FAQ", announcement: "Annonce", banner: "Bannière" };
const typeColors: Record<string, string> = { legal: "bg-primary/10 text-primary", faq: "bg-accent/10 text-accent", announcement: "bg-warning/10 text-warning", banner: "bg-muted text-muted-foreground" };
const typeIcons: Record<string, any> = { legal: Shield, faq: HelpCircle, announcement: Megaphone, banner: Globe };

const AdminContentPages = () => {
  const [pages, setPages] = useState(initialPages);
  const [filterType, setFilterType] = useState<string>("all");
  const [editing, setEditing] = useState<ContentPage | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const filtered = filterType === "all" ? pages : pages.filter(p => p.type === filterType);

  const openEdit = (page: ContentPage) => {
    setEditing(page);
    setEditTitle(page.title);
    setEditContent(page.content);
  };

  const saveEdit = () => {
    if (!editing) return;
    setPages(prev => prev.map(p => p.id === editing.id ? { ...p, title: editTitle, content: editContent, lastModified: new Date().toISOString().slice(0, 10) } : p));
    toast({ title: "Contenu sauvegardé", description: editTitle });
    setEditing(null);
  };

  const toggleStatus = (id: string) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, status: p.status === "published" ? "draft" : "published" } : p));
    const p = pages.find(x => x.id === id);
    toast({ title: p?.status === "published" ? "Dépublié" : "Publié", description: p?.title });
  };

  const deletePage = (id: string) => {
    setPages(prev => prev.filter(p => p.id !== id));
    toast({ title: "Contenu supprimé" });
    if (editing?.id === id) setEditing(null);
  };

  const addPage = () => {
    const newPage: ContentPage = {
      id: `cp-${Date.now()}`,
      title: "Nouveau contenu",
      type: "faq",
      status: "draft",
      lastModified: new Date().toISOString().slice(0, 10),
      content: "",
    };
    setPages(prev => [newPage, ...prev]);
    openEdit(newPage);
  };

  return (
    <DashboardLayout role="admin" title="Gestion du Contenu">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {(["legal", "faq", "announcement", "banner"] as const).map(type => {
            const Icon = typeIcons[type];
            const count = pages.filter(p => p.type === type).length;
            return (
              <div key={type} className="rounded-xl border bg-card p-5 shadow-card">
                <Icon className="h-5 w-5 text-primary mb-2" />
                <p className="text-2xl font-bold text-foreground">{count}</p>
                <p className="text-xs text-muted-foreground">{typeLabels[type]}s</p>
              </div>
            );
          })}
        </div>

        {/* Filters + Add */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-1 rounded-lg border bg-card p-0.5">
            {[{ key: "all", label: "Tous" }, ...Object.entries(typeLabels).map(([k, v]) => ({ key: k, label: v }))].map(f => (
              <button key={f.key} onClick={() => setFilterType(f.key)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${filterType === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {f.label}
              </button>
            ))}
          </div>
          <Button size="sm" className="gradient-primary text-primary-foreground" onClick={addPage}>
            <Plus className="h-3.5 w-3.5 mr-1" />Ajouter
          </Button>
        </div>

        {/* Content list */}
        <div className="space-y-3">
          {filtered.map(page => {
            const Icon = typeIcons[page.type];
            return (
              <div key={page.id} className="rounded-xl border bg-card p-4 shadow-card hover:shadow-md transition-all flex items-center gap-4">
                <div className={`p-2 rounded-lg ${typeColors[page.type]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground text-sm truncate">{page.title}</h4>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${typeColors[page.type]}`}>{typeLabels[page.type]}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${page.status === "published" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                      {page.status === "published" ? "Publié" : "Brouillon"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Modifié le {page.lastModified}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => toggleStatus(page.id)} className={page.status === "published" ? "text-accent" : "text-muted-foreground"}>
                    {page.status === "published" ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                  </button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(page)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => deletePage(page.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit sheet */}
      <Sheet open={!!editing} onOpenChange={v => !v && setEditing(null)}>
        <SheetContent className="sm:max-w-lg flex flex-col p-0">
          {editing && (
            <>
              <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
                <SheetTitle>Modifier le contenu</SheetTitle>
                <SheetDescription className="sr-only">Éditeur de contenu</SheetDescription>
              </SheetHeader>
              <ScrollArea className="flex-1 px-6 py-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Titre</label>
                    <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Type</label>
                    <select value={editing.type} onChange={e => setEditing({ ...editing, type: e.target.value as any })} className="w-full mt-1 rounded-lg border bg-background px-3 py-2 text-sm">
                      {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Contenu</label>
                    <Textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="mt-1 min-h-[200px]" />
                  </div>
                  <Button className="w-full gradient-primary text-primary-foreground" onClick={saveEdit}>
                    <Save className="h-4 w-4 mr-1" />Sauvegarder
                  </Button>
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default AdminContentPages;
