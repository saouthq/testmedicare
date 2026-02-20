import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search, MapPin, Star, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const specialties = ["Tous", "Généraliste", "Dentiste", "Cardiologue", "Dermatologue", "Ophtalmologue", "Pédiatre"];

const doctors = [
  { name: "Dr. Sophie Martin", specialty: "Médecin généraliste", address: "12 rue de la Paix, Paris 2e", rating: 4.8, reviews: 234, nextSlot: "Aujourd'hui 14:30", avatar: "SM" },
  { name: "Dr. Pierre Durand", specialty: "Cardiologue", address: "45 avenue Victor Hugo, Paris 16e", rating: 4.9, reviews: 187, nextSlot: "Demain 09:00", avatar: "PD" },
  { name: "Dr. Marie Lefebvre", specialty: "Dermatologue", address: "8 boulevard Haussmann, Paris 9e", rating: 4.7, reviews: 156, nextSlot: "23 Fév 10:30", avatar: "ML" },
  { name: "Dr. Thomas Garcia", specialty: "Ophtalmologue", address: "23 rue du Faubourg, Paris 10e", rating: 4.6, reviews: 98, nextSlot: "24 Fév 11:00", avatar: "TG" },
  { name: "Dr. Julie Bernard", specialty: "Pédiatre", address: "56 rue de Rivoli, Paris 1er", rating: 4.9, reviews: 312, nextSlot: "Aujourd'hui 16:00", avatar: "JB" },
];

const SearchDoctors = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <DashboardLayout role="patient" title="Rechercher un praticien">
      <div className="space-y-6">
        {/* Search bar */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Nom du praticien, spécialité..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Ville, code postal..." className="pl-10" />
          </div>
          <Button className="gradient-primary text-primary-foreground">
            <Search className="h-4 w-4 mr-2" />
            Rechercher
          </Button>
        </div>

        {/* Specialty filter */}
        <div className="flex flex-wrap gap-2">
          {specialties.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSpecialty(s)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-all ${
                selectedSpecialty === s
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{doctors.length} praticiens trouvés</p>
          {doctors.map((d, i) => (
            <div
              key={i}
              className="rounded-xl border bg-card p-5 shadow-card hover:shadow-card-hover transition-all animate-fade-in"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-lg shrink-0">
                    {d.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{d.name}</h3>
                    <p className="text-sm text-primary">{d.specialty}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{d.address}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                        <span className="text-sm font-medium text-foreground">{d.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">({d.reviews} avis)</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Calendar className="h-4 w-4 text-accent" />
                    <span className="text-accent font-medium">{d.nextSlot}</span>
                  </div>
                  <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm">
                    Prendre RDV
                  </Button>
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
