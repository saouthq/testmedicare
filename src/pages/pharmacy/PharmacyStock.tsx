/**
 * PharmacyStock — Disponibilité médicaments (pas de gestion de stock quantitatif).
 * Dispo: Disponible / Partiel / Indisponible
 * Workflow: Retrait ordonnance, pas de commande fournisseur.
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, Pill, CheckCircle2, AlertTriangle, X, ToggleLeft, ToggleRight, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockPharmacyStock, mockPharmacyCategories } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";

type Availability = "available" | "partial" | "unavailable";

interface MedItem {
  id: number;
  name: string;
  category: string;
  availability: Availability;
  price: string;
}

const availConfig: Record<Availability, { label: string; cls: string }> = {
  available: { label: "Disponible", cls: "bg-accent/10 text-accent" },
  partial: { label: "Partiel", cls: "bg-warning/10 text-warning" },
  unavailable: { label: "Indisponible", cls: "bg-destructive/10 text-destructive" },
};

const PharmacyStock = () => {
  const [meds, setMeds] = useState<MedItem[]>(
    mockPharmacyStock.map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      availability: s.status === "critical" ? "unavailable" as Availability : s.status === "low" ? "partial" as Availability : "available" as Availability,
      price: s.price,
    }))
  );
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [filterAvail, setFilterAvail] = useState<Availability | "all">("all");

  const filtered = meds
    .filter(m => {
      if (selectedCategory !== "Tous" && m.category !== selectedCategory) return false;
      if (filterAvail !== "all" && m.availability !== filterAvail) return false;
      if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const counts = {
    available: meds.filter(m => m.availability === "available").length,
    partial: meds.filter(m => m.availability === "partial").length,
    unavailable: meds.filter(m => m.availability === "unavailable").length,
  };

  const cycleAvailability = (id: number) => {
    setMeds(prev => prev.map(m => {
      if (m.id !== id) return m;
      const next: Availability = m.availability === "available" ? "partial" : m.availability === "partial" ? "unavailable" : "available";
      return { ...m, availability: next };
    }));
  };

  const toggleAvailability = (id: number, avail: Availability) => {
    setMeds(prev => prev.map(m => m.id === id ? { ...m, availability: avail } : m));
    toast({ title: "Disponibilité mise à jour" });
  };

  return (
    <DashboardLayout role="pharmacy" title="Disponibilité médicaments">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 grid-cols-3">
          <button onClick={() => setFilterAvail(filterAvail === "available" ? "all" : "available")} className={`rounded-xl border p-4 shadow-card text-center transition-all ${filterAvail === "available" ? "border-accent ring-1 ring-accent" : "bg-card"}`}>
            <p className="text-2xl font-bold text-accent">{counts.available}</p>
            <p className="text-xs text-muted-foreground">Disponibles</p>
          </button>
          <button onClick={() => setFilterAvail(filterAvail === "partial" ? "all" : "partial")} className={`rounded-xl border p-4 shadow-card text-center transition-all ${filterAvail === "partial" ? "border-warning ring-1 ring-warning" : "bg-card"}`}>
            <p className="text-2xl font-bold text-warning">{counts.partial}</p>
            <p className="text-xs text-muted-foreground">Partiels</p>
          </button>
          <button onClick={() => setFilterAvail(filterAvail === "unavailable" ? "all" : "unavailable")} className={`rounded-xl border p-4 shadow-card text-center transition-all ${filterAvail === "unavailable" ? "border-destructive ring-1 ring-destructive" : "bg-card"}`}>
            <p className="text-2xl font-bold text-destructive">{counts.unavailable}</p>
            <p className="text-xs text-muted-foreground">Indisponibles</p>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher un médicament..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {mockPharmacyCategories.map(c => (
            <button key={c} onClick={() => setSelectedCategory(c)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${selectedCategory === c ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/50"}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Alerts */}
        {counts.unavailable > 0 && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-center gap-2 mb-2"><AlertTriangle className="h-5 w-5 text-destructive" /><h3 className="font-medium text-foreground">Médicaments indisponibles</h3></div>
            <div className="flex flex-wrap gap-2">
              {meds.filter(m => m.availability === "unavailable").map(m => (
                <span key={m.id} className="rounded-full px-3 py-1 text-xs font-medium bg-destructive/10 text-destructive">{m.name}</span>
              ))}
            </div>
          </div>
        )}

        {/* List */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="p-4 text-xs font-medium text-muted-foreground">Médicament</th>
                <th className="p-4 text-xs font-medium text-muted-foreground hidden sm:table-cell">Catégorie</th>
                <th className="p-4 text-xs font-medium text-muted-foreground hidden md:table-cell">Prix</th>
                <th className="p-4 text-xs font-medium text-muted-foreground">Disponibilité</th>
                <th className="p-4 text-xs font-medium text-muted-foreground w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(m => (
                <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                        m.availability === "unavailable" ? "bg-destructive/10" : m.availability === "partial" ? "bg-warning/10" : "bg-accent/10"
                      }`}>
                        <Pill className={`h-4 w-4 ${
                          m.availability === "unavailable" ? "text-destructive" : m.availability === "partial" ? "text-warning" : "text-accent"
                        }`} />
                      </div>
                      <span className="font-medium text-foreground text-sm">{m.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground hidden sm:table-cell">{m.category}</td>
                  <td className="p-4 text-xs font-medium text-foreground hidden md:table-cell">{m.price}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${availConfig[m.availability].cls}`}>
                      {availConfig[m.availability].label}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleAvailability(m.id, "available")} title="Disponible"
                        className={`h-7 w-7 rounded-md flex items-center justify-center transition-colors ${m.availability === "available" ? "bg-accent/20 text-accent" : "text-muted-foreground hover:bg-muted"}`}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => toggleAvailability(m.id, "partial")} title="Partiel"
                        className={`h-7 w-7 rounded-md flex items-center justify-center transition-colors ${m.availability === "partial" ? "bg-warning/20 text-warning" : "text-muted-foreground hover:bg-muted"}`}>
                        <Package className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => toggleAvailability(m.id, "unavailable")} title="Indisponible"
                        className={`h-7 w-7 rounded-md flex items-center justify-center transition-colors ${m.availability === "unavailable" ? "bg-destructive/20 text-destructive" : "text-muted-foreground hover:bg-muted"}`}>
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">Aucun médicament trouvé.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PharmacyStock;
