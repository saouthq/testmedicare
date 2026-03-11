/**
 * Public Search Page — 100% publique (pas de layout patient)
 * Recherche de médecins avec filtres depuis query params
 */
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import SeoHelmet from "@/components/seo/SeoHelmet";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, MapPin, Filter, ChevronDown, Video, Clock, Shield, Map,
  CheckCircle2,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  specialtiesWithAll as specialties,
  availDates,
  mockDoctors as doctors,
  gouvernorats,
} from "@/data/mockData";

const PublicSearch = () => {
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();

  // Initialize from query params
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get("specialty") || "Tous");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [cityQuery, setCityQuery] = useState(searchParams.get("city") || "");
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [dayRange, setDayRange] = useState<3 | 7>(3);
  const [filterTeleconsult, setFilterTeleconsult] = useState(searchParams.get("teleconsult") === "true");
  const [filterToday, setFilterToday] = useState(searchParams.get("today") === "true");
  const [filterAssurance, setFilterAssurance] = useState(searchParams.get("assurance") === "true");
  const [filterMaxPrice, setFilterMaxPrice] = useState("");
  const [filterLangue, setFilterLangue] = useState("");
  const [filterGouvernorat, setFilterGouvernorat] = useState("");

  // Apply filters from URL on mount
  useEffect(() => {
    const spec = searchParams.get("specialty");
    if (spec && specialties.includes(spec)) setSelectedSpecialty(spec);
  }, [searchParams]);

  const filtered = doctors.filter(d => {
    if (selectedSpecialty !== "Tous" && d.specialty !== selectedSpecialty) return false;
    if (searchQuery && !d.name.toLowerCase().includes(searchQuery.toLowerCase()) && !d.specialty.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (cityQuery && !d.address.toLowerCase().includes(cityQuery.toLowerCase())) return false;
    if (filterTeleconsult && !d.teleconsultation) return false;
    if (filterAssurance && !d.acceptsInsurance) return false;
    if (filterToday && !d.availAM[0] && !d.availPM[0]) return false;
    if (filterMaxPrice && d.price > Number(filterMaxPrice)) return false;
    if (filterLangue && !d.languages?.includes(filterLangue)) return false;
    if (filterGouvernorat && !d.address.includes(filterGouvernorat)) return false;
    if (filterToday && !d.availAM[0] && !d.availPM[0]) return false;
    return true;
  });
  
  const visibleDates = availDates.slice(0, dayRange);

  return (
    <div className="min-h-screen bg-background">
      <SeoHelmet 
        title="Rechercher un médecin en Tunisie | Medicare" 
        description="Trouvez un médecin, généraliste ou spécialiste, en Tunisie. Prenez rendez-vous en ligne 24h/24. Filtres par ville, spécialité, téléconsultation." 
      />
      <PublicHeader />

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <Breadcrumbs items={[{ label: "Recherche médecins" }]} />
        
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Trouver un médecin en Tunisie
        </h1>

        {/* Search bar */}
        <div className="rounded-xl border bg-card p-3 sm:p-4 shadow-card mb-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Médecin, spécialité..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-10 h-10" 
              />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Ville, quartier..." 
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                className="pl-10 h-10" 
              />
            </div>
            <Button className="gradient-primary text-primary-foreground h-10 px-5">
              <Search className="h-4 w-4 mr-1.5" />Rechercher
            </Button>
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="text-xs h-8">
              <Filter className="h-3 w-3 mr-1" />Filtres 
              <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </Button>
            <Button 
              variant={filterTeleconsult ? "default" : "outline"} 
              size="sm" 
              className={`text-xs h-8 ${filterTeleconsult ? "gradient-primary text-primary-foreground" : ""}`} 
              onClick={() => setFilterTeleconsult(!filterTeleconsult)}
            >
              <Video className="h-3 w-3 mr-1" />Téléconsultation
            </Button>
            <Button 
              variant={filterToday ? "default" : "outline"} 
              size="sm" 
              className={`text-xs h-8 ${filterToday ? "gradient-primary text-primary-foreground" : ""}`} 
              onClick={() => setFilterToday(!filterToday)}
            >
              <Clock className="h-3 w-3 mr-1" />Dispo aujourd'hui
            </Button>
            <Button 
              variant={filterAssurance ? "default" : "outline"} 
              size="sm" 
              className={`text-xs h-8 ${filterAssurance ? "gradient-primary text-primary-foreground" : ""}`} 
              onClick={() => setFilterAssurance(!filterAssurance)}
            >
              <Shield className="h-3 w-3 mr-1" />Assurance
            </Button>
            {(filterTeleconsult || filterToday || filterAssurance) && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-8 text-destructive" 
                onClick={() => { 
                  setFilterTeleconsult(false); 
                  setFilterToday(false); 
                  setFilterAssurance(false); 
                }}
              >
                Réinitialiser
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => setShowMap(!showMap)}>
              <Map className="h-3 w-3 mr-1" />{showMap ? "Liste" : "Carte"}
            </Button>
          </div>

          {showFilters && (
            <div className="mt-3 pt-3 border-t grid gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Tarif max (DT)</label>
                <Input type="number" placeholder="70" className="mt-1 h-9" value={filterMaxPrice} onChange={e => setFilterMaxPrice(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Langue</label>
                <select value={filterLangue} onChange={e => setFilterLangue(e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm h-9">
                  <option value="">Toutes</option>
                  <option>Français</option>
                  <option>Arabe</option>
                  <option>Anglais</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Gouvernorat</label>
                <select value={filterGouvernorat} onChange={e => setFilterGouvernorat(e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm h-9">
                  <option value="">Tous</option>
                  {gouvernorats.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Specialty chips */}
        {isMobile ? (
          <select 
            value={selectedSpecialty} 
            onChange={e => setSelectedSpecialty(e.target.value)} 
            className="w-full rounded-xl border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-card mb-4"
          >
            {specialties.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        ) : (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {specialties.map(s => (
              <button 
                key={s} 
                onClick={() => setSelectedSpecialty(s)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                  selectedSpecialty === s 
                    ? "border-primary bg-primary text-primary-foreground" 
                    : "border-border text-muted-foreground hover:border-primary/50 hover:bg-primary/5"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {showMap && (
          <div className="rounded-xl border bg-muted/30 h-48 flex items-center justify-center text-muted-foreground text-sm mb-4">
            <Map className="h-6 w-6 mr-2 text-primary" /> Vue carte (à connecter)
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground font-medium">
            {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border bg-card overflow-hidden">
              <button 
                onClick={() => setDayRange(3)} 
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  dayRange === 3 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                3 jours
              </button>
              <button 
                onClick={() => setDayRange(7)} 
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  dayRange === 7 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                7 jours
              </button>
            </div>
          </div>
        </div>

        {/* Doctor cards */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-12 rounded-xl border bg-card">
              <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">Aucun praticien trouvé</p>
              <p className="text-xs text-muted-foreground mt-1">Essayez de modifier vos filtres</p>
            </div>
          )}

          {filtered.map((d, i) => {
            const hasAnyAvail = d.availAM.slice(0, dayRange).some(Boolean) || d.availPM.slice(0, dayRange).some(Boolean);
            return (
              <Link 
                key={d.id} 
                to={`/doctor/${d.id}`} 
                className="block rounded-xl border bg-card shadow-card hover:shadow-card-hover transition-all"
              >
                <div className="p-4">
                  <div className="flex gap-3 sm:gap-4">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm sm:text-base shrink-0">
                      {d.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground text-sm sm:text-base">{d.name}</h3>
                      <p className="text-xs sm:text-sm text-primary font-medium">{d.specialty}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{d.distance}</span>
                        <span>·</span>
                        <span className="truncate">{d.address}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {/* Avis vérifiés (pas d'étoiles) */}
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          <span className="text-xs font-medium text-foreground">{d.reviewCount} avis</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">{d.price} DT</span>
                        {d.acceptsInsurance && (
                          <span className="flex items-center gap-0.5 text-[10px] text-primary bg-primary/5 px-1.5 py-0.5 rounded-full">
                            <Shield className="h-2.5 w-2.5" />Assurance
                          </span>
                        )}
                        {d.teleconsultation && (
                          <span className="flex items-center gap-0.5 text-[10px] text-primary bg-primary/5 px-1.5 py-0.5 rounded-full">
                            <Video className="h-2.5 w-2.5" />Vidéo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    {hasAnyAvail ? (
                      <>
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                          <span className="text-xs font-medium text-accent">{d.nextSlot}</span>
                        </div>
                        <div className="overflow-x-auto -mx-1">
                          <table className="w-full text-center border-collapse" style={{ minWidth: dayRange === 7 ? 420 : 240 }}>
                            <thead>
                              <tr>
                                <td className="w-[60px]" />
                                {visibleDates.map((date, j) => (
                                  <th key={j} className="pb-1.5 px-1">
                                    <p className="text-[10px] font-semibold text-foreground leading-tight">
                                      {isMobile ? date.short : date.label}
                                    </p>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="text-[10px] font-medium text-muted-foreground text-left pr-1 py-1">Matin</td>
                                {visibleDates.map((_, j) => (
                                  <td key={j} className="py-1 px-1">
                                    {d.availAM[j] 
                                      ? <span className="inline-block text-[10px] font-semibold text-accent bg-accent/10 rounded px-1.5 py-0.5">Dispo</span> 
                                      : <span className="text-[11px] text-muted-foreground/30">—</span>
                                    }
                                  </td>
                                ))}
                              </tr>
                              <tr>
                                <td className="text-[10px] font-medium text-muted-foreground text-left pr-1 py-1">Après-midi</td>
                                {visibleDates.map((_, j) => (
                                  <td key={j} className="py-1 px-1">
                                    {d.availPM[j] 
                                      ? <span className="inline-block text-[10px] font-semibold text-accent bg-accent/10 rounded px-1.5 py-0.5">Dispo</span> 
                                      : <span className="text-[11px] text-muted-foreground/30">—</span>
                                    }
                                  </td>
                                ))}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Prochaine disponibilité : <span className="font-medium text-foreground">{d.nextSlot}</span>
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default PublicSearch;
