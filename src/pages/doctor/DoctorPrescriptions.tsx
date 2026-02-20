import DashboardLayout from "@/components/layout/DashboardLayout";
import { FileText, Plus, Send, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

const prescriptions = [
  {
    id: "ORD-2026-045",
    patient: "Marie Dupont",
    date: "20 Fév 2026",
    items: ["Metformine 850mg - 2x/jour", "Glibenclamide 5mg - 1x/jour"],
    sent: true,
  },
  {
    id: "ORD-2026-044",
    patient: "Jean Martin",
    date: "20 Fév 2026",
    items: ["Amlodipine 10mg - 1x/jour"],
    sent: true,
  },
  {
    id: "ORD-2026-043",
    patient: "Luc Bernard",
    date: "17 Fév 2026",
    items: ["Ibuprofène 400mg - 3x/jour pendant 7 jours", "Tramadol 50mg - si douleur intense"],
    sent: false,
  },
];

const DoctorPrescriptions = () => {
  return (
    <DashboardLayout role="doctor" title="Ordonnances">
      <div className="space-y-6">
        <div className="flex items-center justify-end">
          <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle ordonnance
          </Button>
        </div>

        <div className="space-y-4">
          {prescriptions.map((p) => (
            <div key={p.id} className="rounded-xl border bg-card p-5 shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{p.id}</h3>
                      {p.sent ? (
                        <span className="rounded-full bg-accent/10 text-accent px-2.5 py-0.5 text-xs font-medium">Envoyée</span>
                      ) : (
                        <span className="rounded-full bg-warning/10 text-warning px-2.5 py-0.5 text-xs font-medium">Brouillon</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Patient: {p.patient} · {p.date}</p>
                    <div className="mt-3 space-y-1">
                      {p.items.map((item, i) => (
                        <p key={i} className="text-sm text-foreground flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!p.sent && (
                    <Button size="sm" className="gradient-primary text-primary-foreground">
                      <Send className="h-4 w-4 mr-1" />
                      Envoyer
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Printer className="h-4 w-4 mr-1" />
                    Imprimer
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

export default DoctorPrescriptions;
