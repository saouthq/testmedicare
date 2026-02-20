import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Calendar, Clock, MapPin, Plus, Video, MessageSquare, X, RefreshCw, CheckCircle2, Shield, AlertTriangle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type Tab = "upcoming" | "past" | "cancelled";

const initialAppointments = [
  { id: 1, doctor: "Dr. Ahmed Bouazizi", specialty: "Médecin généraliste", date: "20 Fév 2026", time: "14:30", address: "15 Av. de la Liberté, El Manar, Tunis", status: "confirmed", type: "cabinet", motif: "Suivi diabète", canModify: true, canCancel: true, avatar: "AB", cnam: true },
  { id: 2, doctor: "Dr. Sonia Gharbi", specialty: "Cardiologue", date: "23 Fév 2026", time: "10:00", address: "32 Rue Charles de Gaulle, Ariana", status: "confirmed", type: "cabinet", motif: "Bilan cardiaque annuel", canModify: true, canCancel: true, avatar: "SG", cnam: true },
  { id: 3, doctor: "Dr. Khaled Hammami", specialty: "Dermatologue", date: "28 Fév 2026", time: "16:15", address: "", status: "pending", type: "teleconsultation", motif: "Consultation dermatologie", canModify: false, canCancel: true, avatar: "KH", cnam: true },
  { id: 4, doctor: "Dr. Leila Chebbi", specialty: "Ophtalmologue", date: "5 Mar 2026", time: "11:00", address: "12 Rue de Carthage, Sousse", status: "confirmed", type: "cabinet", motif: "Contrôle annuel vue", canModify: true, canCancel: true, avatar: "LC", cnam: false },
];

const initialPastAppointments = [
  { id: 5, doctor: "Dr. Ahmed Bouazizi", specialty: "Médecin généraliste", date: "10 Fév 2026", time: "09:00", status: "completed", motif: "Suivi diabète", hasPrescription: true, hasReport: true, avatar: "AB", amount: "35 DT" },
  { id: 6, doctor: "Dr. Nabil Karray", specialty: "Pédiatre", date: "3 Fév 2026", time: "14:00", status: "completed", motif: "Consultation enfant", hasPrescription: false, hasReport: true, avatar: "NK", amount: "40 DT" },
  { id: 7, doctor: "Dr. Sonia Gharbi", specialty: "Cardiologue", date: "15 Jan 2026", time: "10:30", status: "completed", motif: "Bilan cardiaque", hasPrescription: true, hasReport: true, avatar: "SG", amount: "60 DT" },
];

