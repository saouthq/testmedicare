import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { 
  Building2, Users, Clock, Settings, MapPin, Phone, Mail, 
  Calendar, TrendingUp, AlertTriangle, CheckCircle2, 
  Stethoscope, Shield, Banknote, BarChart3, Globe, Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";

const doctors = [
  { name: "Dr. Ahmed Bouazizi", specialty: "Médecin généraliste", status: "available", patients: 12, phone: "+216 71 234 567", conventionCNAM: true },
  { name: "Dr. Sonia Gharbi", specialty: "Cardiologue", status: "in_consultation", patients: 8, phone: "+216 71 234 568", conventionCNAM: true },
  { name: "Dr. Khaled Hammami", specialty: "Dermatologue", status: "absent", patients: 0, phone: "+216 71 234 569", conventionCNAM: true },
];

const officeInfo = {
  name: "Cabinet Médical El Manar",
  address: "15 Avenue de la Liberté, El Manar, 2092 Tunis",
  phone: "+216 71 234 567",
  fax: "+216 71 234 568",
  email: "contact@cabinet-elmanar.tn",
  openingHours: "Lun-Ven: 8h-18h / Sam: 8h-13h",
  conventionCNAM: true,
  registreCommerce: "B12345678",
};

const statusConfig: Record<string, { label: string; class: string }> = {
  available: { label: "Disponible", class: "bg-accent/10 text-accent" },
  in_consultation: { label: "En consultation", class: "bg-primary/10 text-primary" },
  absent: { label: "Absent", class: "bg-muted text-muted-foreground" },
};

const weeklyStats = [
  { label: "RDV cette semaine", value: "87", icon: Calendar, color: "bg-primary/10 text-primary", trend: "+12%" },
  { label: "Taux d'occupation", value: "82%", icon: TrendingUp, color: "bg-accent/10 text-accent", trend: "+5%" },
  { label: "Taux d'annulation", value: "4.2%", icon: AlertTriangle, color: "bg-warning/10 text-warning", trend: "-1%" },
  { label: "Nouveaux patients/mois", value: "23", icon: Users, color: "bg-primary/10 text-primary", trend: "+3" },
];

const equipment = [
  { name: "ECG 12 dérivations", status: "ok", lastMaintenance: "Jan 2026" },
  { name: "Tensiomètre électronique", status: "ok", lastMaintenance: "Fév 2026" },
  { name: "Échographe portable", status: "maintenance", lastMaintenance: "Nov 2025" },
  { name: "Oxymètre de pouls", status: "ok", lastMaintenance: "Fév 2026" },
];

const SecretaryOffice = () => {
  return (
    <DashboardLayout role="secretary" title="Gestion du cabinet">
      <div className="space-y-6">
        {/* Office info */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                <Building2 className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground">{officeInfo.name}</h2>
                  {officeInfo.conventionCNAM && (
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                      <Shield className="h-3 w-3" />Conventionné CNAM
                    </span>
                  )}
                </div>
                <div className="mt-2 space-y-1.5 text-sm">
                  <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4 shrink-0" />{officeInfo.address}</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4 shrink-0" />{officeInfo.phone} · Fax: {officeInfo.fax}</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4 shrink-0" />{officeInfo.email}</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4 shrink-0" />{officeInfo.openingHours}</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><Globe className="h-4 w-4 shrink-0" />RC: {officeInfo.registreCommerce}</p>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm"><Edit className="h-4 w-4 mr-2" />Modifier</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {weeklyStats.map(s => (
            <div key={s.label} className="rounded-xl border bg-card p-4 shadow-card hover:shadow-card-hover transition-all">
              <div className="flex items-center justify-between">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-[11px] text-accent mt-1">{s.trend}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Doctors */}
          <div className="rounded-xl border bg-card shadow-card">
            <div className="border-b px-5 py-4 flex items-center justify-between">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary" />
                Médecins du cabinet
              </h2>
              <Button variant="outline" size="sm" className="text-xs">Gérer</Button>
            </div>
            <div className="divide-y">
              {doctors.map((d, i) => (
                <div key={i} className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="h-11 w-11 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                        {d.name.split(". ")[1]?.[0] || "D"}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${
                        d.status === "available" ? "bg-accent" : d.status === "in_consultation" ? "bg-primary" : "bg-muted-foreground"
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground text-sm">{d.name}</p>
                        {d.conventionCNAM && <Shield className="h-3 w-3 text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{d.specialty} · {d.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground hidden sm:block">{d.patients} patients</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[d.status].class}`}>
                      {statusConfig[d.status].label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div className="rounded-xl border bg-card shadow-card">
            <div className="border-b px-5 py-4 flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Équipements</h2>
              <Button variant="outline" size="sm" className="text-xs">Ajouter</Button>
            </div>
            <div className="divide-y">
              {equipment.map((e, i) => (
                <div key={i} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{e.name}</p>
                    <p className="text-xs text-muted-foreground">Dernière maintenance : {e.lastMaintenance}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    e.status === "ok" ? "bg-accent/10 text-accent" : "bg-warning/10 text-warning"
                  }`}>
                    {e.status === "ok" ? "Opérationnel" : "En maintenance"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Financial summary */}
        <div className="rounded-xl border bg-card shadow-card p-5">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Banknote className="h-4 w-4 text-accent" />
            Résumé financier du mois
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-xs text-muted-foreground">Total facturé</p>
              <p className="text-xl font-bold text-foreground mt-1">8 450 DT</p>
            </div>
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-center">
              <p className="text-xs text-primary font-medium">Part CNAM</p>
              <p className="text-xl font-bold text-foreground mt-1">5 915 DT</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-xs text-muted-foreground">Paiement direct</p>
              <p className="text-xl font-bold text-foreground mt-1">1 690 DT</p>
            </div>
            <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-4 text-center">
              <p className="text-xs text-destructive font-medium">Impayés</p>
              <p className="text-xl font-bold text-destructive mt-1">320 DT</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SecretaryOffice;
