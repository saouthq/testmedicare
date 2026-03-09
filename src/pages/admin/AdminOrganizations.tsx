/**
 * Admin Organizations — Cabinets, labs, pharmacies with create/edit + secretary attach
 * TODO BACKEND: Replace mock data with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, Building2, Eye, Ban, UserCheck, X, Link2, Users, Plus, Pencil, MapPin, Phone, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";
import MotifDialog from "@/components/admin/MotifDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type OrgType = "cabinet" | "clinic" | "hospital" | "lab" | "pharmacy";

interface Org {
  id: number;
  type: OrgType;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  status: string;
  membersCount: number;
  secretaries: string[];
  createdAt: string;
}

const initialOrgs: Org[] = [
  { id: 1, type: "cabinet", name: "Cabinet Dr. Bouazizi", city: "Tunis", address: "12 Rue de la Liberté", phone: "+216 71 234 567", email: "bouazizi@cabinet.tn", status: "active", membersCount: 3, secretaries: ["Sonia Gharbi"], createdAt: "Jan 2025" },
  { id: 2, type: "clinic", name: "Clinique El Manar", city: "Tunis", address: "Av. de la Clinique, El Manar", phone: "+216 71 890 123", email: "contact@elmanar.tn", status: "active", membersCount: 45, secretaries: ["Amira Bouzid"], createdAt: "Mar 2024" },
  { id: 3, type: "hospital", name: "Hôpital Charles Nicolle", city: "Tunis", address: "Bab Souika", phone: "+216 71 578 000", email: "info@charles-nicolle.tn", status: "active", membersCount: 320, secretaries: [], createdAt: "Jan 2020" },
  { id: 4, type: "lab", name: "Labo BioSanté", city: "Sousse", address: "45 Av. Bourguiba", phone: "+216 73 456 789", email: "contact@biosante.tn", status: "active", membersCount: 12, secretaries: [], createdAt: "Jun 2025" },
  { id: 5, type: "pharmacy", name: "Pharmacie El Amal", city: "Sousse", address: "Rue de la Pharmacie", phone: "+216 73 111 222", email: "elamal@pharmacy.tn", status: "pending", membersCount: 4, secretaries: [], createdAt: "Fév 2026" },
  { id: 6, type: "cabinet", name: "Cabinet Dr. Gharbi", city: "Ariana", address: "15 Rue des Roses", phone: "+216 71 333 444", email: "gharbi@cabinet.tn", status: "suspended", membersCount: 2, secretaries: [], createdAt: "Sep 2025" },
];

const availableSecretaries = ["Sonia Gharbi", "Amira Bouzid", "Mariem Kaabi"];

const typeLabels: Record<string, string> = { cabinet: "Cabinet", clinic: "Clinique", hospital: "Hôpital", lab: "Laboratoire", pharmacy: "Pharmacie" };
const typeColors: Record<string, string> = { cabinet: "bg-primary/10 text-primary", clinic: "bg-accent/10 text-accent", hospital: "bg-destructive/10 text-destructive", lab: "bg-warning/10 text-warning", pharmacy: "bg-muted text-foreground" };
const statusLabels: Record<string, string> = { active: "Actif", pending: "En attente", suspended: "Suspendu" };
const statusColors: Record<string, string> = { active: "bg-accent/10 text-accent", pending: "bg-warning/10 text-warning", suspended: "bg-destructive/10 text-destructive" };

const AdminOrganizations = () => {
  const [search, setSearch] = useState("");
  const [orgs, setOrgs] = useState<Org[]>(initialOrgs);
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected, setSelected] = useState<Org | null>(null);
  const [motifOpen, setMotifOpen] = useState<{ id: number; action: "suspend" | "activate" } | null>(null);
  const [attachOpen, setAttachOpen] = useState<number | null>(null);
  const [selectedSecretary, setSelectedSecretary] = useState("");

  // Create/Edit
  const [editOpen, setEditOpen] = useState(false);
  const [editOrg, setEditOrg] = useState<Org | null>(null);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<OrgType>("cabinet");
  const [formCity, setFormCity] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");

  const filtered = orgs.filter(o => {
    if (typeFilter !== "all" && o.type !== typeFilter) return false;
    if (search && !o.name.toLowerCase().includes(search.toLowerCase()) && !o.city.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openCreate = () => {
    setEditOrg(null);
    setFormName(""); setFormType("cabinet"); setFormCity(""); setFormAddress(""); setFormPhone(""); setFormEmail("");
    setEditOpen(true);
  };

  const openEdit = (o: Org) => {
    setEditOrg(o);
    setFormName(o.name); setFormType(o.type); setFormCity(o.city); setFormAddress(o.address); setFormPhone(o.phone); setFormEmail(o.email);
    setEditOpen(true);
  };

  const handleSaveOrg = () => {
    if (!formName.trim() || !formCity.trim()) {
      toast({ title: "Nom et ville obligatoires", variant: "destructive" });
      return;
    }
    if (editOrg) {
      setOrgs(prev => prev.map(o => o.id === editOrg.id ? { ...o, name: formName, type: formType, city: formCity, address: formAddress, phone: formPhone, email: formEmail } : o));
      appendLog("org_updated", "organization", String(editOrg.id), `Organisation "${formName}" modifiée`);
      toast({ title: "Organisation modifiée" });
    } else {
      const newOrg: Org = {
        id: Date.now(), type: formType, name: formName, city: formCity, address: formAddress,
        phone: formPhone, email: formEmail, status: "active", membersCount: 0, secretaries: [],
        createdAt: new Date().toLocaleDateString("fr-TN", { month: "short", year: "numeric" }),
      };
      setOrgs(prev => [newOrg, ...prev]);
      appendLog("org_created", "organization", String(newOrg.id), `Organisation "${formName}" créée`);
      toast({ title: "Organisation créée" });
    }
    setEditOpen(false);
  };

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
        {/* Stats */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg border bg-card p-3 text-center">
            <p className="text-lg font-bold text-foreground">{orgs.length}</p>
            <p className="text-[11px] text-muted-foreground">Total</p>
          </div>
          {(["cabinet", "clinic", "lab", "pharmacy"] as OrgType[]).map(t => (
            <div key={t} className="rounded-lg border bg-card p-3 text-center">
              <p className="text-lg font-bold text-foreground">{orgs.filter(o => o.type === t).length}</p>
              <p className="text-[11px] text-muted-foreground">{typeLabels[t]}s</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="rounded-lg border bg-card px-3 py-2 text-sm">
            <option value="all">Tous types</option>
            {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <Button onClick={openCreate} className="gradient-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-1" />Ajouter
          </Button>
        </div>

        <div className="flex gap-6">
          <div className="flex-1 rounded-xl border bg-card shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Organisation</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Ville</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Membres</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className={`border-b last:border-0 hover:bg-muted/20 cursor-pointer ${selected?.id === o.id ? "bg-primary/5" : ""}`} onClick={() => setSelected(o)}>
                    <td className="px-4 py-3 font-medium text-foreground">{o.name}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[o.type]}`}>{typeLabels[o.type]}</span></td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{o.city}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{o.membersCount}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[o.status]}`}>{statusLabels[o.status]}</span></td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Modifier" onClick={() => openEdit(o)}><Pencil className="h-3.5 w-3.5" /></Button>
                        {(o.type === "cabinet" || o.type === "clinic") && (
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Rattacher secrétaire" onClick={() => setAttachOpen(o.id)}><Link2 className="h-3.5 w-3.5 text-primary" /></Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setMotifOpen({ id: o.id, action: o.status === "active" ? "suspend" : "activate" })} title={o.status === "active" ? "Suspendre" : "Activer"}>
                          {o.status === "active" ? <Ban className="h-3.5 w-3.5 text-warning" /> : <UserCheck className="h-3.5 w-3.5 text-accent" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detail drawer (desktop) */}
          {selected && (
            <div className="w-80 rounded-xl border bg-card shadow-card p-5 space-y-4 shrink-0 hidden lg:block">
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
                <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-3.5 w-3.5 shrink-0" /><span>{selected.address}, {selected.city}</span></div>
                <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5 shrink-0" /><span>{selected.phone}</span></div>
                <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5 shrink-0" /><span>{selected.email}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Membres</span><span className="text-foreground font-medium">{selected.membersCount}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Créé</span><span className="text-foreground">{selected.createdAt}</span></div>
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
              <div className="pt-3 border-t flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => openEdit(selected)}>
                  <Pencil className="h-3 w-3 mr-1" />Modifier
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editOrg ? "Modifier l'organisation" : "Ajouter une organisation"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Nom *</Label>
                <Input className="mt-1" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Cabinet Dr. ..." />
              </div>
              <div>
                <Label className="text-xs">Type *</Label>
                <Select value={formType} onValueChange={v => setFormType(v as OrgType)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Ville *</Label>
                <Input className="mt-1" value={formCity} onChange={e => setFormCity(e.target.value)} placeholder="Tunis" />
              </div>
              <div>
                <Label className="text-xs">Adresse</Label>
                <Input className="mt-1" value={formAddress} onChange={e => setFormAddress(e.target.value)} placeholder="12 Rue..." />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Téléphone</Label>
                <Input className="mt-1" value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="+216 71..." />
              </div>
              <div>
                <Label className="text-xs">Email</Label>
                <Input className="mt-1" type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="contact@..." />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Annuler</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={handleSaveOrg}>
              {editOrg ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
