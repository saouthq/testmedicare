/**
 * Admin Reference Data — CRUD for specialties, cities, languages, motifs, assurances
 * TODO BACKEND: Replace with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
  assurances: ["CNAM", "CNRPS", "Maghrebia", "STAR", "GAT Assurances", "Carte Assurances", "ASTREE", "AMI Assurances", "Sans assurance"],
};

const tabLabels: Record<RefTab, string> = {
  specialties: "Spécialités",
  cities: "Villes / Gouvernorats",
  languages: "Langues",
  motifs: "Motifs",
  assurances: "Assurances",
};

const AdminReferenceData = () => {
  const [tab, setTab] = useState<RefTab>("specialties");
  const [data, setData] = useState(initialData);
  const [newItem, setNewItem] = useState("");

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

  return (
    <DashboardLayout role="admin" title="Référentiels">
      <div className="space-y-6 max-w-3xl">
        <div className="flex gap-1 rounded-lg border bg-card p-0.5 w-fit overflow-x-auto">
          {(Object.entries(tabLabels) as [RefTab, string][]).map(([k, v]) => (
            <button key={k} onClick={() => setTab(k)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{v}</button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          {tab === "assurances" && "Ce référentiel est utilisé dans tout le site (patients, secrétaires, pharmacies, labos)."}
          {tab === "cities" && "Gouvernorats de Tunisie — utilisés dans les filtres et profils."}
          {tab === "specialties" && "Spécialités médicales disponibles pour les médecins."}
        </p>

        <div className="flex gap-2">
          <Input placeholder={`Ajouter ${tabLabels[tab].toLowerCase()}...`} value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdd()} className="max-w-xs" />
          <Button onClick={handleAdd} size="sm" className="gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-1" />Ajouter</Button>
        </div>

        <div className="rounded-xl border bg-card shadow-card divide-y">
          {data[tab].map((item, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20">
              <span className="text-sm text-foreground">{item}</span>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDelete(item)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">{data[tab].length} élément(s)</p>
      </div>
    </DashboardLayout>
  );
};

export default AdminReferenceData;
