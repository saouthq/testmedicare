import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, User, Calendar, FileText, FlaskConical, Phone, Eye, Shield, ChevronRight, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockLabPatients } from "@/data/mockData";

const statusConfig: Record<string, { label: string; class: string }> = {
  in_progress: { label: "En cours", class: "bg-primary/10 text-primary" },
  ready: { label: "Prêt", class: "bg-accent/10 text-accent" },
  waiting: { label: "En attente", class: "bg-warning/10 text-warning" },
};

const LaboratoryPatients = () => {
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<typeof mockLabPatients[0] | null>(null);

  const filtered = mockLabPatients.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search)
  );

  return (
    <DashboardLayout role="laboratory" title="Patients">
      <div className="space-y-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Rechercher un patient..." 
            className="pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border bg-card shadow-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-4 text-xs font-medium text-muted-foreground">Patient</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground hidden sm:table-cell">Dernière analyse</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground hidden md:table-cell">Date</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground">Statut</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((p, i) => (
                  <tr 
                    key={i} 
                    className={`hover:bg-muted/30 transition-colors cursor-pointer ${selectedPatient?.name === p.name ? "bg-primary/5" : ""}`}
                    onClick={() => setSelectedPatient(p)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                          {p.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-foreground text-sm">{p.name}</span>
                            {p.cnam && <Shield className="h-3 w-3 text-primary" />}
                          </div>
                          <span className="text-[11px] text-muted-foreground">{p.age} ans</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground hidden sm:table-cell">{p.lastAnalysis}</td>
                    <td className="p-4 text-xs text-muted-foreground hidden md:table-cell">{p.date}</td>
                    <td className="p-4">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusConfig[p.status].class}`}>
                        {statusConfig[p.status].label}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-semibold text-foreground">{p.total}</span>
                      <span className="text-xs text-muted-foreground"> analyses</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Patient detail */}
          <div className="rounded-xl border bg-card shadow-card">
            {selectedPatient ? (
              <div>
                <div className="p-5 border-b">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                      {selectedPatient.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{selectedPatient.name}</h3>
                      <p className="text-xs text-muted-foreground">{selectedPatient.age} ans</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-[10px] text-muted-foreground">Téléphone</p>
                      <p className="text-xs font-medium text-foreground">{selectedPatient.phone}</p>
                    </div>
                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                      <p className="text-[10px] text-primary font-medium flex items-center gap-1"><Shield className="h-3 w-3" />Assurance</p>
                      <p className="text-xs font-semibold text-foreground">{selectedPatient.cnam ? "CNAM" : "Privée"}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-[10px] text-muted-foreground">Total analyses</p>
                      <p className="text-xs font-bold text-foreground">{selectedPatient.total}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-[10px] text-muted-foreground">Dernière</p>
                      <p className="text-xs font-medium text-foreground">{selectedPatient.lastAnalysis}</p>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                      <FlaskConical className="h-3.5 w-3.5 mr-2 text-primary" />Nouvelle analyse
                    </Button>
                    <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                      <FileText className="h-3.5 w-3.5 mr-2 text-accent" />Voir les résultats
                    </Button>
                    <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                      <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />Appeler
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <FlaskConical className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Sélectionnez un patient pour voir ses détails</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LaboratoryPatients;