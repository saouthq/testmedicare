/**
 * Admin Reference Data — CRUD for specialties, cities, languages, motifs, assurances
 * With edit, import/export mock, audit trail
 * TODO BACKEND: Replace with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import { Plus, Trash2, Pencil, Download, Upload, Search, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";

type RefTab = "specialties" | "cities" | "languages" | "motifs" | "assurances";

const initialData: Record<RefTab, string[]> = {
  specialties: ["Médecin généraliste", "Cardiologue", "Dermatologue", "Ophtalmologue", "Pédiatre", "Gynécologue", "ORL", "Psychiatre", "Chirurgien", "Kinésithérapeute"],
  cities: ["Tunis", "Ariana", "Ben Arous", "Manouba", "Sousse", "Sfax", "Monastir", "Nabeul", "Bizerte", "Gabès", "Médenine", "Kairouan", "Kasserine", "Gafsa", "Tozeur", "Kébili", "Tataouine", "Zaghouan", "Siliana", "Le Kef", "Jendouba", "Béja", "Sidi Bouzid", "Mahdia"],
  languages: ["Français", "Arabe", "Anglais", "Allemand", "Italien"],
  motifs: ["Consultation générale", "Suivi", "Renouvellement ordonnance", "Certificat médical", "Urgence", "Bilan"],
  assurances: ["Assurance publique", "CNRPS", "Maghrebia", "STAR", "GAT Assurances", "Carte Assurances", "ASTREE", "AMI Assurances", "Sans assurance"],
};

const tabLabels: Record<RefTab, string> = {
  specialties: "Spécialités",
  cities: "Villes / Gouvernorats",
  languages: "Langues",
  motifs: "Motifs",
  assurances: "Assurances",
};

const tabDescriptions: Record<RefTab, string> = {
  specialties: "Spécialités médicales disponibles pour les médecins.",
  cities: "Gouvernorats de Tunisie — utilisés dans les filtres et profils.",
  languages: "Langues parlées par les professionnels.",
  motifs: "Motifs de consultation proposés aux patients.",
  assurances: "Ce référentiel est utilisé partout (patients, secrétaires, pharmacies, labos).",
};

const AdminReferenceData = () => {
  const [tab, setTab] = useState<RefTab>("specialties");
  const [data, setData] = useState(initialData);
  const [newItem, setNewItem] = useState("");
  const [search, setSearch] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const filtered = useMemo(() => {
    const items = data[tab];
    if (!search) return items;
    return items.filter(i => i.toLowerCase().includes(search.toLowerCase()));
  }, [data, tab, search]);

  const handleAdd = () => {
    if (!newItem.trim()) return;
    if (data[tab].includes(newItem.trim())) {
      toast({ title: "Cet élément existe déjà", variant: "destructive" });
      return;
    }
    setData(prev => ({ ...prev, [tab]: [...prev[tab], newItem.trim()] }));
    appendLog("reference_added", tab, newItem, `Ajout de "${newItem}" dans ${tabLabels[tab]}`);
    toast({ title: `"${newItem}" ajouté` });
    setNewItem("");
  };

  const handleDelete = (item: string) => {
    setData(prev => ({ ...prev, [tab]: prev[tab].filter(i => i !== item) }));
    appendLog("reference_deleted", tab, item, `Suppression de "${item}" dans ${tabLabels[tab]}`);
    toast({ title: `"${item}" supprimé` });
  };

  const handleStartEdit = (index: number, value: string) => {
    setEditingIndex(index);
    setEditValue(value);
  };

  const handleSaveEdit = (originalValue: string) => {
    if (!editValue.trim() || editValue.trim() === originalValue) {
      setEditingIndex(null);
      return;
    }
    if (data[tab].includes(editValue.trim())) {
      toast({ title: "Cet élément existe déjà", variant: "destructive" });
      return;
    }
    setData(prev => ({
      ...prev,
      [tab]: prev[tab].map(i => i === originalValue ? editValue.trim() : i),
    }));
    appendLog("reference_edited", tab, editValue, `Modification "${originalValue}" → "${editValue.trim()}" dans ${tabLabels[tab]}`);
    toast({ title: `"${originalValue}" → "${editValue.trim()}"` });
    setEditingIndex(null);
  };

  /** Mock export */
  const handleExport = () => {
    const csv = data[tab].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${tab}_${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    appendLog("reference_exported", tab, "", `Export de ${data[tab].length} éléments de ${tabLabels[tab]}`);
    toast({ title: "Export CSV téléchargé" });
  };

  /** Mock import */
  const handleImport = () => {
    // TODO BACKEND: Real file upload + parse
    const mockImported = ["Import Test 1", "Import Test 2"];
    const newItems = mockImported.filter(i => !data[tab].includes(i));
    if (newItems.length === 0) {
      toast({ title: "Aucun nouvel élément à importer" });
      return;
    }
    setData(prev => ({ ...prev, [tab]: [...prev[tab], ...newItems] }));
    appendLog("reference_imported", tab, "", `Import de ${newItems.length} élément(s) dans ${tabLabels[tab]}`);
    toast({ title: `${newItems.length} élément(s) importé(s)` });
  };

  return (
    <DashboardLayout role="admin" title="Référentiels">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 rounded-lg border bg-card p-0.5 w-fit overflow-x-auto">
          {(Object.entries(tabLabels) as [RefTab, string][]).map(([k, v]) => (
            <button key={k} onClick={() => { setTab(k); setSearch(""); setEditingIndex(null); }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {v} ({data[k].length})
            </button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">{tabDescriptions[tab]}</p>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2 flex-1">
            <Input placeholder={`Ajouter ${tabLabels[tab].toLowerCase()}...`} value={newItem} onChange={e => setNewItem(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()} className="max-w-xs" />
            <Button onClick={handleAdd} size="sm" className="gradient-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-1" />Ajouter
            </Button>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Filtrer..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 w-40 h-9 text-sm" />
            </div>
            <Button variant="outline" size="sm" className="text-xs h-9" onClick={handleExport}>
              <Download className="h-3.5 w-3.5 mr-1" />Export
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-9" onClick={handleImport}>
              <Upload className="h-3.5 w-3.5 mr-1" />Import
            </Button>
          </div>
        </div>

        {/* List */}
        <div className="rounded-xl border bg-card shadow-card divide-y">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">Aucun résultat</div>
          )}
          {filtered.map((item, i) => {
            const realIndex = data[tab].indexOf(item);
            const isEditing = editingIndex === realIndex;
            return (
              <div key={`${item}-${i}`} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 group">
                {isEditing ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input value={editValue} onChange={e => setEditValue(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleSaveEdit(item); if (e.key === "Escape") setEditingIndex(null); }}
                      className="h-8 text-sm max-w-xs" autoFocus />
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-accent" onClick={() => handleSaveEdit(item)}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground" onClick={() => setEditingIndex(null)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm text-foreground">{item}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleStartEdit(realIndex, item)}>
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDelete(item)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground">{data[tab].length} élément(s) · Toutes modifications sont enregistrées dans les audit logs.</p>
      </div>
    </DashboardLayout>
  );
};

export default AdminReferenceData;
