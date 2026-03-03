import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Calendar, Clock, MapPin, Plus, Video, MessageSquare, X, RefreshCw, CheckCircle2, Shield, AlertTriangle, ChevronDown, Navigation, FileText, UserX, CalendarPlus, ChevronRight, Star, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import StatusBadge, { type AppointmentStatus } from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import JoinTeleconsultButton from "@/components/teleconsultation/JoinTeleconsultButton";

type Tab = "upcoming" | "past" | "cancelled";

import { 
  mockPatientAppointmentsFull as initialAppointments, 
  mockPastAppointments as initialPastAppointments,
  mockCancelledAppointments 
} from "@/data/mockData";

const PatientAppointments = () => {
  const [tab, setTab] = useState<Tab>("upcoming");
  const [appointments, setAppointments] = useState(initialAppointments);
  const [cancelledList, setCancelledList] = useState(mockCancelledAppointments);
  const [showCancelConfirm, setShowCancelConfirm] = useState<number | null>(null);
  const [drawerApt, setDrawerApt] = useState<number | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewSent, setReviewSent] = useState<Set<number>>(new Set());
  const [showReportModal, setShowReportModal] = useState<number | null>(null);

  const handleCancel = (id: number) => {
    const apt = appointments.find(a => a.id === id);
    if (apt) {
      setCancelledList(prev => [{ id: apt.id, doctor: apt.doctor, specialty: apt.specialty, date: apt.date, time: apt.time, reason: "Annulation par le patient", avatar: apt.avatar }, ...prev]);
      setAppointments(prev => prev.filter(a => a.id !== id));
    }
    setShowCancelConfirm(null);
    setDrawerApt(null);
  };

  const currentApt = drawerApt ? appointments.find(a => a.id === drawerApt) : null;
  const currentPast = drawerApt ? initialPastAppointments.find(a => a.id === drawerApt) : null;

  return (
  <>
    <DashboardLayout role="patient" title="Mes rendez-vous">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex gap-1 rounded-lg border bg-card p-1">
            {([
              { key: "upcoming" as Tab, label: "À venir", count: appointments.length },
              { key: "past" as Tab, label: "Passés", count: initialPastAppointments.length },
              { key: "cancelled" as Tab, label: "Annulés", count: cancelledList.length },
            ]).map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
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
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{a.date} à {a.time}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">{a.type === "teleconsultation" ? <><Video className="h-3 w-3 text-primary" />Téléconsult</> : <><MapPin className="h-3 w-3" /><span className="truncate max-w-[120px] sm:max-w-none">{a.address}</span></>}</span>
                      </div>
                      {/* Bouton rejoindre inline pour les téléconsultations */}
                      {a.type === "teleconsultation" && (a as any).scheduledAt && (
                        <div className="mt-2" onClick={e => e.stopPropagation()}>
                          <JoinTeleconsultButton scheduledAt={(a as any).scheduledAt} sessionId={(a as any).sessionId || "teleconsult-1"} />
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

        {/* ── Past ── */}
        {tab === "past" && (
          <div className="space-y-3">
            {initialPastAppointments.length === 0 && <EmptyState icon={Calendar} title="Aucun rendez-vous passé" description="Vos rendez-vous passés apparaîtront ici." />}
            {initialPastAppointments.map(a => (
              <button key={a.id} onClick={() => setDrawerApt(a.id)} className="w-full text-left rounded-xl border bg-card shadow-card hover:shadow-card-hover transition-all p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 ${a.status === "no-show" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>{a.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-foreground text-sm truncate">{a.doctor}</h3>
                      <StatusBadge status={a.status} />
                    </div>
                    <p className="text-[11px] text-muted-foreground">{a.specialty} · {a.date} à {a.time}</p>
                    <p className="text-[11px] text-muted-foreground">Motif : {a.motif} · <span className="font-semibold text-foreground">{a.amount}</span></p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              </button>
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
                  <Link to={`/booking/${a.id}`}><Button variant="outline" size="sm" className="h-7 text-xs shrink-0"><RefreshCw className="h-3 w-3 mr-1" />Reprendre</Button></Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Detail drawer ── */}
      {(currentApt || currentPast) && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setDrawerApt(null)}>
          <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border bg-card shadow-elevated p-5 mx-0 sm:mx-4 animate-fade-in max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
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
                    <div><p className="text-xs font-medium text-foreground">Adresse</p><p className="text-xs text-muted-foreground">{currentApt.address}</p><button className="text-[10px] text-primary hover:underline mt-1">Voir l'itinéraire →</button></div>
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
                {/* Actions */}
                <div className="space-y-2">
                  {/* Bouton teleconsultation dynamique */}
                  {currentApt.type === "teleconsultation" && (currentApt as any).scheduledAt && (
                    <JoinTeleconsultButton scheduledAt={(currentApt as any).scheduledAt} sessionId={(currentApt as any).sessionId || "teleconsult-1"} fullWidth />
                  )}
                  {/* Fallback si pas de scheduledAt (ancien mock) */}
                  {currentApt.type === "teleconsultation" && !(currentApt as any).scheduledAt && (
                    <JoinTeleconsultButton scheduledAt={new Date(Date.now() + 10 * 60_000).toISOString()} sessionId="teleconsult-1" fullWidth />
                  )}
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
                  <Link to={`/booking/${currentPast.id}`}><Button variant="outline" className="w-full text-xs"><RefreshCw className="h-3.5 w-3.5 mr-1" />Reprendre RDV</Button></Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>

    {/* Review modal */}
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
            <p className="text-sm text-muted-foreground mb-1">Consultation avec {apt.doctor}</p>
            <p className="text-xs text-muted-foreground mb-4">{apt.date} · {apt.motif}</p>
            <div className="flex items-center gap-1.5 mb-3 text-xs text-primary bg-primary/5 rounded-lg px-3 py-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="font-medium">Consultation vérifiée</span>
              <span className="text-muted-foreground">— Votre avis sera marqué comme vérifié</span>
            </div>
            <Textarea
              placeholder="Partagez votre expérience avec ce praticien..."
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowReviewModal(null)}>Annuler</Button>
              <Button className="flex-1 gradient-primary text-primary-foreground" disabled={!reviewText.trim()} onClick={() => {
                setReviewSent(prev => new Set([...prev, showReviewModal]));
                setShowReviewModal(null);
                setReviewText("");
              }}>
                <Send className="h-3.5 w-3.5 mr-1" />Envoyer
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
          <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border bg-card shadow-elevated p-5 mx-0 sm:mx-4 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="sm:hidden flex justify-center mb-3"><div className="h-1 w-10 rounded-full bg-muted-foreground/20" /></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Compte-rendu</h3>
              <button onClick={() => setShowReportModal(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{apt.doctor} · {apt.date}</p>
            <div className="rounded-lg bg-muted/50 p-4 text-sm text-foreground space-y-2">
              <p><strong>Motif :</strong> {apt.motif}</p>
              <p><strong>Examen clinique :</strong> État général satisfaisant. Constantes normales.</p>
              <p><strong>Diagnostic :</strong> Suivi de routine — pas d'anomalie détectée.</p>
              <p><strong>Conduite à tenir :</strong> Continuer le traitement en cours. Prochain contrôle dans 3 mois.</p>
            </div>
            <Button variant="outline" className="w-full mt-4 text-xs" onClick={() => setShowReportModal(null)}>Fermer</Button>
          </div>
        </div>
      );
    })()}
  </>
  );
};

export default PatientAppointments;
