/**
 * DoctorWaitingRoom — Salle d'attente du cabinet
 * Statuts: scheduled → arrived → waiting → in_consultation → completed / absent
 * Notes internes cabinet (non visibles par le patient)
 * Tags: urgent / retard
 * 
 * // TODO BACKEND: GET /api/doctor/waiting-room, PUT /api/waiting-room/:id/status
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Clock, Play, CheckCircle2, XCircle, AlertTriangle,
  Phone, MessageSquare, FileText, RefreshCw, MoreHorizontal,
  User, ChevronRight, Bell, StickyNote, Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { mockTodaySchedule, mockPatients } from "@/data/mockData";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

// ── Types ────────────────────────────────────────────────────
type WaitingStatus = "scheduled" | "arrived" | "waiting" | "in_consultation" | "completed" | "absent";
type WaitingEntry = {
  id: number;
  patient: string;
  avatar: string;
  time: string;
  motif: string;
  type: string;
  duration: string;
  status: WaitingStatus;
  arrivedAt?: string;
  phone?: string;
  assurance?: boolean;
  teleconsultation?: boolean;
  internalNote?: string;
  tags?: ("urgent" | "retard")[];
};

const statusConfig: Record<WaitingStatus, { label: string; color: string; bgColor: string }> = {
  scheduled: { label: "À venir", color: "text-muted-foreground", bgColor: "bg-muted" },
  arrived: { label: "Arrivé", color: "text-primary", bgColor: "bg-primary/10" },
  waiting: { label: "En attente", color: "text-warning", bgColor: "bg-warning/10" },
  in_consultation: { label: "En consultation", color: "text-accent", bgColor: "bg-accent/10" },
  completed: { label: "Terminé", color: "text-muted-foreground", bgColor: "bg-muted/50" },
  absent: { label: "Absent", color: "text-destructive", bgColor: "bg-destructive/10" },
};

const getPatientId = (name: string) => {
  const p = mockPatients.find(p => p.name === name);
  return p ? p.id : 1;
};

// ── Component ────────────────────────────────────────────────
const DoctorWaitingRoom = () => {
  // Initial state from mock schedule
  const [entries, setEntries] = useState<WaitingEntry[]>(() =>
    mockTodaySchedule.map((s, i) => ({
      id: i + 1,
      patient: s.patient,
      avatar: s.avatar,
      time: s.time,
      motif: s.motif,
      type: s.type,
      duration: s.duration,
      status: s.status === "done" ? "completed" : s.status === "current" ? "in_consultation" : "scheduled",
      arrivedAt: s.status === "done" ? s.time : s.status === "current" ? s.time : undefined,
      phone: s.phone,
      assurance: s.assurance ? true : false,
      teleconsultation: s.teleconsultation,
      internalNote: "",
      tags: [],
    }))
  );

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | WaitingStatus>("all");
  const [noteModal, setNoteModal] = useState<{ open: boolean; id: number | null; note: string }>({ open: false, id: null, note: "" });
  const [absentConfirm, setAbsentConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  // Filtered entries
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return entries
      .filter(e => filter === "all" || e.status === filter)
      .filter(e => !q || e.patient.toLowerCase().includes(q) || e.motif.toLowerCase().includes(q))
      .sort((a, b) => {
        // Sort by status priority then time
        const priority: Record<WaitingStatus, number> = {
          in_consultation: 0, waiting: 1, arrived: 2, scheduled: 3, completed: 4, absent: 5
        };
        const pDiff = priority[a.status] - priority[b.status];
        if (pDiff !== 0) return pDiff;
        return a.time.localeCompare(b.time);
      });
  }, [entries, filter, search]);

  // Stats
  const stats = useMemo(() => ({
    total: entries.filter(e => !["completed", "absent"].includes(e.status)).length,
    waiting: entries.filter(e => e.status === "waiting").length,
    inConsult: entries.filter(e => e.status === "in_consultation").length,
    completed: entries.filter(e => e.status === "completed").length,
    absent: entries.filter(e => e.status === "absent").length,
  }), [entries]);

  // Actions
  const setStatus = (id: number, newStatus: WaitingStatus) => {
    setEntries(prev => prev.map(e => {
      if (e.id !== id) return e;
      const updated = { ...e, status: newStatus };
      if (newStatus === "arrived" && !e.arrivedAt) {
        updated.arrivedAt = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      }
      return updated;
    }));
    toast({ title: "Statut mis à jour", description: `Patient marqué comme "${statusConfig[newStatus].label}"` });
  };

  const toggleTag = (id: number, tag: "urgent" | "retard") => {
    setEntries(prev => prev.map(e => {
      if (e.id !== id) return e;
      const tags = e.tags || [];
      if (tags.includes(tag)) {
        return { ...e, tags: tags.filter(t => t !== tag) };
      }
      return { ...e, tags: [...tags, tag] };
    }));
  };

  const saveNote = () => {
    if (noteModal.id === null) return;
    setEntries(prev => prev.map(e => e.id === noteModal.id ? { ...e, internalNote: noteModal.note } : e));
    toast({ title: "Note enregistrée", description: "Note interne sauvegardée." });
    setNoteModal({ open: false, id: null, note: "" });
  };

  const confirmAbsent = () => {
    if (absentConfirm.id !== null) {
      setStatus(absentConfirm.id, "absent");
    }
    setAbsentConfirm({ open: false, id: null });
  };

  return (
    <DashboardLayout role="doctor" title="Salle d'attente">
      <div className="space-y-6">
        {/* Header stats */}
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
            <Input
              placeholder="Rechercher un patient..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto">
            {(["all", "waiting", "arrived", "in_consultation", "scheduled", "completed", "absent"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                {f === "all" ? "Tous" : statusConfig[f as WaitingStatus].label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="rounded-xl border bg-card shadow-card divide-y">
          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              Aucun patient dans la salle d'attente
            </div>
          )}
          {filtered.map(entry => (
            <div
              key={entry.id}
              className={`p-4 transition-colors ${entry.status === "in_consultation" ? "bg-accent/5" : entry.status === "waiting" ? "bg-warning/5" : ""}`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${entry.status === "in_consultation" ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {entry.avatar}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link to={`/dashboard/doctor/patients/${getPatientId(entry.patient)}`} className="font-semibold text-foreground hover:text-primary truncate">
                      {entry.patient}
                    </Link>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusConfig[entry.status].bgColor} ${statusConfig[entry.status].color}`}>
                      {statusConfig[entry.status].label}
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
                    {entry.assurance && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">Assuré</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    RDV {entry.time} · {entry.motif} · {entry.type} · {entry.duration}
                  </p>
                  {entry.arrivedAt && entry.status !== "completed" && entry.status !== "absent" && (
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
                  {/* Status actions */}
                  {entry.status === "scheduled" && (
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setStatus(entry.id, "arrived")}>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-primary" />Arrivé
                    </Button>
                  )}
                  {entry.status === "arrived" && (
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setStatus(entry.id, "waiting")}>
                      <Clock className="h-3.5 w-3.5 mr-1 text-warning" />En attente
                    </Button>
                  )}
                  {(entry.status === "waiting" || entry.status === "arrived") && (
                    <Link to={`/dashboard/doctor/consultation/new?patient=${getPatientId(entry.patient)}`}>
                      <Button size="sm" className="h-8 text-xs gradient-primary text-primary-foreground">
                        <Play className="h-3.5 w-3.5 mr-1" />Appeler
                      </Button>
                    </Link>
                  )}
                  {entry.status === "in_consultation" && (
                    <Button size="sm" variant="outline" className="h-8 text-xs border-accent text-accent hover:bg-accent/10" onClick={() => setStatus(entry.id, "completed")}>
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
                        onClick={() => toggleTag(entry.id, "urgent")}
                        className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-xs hover:bg-muted transition-colors text-foreground"
                      >
                        <Tag className="h-3.5 w-3.5 text-destructive" />{entry.tags?.includes("urgent") ? "Retirer Urgent" : "Marquer Urgent"}
                      </button>
                      <button
                        onClick={() => toggleTag(entry.id, "retard")}
                        className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-xs hover:bg-muted transition-colors text-foreground"
                      >
                        <Clock className="h-3.5 w-3.5 text-warning" />{entry.tags?.includes("retard") ? "Retirer Retard" : "Marquer Retard"}
                      </button>
                      <div className="border-t my-1" />
                      {!["completed", "absent"].includes(entry.status) && (
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
              <Button className="gradient-primary text-primary-foreground" onClick={saveNote}>Enregistrer</Button>
            </div>
          </div>
        </div>
      )}

      {/* Absent Confirmation */}
      <ConfirmDialog
        open={absentConfirm.open}
        onCancel={() => setAbsentConfirm({ open: false, id: null })}
        onConfirm={confirmAbsent}
        title="Marquer comme Absent"
        description="Ce patient sera marqué comme absent (no-show). Cette action est enregistrée dans l'historique."
        confirmLabel="Confirmer Absent"
        variant="danger"
      />
    </DashboardLayout>
  );
};

export default DoctorWaitingRoom;
