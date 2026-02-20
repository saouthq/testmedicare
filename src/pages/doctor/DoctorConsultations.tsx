import DashboardLayout from "@/components/layout/DashboardLayout";
import { ClipboardList, Plus, User, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const consultations = [
  { patient: "Marie Dupont", date: "20 Fév 2026", time: "09:30", motif: "Suivi diabète", notes: "Glycémie stable, renouvellement traitement", prescriptions: 1 },
  { patient: "Jean Martin", date: "20 Fév 2026", time: "09:00", motif: "Contrôle tension", notes: "TA 14/8, ajustement posologie", prescriptions: 1 },
  { patient: "Claire Petit", date: "18 Fév 2026", time: "14:00", motif: "Suivi grossesse", notes: "Échographie T2 RAS", prescriptions: 0 },
  { patient: "Luc Bernard", date: "17 Fév 2026", time: "10:30", motif: "Douleurs articulaires", notes: "Prescription anti-inflammatoires", prescriptions: 2 },
];

const DoctorConsultations = () => {
  return (
    <DashboardLayout role="doctor" title="Consultations">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 rounded-lg border bg-card p-1 w-fit">
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Aujourd'hui</button>
            <button className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cette semaine</button>
            <button className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Tout</button>
          </div>
          <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle consultation
          </Button>
        </div>

        <div className="space-y-4">
          {consultations.map((c, i) => (
            <div key={i} className="rounded-xl border bg-card p-5 shadow-card hover:shadow-card-hover transition-all">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{c.patient}</h3>
                      <p className="text-sm text-muted-foreground">{c.date} à {c.time}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">{c.motif}</span>
                </div>
                <div className="ml-13 pl-[52px]">
                  <p className="text-sm text-foreground">{c.notes}</p>
                  {c.prescriptions > 0 && (
                    <div className="flex items-center gap-1 mt-2 text-sm text-primary">
                      <FileText className="h-3.5 w-3.5" />
                      <span>{c.prescriptions} ordonnance{c.prescriptions > 1 ? "s" : ""} générée{c.prescriptions > 1 ? "s" : ""}</span>
                    </div>
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

export default DoctorConsultations;
