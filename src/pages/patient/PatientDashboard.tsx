import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Calendar, Clock, FileText, Activity, ChevronRight, MapPin, 
  Video, Heart, Pill, Star, AlertTriangle,
  ArrowRight, Plus, CheckCircle2, Stethoscope, Shield, Search,
  X, Navigation, MessageSquare, RefreshCw, CalendarPlus, UserX
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import StatusBadge, { type AppointmentStatus } from "@/components/shared/StatusBadge";

import { 
  mockPatientAppointments as upcomingAppointments, 
  mockRecentPrescriptions as recentPrescriptions, 
  mockFavoriteDoctors as favoriteDoctors, 
  mockHealthSummary as healthSummary 
} from "@/data/mockData";

const PatientDashboard = () => {
  const [drawerApt, setDrawerApt] = useState<number | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<number | null>(null);
  const [appointments, setAppointments] = useState(upcomingAppointments);

  const currentApt = drawerApt ? appointments.find(a => a.id === drawerApt) : null;

  const handleCancel = (id: number) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
    setShowCancelConfirm(null);
    setDrawerApt(null);
  };

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
            <Link to="/search" className="block mt-4">
              <div className="flex items-center gap-2 bg-primary-foreground/15 hover:bg-primary-foreground/25 rounded-xl px-4 py-3 transition-colors backdrop-blur-sm border border-primary-foreground/10">
                <Search className="h-4 w-4 text-primary-foreground/70" />
                <span className="text-sm text-primary-foreground/70">Rechercher un médecin (spécialité, nom, ville)</span>
              </div>
            </Link>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        </div>

        {/* Quick stats */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Prochain RDV", value: "Aujourd'hui 14h30", icon: Calendar, color: "bg-primary/10 text-primary" },
            { label: "RDV à venir", value: String(appointments.length), icon: Clock, color: "bg-accent/10 text-accent" },
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
            {/* Upcoming appointments – compact clickable cards → opens DRAWER */}
            <div className="rounded-xl border bg-card shadow-card">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h2 className="font-semibold text-foreground text-sm flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" />Prochains rendez-vous</h2>
                <Link to="/dashboard/patient/appointments" className="text-xs text-primary hover:underline flex items-center gap-1">Voir tout <ChevronRight className="h-3.5 w-3.5" /></Link>
              </div>
              <div className="divide-y">
                {appointments.map(a => (
                  <button key={a.id} onClick={() => setDrawerApt(a.id)} className="w-full text-left p-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-xs shrink-0">{a.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-foreground text-sm truncate">{a.doctor}</h3>
                          <StatusBadge status={a.status} />
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                          <span>{a.date} à {a.time}</span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">{a.type === "teleconsultation" ? <><Video className="h-3 w-3 text-primary" />Téléconsult</> : <><MapPin className="h-3 w-3" />{a.address}</>}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent prescriptions */}
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

            {/* Quick actions */}
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

      {/* ── RDV detail drawer (bottom sheet) ── */}
      {currentApt && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => { setDrawerApt(null); setShowCancelConfirm(null); }}>
          <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border bg-card shadow-elevated p-5 mx-0 sm:mx-4 animate-fade-in max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sm:hidden flex justify-center mb-3"><div className="h-1 w-10 rounded-full bg-muted-foreground/20" /></div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">{currentApt.doctor}</h3>
                <button onClick={() => { setDrawerApt(null); setShowCancelConfirm(null); }} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
              </div>
              <p className="text-sm text-primary">{currentApt.specialty}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Date</p><p className="text-sm font-medium text-foreground mt-0.5">{currentApt.date} à {currentApt.time}</p></div>
                <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Type</p><p className="text-sm font-medium text-foreground mt-0.5 capitalize">{currentApt.type}</p></div>
                <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Motif</p><p className="text-sm font-medium text-foreground mt-0.5">{currentApt.motif}</p></div>
                <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Statut</p><div className="mt-0.5"><StatusBadge status={currentApt.status} /></div></div>
              </div>
              {currentApt.address && (
                <div className="flex items-start gap-3 rounded-xl border bg-card p-3">
                  <Navigation className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div><p className="text-xs font-medium text-foreground">Adresse</p><p className="text-xs text-muted-foreground">{currentApt.address}</p></div>
                </div>
              )}
              {currentApt.documents.length > 0 && (
                <div className="flex items-start gap-3 rounded-xl border bg-card p-3">
                  <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div><p className="text-xs font-medium text-foreground">Documents à apporter</p><ul className="text-xs text-muted-foreground mt-1 space-y-0.5">{currentApt.documents.map(d => <li key={d}>• {d}</li>)}</ul></div>
                </div>
              )}
              {currentApt.instructions && (
                <div className="flex items-start gap-3 rounded-xl border bg-card p-3">
                  <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                  <div><p className="text-xs font-medium text-foreground">Consignes</p><p className="text-xs text-muted-foreground">{currentApt.instructions}</p></div>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground">📋 {currentApt.cancellationPolicy}</p>
              <div className="space-y-2">
                {currentApt.type === "teleconsultation" && <Link to="/dashboard/patient/teleconsultation" className="block"><Button className="w-full gradient-primary text-primary-foreground"><Video className="h-4 w-4 mr-2" />Rejoindre la téléconsultation</Button></Link>}
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/dashboard/patient/messages"><Button variant="outline" className="w-full text-xs"><MessageSquare className="h-3.5 w-3.5 mr-1" />Contacter</Button></Link>
                  {currentApt.canModify && <Link to={`/booking/${currentApt.id}`}><Button variant="outline" className="w-full text-xs"><RefreshCw className="h-3.5 w-3.5 mr-1" />Déplacer</Button></Link>}
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs"><CalendarPlus className="h-3.5 w-3.5 mr-1" />Ajouter au calendrier</Button>
                {currentApt.canCancel && (
                  showCancelConfirm === currentApt.id ? (
                    <div className="flex items-center gap-2 bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
                      <span className="text-xs text-destructive font-medium flex-1">Confirmer l'annulation ?</span>
                      <Button size="sm" variant="ghost" className="h-6 text-xs text-destructive" onClick={() => handleCancel(currentApt.id)}>Oui</Button>
                      <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setShowCancelConfirm(null)}>Non</Button>
                    </div>
                  ) : (
                    <Button variant="outline" className="w-full text-xs text-destructive border-destructive/30 hover:bg-destructive/5" onClick={() => setShowCancelConfirm(currentApt.id)}>
                      <X className="h-3.5 w-3.5 mr-1" />Annuler ce rendez-vous
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PatientDashboard;
