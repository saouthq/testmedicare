import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search, MapPin, Star, Calendar, Filter, ChevronDown, Video, Clock, Shield, Globe, CheckCircle2, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const specialties = [
  "Tous", "Médecin généraliste", "Dentiste", "Cardiologue", "Dermatologue", 
  "Ophtalmologue", "Pédiatre", "Gynécologue", "ORL", "Kinésithérapeute"
];

/* Availability data: 7 days from today */
const availDates = [
  { label: "Lun 17", short: "17/02", morning: true, afternoon: true },
  { label: "Mar 18", short: "18/02", morning: true, afternoon: false },
  { label: "Mer 19", short: "19/02", morning: false, afternoon: false },
  { label: "Jeu 20", short: "20/02", morning: true, afternoon: true },
  { label: "Ven 21", short: "21/02", morning: false, afternoon: true },
  { label: "Sam 22", short: "22/02", morning: true, afternoon: false },
  { label: "Dim 23", short: "23/02", morning: false, afternoon: false },
];

const doctors = [
  { name: "Dr. Ahmed Bouazizi", specialty: "Médecin généraliste", address: "15 Av. de la Liberté, El Manar, 2092 Tunis", distance: "0.8 km", rating: 4.8, reviews: 234, nextSlot: "Aujourd'hui 14:30", avatar: "AB", price: 35, languages: ["Français", "Arabe"], teleconsultation: true, cnam: true, avail: [true, true, false, true, false, true, false], availAM: [true, true, false, true, false, true, false], availPM: [true, false, false, true, true, false, false] },
  { name: "Dr. Sonia Gharbi", specialty: "Cardiologue", address: "32 Rue Charles de Gaulle, 2080 Ariana", distance: "2.3 km", rating: 4.9, reviews: 187, nextSlot: "Demain 09:00", avatar: "SG", price: 60, languages: ["Français", "Arabe"], teleconsultation: false, cnam: true, avail: [false, true, true, false, true, false, false], availAM: [false, true, true, false, false, false, false], availPM: [false, false, false, false, true, false, false] },
  { name: "Dr. Khaled Hammami", specialty: "Dermatologue", address: "8 Boulevard Bab Bnet, 1006 Tunis", distance: "1.5 km", rating: 4.7, reviews: 156, nextSlot: "23 Fév 10:30", avatar: "KH", price: 50, languages: ["Français", "Arabe", "Anglais"], teleconsultation: true, cnam: true, avail: [false, false, false, true, true, true, false], availAM: [false, false, false, true, false, true, false], availPM: [false, false, false, false, true, false, false] },
  { name: "Dr. Leila Chebbi", specialty: "Ophtalmologue", address: "45 Av. Habib Bourguiba, 4000 Sousse", distance: "3.1 km", rating: 4.6, reviews: 98, nextSlot: "24 Fév 11:00", avatar: "LC", price: 45, languages: ["Français", "Arabe"], teleconsultation: true, cnam: false, avail: [false, false, false, false, false, false, false], availAM: [false, false, false, false, false, false, false], availPM: [false, false, false, false, false, false, false] },
  { name: "Dr. Nabil Karray", specialty: "Pédiatre", address: "22 Rue de Marseille, 1002 Tunis", distance: "1.2 km", rating: 4.9, reviews: 312, nextSlot: "Aujourd'hui 16:00", avatar: "NK", price: 40, languages: ["Français", "Arabe", "Anglais"], teleconsultation: true, cnam: true, avail: [true, false, true, true, false, true, false], availAM: [false, false, true, false, false, true, false], availPM: [true, false, false, true, false, false, false] },
  { name: "Dr. Ines Mansour", specialty: "Gynécologue", address: "10 Rue du Lac Constance, Les Berges du Lac", distance: "4.0 km", rating: 4.8, reviews: 421, nextSlot: "25 Fév 09:30", avatar: "IM", price: 70, languages: ["Français", "Arabe"], teleconsultation: true, cnam: true, avail: [false, false, false, false, false, false, false], availAM: [false, false, false, false, false, false, false], availPM: [false, false, false, false, false, false, false] },
];

