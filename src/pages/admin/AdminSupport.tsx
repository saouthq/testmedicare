/**
 * Admin Support Tickets — with SLA, conversation thread, macros, reopen
 * TODO BACKEND: Replace mock data with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, MessageSquare, CheckCircle, Send, User, Clock, RefreshCw, AlertTriangle, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";
import { mockAdminTickets, mockSupportMacros } from "@/data/mockData";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const statusColors: Record<string, string> = { open: "bg-warning/10 text-warning", closed: "bg-accent/10 text-accent", in_progress: "bg-primary/10 text-primary" };
const statusLabels: Record<string, string> = { open: "Ouvert", closed: "Résolu", in_progress: "En cours" };
const priorityColors: Record<string, string> = { high: "bg-destructive/10 text-destructive", medium: "bg-warning/10 text-warning", low: "bg-muted text-muted-foreground" };
const priorityLabels: Record<string, string> = { high: "Urgent", medium: "Moyen", low: "Faible" };

interface TicketMessage {
  id: string;
  sender: "user" | "admin";
  senderName: string;
  text: string;
  time: string;
}

interface TicketExt {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  requester: string;
  requesterRole: string;
  assignedTo: string;
  createdAt: string;
  messages: number;
  slaDeadline: string;
  conversation: TicketMessage[];
}

const enrichTickets = (): TicketExt[] =>
  mockAdminTickets.map(t => ({
    ...t,
    status: t.status === "open" ? "open" : "closed",
    slaDeadline: t.priority === "high" ? "2h" : t.priority === "medium" ? "8h" : "24h",
    conversation: [
      { id: `${t.id}-1`, sender: "user" as const, senderName: t.requester, text: `Bonjour, ${t.subject.toLowerCase()}. Merci de m'aider.`, time: t.createdAt + " 09:15" },
      ...(t.status === "closed" ? [{ id: `${t.id}-2`, sender: "admin" as const, senderName: t.assignedTo || "Support", text: "Votre demande a été traitée. N'hésitez pas à revenir vers nous.", time: t.createdAt + " 10:30" }] : []),
    ],
  }));

const AdminSupport = () => {
  const [tickets, setTickets] = useState<TicketExt[]>(enrichTickets());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<TicketExt | null>(null);
  const [reply, setReply] = useState("");

  const categories = Array.from(new Set(tickets.map(t => t.category)));

  const filtered = tickets.filter(t => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
    if (search && !t.requester.toLowerCase().includes(search.toLowerCase()) && !t.subject.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleClose = (id: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "closed" } : t));
    appendLog("ticket_closed", "support_ticket", id, "Ticket clôturé");
    toast({ title: "Ticket clôturé" });
    if (selectedTicket?.id === id) setSelectedTicket(prev => prev ? { ...prev, status: "closed" } : null);
  };

  const handleReopen = (id: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "open" } : t));
    appendLog("ticket_reopened", "support_ticket", id, "Ticket réouvert");
    toast({ title: "Ticket réouvert" });
    if (selectedTicket?.id === id) setSelectedTicket(prev => prev ? { ...prev, status: "open" } : null);
  };

  const handleTakeOver = (id: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "in_progress", assignedTo: "Admin Support" } : t));
    appendLog("ticket_assigned", "support_ticket", id, "Ticket pris en charge par Admin Support");
    toast({ title: "Ticket pris en charge" });
    if (selectedTicket?.id === id) setSelectedTicket(prev => prev ? { ...prev, status: "in_progress", assignedTo: "Admin Support" } : null);
  };

  const handleSendReply = () => {
    if (!reply.trim() || !selectedTicket) return;
    const newMsg: TicketMessage = {
      id: `msg-${Date.now()}`,
      sender: "admin",
      senderName: "Admin Support",
      text: reply.trim(),
      time: new Date().toLocaleString("fr-TN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
    };
    setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, conversation: [...t.conversation, newMsg], messages: t.messages + 1 } : t));
    setSelectedTicket(prev => prev ? { ...prev, conversation: [...prev.conversation, newMsg], messages: prev.messages + 1 } : null);
    appendLog("ticket_reply", "support_ticket", selectedTicket.id, `Réponse envoyée à ${selectedTicket.requester}`);
    toast({ title: "Réponse envoyée" });
    setReply("");
  };

  const useMacro = (text: string) => setReply(text);

  const openCount = tickets.filter(t => t.status === "open").length;
  const inProgressCount = tickets.filter(t => t.status === "in_progress").length;
  const urgentCount = tickets.filter(t => t.priority === "high" && t.status !== "closed").length;

  return (
    <DashboardLayout role="admin" title="Support">
      <div className="space-y-6">
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-4 text-center"><p className="text-2xl font-bold text-foreground">{tickets.length}</p><p className="text-xs text-muted-foreground">Total</p></div>
          <div className="rounded-xl border bg-card p-4 text-center"><p className="text-2xl font-bold text-warning">{openCount}</p><p className="text-xs text-muted-foreground">Ouverts</p></div>
          <div className="rounded-xl border bg-card p-4 text-center"><p className="text-2xl font-bold text-destructive">{urgentCount}</p><p className="text-xs text-muted-foreground">Urgents</p></div>
          <div className="rounded-xl border bg-card p-4 text-center"><p className="text-2xl font-bold text-accent">{tickets.filter(t => t.status === "closed").length}</p><p className="text-xs text-muted-foreground">Résolus</p></div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="open">Ouverts</SelectItem>
              <SelectItem value="in_progress">En cours</SelectItem>
              <SelectItem value="closed">Fermés</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Catégorie" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {filtered.map(t => (
            <div key={t.id} className={`rounded-xl border bg-card p-5 shadow-card cursor-pointer hover:bg-muted/20 transition-colors ${t.priority === "high" && t.status !== "closed" ? "border-destructive/30" : ""}`} onClick={() => setSelectedTicket(t)}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="font-medium text-foreground text-sm">{t.subject}</h4>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{t.category}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityColors[t.priority]}`}>{priorityLabels[t.priority]}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[t.status] || statusColors.open}`}>{statusLabels[t.status] || t.status}</span>
                    {t.status !== "closed" && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Clock className="h-3 w-3" />SLA : {t.slaDeadline}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><User className="h-3 w-3 inline" />{t.requester} ({t.requesterRole})</span>
                    {t.createdAt}{t.assignedTo ? ` · ${t.assignedTo}` : ""} · {t.messages} msg
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  {t.status === "open" && (
                    <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleTakeOver(t.id)}>
                      Prendre en charge
                    </Button>
                  )}
                  {t.status !== "closed" && (
                    <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleClose(t.id)}>
                      <CheckCircle className="h-3 w-3 mr-1" />Clôturer
                    </Button>
                  )}
                  {t.status === "closed" && (
                    <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => handleReopen(t.id)}>
                      <RefreshCw className="h-3 w-3 mr-1" />Réouvrir
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aucun ticket trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* Ticket detail drawer with conversation */}
      <Sheet open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selectedTicket && (
            <>
              <SheetHeader>
                <SheetTitle className="text-sm">{selectedTicket.subject}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                {/* Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Demandeur</span><span className="text-foreground">{selectedTicket.requester}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Rôle</span><span className="text-foreground">{selectedTicket.requesterRole}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Catégorie</span><span className="text-foreground flex items-center gap-1"><Tag className="h-3 w-3" />{selectedTicket.category}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Priorité</span><span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[selectedTicket.priority]}`}>{priorityLabels[selectedTicket.priority]}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">SLA</span><span className="text-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{selectedTicket.slaDeadline}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Statut</span><span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[selectedTicket.status] || statusColors.open}`}>{statusLabels[selectedTicket.status] || selectedTicket.status}</span></div>
                  {selectedTicket.assignedTo && <div className="flex justify-between"><span className="text-muted-foreground">Assigné à</span><span className="text-foreground">{selectedTicket.assignedTo}</span></div>}
                </div>

                {/* Conversation thread */}
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Conversation</h4>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {selectedTicket.conversation.map(msg => (
                      <div key={msg.id} className={`flex flex-col ${msg.sender === "admin" ? "items-end" : "items-start"}`}>
                        <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${msg.sender === "admin" ? "bg-primary/10 text-foreground" : "bg-muted/50 text-foreground"}`}>
                          <p className="text-[10px] font-medium text-muted-foreground mb-0.5">{msg.senderName}</p>
                          <p>{msg.text}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-0.5">{msg.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reply */}
                {selectedTicket.status !== "closed" && (
                  <div className="pt-4 border-t space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Répondre</h4>
                    <div className="flex gap-1 flex-wrap">
                      {mockSupportMacros.map(m => (
                        <button key={m.id} onClick={() => useMacro(m.text)} className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full hover:bg-primary/20 transition-colors">
                          {m.label}
                        </button>
                      ))}
                    </div>
                    <Textarea placeholder="Votre réponse..." value={reply} onChange={e => setReply(e.target.value)} className="min-h-[80px] text-sm" />
                    <div className="flex gap-2">
                      <Button size="sm" className="gradient-primary text-primary-foreground flex-1" onClick={handleSendReply} disabled={!reply.trim()}>
                        <Send className="h-3 w-3 mr-1" />Envoyer
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleClose(selectedTicket.id)}>
                        Clôturer
                      </Button>
                    </div>
                  </div>
                )}

                {/* Reopen */}
                {selectedTicket.status === "closed" && (
                  <div className="pt-4 border-t">
                    <Button size="sm" variant="outline" className="w-full" onClick={() => handleReopen(selectedTicket.id)}>
                      <RefreshCw className="h-3.5 w-3.5 mr-1" />Réouvrir le ticket
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default AdminSupport;
