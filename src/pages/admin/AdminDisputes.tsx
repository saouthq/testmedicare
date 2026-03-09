/**
 * AdminDisputes — Litiges avec conversation threadée et traçabilité complète
 * Chaque litige = ticket entre patient/médecin, avec historique de messages,
 * actions admin (motif obligatoire), et audit log automatique.
 * TODO BACKEND: Replace localStorage + mock with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import {
  Gavel, Search, ChevronDown, User, Clock, Send, CheckCircle, XCircle,
  AlertTriangle, MessageSquare, FileText, ArrowRight, Shield,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import MotifDialog from "@/components/admin/MotifDialog";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";

// ── Types ────────────────────────────────────────────────────
interface DisputeMessage {
  id: string;
  author: string;
  authorRole: "patient" | "doctor" | "admin";
  text: string;
  createdAt: string;
}

interface Dispute {
  id: string;
  subject: string;
  category: "rdv" | "paiement" | "comportement" | "technique" | "autre";
  priority: "high" | "medium" | "low";
  status: "open" | "investigating" | "resolved" | "closed";
  patientName: string;
  doctorName: string;
  createdAt: string;
  updatedAt: string;
  messages: DisputeMessage[];
}

// ── Mock data ────────────────────────────────────────────────
const STORAGE_KEY = "medicare_admin_disputes";

const defaultDisputes: Dispute[] = [
  {
    id: "disp-1", subject: "Consultation annulée sans remboursement",
    category: "paiement", priority: "high", status: "open",
    patientName: "Fatma Trabelsi", doctorName: "Dr. Bouazizi",
    createdAt: "2026-03-07T10:00:00", updatedAt: "2026-03-08T14:30:00",
    messages: [
      { id: "m1", author: "Fatma Trabelsi", authorRole: "patient", text: "Le médecin a annulé ma téléconsultation 5 minutes avant et je n'ai toujours pas été remboursée. Cela fait 3 jours.", createdAt: "2026-03-07T10:00:00" },
      { id: "m2", author: "Dr. Bouazizi", authorRole: "doctor", text: "J'ai eu une urgence au bloc. Le remboursement devrait être automatique.", createdAt: "2026-03-07T14:20:00" },
      { id: "m3", author: "Fatma Trabelsi", authorRole: "patient", text: "Toujours rien reçu. Merci de vérifier.", createdAt: "2026-03-08T09:00:00" },
    ],
  },
  {
    id: "disp-2", subject: "Retard de 45 minutes sans information",
    category: "rdv", priority: "medium", status: "investigating",
    patientName: "Ali Ben Salem", doctorName: "Dr. Gharbi",
    createdAt: "2026-03-06T16:00:00", updatedAt: "2026-03-07T11:00:00",
    messages: [
      { id: "m4", author: "Ali Ben Salem", authorRole: "patient", text: "J'ai attendu 45 minutes en salle d'attente sans aucune information. Ce n'est pas professionnel.", createdAt: "2026-03-06T16:00:00" },
      { id: "m5", author: "Admin", authorRole: "admin", text: "Nous avons contacté le cabinet. Le Dr. Gharbi a eu un retard dû à une urgence. Nous enquêtons.", createdAt: "2026-03-07T11:00:00" },
    ],
  },
  {
    id: "disp-3", subject: "Erreur de prescription signalée",
    category: "autre", priority: "high", status: "open",
    patientName: "Sarra Mejri", doctorName: "Dr. Hammami",
    createdAt: "2026-03-08T08:00:00", updatedAt: "2026-03-08T08:00:00",
    messages: [
      { id: "m6", author: "Sarra Mejri", authorRole: "patient", text: "Le pharmacien m'a dit que le dosage prescrit est anormalement élevé pour l'Amoxicilline. Merci de vérifier avec le médecin.", createdAt: "2026-03-08T08:00:00" },
    ],
  },
  {
    id: "disp-4", subject: "Problème technique lors de la téléconsultation",
    category: "technique", priority: "low", status: "resolved",
    patientName: "Mohamed Kaabi", doctorName: "Dr. Chebbi",
    createdAt: "2026-03-05T12:00:00", updatedAt: "2026-03-06T09:00:00",
    messages: [
      { id: "m7", author: "Mohamed Kaabi", authorRole: "patient", text: "La vidéo coupait sans arrêt pendant la consultation.", createdAt: "2026-03-05T12:00:00" },
      { id: "m8", author: "Admin", authorRole: "admin", text: "Problème identifié côté serveur. La consultation a été replanifiée gratuitement.", createdAt: "2026-03-06T09:00:00" },
    ],
  },
];

const getDisputes = (): Dispute[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultDisputes;
  } catch { return defaultDisputes; }
};
const saveDisputes = (d: Dispute[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(d));

// ── Labels & colors ──────────────────────────────────────────
const statusLabels: Record<string, string> = { open: "Ouvert", investigating: "En cours", resolved: "Résolu", closed: "Fermé" };
const statusColors: Record<string, string> = { open: "bg-destructive/10 text-destructive", investigating: "bg-warning/10 text-warning", resolved: "bg-accent/10 text-accent", closed: "bg-muted text-muted-foreground" };
const priorityLabels: Record<string, string> = { high: "Urgent", medium: "Moyen", low: "Faible" };
const priorityColors: Record<string, string> = { high: "bg-destructive/10 text-destructive", medium: "bg-warning/10 text-warning", low: "bg-muted text-muted-foreground" };
const categoryLabels: Record<string, string> = { rdv: "RDV", paiement: "Paiement", comportement: "Comportement", technique: "Technique", autre: "Autre" };
const roleColors: Record<string, string> = { patient: "bg-primary/10 text-primary", doctor: "bg-accent/10 text-accent", admin: "bg-warning/10 text-warning" };
const roleLabelsMsg: Record<string, string> = { patient: "Patient", doctor: "Médecin", admin: "Admin" };

// ── Component ────────────────────────────────────────────────
const AdminDisputes = () => {
  const [disputes, setDisputes] = useState<Dispute[]>(getDisputes);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [motifAction, setMotifAction] = useState<{ id: string; type: "resolve" | "close" | "escalate" } | null>(null);

  const persist = (updated: Dispute[]) => { setDisputes(updated); saveDisputes(updated); };

  const filtered = useMemo(() => disputes.filter(d => {
    if (statusFilter !== "all" && d.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return d.subject.toLowerCase().includes(q) || d.patientName.toLowerCase().includes(q) || d.doctorName.toLowerCase().includes(q);
    }
    return true;
  }), [disputes, search, statusFilter]);

  const selected = disputes.find(d => d.id === selectedId) || null;

  // Send admin message
  const handleSendMessage = () => {
    if (!selected || !newMessage.trim()) return;
    const msg: DisputeMessage = {
      id: `m-${Date.now()}`, author: "Admin", authorRole: "admin",
      text: newMessage.trim(), createdAt: new Date().toISOString(),
    };
    const updated = disputes.map(d => d.id === selected.id ? { ...d, messages: [...d.messages, msg], updatedAt: new Date().toISOString() } : d);
    persist(updated);
    appendLog("dispute_message", "dispute", selected.id, `Message admin sur litige "${selected.subject}"`);
    setNewMessage("");
    toast({ title: "Message envoyé" });
  };

  // Status change with motif
  const handleMotifConfirm = (motif: string) => {
    if (!motifAction) return;
    const d = disputes.find(x => x.id === motifAction.id);
    if (!d) return;

    const newStatus = motifAction.type === "resolve" ? "resolved" : motifAction.type === "close" ? "closed" : "investigating";
    const actionLabel = motifAction.type === "resolve" ? "résolu" : motifAction.type === "close" ? "fermé" : "escaladé";

    // Add system message to conversation
    const sysMsg: DisputeMessage = {
      id: `m-${Date.now()}`, author: "Admin", authorRole: "admin",
      text: `[Action] Litige ${actionLabel}. Motif : ${motif}`,
      createdAt: new Date().toISOString(),
    };

    const updated = disputes.map(x => x.id === motifAction.id
      ? { ...x, status: newStatus as Dispute["status"], messages: [...x.messages, sysMsg], updatedAt: new Date().toISOString() }
      : x
    );
    persist(updated);
    appendLog(`dispute_${motifAction.type}`, "dispute", motifAction.id, `Litige "${d.subject}" ${actionLabel} — Motif : ${motif}`);
    toast({ title: `Litige ${actionLabel}` });
    setMotifAction(null);
  };

  const stats = useMemo(() => ({
    total: disputes.length,
    open: disputes.filter(d => d.status === "open").length,
    investigating: disputes.filter(d => d.status === "investigating").length,
    resolved: disputes.filter(d => d.status === "resolved" || d.status === "closed").length,
  }), [disputes]);

  const motifConfig: Record<string, { title: string; label: string; destructive: boolean }> = {
    resolve: { title: "Résoudre le litige", label: "Résoudre", destructive: false },
    close: { title: "Fermer le litige", label: "Fermer", destructive: true },
    escalate: { title: "Passer en investigation", label: "Escalader", destructive: false },
  };

  return (
    <DashboardLayout role="admin" title="Litiges & Réclamations">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <Gavel className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total litiges</p>
          </div>
          <div className="rounded-xl border bg-destructive/5 p-4 shadow-card">
            <AlertTriangle className="h-5 w-5 text-destructive mb-2" />
            <p className="text-2xl font-bold text-destructive">{stats.open}</p>
            <p className="text-xs text-muted-foreground">Ouverts</p>
          </div>
          <div className="rounded-xl border bg-warning/5 p-4 shadow-card">
            <Clock className="h-5 w-5 text-warning mb-2" />
            <p className="text-2xl font-bold text-warning">{stats.investigating}</p>
            <p className="text-xs text-muted-foreground">En investigation</p>
          </div>
          <div className="rounded-xl border bg-accent/5 p-4 shadow-card">
            <CheckCircle className="h-5 w-5 text-accent mb-2" />
            <p className="text-2xl font-bold text-accent">{stats.resolved}</p>
            <p className="text-xs text-muted-foreground">Résolus / Fermés</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher par sujet, patient ou médecin..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-1 rounded-lg border bg-card p-0.5">
            {(["all", "open", "investigating", "resolved"] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${statusFilter === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {s === "all" ? "Tous" : statusLabels[s]} ({s === "all" ? stats.total : s === "resolved" ? stats.resolved : stats[s]})
              </button>
            ))}
          </div>
        </div>

        {/* Disputes list */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Gavel className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aucun litige trouvé</p>
            </div>
          )}
          {filtered.map(d => (
            <div key={d.id} className={`rounded-xl border bg-card shadow-card overflow-hidden cursor-pointer hover:shadow-md transition-all ${d.priority === "high" && d.status === "open" ? "border-destructive/30" : ""}`}
              onClick={() => setSelectedId(d.id)}>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 p-2 rounded-lg ${d.priority === "high" ? "bg-destructive/10" : d.priority === "medium" ? "bg-warning/10" : "bg-muted"}`}>
                    <Gavel className={`h-4 w-4 ${d.priority === "high" ? "text-destructive" : d.priority === "medium" ? "text-warning" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-foreground text-sm">{d.subject}</h4>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityColors[d.priority]}`}>{priorityLabels[d.priority]}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[d.status]}`}>{statusLabels[d.status]}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{categoryLabels[d.category]}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{d.patientName}</span>
                      <span>↔</span>
                      <span>{d.doctorName}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{d.messages.length} messages</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(d.updatedAt).toLocaleDateString("fr-TN", { day: "2-digit", month: "short" })}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Sheet — conversation threadée */}
      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelectedId(null)}>
        <SheetContent className="sm:max-w-lg flex flex-col p-0">
          {selected && (
            <>
              <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
                <SheetTitle className="text-base pr-6">{selected.subject}</SheetTitle>
                <SheetDescription className="sr-only">Détail du litige</SheetDescription>
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[selected.status]}`}>{statusLabels[selected.status]}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityColors[selected.priority]}`}>{priorityLabels[selected.priority]}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{categoryLabels[selected.category]}</span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span><User className="h-3 w-3 inline mr-1" />{selected.patientName}</span>
                  <span>↔</span>
                  <span>{selected.doctorName}</span>
                </div>
              </SheetHeader>

              {/* Conversation thread */}
              <ScrollArea className="flex-1 px-6 py-4">
                <div className="space-y-4">
                  {selected.messages.map(msg => {
                    const isAdmin = msg.authorRole === "admin";
                    const isSystem = msg.text.startsWith("[Action]");
                    return (
                      <div key={msg.id} className={`${isSystem ? "flex justify-center" : ""}`}>
                        {isSystem ? (
                          <div className="bg-muted/50 rounded-lg px-3 py-2 text-[11px] text-muted-foreground text-center max-w-[80%] border">
                            <Shield className="h-3 w-3 inline mr-1" />
                            {msg.text.replace("[Action] ", "")}
                            <div className="text-[10px] mt-1 opacity-60">
                              {new Date(msg.createdAt).toLocaleString("fr-TN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        ) : (
                          <div className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[85%] rounded-xl p-3 ${isAdmin ? "bg-primary/10 border border-primary/20" : "bg-muted/40 border"}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${roleColors[msg.authorRole]}`}>
                                  {roleLabelsMsg[msg.authorRole]}
                                </span>
                                <span className="text-xs font-medium text-foreground">{msg.author}</span>
                              </div>
                              <p className="text-sm text-foreground leading-relaxed">{msg.text}</p>
                              <p className="text-[10px] text-muted-foreground mt-1.5">
                                {new Date(msg.createdAt).toLocaleString("fr-TN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Actions + message input */}
              <div className="border-t px-6 py-4 space-y-3 shrink-0">
                {/* Admin actions */}
                {(selected.status === "open" || selected.status === "investigating") && (
                  <div className="flex gap-2 flex-wrap">
                    {selected.status === "open" && (
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => setMotifAction({ id: selected.id, type: "escalate" })}>
                        <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Investiguer
                      </Button>
                    )}
                    <Button size="sm" className="gradient-primary text-primary-foreground text-xs" onClick={() => setMotifAction({ id: selected.id, type: "resolve" })}>
                      <CheckCircle className="h-3.5 w-3.5 mr-1" /> Résoudre
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs text-destructive border-destructive/30" onClick={() => setMotifAction({ id: selected.id, type: "close" })}>
                      <XCircle className="h-3.5 w-3.5 mr-1" /> Fermer
                    </Button>
                  </div>
                )}

                {/* Compose */}
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Répondre au litige…"
                    className="flex-1 text-sm"
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  />
                  <Button size="sm" className="h-9" onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Motif dialog for status changes */}
      {motifAction && (
        <MotifDialog
          open={!!motifAction}
          onClose={() => setMotifAction(null)}
          onConfirm={handleMotifConfirm}
          title={motifConfig[motifAction.type].title}
          description="Cette action sera tracée dans les audit logs avec le motif."
          confirmLabel={motifConfig[motifAction.type].label}
          destructive={motifConfig[motifAction.type].destructive}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminDisputes;