const PatientAppointments = () => {
  const [tab, setTab] = useState<Tab>("upcoming");
  const [appointments, setAppointments] = useState(initialAppointments);
  const [cancelledList, setCancelledList] = useState([
    { id: 8, doctor: "Dr. Sonia Gharbi", specialty: "Cardiologue", date: "8 Fév 2026", time: "15:00", reason: "Indisponibilité du praticien", avatar: "SG" },
    { id: 9, doctor: "Dr. Khaled Hammami", specialty: "Dermatologue", date: "20 Jan 2026", time: "11:30", reason: "Annulation par le patient", avatar: "KH" },
  ]);
  const [showCancelConfirm, setShowCancelConfirm] = useState<number | null>(null);
  const [expandedPast, setExpandedPast] = useState<number | null>(null);

  const handleCancel = (id: number) => {
    const apt = appointments.find(a => a.id === id);
    if (apt) {
      setCancelledList(prev => [{ id: apt.id, doctor: apt.doctor, specialty: apt.specialty, date: apt.date, time: apt.time, reason: "Annulation par le patient", avatar: apt.avatar }, ...prev]);
      setAppointments(prev => prev.filter(a => a.id !== id));
    }
    setShowCancelConfirm(null);
  };

  return (
    <DashboardLayout role="patient" title="Mes rendez-vous">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1 rounded-lg border bg-card p-1">
            {([
              { key: "upcoming" as Tab, label: "À venir", count: appointments.length },
              { key: "past" as Tab, label: "Passés", count: initialPastAppointments.length },
              { key: "cancelled" as Tab, label: "Annulés", count: cancelledList.length },
            ]).map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {t.label} <span className={`ml-1.5 text-xs ${tab === t.key ? "text-primary-foreground/70" : "text-muted-foreground/50"}`}>({t.count})</span>
              </button>
            ))}
          </div>
          <Link to="/dashboard/patient/search">
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm">
              <Plus className="h-4 w-4 mr-2" />Nouveau rendez-vous
            </Button>
          </Link>
        </div>

        {tab === "upcoming" && (
          <div className="space-y-4">
            {appointments.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">Aucun rendez-vous à venir</p>
                <Link to="/dashboard/patient/search"><Button className="mt-4 gradient-primary text-primary-foreground" size="sm"><Plus className="h-4 w-4 mr-1" />Prendre un RDV</Button></Link>
              </div>
            )}
            {appointments.map((a) => (
              <div key={a.id} className="rounded-xl border bg-card shadow-card hover:shadow-card-hover transition-all overflow-hidden">
                {a.date === "20 Fév 2026" && (
                  <div className="bg-primary/5 border-b border-primary/10 px-5 py-2">
                    <p className="text-xs font-medium text-primary flex items-center gap-1"><Clock className="h-3 w-3" />Aujourd'hui — dans 4 heures</p>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <Link to={`/doctor/${a.id}`} className="h-14 w-14 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0 hover:opacity-90 transition-opacity">{a.avatar}</Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link to={`/doctor/${a.id}`} className="font-bold text-foreground hover:text-primary transition-colors">{a.doctor}</Link>
                          <p className="text-sm text-primary">{a.specialty}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {a.cnam && <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium"><Shield className="h-3 w-3" />CNAM</span>}
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${a.status === "confirmed" ? "bg-accent/10 text-accent" : "bg-warning/10 text-warning"}`}>
                            {a.status === "confirmed" ? "✓ Confirmé" : "⏳ En attente"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-primary" />{a.date} à {a.time}</span>
                        <span className="flex items-center gap-1.5">
                          {a.type === "teleconsultation" ? (<><Video className="h-3.5 w-3.5 text-primary" />Téléconsultation</>) : (<><MapPin className="h-3.5 w-3.5" />{a.address}</>)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Motif : <span className="text-foreground">{a.motif}</span></p>
                      <div className="flex items-center gap-2 mt-4 flex-wrap">
                        {a.type === "teleconsultation" && (
                          <Link to="/dashboard/patient/teleconsultation"><Button size="sm" className="h-8 text-xs gradient-primary text-primary-foreground"><Video className="h-3.5 w-3.5 mr-1" />Rejoindre</Button></Link>
                        )}
                        <Link to="/dashboard/patient/messages"><Button variant="outline" size="sm" className="h-8 text-xs"><MessageSquare className="h-3.5 w-3.5 mr-1" />Contacter</Button></Link>
                        {a.canModify && <Link to="/dashboard/patient/booking"><Button variant="outline" size="sm" className="h-8 text-xs"><RefreshCw className="h-3.5 w-3.5 mr-1" />Déplacer</Button></Link>}
                        {a.canCancel && (
                          showCancelConfirm === a.id ? (
                            <div className="flex items-center gap-2 bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-1.5">
                              <span className="text-xs text-destructive font-medium">Confirmer l'annulation ?</span>
                              <Button size="sm" variant="ghost" className="h-6 text-xs text-destructive" onClick={() => handleCancel(a.id)}>Oui</Button>
                              <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setShowCancelConfirm(null)}>Non</Button>
                            </div>
                          ) : (
                            <Button variant="outline" size="sm" className="h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/5" onClick={() => setShowCancelConfirm(a.id)}>
                              <X className="h-3.5 w-3.5 mr-1" />Annuler
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "past" && (
          <div className="space-y-3">
            {initialPastAppointments.map((a) => (
              <div key={a.id} className="rounded-xl border bg-card shadow-card hover:shadow-card-hover transition-all overflow-hidden">
                <div className="p-5 cursor-pointer" onClick={() => setExpandedPast(expandedPast === a.id ? null : a.id)}>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold text-sm shrink-0">{a.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground text-sm">{a.doctor}</h3>
                          <p className="text-xs text-muted-foreground">{a.specialty} · {a.date} à {a.time}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Motif : {a.motif} · <span className="font-semibold text-foreground">{a.amount}</span></p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"><CheckCircle2 className="h-3 w-3 inline mr-0.5" />Terminé</span>
                          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedPast === a.id ? "rotate-180" : ""}`} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {expandedPast === a.id && (
                  <div className="px-5 pb-4 pt-0 border-t mt-0">
                    <div className="flex gap-2 pt-3">
                      {a.hasReport && <Button variant="outline" size="sm" className="h-7 text-xs">📄 Compte-rendu</Button>}
                      {a.hasPrescription && <Link to="/dashboard/patient/prescriptions"><Button variant="outline" size="sm" className="h-7 text-xs">💊 Ordonnance</Button></Link>}
                      <Link to="/dashboard/patient/booking"><Button variant="outline" size="sm" className="h-7 text-xs"><RefreshCw className="h-3 w-3 mr-1" />Reprendre RDV</Button></Link>
                      <Link to="/dashboard/patient/messages"><Button variant="outline" size="sm" className="h-7 text-xs"><MessageSquare className="h-3 w-3 mr-1" />Contacter</Button></Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "cancelled" && (
          <div className="space-y-3">
            {cancelledList.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Aucun rendez-vous annulé</p>
              </div>
            )}
            {cancelledList.map((a) => (
              <div key={a.id} className="rounded-xl border bg-card p-5 shadow-card border-l-4 border-l-destructive/30">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive font-semibold text-sm shrink-0">{a.avatar}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-sm">{a.doctor}</h3>
                    <p className="text-xs text-muted-foreground">{a.specialty} · {a.date} à {a.time}</p>
                    <p className="text-xs text-destructive/70 mt-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Raison : {a.reason}</p>
                  </div>
                  <Link to="/dashboard/patient/booking"><Button variant="outline" size="sm" className="h-7 text-xs shrink-0"><RefreshCw className="h-3 w-3 mr-1" />Reprendre RDV</Button></Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientAppointments;
