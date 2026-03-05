import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, MessageSquare, CheckCircle, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";

const initialTickets = [
  { id: "tk-1", requester: "Fatma Trabelsi", category: "rdv", status: "open", priority: "high", createdAt: "20 Fév 2026", assignedTo: "" },
  { id: "tk-2", requester: "Dr. Sonia Gharbi", category: "facturation", status: "open", priority: "medium", createdAt: "19 Fév 2026", assignedTo: "Support L1" },
  { id: "tk-3", requester: "Pharmacie El Manar", category: "technique", status: "closed", priority: "low", createdAt: "17 Fév 2026", assignedTo: "Support L2" },
  { id: "tk-4", requester: "Ali Ben Salem", category: "compte", status: "open", priority: "medium", createdAt: "18 Fév 2026", assignedTo: "" },
];

const statusColors: Record<string, string> = { open: "bg-warning/10 text-warning", closed: "bg-accent/10 text-accent" };
const priorityColors: Record<string, string> = { high: "bg-destructive/10 text-destructive", medium: "bg-warning/10 text-warning", low: "bg-muted text-muted-foreground" };

const AdminSupport = () => {
  const [tickets, setTickets] = useState(initialTickets);
  const [search, setSearch] = useState("");

  const filtered = tickets.filter(t => {
    if (search && !t.requester.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleClose = (id: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "closed" } : t));
    appendLog("ticket_closed", "support_ticket", id, "Ticket clôturé");
    toast({ title: "Ticket clôturé" });
  };

  return (
    <DashboardLayout role="admin" title="Support">
      <div className="space-y-6">
        <div className="grid gap-3 grid-cols-3">
          <div className="rounded-xl border bg-card p-4 text-center"><p className="text-2xl font-bold text-warning">{tickets.filter(t => t.status === "open").length}</p><p className="text-xs text-muted-foreground">Ouverts</p></div>
          <div className="rounded-xl border bg-card p-4 text-center"><p className="text-2xl font-bold text-destructive">{tickets.filter(t => t.priority === "high" && t.status === "open").length}</p><p className="text-xs text-muted-foreground">Urgents</p></div>
          <div className="rounded-xl border bg-card p-4 text-center"><p className="text-2xl font-bold text-accent">{tickets.filter(t => t.status === "closed").length}</p><p className="text-xs text-muted-foreground">Résolus</p></div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>

        <div className="space-y-3">
          {filtered.map(t => (
            <div key={t.id} className="rounded-xl border bg-card p-5 shadow-card flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground text-sm">{t.requester}</h4>
                <div className="flex gap-2 mt-1">
                  <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{t.category}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityColors[t.priority]}`}>{t.priority}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[t.status]}`}>{t.status === "open" ? "Ouvert" : "Fermé"}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{t.createdAt}{t.assignedTo ? ` · Assigné à ${t.assignedTo}` : ""}</p>
              </div>
              {t.status === "open" && (
                <Button size="sm" variant="outline" className="text-xs" onClick={() => handleClose(t.id)}>
                  <CheckCircle className="h-3 w-3 mr-1" />Clôturer
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSupport;
