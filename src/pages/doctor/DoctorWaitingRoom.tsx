/**
 * DoctorWaitingRoom — Salle d'attente du cabinet.
 * Data source: sharedAppointmentsStore (dual-mode demo/production).
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Clock, Play, CheckCircle2, XCircle, AlertTriangle,
  Phone, MessageSquare, FileText, MoreHorizontal,
  User, StickyNote, Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import {
  useSharedAppointments, updateAppointmentStatus, toggleAppointmentTag, saveAppointmentNote,
  markPatientArrived, sendToWaitingRoom, startAppointmentConsultation, completeAppointmentConsultation,
  markAppointmentAbsent, getTodayDate,
} from "@/stores/sharedAppointmentsStore";
import { useSharedPatients } from "@/stores/sharedPatientsStore";
import type { AppointmentStatus, SharedAppointment } from "@/types/appointment";
import { APPOINTMENT_STATUS_CONFIG } from "@/types/appointment";
import { readAuthUser } from "@/stores/authStore";

const getCurrentDoctor = () => readAuthUser()?.doctorName || "Dr. Bouazizi";

const statusLabels: Record<AppointmentStatus, string> = {
  pending: "À venir",
  confirmed: "Confirmé",
  arrived: "Arrivé",
  in_waiting: "En attente",
  in_progress: "En consultation",
  done: "Terminé",
  cancelled: "Annulé",
  absent: "Absent",
};

const DoctorWaitingRoom = () => {
  const [allAppointments, , { isLoading }] = useSharedAppointments();
  const [patients] = useSharedPatients();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | AppointmentStatus>("all");
  const [noteModal, setNoteModal] = useState<{ open: boolean; id: string | null; note: string }>({ open: false, id: null, note: "" });
  const [absentConfirm, setAbsentConfirm] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const today = getTodayDate();

  // Today's appointments for current doctor = waiting room
  const entries = useMemo(() =>
    allAppointments.filter(a => a.date === today && a.doctor === getCurrentDoctor()),
    [allAppointments, today]
  );

  const getPatientId = (name: string) => {
    const p = patients.find(p => p.name === name);
    return p ? p.id : 1;
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return entries
      .filter(e => filter === "all" || e.status === filter)
      .filter(e => !q || e.patient.toLowerCase().includes(q) || e.motif.toLowerCase().includes(q))
      .sort((a, b) => {
        const priority: Record<AppointmentStatus, number> = {
          in_progress: 0, in_waiting: 1, arrived: 2, confirmed: 3, pending: 4, done: 5, cancelled: 6, absent: 7
        };
        const pDiff = priority[a.status] - priority[b.status];
        if (pDiff !== 0) return pDiff;
        return a.startTime.localeCompare(b.startTime);
      });
  }, [entries, filter, search]);

  const stats = useMemo(() => ({
    total: entries.filter(e => !["done", "cancelled", "absent"].includes(e.status)).length,
    waiting: entries.filter(e => e.status === "in_waiting").length,
    inConsult: entries.filter(e => e.status === "in_progress").length,
    completed: entries.filter(e => e.status === "done").length,
    absent: entries.filter(e => e.status === "absent").length,
  }), [entries]);

  const handleSetStatus = (id: string, newStatus: AppointmentStatus) => {
    if (newStatus === "arrived") markPatientArrived(id);
    else if (newStatus === "in_waiting") sendToWaitingRoom(id);
    else if (newStatus === "in_progress") startAppointmentConsultation(id);
    else if (newStatus === "done") completeAppointmentConsultation(id);
    else if (newStatus === "absent") markAppointmentAbsent(id);
    else updateAppointmentStatus(id, newStatus);
    toast({ title: "Statut mis à jour", description: `Patient marqué comme "${statusLabels[newStatus]}"` });
  };

  const handleSaveNote = () => {
    if (noteModal.id === null) return;
    saveAppointmentNote(noteModal.id, noteModal.note);
    toast({ title: "Note enregistrée", description: "Note interne sauvegardée." });
    setNoteModal({ open: false, id: null, note: "" });
  };

  const confirmAbsent = () => {
    if (absentConfirm.id !== null) {
      handleSetStatus(absentConfirm.id, "absent");
    }
    setAbsentConfirm({ open: false, id: null });
  };

  if (isLoading) {
    return <DashboardLayout role="doctor" title="Salle d'attente"><LoadingSkeleton type="table" /></DashboardLayout>;
  }

  return (
    <DashboardLayout role="doctor" title="Salle d'attente">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">En attente</p>
          </div>
          <div className="rounded-xl border bg-warning/10 border-warning/20 p-4 text-center">
            <p className="text-2xl font-bold text-warning">{stats.waiting}</p>
            <p className="text-xs text-warning/80">Attendent</p>
          </div>
          <div className="rounded-xl border bg-accent/10 border-accent/20 p-4 text-center">
            <p className="text-2xl font-bold text-accent">{stats.inConsult}</p>
            <p className="text-xs text-accent/80">En consultation</p>
          </div>
          <div className="rounded-xl border bg-muted p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">Terminés</p>
          </div>
          <div className="rounded-xl border bg-destructive/10 border-destructive/20 p-4 text-center">
            <p className="text-2xl font-bold text-destructive">{stats.absent}</p>
            <p className="text-xs text-destructive/80">Absents</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher un patient..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-1.5 overflow-x-auto">
            {(["all", "in_waiting", "arrived", "in_progress", "confirmed", "pending", "done", "absent"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                {f === "all" ? "Tous" : statusLabels[f as AppointmentStatus]}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="rounded-xl border bg-card shadow-card divide-y">
          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">Aucun patient dans la salle d'attente</div>
          )}
          {filtered.map(entry => (
            <div key={entry.id} className={`p-4 transition-colors ${entry.status === "in_progress" ? "bg-accent/5" : entry.status === "in_waiting" ? "bg-warning/5" : ""}`}>
              <div className="flex items-start gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${entry.status === "in_progress" ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {entry.avatar}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link to={`/dashboard/doctor/patients/${getPatientId(entry.patient)}`} className="font-semibold text-foreground hover:text-primary truncate">
                      {entry.patient}
                    </Link>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${APPOINTMENT_STATUS_CONFIG[entry.status].className}`}>
                      {statusLabels[entry.status]}
                    </span>
                    {entry.tags?.includes("urgent") && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />Urgent
                      </span>
                    )}
                    {entry.tags?.includes("retard") && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-warning/10 text-warning flex items-center gap-1">
                        <Clock className="h-3 w-3" />Retard
                      </span>
                    )}
                    {entry.assurance && entry.assurance !== "Sans assurance" && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">Assuré</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    RDV {entry.startTime} · {entry.motif} · {entry.type} · {entry.duration}min
                  </p>
                  {entry.arrivedAt && !["done", "absent"].includes(entry.status) && (
                    <p className="text-xs text-primary mt-0.5">Arrivé à {entry.arrivedAt}</p>
                  )}
                  {entry.internalNote && (
                    <p className="text-xs text-muted-foreground mt-1 bg-muted/50 rounded px-2 py-1 flex items-start gap-1">
                      <StickyNote className="h-3 w-3 shrink-0 mt-0.5" />{entry.internalNote}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {(entry.status === "pending" || entry.status === "confirmed") && (
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleSetStatus(entry.id, "arrived")}>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-primary" />Arrivé
                    </Button>
                  )}
                  {entry.status === "arrived" && (
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleSetStatus(entry.id, "in_waiting")}>
                      <Clock className="h-3.5 w-3.5 mr-1 text-warning" />En attente
                    </Button>
                  )}
                  {(entry.status === "in_waiting" || entry.status === "arrived") && (
                    <Link to={`/dashboard/doctor/consultation/new?patient=${entry.patientId ?? getPatientId(entry.patient)}&aptId=${entry.id}${entry.teleconsultation ? "&teleconsult=true" : ""}`}>
                      <Button size="sm" className="h-8 text-xs gradient-primary text-primary-foreground">
                        <Play className="h-3.5 w-3.5 mr-1" />Appeler
                      </Button>
                    </Link>
                  )}
                  {entry.status === "in_progress" && (
                    <Button size="sm" variant="outline" className="h-8 text-xs border-accent text-accent hover:bg-accent/10" onClick={() => handleSetStatus(entry.id, "done")}>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Terminer
                    </Button>
                  )}

                  {/* Dropdown */}
                  <div className="relative group">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border bg-card shadow-elevated p-1 hidden group-focus-within:block group-hover:block z-50">
                      <Link to={`/dashboard/doctor/patients/${getPatientId(entry.patient)}`} className="flex items-center gap-2 rounded-md px-3 py-2 text-xs hover:bg-muted transition-colors text-foreground">
                        <FileText className="h-3.5 w-3.5 text-primary" />Dossier patient
                      </Link>
                      {entry.phone && (
                        <a href={`tel:${entry.phone}`} className="flex items-center gap-2 rounded-md px-3 py-2 text-xs hover:bg-muted transition-colors text-foreground">
                          <Phone className="h-3.5 w-3.5 text-primary" />Appeler {entry.phone}
                        </a>
                      )}
                      <button className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-xs hover:bg-muted transition-colors text-foreground">
                        <MessageSquare className="h-3.5 w-3.5 text-primary" />Message
                      </button>
                      <button
                        onClick={() => setNoteModal({ open: true, id: entry.id, note: entry.internalNote || "" })}
                        className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-xs hover:bg-muted transition-colors text-foreground"
                      >
                        <StickyNote className="h-3.5 w-3.5 text-warning" />Note interne
                      </button>
                      <div className="border-t my-1" />
                      <button
                        onClick={() => toggleAppointmentTag(entry.id, "urgent")}
                        className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-xs hover:bg-muted transition-colors text-foreground"
                      >
                        <Tag className="h-3.5 w-3.5 text-destructive" />{entry.tags?.includes("urgent") ? "Retirer Urgent" : "Marquer Urgent"}
                      </button>
                      <button
                        onClick={() => toggleAppointmentTag(entry.id, "retard")}
                        className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-xs hover:bg-muted transition-colors text-foreground"
                      >
                        <Clock className="h-3.5 w-3.5 text-warning" />{entry.tags?.includes("retard") ? "Retirer Retard" : "Marquer Retard"}
                      </button>
                      <div className="border-t my-1" />
                      {!["done", "absent"].includes(entry.status) && (
                        <button
                          onClick={() => setAbsentConfirm({ open: true, id: entry.id })}
                          className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-xs hover:bg-destructive/10 transition-colors text-destructive"
                        >
                          <XCircle className="h-3.5 w-3.5" />Marquer Absent
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Note Modal */}
      {noteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setNoteModal({ open: false, id: null, note: "" })}>
          <div className="w-full max-w-md rounded-2xl border bg-card shadow-elevated p-6 mx-4 animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-warning" />Note interne
            </h3>
            <p className="text-xs text-muted-foreground mb-3">Cette note est visible uniquement par le médecin et la secrétaire.</p>
            <textarea
              value={noteModal.note}
              onChange={e => setNoteModal(prev => ({ ...prev, note: e.target.value }))}
              placeholder="Ex: Patient anxieux, prévoir plus de temps..."
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setNoteModal({ open: false, id: null, note: "" })}>Annuler</Button>
              <Button className="gradient-primary text-primary-foreground" onClick={handleSaveNote}>Enregistrer</Button>
            </div>
          </div>
        </div>
      )}

      {/* Absent Confirm */}
      <ConfirmDialog
        open={absentConfirm.open}
        onCancel={() => setAbsentConfirm({ open: false, id: null })}
        onConfirm={confirmAbsent}
        title="Marquer comme absent"
        description="Confirmez-vous que ce patient ne s'est pas présenté ? Cette action sera enregistrée dans son dossier."
        variant="danger"
      />
    </DashboardLayout>
  );
};

export default DoctorWaitingRoom;
