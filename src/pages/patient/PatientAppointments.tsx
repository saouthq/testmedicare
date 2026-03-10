import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Calendar, Clock, MapPin, Plus, Video, MessageSquare, X, RefreshCw, CheckCircle2, Shield, AlertTriangle, ChevronDown, Navigation, FileText, UserX, CalendarPlus, ChevronRight, Send, CreditCard, Info, Download, Flag } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import StatusBadge, { type AppointmentStatus } from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import JoinTeleconsultButton from "@/components/teleconsultation/JoinTeleconsultButton";
import { toast } from "@/hooks/use-toast";
import { downloadCalendarEvent, openGoogleMapsDirections } from "@/lib/calendarExport";
import { ReportButton } from "@/components/shared/ReportButton";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import StatusBadge, { type AppointmentStatus } from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import JoinTeleconsultButton from "@/components/teleconsultation/JoinTeleconsultButton";
import { toast } from "@/hooks/use-toast";
import { downloadCalendarEvent, openGoogleMapsDirections } from "@/lib/calendarExport";

type Tab = "upcoming" | "past" | "cancelled" | "absent";

import { 
  mockPastAppointments as initialPastAppointments,
} from "@/data/mockData";
import { usePatientAppointments, usePatientCancelled, cancelAppointment, rescheduleAppointment } from "@/stores/patientStore";

