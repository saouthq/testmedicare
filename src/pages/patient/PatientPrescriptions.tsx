import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { FileText, Download, Eye, Pill, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const prescriptions = [
  { id: "ORD-2026-045", doctor: "Dr. Bouazizi", date: "10 Fév 2026", items: ["Metformine 850mg", "Glibenclamide 5mg"], status: "active", total: "45 DT", cnam: true },
  { id: "ORD-2026-042", doctor: "Dr. Gharbi", date: "3 Fév 2026", items: ["Amlodipine 10mg"], status: "active", total: "28 DT", cnam: true },
  { id: "ORD-2025-038", doctor: "Dr. Hammami", date: "15 Déc 2025", items: ["Crème dermocorticoïde", "Lotion hydratante"], status: "expired", total: "35 DT", cnam: true },
  { id: "ORD-2025-032", doctor: "Dr. Bouazizi", date: "20 Nov 2025", items: ["Oméprazole 20mg", "Gaviscon"], status: "expired", total: "22 DT", cnam: false },
];

const PatientPrescriptions = () => {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? prescriptions : prescriptions.filter(p => p.status === filter);

  return (
    <DashboardLayout role="patient" title="Mes ordonnances">
      <div className="space-y-6">
        <div className="flex gap-1 rounded-lg border bg-card p-1 w-fit">
          {[{ key: "all", label: "Toutes" }, { key: "active", label: "Actives" }, { key: "expired", label: "Expirées" }].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.map((p) => (
            <div key={p.id} className="rounded-xl border bg-card p-5 shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`h-11 w-11 rounded-lg flex items-center justify-center shrink-0 ${p.status === "active" ? "bg-accent/10" : "bg-muted"}`}>
                    <FileText className={`h-5 w-5 ${p.status === "active" ? "text-accent" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{p.id}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${p.status === "active" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                        {p.status === "active" ? "Active" : "Expirée"}
                      </span>
                      {p.cnam && (
                        <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium"><Shield className="h-3 w-3" />CNAM</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{p.doctor} · {p.date}</p>
                    <div className="mt-3 space-y-1">
                      {p.items.map((item, i) => (
                        <p key={i} className="text-sm text-foreground flex items-center gap-2"><Pill className="h-3.5 w-3.5 text-primary" />{item}</p>
                      ))}
                    </div>
                    <p className="text-sm font-bold text-foreground mt-2">{p.total}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" />Voir</Button>
                  <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />PDF</Button>
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
