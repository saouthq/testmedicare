import DashboardLayout from "@/components/layout/DashboardLayout";
import { FileText, Download, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const prescriptions = [
  { id: "ORD-2026-001", doctor: "Dr. Sophie Martin", date: "10 Fév 2026", items: ["Amoxicilline 500mg", "Paracétamol 1g", "Ibuprofène 400mg"], status: "active" },
  { id: "ORD-2026-002", doctor: "Dr. Pierre Durand", date: "3 Fév 2026", items: ["Metformine 850mg"], status: "active" },
  { id: "ORD-2025-045", doctor: "Dr. Marie Lefebvre", date: "15 Déc 2025", items: ["Crème dermocorticoïde", "Lotion hydratante"], status: "expired" },
  { id: "ORD-2025-038", doctor: "Dr. Sophie Martin", date: "20 Nov 2025", items: ["Oméprazole 20mg", "Gaviscon"], status: "expired" },
];

const PatientPrescriptions = () => {
  return (
    <DashboardLayout role="patient" title="Mes ordonnances">
      <div className="space-y-6">
        <div className="flex gap-1 rounded-lg border bg-card p-1 w-fit">
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Toutes
          </button>
          <button className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Actives
          </button>
          <button className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Expirées
          </button>
        </div>

        <div className="space-y-4">
          {prescriptions.map((p) => (
            <div key={p.id} className="rounded-xl border bg-card p-5 shadow-card">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className={`h-11 w-11 rounded-lg flex items-center justify-center shrink-0 ${
                    p.status === "active" ? "bg-accent/10" : "bg-muted"
                  }`}>
                    <FileText className={`h-5 w-5 ${p.status === "active" ? "text-accent" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{p.id}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        p.status === "active" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                      }`}>
                        {p.status === "active" ? "Active" : "Expirée"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{p.doctor} · {p.date}</p>
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
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    PDF
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

export default PatientPrescriptions;
