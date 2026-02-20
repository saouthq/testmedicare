import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, Phone, Mail, Plus, ChevronRight, Calendar, Edit, FileText, Clock, AlertTriangle, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const patients = [
  { 
    name: "Marie Dupont", phone: "06 12 34 56 78", email: "marie@email.com", 
    lastVisit: "20 Fév 2026", doctor: "Dr. Martin", nextAppointment: "28 Fév 14:30",
    ssn: "2 91 03 75 ***", mutuelle: "MGEN", dob: "15/03/1991", avatar: "MD",
    balance: 0, notes: "Suivi diabète régulier"
  },
  { 
    name: "Jean Martin", phone: "06 98 76 54 32", email: "jean@email.com", 
    lastVisit: "18 Fév 2026", doctor: "Dr. Lefebvre", nextAppointment: "25 Fév 10:00",
    ssn: "1 70 07 75 ***", mutuelle: "Harmonie", dob: "12/07/1970", avatar: "JM",
    balance: 50, notes: "Hypertension — suivi cardio"
  },
  { 
    name: "Claire Petit", phone: "06 11 22 33 44", email: "claire@email.com", 
    lastVisit: "15 Fév 2026", doctor: "Dr. Martin", nextAppointment: null,
    ssn: "2 98 01 75 ***", mutuelle: "AXA", dob: "05/01/1998", avatar: "CP",
    balance: 0, notes: "Suivi grossesse T2"
  },
  { 
    name: "Luc Bernard", phone: "06 55 66 77 88", email: "luc@email.com", 
    lastVisit: "10 Fév 2026", doctor: "Dr. Durand", nextAppointment: "3 Mar 09:00",
    ssn: "1 59 11 75 ***", mutuelle: "MGEN", dob: "18/11/1959", avatar: "LB",
    balance: 25, notes: "Arthrose — anti-inflammatoires"
  },
  { 
    name: "Sophie Moreau", phone: "06 99 88 77 66", email: "sophie@email.com", 
    lastVisit: "8 Fév 2026", doctor: "Dr. Martin", nextAppointment: null,
    ssn: "2 84 06 75 ***", mutuelle: "Swiss Life", dob: "22/06/1984", avatar: "SM",
    balance: 0, notes: "Asthme léger"
  },
];

const SecretaryPatients = () => {
  const [search, setSearch] = useState("");
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<typeof patients[0] | null>(null);

  const filtered = patients.filter(p => 
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search)
  );

  return (
    <DashboardLayout role="secretary" title="Patients">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Rechercher un patient (nom, téléphone)..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 h-10" 
            />
          </div>
          <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm" onClick={() => setShowNewPatient(true)}>
            <Plus className="h-4 w-4 mr-1" />Nouveau patient
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Patient list */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border bg-card shadow-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-4 text-xs font-medium text-muted-foreground">Patient</th>
                    <th className="p-4 text-xs font-medium text-muted-foreground hidden md:table-cell">Médecin</th>
                    <th className="p-4 text-xs font-medium text-muted-foreground hidden sm:table-cell">Prochain RDV</th>
                    <th className="p-4 text-xs font-medium text-muted-foreground hidden lg:table-cell">Solde</th>
                    <th className="p-4 text-xs font-medium text-muted-foreground">Contact</th>
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
                          <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">
                            {p.avatar}
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{p.name}</p>
                            <p className="text-[11px] text-muted-foreground">{p.dob}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">{p.doctor}</td>
                      <td className="p-4 hidden sm:table-cell">
                        {p.nextAppointment ? (
                          <span className="text-xs text-accent font-medium flex items-center gap-1">
                            <Calendar className="h-3 w-3" />{p.nextAppointment}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Aucun</span>
                        )}
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        {p.balance > 0 ? (
                          <span className="text-xs font-semibold text-destructive">{p.balance} €</span>
                        ) : (
                          <span className="text-xs text-accent">Soldé</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Patient detail panel */}
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
                      <p className="text-xs text-muted-foreground">{selectedPatient.dob} · N° SS: {selectedPatient.ssn}</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-[10px] text-muted-foreground">Téléphone</p>
                      <p className="text-xs font-medium text-foreground">{selectedPatient.phone}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-[10px] text-muted-foreground">Email</p>
                      <p className="text-xs font-medium text-foreground truncate">{selectedPatient.email}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-[10px] text-muted-foreground">Mutuelle</p>
                      <p className="text-xs font-medium text-foreground">{selectedPatient.mutuelle}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-[10px] text-muted-foreground">Médecin</p>
                      <p className="text-xs font-medium text-foreground">{selectedPatient.doctor}</p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-[10px] text-muted-foreground">Notes</p>
                    <p className="text-xs text-foreground mt-1">{selectedPatient.notes}</p>
                  </div>
                  <div className="space-y-2 pt-2">
                    <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                      <Calendar className="h-3.5 w-3.5 mr-2 text-primary" />Planifier un RDV
                    </Button>
                    <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                      <FileText className="h-3.5 w-3.5 mr-2 text-warning" />Créer une facture
                    </Button>
                    <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                      <Edit className="h-3.5 w-3.5 mr-2 text-muted-foreground" />Modifier la fiche
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <FileText className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Sélectionnez un patient pour voir ses détails</p>
              </div>
            )}
          </div>
        </div>

        {/* New patient modal */}
        {showNewPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setShowNewPatient(false)}>
            <div className="bg-card rounded-2xl border shadow-elevated p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">Nouveau patient</h3>
                <button onClick={() => setShowNewPatient(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Prénom</Label><Input className="mt-1" placeholder="Prénom" /></div>
                  <div><Label className="text-xs">Nom</Label><Input className="mt-1" placeholder="Nom" /></div>
                  <div><Label className="text-xs">Date de naissance</Label><Input type="date" className="mt-1" /></div>
                  <div><Label className="text-xs">Téléphone</Label><Input className="mt-1" placeholder="06 ..." /></div>
                  <div><Label className="text-xs">Email</Label><Input type="email" className="mt-1" placeholder="email@..." /></div>
                  <div><Label className="text-xs">N° Sécurité sociale</Label><Input className="mt-1" placeholder="1 XX XX XX ..." /></div>
                  <div><Label className="text-xs">Mutuelle</Label><Input className="mt-1" placeholder="MGEN, Harmonie..." /></div>
                  <div><Label className="text-xs">Médecin traitant</Label>
                    <select className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm">
                      <option>Dr. Martin</option>
                      <option>Dr. Lefebvre</option>
                      <option>Dr. Durand</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Adresse</Label>
                  <Input className="mt-1" placeholder="Adresse complète" />
                </div>
                <div>
                  <Label className="text-xs">Notes / Antécédents</Label>
                  <textarea rows={2} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none" placeholder="Notes importantes..." />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowNewPatient(false)}>Annuler</Button>
                  <Button className="flex-1 gradient-primary text-primary-foreground" onClick={() => setShowNewPatient(false)}>Créer le patient</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SecretaryPatients;
