import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Calendar, Clock, FileText, Activity, ChevronRight, MapPin, 
  Video, Heart, Pill, Star, AlertTriangle,
  ArrowRight, Plus, CheckCircle2, Stethoscope, Shield, Search,
  X, Navigation, MessageSquare, RefreshCw, CalendarPlus, UserX,
  Bell, Upload, TrendingUp, Syringe, Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import StatusBadge from "@/components/shared/StatusBadge";
import { toast } from "@/hooks/use-toast";
import { downloadCalendarEvent } from "@/lib/calendarExport";
import { usePatientProfile } from "@/stores/patientStore";
import { useNotifications } from "@/stores/notificationsStore";
import { requestRenewal } from "@/stores/doctorStore";
import { useSharedAppointments } from "@/stores/sharedAppointmentsStore";
import { useHealth } from "@/stores/healthStore";
import { useDoctorPrescriptions } from "@/stores/doctorPrescriptionsStore";
import { mockFavoriteDoctors as favoriteDoctors } from "@/data/mockData";
import type { SharedAppointment } from "@/types/appointment";
import type { HealthDocument } from "@/types";

const isTeleconsult = (a: SharedAppointment) => a.type === "Téléconsultation" || a.teleconsultation;

const PatientDashboard = () => {
  const [drawerApt, setDrawerApt] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<HealthDocument | null>(null);
  const [allAppointments] = useSharedAppointments();
  const [profile] = usePatientProfile();
  const { notifications: crossNotifs } = useNotifications("patient");
  const [health] = useHealth();
  const [doctorRx] = useDoctorPrescriptions();

  const PATIENT_ID = 1;
  const appointments = useMemo(() => 
    allAppointments.filter(a => a.patientId === PATIENT_ID && !["done", "cancelled", "absent"].includes(a.status))
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)),
    [allAppointments]
  );

  const recentPrescriptions = useMemo(() =>
    doctorRx.filter(rx => rx.status === "active").slice(0, 3).map(rx => ({
      id: rx.id, doctor: rx.doctor, date: rx.date, items: rx.items.length, status: rx.status,
    })),
    [doctorRx]
  );

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayApts = appointments.filter(a => a.date === today);
    const activePrescriptions = recentPrescriptions.length;
    const pendingResults = health.documents.filter(d => d.type === "Analyse").length;
    return {
      nextApt: appointments.length > 0 ? `${appointments[0].date} ${appointments[0].startTime}` : "Aucun",
      upcomingCount: appointments.length,
      activePrescriptions,
      pendingResults,
      patientName: `${profile.firstName} ${profile.lastName}`,
      todayCount: todayApts.length,
      healthSummary: {
        bloodType: profile.bloodType || "Non renseigné",
        treatingDoctor: profile.treatingDoctor || "Non renseigné",
        insurance: profile.insurance || "Aucune",
        allergies: profile.allergies || [],
      },
    };
  }, [appointments, profile, recentPrescriptions, health]);

  const currentApt = drawerApt ? appointments.find(a => a.id === drawerApt) : null;
  const unreadNotifs = crossNotifs.filter(n => !n.read).length;

  const healthCompletion = useMemo(() => {
    let total = 8, done = 0;
    if (profile.bloodType) done++;
    if (profile.treatingDoctor) done++;
    if (profile.insurance && profile.insurance !== "none") done++;
    if (profile.allergies.length > 0) done++;
    if (health.vaccinations.length > 0) done++;
    if (health.treatments.length > 0) done++;
    if (health.documents.length > 0) done++;
    if (profile.dob) done++;
    return Math.round((done / total) * 100);
  }, [profile, health]);

  const nextVaccination = mockVaccinations.find(v => v.nextDate);

  const handleCancel = (id: string) => {
    const { cancelAppointment } = require("@/stores/sharedAppointmentsStore");
    cancelAppointment(id);
    setShowCancelConfirm(null);
    setDrawerApt(null);
  };

  const handleRenewal = (prescId: string) => {
    const prescription = recentPrescriptions.find(p => p.id === prescId);
    requestRenewal({
      patientName: `${profile.firstName} ${profile.lastName}`,
      patientAvatar: `${profile.firstName[0]}${profile.lastName[0]}`,
      prescriptionId: prescId,
      items: prescription ? [prescription.id] : [prescId],
    });
    toast({ title: "Demande envoyée", description: "Votre demande de renouvellement a été envoyée au médecin." });
  };

  return (
    <DashboardLayout role="patient" title="Tableau de bord">
      <div className="space-y-5">
        {/* Welcome banner */}
        <div className="relative overflow-hidden rounded-2xl gradient-primary p-5 sm:p-6 text-primary-foreground">
          <div className="relative z-10">
            <p className="text-primary-foreground/80 text-sm">Bonjour,</p>
            <h2 className="text-xl sm:text-2xl font-bold mt-1">{stats.patientName}</h2>
            <p className="text-primary-foreground/80 mt-1 text-sm">
              <span className="font-semibold text-primary-foreground">{stats.todayCount > 0 ? `${stats.todayCount} RDV aujourd'hui` : "Aucun RDV aujourd'hui"}</span> · <span className="font-semibold text-primary-foreground">{stats.pendingResults} résultat(s)</span> en attente
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
            { label: "Prochain RDV", value: stats.nextApt, icon: Calendar, color: "bg-primary/10 text-primary", to: "/dashboard/patient/appointments" },
            { label: "RDV à venir", value: String(stats.upcomingCount), icon: Clock, color: "bg-accent/10 text-accent", to: "/dashboard/patient/appointments" },
            { label: "Ordonnances", value: `${stats.activePrescriptions} active(s)`, icon: FileText, color: "bg-warning/10 text-warning", to: "/dashboard/patient/prescriptions" },
            { label: "Résultats", value: `${stats.pendingResults} nouveau(x)`, icon: Activity, color: "bg-destructive/10 text-destructive", to: "/dashboard/patient/health" },
          ].map((s, i) => (
            <Link key={i} to={s.to} className="rounded-xl border bg-card p-3 shadow-card hover:shadow-card-hover transition-all cursor-pointer group">
              <div className="flex items-center gap-2.5">
                <div className={`h-8 w-8 rounded-lg ${s.color} flex items-center justify-center group-hover:scale-110 transition-transform`}><s.icon className="h-4 w-4" /></div>
                <div>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                  <p className="text-xs font-bold text-foreground">{s.value}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Health profile completion */}
        {healthCompletion < 100 && (
          <Link to="/dashboard/patient/health" className="block">
            <div className="rounded-xl border bg-card shadow-card p-4 hover:shadow-card-hover transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Complétez votre profil santé</span>
                </div>
                <span className="text-xs font-bold text-primary">{healthCompletion}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${healthCompletion}%` }} />
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">Un profil complet permet à vos médecins de mieux vous soigner.</p>
            </div>
          </Link>
        )}

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Main col */}
          <div className="lg:col-span-2 space-y-5">
            {/* Upcoming appointments */}
            <div className="rounded-xl border bg-card shadow-card">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h2 className="font-semibold text-foreground text-sm flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" />Prochains rendez-vous</h2>
                <Link to="/dashboard/patient/appointments" className="text-xs text-primary hover:underline flex items-center gap-1">Voir tout <ChevronRight className="h-3.5 w-3.5" /></Link>
              </div>
              <div className="divide-y">
                {appointments.length === 0 && (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    Aucun rendez-vous à venir. <Link to="/search" className="text-primary hover:underline">Prendre un RDV</Link>
                  </div>
                )}
                {appointments.slice(0, 3).map(a => (
                  <button key={a.id} onClick={() => setDrawerApt(a.id)} className="w-full text-left p-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-xs shrink-0">{a.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-foreground text-sm truncate">{a.doctor}</h3>
                          <StatusBadge status={a.status} />
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                          <span>{a.date} à {a.startTime}</span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">{isTeleconsult(a) ? <><Video className="h-3 w-3 text-primary" />Téléconsult</> : <><MapPin className="h-3 w-3" />Cabinet</>}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent prescriptions with renewal */}
            <div className="rounded-xl border bg-card shadow-card">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h2 className="font-semibold text-foreground text-sm flex items-center gap-2"><Pill className="h-4 w-4 text-warning" />Ordonnances récentes</h2>
                <Link to="/dashboard/patient/prescriptions" className="text-xs text-primary hover:underline flex items-center gap-1">Voir tout <ChevronRight className="h-3.5 w-3.5" /></Link>
              </div>
              <div className="divide-y">
                {recentPrescriptions.map(p => (
                  <div key={p.id} className="p-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <Link to="/dashboard/patient/prescriptions" className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center"><FileText className="h-4 w-4 text-accent" /></div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{p.id}</p>
                          <p className="text-[11px] text-muted-foreground">{p.doctor} · {p.date}</p>
                        </div>
                      </Link>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button variant="ghost" size="sm" className="h-7 text-[11px] text-primary" onClick={() => handleRenewal(p.id)}>
                          <RefreshCw className="h-3 w-3 mr-1" />Renouveler
                        </Button>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent documents */}
            <div className="rounded-xl border bg-card shadow-card">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h2 className="font-semibold text-foreground text-sm flex items-center gap-2"><Upload className="h-4 w-4 text-accent" />Documents récents</h2>
                <Link to="/dashboard/patient/health" className="text-xs text-primary hover:underline flex items-center gap-1">Voir tout <ChevronRight className="h-3.5 w-3.5" /></Link>
              </div>
              <div className="divide-y">
                {mockHealthDocuments.slice(0, 3).map((d, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 hover:bg-muted/20 transition-colors">
                    <div className={`p-2 rounded-lg ${d.type === "Analyse" ? "bg-accent/10" : d.type === "Ordonnance" ? "bg-primary/10" : "bg-muted"}`}>
                      <FileText className={`h-4 w-4 ${d.type === "Analyse" ? "text-accent" : d.type === "Ordonnance" ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{d.name}</p>
                      <p className="text-[11px] text-muted-foreground">{d.source} · {d.date}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setPreviewDoc(d)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            {/* Notifications preview */}
            {unreadNotifs > 0 && (
              <Link to="/dashboard/patient/notifications" className="block">
                <div className="rounded-xl border bg-card shadow-card p-4 hover:shadow-card-hover transition-all">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center relative">
                      <Bell className="h-5 w-5 text-primary-foreground" />
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">{unreadNotifs}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{unreadNotifs} notification{unreadNotifs > 1 ? "s" : ""}</p>
                      <p className="text-[11px] text-muted-foreground">Non lue{unreadNotifs > 1 ? "s" : ""}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                  </div>
                </div>
              </Link>
            )}

            {/* Vaccination reminder */}
            {nextVaccination && (
              <div className="rounded-xl border border-warning/30 bg-warning/5 shadow-card p-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-warning/10 flex items-center justify-center shrink-0"><Syringe className="h-4 w-4 text-warning" /></div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Rappel vaccination</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{nextVaccination.name} — Prochaine dose : {nextVaccination.nextDate}</p>
                    <Link to="/dashboard/patient/health">
                      <Button variant="outline" size="sm" className="mt-2 h-7 text-[11px]">Voir mes vaccins</Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

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
              <Link to="/search"><Button variant="ghost" size="sm" className="w-full mt-2 text-xs text-primary"><Plus className="h-3 w-3 mr-1" />Trouver un praticien</Button></Link>
            </div>

            {/* Health card */}
            <div className="rounded-xl border bg-card shadow-card p-4">
              <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2"><Heart className="h-4 w-4 text-primary" />Mon profil santé</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between"><span className="text-muted-foreground text-xs">Groupe sanguin</span><span className="font-medium text-foreground bg-primary/10 px-2 py-0.5 rounded text-xs">{stats.healthSummary.bloodType}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground text-xs">Médecin traitant</span><span className="font-medium text-foreground text-xs">{stats.healthSummary.treatingDoctor}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground text-xs">Assurance</span><span className="flex items-center gap-1 text-primary text-xs font-medium"><Shield className="h-3 w-3" />{stats.healthSummary.insurance}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground text-xs">Allergies</span><span className="flex items-center gap-1 text-destructive text-xs font-medium"><AlertTriangle className="h-3 w-3" />{stats.healthSummary.allergies.join(", ") || "Aucune"}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground text-xs">Traitements</span><span className="text-xs font-medium text-foreground">{mockTreatments.length} en cours</span></div>
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
                  { label: "Renouveler ordo.", icon: RefreshCw, to: "/dashboard/patient/prescriptions", color: "bg-warning/10 text-warning" },
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

      {/* ── Document preview modal ── */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setPreviewDoc(null)}>
          <div className="w-full max-w-md rounded-2xl border bg-card shadow-elevated p-5 mx-4 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">Aperçu du document</h3>
              <button onClick={() => setPreviewDoc(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="rounded-xl bg-muted/50 p-6 text-center mb-4">
              <FileText className="h-12 w-12 text-primary mx-auto mb-3" />
              <p className="font-semibold text-foreground">{previewDoc.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{previewDoc.type} · {previewDoc.date}</p>
              <p className="text-xs text-muted-foreground">{previewDoc.source}</p>
            </div>
            <div className="rounded-xl border p-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Type</span><span className="font-medium text-foreground">{previewDoc.type}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Source</span><span className="font-medium text-foreground">{previewDoc.source}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Date</span><span className="font-medium text-foreground">{previewDoc.date}</span></div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 gradient-primary text-primary-foreground" onClick={() => { toast({ title: "Téléchargement", description: `${previewDoc.name} téléchargé (mock).` }); }}>
                Télécharger
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setPreviewDoc(null)}>Fermer</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── RDV detail drawer ── */}
      {currentApt && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => { setDrawerApt(null); setShowCancelConfirm(null); }}>
          <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border bg-card shadow-elevated p-5 mx-0 sm:mx-4 animate-slide-up sm:animate-fade-in max-h-[85vh] overflow-y-auto scrollbar-thin" onClick={e => e.stopPropagation()}>
            <div className="sm:hidden flex justify-center mb-3"><div className="h-1 w-10 rounded-full bg-muted-foreground/20" /></div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">{currentApt.doctor}</h3>
                <button onClick={() => { setDrawerApt(null); setShowCancelConfirm(null); }} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
              </div>
              <p className="text-sm text-primary">{currentApt.type}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Date</p><p className="text-sm font-medium text-foreground mt-0.5">{currentApt.date} à {currentApt.startTime}</p></div>
                <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Type</p><p className="text-sm font-medium text-foreground mt-0.5 capitalize">{currentApt.type}</p></div>
                <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Motif</p><p className="text-sm font-medium text-foreground mt-0.5">{currentApt.motif}</p></div>
                <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Statut</p><div className="mt-0.5"><StatusBadge status={currentApt.status} /></div></div>
              </div>
              <div className="space-y-2">
                {isTeleconsult(currentApt) && <Link to="/dashboard/patient/teleconsultation" className="block"><Button className="w-full gradient-primary text-primary-foreground"><Video className="h-4 w-4 mr-2" />Rejoindre la téléconsultation</Button></Link>}
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/dashboard/patient/messages"><Button variant="outline" className="w-full text-xs"><MessageSquare className="h-3.5 w-3.5 mr-1" />Contacter</Button></Link>
                  {["pending", "confirmed"].includes(currentApt.status) && <Button variant="outline" className="w-full text-xs" onClick={() => { setDrawerApt(null); toast({ title: "Reprogrammer", description: "Utilisez la page 'Mes rendez-vous' pour reprogrammer ce RDV." }); }}><RefreshCw className="h-3.5 w-3.5 mr-1" />Déplacer</Button>}
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => { downloadCalendarEvent({ title: `RDV ${currentApt.doctor}`, startDate: new Date(`${currentApt.date}T${currentApt.startTime}:00`), location: "" }); toast({ title: "Calendrier", description: "Fichier .ics téléchargé." }); }}><CalendarPlus className="h-3.5 w-3.5 mr-1" />Ajouter au calendrier</Button>
                {["pending", "confirmed"].includes(currentApt.status) && (
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
