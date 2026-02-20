import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Calendar, Clock, FileText, Activity, ChevronRight, MapPin, 
  Video, Heart, Pill, Star, AlertTriangle,
  ArrowRight, Plus, CheckCircle2, Stethoscope, Shield, Search
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const upcomingAppointments = [
  { id: 1, doctor: "Dr. Ahmed Bouazizi", specialty: "Médecin généraliste", date: "Aujourd'hui", time: "14:30", type: "cabinet", address: "15 Av. de la Liberté, El Manar", avatar: "AB", status: "confirmed", motif: "Suivi diabète" },
  { id: 2, doctor: "Dr. Sonia Gharbi", specialty: "Cardiologue", date: "23 Fév", time: "10:00", type: "cabinet", address: "32 Rue Charles de Gaulle, Ariana", avatar: "SG", status: "confirmed", motif: "Bilan cardiaque" },
  { id: 3, doctor: "Dr. Khaled Hammami", specialty: "Dermatologue", date: "28 Fév", time: "16:15", type: "teleconsultation", address: "", avatar: "KH", status: "pending", motif: "Consultation dermatologie" },
];

const recentPrescriptions = [
  { id: "ORD-045", doctor: "Dr. Bouazizi", date: "10 Fév", items: 3, status: "active" },
  { id: "ORD-042", doctor: "Dr. Gharbi", date: "3 Fév", items: 1, status: "active" },
];

const favoriteDoctors = [
  { name: "Dr. Bouazizi", specialty: "Généraliste", avatar: "AB", id: 1 },
  { name: "Dr. Gharbi", specialty: "Cardiologue", avatar: "SG", id: 2 },
  { name: "Dr. Hammami", specialty: "Dermatologue", avatar: "KH", id: 3 },
];

const healthSummary = {
  bloodType: "A+",
  treatingDoctor: "Dr. Ahmed Bouazizi",
  cnam: true,
  cnamId: "12345678",
  allergies: ["Pénicilline"],
  vaccinations: 2,
};

