/**
 * PharmacyPatients — Patient list with prescription history per patient
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Users, Search, FileText, ChevronRight, Calendar, Pill, X, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PharmacyPatient {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  lastVisit: string;
  totalOrders: number;
  prescriptions: { id: string; date: string; doctor: string; items: string[]; status: string }[];
}

const mockPharmacyPatients: PharmacyPatient[] = [
  {
    id: "p1", name: "Amine Ben Ali", avatar: "AB", phone: "+216 71 234 567", lastVisit: "20 Fév 2026", totalOrders: 8,
    prescriptions: [
      { id: "ORD-2026-045", date: "20 Fév 2026", doctor: "Dr. Bouazizi", items: ["Metformine 850mg", "Glibenclamide 5mg", "Oméprazole 20mg"], status: "delivered" },
      { id: "ORD-2026-032", date: "15 Jan 2026", doctor: "Dr. Bouazizi", items: ["Metformine 850mg", "Amlodipine 5mg"], status: "delivered" },
      { id: "ORD-2025-180", date: "10 Déc 2025", doctor: "Dr. Trabelsi", items: ["Paracétamol 1g", "Amoxicilline 500mg"], status: "delivered" },
    ],
  },
  {
    id: "p2", name: "Fatma Chérif", avatar: "FC", phone: "+216 72 345 678", lastVisit: "18 Fév 2026", totalOrders: 3,
    prescriptions: [
      { id: "ORD-2026-041", date: "18 Fév 2026", doctor: "Dr. Trabelsi", items: ["Ventoline 100µg", "Fluticasone spray"], status: "ready_pickup" },
      { id: "ORD-2026-015", date: "05 Jan 2026", doctor: "Dr. Trabelsi", items: ["Ventoline 100µg"], status: "delivered" },
    ],
  },
  {
    id: "p3", name: "Mohamed Sfar", avatar: "MS", phone: "+216 73 456 789", lastVisit: "15 Fév 2026", totalOrders: 12,
    prescriptions: [
      { id: "ORD-2026-038", date: "15 Fév 2026", doctor: "Dr. Bouazizi", items: ["Losartan 50mg", "Bisoprolol 5mg", "Atorvastatine 20mg"], status: "delivered" },
      { id: "ORD-2026-020", date: "10 Jan 2026", doctor: "Dr. Bouazizi", items: ["Losartan 50mg", "Bisoprolol 5mg"], status: "delivered" },
    ],
  },
  {
    id: "p4", name: "Sami Ayari", avatar: "SA", phone: "+216 74 567 890", lastVisit: "12 Fév 2026", totalOrders: 5,
    prescriptions: [
      { id: "ORD-2026-035", date: "12 Fév 2026", doctor: "Dr. Meddeb", items: ["Ibuprofène 400mg", "Paracétamol 1g"], status: "delivered" },
    ],
  },
  {
    id: "p5", name: "Rania Meddeb", avatar: "RM", phone: "+216 75 678 901", lastVisit: "08 Fév 2026", totalOrders: 2,
    prescriptions: [
      { id: "ORD-2026-028", date: "08 Fév 2026", doctor: "Dr. Bouazizi", items: ["Lévothyroxine 50µg"], status: "delivered" },
    ],
  },
];

const statusLabel: Record<string, { label: string; cls: string }> = {
  delivered: { label: "Délivrée", cls: "bg-muted text-muted-foreground" },
  ready_pickup: { label: "Prête", cls: "bg-accent/10 text-accent" },
  received: { label: "Reçue", cls: "bg-warning/10 text-warning" },
  preparing: { label: "En prép.", cls: "bg-primary/10 text-primary" },
};

const PharmacyPatients = () => {
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PharmacyPatient | null>(null);

  const filtered = mockPharmacyPatients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search)
  );

  return (
    <DashboardLayout role="pharmacy" title="Mes patients">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un patient..." className="pl-9 h-9 w-64 text-xs" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{mockPharmacyPatients.length} patients</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Patient list */}
          <div className="rounded-xl border bg-card shadow-card">
            <div className="px-5 py-4 border-b">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />Liste des patients
              </h2>
            </div>
            <div className="divide-y">
              {filtered.map(p => (
                <button key={p.id} onClick={() => setSelectedPatient(p)}
                  className={`w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors text-left ${selectedPatient?.id === p.id ? "bg-primary/5" : ""}`}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">{p.avatar}</div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.phone} · {p.totalOrders} ordonnances</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">{p.lastVisit}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucun patient trouvé</p>
                </div>
              )}
            </div>
          </div>

          {/* Patient detail / prescription history */}
          <div className="rounded-xl border bg-card shadow-card">
            {selectedPatient ? (
              <>
                <div className="p-5 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{selectedPatient.avatar}</div>
                      <div>
                        <h3 className="font-semibold text-foreground">{selectedPatient.name}</h3>
                        <p className="text-xs text-muted-foreground">{selectedPatient.phone}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedPatient(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="flex gap-3 mt-3">
                    <div className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 text-center flex-1">
                      <p className="text-lg font-bold text-primary">{selectedPatient.totalOrders}</p>
                      <p className="text-[10px] text-muted-foreground">Ordonnances</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 px-3 py-2 text-center flex-1">
                      <p className="text-sm font-semibold text-foreground">{selectedPatient.lastVisit}</p>
                      <p className="text-[10px] text-muted-foreground">Dernière visite</p>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-primary" />Historique des ordonnances
                  </h4>
                  <div className="space-y-2">
                    {selectedPatient.prescriptions.map(rx => {
                      const s = statusLabel[rx.status] || statusLabel.delivered;
                      return (
                        <div key={rx.id} className="rounded-lg border p-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-semibold text-foreground">{rx.id}</span>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{rx.date} · {rx.doctor}</p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {rx.items.map((item, j) => (
                              <span key={j} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground flex items-center gap-0.5">
                                <Pill className="h-2.5 w-2.5" />{item}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Sélectionnez un patient</p>
                  <p className="text-xs mt-1">pour voir son historique d'ordonnances</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PharmacyPatients;
