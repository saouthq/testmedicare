/**
 * AdminPlanManager — CRUD for subscription plans with duplication, subscriber count, CSV export
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import {
  Plus, Pencil, Trash2, Archive, Eye, Star, Save, Crown, Copy, Download,
  Building2, Stethoscope, Pill, FlaskConical, Hospital, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import MotifDialog from "@/components/admin/MotifDialog";
import {
  useAdminPlans, createPlan, updatePlan, togglePlanStatus, deletePlan,
  type AdminPlan, type PlanRole, type PlanStatus, planRoleLabels,
} from "@/stores/adminPlanStore";
import { featureCatalog } from "@/stores/featureMatrixStore";
import { useAdminSubscriptions } from "@/stores/adminStore";

const roleIcons: Record<PlanRole, any> = {
  doctor: Stethoscope, pharmacy: Pill, laboratory: FlaskConical,
  clinic: Building2, hospital: Hospital,
};

const statusLabels: Record<PlanStatus, { label: string; color: string }> = {
  active: { label: "Actif", color: "bg-accent/10 text-accent border-accent/20" },
  draft: { label: "Brouillon", color: "bg-warning/10 text-warning border-warning/20" },
  archived: { label: "Archivé", color: "bg-muted text-muted-foreground border-border" },
};

const roles: PlanRole[] = ["doctor", "pharmacy", "laboratory", "clinic", "hospital"];

const emptyPlan = (role: PlanRole): Partial<AdminPlan> => ({
  role, name: "", description: "", monthlyPrice: 0, annualPrice: 0,
  trialDays: 14, status: "draft", highlighted: false, features: [], sortOrder: 1,
});

const AdminPlanManager = () => {
  const [plans] = useAdminPlans();
  const { subscriptions } = useAdminSubscriptions();
  const [activeRole, setActiveRole] = useState<PlanRole>("doctor");
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<AdminPlan>>(emptyPlan("doctor"));
  const [motifAction, setMotifAction] = useState<{ type: string; id: string } | null>(null);
  const [featureSearch, setFeatureSearch] = useState("");

  const rolePlans = useMemo(() =>
    plans.filter(p => p.role === activeRole).sort((a, b) => a.sortOrder - b.sortOrder),
    [plans, activeRole]
  );

  // Subscriber counts per plan
  const subscriberCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    subscriptions.forEach(s => {
      if (s.status === "active" || s.status === "trial") {
        const key = s.plan.toLowerCase();
        plans.forEach(p => {
          if (p.name.toLowerCase() === key) counts[p.id] = (counts[p.id] || 0) + 1;
        });
      }
    });
    return counts;
  }, [plans, subscriptions]);

  const filteredFeatures = useMemo(() => {
    if (!featureSearch) return featureCatalog;
    const q = featureSearch.toLowerCase();
    return featureCatalog.filter(f => f.label.toLowerCase().includes(q) || f.category.toLowerCase().includes(q));
  }, [featureSearch]);

  const groupedFeatures = useMemo(() => {
    const g: Record<string, typeof featureCatalog> = {};
    filteredFeatures.forEach(f => { if (!g[f.category]) g[f.category] = []; g[f.category].push(f); });
    return g;
  }, [filteredFeatures]);

  const openCreate = () => { setEditId(null); setForm(emptyPlan(activeRole)); setEditOpen(true); };
  const openEdit = (p: AdminPlan) => { setEditId(p.id); setForm({ ...p }); setEditOpen(true); };

  const handleDuplicate = (p: AdminPlan) => {
    const dup: Omit<AdminPlan, "id" | "createdAt" | "updatedAt"> = {
      ...p, name: `${p.name} (copie)`, status: "draft" as PlanStatus, sortOrder: rolePlans.length + 1,
    };
    createPlan(dup, "Duplication de plan");
    toast({ title: "Plan dupliqué", description: `${p.name} → ${dup.name}` });
  };

  const handleSave = () => {
    if (!form.name || !form.monthlyPrice) {
      toast({ title: "Nom et prix mensuel requis", variant: "destructive" }); return;
    }
    setMotifAction({ type: editId ? "save_edit" : "save_create", id: editId || "new" });
    setEditOpen(false);
  };

  const handleMotifConfirm = (motif: string) => {
    if (!motifAction) return;
    const { type, id } = motifAction;

    if (type === "save_create") {
      createPlan(form as any, motif);
      toast({ title: "Plan créé", description: form.name });
    } else if (type === "save_edit") {
      updatePlan(id, form, motif);
      toast({ title: "Plan modifié", description: form.name });
    } else if (type === "archive") {
      togglePlanStatus(id, "archived", motif);
      toast({ title: "Plan archivé" });
    } else if (type === "activate") {
      togglePlanStatus(id, "active", motif);
      toast({ title: "Plan activé" });
    } else if (type === "delete") {
      deletePlan(id, motif);
      toast({ title: "Plan supprimé" });
    }
    setMotifAction(null);
  };

  const toggleFeature = (featureId: string) => {
    setForm(f => ({
      ...f,
      features: (f.features || []).includes(featureId)
        ? (f.features || []).filter(id => id !== featureId)
        : [...(f.features || []), featureId],
    }));
  };

  const handleExportCSV = () => {
    const csv = ["Rôle,Plan,Prix mensuel,Prix annuel,Essai,Features,Statut,Abonnés"]
      .concat(plans.map(p => `"${planRoleLabels[p.role]}","${p.name}","${p.monthlyPrice} DT","${p.annualPrice} DT","${p.trialDays}j","${p.features.length}","${statusLabels[p.status].label}","${subscriberCounts[p.id] || 0}"`))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `plans_${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export CSV téléchargé" });
  };

  return (
    <DashboardLayout role="admin" title="Gestion des Plans">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />Gestion des plans d'abonnement
            </h2>
            <p className="text-sm text-muted-foreground">{plans.length} plan(s) · {plans.filter(p => p.status === "active").length} actif(s)</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={handleExportCSV}>
              <Download className="h-3.5 w-3.5 mr-1" />Export CSV
            </Button>
            <Button onClick={openCreate} className="gradient-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-1" />Créer un plan
            </Button>
          </div>
        </div>

        <Tabs value={activeRole} onValueChange={v => setActiveRole(v as PlanRole)}>
          <TabsList className="bg-muted/50">
            {roles.map(r => {
              const Icon = roleIcons[r];
              const count = plans.filter(p => p.role === r).length;
              return (
                <TabsTrigger key={r} value={r} className="gap-1.5 text-xs">
                  <Icon className="h-3.5 w-3.5" />{planRoleLabels[r]}
                  <span className="text-[10px] bg-muted px-1.5 rounded-full">{count}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {roles.map(r => (
            <TabsContent key={r} value={r}>
              <div className="rounded-xl border bg-card shadow-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead>Prix mensuel</TableHead>
                      <TableHead>Prix annuel</TableHead>
                      <TableHead>Essai</TableHead>
                      <TableHead>Features</TableHead>
                      <TableHead>Abonnés</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rolePlans.length === 0 && (
                      <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">Aucun plan pour ce rôle</TableCell></TableRow>
                    )}
                    {rolePlans.map(p => (
                      <TableRow key={p.id} className="cursor-pointer hover:bg-muted/30" onClick={() => openEdit(p)}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {p.highlighted && <Star className="h-3.5 w-3.5 text-warning fill-warning" />}
                            <div>
                              <p className="font-semibold text-foreground">{p.name}</p>
                              <p className="text-[10px] text-muted-foreground">{p.description}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-foreground">{p.monthlyPrice} DT</TableCell>
                        <TableCell className="text-muted-foreground">{p.annualPrice} DT/mois</TableCell>
                        <TableCell className="text-sm">{p.trialDays}j</TableCell>
                        <TableCell><span className="text-xs text-muted-foreground">{p.features.length}</span></TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 text-xs text-foreground">
                            <Users className="h-3 w-3 text-primary" />{subscriberCounts[p.id] || 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusLabels[p.status].color}`}>
                            {statusLabels[p.status].label}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDuplicate(p)} title="Dupliquer"><Copy className="h-3.5 w-3.5" /></Button>
                            {p.status === "active" ? (
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMotifAction({ type: "archive", id: p.id })}><Archive className="h-3.5 w-3.5" /></Button>
                            ) : (
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-accent" onClick={() => setMotifAction({ type: "activate", id: p.id })}><Eye className="h-3.5 w-3.5" /></Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setMotifAction({ type: "delete", id: p.id })}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Comparison preview */}
              {rolePlans.filter(p => p.status === "active").length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Aperçu comparatif</h3>
                  <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(rolePlans.filter(p => p.status === "active").length, 4)}, 1fr)` }}>
                    {rolePlans.filter(p => p.status === "active").map(p => (
                      <div key={p.id} className={`rounded-xl border p-5 ${p.highlighted ? "border-primary bg-primary/5 shadow-primary-glow" : "bg-card"}`}>
                        <div className="flex items-center gap-2 mb-2">
                          {p.highlighted && <Star className="h-4 w-4 text-warning fill-warning" />}
                          <h4 className="font-bold text-foreground">{p.name}</h4>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{p.monthlyPrice} <span className="text-sm font-normal text-muted-foreground">DT/mois</span></p>
                        <p className="text-xs text-muted-foreground">ou {p.annualPrice} DT/mois (annuel)</p>
                        <p className="text-xs text-muted-foreground mt-1">{p.trialDays} jours d'essai</p>
                        {(subscriberCounts[p.id] || 0) > 0 && (
                          <p className="text-xs text-primary font-medium mt-1 flex items-center gap-1"><Users className="h-3 w-3" />{subscriberCounts[p.id]} abonné(s) actif(s)</p>
                        )}
                        <div className="mt-4 space-y-1.5">
                          {p.features.slice(0, 8).map(fId => {
                            const feat = featureCatalog.find(f => f.id === fId);
                            return feat ? (
                              <p key={fId} className="text-xs text-foreground flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />{feat.label}
                              </p>
                            ) : null;
                          })}
                          {p.features.length > 8 && <p className="text-[10px] text-muted-foreground">+{p.features.length - 8} autres</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editId ? "Modifier le plan" : "Créer un plan"}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Rôle *</Label>
                  <Select value={form.role || "doctor"} onValueChange={v => setForm(f => ({ ...f, role: v as PlanRole }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{roles.map(r => <SelectItem key={r} value={r}>{planRoleLabels[r]}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Nom du plan *</Label>
                  <Input className="mt-1" value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Pro" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea className="mt-1" rows={2} value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label className="text-xs">Prix mensuel (DT) *</Label><Input className="mt-1" type="number" min={0} value={form.monthlyPrice || ""} onChange={e => setForm(f => ({ ...f, monthlyPrice: Number(e.target.value) }))} /></div>
                <div><Label className="text-xs">Prix annuel/mois (DT)</Label><Input className="mt-1" type="number" min={0} value={form.annualPrice || ""} onChange={e => setForm(f => ({ ...f, annualPrice: Number(e.target.value) }))} /></div>
                <div><Label className="text-xs">Essai (jours)</Label><Input className="mt-1" type="number" min={0} value={form.trialDays || ""} onChange={e => setForm(f => ({ ...f, trialDays: Number(e.target.value) }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Statut</Label>
                  <Select value={form.status || "draft"} onValueChange={v => setForm(f => ({ ...f, status: v as PlanStatus }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="archived">Archivé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3 mt-5">
                  <Switch checked={form.highlighted ?? false} onCheckedChange={v => setForm(f => ({ ...f, highlighted: v }))} />
                  <Label className="text-xs">Plan mis en avant</Label>
                </div>
              </div>
              {(form.role === "clinic" || form.role === "hospital") && (
                <div><Label className="text-xs">Nombre max d'utilisateurs</Label><Input className="mt-1" type="number" min={1} value={form.maxUsers || ""} onChange={e => setForm(f => ({ ...f, maxUsers: Number(e.target.value) }))} /></div>
              )}

              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-foreground">Fonctionnalités ({(form.features || []).length})</p>
                  <Input placeholder="Filtrer..." value={featureSearch} onChange={e => setFeatureSearch(e.target.value)} className="w-40 h-7 text-xs" />
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {Object.entries(groupedFeatures).map(([cat, feats]) => (
                    <div key={cat}>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1">{cat}</p>
                      <div className="space-y-1">
                        {feats.map(f => (
                          <label key={f.id} className="flex items-center gap-2 py-0.5 cursor-pointer hover:bg-muted/30 rounded px-1">
                            <Checkbox checked={(form.features || []).includes(f.id)} onCheckedChange={() => toggleFeature(f.id)} />
                            <span className="text-xs text-foreground">{f.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Annuler</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={handleSave}>
              <Save className="h-3.5 w-3.5 mr-1" />{editId ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {motifAction && (
        <MotifDialog open={!!motifAction} onClose={() => setMotifAction(null)} onConfirm={handleMotifConfirm}
          title={motifAction.type === "save_create" ? "Créer le plan" : motifAction.type === "save_edit" ? "Modifier le plan" : motifAction.type === "archive" ? "Archiver le plan" : motifAction.type === "activate" ? "Activer le plan" : "Supprimer le plan"}
          description="Cette action sera enregistrée dans les audit logs." confirmLabel="Confirmer"
          destructive={motifAction.type === "delete"} />
      )}
    </DashboardLayout>
  );
};

export default AdminPlanManager;