const PatientDashboard = () => {
  return (
    <DashboardLayout role="patient" title="Tableau de bord">
      <div className="space-y-5">
        {/* Welcome banner with search bar */}
        <div className="relative overflow-hidden rounded-2xl gradient-primary p-5 sm:p-6 text-primary-foreground">
          <div className="relative z-10">
            <p className="text-primary-foreground/80 text-sm">Bonjour,</p>
            <h2 className="text-xl sm:text-2xl font-bold mt-1">Amine Ben Ali</h2>
            <p className="text-primary-foreground/80 mt-1 text-sm">
              <span className="font-semibold text-primary-foreground">1 RDV aujourd'hui</span> · <span className="font-semibold text-primary-foreground">2 résultats</span> en attente
            </p>
            {/* Search bar inside banner */}
            <Link to="/search" className="block mt-4">
              <div className="flex items-center gap-2 bg-primary-foreground/15 hover:bg-primary-foreground/25 rounded-xl px-4 py-3 transition-colors backdrop-blur-sm border border-primary-foreground/10">
                <Search className="h-4 w-4 text-primary-foreground/70" />
                <span className="text-sm text-primary-foreground/70">Rechercher un médecin (spécialité, nom, ville)</span>
              </div>
            </Link>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        </div>

        {/* Quick stats – compact */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Prochain RDV", value: "Aujourd'hui 14h30", icon: Calendar, color: "bg-primary/10 text-primary" },
            { label: "RDV à venir", value: "3", icon: Clock, color: "bg-accent/10 text-accent" },
            { label: "Ordonnances", value: "2 actives", icon: FileText, color: "bg-warning/10 text-warning" },
            { label: "Résultats", value: "2 nouveaux", icon: Activity, color: "bg-destructive/10 text-destructive" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border bg-card p-3 shadow-card hover:shadow-card-hover transition-all cursor-pointer">
              <div className="flex items-center gap-2.5">
                <div className={`h-8 w-8 rounded-lg ${s.color} flex items-center justify-center`}><s.icon className="h-4 w-4" /></div>
                <div>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                  <p className="text-xs font-bold text-foreground">{s.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Main col */}
          <div className="lg:col-span-2 space-y-5">
            {/* Upcoming appointments – compact clickable cards */}
            <div className="rounded-xl border bg-card shadow-card">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h2 className="font-semibold text-foreground text-sm flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" />Prochains rendez-vous</h2>
                <Link to="/dashboard/patient/appointments" className="text-xs text-primary hover:underline flex items-center gap-1">Voir tout <ChevronRight className="h-3.5 w-3.5" /></Link>
              </div>
              <div className="divide-y">
                {upcomingAppointments.map(a => (
                  <Link key={a.id} to="/dashboard/patient/appointments" className="block p-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-xs shrink-0">{a.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-foreground text-sm truncate">{a.doctor}</h3>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 ${a.status === "confirmed" ? "bg-accent/10 text-accent" : "bg-warning/10 text-warning"}`}>
                            {a.status === "confirmed" ? "Confirmé" : "En attente"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                          <span>{a.date} à {a.time}</span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">{a.type === "teleconsultation" ? <><Video className="h-3 w-3 text-primary" />Téléconsult</> : <><MapPin className="h-3 w-3" />{a.address}</>}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent prescriptions – compact */}
            <div className="rounded-xl border bg-card shadow-card">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h2 className="font-semibold text-foreground text-sm flex items-center gap-2"><Pill className="h-4 w-4 text-warning" />Ordonnances récentes</h2>
                <Link to="/dashboard/patient/prescriptions" className="text-xs text-primary hover:underline flex items-center gap-1">Voir tout <ChevronRight className="h-3.5 w-3.5" /></Link>
              </div>
              <div className="divide-y">
                {recentPrescriptions.map(p => (
                  <Link key={p.id} to="/dashboard/patient/prescriptions" className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center"><FileText className="h-4 w-4 text-accent" /></div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{p.id}</p>
                        <p className="text-[11px] text-muted-foreground">{p.doctor} · {p.date}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            {/* Favorite doctors */}
            <div className="rounded-xl border bg-card shadow-card p-4">
              <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2"><Star className="h-4 w-4 text-warning" />Mes soignants favoris</h3>
              <div className="space-y-2">
                {favoriteDoctors.map(d => (
                  <Link key={d.id} to={`/doctor/${d.id}`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors">
                    <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-[10px] font-semibold">{d.avatar}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{d.name}</p>
                      <p className="text-[11px] text-muted-foreground">{d.specialty}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Health card */}
            <div className="rounded-xl border bg-card shadow-card p-4">
              <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2"><Heart className="h-4 w-4 text-primary" />Mon profil santé</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between"><span className="text-muted-foreground text-xs">Groupe sanguin</span><span className="font-medium text-foreground bg-primary/10 px-2 py-0.5 rounded text-xs">{healthSummary.bloodType}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground text-xs">Médecin traitant</span><span className="font-medium text-foreground text-xs">{healthSummary.treatingDoctor}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground text-xs">Assurance</span><span className="flex items-center gap-1 text-primary text-xs font-medium"><Shield className="h-3 w-3" />CNAM</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground text-xs">Allergies</span><span className="flex items-center gap-1 text-destructive text-xs font-medium"><AlertTriangle className="h-3 w-3" />{healthSummary.allergies.join(", ")}</span></div>
              </div>
              <div className="pt-3 mt-3 border-t">
                <Link to="/dashboard/patient/health"><Button variant="outline" size="sm" className="w-full text-xs">Voir mon dossier <ArrowRight className="h-3 w-3 ml-1" /></Button></Link>
              </div>
            </div>

            {/* Quick actions – compact */}
            <div className="rounded-xl border bg-card shadow-card p-4">
              <h3 className="font-semibold text-foreground text-sm mb-3">Actions rapides</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Trouver un praticien", icon: Stethoscope, to: "/search", color: "bg-primary/10 text-primary" },
                  { label: "Prendre RDV", icon: Calendar, to: "/search", color: "bg-accent/10 text-accent" },
                  { label: "Ordonnances", icon: FileText, to: "/dashboard/patient/prescriptions", color: "bg-warning/10 text-warning" },
                  { label: "Mon espace santé", icon: Heart, to: "/dashboard/patient/health", color: "bg-primary/10 text-primary" },
                ].map((a, i) => (
                  <Link key={i} to={a.to} className="flex flex-col items-center gap-1.5 rounded-xl border p-3 hover:bg-muted/50 hover:border-primary/30 transition-all text-center group">
                    <div className={`h-8 w-8 rounded-lg ${a.color} flex items-center justify-center group-hover:scale-110 transition-transform`}><a.icon className="h-4 w-4" /></div>
                    <span className="text-[11px] font-medium text-foreground">{a.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
