import DashboardLayout from "@/components/layout/DashboardLayout";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import { useState } from "react";
import { Calendar, Clock, MapPin, Plus, Video, MessageSquare, X, RefreshCw, CheckCircle2, Shield, AlertTriangle, ChevronDown, Navigation, FileText, UserX, CalendarPlus, ChevronRight, Send, CreditCard, Info, Download, Flag } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import JoinTeleconsultButton from "@/components/teleconsultation/JoinTeleconsultButton";
import { toast } from "@/hooks/use-toast";
import { downloadCalendarEvent, openGoogleMapsDirections } from "@/lib/calendarExport";
import { ReportButton } from "@/components/shared/ReportButton";

type Tab = "upcoming" | "past" | "cancelled" | "absent";

import { useSharedAppointments, cancelAppointment as sharedCancelAppointment, rescheduleAppointment as sharedRescheduleAppointment } from "@/stores/sharedAppointmentsStore";
import { readAuthUser } from "@/stores/authStore";
import type { SharedAppointment } from "@/types/appointment";
import { canCancel as checkCanCancel, canReschedule as checkCanReschedule } from "@/lib/appointmentRules";

// Helper: derive display values from SharedAppointment
const isTeleconsult = (a: SharedAppointment) => a.type === "Téléconsultation" || a.teleconsultation;
const canModifyApt = (a: SharedAppointment) => checkCanReschedule(a).allowed;
const canCancelApt = (a: SharedAppointment) => checkCanCancel(a).allowed;
const getScheduledAt = (a: SharedAppointment) => {
  try { return new Date(`${a.date}T${a.startTime}:00`).toISOString(); } catch { return new Date().toISOString(); }
};

