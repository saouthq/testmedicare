import { useState } from "react";
import { Link } from "react-router-dom";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import SeoHelmet from "@/components/seo/SeoHelmet";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Input } from "@/components/ui/input";
import { Search, Pill, ChevronRight } from "lucide-react";
import { mockMedicines } from "@/data/mocks/medicines";

const forms = ["Toutes", ...Array.from(new Set(mockMedicines.map(m => m.form)))];
const categories = ["Toutes", ...Array.from(new Set(mockMedicines.map(m => m.category)))];

const MedicinesDirectory = () => {
  const [search, setSearch] = useState("");
  const [form, setForm] = useState("Toutes");
  const [category, setCategory] = useState("Toutes");

  const filtered = mockMedicines.filter(m => {
    if (form !== "Toutes" && m.form !== form) return false;
    if (category !== "Toutes" && m.category !== category) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.summary.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <SeoHelmet title="Médicaments — Notice et informations | Medicare Tunisie" description="Consultez les notices des médicaments disponibles en Tunisie : indications, posologie, effets secondaires, contre-indications." />
      <PublicHeader />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Breadcrumbs items={[{ label: "Médicaments" }]} />
        <div className="flex items-center gap-3 mb-6">
          <Pill className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Annuaire des médicaments</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-6">Consultez les notices complètes des médicaments les plus courants en Tunisie. Ces informations ne remplacent pas l'avis d'un médecin.</p>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher un médicament..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <select value={form} onChange={e => setForm(e.target.value)} className="rounded-lg border bg-card px-3 py-2 text-sm">
            {forms.map(f => <option key={f}>{f}</option>)}
          </select>
          <select value={category} onChange={e => setCategory(e.target.value)} className="rounded-lg border bg-card px-3 py-2 text-sm">
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{filtered.length} médicament(s)</p>

        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map(m => (
            <Link key={m.id} to={`/medicament/${m.slug}`} className="group rounded-xl border bg-card p-5 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{m.name} {m.dosage}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{m.form}</span>
                    <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{m.category}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
              </div>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{m.summary}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MedicinesDirectory;
