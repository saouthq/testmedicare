import { useState } from "react";
import PublicHeader from "@/components/public/PublicHeader";
import DirectoryCard from "@/components/public/DirectoryCard";
import SeoHelmet from "@/components/seo/SeoHelmet";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Input } from "@/components/ui/input";
import { Search, Building2 } from "lucide-react";
import { mockClinics } from "@/data/mocks/establishments";

const cities = ["Toutes", ...Array.from(new Set(mockClinics.map(c => c.city)))];

const ClinicsDirectory = () => {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("Toutes");

  const filtered = mockClinics.filter(c => {
    if (city !== "Toutes" && c.city !== city) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.services.some(s => s.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <SeoHelmet title="Cliniques en Tunisie — Annuaire | Medicare" description="Trouvez les meilleures cliniques privées en Tunisie. Consultez les services, adresses et contacts." />
      <PublicHeader />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Breadcrumbs items={[{ label: "Cliniques" }]} />
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Cliniques en Tunisie</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher une clinique ou un service..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <select value={city} onChange={e => setCity(e.target.value)} className="rounded-lg border bg-card px-3 py-2 text-sm">
            {cities.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{filtered.length} clinique(s) trouvée(s)</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map(c => (
            <DirectoryCard key={c.id} name={c.name} city={c.city} address={c.address} phone={c.phone} tags={c.services} href={`/clinic/${c.slug}`} badge={`${c.services.length} services`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClinicsDirectory;
