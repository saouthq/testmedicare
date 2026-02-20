import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search, MapPin, Star, Calendar, Filter, ChevronDown, Video, Clock, Shield, Globe, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link } from "react-router-dom";

const specialties = [
  "Tous", "Médecin généraliste", "Dentiste", "Cardiologue", "Dermatologue", 
  "Ophtalmologue", "Pédiatre", "Gynécologue", "ORL", "Kinésithérapeute"
];

const doctors = [
  { name: "Dr. Ahmed Bouazizi", specialty: "Médecin généraliste", address: "15 Av. de la Liberté, El Manar, 2092 Tunis", distance: "0.8 km", rating: 4.8, reviews: 234, nextSlot: "Aujourd'hui 14:30", avatar: "AB", price: 35, languages: ["Français", "Arabe"], teleconsultation: true, cnam: true, slots: ["14:30", "15:00", "16:30"] },
  { name: "Dr. Sonia Gharbi", specialty: "Cardiologue", address: "32 Rue Charles de Gaulle, 2080 Ariana", distance: "2.3 km", rating: 4.9, reviews: 187, nextSlot: "Demain 09:00", avatar: "SG", price: 60, languages: ["Français", "Arabe"], teleconsultation: false, cnam: true, slots: ["09:00", "10:30", "14:00"] },
  { name: "Dr. Khaled Hammami", specialty: "Dermatologue", address: "8 Boulevard Bab Bnet, 1006 Tunis", distance: "1.5 km", rating: 4.7, reviews: 156, nextSlot: "23 Fév 10:30", avatar: "KH", price: 50, languages: ["Français", "Arabe", "Anglais"], teleconsultation: true, cnam: true, slots: ["10:30", "11:00"] },
  { name: "Dr. Leila Chebbi", specialty: "Ophtalmologue", address: "45 Av. Habib Bourguiba, 4000 Sousse", distance: "3.1 km", rating: 4.6, reviews: 98, nextSlot: "24 Fév 11:00", avatar: "LC", price: 45, languages: ["Français", "Arabe"], teleconsultation: true, cnam: false, slots: ["11:00", "14:30", "15:30", "16:00"] },
  { name: "Dr. Nabil Karray", specialty: "Pédiatre", address: "22 Rue de Marseille, 1002 Tunis", distance: "1.2 km", rating: 4.9, reviews: 312, nextSlot: "Aujourd'hui 16:00", avatar: "NK", price: 40, languages: ["Français", "Arabe", "Anglais"], teleconsultation: true, cnam: true, slots: ["16:00", "16:30", "17:00"] },
  { name: "Dr. Ines Mansour", specialty: "Gynécologue", address: "10 Rue du Lac Constance, Les Berges du Lac, Tunis", distance: "4.0 km", rating: 4.8, reviews: 421, nextSlot: "25 Fév 09:30", avatar: "IM", price: 70, languages: ["Français", "Arabe"], teleconsultation: true, cnam: true, slots: ["09:30", "11:00"] },
];

const SearchDoctors = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = selectedSpecialty === "Tous" ? doctors : doctors.filter(d => d.specialty === selectedSpecialty);

  return (
    <DashboardLayout role="patient" title="Rechercher un praticien">
      <div className="space-y-6">
        <div className="rounded-xl border bg-card p-4 shadow-card">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Médecin, spécialité, établissement..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-11" />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Tunis, Ariana..." className="pl-10 h-11" defaultValue="Tunis" />
            </div>
            <Button className="gradient-primary text-primary-foreground h-11 px-6"><Search className="h-4 w-4 mr-2" />Rechercher</Button>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="text-xs">
              <Filter className="h-3 w-3 mr-1" />Filtres <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </Button>
            <Button variant="outline" size="sm" className="text-xs"><Video className="h-3 w-3 mr-1" />Téléconsultation</Button>
            <Button variant="outline" size="sm" className="text-xs"><Clock className="h-3 w-3 mr-1" />Disponible aujourd'hui</Button>
            <Button variant="outline" size="sm" className="text-xs"><Shield className="h-3 w-3 mr-1" />Conventionné CNAM</Button>
          </div>
          {showFilters && (
            <div className="mt-3 pt-3 border-t grid gap-3 sm:grid-cols-3">
              <div><label className="text-xs font-medium text-muted-foreground">Tarif maximum (DT)</label><Input type="number" placeholder="70" className="mt-1 h-9" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Langue</label><Input placeholder="Français, Arabe..." className="mt-1 h-9" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Gouvernorat</label>
                <select className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm h-9">
                  <option>Tous</option><option>Tunis</option><option>Ariana</option><option>Ben Arous</option><option>Manouba</option><option>Sousse</option><option>Sfax</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {specialties.map((s) => (
            <button key={s} onClick={() => setSelectedSpecialty(s)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${selectedSpecialty === s ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/50 hover:bg-primary/5"}`}>
              {s}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{filtered.length} praticien{filtered.length > 1 ? "s" : ""} trouvé{filtered.length > 1 ? "s" : ""}</p>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">Trier par : Pertinence <ChevronDown className="h-3 w-3 ml-1" /></Button>
          </div>
          
          {filtered.map((d, i) => (
            <div key={i} className="rounded-xl border bg-card shadow-card hover:shadow-card-hover transition-all">
              <div className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">{d.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground">{d.name}</h3>
                      <p className="text-sm text-primary font-medium">{d.specialty}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{d.address}</span>
                        <span className="text-primary/60">·</span><span>{d.distance}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                          <span className="text-sm font-semibold text-foreground">{d.rating}</span>
                          <span className="text-xs text-muted-foreground">({d.reviews} avis)</span>
                        </div>
                        <span className="text-xs text-muted-foreground">· {d.price} DT</span>
                        {d.cnam && (
                          <span className="flex items-center gap-1 text-xs text-primary bg-primary/5 px-2 py-0.5 rounded-full"><Shield className="h-3 w-3" />CNAM</span>
                        )}
                        {d.teleconsultation && (
                          <span className="flex items-center gap-1 text-xs text-primary bg-primary/5 px-2 py-0.5 rounded-full"><Video className="h-3 w-3" />Téléconsultation</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground"><Globe className="h-3 w-3" />{d.languages.join(", ")}</div>
                    </div>
                  </div>
                  <div className="sm:w-48 shrink-0">
                    <div className="flex items-center gap-1.5 mb-3">
                      <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                      <span className="text-xs font-medium text-accent">{d.nextSlot}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {d.slots.map(slot => (
                        <Link key={slot} to="/dashboard/patient/booking">
                          <button className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-all">{slot}</button>
                        </Link>
                      ))}
                    </div>
                    <Link to="/dashboard/patient/booking" className="block mt-3">
                      <Button className="w-full gradient-primary text-primary-foreground shadow-primary-glow" size="sm">Prendre rendez-vous</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SearchDoctors;
