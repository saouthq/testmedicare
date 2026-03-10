/**
 * AdminOverrides — Per-account feature overrides management
 * Force ON/OFF a feature for a specific user with optional expiration.
 * TODO BACKEND: Replace with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import {
  Plus, Trash2, UserCog, ToggleLeft, ToggleRight, Clock, Search, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import MotifDialog from "@/components/admin/MotifDialog";
import {
  useAccountOverrides, createOverride, removeOverride, isOverrideActive,
  type AccountOverride,
} from "@/stores/entitlementStore";
import { featureCatalog } from "@/stores/featureMatrixStore";
import { mockAdminUsers } from "@/data/mockData";

const AdminOverrides = () => {
  const [overrides] = useAccountOverrides();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [motifAction, setMotifAction] = useState<{ type: string; id: string } | null>(null);

  // Create form
  const [formUserId, setFormUserId] = useState("");
  const [formFeatureId, setFormFeatureId] = useState("");
  const [formForced, setFormForced] = useState<"on" | "off">("on");
  const [formReason, setFormReason] = useState("");
  const [formExpires, setFormExpires] = useState("");

  const filtered = useMemo(() => {
    if (!search) return overrides;
    const q = search.toLowerCase();
    return overrides.filter(o => o.userName.toLowerCase().includes(q) || o.featureLabel.toLowerCase().includes(q));
  }, [overrides, search]);

  const activeCount = overrides.filter(o => isOverrideActive(o)).length;
  const expiredCount = overrides.length - activeCount;

  const handleCreate = () => {
    if (!formUserId || !formFeatureId || !formReason) {
      toast({ title: "Tous les champs sont requis", variant: "destructive" }); return;
    }
    const user = mockAdminUsers.find(u => String(u.id) === formUserId);
    const feat = featureCatalog.find(f => f.id === formFeatureId);
    if (!user || !feat) return;

    createOverride({
      userId: String(user.id),
      userName: user.name,
      userRole: user.role,
      featureId: feat.id,
      featureLabel: feat.label,
      forced: formForced,
      reason: formReason,
      expiresAt: formExpires || undefined,
      createdBy: "Admin",
    }, formReason);

    toast({ title: "Override créé", description: `${feat.label} → ${formForced.toUpperCase()} pour ${user.name}` });
    setCreateOpen(false);
    setFormUserId(""); setFormFeatureId(""); setFormForced("on"); setFormReason(""); setFormExpires("");
  };

  const handleMotifConfirm = (motif: string) => {
    if (!motifAction) return;
    removeOverride(motifAction.id, motif);
    toast({ title: "Override supprimé" });
    setMotifAction(null);
  };

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString("fr-TN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <DashboardLayout role="admin" title="Overrides par compte">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <UserCog className="h-5 w-5 text-primary" />Overrides par compte
            </h2>
            <p className="text-sm text-muted-foreground">Forcer ON/OFF une feature pour un utilisateur précis.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">{activeCount} actifs</span>
            {expiredCount > 0 && <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">{expiredCount} expirés</span>}
            <Button onClick={() => setCreateOpen(true)} className="gradient-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-1" />Nouvel override
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Rechercher utilisateur ou feature..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9 text-sm" />
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Feature</TableHead>
                <TableHead>Override</TableHead>
                <TableHead>Raison</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">Aucun override</TableCell></TableRow>
              )}
              {filtered.map(o => {
                const active = isOverrideActive(o);
                return (
                  <TableRow key={o.id} className={!active ? "opacity-50" : ""}>
                    <TableCell className="font-medium text-foreground">{o.userName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground capitalize">{o.userRole}</TableCell>
                    <TableCell className="text-sm">{o.featureLabel}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                        o.forced === "on" ? "bg-accent/10 text-accent border-accent/20" : "bg-destructive/10 text-destructive border-destructive/20"
                      }`}>
                        {o.forced === "on" ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />}
                        {o.forced === "on" ? "Forcé ON" : "Forcé OFF"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{o.reason}</TableCell>
                    <TableCell className="text-xs">
                      {o.expiresAt ? (
                        <span className={`flex items-center gap-1 ${active ? "text-foreground" : "text-destructive"}`}>
                          <Clock className="h-3 w-3" />{formatDate(o.expiresAt)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Permanent</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`text-[11px] font-medium ${active ? "text-accent" : "text-muted-foreground"}`}>
                        {active ? "Actif" : "Expiré"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setMotifAction({ type: "delete", id: o.id })}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Info banner */}
        <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">Attention</p>
            <p className="text-xs text-muted-foreground mt-1">Les overrides ont la priorité la plus haute. Un override "Forcé ON" donne l'accès même si le plan ne l'inclut pas. Un "Forcé OFF" bloque l'accès même pour un plan supérieur. Toutes les actions sont tracées dans l'audit log.</p>
          </div>
        </div>
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Créer un override</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs">Utilisateur *</Label>
              <Select value={formUserId} onValueChange={setFormUserId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>
                  {mockAdminUsers.map(u => (
                    <SelectItem key={u.id} value={String(u.id)}>{u.name} ({u.role})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Feature *</Label>
              <Select value={formFeatureId} onValueChange={setFormFeatureId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>
                  {featureCatalog.map(f => (
                    <SelectItem key={f.id} value={f.id}>{f.label} ({f.category})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Action *</Label>
              <Select value={formForced} onValueChange={v => setFormForced(v as "on" | "off")}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="on">Forcer ON (activer)</SelectItem>
                  <SelectItem value="off">Forcer OFF (bloquer)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Date d'expiration (optionnel)</Label>
              <Input className="mt-1" type="date" value={formExpires} onChange={e => setFormExpires(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Raison / Motif *</Label>
              <Input className="mt-1" value={formReason} onChange={e => setFormReason(e.target.value)} placeholder="Raison obligatoire..." />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={handleCreate}>Créer l'override</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete motif */}
      {motifAction && (
        <MotifDialog
          open={!!motifAction}
          onClose={() => setMotifAction(null)}
          onConfirm={handleMotifConfirm}
          title="Supprimer l'override"
          description="Cette action sera enregistrée dans l'audit log."
          confirmLabel="Supprimer"
          destructive
        />
      )}
    </DashboardLayout>
  );
};

export default AdminOverrides;
