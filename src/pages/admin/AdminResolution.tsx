/**
 * AdminResolution — Unified resolution center with tabs: Signalements | Litiges | Support
 * Fusionné depuis: AdminModeration, AdminDisputes, AdminSupport
 * Each tab preserves its full workflow (evidence, conversation threads, actions with motifs, SLA)
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import MotifDialog from "@/components/admin/MotifDialog";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";
import { useAdminTickets, useAdminDisputes, useAdminModerationReports } from "@/stores/adminStore";
import { useAdminTicketsSupabase, useAdminTicketUpdateSupabase } from "@/hooks/useAdminData";
import { getAppMode } from "@/stores/authStore";
import type { AdminModerationReport, AdminTicket, ModerationNote } from "@/types/admin";
import EmptyState from "@/components/shared/EmptyState";
import {
  AlertTriangle, Flag, CheckCircle, XCircle, User, Shield, Ban, Gavel,
  Send, Clock, FileText, Image, MessageSquare, ArrowRight, Search,
  RefreshCw, Tag,
} from "lucide-react";

// ══════════════════════════════════════════
// SHARED TYPES & HELPERS
// ══════════════════════════════════════════
const priorityColors: Record<string, string> = { high: "bg-destructive/10 text-destructive", medium: "bg-warning/10 text-warning", low: "bg-muted text-muted-foreground" };
const priorityLabels: Record<string, string> = { high: "Urgent", medium: "Moyen", low: "Faible" };

// ══════════════════════════════════════════
// MODERATION

// ══════════════════════════════════════════
// DISPUTES
// ══════════════════════════════════════════
interface DisputeMessage { id: string; author: string; authorRole: "patient" | "doctor" | "admin"; text: string; createdAt: string; }
interface Dispute { id: string; subject: string; category: string; priority: string; status: string; patientName: string; doctorName: string; createdAt: string; updatedAt: string; messages: DisputeMessage[]; }

const defaultDisputes: Dispute[] = [
  { id: "disp-1", subject: "Consultation annulée sans remboursement", category: "paiement", priority: "high", status: "open", patientName: "Fatma Trabelsi", doctorName: "Dr. Bouazizi", createdAt: "2026-03-07T10:00:00", updatedAt: "2026-03-08T14:30:00", messages: [
    { id: "m1", author: "Fatma Trabelsi", authorRole: "patient", text: "Le médecin a annulé ma téléconsultation et je n'ai pas été remboursée.", createdAt: "2026-03-07T10:00:00" },
    { id: "m2", author: "Dr. Bouazizi", authorRole: "doctor", text: "J'ai eu une urgence. Le remboursement devrait être automatique.", createdAt: "2026-03-07T14:20:00" },
  ]},
  { id: "disp-2", subject: "Retard de 45 minutes sans information", category: "rdv", priority: "medium", status: "investigating", patientName: "Ali Ben Salem", doctorName: "Dr. Gharbi", createdAt: "2026-03-06T16:00:00", updatedAt: "2026-03-07T11:00:00", messages: [
    { id: "m4", author: "Ali Ben Salem", authorRole: "patient", text: "J'ai attendu 45 minutes sans information.", createdAt: "2026-03-06T16:00:00" },
    { id: "m5", author: "Admin", authorRole: "admin", text: "Nous avons contacté le cabinet. Enquête en cours.", createdAt: "2026-03-07T11:00:00" },
  ]},
  { id: "disp-3", subject: "Erreur de prescription signalée", category: "autre", priority: "high", status: "open", patientName: "Sarra Mejri", doctorName: "Dr. Hammami", createdAt: "2026-03-08T08:00:00", updatedAt: "2026-03-08T08:00:00", messages: [
    { id: "m6", author: "Sarra Mejri", authorRole: "patient", text: "Le pharmacien dit que le dosage est anormalement élevé.", createdAt: "2026-03-08T08:00:00" },
  ]},
];

// ══════════════════════════════════════════
// SUPPORT
// ══════════════════════════════════════════
interface TicketMessage { id: string; sender: "user" | "admin"; senderName: string; text: string; time: string; }
interface TicketExt { id: string; subject: string; category: string; priority: string; status: string; requester: string; requesterRole: string; assignedTo: string; createdAt: string; messages: number; slaDeadline: string; conversation: TicketMessage[]; }

const enrichTickets = (tickets: AdminTicket[]): TicketExt[] => tickets.map(t => ({
  ...t, status: t.status === "open" ? "open" : "closed",
  messages: t.conversation.length,
  slaDeadline: t.priority === "high" ? "2h" : t.priority === "medium" ? "8h" : "24h",
  conversation: [
    { id: `${t.id}-1`, sender: "user" as const, senderName: t.requester, text: `Bonjour, ${t.subject.toLowerCase()}. Merci de m'aider.`, time: t.createdAt + " 09:15" },
    ...(t.status === "closed" ? [{ id: `${t.id}-2`, sender: "admin" as const, senderName: t.assignedTo || "Support", text: "Votre demande a été traitée.", time: t.createdAt + " 10:30" }] : []),
  ],
}));

const statusCfg: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "bg-warning/10 text-warning" },
  open: { label: "Ouvert", color: "bg-destructive/10 text-destructive" },
  investigating: { label: "En cours", color: "bg-warning/10 text-warning" },
  resolved: { label: "Résolu", color: "bg-accent/10 text-accent" },
  rejected: { label: "Rejeté", color: "bg-muted text-muted-foreground" },
  closed: { label: "Fermé", color: "bg-muted text-muted-foreground" },
  in_progress: { label: "En cours", color: "bg-primary/10 text-primary" },
};
const roleColors: Record<string, string> = { patient: "bg-primary/10 text-primary", doctor: "bg-accent/10 text-accent", admin: "bg-warning/10 text-warning" };

const mockSupportMacros = [
  { id: "m1", label: "Merci", text: "Merci de nous avoir contactés. Nous traitons votre demande." },
  { id: "m2", label: "En cours", text: "Votre demande est en cours de traitement par notre équipe." },
  { id: "m3", label: "Résolu", text: "Votre problème a été résolu. N'hésitez pas à nous recontacter." },
];

const AdminResolution = () => {
  const isProduction = getAppMode() === "production";
  const supabaseTicketsQuery = useAdminTicketsSupabase();
  const ticketUpdateMutation = useAdminTicketUpdateSupabase();

  // ── Moderation — from store ──
  const { reports: storeReports, setReports: setStoreReports } = useAdminModerationReports();
  const [reports, setReports] = useState<AdminModerationReport[]>(storeReports);
  const [modFilter, setModFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<AdminModerationReport | null>(null);
  const [modMotifAction, setModMotifAction] = useState<{ id: string; type: string } | null>(null);
  const [adminNote, setAdminNote] = useState("");

  // ── Disputes — from store ──
  const { disputes: storeDisputes, setDisputes: setStoreDisputes } = useAdminDisputes();
  const [disputes, setDisputes] = useState<Dispute[]>(() =>
    storeDisputes.length > 0
      ? storeDisputes.map(d => ({ ...d, priority: d.priority || "medium" }))
      : defaultDisputes
  );
  const [dispSearch, setDispSearch] = useState("");
  const [dispStatusFilter, setDispStatusFilter] = useState("all");
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [newMsg, setNewMsg] = useState("");
  const [dispMotifAction, setDispMotifAction] = useState<{ id: string; type: string } | null>(null);

  // ── Support — dual-mode: demo store or Supabase ──
  const { tickets: storeTickets, setTickets: setStoreTickets } = useAdminTickets();
  const enrichedTickets = (): TicketExt[] => {
    // Production: map Supabase support_tickets
    if (isProduction && supabaseTicketsQuery.data && supabaseTicketsQuery.data.length > 0) {
      return supabaseTicketsQuery.data.map((t: any) => ({
        id: t.id,
        subject: t.subject || "Ticket",
        category: "support",
        priority: "medium",
        status: t.status || "open",
        requester: t.user_id ? t.user_id.slice(0, 8) : "Utilisateur",
        requesterRole: "patient",
        assignedTo: "",
        createdAt: new Date(t.created_at).toLocaleDateString("fr-TN"),
        messages: Array.isArray(t.conversation) ? t.conversation.length : 0,
        slaDeadline: "8h",
        conversation: Array.isArray(t.conversation) ? (t.conversation as any[]).map((c: any, i: number) => ({
          id: `msg-${i}`,
          sender: c.sender || "user",
          senderName: c.senderName || "Utilisateur",
          text: c.text || "",
          time: c.time || "",
        })) : [],
      }));
    }
    // Demo: from store
    if (storeTickets.length > 0) {
      return storeTickets.map(t => ({
        ...t,
        messages: t.conversation.length,
        slaDeadline: t.priority === "high" ? "2h" : t.priority === "medium" ? "8h" : "24h",
      }));
    }
    return [];
  };
  const [tickets, setTickets] = useState<TicketExt[]>(enrichedTickets);

  // Re-sync tickets when supabase data arrives
  useMemo(() => {
    if (isProduction && supabaseTicketsQuery.data) {
      setTickets(enrichedTickets());
    }
  }, [supabaseTicketsQuery.data]);
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketStatusFilter, setTicketStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<TicketExt | null>(null);
  const [reply, setReply] = useState("");

  // ── Moderation helpers ──
  const modFiltered = useMemo(() => {
    if (modFilter === "all") return reports;
    return reports.filter(r => r.status === modFilter);
  }, [reports, modFilter]);

  const modStats = { total: reports.length, pending: reports.filter(r => r.status === "pending").length, high: reports.filter(r => r.priority === "high" && r.status === "pending").length };

  const handleModMotif = (motif: string) => {
    if (!modMotifAction) return;
    const r = reports.find(x => x.id === modMotifAction.id);
    if (!r) return;
    const noteType = modMotifAction.type === "escalate" ? "escalation" : "action";
    const newStatus = modMotifAction.type === "resolve" ? "resolved" : modMotifAction.type === "reject" ? "rejected" : r.status;
    const note: ModerationNote = { id: `n-${Date.now()}`, author: "Admin", text: `${modMotifAction.type === "resolve" ? "Résolu" : modMotifAction.type === "reject" ? "Rejeté" : modMotifAction.type === "suspend" ? "Compte suspendu" : "Escaladé"} — ${motif}`, type: noteType as any, createdAt: new Date().toISOString() };
    const updated = reports.map(x => x.id === modMotifAction.id ? { ...x, status: newStatus, notes: [...x.notes, note] } : x);
    setReports(updated);
    setStoreReports(updated); // sync back to store
    appendLog(`report_${modMotifAction.type}`, "moderation", String(modMotifAction.id), `${note.text}`);
    toast({ title: note.text.split(" — ")[0] });
    setModMotifAction(null);
  };

  const handleAddNote = () => {
    if (!selectedReport || !adminNote.trim()) return;
    const note: ModerationNote = { id: `n-${Date.now()}`, author: "Admin", text: adminNote.trim(), type: "note", createdAt: new Date().toISOString() };
    const updated = reports.map(x => x.id === selectedReport.id ? { ...x, notes: [...x.notes, note] } : x);
    setReports(updated);
    setStoreReports(updated); // sync back
    setSelectedReport(prev => prev ? { ...prev, notes: [...prev.notes, note] } : null);
    setAdminNote("");
    toast({ title: "Note ajoutée" });
  };

  // ── Disputes helpers ──
  const dispFiltered = useMemo(() => disputes.filter(d => {
    if (dispStatusFilter !== "all" && d.status !== dispStatusFilter) return false;
    if (dispSearch) { const q = dispSearch.toLowerCase(); return d.subject.toLowerCase().includes(q) || d.patientName.toLowerCase().includes(q) || d.doctorName.toLowerCase().includes(q); }
    return true;
  }), [disputes, dispSearch, dispStatusFilter]);

  const dispStats = { total: disputes.length, open: disputes.filter(d => d.status === "open").length, investigating: disputes.filter(d => d.status === "investigating").length };

  const handleDispSendMsg = () => {
    if (!selectedDispute || !newMsg.trim()) return;
    const msg: DisputeMessage = { id: `m-${Date.now()}`, author: "Admin", authorRole: "admin", text: newMsg.trim(), createdAt: new Date().toISOString() };
    const updated = disputes.map(d => d.id === selectedDispute.id ? { ...d, messages: [...d.messages, msg], updatedAt: new Date().toISOString() } : d);
    setDisputes(updated);
    setStoreDisputes(updated as any); // sync back
    setSelectedDispute(prev => prev ? { ...prev, messages: [...prev.messages, msg] } : null);
    setNewMsg("");
    appendLog("dispute_message", "dispute", selectedDispute.id, `Message admin envoyé dans litige "${selectedDispute.subject}"`);
    toast({ title: "Message envoyé" });
  };

  const handleDispMotif = (motif: string) => {
    if (!dispMotifAction) return;
    const newStatus = dispMotifAction.type === "resolve" ? "resolved" : dispMotifAction.type === "close" ? "closed" : "investigating";
    const sysMsg: DisputeMessage = { id: `m-${Date.now()}`, author: "Admin", authorRole: "admin", text: `[Action] Litige ${newStatus}. Motif : ${motif}`, createdAt: new Date().toISOString() };
    const updated = disputes.map(x => x.id === dispMotifAction.id ? { ...x, status: newStatus, messages: [...x.messages, sysMsg], updatedAt: new Date().toISOString() } : x);
    setDisputes(updated);
    setStoreDisputes(updated as any); // sync back
    appendLog(`dispute_${newStatus}`, "dispute", dispMotifAction.id, `Litige ${newStatus} — ${motif}`);
    toast({ title: `Litige ${newStatus}` });
    setDispMotifAction(null);
  };

  // ── Support helpers ──
  const supportFiltered = tickets.filter(t => {
    if (ticketStatusFilter !== "all" && t.status !== ticketStatusFilter) return false;
    if (ticketSearch) { const q = ticketSearch.toLowerCase(); return t.subject.toLowerCase().includes(q) || t.requester.toLowerCase().includes(q); }
    return true;
  });

  const handleTicketReply = () => {
    if (!reply.trim() || !selectedTicket) return;
    const msg: TicketMessage = { id: `msg-${Date.now()}`, sender: "admin", senderName: "Admin Support", text: reply.trim(), time: new Date().toLocaleString("fr-TN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) };
    setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, conversation: [...t.conversation, msg] } : t));
    // sync back to store
    setStoreTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, conversation: [...t.conversation, { id: msg.id, sender: msg.sender, senderName: msg.senderName, text: msg.text, time: msg.time }] } : t));
    setSelectedTicket(prev => prev ? { ...prev, conversation: [...prev.conversation, msg] } : null);
    setReply("");
    toast({ title: "Réponse envoyée" });
  };

  const handleTicketClose = (id: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "closed" } : t));
    if (!isProduction) setStoreTickets(prev => prev.map(t => t.id === id ? { ...t, status: "closed" as any } : t));
    if (isProduction) ticketUpdateMutation.mutate({ ticketId: id, updates: { status: "closed" } });
    appendLog("ticket_closed", "support", id, "Ticket clôturé");
    toast({ title: "Ticket clôturé" });
  };
  const handleTicketReopen = (id: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "open" } : t));
    if (!isProduction) setStoreTickets(prev => prev.map(t => t.id === id ? { ...t, status: "open" as any } : t));
    if (isProduction) ticketUpdateMutation.mutate({ ticketId: id, updates: { status: "open" } });
    appendLog("ticket_reopened", "support", id, "Ticket réouvert");
    toast({ title: "Ticket réouvert" });
  };
  const handleTicketTake = (id: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "in_progress", assignedTo: "Admin Support" } : t));
    if (!isProduction) setStoreTickets(prev => prev.map(t => t.id === id ? { ...t, status: "in_progress" as any, assignedTo: "Admin Support" } : t));
    if (isProduction) ticketUpdateMutation.mutate({ ticketId: id, updates: { status: "in_progress" } });
    appendLog("ticket_taken", "support", id, "Ticket pris en charge");
    toast({ title: "Pris en charge" });
  };

  // Global counts for tab badges
  const totalOpen = modStats.pending + dispStats.open + tickets.filter(t => t.status === "open").length;

  const modMotifCfg: Record<string, { title: string; label: string; destructive: boolean }> = {
    resolve: { title: "Résoudre le signalement", label: "Résoudre", destructive: false },
    reject: { title: "Rejeter le signalement", label: "Rejeter", destructive: false },
    suspend: { title: "Suspendre le compte", label: "Suspendre", destructive: true },
    escalate: { title: "Escalader en litige", label: "Escalader", destructive: true },
  };

  return (
    <DashboardLayout role="admin" title="Centre de résolution">
      <Tabs defaultValue="moderation" className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <TabsList>
            <TabsTrigger value="moderation" className="gap-1.5">
              Signalements {modStats.pending > 0 && <span className="text-[10px] bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full">{modStats.pending}</span>}
            </TabsTrigger>
            <TabsTrigger value="disputes" className="gap-1.5">
              Litiges {dispStats.open > 0 && <span className="text-[10px] bg-warning text-warning-foreground px-1.5 py-0.5 rounded-full">{dispStats.open}</span>}
            </TabsTrigger>
            <TabsTrigger value="support" className="gap-1.5">
              Support {tickets.filter(t => t.status === "open").length > 0 && <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">{tickets.filter(t => t.status === "open").length}</span>}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ════ MODERATION ════ */}
        <TabsContent value="moderation" className="space-y-6">
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Flag, value: modStats.total, label: "Total", cls: "text-warning" },
              { icon: AlertTriangle, value: modStats.pending, label: "En attente", cls: "text-destructive" },
              { icon: Shield, value: modStats.high, label: "Urgents", cls: "text-destructive" },
              { icon: CheckCircle, value: reports.filter(r => r.status === "resolved").length, label: "Résolus", cls: "text-accent" },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border bg-card p-4 shadow-card text-center">
                <s.icon className={`h-5 w-5 ${s.cls} mx-auto mb-1`} />
                <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-1 rounded-lg border bg-card p-0.5 w-fit">
            {["all", "pending", "resolved", "rejected"].map(f => (
              <button key={f} onClick={() => setModFilter(f)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${modFilter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {f === "all" ? "Tous" : statusCfg[f]?.label || f}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {modFiltered.length === 0 && <EmptyState icon={Flag} title="Aucun signalement" description="Aucun signalement ne correspond à ce filtre." compact />}
            {modFiltered.map(r => (
              <div key={r.id} className={`rounded-xl border bg-card shadow-card p-4 cursor-pointer hover:shadow-md transition-all ${r.priority === "high" && r.status === "pending" ? "border-destructive/30" : ""}`} onClick={() => setSelectedReport(r)}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-foreground text-sm">{r.reason}</h4>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityColors[r.priority]}`}>{priorityLabels[r.priority]}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusCfg[r.status]?.color}`}>{statusCfg[r.status]?.label}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span>{r.reporter} → {r.target}</span><span>{r.evidence.length} pièce(s)</span><span>{r.date}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ════ DISPUTES ════ */}
        <TabsContent value="disputes" className="space-y-6">
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Gavel, value: disputes.length, label: "Total", cls: "text-primary" },
              { icon: AlertTriangle, value: dispStats.open, label: "Ouverts", cls: "text-destructive" },
              { icon: Clock, value: dispStats.investigating, label: "En investigation", cls: "text-warning" },
              { icon: CheckCircle, value: disputes.filter(d => d.status === "resolved" || d.status === "closed").length, label: "Résolus", cls: "text-accent" },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border bg-card p-4 shadow-card"><s.icon className={`h-5 w-5 ${s.cls} mb-2`} /><p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Rechercher..." value={dispSearch} onChange={e => setDispSearch(e.target.value)} className="pl-10" /></div>
            <div className="flex gap-1 rounded-lg border bg-card p-0.5">
              {["all", "open", "investigating", "resolved"].map(s => (
                <button key={s} onClick={() => setDispStatusFilter(s)} className={`rounded-md px-3 py-1.5 text-xs font-medium ${dispStatusFilter === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {s === "all" ? "Tous" : statusCfg[s]?.label || s}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {dispFiltered.length === 0 && <EmptyState icon={Gavel} title="Aucun litige" description="Aucun litige ne correspond à ce filtre." compact />}
            {dispFiltered.map(d => (
              <div key={d.id} className={`rounded-xl border bg-card shadow-card p-4 cursor-pointer hover:shadow-md transition-all ${d.priority === "high" && d.status === "open" ? "border-destructive/30" : ""}`} onClick={() => setSelectedDispute(d)}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-foreground text-sm">{d.subject}</h4>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityColors[d.priority]}`}>{priorityLabels[d.priority]}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusCfg[d.status]?.color}`}>{statusCfg[d.status]?.label}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground"><span>{d.patientName} ↔ {d.doctorName}</span><span>{d.messages.length} msg</span></div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ════ SUPPORT ════ */}
        <TabsContent value="support" className="space-y-6">
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            {[
              { value: tickets.length, label: "Total", cls: "text-foreground" },
              { value: tickets.filter(t => t.status === "open").length, label: "Ouverts", cls: "text-warning" },
              { value: tickets.filter(t => t.priority === "high" && t.status !== "closed").length, label: "Urgents", cls: "text-destructive" },
              { value: tickets.filter(t => t.status === "closed").length, label: "Résolus", cls: "text-accent" },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border bg-card p-4 text-center"><p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Rechercher..." value={ticketSearch} onChange={e => setTicketSearch(e.target.value)} className="pl-10" /></div>
            <Select value={ticketStatusFilter} onValueChange={setTicketStatusFilter}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Tous</SelectItem><SelectItem value="open">Ouverts</SelectItem><SelectItem value="in_progress">En cours</SelectItem><SelectItem value="closed">Fermés</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            {supportFiltered.length === 0 && <EmptyState icon={MessageSquare} title="Aucun ticket" description="Aucun ticket ne correspond à ce filtre." compact />}
            {supportFiltered.map(t => (
              <div key={t.id} className={`rounded-xl border bg-card p-5 shadow-card cursor-pointer hover:bg-muted/20 transition-colors ${t.priority === "high" && t.status !== "closed" ? "border-destructive/30" : ""}`} onClick={() => setSelectedTicket(t)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-medium text-foreground text-sm">{t.subject}</h4>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{t.category}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityColors[t.priority]}`}>{priorityLabels[t.priority]}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusCfg[t.status]?.color || statusCfg.open.color}`}>{statusCfg[t.status]?.label || t.status}</span>
                      {t.status !== "closed" && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Clock className="h-3 w-3" />SLA : {t.slaDeadline}</span>}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">{t.requester} ({t.requesterRole}) · {t.messages} msg</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    {t.status === "open" && <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleTicketTake(t.id)}>Prendre</Button>}
                    {t.status !== "closed" && <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleTicketClose(t.id)}>Clôturer</Button>}
                    {t.status === "closed" && <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => handleTicketReopen(t.id)}><RefreshCw className="h-3 w-3 mr-1" />Réouvrir</Button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Moderation Detail Sheet ── */}
      <Sheet open={!!selectedReport} onOpenChange={v => !v && setSelectedReport(null)}>
        <SheetContent className="sm:max-w-lg flex flex-col p-0">
          {selectedReport && (<>
            <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
              <SheetTitle className="text-base pr-6">{selectedReport.reason}</SheetTitle>
              <SheetDescription className="sr-only">Détail signalement</SheetDescription>
              <div className="flex items-center gap-2 flex-wrap mt-2">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusCfg[selectedReport.status]?.color}`}>{statusCfg[selectedReport.status]?.label}</span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityColors[selectedReport.priority]}`}>{priorityLabels[selectedReport.priority]}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{selectedReport.reporter} → {selectedReport.target}</p>
            </SheetHeader>
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-5">
                <div><p className="text-xs font-semibold text-muted-foreground mb-2">Description</p><p className="text-sm text-foreground leading-relaxed">{selectedReport.details}</p></div>
                <div><p className="text-xs font-semibold text-muted-foreground mb-2">Pièces ({selectedReport.evidence.length})</p>
                  {selectedReport.evidence.map((ev, i) => <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20 mb-1.5"><Image className="h-4 w-4 text-primary shrink-0" /><p className="text-sm text-foreground flex-1">{ev}</p></div>)}
                </div>
                <div><p className="text-xs font-semibold text-muted-foreground mb-2">Notes ({selectedReport.notes.length})</p>
                  {selectedReport.notes.map(n => <div key={n.id} className="rounded-lg p-3 bg-muted/40 border mb-1.5"><p className="text-[10px] font-medium text-foreground mb-1">{n.author}</p><p className="text-sm text-foreground">{n.text}</p></div>)}
                  <div className="flex gap-2 mt-2"><Input value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="Ajouter une note..." className="h-8 text-sm" onKeyDown={e => e.key === "Enter" && handleAddNote()} /><Button size="sm" className="h-8" onClick={handleAddNote}>Ajouter</Button></div>
                </div>
              </div>
            </ScrollArea>
            {selectedReport.status === "pending" && (
              <div className="border-t px-6 py-3 flex gap-2 shrink-0">
                <Button size="sm" className="flex-1" onClick={() => setModMotifAction({ id: selectedReport.id, type: "resolve" })}>Résoudre</Button>
                <Button size="sm" variant="outline" onClick={() => setModMotifAction({ id: selectedReport.id, type: "reject" })}>Rejeter</Button>
                <Button size="sm" variant="outline" className="text-destructive" onClick={() => setModMotifAction({ id: selectedReport.id, type: "suspend" })}>Suspendre</Button>
              </div>
            )}
          </>)}
        </SheetContent>
      </Sheet>

      {/* ── Dispute Detail Sheet ── */}
      <Sheet open={!!selectedDispute} onOpenChange={v => !v && setSelectedDispute(null)}>
        <SheetContent className="sm:max-w-lg flex flex-col p-0">
          {selectedDispute && (<>
            <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
              <SheetTitle className="text-base pr-6">{selectedDispute.subject}</SheetTitle>
              <SheetDescription className="sr-only">Détail litige</SheetDescription>
              <div className="flex items-center gap-2 mt-2"><span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusCfg[selectedDispute.status]?.color}`}>{statusCfg[selectedDispute.status]?.label}</span><span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityColors[selectedDispute.priority]}`}>{priorityLabels[selectedDispute.priority]}</span></div>
              <p className="text-xs text-muted-foreground mt-2">{selectedDispute.patientName} ↔ {selectedDispute.doctorName}</p>
            </SheetHeader>
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-4">
                {selectedDispute.messages.map(msg => {
                  const isAdmin = msg.authorRole === "admin";
                  const isSys = msg.text.startsWith("[Action]");
                  return isSys ? (
                    <div key={msg.id} className="flex justify-center"><div className="bg-muted/50 rounded-lg px-3 py-2 text-[11px] text-muted-foreground text-center max-w-[80%] border">{msg.text.replace("[Action] ", "")}</div></div>
                  ) : (
                    <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-xl p-3 ${isAdmin ? "bg-primary/10 border border-primary/20" : "bg-muted/40 border"}`}>
                        <div className="flex items-center gap-2 mb-1"><span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${roleColors[msg.authorRole] || "bg-muted text-muted-foreground"}`}>{msg.authorRole === "patient" ? "Patient" : msg.authorRole === "doctor" ? "Médecin" : "Admin"}</span><span className="text-xs font-medium text-foreground">{msg.author}</span></div>
                        <p className="text-sm text-foreground">{msg.text}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{new Date(msg.createdAt).toLocaleString("fr-TN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            {selectedDispute.status !== "resolved" && selectedDispute.status !== "closed" && (
              <div className="border-t px-6 py-3 space-y-2 shrink-0">
                <div className="flex gap-2"><Input value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Message..." className="h-9 text-sm" onKeyDown={e => e.key === "Enter" && handleDispSendMsg()} /><Button size="sm" className="h-9" onClick={handleDispSendMsg}><Send className="h-3.5 w-3.5" /></Button></div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => setDispMotifAction({ id: selectedDispute.id, type: "resolve" })}>Résoudre</Button>
                  <Button size="sm" variant="outline" className="text-xs text-destructive" onClick={() => setDispMotifAction({ id: selectedDispute.id, type: "close" })}>Fermer</Button>
                </div>
              </div>
            )}
          </>)}
        </SheetContent>
      </Sheet>

      {/* ── Support Detail Sheet ── */}
      <Sheet open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selectedTicket && (<>
            <SheetHeader><SheetTitle className="text-sm">{selectedTicket.subject}</SheetTitle></SheetHeader>
            <div className="mt-4 space-y-4">
              <div className="space-y-2 text-sm">
                {[["Demandeur", selectedTicket.requester], ["Rôle", selectedTicket.requesterRole], ["Catégorie", selectedTicket.category], ["SLA", selectedTicket.slaDeadline]].map(([l, v]) => (
                  <div key={l} className="flex justify-between"><span className="text-muted-foreground">{l}</span><span className="text-foreground">{v}</span></div>
                ))}
              </div>
              <div className="pt-4 border-t"><h4 className="text-sm font-semibold text-foreground mb-3">Conversation</h4>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {selectedTicket.conversation.map(msg => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === "admin" ? "items-end" : "items-start"}`}>
                      <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${msg.sender === "admin" ? "bg-primary/10" : "bg-muted/50"}`}>
                        <p className="text-[10px] font-medium text-muted-foreground mb-0.5">{msg.senderName}</p><p>{msg.text}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-0.5">{msg.time}</span>
                    </div>
                  ))}
                </div>
              </div>
              {selectedTicket.status !== "closed" && (
                <div className="pt-4 border-t space-y-3">
                  <div className="flex gap-1 flex-wrap">
                    {mockSupportMacros.map(m => <button key={m.id} onClick={() => setReply(m.text)} className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full hover:bg-primary/20">{m.label}</button>)}
                  </div>
                  <Textarea placeholder="Votre réponse..." value={reply} onChange={e => setReply(e.target.value)} className="min-h-[80px] text-sm" />
                  <div className="flex gap-2">
                    <Button size="sm" className="gradient-primary text-primary-foreground flex-1" onClick={handleTicketReply} disabled={!reply.trim()}><Send className="h-3 w-3 mr-1" />Envoyer</Button>
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleTicketClose(selectedTicket.id)}>Clôturer</Button>
                  </div>
                </div>
              )}
              {selectedTicket.status === "closed" && (
                <div className="pt-4 border-t"><Button size="sm" variant="outline" className="w-full" onClick={() => handleTicketReopen(selectedTicket.id)}><RefreshCw className="h-3.5 w-3.5 mr-1" />Réouvrir</Button></div>
              )}
            </div>
          </>)}
        </SheetContent>
      </Sheet>

      {/* ── Motif Dialogs ── */}
      {modMotifAction && (
        <MotifDialog
          open={!!modMotifAction}
          onClose={() => setModMotifAction(null)}
          onConfirm={handleModMotif}
          title={modMotifCfg[modMotifAction.type]?.title || "Action"}
          confirmLabel={modMotifCfg[modMotifAction.type]?.label || "Confirmer"}
          destructive={modMotifCfg[modMotifAction.type]?.destructive}
        />
      )}
      {dispMotifAction && (
        <MotifDialog
          open={!!dispMotifAction}
          onClose={() => setDispMotifAction(null)}
          onConfirm={handleDispMotif}
          title={dispMotifAction.type === "resolve" ? "Résoudre le litige" : "Fermer le litige"}
          confirmLabel={dispMotifAction.type === "resolve" ? "Résoudre" : "Fermer"}
          destructive={dispMotifAction.type === "close"}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminResolution;
