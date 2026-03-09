/**
 * Admin Organizations — Cabinets, labs, pharmacies with secretary attach
 * TODO BACKEND: Replace mock data with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, Building2, Eye, Ban, UserCheck, X, Link2, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";
import MotifDialog from "@/components/admin/MotifDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const initialOrgs = [
  { id: 1, type: "cabinet", name: "Cabinet Dr. Bouazizi", city: "Tunis", status: "active", membersCount: 3, secretaries: ["Sonia Gharbi"] },
  { id: 2, type: "clinic", name: "Clinique El Manar", city: "Tunis", status: "active", membersCount: 45, secretaries: [] },
  { id: 3, type: "hospital", name: "Hôpital Charles Nicolle", city: "Tunis", status: "active", membersCount: 320, secretaries: [] },
  { id: 4, type: "lab", name: "Labo BioSanté", city: "Sousse", status: "active", membersCount: 12, secretaries: [] },
  { id: 5, type: "pharmacy", name: "Pharmacie El Amal", city: "Sousse", status: "pending", membersCount: 4, secretaries: [] },
  { id: 6, type: "cabinet", name: "Cabinet Dr. Gharbi", city: "Ariana", status: "suspended", membersCount: 2, secretaries: [] },
];

const availableSecretaries = ["Sonia Gharbi", "Amira Bouzid", "Mariem Kaabi"];

const typeLabels: Record<string, string> = { cabinet: "Cabinet", clinic: "Clinique", hospital: "Hôpital", lab: "Laboratoire", pharmacy: "Pharmacie" };
const typeColors: Record<string, string> = { cabinet: "bg-primary/10 text-primary", clinic: "bg-accent/10 text-accent", hospital: "bg-destructive/10 text-destructive", lab: "bg-warning/10 text-warning", pharmacy: "bg-muted text-foreground" };
const statusLabels: Record<string, string> = { active: "Actif", pending: "En attente", suspended: "Suspendu" };
const statusColors: Record<string, string> = { active: "bg-accent/10 text-accent", pending: "bg-warning/10 text-warning", suspended: "bg-destructive/10 text-destructive" };

const AdminOrganizations = () => {
  const [search, setSearch] = useState("");
  const [orgs, setOrgs] = useState(initialOrgs);
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected, setSelected] = useState<typeof initialOrgs[0] | null>(null);
  const [motifOpen, setMotifOpen] = useState<{ id: number; action: "suspend" | "activate" } | null>(null);
  const [attachOpen, setAttachOpen] = useState<number | null>(null);
  const [selectedSecretary, setSelectedSecretary] = useState("");

  const filtered = orgs.filter(o => {
    if (typeFilter !== "all" && o.type !== typeFilter) return false;
    if (search && !o.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleMotifConfirm = (motif: string) => {
    if (!motifOpen) return;
    const o = orgs.find(x => x.id === motifOpen.id);
    if (!o) return;
    const newStatus = motifOpen.action === "suspend" ? "suspended" : "active";
    setOrgs(prev => prev.map(x => x.id === motifOpen.id ? { ...x, status: newStatus } : x));
    appendLog("org_status_change", "organization", String(motifOpen.id), `${o.name} — ${newStatus} — Motif : ${motif}`);
    toast({ title: newStatus === "active" ? "Organisation activée" : "Organisation suspendue" });
    setMotifOpen(null);
  };

  const handleAttachSecretary = () => {
    if (!attachOpen || !selectedSecretary) return;
    setOrgs(prev => prev.map(o => o.id === attachOpen ? { ...o, secretaries: [...o.secretaries, selectedSecretary] } : o));
    const o = orgs.find(x => x.id === attachOpen);
    appendLog("secretary_attached", "organization", String(attachOpen), `${selectedSecretary} rattachée à ${o?.name}`);
    toast({ title: `${selectedSecretary} rattachée` });
    setSelectedSecretary("");
    setAttachOpen(null);
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

        <div className="flex gap-6">
          <div className="flex-1 rounded-xl border bg-card shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Organisation</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ville</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Membres</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Secrétaires</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className={`border-b last:border-0 hover:bg-muted/20 cursor-pointer ${selected?.id === o.id ? "bg-primary/5" : ""}`} onClick={() => setSelected(o)}>
                    <td className="px-4 py-3 font-medium text-foreground">{o.name}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[o.type]}`}>{typeLabels[o.type]}</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{o.city}</td>
                    <td className="px-4 py-3 text-muted-foreground">{o.membersCount}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{o.secretaries.length > 0 ? o.secretaries.join(", ") : "—"}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[o.status]}`}>{statusLabels[o.status]}</span></td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {o.type === "cabinet" && (
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Rattacher secrétaire" onClick={() => setAttachOpen(o.id)}><Link2 className="h-4 w-4 text-primary" /></Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setMotifOpen({ id: o.id, action: o.status === "active" ? "suspend" : "activate" })} title={o.status === "active" ? "Suspendre" : "Activer"}>
                          {o.status === "active" ? <Ban className="h-4 w-4 text-warning" /> : <UserCheck className="h-4 w-4 text-accent" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="w-72 rounded-xl border bg-card shadow-card p-5 space-y-4 shrink-0 hidden lg:block">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground text-sm">Détail</h4>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 mx-auto rounded-lg bg-muted flex items-center justify-center"><Building2 className="h-6 w-6 text-primary" /></div>
                <h3 className="font-bold text-foreground mt-2 text-sm">{selected.name}</h3>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[selected.type]}`}>{typeLabels[selected.type]}</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Ville</span><span className="text-foreground">{selected.city}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Membres</span><span className="text-foreground">{selected.membersCount}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Statut</span><span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[selected.status]}`}>{statusLabels[selected.status]}</span></div>
              </div>
              {selected.secretaries.length > 0 && (
                <div className="pt-3 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><Users className="h-3 w-3" />Secrétaires</p>
                  {selected.secretaries.map((s, i) => (
                    <p key={i} className="text-xs text-foreground">{s}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Motif dialog */}
      {motifOpen && (
        <MotifDialog
          open={!!motifOpen}
          onClose={() => setMotifOpen(null)}
          onConfirm={handleMotifConfirm}
          title={motifOpen.action === "suspend" ? "Suspendre l'organisation" : "Activer l'organisation"}
          description={orgs.find(o => o.id === motifOpen.id)?.name || ""}
          confirmLabel={motifOpen.action === "suspend" ? "Suspendre" : "Activer"}
          destructive={motifOpen.action === "suspend"}
        />
      )}

      {/* Attach secretary dialog */}
      <Dialog open={attachOpen !== null} onOpenChange={() => setAttachOpen(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Rattacher une secrétaire</DialogTitle></DialogHeader>
          <Select value={selectedSecretary} onValueChange={setSelectedSecretary}>
            <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
            <SelectContent>
              {availableSecretaries.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAttachOpen(null)}>Annuler</Button>
            <Button size="sm" className="gradient-primary text-primary-foreground" disabled={!selectedSecretary} onClick={handleAttachSecretary}>Rattacher</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminOrganizations;