const SearchDoctors = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [dayRange, setDayRange] = useState<3 | 7>(3);
  const isMobile = useIsMobile();

  const filtered = selectedSpecialty === "Tous" ? doctors : doctors.filter(d => d.specialty === selectedSpecialty);
  const visibleDates = availDates.slice(0, dayRange);

  return (
    <DashboardLayout role="patient" title="Rechercher un praticien">
      <div className="space-y-4">
        {/* Search bar */}
        <div className="rounded-xl border bg-card p-3 sm:p-4 shadow-card">
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Médecin, spécialité..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-10" />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Ville, quartier..." className="pl-10 h-10" defaultValue="Tunis" />
            </div>
            <Button className="gradient-primary text-primary-foreground h-10 px-5"><Search className="h-4 w-4 mr-1.5" />Rechercher</Button>
          </div>
          {/* Filter chips */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="text-xs h-8">
              <Filter className="h-3 w-3 mr-1" />Filtres <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-8"><Video className="h-3 w-3 mr-1" />Téléconsultation</Button>
            <Button variant="outline" size="sm" className="text-xs h-8"><Clock className="h-3 w-3 mr-1" />Dispo aujourd'hui</Button>
            <Button variant="outline" size="sm" className="text-xs h-8"><Shield className="h-3 w-3 mr-1" />CNAM</Button>
            <div className="flex-1" />
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => setShowMap(!showMap)}>
              <Map className="h-3 w-3 mr-1" />{showMap ? "Liste" : "Carte"}
            </Button>
          </div>
          {showFilters && (
            <div className="mt-3 pt-3 border-t grid gap-3 sm:grid-cols-3">
              <div><label className="text-xs font-medium text-muted-foreground">Tarif max (DT)</label><Input type="number" placeholder="70" className="mt-1 h-9" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Langue</label><Input placeholder="Français, Arabe..." className="mt-1 h-9" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Gouvernorat</label>
                <select className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm h-9">
                  <option>Tous</option><option>Tunis</option><option>Ariana</option><option>Ben Arous</option><option>Manouba</option><option>Sousse</option><option>Sfax</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Specialty: Select on mobile, chips on desktop */}
        {isMobile ? (
          <select
            value={selectedSpecialty}
            onChange={e => setSelectedSpecialty(e.target.value)}
            className="w-full rounded-xl border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-card"
          >
            {specialties.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {specialties.map(s => (
              <button key={s} onClick={() => setSelectedSpecialty(s)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${selectedSpecialty === s ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/50 hover:bg-primary/5"}`}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Map placeholder */}
        {showMap && (
          <div className="rounded-xl border bg-muted/30 h-48 flex items-center justify-center text-muted-foreground text-sm">
            <Map className="h-6 w-6 mr-2 text-primary" /> Vue carte (à connecter)
          </div>
        )}

        {/* Results count + day range toggle */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground font-medium">{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</p>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border bg-card overflow-hidden">
              <button onClick={() => setDayRange(3)} className={`px-3 py-1.5 text-xs font-medium transition-colors ${dayRange === 3 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>3 jours</button>
              <button onClick={() => setDayRange(7)} className={`px-3 py-1.5 text-xs font-medium transition-colors ${dayRange === 7 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>7 jours</button>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">Trier : Pertinence <ChevronDown className="h-3 w-3 ml-1" /></Button>
          </div>
        </div>

        {/* Doctor cards */}
        <div className="space-y-3">
          {filtered.map((d, i) => {
            const hasAnyAvail = d.availAM.slice(0, dayRange).some(Boolean) || d.availPM.slice(0, dayRange).some(Boolean);
            return (
              <Link key={i} to={`/doctor/${i + 1}`} className="block rounded-xl border bg-card shadow-card hover:shadow-card-hover transition-all">
                <div className="p-4">
                  <div className="flex gap-3 sm:gap-4">
                    {/* Avatar */}
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm sm:text-base shrink-0">{d.avatar}</div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground text-sm sm:text-base">{d.name}</h3>
                      <p className="text-xs sm:text-sm text-primary font-medium">{d.specialty}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{d.distance}</span>
                        <span>·</span>
                        <span className="truncate">{d.address}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-warning text-warning" />
                          <span className="text-xs font-semibold text-foreground">{d.rating}</span>
                          <span className="text-[11px] text-muted-foreground">({d.reviews})</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">{d.price} DT</span>
                        {d.cnam && <span className="flex items-center gap-0.5 text-[10px] text-primary bg-primary/5 px-1.5 py-0.5 rounded-full"><Shield className="h-2.5 w-2.5" />CNAM</span>}
                        {d.teleconsultation && <span className="flex items-center gap-0.5 text-[10px] text-primary bg-primary/5 px-1.5 py-0.5 rounded-full"><Video className="h-2.5 w-2.5" />Vidéo</span>}
                      </div>
                    </div>
                  </div>

                  {/* Availability grid – Doctolib style */}
                  <div className="mt-3 pt-3 border-t">
                    {hasAnyAvail ? (
                      <>
                        <div className="flex items-center gap-1.5 mb-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                          <span className="text-xs font-medium text-accent">{d.nextSlot}</span>
                        </div>
                        {/* Date columns grid - no visible borders */}
                        <div className={`grid gap-0 ${dayRange === 3 ? "grid-cols-3" : "grid-cols-7"}`}>
                          {/* Header row */}
                          {visibleDates.map((date, j) => (
                            <div key={`h-${j}`} className="text-center py-1.5">
                              <p className="text-[10px] font-semibold text-foreground">{isMobile ? date.short : date.label}</p>
                            </div>
                          ))}
                          {/* Morning row */}
                          {visibleDates.map((_, j) => (
                            <div key={`am-${j}`} className="text-center py-1">
                              {d.availAM[j] ? (
                                <span className="text-[10px] font-medium text-accent">Matin</span>
                              ) : (
                                <span className="text-[10px] text-muted-foreground/40">—</span>
                              )}
                            </div>
                          ))}
                          {/* Afternoon row */}
                          {visibleDates.map((_, j) => (
                            <div key={`pm-${j}`} className="text-center py-1">
                              {d.availPM[j] ? (
                                <span className="text-[10px] font-medium text-accent">Après-midi</span>
                              ) : (
                                <span className="text-[10px] text-muted-foreground/40">—</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">Prochaine disponibilité : <span className="font-medium text-foreground">{d.nextSlot}</span></p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SearchDoctors;