// ─── Reschedule Modal ────────────────────────────────────────
const RescheduleModal = ({ apt, onClose, onConfirm }: { apt: any; onClose: () => void; onConfirm: (day: string, slot: string) => void }) => {
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const days = [
    { day: 24, name: "Lun", available: true },
    { day: 25, name: "Mar", available: true },
    { day: 26, name: "Mer", available: false },
    { day: 27, name: "Jeu", available: true },
    { day: 28, name: "Ven", available: true },
  ];
  const slots = ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00"];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border bg-card shadow-elevated p-5 mx-0 sm:mx-4 animate-slide-up sm:animate-fade-in max-h-[85vh] overflow-y-auto scrollbar-thin" onClick={e => e.stopPropagation()}>
        <div className="sm:hidden flex justify-center mb-3"><div className="h-1 w-10 rounded-full bg-muted-foreground/20" /></div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">Reprogrammer le RDV</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        
        {/* Rules reminder */}
        {apt.cabinetRules && (
          <div className="rounded-lg bg-warning/5 border border-warning/20 p-3 mb-4">
            <p className="text-xs font-medium text-warning flex items-center gap-1"><Info className="h-3 w-3" />Règles de reprogrammation</p>
            <p className="text-[11px] text-muted-foreground mt-1">Maximum {apt.cabinetRules.maxReschedules} reprogrammation(s) autorisée(s).</p>
          </div>
        )}

        <p className="text-sm text-muted-foreground mb-3">Février 2026</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {days.map(d => (
            <button key={d.day} onClick={() => d.available && setSelectedDay(String(d.day))} disabled={!d.available}
              className={`flex flex-col items-center min-w-[3.2rem] rounded-xl border p-2 transition-all ${selectedDay === String(d.day) ? "border-primary bg-primary/5 ring-1 ring-primary" : !d.available ? "opacity-40 cursor-not-allowed" : "hover:border-primary/50"}`}>
              <span className="text-[10px] text-muted-foreground font-medium">{d.name}</span>
              <span className={`text-base font-bold ${selectedDay === String(d.day) ? "text-primary" : "text-foreground"}`}>{d.day}</span>
            </button>
          ))}
        </div>
        {selectedDay && (
          <div className="mt-4">
            <p className="text-sm font-medium text-foreground mb-2">Créneaux disponibles</p>
            <div className="grid grid-cols-4 gap-2">
              {slots.map(s => (
                <button key={s} onClick={() => setSelectedSlot(s)} className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${selectedSlot === s ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/50 text-foreground"}`}>{s}</button>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={() => onConfirm(selectedDay, selectedSlot)} disabled={!selectedDay || !selectedSlot} className="flex-1 gradient-primary text-primary-foreground">Confirmer</Button>
        </div>
      </div>
    </div>
  );
};

// ─── Payment Modal for Teleconsult ──────────────────────────
const PaymentModal = ({ apt, onClose, onPaid }: { apt: any; onClose: () => void; onPaid: () => void }) => {
  const [processing, setProcessing] = useState(false);

  const handlePay = () => {
    setProcessing(true);
    // TODO BACKEND: POST /api/payments/teleconsult
    setTimeout(() => {
      setProcessing(false);
      onPaid();
      toast({ title: "Paiement effectué", description: `${apt.amount} DT débité avec succès.` });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border bg-card shadow-elevated p-5 mx-0 sm:mx-4 animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="sm:hidden flex justify-center mb-3"><div className="h-1 w-10 rounded-full bg-muted-foreground/20" /></div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">Paiement requis</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground"><Video className="h-5 w-5" /></div>
            <div>
              <p className="font-semibold text-foreground">{apt.doctor}</p>
              <p className="text-xs text-primary">{apt.specialty}</p>
              <p className="text-xs text-muted-foreground">{apt.date} à {apt.time}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Téléconsultation</span>
            <span className="text-lg font-bold text-foreground">{apt.amount} DT</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CreditCard className="h-3.5 w-3.5" />
            <span>Paiement sécurisé par carte</span>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground mb-4">Le paiement sera effectué avant de rejoindre la téléconsultation. Un reçu vous sera envoyé par email.</p>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handlePay} disabled={processing} className="flex-1 gradient-primary text-primary-foreground">
            {processing ? "Traitement..." : `Payer ${apt.amount} DT`}
          </Button>
        </div>
      </div>
    </div>
  );
};

const PatientAppointments = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [appointments, setAppointments] = usePatientAppointments();
  const [cancelledList, setCancelledList] = usePatientCancelled();
  const [showCancelConfirm, setShowCancelConfirm] = useState<number | null>(null);
  const [drawerApt, setDrawerApt] = useState<number | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewSent, setReviewSent] = useState<Set<number>>(new Set());
  const [showReportModal, setShowReportModal] = useState<number | null>(null);
  const [showReschedule, setShowReschedule] = useState<number | null>(null);
  const [showPayment, setShowPayment] = useState<number | null>(null);
  const [paidAppointments, setPaidAppointments] = useState<Set<number>>(new Set());

  // Separate absent appointments
  const absentAppointments = initialPastAppointments.filter(a => a.status === "no-show");
  const completedAppointments = initialPastAppointments.filter(a => a.status !== "no-show");

  const handleCancel = (id: number) => {
    cancelAppointment(id);
    setShowCancelConfirm(null);
    setDrawerApt(null);
  };

  const handleReschedule = (id: number, day: string, slot: string) => {
    rescheduleAppointment(id, `${day} Fév 2026`, slot);
    setShowReschedule(null);
    setDrawerApt(null);
    toast({ title: "RDV reprogrammé", description: `Nouveau créneau : ${day} Fév 2026 à ${slot}.` });
  };

  const handlePaymentComplete = (id: number) => {
    setPaidAppointments(prev => new Set(prev).add(id));
    setShowPayment(null);
  };

  const currentApt = drawerApt ? appointments.find(a => a.id === drawerApt) : null;
  const currentPast = drawerApt ? initialPastAppointments.find(a => a.id === drawerApt) : null;
  const aptForReschedule = showReschedule ? appointments.find(a => a.id === showReschedule) : null;
  const aptForPayment = showPayment ? appointments.find(a => a.id === showPayment) : null;

  return (
  <>
    <DashboardLayout role="patient" title="Mes rendez-vous">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex gap-1 rounded-lg border bg-card p-1 overflow-x-auto">
            {([
              { key: "upcoming" as Tab, label: "À venir", count: appointments.length },
              { key: "past" as Tab, label: "Passés", count: completedAppointments.length },
              { key: "absent" as Tab, label: "Absents", count: absentAppointments.length },
              { key: "cancelled" as Tab, label: "Annulés", count: cancelledList.length },
            ]).map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {t.label} <span className={`ml-1 text-xs ${tab === t.key ? "text-primary-foreground/70" : "text-muted-foreground/50"}`}>({t.count})</span>
              </button>
            ))}
          </div>
          <Link to="/search"><Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm"><Plus className="h-4 w-4 mr-2" />Nouveau RDV</Button></Link>
        </div>

        {/* ── Upcoming ── */}
        {tab === "upcoming" && (
          <div className="space-y-3">
            {appointments.length === 0 && <EmptyState icon={Calendar} title="Aucun rendez-vous à venir" description="Prenez rendez-vous avec un praticien." actionLabel="Prendre un RDV" actionLink="/search" />}
            {appointments.map(a => (
              <button key={a.id} onClick={() => setDrawerApt(a.id)} className="w-full text-left rounded-xl border bg-card shadow-card hover:shadow-card-hover transition-all overflow-hidden">
                {a.date === "20 Fév 2026" && (
                  <div className="bg-primary/5 border-b border-primary/10 px-4 py-1.5">
                    <p className="text-[11px] font-medium text-primary flex items-center gap-1"><Clock className="h-3 w-3" />Aujourd'hui — dans 4 heures</p>
                  </div>
                )}
                <div className="p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0">{a.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-foreground text-sm truncate">{a.doctor}</h3>
                        <StatusBadge status={a.status} />
                      </div>
                      <p className="text-[11px] text-primary">{a.specialty}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{a.date} à {a.time}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">{a.type === "teleconsultation" ? <><Video className="h-3 w-3 text-primary" />Téléconsult</> : <><MapPin className="h-3 w-3" /><span className="truncate max-w-[120px] sm:max-w-none">{a.address}</span></>}</span>
                        {a.hasInsurance && <span className="flex items-center gap-0.5 text-accent"><Shield className="h-3 w-3" />Assuré</span>}
                      </div>
                      {/* Bouton rejoindre inline pour les téléconsultations */}
                      {a.type === "teleconsultation" && a.scheduledAt && (
                        <div className="mt-2" onClick={e => e.stopPropagation()}>
                          {a.requiresPayment && !paidAppointments.has(a.id) ? (
                            <Button size="sm" variant="outline" className="text-xs" onClick={() => setShowPayment(a.id)}>
                              <CreditCard className="h-3.5 w-3.5 mr-1" />Payer {a.amount} DT pour rejoindre
                            </Button>
                          ) : (
                            <JoinTeleconsultButton scheduledAt={a.scheduledAt} sessionId={a.sessionId || "teleconsult-1"} />
                          )}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── Past (completed only) ── */}
        {tab === "past" && (
          <div className="space-y-3">
            {completedAppointments.length === 0 && <EmptyState icon={Calendar} title="Aucun rendez-vous passé" description="Vos rendez-vous passés apparaîtront ici." />}
            {completedAppointments.map(a => (
              <button key={a.id} onClick={() => setDrawerApt(a.id)} className="w-full text-left rounded-xl border bg-card shadow-card hover:shadow-card-hover transition-all p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold text-xs shrink-0">{a.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-foreground text-sm truncate">{a.doctor}</h3>
                      <StatusBadge status={a.status} />
                    </div>
                    <p className="text-[11px] text-muted-foreground">{a.specialty} · {a.date} à {a.time}</p>
                    <p className="text-[11px] text-muted-foreground">Motif : {a.motif} · <span className="font-semibold text-foreground">{a.amount}</span></p>
                    {a.hasCareSheet && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-accent mt-1"><FileText className="h-3 w-3" />Feuille de soins disponible</span>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── Absent (no-show) ── */}
        {tab === "absent" && (
          <div className="space-y-3">
            {absentAppointments.length === 0 && <EmptyState icon={UserX} title="Aucune absence" description="Vous n'avez aucune absence enregistrée." />}
            {absentAppointments.length > 0 && (
              <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-4 mb-4">
                <p className="text-sm font-medium text-destructive flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Absences non justifiées</p>
                <p className="text-xs text-muted-foreground mt-1">Les absences répétées peuvent entraîner des restrictions de réservation selon les règles du cabinet.</p>
              </div>
            )}
            {absentAppointments.map(a => (
              <div key={a.id} className="rounded-xl border bg-card p-3 sm:p-4 shadow-card border-l-4 border-l-destructive/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive font-semibold text-xs shrink-0">{a.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm">{a.doctor}</h3>
                    <p className="text-[11px] text-muted-foreground">{a.specialty} · {a.date} à {a.time}</p>
                    <p className="text-[11px] text-destructive/70 mt-0.5 flex items-center gap-1"><UserX className="h-3 w-3" />Absence non justifiée</p>
                  </div>
                  <Link to="/search"><Button variant="outline" size="sm" className="h-7 text-xs shrink-0"><RefreshCw className="h-3 w-3 mr-1" />Reprendre RDV</Button></Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Cancelled ── */}
        {tab === "cancelled" && (
          <div className="space-y-3">
            {cancelledList.length === 0 && <EmptyState icon={CheckCircle2} title="Aucun rendez-vous annulé" description="Vous n'avez aucun rendez-vous annulé." />}
            {cancelledList.map(a => (
              <div key={a.id} className="rounded-xl border bg-card p-3 sm:p-4 shadow-card border-l-4 border-l-destructive/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive font-semibold text-xs shrink-0">{a.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm">{a.doctor}</h3>
                    <p className="text-[11px] text-muted-foreground">{a.specialty} · {a.date} à {a.time}</p>
                    <p className="text-[11px] text-destructive/70 mt-0.5 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{a.reason}</p>
                  </div>
                  <Link to="/search"><Button variant="outline" size="sm" className="h-7 text-xs shrink-0"><RefreshCw className="h-3 w-3 mr-1" />Reprendre</Button></Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Detail drawer ── */}
      {(currentApt || currentPast) && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setDrawerApt(null)}>
          <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border bg-card shadow-elevated p-5 mx-0 sm:mx-4 animate-slide-up sm:animate-fade-in max-h-[85vh] overflow-y-auto scrollbar-thin" onClick={e => e.stopPropagation()}>
            <div className="sm:hidden flex justify-center mb-3"><div className="h-1 w-10 rounded-full bg-muted-foreground/20" /></div>
            
            {currentApt && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-foreground">{currentApt.doctor}</h3>
                  <button onClick={() => setDrawerApt(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
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
                    <div><p className="text-xs font-medium text-foreground">Adresse</p><p className="text-xs text-muted-foreground">{currentApt.address}</p><button onClick={() => openGoogleMapsDirections(currentApt.address!)} className="text-[10px] text-primary hover:underline mt-1">Voir l'itinéraire →</button></div>
                  </div>
                )}

                {/* Cabinet Rules (Doctolib style) */}
                {currentApt.cabinetRules && (
                  <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1"><Info className="h-3.5 w-3.5 text-primary" />Règles du cabinet</p>
                    <div className="space-y-1.5 text-[11px] text-muted-foreground">
                      <p>• Annulation gratuite jusqu'à <span className="font-medium text-foreground">{currentApt.cabinetRules.cancellationHours}h</span> avant le RDV</p>
                      <p>• Maximum <span className="font-medium text-foreground">{currentApt.cabinetRules.maxReschedules}</span> reprogrammation(s) autorisée(s)</p>
                      <p>• Retard : {currentApt.cabinetRules.latePolicy}</p>
                    </div>
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
                
                {/* Actions */}
                <div className="space-y-2">
                  {/* Bouton teleconsultation avec paiement */}
                  {currentApt.type === "teleconsultation" && currentApt.scheduledAt && (
                    currentApt.requiresPayment && !paidAppointments.has(currentApt.id) ? (
                      <Button className="w-full gradient-primary text-primary-foreground" onClick={() => { setDrawerApt(null); setShowPayment(currentApt.id); }}>
                        <CreditCard className="h-4 w-4 mr-2" />Payer {currentApt.amount} DT pour rejoindre
                      </Button>
                    ) : (
                      <JoinTeleconsultButton scheduledAt={currentApt.scheduledAt} sessionId={currentApt.sessionId || "teleconsult-1"} fullWidth />
                    )
                  )}
                  {/* Fallback si pas de scheduledAt (ancien mock) */}
                  {currentApt.type === "teleconsultation" && !currentApt.scheduledAt && (
                    <JoinTeleconsultButton scheduledAt={new Date(Date.now() + 10 * 60_000).toISOString()} sessionId="teleconsult-1" fullWidth />
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <Link to="/dashboard/patient/messages"><Button variant="outline" className="w-full text-xs"><MessageSquare className="h-3.5 w-3.5 mr-1" />Contacter</Button></Link>
                    {currentApt.canModify && <Button variant="outline" className="w-full text-xs" onClick={() => { setDrawerApt(null); setShowReschedule(currentApt.id); }}><RefreshCw className="h-3.5 w-3.5 mr-1" />Reprogrammer</Button>}
                  </div>
                  <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => { downloadCalendarEvent({ title: `RDV ${currentApt.doctor}`, startDate: new Date(currentApt.date + " " + currentApt.time), location: currentApt.address || "" }); toast({ title: "Calendrier", description: "Fichier .ics téléchargé." }); }}><CalendarPlus className="h-3.5 w-3.5 mr-1" />Ajouter au calendrier</Button>
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
            )}

            {currentPast && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-foreground">{currentPast.doctor}</h3>
                  <button onClick={() => setDrawerApt(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
                </div>
                <p className="text-sm text-muted-foreground">{currentPast.specialty} · {currentPast.date} à {currentPast.time}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Motif</p><p className="text-sm font-medium text-foreground mt-0.5">{currentPast.motif}</p></div>
                  <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Montant</p><p className="text-sm font-medium text-foreground mt-0.5">{currentPast.amount}</p></div>
                </div>
                <div className="mt-1"><StatusBadge status={currentPast.status} /></div>
                <div className="space-y-2">
                  {currentPast.hasCareSheet && (
                    <Button variant="outline" className="w-full text-xs">
                      <Download className="h-3.5 w-3.5 mr-1" />Télécharger la feuille de soins
                    </Button>
                  )}
                  {currentPast.hasReport && <Button variant="outline" className="w-full text-xs" onClick={() => { setDrawerApt(null); setShowReportModal(currentPast.id); }}>📄 Voir le compte-rendu</Button>}
                  {currentPast.hasPrescription && <Link to="/dashboard/patient/prescriptions"><Button variant="outline" className="w-full text-xs">💊 Voir l'ordonnance</Button></Link>}
                  {currentPast.status === "completed" && !reviewSent.has(currentPast.id) && (
                    <Button variant="outline" className="w-full text-xs" onClick={() => { setDrawerApt(null); setShowReviewModal(currentPast.id); }}>
                      <MessageSquare className="h-3.5 w-3.5 mr-1" />Laisser un avis
                    </Button>
                  )}
                  {reviewSent.has(currentPast.id) && (
                    <p className="text-xs text-accent flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Avis envoyé</p>
                  )}
                  <Link to="/search"><Button variant="outline" className="w-full text-xs"><RefreshCw className="h-3.5 w-3.5 mr-1" />Reprendre RDV</Button></Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>

    {/* Review modal (text only, no stars) */}
    {showReviewModal !== null && (() => {
      const apt = initialPastAppointments.find(a => a.id === showReviewModal);
      if (!apt) return null;
      return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setShowReviewModal(null)}>
          <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border bg-card shadow-elevated p-5 mx-0 sm:mx-4 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="sm:hidden flex justify-center mb-3"><div className="h-1 w-10 rounded-full bg-muted-foreground/20" /></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Laisser un avis</h3>
              <button onClick={() => setShowReviewModal(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Partagez votre expérience avec {apt.doctor}</p>
            <Textarea 
              placeholder="Décrivez votre expérience (ponctualité, accueil, écoute...)" 
              value={reviewText} 
              onChange={e => setReviewText(e.target.value)} 
              className="min-h-[100px]"
            />
            <p className="text-[10px] text-muted-foreground mt-2">Votre avis sera publié après vérification.</p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowReviewModal(null)}>Annuler</Button>
              <Button 
                onClick={() => {
                  // TODO BACKEND: POST /api/reviews
                  setReviewSent(prev => new Set(prev).add(apt.id));
                  setShowReviewModal(null);
                  setReviewText("");
                  toast({ title: "Avis envoyé", description: "Merci pour votre retour !" });
                }} 
                disabled={!reviewText.trim()}
                className="flex-1 gradient-primary text-primary-foreground"
              >
                <Send className="h-4 w-4 mr-1" />Envoyer
              </Button>
            </div>
          </div>
        </div>
      );
    })()}

    {/* Report modal */}
    {showReportModal !== null && (() => {
      const apt = initialPastAppointments.find(a => a.id === showReportModal);
      if (!apt) return null;
      return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setShowReportModal(null)}>
          <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border bg-card shadow-elevated p-5 mx-0 sm:mx-4 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="sm:hidden flex justify-center mb-3"><div className="h-1 w-10 rounded-full bg-muted-foreground/20" /></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Compte-rendu de consultation</h3>
              <button onClick={() => setShowReportModal(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
              <p className="text-sm font-medium text-foreground">{apt.doctor} · {apt.date}</p>
              <p className="text-sm text-muted-foreground"><strong>Motif :</strong> {apt.motif}</p>
              <p className="text-sm text-muted-foreground"><strong>Observations :</strong> Le patient présente un état général satisfaisant. Constantes dans les normes. Examen clinique sans particularité.</p>
              <p className="text-sm text-muted-foreground"><strong>Conclusion :</strong> Poursuite du traitement habituel. Contrôle prévu dans 3 mois.</p>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1"><Download className="h-4 w-4 mr-1" />Télécharger PDF</Button>
              <Button onClick={() => setShowReportModal(null)} className="flex-1 gradient-primary text-primary-foreground">Fermer</Button>
            </div>
          </div>
        </div>
      );
    })()}

    {/* Reschedule Modal */}
    {aptForReschedule && (
      <RescheduleModal 
        apt={aptForReschedule} 
        onClose={() => setShowReschedule(null)} 
        onConfirm={(day, slot) => handleReschedule(aptForReschedule.id, day, slot)} 
      />
    )}

    {/* Payment Modal */}
    {aptForPayment && (
      <PaymentModal 
        apt={aptForPayment} 
        onClose={() => setShowPayment(null)} 
        onPaid={() => handlePaymentComplete(aptForPayment.id)} 
      />
    )}
  </>
  );
};

export default PatientAppointments;
