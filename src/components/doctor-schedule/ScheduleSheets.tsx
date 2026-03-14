// All Sheet panels for DoctorSchedule — extracted to reduce main page size
import { Link } from "react-router-dom";
import {
  CalendarClock,
  Clock3,
  Loader2,
  Lock,
  MessageSquare,
  Phone,
  Plus,
  Printer,
  RefreshCcw,
  Stethoscope,
  UserRound,
  Video,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import type { AppointmentStatus, AppointmentType, SharedAppointment, SharedBlockedSlot, AppointmentColorKey } from "@/types/appointment";
import { DEFAULT_TYPE_COLORS } from "@/types/appointment";
import type { SharedPatient } from "@/stores/sharedPatientsStore";
import {
  STATUS_ACTIONS,
  TYPE_LABELS,
  DURATION_PRESETS,
  BLOCK_REASON_PRESETS,
  COLOR_OPTIONS,
  COLOR_STYLES,
  type AppointmentDraft,
  type BlockDraft,
  type BlockCalendarKind,
  type SlotActionState,
  type DraftMode,
} from "./scheduleConstants";
import {
  formatHumanDate,
  getEndTimeLabel,
  getStatusLabel,
  getStatusClasses,
  getStatusMarkerClasses,
  getStatusActionIcon,
  getStepIndex,
  statusActionLabel,
  getRecommendedNextStatus,
  getWorkflowHint,
  getConsultationHref,
  getAvatar,
  getBlockCalendarKind,
  displayBlockReason,
  getDayNameFromDateKey,
} from "./scheduleHelpers";

// ══════════════════════════════════════════════
// 1. Appointment Detail Sheet
// ══════════════════════════════════════════════

export function AppointmentDetailSheet({
  appointment,
  open,
  onClose,
  saving,
  onUpdateStatus,
  onEdit,
  onCopySms,
  rescheduleSuggestions,
  onQuickReschedule,
}: {
  appointment: SharedAppointment | null;
  open: boolean;
  onClose: () => void;
  saving: boolean;
  onUpdateStatus: (a: SharedAppointment, s: AppointmentStatus) => void;
  onEdit: (a: SharedAppointment) => void;
  onCopySms: (a: SharedAppointment) => void;
  rescheduleSuggestions: { date: string; startTime: string }[];
  onQuickReschedule: (a: SharedAppointment, date: string, time: string) => void;
}) {
  if (!appointment) return null;
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-base font-bold text-primary">
              {appointment.avatar || getAvatar(appointment.patient)}
            </span>
            <span>
              <span className="block text-lg sm:text-xl">{appointment.patient}</span>
              <span className={`mt-1 inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium ${getStatusClasses(appointment.status)}`}>
                {(() => { const I = getStatusActionIcon(appointment.status); return <I className="h-3.5 w-3.5" />; })()}
                <span>{getStatusLabel(appointment.status)}</span>
              </span>
            </span>
          </SheetTitle>
          <SheetDescription>{appointment.type} · {appointment.motif || "Sans motif"}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border bg-muted/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</p>
            <p className="mt-2 text-lg font-semibold">{formatHumanDate(appointment.date)}</p>
          </div>
          <div className="rounded-xl border bg-muted/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Heure</p>
            <p className="mt-2 text-lg font-semibold">{appointment.startTime} · {appointment.duration} min</p>
          </div>
          <div className="rounded-xl border bg-muted/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Assurance</p>
            <p className="mt-2 text-sm font-medium">{appointment.assurance || "—"}</p>
          </div>
          <div className="rounded-xl border bg-muted/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Téléphone</p>
            <p className="mt-2 text-sm font-medium">{appointment.phone || "—"}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-5 rounded-2xl border p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold">Progression du rendez-vous</h3>
            <span className="text-xs text-muted-foreground">
              {appointment.date} · {appointment.startTime}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {["Confirmé", "Arrivé", "Salle d'attente", "Consultation", "Terminé"].map((step, index) => {
              const active = index <= getStepIndex(appointment.status);
              return (
                <div key={step} className="space-y-2 text-center">
                  <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {index + 1}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{step}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommended action */}
        <div className="mt-5 space-y-4">
          <div className="rounded-2xl border bg-primary/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Étape recommandée</p>
                <h3 className="mt-1 font-semibold text-foreground">
                  {getRecommendedNextStatus(appointment.status)
                    ? statusActionLabel(getRecommendedNextStatus(appointment.status) as AppointmentStatus)
                    : "Aucune transition immédiate"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{getWorkflowHint(appointment.status)}</p>
              </div>
              <CalendarClock className="mt-0.5 h-5 w-5 text-primary" />
            </div>
            {appointment.status === "in_progress" ? (
              <Button asChild className="mt-4 w-full gradient-primary text-primary-foreground">
                <Link to={getConsultationHref(appointment)}>
                  <Stethoscope className="mr-2 h-4 w-4" /> Revenir à la consultation
                </Link>
              </Button>
            ) : getRecommendedNextStatus(appointment.status) ? (
              <Button
                className="mt-4 w-full gradient-primary text-primary-foreground"
                disabled={saving}
                onClick={() => onUpdateStatus(appointment, getRecommendedNextStatus(appointment.status) as AppointmentStatus)}
              >
                {(() => { const I = getStatusActionIcon(getRecommendedNextStatus(appointment.status) as AppointmentStatus); return <I className="mr-2 h-4 w-4" />; })()}
                {statusActionLabel(getRecommendedNextStatus(appointment.status) as AppointmentStatus)}
              </Button>
            ) : null}
          </div>

          {/* Status actions */}
          <div className="space-y-2">
            <h3 className="font-semibold">Actions du rendez-vous</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {STATUS_ACTIONS[appointment.status].map((nextStatus) => {
                const ActionIcon = getStatusActionIcon(nextStatus);
                return (
                  <Button
                    key={nextStatus}
                    variant={nextStatus === "cancelled" || nextStatus === "absent" ? "outline" : "default"}
                    className={nextStatus === "cancelled" || nextStatus === "absent" ? "justify-start" : "justify-start gradient-primary text-primary-foreground"}
                    disabled={saving}
                    onClick={() => onUpdateStatus(appointment, nextStatus)}
                  >
                    <ActionIcon className="mr-2 h-4 w-4" /> {statusActionLabel(nextStatus)}
                  </Button>
                );
              })}
              <Button variant="outline" className="justify-start" onClick={() => onEdit(appointment)}>
                <Clock3 className="mr-2 h-4 w-4" /> Modifier / reprogrammer
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" /> Imprimer la fiche
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => onCopySms(appointment)}>
                <MessageSquare className="mr-2 h-4 w-4" /> Copier le rappel
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <a href={`tel:${appointment.phone}`}>
                  <Phone className="mr-2 h-4 w-4" /> Appeler le patient
                </a>
              </Button>
              {appointment.patientId ? (
                <Button asChild variant="outline" className="justify-start">
                  <Link to={`/dashboard/doctor/patients/${appointment.patientId}`}>
                    <UserRound className="mr-2 h-4 w-4" /> Ouvrir le dossier patient
                  </Link>
                </Button>
              ) : null}
              <Button asChild variant="outline" className="justify-start">
                <Link to={getConsultationHref(appointment)}>
                  {appointment.teleconsultation ? <Video className="mr-2 h-4 w-4" /> : <Stethoscope className="mr-2 h-4 w-4" />}
                  {appointment.teleconsultation ? "Rejoindre la téléconsultation" : "Ouvrir la consultation"}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Reschedule suggestions — NO duplicate button */}
        <div className="mt-6 rounded-2xl border p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">Créneaux suggérés</h3>
              <p className="text-sm text-muted-foreground">2 créneaux proches.</p>
            </div>
            <RefreshCcw className="h-4 w-4 text-muted-foreground" />
          </div>
          {rescheduleSuggestions.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {rescheduleSuggestions.slice(0, 2).map((slot) => (
                <button
                  key={`${slot.date}-${slot.startTime}`}
                  type="button"
                  onClick={() => onQuickReschedule(appointment, slot.date, slot.startTime)}
                  className="rounded-full border px-3 py-2 text-left text-sm transition hover:border-primary/35 hover:bg-primary/5"
                  disabled={saving}
                >
                  {formatHumanDate(slot.date)} · {slot.startTime}
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Aucun créneau compatible trouvé.</p>
          )}
          <div className="mt-3">
            <Button variant="outline" size="sm" className="justify-start" onClick={() => onEdit(appointment)}>
              <RefreshCcw className="mr-2 h-4 w-4" /> Plus de créneaux
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ══════════════════════════════════════════════
// 2. Create/Edit Appointment Sheet
// ══════════════════════════════════════════════

export function CreateAppointmentSheet({
  open,
  onClose,
  draft,
  setDraft,
  draftMode,
  saving,
  patients,
  availableSlots,
  isClosedDay,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  draft: AppointmentDraft;
  setDraft: React.Dispatch<React.SetStateAction<AppointmentDraft>>;
  draftMode: DraftMode;
  saving: boolean;
  patients: SharedPatient[];
  availableSlots: string[];
  isClosedDay: boolean;
  onSubmit: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <div className="-mx-6 border-b bg-background px-6 pb-4 pt-6">
          <SheetHeader>
            <SheetTitle>{draftMode === "create" ? "Nouveau rendez-vous" : "Modifier le rendez-vous"}</SheetTitle>
            <SheetDescription>Création rapide : créneau réel, patient existant ou nouveau patient.</SheetDescription>
          </SheetHeader>

          <div className="mt-4 rounded-2xl border bg-muted/10 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Créneau retenu</p>
                <p className="mt-1 text-lg font-semibold leading-tight">{formatHumanDate(draft.date)}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {draft.startTime} → {getEndTimeLabel(draft.startTime, draft.duration)} · {draft.duration} min
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                  {draft.teleconsultation ? "Visio" : "Cabinet"}
                </span>
                <span className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">Auto-confirmé</span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1.1fr,0.9fr]">
              <div>
                <Label>Date</Label>
                <Input type="date" value={draft.date} onChange={(e) => setDraft((p) => ({ ...p, date: e.target.value }))} />
              </div>
              <div>
                <Label>Durée</Label>
                <Select value={String(draft.duration)} onValueChange={(v) => setDraft((p) => ({ ...p, duration: Number(v) }))}>
                  <SelectTrigger><SelectValue placeholder="Durée" /></SelectTrigger>
                  <SelectContent>
                    {[15, 20, 30, 45, 60, 90].map((d) => <SelectItem key={d} value={String(d)}>{d} minutes</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {DURATION_PRESETS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDraft((p) => ({ ...p, duration: d }))}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${draft.duration === d ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background hover:border-primary/40 hover:text-foreground"}`}
                >
                  {d} min
                </button>
              ))}
              {availableSlots[0] ? (
                <button
                  type="button"
                  onClick={() => setDraft((p) => ({ ...p, startTime: availableSlots[0] }))}
                  className="rounded-full border border-dashed px-3 py-1.5 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                >
                  Premier libre · {availableSlots[0]}
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-3 rounded-2xl border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold">Horaires disponibles</h3>
                <p className="text-sm text-muted-foreground">Choisissez directement l'horaire utile.</p>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">{getDayNameFromDateKey(draft.date)}</span>
            </div>
            {isClosedDay ? (
              <p className="mt-3 text-sm text-amber-600">Cabinet fermé ce jour.</p>
            ) : availableSlots.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {availableSlots.slice(0, 24).map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setDraft((p) => ({ ...p, startTime: slot }))}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${draft.startTime === slot ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background hover:border-primary/40 hover:text-foreground"}`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Aucun créneau libre sur cette durée pour cette date.</p>
            )}
          </div>
        </div>

        <div className="space-y-5 px-0 pb-2 pt-5">
          <div>
            <Label>Type de rendez-vous</Label>
            <Select
              value={draft.type}
              onValueChange={(v) => setDraft((p) => ({ ...p, type: v as AppointmentType, teleconsultation: v === "Téléconsultation" ? true : p.teleconsultation }))}
            >
              <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                {TYPE_LABELS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-2xl border p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold">Patient</h3>
                <p className="text-sm text-muted-foreground">Patient existant ou nouveau dossier.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant={draft.patientMode === "existing" ? "default" : "outline"}
                  className={draft.patientMode === "existing" ? "gradient-primary text-primary-foreground" : ""}
                  onClick={() => setDraft((p) => ({ ...p, patientMode: "existing" }))}>
                  Patient existant
                </Button>
                <Button type="button" size="sm" variant={draft.patientMode === "new" ? "default" : "outline"}
                  className={draft.patientMode === "new" ? "gradient-primary text-primary-foreground" : ""}
                  onClick={() => setDraft((p) => ({ ...p, patientMode: "new" }))}>
                  Nouveau patient
                </Button>
              </div>
            </div>
            <div className="mt-4">
              {draft.patientMode === "existing" ? (
                <>
                  <Label>Patient</Label>
                  <Select value={draft.patientId} onValueChange={(v) => {
                    const found = patients.find((i) => String(i.id) === v);
                    setDraft((p) => ({ ...p, patientId: v, patientName: found?.name || "", phone: found?.phone || p.phone, assurance: found?.assurance || p.assurance }));
                  }}>
                    <SelectTrigger><SelectValue placeholder="Choisir un patient" /></SelectTrigger>
                    <SelectContent>
                      {patients.map((pt) => <SelectItem key={pt.id} value={String(pt.id)}>{pt.name} · {pt.phone || "sans téléphone"}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {draft.patientId ? (() => {
                    const sp = patients.find((i) => String(i.id) === draft.patientId);
                    return sp ? (
                      <div className="mt-3 rounded-2xl border bg-muted/10 p-3 text-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-foreground">{sp.name}</p>
                            <p className="mt-1 text-muted-foreground">{sp.phone || "Téléphone non renseigné"}</p>
                            <p className="text-muted-foreground">{sp.assurance || "Assurance non renseignée"}</p>
                          </div>
                          <span className="rounded-full border bg-background px-2.5 py-1 text-[11px] text-muted-foreground">Patient existant</span>
                        </div>
                      </div>
                    ) : null;
                  })() : null}
                </>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label>Nom du patient</Label>
                    <Input value={draft.patientName} onChange={(e) => setDraft((p) => ({ ...p, patientName: e.target.value }))} placeholder="Nom et prénom" />
                  </div>
                  <div>
                    <Label>Téléphone</Label>
                    <Input value={draft.phone} onChange={(e) => setDraft((p) => ({ ...p, phone: e.target.value }))} placeholder="+216 ..." />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={draft.email} onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))} placeholder="patient@email.tn" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Motif</Label>
              <Input value={draft.motif} onChange={(e) => setDraft((p) => ({ ...p, motif: e.target.value }))} placeholder="Motif médical ou administratif" />
            </div>
            <div>
              <Label>Assurance</Label>
              <Input value={draft.assurance} onChange={(e) => setDraft((p) => ({ ...p, assurance: e.target.value }))} placeholder="Assurance / mutuelle" />
            </div>
            <div>
              <Label>Canal</Label>
              <Select value={draft.teleconsultation ? "oui" : "non"} onValueChange={(v) => setDraft((p) => ({ ...p, teleconsultation: v === "oui" }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="non">Cabinet</SelectItem>
                  <SelectItem value="oui">Vidéo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Notes internes</Label>
              <Textarea value={draft.notes} onChange={(e) => setDraft((p) => ({ ...p, notes: e.target.value }))} placeholder="Instructions internes..." />
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onClose} disabled={saving}>Annuler</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={onSubmit} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              {draftMode === "create" ? "Créer le rendez-vous" : "Enregistrer les modifications"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ══════════════════════════════════════════════
// 3. Colors Sheet
// ══════════════════════════════════════════════

export function ColorsSheet({
  open,
  onClose,
  typeColors,
  setTypeColors,
  resolveTypeClasses,
}: {
  open: boolean;
  onClose: () => void;
  typeColors: Record<AppointmentType, AppointmentColorKey>;
  setTypeColors: React.Dispatch<React.SetStateAction<Record<AppointmentType, AppointmentColorKey>>>;
  resolveTypeClasses: (t: AppointmentType) => string;
}) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Couleurs du planning</SheetTitle>
          <SheetDescription>Personnalisez la couleur des cartes par type de rendez-vous.</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-5">
          {TYPE_LABELS.map((type) => (
            <div key={type} className="rounded-2xl border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{type}</p>
                  <p className="text-xs text-muted-foreground">Aperçu dans l'agenda</p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-medium ${resolveTypeClasses(type)}`}>{type}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {COLOR_OPTIONS.map((option) => (
                  <button
                    key={`${type}-${option.key}`}
                    type="button"
                    onClick={() => setTypeColors((prev) => ({ ...prev, [type]: option.key }))}
                    className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${typeColors[type] === option.key ? "ring-2 ring-primary/30" : "hover:border-primary/30"} ${option.className}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full" onClick={() => setTypeColors({ ...DEFAULT_TYPE_COLORS })}>
            Réinitialiser les couleurs
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ══════════════════════════════════════════════
// 4. Block Sheet
// ══════════════════════════════════════════════

export function BlockSheet({
  open,
  onClose,
  blockDraft,
  setBlockDraft,
  saving,
  blockAvailableSlots,
  conflictingAppointments,
  blockConflictAction,
  setBlockConflictAction,
  blockRepeatWeeks,
  setBlockRepeatWeeks,
  isClosedDay,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  blockDraft: BlockDraft;
  setBlockDraft: React.Dispatch<React.SetStateAction<BlockDraft>>;
  saving: boolean;
  blockAvailableSlots: string[];
  conflictingAppointments: SharedAppointment[];
  blockConflictAction: "keep" | "cancel";
  setBlockConflictAction: (v: "keep" | "cancel") => void;
  blockRepeatWeeks: number;
  setBlockRepeatWeeks: (v: number) => void;
  isClosedDay: boolean;
  onSubmit: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <div className="-mx-6 border-b bg-background px-6 pb-4 pt-6">
          <SheetHeader>
            <SheetTitle>{blockDraft.calendarKind === "personal" ? "Événement personnel" : "Bloquer un créneau"}</SheetTitle>
            <SheetDescription>
              {blockDraft.calendarKind === "personal" ? "Déjeuner, administratif, déplacement ou agenda personnel." : "Pause, réunion, formation, fermeture exceptionnelle."}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 rounded-2xl border bg-muted/10 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Plage sélectionnée</p>
            <p className="mt-1 text-base font-semibold">{formatHumanDate(blockDraft.date)} · {blockDraft.startTime} → {getEndTimeLabel(blockDraft.startTime, blockDraft.duration)}</p>
            <p className="mt-1 text-sm text-muted-foreground">Calendrier {blockDraft.calendarKind === "personal" ? "personnel" : "cabinet"} · durée {blockDraft.duration} min</p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Date</Label>
              <Input type="date" value={blockDraft.date} onChange={(e) => setBlockDraft((p) => ({ ...p, date: e.target.value }))} />
            </div>
            <div>
              <Label>Durée libre (minutes)</Label>
              <Input type="number" min={5} step={5} value={String(blockDraft.duration)} onChange={(e) => setBlockDraft((p) => ({ ...p, duration: Math.max(5, Number(e.target.value) || 5) }))} />
            </div>
            <div>
              <Label>Calendrier</Label>
              <Select value={blockDraft.calendarKind} onValueChange={(v) => setBlockDraft((p) => ({ ...p, calendarKind: v as BlockCalendarKind, reason: BLOCK_REASON_PRESETS[v as BlockCalendarKind][0] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cabinet">Cabinet</SelectItem>
                  <SelectItem value="personal">Personnel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Motif</Label>
              <Input value={blockDraft.reason} onChange={(e) => setBlockDraft((p) => ({ ...p, reason: e.target.value }))} />
              <div className="mt-3 flex flex-wrap gap-2">
                {BLOCK_REASON_PRESETS[blockDraft.calendarKind].map((preset) => (
                  <button key={preset} type="button" onClick={() => setBlockDraft((p) => ({ ...p, reason: preset }))}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${blockDraft.reason === preset ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:border-primary/40 hover:text-foreground"}`}>
                    {preset}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {[15, 30, 45, 60, 90, 120, 180].map((d) => (
                  <button key={d} type="button" onClick={() => setBlockDraft((p) => ({ ...p, duration: d }))}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${blockDraft.duration === d ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:border-primary/40 hover:text-foreground"}`}>
                    {d >= 120 ? `${d / 60}h` : `${d} min`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Repeat */}
          <div className="rounded-2xl border p-4">
            <h3 className="font-semibold">Répéter ce blocage</h3>
            <p className="text-sm text-muted-foreground">Utile pour une pause récurrente.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[1, 2, 4, 8].map((w) => (
                <button key={w} type="button" onClick={() => setBlockRepeatWeeks(w)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${blockRepeatWeeks === w ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:border-primary/40 hover:text-foreground"}`}>
                  {w === 1 ? "Une seule fois" : `${w} semaines`}
                </button>
              ))}
            </div>
          </div>

          {/* Available times */}
          <div className="rounded-2xl border p-4">
            <h3 className="font-semibold">Heure du blocage</h3>
            <p className="text-sm text-muted-foreground">Choisissez l'heure de début.</p>
            {isClosedDay ? (
              <p className="mt-3 text-sm text-amber-600">Cabinet fermé ce jour.</p>
            ) : blockAvailableSlots.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {blockAvailableSlots.slice(0, 24).map((slot) => (
                  <button key={slot} type="button" onClick={() => setBlockDraft((p) => ({ ...p, startTime: slot }))}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${blockDraft.startTime === slot ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background hover:border-primary/40 hover:text-foreground"}`}>
                    {slot}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Aucune plage libre compatible.</p>
            )}
          </div>

          {/* Conflicts */}
          <div className="rounded-2xl border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">Rendez-vous concernés</h3>
                <p className="text-sm text-muted-foreground">Gérez les conflits avant de bloquer.</p>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">{conflictingAppointments.length}</span>
            </div>
            {conflictingAppointments.length ? (
              <>
                <div className="mt-3 space-y-2">
                  {conflictingAppointments.map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl border bg-muted/10 px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{a.patient}</p>
                        <p className="text-xs text-muted-foreground">{a.startTime} · {a.duration} min · {a.type}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-1 text-[10px] font-medium text-muted-foreground">
                        <span className={`h-2 w-2 rounded-full ${getStatusMarkerClasses(a.status)}`} />
                        {getStatusLabel(a.status)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <button type="button" onClick={() => setBlockConflictAction("keep")}
                    className={`rounded-xl border px-3 py-2 text-left text-sm transition ${blockConflictAction === "keep" ? "border-primary bg-primary/5 text-foreground" : "bg-background hover:border-primary/30"}`}>
                    <p className="font-medium">Laisser les rendez-vous</p>
                    <p className="mt-1 text-xs text-muted-foreground">Les rendez-vous existants restent en place.</p>
                  </button>
                  <button type="button" onClick={() => setBlockConflictAction("cancel")}
                    className={`rounded-xl border px-3 py-2 text-left text-sm transition ${blockConflictAction === "cancel" ? "border-destructive bg-destructive/5 text-foreground" : "bg-background hover:border-destructive/30"}`}>
                    <p className="font-medium">Annuler les rendez-vous</p>
                    <p className="mt-1 text-xs text-muted-foreground">Les rendez-vous concernés seront annulés.</p>
                  </button>
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Aucun rendez-vous ne chevauche ce blocage.</p>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onClose} disabled={saving}>Annuler</Button>
            <Button variant="destructive" onClick={onSubmit} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
              Bloquer le créneau
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ══════════════════════════════════════════════
// 5. Slot Action Sheet (no "Effacer la sélection" button)
// ══════════════════════════════════════════════

export function SlotActionSheet({
  slotAction,
  onClose,
  onCreateAppointment,
  onBlockCabinet,
  onBlockPersonal,
}: {
  slotAction: SlotActionState | null;
  onClose: () => void;
  onCreateAppointment: (date: string, time: string, duration: number) => void;
  onBlockCabinet: (date: string, time: string, duration: number) => void;
  onBlockPersonal: (date: string, time: string, duration: number) => void;
}) {
  return (
    <Sheet open={Boolean(slotAction)} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        {slotAction && (
          <>
            <SheetHeader>
              <SheetTitle>Créneau sélectionné</SheetTitle>
              <SheetDescription>
                {formatHumanDate(slotAction.date)} · {slotAction.startTime} → {slotAction.endTime}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border bg-muted/10 p-4 text-sm text-muted-foreground">
                <p>
                  {slotAction.closedDay
                    ? "Cabinet fermé ce jour. Vous pouvez quand même réserver cette plage ponctuellement."
                    : "Créez un rendez-vous ou bloquez cette plage."}
                </p>
                <p className="mt-2 font-medium text-foreground">Durée sélectionnée : {slotAction.duration} min</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {DURATION_PRESETS.map((d) => (
                    <button key={d} type="button"
                      onClick={() => onClose()}
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${slotAction.duration === d ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background hover:border-primary/40 hover:text-foreground"}`}>
                      {d} min
                    </button>
                  ))}
                </div>
              </div>
              <Button className="w-full gradient-primary text-primary-foreground" onClick={() => onCreateAppointment(slotAction.date, slotAction.startTime, slotAction.duration)}>
                <Plus className="mr-2 h-4 w-4" /> Créer un rendez-vous
              </Button>
              <Button variant="outline" className="w-full" onClick={() => onBlockCabinet(slotAction.date, slotAction.startTime, slotAction.duration)}>
                <Lock className="mr-2 h-4 w-4" /> Bloquer en cabinet
              </Button>
              <Button variant="outline" className="w-full" onClick={() => onBlockPersonal(slotAction.date, slotAction.startTime, slotAction.duration)}>
                <CalendarClock className="mr-2 h-4 w-4" /> Bloquer en personnel
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ══════════════════════════════════════════════
// 6. Block Detail Sheet
// ══════════════════════════════════════════════

export function BlockDetailSheet({
  block,
  onClose,
  onDelete,
  onCreateOnSlot,
}: {
  block: SharedBlockedSlot | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onCreateOnSlot: (date: string, time: string, duration: number) => void;
}) {
  return (
    <Sheet open={Boolean(block)} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        {block && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" /> {displayBlockReason(block.reason)}
              </SheetTitle>
              <SheetDescription>{formatHumanDate(block.date)} · {block.startTime} · {block.duration} min</SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border bg-muted/10 p-4 text-sm text-muted-foreground">
                Type de calendrier : <strong className="text-foreground">{getBlockCalendarKind(block.reason) === "personal" ? "Personnel" : "Cabinet"}</strong><br />
                Motif : <strong className="text-foreground">{displayBlockReason(block.reason)}</strong>
              </div>
              <Button className="w-full gradient-primary text-primary-foreground" onClick={() => onCreateOnSlot(block.date, block.startTime, block.duration)}>
                <Plus className="mr-2 h-4 w-4" /> Créer un rendez-vous sur ce créneau
              </Button>
              <Button variant="destructive" className="w-full" onClick={() => onDelete(block.id)}>
                <X className="mr-2 h-4 w-4" /> Supprimer le blocage
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
