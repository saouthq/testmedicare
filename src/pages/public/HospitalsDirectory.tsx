import { useState } from "react";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import DirectoryCard from "@/components/public/DirectoryCard";
import SeoHelmet from "@/components/seo/SeoHelmet";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Input } from "@/components/ui/input";
import { Search, Hospital } from "lucide-react";
import { mockHospitals } from "@/data/mocks/establishments";

const cities = ["Toutes", ...Array.from(new Set(mockHospitals.map(h => h.city)))];

const HospitalsDirectory = () => {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("Toutes");

  const filtered = mockHospitals.filter(h => {
    if (city !== "Toutes" && h.city !== city) return false;
    if (search && !h.name.toLowerCase().includes(search.toLowerCase()) && !h.services.some(s => s.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <SeoHelmet title="Hôpitaux en Tunisie — Annuaire | Medicare" description="Trouvez les hôpitaux et CHU en Tunisie. Services, urgences, adresses et contacts." />
      <PublicHeader />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Breadcrumbs items={[{ label: "Hôpitaux" }]} />
        <div className="flex items-center gap-3 mb-6">
          <Hospital className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Hôpitaux en Tunisie</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher un hôpital ou un service..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <select value={city} onChange={e => setCity(e.target.value)} className="rounded-lg border bg-card px-3 py-2 text-sm">
            {cities.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{filtered.length} hôpital(aux) trouvé(s)</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map(h => (
            <DirectoryCard key={h.id} name={h.name} city={h.city} address={h.address} phone={h.phone} tags={h.services} href={`/hospital/${h.slug}`} badge={h.urgences ? "🚨 Urgences" : undefined} badgeColor="bg-destructive/10 text-destructive" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HospitalsDirectory;
