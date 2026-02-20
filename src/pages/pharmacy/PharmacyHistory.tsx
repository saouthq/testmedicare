import DashboardLayout from "@/components/layout/DashboardLayout";
import { Clock, User, Pill, CheckCircle2 } from "lucide-react";

const history = [
  { id: "DEL-001", patient: "Marie Dupont", prescription: "ORD-2026-043", items: ["Ibuprofène 400mg", "Tramadol 50mg"], date: "17 Fév 2026", time: "14:30", pharmacist: "J. Dupont" },
  { id: "DEL-002", patient: "Sophie Moreau", prescription: "ORD-2026-042", items: ["Ventoline 100µg"], date: "15 Fév 2026", time: "10:15", pharmacist: "M. Martin" },
  { id: "DEL-003", patient: "Paul Petit", prescription: "ORD-2026-040", items: ["Paracétamol 1g", "Oméprazole 20mg"], date: "12 Fév 2026", time: "16:45", pharmacist: "J. Dupont" },
  { id: "DEL-004", patient: "Claire Moreau", prescription: "ORD-2026-038", items: ["Amoxicilline 500mg"], date: "10 Fév 2026", time: "09:00", pharmacist: "M. Martin" },
];

const PharmacyHistory = () => {
  return (
    <DashboardLayout role="pharmacy" title="Historique des délivrances">
      <div className="space-y-4">
        {history.map((h) => (
          <div key={h.id} className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{h.id}</h3>
                    <span className="text-sm text-muted-foreground">· {h.prescription}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{h.patient}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{h.date} à {h.time}</span>
                  </div>
                  <div className="mt-3 space-y-1">
                    {h.items.map((item, i) => (
                      <p key={i} className="text-sm text-foreground flex items-center gap-2">
                        <Pill className="h-3.5 w-3.5 text-primary" />{item}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">Par {h.pharmacist}</span>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default PharmacyHistory;
