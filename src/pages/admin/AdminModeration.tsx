/**
 * Admin Moderation — Enhanced with evidence, escalation to dispute, admin notes timeline
 * TODO BACKEND: Replace with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import {
  AlertTriangle, Flag, CheckCircle, XCircle, ChevronDown, User, Shield, Ban,
  Gavel, Send, Clock, FileText, Image, MessageSquare, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import MotifDialog from "@/components/admin/MotifDialog";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";

type ModerationFilter = "all" | "pending" | "resolved" | "rejected";

interface ModerationNote {
  id: string;
  author: string;
  text: string;
  type: "note" | "action" | "escalation";
  createdAt: string;
}

interface Report {
  id: number;
  type: string;
  reason: string;
  reporter: string;
  reporterRole: string;
  target: string;
  targetRole: string;
  date: string;
  priority: string;
  status: string;
  details: string;
  evidence: string[];
  notes: ModerationNote[];
}

const initialReports: Report[] = [
  {
    id: 1, type: "profil", reason: "Profil médecin non vérifié avec activité suspecte",
    reporter: "Système auto", reporterRole: "system", target: "Dr. Fathi Mejri", targetRole: "doctor",
    date: "08 Mar 2026", priority: "high", status: "pending",
    details: "Ce compte a été créé il y a 3 jours et a déjà publié 15 consultations. Le diplôme soumis ne correspond pas au format standard de la faculté de médecine de Tunis.",
    evidence: ["Capture d'écran du profil", "Diplôme soumis (PDF)", "Historique des consultations"],
    notes: [
      { id: "n1", author: "Système", text: "Alerte automatique : activité anormale détectée (15 consultations en 3 jours)", type: "note", createdAt: "2026-03-08T08:00:00" },
    ],
  },
  {
    id: 2, type: "comportement", reason: "Comportement inapproprié en téléconsultation",
    reporter: "Fatma Trabelsi", reporterRole: "patient", target: "Dr. Inconnu", targetRole: "doctor",
    date: "07 Mar 2026", priority: "medium", status: "pending",
    details: "La patiente rapporte un comportement non professionnel durant une téléconsultation. Le médecin aurait fait des remarques déplacées et aurait raccroché avant la fin de la consultation.",
    evidence: ["Témoignage patient (texte)", "Enregistrement session (ID: TC-4521)"],
    notes: [],
  },
  {
    id: 3, type: "contenu", reason: "Photo de profil inappropriée",
    reporter: "Système auto", reporterRole: "system", target: "Utilisateur #4521", targetRole: "patient",
    date: "05 Mar 2026", priority: "low", status: "resolved",
    details: "Photo de profil ne correspondant pas aux normes de la plateforme. Image non-médicale détectée par le filtre automatique.",
    evidence: ["Image signalée"],
    notes: [
      { id: "n2", author: "Admin", text: "Photo retirée et remplacement par avatar par défaut", type: "action", createdAt: "2026-03-06T10:00:00" },
    ],
  },
  {
    id: 4, type: "avis", reason: "Avis diffamatoire sur un médecin",
    reporter: "Dr. Bouazizi", reporterRole: "doctor", target: "Avis #7832", targetRole: "review",
    date: "06 Mar 2026", priority: "medium", status: "pending",
    details: "Le médecin signale un avis contenant des propos diffamatoires et des accusations non fondées. L'auteur de l'avis n'a jamais eu de consultation avec ce médecin selon nos records.",
    evidence: ["Texte de l'avis", "Historique patient-médecin"],
    notes: [],
  },
  {
    id: 5, type: "fraude", reason: "Suspicion de faux profil pharmacie",
    reporter: "Système auto", reporterRole: "system", target: "Pharmacie Fictive", targetRole: "pharmacy",
    date: "09 Mar 2026", priority: "high", status: "pending",
    details: "Le numéro de licence soumis ne correspond à aucun enregistrement dans la base DPHM. L'adresse indiquée n'existe pas selon la vérification géographique.",
    evidence: ["Licence soumise (PDF)", "Vérification DPHM", "Vérification adresse"],
    notes: [],
  },
];

const priorityColors: Record<string, string> = { high: "bg-destructive/10 text-destructive", medium: "bg-warning/10 text-warning", low: "bg-muted text-muted-foreground" };
const priorityLabels: Record<string, string> = { high: "Urgent", medium: "Moyen", low: "Faible" };
const statusColors: Record<string, string> = { pending: "bg-warning/10 text-warning", resolved: "bg-accent/10 text-accent", rejected: "bg-muted text-muted-foreground" };
const statusLabels: Record<string, string> = { pending: "En attente", resolved: "Résolu", rejected: "Rejeté" };
const typeIcons: Record<string, string> = { profil: "👤", comportement: "⚠️", contenu: "📷", avis: "💬", fraude: "🚨" };
const noteTypeColors: Record<string, string> = { note: "bg-muted/40 border", action: "bg-accent/10 border-accent/20", escalation: "bg-destructive/10 border-destructive/20" };

type MotifAction = { id: number; type: "resolve" | "reject" | "suspend" | "escalate" } | null;

const AdminModeration = () => {
  const [filter, setFilter] = useState<ModerationFilter>("all");
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [motifAction, setMotifAction] = useState<MotifAction>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const filtered = useMemo(() => reports.filter(r => {
    if (filter === "pending") return r.status === "pending";
    if (filter === "resolved") return r.status === "resolved";
    if (filter === "rejected") return r.status === "rejected";
    return true;
  }), [reports, filter]);

  const stats = useMemo(() => ({
    total: reports.length,
    pending: reports.filter(r => r.status === "pending").length,
    resolved: reports.filter(r => r.status === "resolved").length,
    high: reports.filter(r => r.priority === "high" && r.status === "pending").length,
  }), [reports]);

  const handleMotifConfirm = (motif: string) => {
    if (!motifAction) return;
    const r = reports.find(x => x.id === motifAction.id);
    if (!r) return;

    const note: ModerationNote = {
      id: `n-${Date.now()}`, author: "Admin",
      text: "", type: "action", createdAt: new Date().toISOString(),
    };

    if (motifAction.type === "resolve") {
      note.text = `Signalement résolu — Motif : ${motif}`;
      setReports(prev => prev.map(x => x.id === motifAction.id ? { ...x, status: "resolved", notes: [...x.notes, note] } : x));
      appendLog("report_resolved", "moderation", String(motifAction.id), `Signalement résolu — ${r.reason} — Motif : ${motif}`);
      toast({ title: "Signalement résolu" });
    } else if (motifAction.type === "reject") {
      note.text = `Signalement rejeté — Motif : ${motif}`;
      setReports(prev => prev.map(x => x.id === motifAction.id ? { ...x, status: "rejected", notes: [...x.notes, note] } : x));
      appendLog("report_rejected", "moderation", String(motifAction.id), `Signalement rejeté — ${r.reason} — Motif : ${motif}`);
      toast({ title: "Signalement rejeté" });
    } else if (motifAction.type === "suspend") {
      note.text = `Compte "${r.target}" suspendu — Motif : ${motif}`;
      note.type = "action";
      setReports(prev => prev.map(x => x.id === motifAction.id ? { ...x, status: "resolved", notes: [...x.notes, note] } : x));
      appendLog("user_suspended_via_report", "moderation", String(motifAction.id), `Compte suspendu — ${r.target} — Motif : ${motif}`);
      toast({ title: "Compte suspendu" });
    } else if (motifAction.type === "escalate") {
      note.text = `Escaladé en litige — Motif : ${motif}`;
      note.type = "escalation";
      setReports(prev => prev.map(x => x.id === motifAction.id ? { ...x, notes: [...x.notes, note] } : x));
      appendLog("report_escalated", "moderation", String(motifAction.id), `Signalement escaladé en litige — ${r.reason} — Motif : ${motif}`);
      toast({ title: "Escaladé en litige", description: "Un litige a été créé dans la section Litiges." });
    }
    setMotifAction(null);
    // Update selected if open
    if (selectedReport?.id === motifAction.id) {
      setSelectedReport(prev => prev ? { ...prev, ...reports.find(x => x.id === motifAction.id) } : null);
    }
  };

  const handleAddNote = () => {
    if (!selectedReport || !adminNote.trim()) return;
    const note: ModerationNote = {
      id: `n-${Date.now()}`, author: "Admin",
      text: adminNote.trim(), type: "note", createdAt: new Date().toISOString(),
    };
    setReports(prev => prev.map(x => x.id === selectedReport.id ? { ...x, notes: [...x.notes, note] } : x));
    setSelectedReport(prev => prev ? { ...prev, notes: [...prev.notes, note] } : null);
    appendLog("moderation_note", "moderation", String(selectedReport.id), `Note ajoutée sur signalement "${selectedReport.reason}"`);
    setAdminNote("");
    toast({ title: "Note ajoutée" });
  };

  const motifConfig: Record<string, { title: string; label: string; destructive: boolean }> = {
    resolve: { title: "Résoudre le signalement", label: "Résoudre", destructive: false },
    reject: { title: "Rejeter le signalement", label: "Rejeter", destructive: false },
    suspend: { title: "Suspendre le compte", label: "Suspendre", destructive: true },
    escalate: { title: "Escalader en litige", label: "Escalader", destructive: true },
  };

  return (
    <DashboardLayout role="admin" title="Modération & Signalements">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-4 shadow-card text-center">
            <Flag className="h-5 w-5 text-warning mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-[11px] text-muted-foreground">Total</p>
          </div>
          <div className="rounded-xl border bg-destructive/5 p-4 shadow-card text-center">
            <AlertTriangle className="h-5 w-5 text-destructive mx-auto mb-1" />
            <p className="text-2xl font-bold text-destructive">{stats.pending}</p>
            <p className="text-[11px] text-muted-foreground">En attente</p>
          </div>
          <div className="rounded-xl border bg-destructive/5 p-4 shadow-card text-center">
            <Shield className="h-5 w-5 text-destructive mx-auto mb-1" />
            <p className="text-2xl font-bold text-destructive">{stats.high}</p>
            <p className="text-[11px] text-muted-foreground">Urgents</p>
          </div>
          <div className="rounded-xl border bg-accent/5 p-4 shadow-card text-center">
            <CheckCircle className="h-5 w-5 text-accent mx-auto mb-1" />
            <p className="text-2xl font-bold text-accent">{stats.resolved}</p>
            <p className="text-[11px] text-muted-foreground">Résolus</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-1 rounded-lg border bg-card p-0.5 w-fit">
          {([
            { key: "all" as ModerationFilter, label: "Tous", count: stats.total },
            { key: "pending" as ModerationFilter, label: "En attente", count: stats.pending },
            { key: "resolved" as ModerationFilter, label: "Résolus", count: stats.resolved },
            { key: "rejected" as ModerationFilter, label: "Rejetés", count: reports.filter(r => r.status === "rejected").length },
          ]).map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* Reports list */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Flag className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aucun signalement</p>
            </div>
          )}
          {filtered.map(r => (
            <div key={r.id}
              className={`rounded-xl border bg-card shadow-card overflow-hidden cursor-pointer hover:shadow-md transition-all ${r.status === "pending" && r.priority === "high" ? "border-destructive/30" : ""}`}
              onClick={() => setSelectedReport(r)}>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 p-2 rounded-lg ${r.priority === "high" ? "bg-destructive/10" : r.priority === "medium" ? "bg-warning/10" : "bg-muted"}`}>
                    <span className="text-lg">{typeIcons[r.type] || "🚩"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-foreground text-sm">{r.reason}</h4>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityColors[r.priority]}`}>{priorityLabels[r.priority]}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[r.status]}`}>{statusLabels[r.status]}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{r.reporter}</span>
                      <span>→ {r.target}</span>
                      <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{r.evidence.length} pièce(s)</span>
                      <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{r.notes.length} note(s)</span>
                      <span>{r.date}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selectedReport} onOpenChange={v => !v && setSelectedReport(null)}>
        <SheetContent className="sm:max-w-lg flex flex-col p-0">
          {selectedReport && (
            <>
              <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
                <SheetTitle className="text-base pr-6">{selectedReport.reason}</SheetTitle>
                <SheetDescription className="sr-only">Détail du signalement</SheetDescription>
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[selectedReport.status]}`}>{statusLabels[selectedReport.status]}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityColors[selectedReport.priority]}`}>{priorityLabels[selectedReport.priority]}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{selectedReport.type}</span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>Signalé par : {selectedReport.reporter}</span>
                  <span>→ {selectedReport.target}</span>
                </div>
              </SheetHeader>

              <ScrollArea className="flex-1 px-6 py-4">
                <div className="space-y-5">
                  {/* Details */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Description</p>
                    <p className="text-sm text-foreground leading-relaxed">{selectedReport.details}</p>
                  </div>

                  {/* Evidence */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />Pièces à conviction ({selectedReport.evidence.length})
                    </p>
                    <div className="space-y-2">
                      {selectedReport.evidence.map((ev, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                          <Image className="h-4 w-4 text-primary shrink-0" />
                          <p className="text-sm text-foreground flex-1">{ev}</p>
                          <Button size="sm" variant="ghost" className="text-xs h-7">Voir</Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes / Timeline */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />Historique & Notes ({selectedReport.notes.length})
                    </p>
                    {selectedReport.notes.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">Aucune note pour le moment</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedReport.notes.map(note => (
                          <div key={note.id} className={`rounded-lg p-3 ${noteTypeColors[note.type]}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-medium text-foreground">{note.author}</span>
                              {note.type === "escalation" && <Gavel className="h-3 w-3 text-destructive" />}
                              {note.type === "action" && <Shield className="h-3 w-3 text-accent" />}
                            </div>
                            <p className="text-sm text-foreground">{note.text}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {new Date(note.createdAt).toLocaleString("fr-TN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>

              {/* Footer: add note + actions */}
              <div className="border-t px-6 py-4 space-y-3 shrink-0">
                {/* Admin note input */}
                <div className="flex gap-2">
                  <Input placeholder="Ajouter une note interne..." value={adminNote} onChange={e => setAdminNote(e.target.value)}
                    className="text-xs" onKeyDown={e => e.key === "Enter" && handleAddNote()} />
                  <Button size="sm" variant="outline" onClick={handleAddNote} disabled={!adminNote.trim()}>
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Actions */}
                {selectedReport.status === "pending" && (
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => setMotifAction({ id: selectedReport.id, type: "resolve" })}>
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />Résoudre
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setMotifAction({ id: selectedReport.id, type: "reject" })}>
                      <XCircle className="h-3.5 w-3.5 mr-1" />Rejeter
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive border-destructive/30" onClick={() => setMotifAction({ id: selectedReport.id, type: "suspend" })}>
                      <Ban className="h-3.5 w-3.5 mr-1" />Suspendre
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive border-destructive/30" onClick={() => setMotifAction({ id: selectedReport.id, type: "escalate" })}>
                      <Gavel className="h-3.5 w-3.5 mr-1" />Escalader
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {motifAction && (
        <MotifDialog
          open={!!motifAction}
          onClose={() => setMotifAction(null)}
          onConfirm={handleMotifConfirm}
          title={motifConfig[motifAction.type].title}
          confirmLabel={motifConfig[motifAction.type].label}
          destructive={motifConfig[motifAction.type].destructive}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminModeration;
