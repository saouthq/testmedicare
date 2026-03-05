import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, Building2, Eye, Ban, UserCheck, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";

const initialOrgs = [
  { id: 1, type: "cabinet", name: "Cabinet Dr. Bouazizi", city: "Tunis", status: "active", membersCount: 3 },
  { id: 2, type: "clinic", name: "Clinique El Manar", city: "Tunis", status: "active", membersCount: 45 },
  { id: 3, type: "hospital", name: "Hôpital Charles Nicolle", city: "Tunis", status: "active", membersCount: 320 },
  { id: 4, type: "lab", name: "Labo BioSanté", city: "Sousse", status: "active", membersCount: 12 },
  { id: 5, type: "pharmacy", name: "Pharmacie El Amal", city: "Sousse", status: "pending", membersCount: 4 },
  { id: 6, type: "cabinet", name: "Cabinet Dr. Gharbi", city: "Ariana", status: "suspended", membersCount: 2 },
];

const typeLabels: Record<string, string> = { cabinet: "Cabinet", clinic: "Clinique", hospital: "Hôpital", lab: "Laboratoire", pharmacy: "Pharmacie" };
const typeColors: Record<string, string> = { cabinet: "bg-primary/10 text-primary", clinic: "bg-accent/10 text-accent", hospital: "bg-destructive/10 text-destructive", lab: "bg-warning/10 text-warning", pharmacy: "bg-muted text-foreground" };
const statusLabels: Record<string, string> = { active: "Actif", pending: "En attente", suspended: "Suspendu" };
const statusColors: Record<string, string> = { active: "bg-accent/10 text-accent", pending: "bg-warning/10 text-warning", suspended: "bg-destructive/10 text-destructive" };

const AdminOrganizations = () => {
  const [search, setSearch] = useState("");
  const [orgs, setOrgs] = useState(initialOrgs);
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = orgs.filter(o => {
    if (typeFilter !== "all" && o.type !== typeFilter) return false;
    if (search && !o.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleStatus = (id: number) => {
    setOrgs(prev => prev.map(o => {
      if (o.id !== id) return o;
      const newStatus = o.status === "active" ? "suspended" : "active";
      appendLog("org_status_change", "organization", String(id), `${o.name} — statut changé en ${newStatus}`);
      toast({ title: newStatus === "active" ? "Organisation activée" : "Organisation suspendue" });
      return { ...o, status: newStatus };
    }));
  };

  return (
    <DashboardLayout role="admin" title="Organisations">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="rounded-lg border bg-card px-3 py-2 text-sm">
            <option value="all">Tous types</option>
            {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Organisation</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ville</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Membres</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium text-foreground">{o.name}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[o.type]}`}>{typeLabels[o.type]}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{o.city}</td>
                  <td className="px-4 py-3 text-muted-foreground">{o.membersCount}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[o.status]}`}>{statusLabels[o.status]}</span></td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => toggleStatus(o.id)} title={o.status === "active" ? "Suspendre" : "Activer"}>
                      {o.status === "active" ? <Ban className="h-4 w-4 text-warning" /> : <UserCheck className="h-4 w-4 text-accent" />}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminOrganizations;
