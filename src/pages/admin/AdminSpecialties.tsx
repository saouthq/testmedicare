/**
 * AdminSpecialties — Admin page to manage doctor specialties, quotas, and feature access.
 * Note: Le tarif de consultation est fixé librement par chaque médecin, pas par l'admin.
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import {
  Search, Settings, Stethoscope, CheckCircle2,
  Users, BarChart3, Shield, ToggleLeft, ToggleRight, Save,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SpecialtyEntry {
  id: string;
  label: string;
  icon: string;
  category: "generaliste" | "specialiste" | "dentiste" | "kine";
  activeDoctors: number;
  enabled: boolean;
  features: string[];
  requiredDocs: string[];
}

const defaultSpecialties: SpecialtyEntry[] = [
  { id: "generaliste", label: "Médecin généraliste", icon: "🩺", category: "generaliste", activeDoctors: 124, enabled: true, features: ["Ordonnances", "Analyses", "Téléconsultation", "Certificats"], requiredDocs: ["Diplôme de médecine", "Inscription Ordre des médecins"] },
  { id: "cardiologue", label: "Cardiologue", icon: "❤️", category: "specialiste", activeDoctors: 18, enabled: true, features: ["ECG intégré", "Écho cardiaque", "Holter", "Épreuve d'effort", "Ordonnances cardio"], requiredDocs: ["DES Cardiologie", "Inscription Ordre"] },
  { id: "ophtalmologue", label: "Ophtalmologue", icon: "👁️", category: "specialiste", activeDoctors: 12, enabled: true, features: ["Acuité visuelle", "Fond d'œil", "Tonométrie", "Prescription optique", "OCT"], requiredDocs: ["DES Ophtalmologie", "Inscription Ordre"] },
  { id: "dermatologue", label: "Dermatologue", icon: "🔬", category: "specialiste", activeDoctors: 15, enabled: true, features: ["Galerie photos", "Dermatoscopie", "Biopsie", "Photothérapie"], requiredDocs: ["DES Dermatologie", "Inscription Ordre"] },
  { id: "pediatre", label: "Pédiatre", icon: "👶", category: "specialiste", activeDoctors: 22, enabled: true, features: ["Courbes de croissance", "Carnet vaccinal", "Développement psychomoteur"], requiredDocs: ["DES Pédiatrie", "Inscription Ordre"] },
  { id: "orl", label: "ORL", icon: "👂", category: "specialiste", activeDoctors: 8, enabled: true, features: ["Audiogramme", "Endoscopie", "Vidéonystagmographie"], requiredDocs: ["DES ORL", "Inscription Ordre"] },
  { id: "psychiatre", label: "Psychiatre", icon: "🧠", category: "specialiste", activeDoctors: 10, enabled: true, features: ["Échelles PHQ-9/GAD-7", "Notes confidentielles", "Suivi psychotropes"], requiredDocs: ["DES Psychiatrie", "Inscription Ordre"] },
  { id: "neurologue", label: "Neurologue", icon: "⚡", category: "specialiste", activeDoctors: 6, enabled: true, features: ["EEG", "EMG", "Dosage antiépileptiques"], requiredDocs: ["DES Neurologie", "Inscription Ordre"] },
  { id: "gynecologue", label: "Gynécologue", icon: "🌸", category: "specialiste", activeDoctors: 14, enabled: true, features: ["Suivi grossesse", "Échographie obstétricale", "Frottis"], requiredDocs: ["DES Gynécologie-Obstétrique", "Inscription Ordre"] },
  { id: "dentiste", label: "Chirurgien-Dentiste", icon: "🦷", category: "dentiste", activeDoctors: 35, enabled: true, features: ["Schéma dentaire", "Devis & Plans", "Panoramique", "CBCT"], requiredDocs: ["Diplôme de chirurgie dentaire", "Inscription Ordre des dentistes"] },
  { id: "kine", label: "Kinésithérapeute", icon: "🦴", category: "kine", activeDoctors: 28, enabled: true, features: ["Échelle EVA", "Bilans articulaires", "Programme exercices"], requiredDocs: ["Diplôme de kinésithérapie", "Inscription Ordre des kinés"] },
];

const AdminSpecialties = () => {
  const [specs, setSpecs] = useState(defaultSpecialties);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<SpecialtyEntry | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editFeature, setEditFeature] = useState("");

  const filtered = useMemo(() => {
    if (!search) return specs;
    const q = search.toLowerCase();
    return specs.filter(s => s.label.toLowerCase().includes(q) || s.category.includes(q));
  }, [specs, search]);

  const totalDoctors = specs.reduce((s, sp) => s + sp.activeDoctors, 0);
  const enabledCount = specs.filter(s => s.enabled).length;

  const toggleSpec = (id: string) => {
    setSpecs(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
    const sp = specs.find(s => s.id === id);
    toast({ title: sp?.enabled ? `${sp.label} désactivé` : `${sp?.label} activé` });
  };

  const openDetail = (s: SpecialtyEntry) => {
    setSelected(s);
    setDrawerOpen(true);
  };

  const addFeature = () => {
    if (!selected || !editFeature.trim()) return;
    const newFeature = editFeature.trim();
    setSpecs(prev => prev.map(s => s.id === selected.id ? { ...s, features: [...s.features, newFeature] } : s));
    setSelected(prev => prev ? { ...prev, features: [...prev.features, newFeature] } : null);
    setEditFeature("");
    toast({ title: "Fonctionnalité ajoutée" });
  };

  const removeFeature = (feature: string) => {
    if (!selected) return;
    setSpecs(prev => prev.map(s => s.id === selected.id ? { ...s, features: s.features.filter(f => f !== feature) } : s));
    setSelected(prev => prev ? { ...prev, features: prev.features.filter(f => f !== feature) } : null);
    toast({ title: "Fonctionnalité retirée" });
  };

  return (
    <DashboardLayout role="admin" title="Gestion des Spécialités">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{specs.length}</p>
                <p className="text-xs text-muted-foreground">Spécialités</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">{enabledCount}</p>
                <p className="text-xs text-muted-foreground">Actives</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalDoctors}</p>
                <p className="text-xs text-muted-foreground">Praticiens inscrits</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{Math.round(specs.reduce((s, sp) => s + sp.features.length, 0) / specs.length)}</p>
                <p className="text-xs text-muted-foreground">Moy. features/spé</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher une spécialité..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Spécialité</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Catégorie</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Praticiens</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Features</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Docs KYC</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Statut</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{s.icon}</span>
                        <span className="font-medium text-foreground">{s.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        s.category === "generaliste" ? "bg-primary/10 text-primary" :
                        s.category === "specialiste" ? "bg-accent/10 text-accent" :
                        s.category === "dentiste" ? "bg-warning/10 text-warning" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {s.category === "generaliste" ? "Généraliste" : s.category === "specialiste" ? "Spécialiste" : s.category === "dentiste" ? "Dentaire" : "Paramédical"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-foreground font-medium">{s.activeDoctors}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{s.features.length}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{s.requiredDocs.length}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleSpec(s.id)} className={s.enabled ? "text-accent" : "text-muted-foreground"}>
                        {s.enabled ? <ToggleRight className="h-6 w-6 mx-auto" /> : <ToggleLeft className="h-6 w-6 mx-auto" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openDetail(s)}>
                        <Settings className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
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
                <li>• <strong>Désactiver une spécialité</strong> empêche les nouvelles inscriptions et masque la spécialité dans les recherches.</li>
                <li>• Les praticiens existants conservent leur accès mais ne peuvent plus prendre de nouveaux patients.</li>
                <li>• Le <strong>tarif de consultation</strong> est fixé librement par chaque praticien depuis son espace personnel.</li>
                <li>• Les <strong>features</strong> sont les outils spécifiques disponibles dans l'espace consultation de chaque spécialité.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Detail drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="sm:max-w-md flex flex-col p-0">
          {selected && (
            <>
              <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
                <SheetTitle className="flex items-center gap-3">
                  <span className="text-2xl">{selected.icon}</span>
                  {selected.label}
                </SheetTitle>
              </SheetHeader>
              <ScrollArea className="flex-1">
                <div className="px-6 py-4 space-y-5">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border p-3 text-center">
                      <p className="text-lg font-bold text-foreground">{selected.activeDoctors}</p>
                      <p className="text-[11px] text-muted-foreground">Praticiens actifs</p>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <p className="text-lg font-bold text-foreground">{selected.features.length}</p>
                      <p className="text-[11px] text-muted-foreground">Fonctionnalités</p>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fonctionnalités activées</label>
                    <div className="mt-2 space-y-1.5">
                      {selected.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 group">
                          <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />
                          <span className="text-sm text-foreground flex-1">{f}</span>
                          <button onClick={() => removeFeature(f)} className="text-destructive opacity-0 group-hover:opacity-100 text-xs transition-opacity">✕</button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Input value={editFeature} onChange={e => setEditFeature(e.target.value)} placeholder="Nouvelle fonctionnalité..." className="h-8 text-sm" onKeyDown={e => e.key === "Enter" && addFeature()} />
                      <Button size="sm" className="h-8 gradient-primary text-primary-foreground" onClick={addFeature}>
                        <Save className="h-3.5 w-3.5 mr-1" />Ajouter
                      </Button>
                    </div>
                  </div>

                  {/* Required docs */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Documents requis (KYC)</label>
                    <div className="mt-2 space-y-1.5">
                      {selected.requiredDocs.map((d, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
                          <Shield className="h-3.5 w-3.5 text-warning shrink-0" />
                          <span className="text-sm text-foreground">{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default AdminSpecialties;
