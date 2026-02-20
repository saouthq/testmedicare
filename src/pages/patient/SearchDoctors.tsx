import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search, MapPin, Star, Calendar, Filter, ChevronDown, Video, Clock, Euro, Globe, CheckCircle2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link } from "react-router-dom";

const specialties = [
  "Tous", "Médecin généraliste", "Dentiste", "Cardiologue", "Dermatologue", 
  "Ophtalmologue", "Pédiatre", "Gynécologue", "ORL", "Kinésithérapeute"
];

const doctors = [
  { 
    name: "Dr. Sophie Martin", specialty: "Médecin généraliste", 
    address: "12 rue de la Paix, 75002 Paris", distance: "0.8 km",
    rating: 4.8, reviews: 234, nextSlot: "Aujourd'hui 14:30", 
    avatar: "SM", price: 25, languages: ["Français", "Anglais"],
    teleconsultation: true, conventionSecteur: 1,
    slots: ["14:30", "15:00", "16:30"]
  },
  { 
    name: "Dr. Pierre Durand", specialty: "Cardiologue", 
    address: "45 avenue Victor Hugo, 75016 Paris", distance: "2.3 km",
    rating: 4.9, reviews: 187, nextSlot: "Demain 09:00", 
    avatar: "PD", price: 50, languages: ["Français"],
    teleconsultation: false, conventionSecteur: 2,
    slots: ["09:00", "10:30", "14:00"]
  },
  { 
    name: "Dr. Marie Lefebvre", specialty: "Dermatologue", 
    address: "8 boulevard Haussmann, 75009 Paris", distance: "1.5 km",
    rating: 4.7, reviews: 156, nextSlot: "23 Fév 10:30", 
    avatar: "ML", price: 50, languages: ["Français", "Espagnol"],
    teleconsultation: true, conventionSecteur: 1,
    slots: ["10:30", "11:00"]
  },
  { 
    name: "Dr. Thomas Garcia", specialty: "Ophtalmologue", 
    address: "23 rue du Faubourg, 75010 Paris", distance: "3.1 km",
    rating: 4.6, reviews: 98, nextSlot: "24 Fév 11:00", 
    avatar: "TG", price: 40, languages: ["Français", "Portugais"],
    teleconsultation: true, conventionSecteur: 1,
    slots: ["11:00", "14:30", "15:30", "16:00"]
  },
  { 
    name: "Dr. Julie Bernard", specialty: "Pédiatre", 
    address: "56 rue de Rivoli, 75001 Paris", distance: "1.2 km",
    rating: 4.9, reviews: 312, nextSlot: "Aujourd'hui 16:00", 
    avatar: "JB", price: 35, languages: ["Français", "Anglais", "Allemand"],
    teleconsultation: true, conventionSecteur: 1,
    slots: ["16:00", "16:30", "17:00"]
  },
  { 
    name: "Dr. Claire Rousseau", specialty: "Gynécologue", 
    address: "15 rue de Sèvres, 75006 Paris", distance: "4.0 km",
    rating: 4.8, reviews: 421, nextSlot: "25 Fév 09:30", 
    avatar: "CR", price: 60, languages: ["Français"],
    teleconsultation: true, conventionSecteur: 2,
    slots: ["09:30", "11:00"]
  },
];

const SearchDoctors = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = selectedSpecialty === "Tous" 
    ? doctors 
    : doctors.filter(d => d.specialty === selectedSpecialty);

  return (
    <DashboardLayout role="patient" title="Rechercher un praticien">
      <div className="space-y-6">
        {/* Search bar - Doctolib style */}
        <div className="rounded-xl border bg-card p-4 shadow-card">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Médecin, spécialité, établissement..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Paris, 75002" className="pl-10 h-11" defaultValue="Paris, 75002" />
            </div>
            <Button className="gradient-primary text-primary-foreground h-11 px-6">
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </div>
          
          {/* Filters toggle */}
          <div className="flex items-center gap-2 mt-3">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="text-xs">
              <Filter className="h-3 w-3 mr-1" />Filtres
              <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Video className="h-3 w-3 mr-1" />Téléconsultation
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />Disponible aujourd'hui
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Euro className="h-3 w-3 mr-1" />Secteur 1
            </Button>
          </div>

          {showFilters && (
            <div className="mt-3 pt-3 border-t grid gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Tarif maximum</label>
                <Input type="number" placeholder="60 €" className="mt-1 h-9" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Langue</label>
                <Input placeholder="Français, Anglais..." className="mt-1 h-9" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Rayon (km)</label>
                <Input type="number" placeholder="5" className="mt-1 h-9" />
              </div>
            </div>
          )}
        </div>

        {/* Specialty chips */}
        <div className="flex flex-wrap gap-2">
          {specialties.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSpecialty(s)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                selectedSpecialty === s
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{filtered.length} praticien{filtered.length > 1 ? "s" : ""} trouvé{filtered.length > 1 ? "s" : ""}</p>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
              Trier par : Pertinence <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </div>
          
          {filtered.map((d, i) => (
            <div
              key={i}
              className="rounded-xl border bg-card shadow-card hover:shadow-card-hover transition-all"
            >
              <div className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
                      {d.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-foreground">{d.name}</h3>
                          <p className="text-sm text-primary font-medium">{d.specialty}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{d.address}
                        </span>
                        <span className="text-primary/60">·</span>
                        <span>{d.distance}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                          <span className="text-sm font-semibold text-foreground">{d.rating}</span>
                          <span className="text-xs text-muted-foreground">({d.reviews} avis)</span>
                        </div>
                        <span className="text-xs text-muted-foreground">· {d.price} € · Secteur {d.conventionSecteur}</span>
                        {d.teleconsultation && (
                          <span className="flex items-center gap-1 text-xs text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                            <Video className="h-3 w-3" />Téléconsultation
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Globe className="h-3 w-3" />
                        {d.languages.join(", ")}
                      </div>
                    </div>
                  </div>

                  {/* Availability column */}
                  <div className="sm:w-48 shrink-0">
                    <div className="flex items-center gap-1.5 mb-3">
                      <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                      <span className="text-xs font-medium text-accent">{d.nextSlot}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {d.slots.map(slot => (
                        <Link key={slot} to="/dashboard/patient/booking">
                          <button className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-all">
                            {slot}
                          </button>
                        </Link>
                      ))}
                    </div>
                    <Link to="/dashboard/patient/booking" className="block mt-3">
                      <Button className="w-full gradient-primary text-primary-foreground shadow-primary-glow" size="sm">
                        Prendre rendez-vous
                      </Button>
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
