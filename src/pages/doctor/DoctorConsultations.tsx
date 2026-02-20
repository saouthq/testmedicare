import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { ClipboardList, Plus, User, Calendar, FileText, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const consultations = [
  { patient: "Amine Ben Ali", date: "20 Fév 2026", time: "09:30", motif: "Suivi diabète", notes: "Glycémie stable, renouvellement traitement", prescriptions: 1, cnam: true, amount: "35 DT", avatar: "AB" },
  { patient: "Fatma Trabelsi", date: "20 Fév 2026", time: "09:00", motif: "Contrôle tension", notes: "TA 14/8, ajustement posologie", prescriptions: 1, cnam: true, amount: "35 DT", avatar: "FT" },
  { patient: "Mohamed Sfar", date: "18 Fév 2026", time: "14:00", motif: "Suivi post-opératoire", notes: "Cicatrisation normale, retrait fils J+15", prescriptions: 0, cnam: false, amount: "50 DT", avatar: "MS" },
  { patient: "Nadia Jemni", date: "17 Fév 2026", time: "10:30", motif: "Douleurs articulaires", notes: "Prescription anti-inflammatoires", prescriptions: 2, cnam: true, amount: "35 DT", avatar: "NJ" },
];

const DoctorConsultations = () => {
  const [filter, setFilter] = useState("today");
  return (
    <DashboardLayout role="doctor" title="Consultations">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 rounded-lg border bg-card p-1 w-fit">
            {[{ key: "today", label: "Aujourd'hui" }, { key: "week", label: "Cette semaine" }, { key: "all", label: "Tout" }].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{f.label}</button>
            ))}
          </div>
          <Link to="/dashboard/doctor/consultation/new">
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm"><Plus className="h-4 w-4 mr-2" />Nouvelle consultation</Button>
          </Link>
        </div>

        <div className="space-y-4">
          {consultations.map((c, i) => (
            <div key={i} className="rounded-xl border bg-card p-5 shadow-card hover:shadow-card-hover transition-all">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">{c.avatar}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{c.patient}</h3>
                        {c.cnam && <span className="flex items-center gap-1 text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium"><Shield className="h-3 w-3" />CNAM</span>}
                      </div>
                      <p className="text-sm text-muted-foreground">{c.date} à {c.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">{c.motif}</span>
                    <span className="text-sm font-bold text-foreground">{c.amount}</span>
                  </div>
                </div>
                <div className="ml-13 pl-[52px]">
                  <p className="text-sm text-foreground">{c.notes}</p>
                  {c.prescriptions > 0 && (
                    <div className="flex items-center gap-1 mt-2 text-sm text-primary"><FileText className="h-3.5 w-3.5" /><span>{c.prescriptions} ordonnance{c.prescriptions > 1 ? "s" : ""} générée{c.prescriptions > 1 ? "s" : ""}</span></div>
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
