import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import DirectoryCard from "@/components/public/DirectoryCard";
import SeoHelmet from "@/components/seo/SeoHelmet";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Input } from "@/components/ui/input";
import { Search, Pill } from "lucide-react";
import { mockPublicPharmacies } from "@/data/mocks/establishments";

const cities = ["Toutes", ...Array.from(new Set(mockPublicPharmacies.map(p => p.city)))];

const PharmaciesDirectory = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("Toutes");
  const [deGarde, setDeGarde] = useState(false);

  // Read ?garde=true from URL
  useEffect(() => {
    if (searchParams.get("garde") === "true") setDeGarde(true);
  }, [searchParams]);

  const filtered = mockPublicPharmacies.filter(p => {
    if (city !== "Toutes" && p.city !== city) return false;
    if (deGarde && !p.deGarde) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <SeoHelmet title="Pharmacies en Tunisie — Annuaire | Medicare" description="Trouvez les pharmacies et pharmacies de garde en Tunisie. Horaires, adresses et contacts." />
      <PublicHeader />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Breadcrumbs items={[{ label: "Pharmacies" }]} />
        <div className="flex items-center gap-3 mb-6">
          <Pill className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Pharmacies en Tunisie</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher une pharmacie..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <select value={city} onChange={e => setCity(e.target.value)} className="rounded-lg border bg-card px-3 py-2 text-sm">
            {cities.map(c => <option key={c}>{c}</option>)}
          </select>
          <label className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm cursor-pointer whitespace-nowrap">
            <input type="checkbox" checked={deGarde} onChange={e => setDeGarde(e.target.checked)} className="rounded" />
            Pharmacie de garde
          </label>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{filtered.length} pharmacie(s) trouvée(s)</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map(p => (
            <DirectoryCard key={p.id} name={p.name} city={p.city} address={p.address} phone={p.phone} tags={[p.horaires]} href={`/pharmacy/${p.slug}`} badge={p.deGarde ? "🌙 De garde" : undefined} badgeColor="bg-accent/10 text-accent" />
          ))}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default PharmaciesDirectory;
