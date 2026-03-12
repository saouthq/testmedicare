/**
 * Admin Promotions & Offres — Full CRUD with store, delete, stats, CSV, detail drawer
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import { Plus, Copy, ToggleLeft, ToggleRight, Pencil, Gift, Tag, Percent, Clock, Search, Filter, Trash2, Download, Eye, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import MotifDialog from "@/components/admin/MotifDialog";
import type { Promotion, PromotionType, PromotionTarget } from "@/types/promotion";
import { appendLog } from "@/services/admin/adminAuditService";
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  togglePromotion,
  duplicatePromotion,
} from "@/services/admin/adminPromotionsService";

const typeLabels: Record<PromotionType, { label: string; icon: any }> = {
  free_months: { label: "Mois gratuits", icon: Gift },
  percent_discount: { label: "% Réduction", icon: Percent },
  fixed_amount: { label: "Montant fixe", icon: Tag },
  free_trial: { label: "Essai gratuit", icon: Clock },
};

const targetLabels: Record<PromotionTarget, string> = { basic: "Basic uniquement", pro: "Pro uniquement", all: "Tous les plans" };
const statusColors: Record<string, string> = { active: "bg-accent/10 text-accent border-accent/20", inactive: "bg-muted text-muted-foreground border-border", expired: "bg-destructive/10 text-destructive border-destructive/20" };

type FilterStatus = "all" | "active" | "inactive";
type FilterType = "all" | PromotionType;

const emptyForm = (): Partial<Promotion> => ({
  name: "", type: "free_months", value: 6, startDate: "", endDate: "",
  target: "all", newDoctorsOnly: true, requireSignupDuringPeriod: true,
  autoApply: true, requireCode: false, promoCode: "", notes: "",
});

const AdminPromotions = () => {
  const [promos, setPromos] = useState<Promotion[]>(getPromotions());
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Promotion>>(emptyForm());
  const [motifAction, setMotifAction] = useState<{ type: string; id: string } | null>(null);
  const [detailPromo, setDetailPromo] = useState<Promotion | null>(null);

  const reload = () => setPromos(getPromotions());

  const filtered = useMemo(() => {
    let list = promos;
    if (filterStatus !== "all") list = list.filter(p => p.status === filterStatus);
    if (filterType !== "all") list = list.filter(p => p.type === filterType);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || (p.promoCode || "").toLowerCase().includes(q));
    }
    return list;
  }, [promos, filterStatus, filterType, search]);

  // Stats
  const stats = useMemo(() => ({
    total: promos.length,
    active: promos.filter(p => p.status === "active").length,
    totalUsage: promos.reduce((s, p) => s + p.usageCount, 0),
    expiringSoon: promos.filter(p => {
      if (p.status !== "active" || !p.endDate) return false;
      const diff = (new Date(p.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return diff > 0 && diff < 30;
    }).length,
  }), [promos]);

  const openCreate = () => { setEditId(null); setForm(emptyForm()); setEditOpen(true); };
  const openEdit = (p: Promotion) => { setEditId(p.id); setForm({ ...p }); setEditOpen(true); };

  const handleSave = () => {
    if (!form.name || !form.startDate || !form.endDate) {
      toast({ title: "Champs obligatoires manquants", variant: "destructive" }); return;
    }
    setMotifAction({ type: editId ? "save_edit" : "save_create", id: editId || "new" });
  };

  const handleMotifConfirm = (motif: string) => {
    if (!motifAction) return;
    const { type, id } = motifAction;

    if (type === "save_create") {
      createPromotion(form as any, motif);
      toast({ title: "Promotion créée", description: form.name });
    } else if (type === "save_edit") {
      updatePromotion(id, form, motif);
      toast({ title: "Promotion modifiée", description: form.name });
    } else if (type === "toggle") {
      togglePromotion(id, motif);
      const p = promos.find(x => x.id === id);
      toast({ title: p?.status === "active" ? "Promotion désactivée" : "Promotion activée" });
    } else if (type === "delete") {
      // Delete from localStorage
      const list = getPromotions().filter(p => p.id !== id);
      localStorage.setItem("medicare_admin_promotions", JSON.stringify(list));
      appendLog("delete_promotion", "promotion", id, `Promotion supprimée — ${motif}`);
      toast({ title: "Promotion supprimée" });
    }

    setMotifAction(null);
    setEditOpen(false);
    reload();
  };

  const handleDuplicate = (id: string) => {
    duplicatePromotion(id);
    toast({ title: "Promotion dupliquée" });
    reload();
  };

  const handleToggle = (id: string) => setMotifAction({ type: "toggle", id });
  const handleDelete = (id: string) => setMotifAction({ type: "delete", id });

  const formatDate = (d: string) => !d ? "—" : new Date(d).toLocaleDateString("fr-TN", { day: "numeric", month: "short", year: "numeric" });

  const valueLabel = (p: Promotion) => {
    if (p.type === "free_months" || p.type === "free_trial") return `${p.value} mois`;
    if (p.type === "percent_discount") return `${p.value}%`;
    return `${p.value} DT`;
  };

  const handleExportCSV = () => {
    const csv = ["Nom,Type,Valeur,Début,Fin,Cible,Statut,Code,Utilisations"]
      .concat(filtered.map(p => `"${p.name}","${typeLabels[p.type].label}","${valueLabel(p)}","${p.startDate}","${p.endDate}","${targetLabels[p.target]}","${p.status}","${p.promoCode || "—"}","${p.usageCount}"`))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `promotions_${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export CSV téléchargé" });
  };

  return (
    <DashboardLayout role="admin" title="Promotions & Offres">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">Gestion des promotions</h2>
            <p className="text-sm text-muted-foreground">{promos.length} promotion(s) au total · {stats.active} active(s)</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={handleExportCSV}>
              <Download className="h-3.5 w-3.5 mr-1" />Export CSV
            </Button>
            <Button onClick={openCreate} className="gradient-primary text-primary-foreground shadow-primary-glow">
              <Plus className="h-4 w-4 mr-1" />Créer une promotion
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-xl border bg-card p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-[11px] text-muted-foreground">Total</p>
          </div>
          <div className="rounded-xl border bg-accent/5 p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-accent">{stats.active}</p>
            <p className="text-[11px] text-muted-foreground">Actives</p>
          </div>
          <div className="rounded-xl border bg-primary/5 p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-primary">{stats.totalUsage}</p>
            <p className="text-[11px] text-muted-foreground">Utilisations totales</p>
          </div>
          <div className="rounded-xl border bg-warning/5 p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-warning">{stats.expiringSoon}</p>
            <p className="text-[11px] text-muted-foreground">Expirent bientôt</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Rechercher nom ou code..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9 text-sm" />
          </div>
          <Select value={filterStatus} onValueChange={v => setFilterStatus(v as FilterStatus)}>
            <SelectTrigger className="w-36 h-9 text-sm"><Filter className="h-3.5 w-3.5 mr-1" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              <SelectItem value="active">Actives</SelectItem>
              <SelectItem value="inactive">Inactives</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={v => setFilterType(v as FilterType)}>
            <SelectTrigger className="w-40 h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous types</SelectItem>
              <SelectItem value="free_months">Mois gratuits</SelectItem>
              <SelectItem value="percent_discount">% Réduction</SelectItem>
              <SelectItem value="fixed_amount">Montant fixe</SelectItem>
              <SelectItem value="free_trial">Essai gratuit</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Valeur</TableHead>
                <TableHead className="hidden md:table-cell">Période</TableHead>
                <TableHead className="hidden md:table-cell">Cible</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="hidden sm:table-cell">Utilisations</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">Aucune promotion trouvée</TableCell></TableRow>
              )}
              {filtered.map(p => {
                const TypeIcon = typeLabels[p.type].icon;
                return (
                  <TableRow key={p.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setDetailPromo(p)}>
                    <TableCell className="font-medium text-foreground">{p.name}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <TypeIcon className="h-3.5 w-3.5" />{typeLabels[p.type].label}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">{valueLabel(p)}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{formatDate(p.startDate)} → {formatDate(p.endDate)}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs">{targetLabels[p.target]}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusColors[p.status]}`}>
                        {p.status === "active" ? "Active" : p.status === "inactive" ? "Inactive" : "Expirée"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{p.usageCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)} title="Modifier"><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleToggle(p.id)} title={p.status === "active" ? "Désactiver" : "Activer"}>
                          {p.status === "active" ? <ToggleRight className="h-3.5 w-3.5 text-accent" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDuplicate(p.id)} title="Dupliquer"><Copy className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(p.id)} title="Supprimer"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Detail Drawer */}
      <Sheet open={!!detailPromo} onOpenChange={() => setDetailPromo(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Détail de la promotion</SheetTitle>
            <SheetDescription className="sr-only">Informations complètes</SheetDescription>
          </SheetHeader>
          {detailPromo && (
            <ScrollArea className="mt-4 h-[calc(100vh-120px)]">
              <div className="space-y-5 pr-2">
                <div className="rounded-lg border p-4 space-y-3">
                  {[
                    ["Nom", detailPromo.name],
                    ["Type", typeLabels[detailPromo.type].label],
                    ["Valeur", valueLabel(detailPromo)],
                    ["Cible", targetLabels[detailPromo.target]],
                    ["Début", formatDate(detailPromo.startDate)],
                    ["Fin", formatDate(detailPromo.endDate)],
                    ["Code promo", detailPromo.promoCode || "—"],
                    ["Utilisations", String(detailPromo.usageCount)],
                    ["Créée le", formatDate(detailPromo.createdAt)],
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium text-foreground">{val}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Statut</span>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusColors[detailPromo.status]}`}>
                      {detailPromo.status === "active" ? "Active" : detailPromo.status === "inactive" ? "Inactive" : "Expirée"}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Conditions</p>
                  <div className="space-y-2 text-xs text-foreground">
                    <p>• Nouveaux médecins : {detailPromo.newDoctorsOnly ? "Oui" : "Non"}</p>
                    <p>• Inscription pendant la période : {detailPromo.requireSignupDuringPeriod ? "Oui" : "Non"}</p>
                    <p>• Application auto : {detailPromo.autoApply ? "Oui" : "Non"}</p>
                    <p>• Code requis : {detailPromo.requireCode ? "Oui" : "Non"}</p>
                  </div>
                </div>

                {detailPromo.notes && (
                  <div className="rounded-lg border p-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Notes admin</p>
                    <p className="text-sm text-foreground">{detailPromo.notes}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => { setDetailPromo(null); openEdit(detailPromo); }}>
                    <Pencil className="h-3.5 w-3.5 mr-1" />Modifier
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-destructive" onClick={() => { setDetailPromo(null); handleDelete(detailPromo.id); }}>
                    <Trash2 className="h-3.5 w-3.5 mr-1" />Supprimer
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>

      {/* CREATE / EDIT MODAL */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Modifier la promotion" : "Créer une promotion"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs">Nom de l'offre *</Label>
              <Input className="mt-1" placeholder="Ex: 6 mois gratuits 2026" value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Type *</Label>
                <Select value={form.type || "free_months"} onValueChange={v => setForm(f => ({ ...f, type: v as PromotionType }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free_months">Mois gratuits</SelectItem>
                    <SelectItem value="percent_discount">% Réduction</SelectItem>
                    <SelectItem value="fixed_amount">Montant fixe (DT)</SelectItem>
                    <SelectItem value="free_trial">Essai gratuit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Valeur *</Label>
                <Input className="mt-1" type="number" min={1} value={form.value || ""} onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))} placeholder={form.type === "percent_discount" ? "30" : "6"} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Date début *</Label><Input className="mt-1" type="date" value={form.startDate || ""} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
              <div><Label className="text-xs">Date fin *</Label><Input className="mt-1" type="date" value={form.endDate || ""} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
            </div>
            <div>
              <Label className="text-xs">Cible *</Label>
              <Select value={form.target || "all"} onValueChange={v => setForm(f => ({ ...f, target: v as PromotionTarget }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les plans</SelectItem>
                  <SelectItem value="basic">Basic uniquement</SelectItem>
                  <SelectItem value="pro">Pro uniquement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border p-3 space-y-3">
              <p className="text-xs font-semibold text-foreground">Conditions d'éligibilité</p>
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Nouveaux médecins uniquement</Label>
                <Switch checked={form.newDoctorsOnly ?? true} onCheckedChange={v => setForm(f => ({ ...f, newDoctorsOnly: v }))} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Inscription pendant la période</Label>
                <Switch checked={form.requireSignupDuringPeriod ?? true} onCheckedChange={v => setForm(f => ({ ...f, requireSignupDuringPeriod: v }))} />
              </div>
            </div>

            <div className="rounded-lg border p-3 space-y-3">
              <p className="text-xs font-semibold text-foreground">Application</p>
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">S'applique automatiquement</Label>
                <Switch checked={form.autoApply ?? true} onCheckedChange={v => setForm(f => ({ ...f, autoApply: v }))} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Code promo requis</Label>
                <Switch checked={form.requireCode ?? false} onCheckedChange={v => setForm(f => ({ ...f, requireCode: v }))} />
              </div>
              {form.requireCode && (
                <div><Label className="text-xs">Code promo</Label><Input className="mt-1 font-mono uppercase" placeholder="EX: PRO30" value={form.promoCode || ""} onChange={e => setForm(f => ({ ...f, promoCode: e.target.value.toUpperCase() }))} /></div>
              )}
            </div>

            <div>
              <Label className="text-xs">Notes admin</Label>
              <Textarea className="mt-1" rows={2} value={form.notes || ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes internes..." />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Annuler</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={handleSave}>
              {editId ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Motif dialog */}
      <MotifDialog
        open={!!motifAction}
        onClose={() => setMotifAction(null)}
        onConfirm={handleMotifConfirm}
        title={
          motifAction?.type === "toggle" ? "Activer/Désactiver la promotion"
            : motifAction?.type === "delete" ? "Supprimer la promotion"
            : motifAction?.type === "save_create" ? "Confirmer la création"
            : "Confirmer la modification"
        }
        description="Cette action sera enregistrée dans les audit logs."
        confirmLabel="Confirmer"
        destructive={motifAction?.type === "delete"}
      />
    </DashboardLayout>
  );
};

export default AdminPromotions;
