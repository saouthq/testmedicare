import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import DirectoryCard from "@/components/public/DirectoryCard";
import SeoHelmet from "@/components/seo/SeoHelmet";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Input } from "@/components/ui/input";
import { Search, Hospital } from "lucide-react";
import { useHospitalsDirectory } from "@/stores/directoryStore";

const HospitalsDirectory = () => {
  const hospitals = useHospitalsDirectory();
  const cities = useMemo(() => ["Toutes", ...Array.from(new Set(hospitals.map(h => h.city)))], [hospitals]);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("Toutes");
  const [showCount, setShowCount] = useState(10);

  const filtered = hospitals.filter(h => {
    if (city !== "Toutes" && h.city !== city) return false;
    if (search && !h.name.toLowerCase().includes(search.toLowerCase()) && !h.services.some(s => s.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const visible = filtered.slice(0, showCount);

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
          {visible.map(h => (
            <DirectoryCard key={h.id} name={h.name} city={h.city} address={h.address} phone={h.phone} tags={h.services} href={`/hospital/${h.slug}`} badge={h.urgences ? "🚨 Urgences" : undefined} badgeColor="bg-destructive/10 text-destructive" />
          ))}
        </div>
        {showCount < filtered.length && (
          <div className="text-center mt-6">
            <Button variant="outline" onClick={() => setShowCount(prev => prev + 10)}>
              Voir plus ({filtered.length - showCount} restant{filtered.length - showCount > 1 ? "s" : ""})
            </Button>
          </div>
        )}
      </div>
      <PublicFooter />
    </div>
  );
};

export default HospitalsDirectory;
