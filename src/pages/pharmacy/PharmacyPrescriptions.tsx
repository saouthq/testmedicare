import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { FileText, Search, CheckCircle2, Clock, Pill, Eye, Printer, Shield, AlertCircle, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const prescriptions = [
  { id: "ORD-2026-045", patient: "Amine Ben Ali", doctor: "Dr. Bouazizi", date: "20 Fév", items: ["Metformine 850mg", "Glibenclamide 5mg"], status: "pending", total: "45 DT", cnam: true, avatar: "AB" },
  { id: "ORD-2026-044", patient: "Fatma Trabelsi", doctor: "Dr. Gharbi", date: "20 Fév", items: ["Amlodipine 10mg"], status: "pending", total: "28 DT", cnam: true, avatar: "FT" },
  { id: "ORD-2026-043", patient: "Mohamed Sfar", doctor: "Dr. Hammami", date: "17 Fév", items: ["Ibuprofène 400mg", "Tramadol 50mg"], status: "delivered", total: "35 DT", cnam: false, avatar: "MS" },
  { id: "ORD-2026-042", patient: "Nadia Jemni", doctor: "Dr. Bouazizi", date: "15 Fév", items: ["Ventoline 100µg"], status: "delivered", total: "22 DT", cnam: true, avatar: "NJ" },
  { id: "ORD-2026-041", patient: "Sami Ayari", doctor: "Dr. Bouazizi", date: "14 Fév", items: ["Paracétamol 1g", "Oméprazole 20mg", "Amoxicilline 500mg"], status: "delivered", total: "38 DT", cnam: true, avatar: "SA" },
  { id: "ORD-2026-040", patient: "Rania Meddeb", doctor: "Dr. Gharbi", date: "12 Fév", items: ["Bisoprolol 5mg"], status: "delivered", total: "18 DT", cnam: true, avatar: "RM" },
];

const PharmacyPrescriptions = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = prescriptions.filter(p => {
    if (filter === "pending" && p.status !== "pending") return false;
    if (filter === "delivered" && p.status !== "delivered") return false;
    if (search && !p.patient.toLowerCase().includes(search.toLowerCase()) && !p.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout role="pharmacy" title="Ordonnances">
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1 rounded-lg border bg-card p-0.5">
              {[
                { key: "all", label: "Toutes" },
                { key: "pending", label: "En attente" },
                { key: "delivered", label: "Délivrées" },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Rechercher une ordonnance..." 
                className="pl-9 h-9 w-56 text-xs"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{filtered.length} ordonnance(s)</p>
        </div>

        <div className="space-y-4">
          {filtered.map((p) => (
            <div key={p.id} className="rounded-xl border bg-card p-5 shadow-card hover:shadow-card-hover transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`h-11 w-11 rounded-lg flex items-center justify-center shrink-0 ${
                    p.status === "pending" ? "bg-warning/10" : "bg-accent/10"
                  }`}>
                    {p.status === "pending" ? <Clock className="h-5 w-5 text-warning" /> : <CheckCircle2 className="h-5 w-5 text-accent" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{p.id}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        p.status === "pending" ? "bg-warning/10 text-warning" : "bg-accent/10 text-accent"
                      }`}>
                        {p.status === "pending" ? "En attente" : "Délivrée"}
                      </span>
                      {p.cnam && (
                        <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          <Shield className="h-3 w-3" />CNAM
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />{p.patient} · Prescrit par {p.doctor} · {p.date}
                    </p>
                    <div className="mt-3 space-y-1">
                      {p.items.map((item, i) => (
                        <p key={i} className="text-sm text-foreground flex items-center gap-2">
                          <Pill className="h-3.5 w-3.5 text-primary" />
                          {item}
                        </p>
                      ))}
                    </div>
                    <p className="text-sm font-bold text-foreground mt-3">{p.total}</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" className="text-xs">
                    <Eye className="h-3.5 w-3.5 mr-1" />Détails
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Printer className="h-3.5 w-3.5 mr-1" />Imprimer
                  </Button>
                  {p.status === "pending" && (
                    <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm">
                      Délivrer
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PharmacyPrescriptions;
