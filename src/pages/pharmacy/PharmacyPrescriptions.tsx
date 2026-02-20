import DashboardLayout from "@/components/layout/DashboardLayout";
import { FileText, Search, CheckCircle2, Clock, Pill } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const prescriptions = [
  { id: "ORD-2026-045", patient: "Marie Dupont", doctor: "Dr. Martin", date: "20 Fév", items: ["Metformine 850mg", "Glibenclamide 5mg"], status: "pending" },
  { id: "ORD-2026-044", patient: "Jean Martin", doctor: "Dr. Lefebvre", date: "20 Fév", items: ["Amlodipine 10mg"], status: "pending" },
  { id: "ORD-2026-043", patient: "Luc Bernard", doctor: "Dr. Durand", date: "17 Fév", items: ["Ibuprofène 400mg", "Tramadol 50mg"], status: "delivered" },
  { id: "ORD-2026-042", patient: "Sophie Moreau", doctor: "Dr. Martin", date: "15 Fév", items: ["Ventoline 100µg"], status: "delivered" },
];

const PharmacyPrescriptions = () => {
  return (
    <DashboardLayout role="pharmacy" title="Ordonnances">
      <div className="space-y-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher une ordonnance..." className="pl-10" />
        </div>

        <div className="space-y-4">
          {prescriptions.map((p) => (
            <div key={p.id} className="rounded-xl border bg-card p-5 shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`h-11 w-11 rounded-lg flex items-center justify-center shrink-0 ${
                    p.status === "pending" ? "bg-warning/10" : "bg-accent/10"
                  }`}>
                    {p.status === "pending" ? <Clock className="h-5 w-5 text-warning" /> : <CheckCircle2 className="h-5 w-5 text-accent" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{p.id}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        p.status === "pending" ? "bg-warning/10 text-warning" : "bg-accent/10 text-accent"
                      }`}>
                        {p.status === "pending" ? "En attente" : "Délivrée"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Patient: {p.patient} · Prescrit par {p.doctor} · {p.date}</p>
                    <div className="mt-3 space-y-1">
                      {p.items.map((item, i) => (
                        <p key={i} className="text-sm text-foreground flex items-center gap-2">
                          <Pill className="h-3.5 w-3.5 text-primary" />
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
                {p.status === "pending" && (
                  <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm">
                    Délivrer
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PharmacyPrescriptions;
