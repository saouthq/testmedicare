/**
 * Admin Organizations — Connected to central admin store
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Building2, Eye, Ban, UserCheck, X, Link2, Users, Plus, Pencil, MapPin, Phone, Mail, CreditCard, FileText, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";
import MotifDialog from "@/components/admin/MotifDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAdminOrganizations, useAdminLookups, suspendOrganizationWithCascade } from "@/stores/adminStore";
import type { AdminOrganization, OrgType, OrgStatus } from "@/types/admin";

const availableSecretaries = ["Sonia Gharbi", "Amira Bouzid", "Mariem Kaabi"];

const typeLabels: Record<string, string> = { cabinet: "Cabinet", clinic: "Clinique", hospital: "Hôpital", lab: "Laboratoire", pharmacy: "Pharmacie" };
const typeColors: Record<string, string> = { cabinet: "bg-primary/10 text-primary", clinic: "bg-accent/10 text-accent", hospital: "bg-destructive/10 text-destructive", lab: "bg-warning/10 text-warning", pharmacy: "bg-muted text-foreground" };
const statusLabels: Record<string, string> = { active: "Actif", pending: "En attente", suspended: "Suspendu" };
const statusColors: Record<string, string> = { active: "bg-accent/10 text-accent", pending: "bg-warning/10 text-warning", suspended: "bg-destructive/10 text-destructive" };

const AdminOrganizations = () => {
  const [search, setSearch] = useState("");
  const { organizations: orgs, setOrganizations: setOrgs } = useAdminOrganizations();
  const lookups = useAdminLookups();
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected, setSelected] = useState<AdminOrganization | null>(null);
  const [motifOpen, setMotifOpen] = useState<{ id: string; action: "suspend" | "activate" } | null>(null);
  const [attachOpen, setAttachOpen] = useState<string | null>(null);
  const [selectedSecretary, setSelectedSecretary] = useState("");

  // Create/Edit
  const [editOpen, setEditOpen] = useState(false);
  const [editOrg, setEditOrg] = useState<AdminOrganization | null>(null);
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

  const openEdit = (o: AdminOrganization) => {
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
      appendLog("org_updated", "organization", editOrg.id, `Organisation "${formName}" modifiée`);
      toast({ title: "Organisation modifiée" });
    } else {
      const newOrg: AdminOrganization = {
        id: `org-${Date.now()}`, type: formType, name: formName, city: formCity, address: formAddress,
        phone: formPhone, email: formEmail, status: "active", memberIds: [], secretaryNames: [],
        membersCount: 0, createdAt: new Date().toLocaleDateString("fr-TN", { month: "short", year: "numeric" }),
        internalNotes: [],
      };
      setOrgs(prev => [newOrg, ...prev]);
      appendLog("org_created", "organization", newOrg.id, `Organisation "${formName}" créée`);
      toast({ title: "Organisation créée" });
    }
    setEditOpen(false);
  };

  const handleMotifConfirm = (motif: string) => {
    if (!motifOpen) return;
    const o = orgs.find(x => x.id === motifOpen.id);
    if (!o) return;
    if (motifOpen.action === "suspend") {
      // Cascade suspend: org + members + subscription
      suspendOrganizationWithCascade(motifOpen.id, motif);
      toast({ title: "Organisation suspendue (cascade)", description: `${o.name} + membres + abonnement suspendus.` });
    } else {
      setOrgs(prev => prev.map(x => x.id === motifOpen.id ? { ...x, status: "active" as OrgStatus } : x));
      appendLog("org_status_change", "organization", motifOpen.id, `${o.name} — active — Motif : ${motif}`);
      toast({ title: "Organisation activée" });
    }
    setMotifOpen(null);
  };

  const handleAttachSecretary = () => {
    if (!attachOpen || !selectedSecretary) return;
    setOrgs(prev => prev.map(o => o.id === attachOpen ? { ...o, secretaryNames: [...o.secretaryNames, selectedSecretary] } : o));
    const o = orgs.find(x => x.id === attachOpen);
    appendLog("secretary_attached", "organization", attachOpen, `${selectedSecretary} rattachée à ${o?.name}`);
    toast({ title: `${selectedSecretary} rattachée` });
    setSelectedSecretary("");
    setAttachOpen(null);
  };

  // 360 view data for selected org
  const selectedSub = selected?.subscriptionId ? lookups.getSubById(selected.subscriptionId) : selected?.id ? lookups.getSubByOrgId(selected.id) : undefined;
  const selectedMembers = selected ? lookups.getMembersByOrgId(selected.id) : [];
  const selectedPayments = selected ? lookups.getPaymentsByOrgId(selected.id) : [];

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
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">
                    <Building2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p>Aucune organisation trouvée</p>
                  </td></tr>
                )}
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

          {/* 360 Detail panel */}
          {selected && (
            <Sheet open={!!selected} onOpenChange={v => !v && setSelected(null)}>
              <SheetContent className="sm:max-w-md flex flex-col p-0">
                <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
                  <SheetTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />{selected.name}
                  </SheetTitle>
                  <SheetDescription className="sr-only">Fiche organisation</SheetDescription>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[selected.type]}`}>{typeLabels[selected.type]}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[selected.status]}`}>{statusLabels[selected.status]}</span>
                  </div>
                </SheetHeader>
                <ScrollArea className="flex-1 px-6 py-4">
                  <div className="space-y-5">
                    {/* Info */}
                    <div className="rounded-lg border p-4 space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-3.5 w-3.5 shrink-0" /><span>{selected.address}, {selected.city}</span></div>
                      <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5 shrink-0" /><span>{selected.phone}</span></div>
                      <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5 shrink-0" /><span>{selected.email}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Membres</span><span className="text-foreground font-medium">{selected.membersCount}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Créé</span><span className="text-foreground">{selected.createdAt}</span></div>
                    </div>

                    {/* Owner */}
                    {selected.ownerId && (() => {
                      const owner = lookups.getUserById(selected.ownerId!);
                      return owner ? (
                        <div className="rounded-lg border p-4">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">Propriétaire</p>
                          <Link to="/dashboard/admin/users" className="flex items-center gap-2 text-sm text-primary hover:underline">
                            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{owner.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</div>
                            {owner.name}
                          </Link>
                        </div>
                      ) : null;
                    })()}

                    {/* Members */}
                    {selectedMembers.length > 0 && (
                      <div className="rounded-lg border p-4">
                        <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><Users className="h-3 w-3" />Membres ({selectedMembers.length})</p>
                        <div className="space-y-1">
                          {selectedMembers.map(m => (
                            <p key={m.id} className="text-xs text-foreground">{m.name} <span className="text-muted-foreground">({m.role})</span></p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Secretaries */}
                    {selected.secretaryNames.length > 0 && (
                      <div className="rounded-lg border p-4">
                        <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1"><Users className="h-3 w-3" />Secrétaires</p>
                        {selected.secretaryNames.map((s, i) => <p key={i} className="text-xs text-foreground">{s}</p>)}
                      </div>
                    )}

                    {/* Subscription */}
                    {selectedSub && (
                      <div className="rounded-lg border p-4">
                        <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><CreditCard className="h-3 w-3" />Abonnement</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><span className="text-foreground font-medium">{selectedSub.plan}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Prix</span><span className="text-foreground">{selectedSub.monthlyPrice} DT/mois</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Statut</span><span className="text-foreground">{selectedSub.status}</span></div>
                        </div>
                      </div>
                    )}

                    {/* Payments */}
                    {selectedPayments.length > 0 && (
                      <div className="rounded-lg border p-4">
                        <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><FileText className="h-3 w-3" />Derniers paiements</p>
                        {selectedPayments.slice(0, 3).map(p => (
                          <div key={p.id} className="flex justify-between text-xs py-1 border-b last:border-0">
                            <span className="text-foreground">{p.amount} {p.currency}</span>
                            <span className="text-muted-foreground">{p.createdAt}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Internal notes */}
                    {selected.internalNotes.length > 0 && (
                      <div className="rounded-lg border p-4">
                        <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><MessageSquare className="h-3 w-3" />Notes internes</p>
                        {selected.internalNotes.map(n => (
                          <div key={n.id} className="text-xs text-foreground py-1 border-b last:border-0">
                            <span className="text-muted-foreground">{n.author} · {new Date(n.createdAt).toLocaleDateString("fr-TN")}</span>
                            <p>{n.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => { setSelected(null); openEdit(selected); }}>
                        <Pencil className="h-3 w-3 mr-1" />Modifier
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
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
              <div><Label className="text-xs">Nom *</Label><Input className="mt-1" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Cabinet Dr. ..." /></div>
              <div>
                <Label className="text-xs">Type *</Label>
                <Select value={formType} onValueChange={v => setFormType(v as OrgType)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(typeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label className="text-xs">Ville *</Label><Input className="mt-1" value={formCity} onChange={e => setFormCity(e.target.value)} placeholder="Tunis" /></div>
              <div><Label className="text-xs">Adresse</Label><Input className="mt-1" value={formAddress} onChange={e => setFormAddress(e.target.value)} placeholder="12 Rue..." /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label className="text-xs">Téléphone</Label><Input className="mt-1" value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="+216 71..." /></div>
              <div><Label className="text-xs">Email</Label><Input className="mt-1" type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="contact@..." /></div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Annuler</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={handleSaveOrg}>{editOrg ? "Enregistrer" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {motifOpen && (
        <MotifDialog open={!!motifOpen} onClose={() => setMotifOpen(null)} onConfirm={handleMotifConfirm}
          title={motifOpen.action === "suspend" ? "Suspendre l'organisation" : "Activer l'organisation"}
          description={orgs.find(o => o.id === motifOpen.id)?.name || ""}
          confirmLabel={motifOpen.action === "suspend" ? "Suspendre" : "Activer"}
          destructive={motifOpen.action === "suspend"}
        />
      )}

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
            <Button variant="outline" onClick={() => setAttachOpen(null)}>Annuler</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={handleAttachSecretary} disabled={!selectedSecretary}>Rattacher</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminOrganizations;
