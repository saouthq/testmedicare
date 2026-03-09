/**
 * Admin Support Tickets — with macros and assignment
 * TODO BACKEND: Replace mock data with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, MessageSquare, CheckCircle, Send, User, ChevronDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";
import { mockAdminTickets, mockSupportMacros } from "@/data/mockData";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const statusColors: Record<string, string> = { open: "bg-warning/10 text-warning", closed: "bg-accent/10 text-accent" };
const priorityColors: Record<string, string> = { high: "bg-destructive/10 text-destructive", medium: "bg-warning/10 text-warning", low: "bg-muted text-muted-foreground" };
const priorityLabels: Record<string, string> = { high: "Urgent", medium: "Moyen", low: "Faible" };

const AdminSupport = () => {
  const [tickets, setTickets] = useState(mockAdminTickets);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<typeof mockAdminTickets[0] | null>(null);
  const [reply, setReply] = useState("");

  const filtered = tickets.filter(t => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (search && !t.requester.toLowerCase().includes(search.toLowerCase()) && !t.subject.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleClose = (id: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "closed" } : t));
    appendLog("ticket_closed", "support_ticket", id, "Ticket clôturé");
    toast({ title: "Ticket clôturé" });
    if (selectedTicket?.id === id) setSelectedTicket(prev => prev ? { ...prev, status: "closed" } : null);
  };

  const handleSendReply = () => {
    if (!reply.trim() || !selectedTicket) return;
    appendLog("ticket_reply", "support_ticket", selectedTicket.id, `Réponse envoyée à ${selectedTicket.requester}`);
    toast({ title: "Réponse envoyée (mock)" });
    setReply("");
  };

  const useMacro = (text: string) => setReply(text);

  return (
    <DashboardLayout role="admin" title="Support">
      <div className="space-y-6">
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-4 text-center"><p className="text-2xl font-bold text-foreground">{tickets.length}</p><p className="text-xs text-muted-foreground">Total</p></div>
          <div className="rounded-xl border bg-card p-4 text-center"><p className="text-2xl font-bold text-warning">{tickets.filter(t => t.status === "open").length}</p><p className="text-xs text-muted-foreground">Ouverts</p></div>
          <div className="rounded-xl border bg-card p-4 text-center"><p className="text-2xl font-bold text-destructive">{tickets.filter(t => t.priority === "high" && t.status === "open").length}</p><p className="text-xs text-muted-foreground">Urgents</p></div>
          <div className="rounded-xl border bg-card p-4 text-center"><p className="text-2xl font-bold text-accent">{tickets.filter(t => t.status === "closed").length}</p><p className="text-xs text-muted-foreground">Résolus</p></div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-lg border bg-card px-3 py-2 text-sm">
            <option value="all">Tous</option>
            <option value="open">Ouverts</option>
            <option value="closed">Fermés</option>
          </select>
        </div>

        <div className="space-y-3">
          {filtered.map(t => (
            <div key={t.id} className={`rounded-xl border bg-card p-5 shadow-card cursor-pointer hover:bg-muted/20 transition-colors ${t.priority === "high" && t.status === "open" ? "border-destructive/30" : ""}`} onClick={() => setSelectedTicket(t)}>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-foreground text-sm">{t.subject}</h4>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{t.category}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityColors[t.priority]}`}>{priorityLabels[t.priority]}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[t.status]}`}>{t.status === "open" ? "Ouvert" : "Fermé"}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><User className="h-3 w-3 inline" />{t.requester} ({t.requesterRole})</span>
                    {t.createdAt}{t.assignedTo ? ` · Assigné à ${t.assignedTo}` : ""} · {t.messages} message(s)
                  </p>
                </div>
                {t.status === "open" && (
                  <Button size="sm" variant="outline" className="text-xs shrink-0" onClick={e => { e.stopPropagation(); handleClose(t.id); }}>
                    <CheckCircle className="h-3 w-3 mr-1" />Clôturer
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ticket detail drawer */}
      <Sheet open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selectedTicket && (
            <>
              <SheetHeader>
                <SheetTitle className="text-sm">{selectedTicket.subject}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Demandeur</span><span className="text-foreground">{selectedTicket.requester}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Rôle</span><span className="text-foreground">{selectedTicket.requesterRole}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Catégorie</span><span className="text-foreground">{selectedTicket.category}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Priorité</span><span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[selectedTicket.priority]}`}>{priorityLabels[selectedTicket.priority]}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="text-foreground">{selectedTicket.createdAt}</span></div>
                </div>

                {selectedTicket.status === "open" && (
                  <div className="pt-4 border-t space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Répondre</h4>
                    {/* Macros */}
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
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default AdminSupport;
