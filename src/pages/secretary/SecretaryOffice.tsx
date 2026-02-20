import DashboardLayout from "@/components/layout/DashboardLayout";
import { Building2, Users, Clock, Settings, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const doctors = [
  { name: "Dr. Sophie Martin", specialty: "Médecin généraliste", status: "available", patients: 12 },
  { name: "Dr. Pierre Lefebvre", specialty: "Cardiologue", status: "in_consultation", patients: 8 },
  { name: "Dr. Marc Durand", specialty: "Dermatologue", status: "absent", patients: 0 },
];

const officeInfo = {
  name: "Cabinet Médical Saint-Honoré",
  address: "12 rue de la Paix, 75002 Paris",
  phone: "01 42 60 12 34",
  email: "contact@cabinet-st-honore.fr",
  openingHours: "Lun-Ven: 8h-19h / Sam: 8h-12h",
};

const statusConfig: Record<string, { label: string; class: string }> = {
  available: { label: "Disponible", class: "bg-accent/10 text-accent" },
  in_consultation: { label: "En consultation", class: "bg-primary/10 text-primary" },
  absent: { label: "Absent", class: "bg-muted text-muted-foreground" },
};

const SecretaryOffice = () => {
  return (
    <DashboardLayout role="secretary" title="Gestion du cabinet">
      <div className="space-y-6">
        {/* Office info */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{officeInfo.name}</h2>
                <div className="mt-2 space-y-1.5 text-sm">
                  <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" />{officeInfo.address}</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" />{officeInfo.phone}</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" />{officeInfo.email}</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" />{officeInfo.openingHours}</p>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm"><Settings className="h-4 w-4 mr-2" />Modifier</Button>
          </div>
        </div>

        {/* Doctors */}
        <div className="rounded-xl border bg-card shadow-card">
          <div className="border-b p-5">
            <h2 className="font-semibold text-foreground">Médecins du cabinet</h2>
          </div>
          <div className="divide-y">
            {doctors.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                    {d.name.split(" ")[1][0]}{d.name.split(" ")[2]?.[0] || ""}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{d.name}</p>
                    <p className="text-sm text-muted-foreground">{d.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">{d.patients} patients aujourd'hui</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[d.status].class}`}>
                    {statusConfig[d.status].label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">RDV cette semaine</p>
            <p className="text-2xl font-bold text-foreground mt-2">87</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Taux d'annulation</p>
            <p className="text-2xl font-bold text-foreground mt-2">4.2%</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Nouveaux patients/mois</p>
            <p className="text-2xl font-bold text-foreground mt-2">23</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SecretaryOffice;