// ─── Reschedule Modal ────────────────────────────────────────
const RescheduleModal = ({ apt, onClose, onConfirm }: { apt: SharedAppointment; onClose: () => void; onConfirm: (day: string, slot: string) => void }) => {
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);
  
  const generateDays = (offset: number) => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() + 1 + (offset * 7));
    const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const days: { day: number; name: string; label: string; available: boolean }[] = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push({
        day: d.getDate(),
        name: dayNames[d.getDay()],
        label: `${d.getDate()} ${d.toLocaleDateString("fr-FR", { month: "short" })} ${d.getFullYear()}`,
        available: d.getDay() !== 0,
      });
    }
    return days;
  };
  
  const days = generateDays(weekOffset);
  const slots = ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00"];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border bg-card shadow-elevated p-5 mx-0 sm:mx-4 animate-slide-up sm:animate-fade-in max-h-[85vh] overflow-y-auto scrollbar-thin" onClick={e => e.stopPropagation()}>
        <div className="sm:hidden flex justify-center mb-3"><div className="h-1 w-10 rounded-full bg-muted-foreground/20" /></div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">Reprogrammer le RDV</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>

        <p className="text-sm text-muted-foreground mb-1">Choisissez une semaine</p>
        <div className="flex items-center gap-2 mb-3">
          <Button variant="ghost" size="sm" onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))} disabled={weekOffset === 0} className="h-7 w-7 p-0">←</Button>
          <span className="text-xs text-muted-foreground">{days[0]?.label} — {days[4]?.label}</span>
          <Button variant="ghost" size="sm" onClick={() => setWeekOffset(Math.min(3, weekOffset + 1))} disabled={weekOffset >= 3} className="h-7 w-7 p-0">→</Button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {days.map(d => (
            <button key={d.label} onClick={() => d.available && setSelectedDay(d.label)} disabled={!d.available}
              className={`flex flex-col items-center min-w-[3.2rem] rounded-xl border p-2 transition-all ${selectedDay === d.label ? "border-primary bg-primary/5 ring-1 ring-primary" : !d.available ? "opacity-40 cursor-not-allowed" : "hover:border-primary/50"}`}>
              <span className="text-[10px] text-muted-foreground font-medium">{d.name}</span>
              <span className={`text-base font-bold ${selectedDay === d.label ? "text-primary" : "text-foreground"}`}>{d.day}</span>
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
const PaymentModal = ({ apt, onClose, onPaid }: { apt: SharedAppointment; onClose: () => void; onPaid: () => void }) => {
  const [processing, setProcessing] = useState(false);
  const amount = "60 DT";

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onPaid();
      toast({ title: "Paiement effectué", description: `${amount} débité avec succès.` });
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
              <p className="text-xs text-primary">{apt.motif}</p>
              <p className="text-xs text-muted-foreground">{apt.date} à {apt.startTime}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Téléconsultation</span>
            <span className="text-lg font-bold text-foreground">{amount}</span>
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
            {processing ? "Traitement..." : `Payer ${amount}`}
          </Button>
        </div>
      </div>
    </div>
  );
};

const PATIENT_ID_FALLBACK = 1;

const PatientAppointments = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [allAppointments, , { isLoading }] = useSharedAppointments();
  const PATIENT_ID = readAuthUser()?.patientId ?? PATIENT_ID_FALLBACK;
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);
  const [drawerApt, setDrawerApt] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewSent, setReviewSent] = useState<Set<string>>(new Set());
  const [showReportModal, setShowReportModal] = useState<string | null>(null);
  const [showReschedule, setShowReschedule] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState<string | null>(null);
  const [paidAppointments, setPaidAppointments] = useState<Set<string>>(new Set());

  const myAppointments = allAppointments.filter(a => a.patientId === PATIENT_ID);
  const appointments = myAppointments.filter(a => ["pending", "confirmed", "arrived", "in_waiting", "in_progress"].includes(a.status));
  const completedAppointments = myAppointments.filter(a => a.status === "done");
  const absentAppointments = myAppointments.filter(a => a.status === "absent");
  const cancelledList = myAppointments.filter(a => a.status === "cancelled");

  const handleCancel = (id: string) => {
    sharedCancelAppointment(id);
    setShowCancelConfirm(null);
    setDrawerApt(null);
  };

  const handleReschedule = (id: string, day: string, slot: string) => {
    sharedRescheduleAppointment(id, day, slot);
    setShowReschedule(null);
    setDrawerApt(null);
    toast({ title: "RDV reprogrammé", description: `Nouveau créneau : ${day} à ${slot}.` });
  };

  const handlePaymentComplete = (id: string) => {
    setPaidAppointments(prev => new Set(prev).add(id));
    setShowPayment(null);
  };

  const currentApt = drawerApt ? myAppointments.find(a => a.id === drawerApt) : null;
  const currentPast = drawerApt ? completedAppointments.find(a => a.id === drawerApt) : null;
  const aptForReschedule = showReschedule ? appointments.find(a => a.id === showReschedule) : null;
  const aptForPayment = showPayment ? appointments.find(a => a.id === showPayment) : null;

  if (isLoading) {
    return <DashboardLayout role="patient" title="Mes rendez-vous"><LoadingSkeleton type="card" /></DashboardLayout>;
  }

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
                <div className="p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0">{a.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-foreground text-sm truncate">{a.doctor}</h3>
                        <StatusBadge status={a.status} />
                      </div>
                      <p className="text-[11px] text-primary">{a.motif}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{a.date} à {a.startTime}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">{isTeleconsult(a) ? <><Video className="h-3 w-3 text-primary" />Téléconsult</> : <><MapPin className="h-3 w-3" /><span className="truncate max-w-[120px] sm:max-w-none">Cabinet</span></>}</span>
                        {a.assurance && a.assurance !== "Aucune" && <span className="flex items-center gap-0.5 text-accent"><Shield className="h-3 w-3" />Assuré</span>}
                      </div>
                      {isTeleconsult(a) && (
                        <div className="mt-2" onClick={e => e.stopPropagation()}>
                          <JoinTeleconsultButton scheduledAt={getScheduledAt(a)} sessionId={a.id} />
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
                    <p className="text-[11px] text-muted-foreground">{a.motif} · {a.date} à {a.startTime}</p>
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
                    <p className="text-[11px] text-muted-foreground">{a.motif} · {a.date} à {a.startTime}</p>
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
                    <p className="text-[11px] text-muted-foreground">{a.motif} · {a.date} à {a.startTime}</p>
                    <p className="text-[11px] text-destructive/70 mt-0.5 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{a.notes || "Annulé par le patient"}</p>
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
                <p className="text-sm text-primary">{currentApt.type}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Date</p><p className="text-sm font-medium text-foreground mt-0.5">{currentApt.date} à {currentApt.startTime}</p></div>
                  <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Type</p><p className="text-sm font-medium text-foreground mt-0.5 capitalize">{currentApt.type}</p></div>
                  <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Motif</p><p className="text-sm font-medium text-foreground mt-0.5">{currentApt.motif}</p></div>
                  <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Statut</p><div className="mt-0.5"><StatusBadge status={currentApt.status} /></div></div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  {isTeleconsult(currentApt) && (
                    <JoinTeleconsultButton scheduledAt={getScheduledAt(currentApt)} sessionId={currentApt.id} fullWidth />
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <Link to="/dashboard/patient/messages"><Button variant="outline" className="w-full text-xs"><MessageSquare className="h-3.5 w-3.5 mr-1" />Contacter</Button></Link>
                    {canModifyApt(currentApt) && <Button variant="outline" className="w-full text-xs" onClick={() => { setDrawerApt(null); setShowReschedule(currentApt.id); }}><RefreshCw className="h-3.5 w-3.5 mr-1" />Reprogrammer</Button>}
                  </div>
                  <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => { downloadCalendarEvent({ title: `RDV ${currentApt.doctor}`, startDate: new Date(`${currentApt.date}T${currentApt.startTime}:00`), location: "" }); toast({ title: "Calendrier", description: "Fichier .ics téléchargé." }); }}><CalendarPlus className="h-3.5 w-3.5 mr-1" />Ajouter au calendrier</Button>
                  {canCancelApt(currentApt) && (
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
                  <ReportButton type="dispute" targetId={String(currentApt.id)} targetName={`RDV ${currentApt.doctor} — ${currentApt.date}`} variant="button" size="sm" />
                </div>
              </div>
            )}

            {currentPast && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-foreground">{currentPast.doctor}</h3>
                  <button onClick={() => setDrawerApt(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
                </div>
                <p className="text-sm text-muted-foreground">{currentPast.motif} · {currentPast.date} à {currentPast.startTime}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Motif</p><p className="text-sm font-medium text-foreground mt-0.5">{currentPast.motif}</p></div>
                  <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Type</p><p className="text-sm font-medium text-foreground mt-0.5">{currentPast.type}</p></div>
                </div>
                <div className="mt-1"><StatusBadge status={currentPast.status} /></div>
                <div className="space-y-2">
                  {!reviewSent.has(currentPast.id) && (
                    <Button variant="outline" className="w-full text-xs" onClick={() => { setDrawerApt(null); setShowReviewModal(currentPast.id); }}>
                      <MessageSquare className="h-3.5 w-3.5 mr-1" />Laisser un avis
                    </Button>
                  )}
                  {reviewSent.has(currentPast.id) && (
                    <p className="text-xs text-accent flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Avis envoyé</p>
                  )}
                  <Link to="/search"><Button variant="outline" className="w-full text-xs"><RefreshCw className="h-3.5 w-3.5 mr-1" />Reprendre RDV</Button></Link>
                  <ReportButton type="appointment" targetId={String(currentPast.id)} targetName={`RDV ${currentPast.doctor} — ${currentPast.date}`} variant="button" size="sm" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>

    {/* Review modal */}
    {showReviewModal !== null && (() => {
      const apt = completedAppointments.find(a => a.id === showReviewModal);
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
      const apt = completedAppointments.find(a => a.id === showReportModal);
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
              <p className="text-sm text-muted-foreground"><strong>Observations :</strong> Le patient présente un état général satisfaisant. Constantes dans les normes.</p>
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
