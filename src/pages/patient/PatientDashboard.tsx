import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { 
  Calendar, Clock, FileText, Activity, ChevronRight, MapPin, 
  Video, Bell, Heart, Pill, Star, AlertTriangle, Phone,
  ArrowRight, Plus, CheckCircle2, TrendingUp, Stethoscope
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const upcomingAppointments = [
  { 
    id: 1, doctor: "Dr. Sophie Martin", specialty: "Médecin généraliste", 
    date: "Aujourd'hui", time: "14:30", type: "cabinet",
    address: "12 rue de la Paix, 75002 Paris", avatar: "SM",
    status: "confirmed", motif: "Suivi diabète"
  },
  { 
    id: 2, doctor: "Dr. Pierre Durand", specialty: "Cardiologue", 
    date: "23 Fév", time: "10:00", type: "cabinet",
    address: "45 av. Victor Hugo, Paris 16e", avatar: "PD",
    status: "confirmed", motif: "Bilan cardiaque annuel"
  },
  { 
    id: 3, doctor: "Dr. Marie Lefebvre", specialty: "Dermatologue", 
    date: "28 Fév", time: "16:15", type: "teleconsultation",
    address: "", avatar: "ML",
    status: "pending", motif: "Consultation dermatologie"
  },
];

const recentPrescriptions = [
  { id: "ORD-045", doctor: "Dr. Martin", date: "10 Fév", items: 3, status: "active" },
  { id: "ORD-042", doctor: "Dr. Durand", date: "3 Fév", items: 1, status: "active" },
];

const notifications = [
  { id: 1, type: "appointment", text: "Rappel : RDV avec Dr. Martin demain à 14h30", time: "1h", unread: true },
  { id: 2, type: "result", text: "Résultats d'analyses disponibles", time: "3h", unread: true },
  { id: 3, type: "message", text: "Dr. Durand vous a envoyé un message", time: "5h", unread: false },
];

const healthSummary = {
  nextCheckup: "10 Mai 2026",
  vaccinations: 2,
  allergies: ["Pénicilline"],
  bloodType: "A+",
  treatingDoctor: "Dr. Sophie Martin",
};

const PatientDashboard = () => {
  return (
    <DashboardLayout role="patient" title="Tableau de bord">
      <div className="space-y-6">
        {/* Welcome banner */}
        <div className="relative overflow-hidden rounded-2xl gradient-primary p-6 text-primary-foreground">
          <div className="relative z-10">
            <p className="text-primary-foreground/80 text-sm">Bonjour,</p>
            <h2 className="text-2xl font-bold mt-1">Jean Dupont</h2>
            <p className="text-primary-foreground/80 mt-2 text-sm max-w-md">
              Vous avez <span className="font-semibold text-primary-foreground">1 rendez-vous aujourd'hui</span> et 
              <span className="font-semibold text-primary-foreground"> 2 résultats d'analyses</span> en attente.
            </p>
            <div className="flex gap-3 mt-4">
              <Link to="/dashboard/patient/search">
                <Button size="sm" variant="secondary" className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0 backdrop-blur-sm">
                  <Plus className="h-4 w-4 mr-1.5" />Prendre un RDV
                </Button>
              </Link>
              <Link to="/dashboard/patient/records">
                <Button size="sm" variant="secondary" className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20 backdrop-blur-sm">
                  Mon dossier médical
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 right-20 w-32 h-32 bg-primary-foreground/5 rounded-full translate-y-1/2" />
        </div>

        {/* Quick stats row */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-4 shadow-card hover:shadow-card-hover transition-all group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Prochain RDV</p>
                <p className="text-sm font-bold text-foreground">Aujourd'hui 14h30</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-card hover:shadow-card-hover transition-all group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">RDV à venir</p>
                <p className="text-sm font-bold text-foreground">3 rendez-vous</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-card hover:shadow-card-hover transition-all group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ordonnances</p>
                <p className="text-sm font-bold text-foreground">2 actives</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-card hover:shadow-card-hover transition-all group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Analyses</p>
                <p className="text-sm font-bold text-foreground">2 résultats</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Upcoming appointments - main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border bg-card shadow-card">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Prochains rendez-vous
                </h2>
                <Link to="/dashboard/patient/appointments" className="text-sm text-primary hover:underline flex items-center gap-1">
                  Voir tout <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="divide-y">
                {upcomingAppointments.map((a) => (
                  <div key={a.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm shrink-0">
                        {a.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-foreground text-sm">{a.doctor}</h3>
                            <p className="text-xs text-primary">{a.specialty}</p>
                          </div>
                          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium shrink-0 ${
                            a.status === "confirmed" ? "bg-accent/10 text-accent" : "bg-warning/10 text-warning"
                          }`}>
                            {a.status === "confirmed" ? "✓ Confirmé" : "⏳ En attente"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />{a.date} à {a.time}
                          </span>
                          <span className="flex items-center gap-1">
                            {a.type === "teleconsultation" ? (
                              <><Video className="h-3 w-3 text-primary" />Téléconsultation</>
                            ) : (
                              <><MapPin className="h-3 w-3" />{a.address}</>
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="font-medium text-foreground/70">Motif :</span> {a.motif}
                        </p>
                        <div className="flex gap-2 mt-3">
                          {a.type === "teleconsultation" && a.date === "Aujourd'hui" && (
                            <Button size="sm" className="h-7 text-xs gradient-primary text-primary-foreground">
                              <Video className="h-3 w-3 mr-1" />Rejoindre
                            </Button>
                          )}
                          <Button variant="outline" size="sm" className="h-7 text-xs">
                            Détails
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/5">
                            Annuler
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent prescriptions */}
            <div className="rounded-xl border bg-card shadow-card">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Pill className="h-4 w-4 text-warning" />
                  Ordonnances récentes
                </h2>
                <Link to="/dashboard/patient/prescriptions" className="text-sm text-primary hover:underline flex items-center gap-1">
                  Voir tout <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="divide-y">
                {recentPrescriptions.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{p.id}</p>
                        <p className="text-xs text-muted-foreground">{p.doctor} · {p.date} · {p.items} médicament(s)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-accent/10 text-accent px-2 py-0.5 text-[11px] font-medium">Active</span>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">Voir</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Health card */}
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                Mon profil santé
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Groupe sanguin</span>
                  <span className="font-medium text-foreground bg-primary/10 px-2 py-0.5 rounded text-xs">{healthSummary.bloodType}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Médecin traitant</span>
                  <span className="font-medium text-foreground text-xs">{healthSummary.treatingDoctor}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Allergies</span>
                  <span className="flex items-center gap-1 text-destructive text-xs font-medium">
                    <AlertTriangle className="h-3 w-3" />{healthSummary.allergies.join(", ")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Vaccins à jour</span>
                  <span className="flex items-center gap-1 text-accent text-xs font-medium">
                    <CheckCircle2 className="h-3 w-3" />{healthSummary.vaccinations} à renouveler
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <Link to="/dashboard/patient/records">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Voir mon dossier complet <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="rounded-xl border bg-card shadow-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  Notifications
                </h3>
                <Link to="/dashboard/patient/notifications" className="text-xs text-primary hover:underline">
                  Tout voir
                </Link>
              </div>
              <div className="space-y-3">
                {notifications.map(n => (
                  <div key={n.id} className={`flex gap-3 text-sm ${n.unread ? "" : "opacity-60"}`}>
                    <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${n.unread ? "bg-primary" : "bg-muted-foreground/30"}`} />
                    <div>
                      <p className={`text-foreground text-xs ${n.unread ? "font-medium" : ""}`}>{n.text}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Il y a {n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-semibold text-foreground mb-4">Actions rapides</h3>
              <div className="grid grid-cols-2 gap-2">
                <Link to="/dashboard/patient/search" className="flex flex-col items-center gap-2 rounded-xl border p-4 hover:bg-muted/50 hover:border-primary/30 transition-all text-center group">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Stethoscope className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-foreground">Trouver un praticien</span>
                </Link>
                <Link to="/dashboard/patient/booking" className="flex flex-col items-center gap-2 rounded-xl border p-4 hover:bg-muted/50 hover:border-primary/30 transition-all text-center group">
                  <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calendar className="h-5 w-5 text-accent" />
                  </div>
                  <span className="text-xs font-medium text-foreground">Prendre RDV</span>
                </Link>
                <Link to="/dashboard/patient/prescriptions" className="flex flex-col items-center gap-2 rounded-xl border p-4 hover:bg-muted/50 hover:border-primary/30 transition-all text-center group">
                  <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="h-5 w-5 text-warning" />
                  </div>
                  <span className="text-xs font-medium text-foreground">Ordonnances</span>
                </Link>
                <Link to="/dashboard/patient/messages" className="flex flex-col items-center gap-2 rounded-xl border p-4 hover:bg-muted/50 hover:border-primary/30 transition-all text-center group">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-foreground">Messagerie</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
