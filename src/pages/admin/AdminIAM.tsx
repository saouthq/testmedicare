/**
 * Admin IAM — Gestion des comptes admin + sous-rôles + matrice permissions
 * Connected to central admin store
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Plus, Shield, ShieldCheck, UserCog, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { appendLog } from "@/services/admin/adminAuditService";
import MotifDialog from "@/components/admin/MotifDialog";
import { useAdminIAM } from "@/stores/adminStore";
import type { AdminSubRole, AdminAccount } from "@/types/admin";

const SUB_ROLES: { key: AdminSubRole; label: string; color: string }[] = [
  { key: "superadmin", label: "Super Admin", color: "bg-destructive/10 text-destructive" },
  { key: "support", label: "Support", color: "bg-primary/10 text-primary" },
  { key: "verification", label: "Vérification", color: "bg-warning/10 text-warning" },
  { key: "finance", label: "Finance", color: "bg-accent/10 text-accent" },
  { key: "moderation", label: "Modération", color: "bg-primary/10 text-primary" },
  { key: "compliance", label: "Compliance", color: "bg-muted text-muted-foreground" },
];

const PERMISSIONS = [
  { action: "Voir dashboard", superadmin: true, support: true, verification: true, finance: true, moderation: true, compliance: true },
  { action: "Gérer utilisateurs", superadmin: true, support: true, verification: false, finance: false, moderation: false, compliance: true },
  { action: "Suspendre / réactiver", superadmin: true, support: false, verification: false, finance: false, moderation: true, compliance: true },
  { action: "Validations KYC", superadmin: true, support: false, verification: true, finance: false, moderation: false, compliance: true },
  { action: "Voir paiements", superadmin: true, support: false, verification: false, finance: true, moderation: false, compliance: true },
  { action: "Remboursements", superadmin: true, support: false, verification: false, finance: true, moderation: false, compliance: false },
  { action: "Promotions", superadmin: true, support: false, verification: false, finance: true, moderation: false, compliance: false },
  { action: "Modérer avis", superadmin: true, support: false, verification: false, finance: false, moderation: true, compliance: false },
  { action: "Audit logs", superadmin: true, support: false, verification: false, finance: false, moderation: false, compliance: true },
  { action: "Paramètres système", superadmin: true, support: false, verification: false, finance: false, moderation: false, compliance: false },
  { action: "Gérer admins", superadmin: true, support: false, verification: false, finance: false, moderation: false, compliance: false },
  { action: "Feature flags", superadmin: true, support: false, verification: false, finance: false, moderation: false, compliance: false },
  { action: "Campagnes", superadmin: true, support: true, verification: false, finance: false, moderation: false, compliance: false },
  { action: "Tickets support", superadmin: true, support: true, verification: false, finance: false, moderation: false, compliance: false },
  { action: "Pharmacies de garde", superadmin: true, support: true, verification: false, finance: false, moderation: false, compliance: false },
  { action: "Référentiels", superadmin: true, support: false, verification: true, finance: false, moderation: false, compliance: true },
];

type Tab = "accounts" | "permissions";

const AdminIAM = () => {
  const [tab, setTab] = useState<Tab>("accounts");
  const { accounts: admins, setAccounts: setAdmins } = useAdminIAM();
  const [editOpen, setEditOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<AdminAccount | null>(null);
  const [detailAdmin, setDetailAdmin] = useState<AdminAccount | null>(null);
  const [motifAction, setMotifAction] = useState<{ type: string; id: string } | null>(null);

  // Form
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<AdminSubRole>("support");

  const openCreate = () => {
    setEditAdmin(null);
    setFormName(""); setFormEmail(""); setFormRole("support");
    setEditOpen(true);
  };

  const openEdit = (a: AdminAccount) => {
    setEditAdmin(a);
    setFormName(a.name); setFormEmail(a.email); setFormRole(a.role);
    setEditOpen(true);
  };

  const handleSave = () => {
    if (!formName.trim() || !formEmail.trim()) {
      toast({ title: "Champs obligatoires", variant: "destructive" }); return;
    }
    setMotifAction({ type: editAdmin ? "edit" : "create", id: editAdmin?.id || "new" });
  };

  const handleMotifConfirm = (motif: string) => {
    if (!motifAction) return;
    if (motifAction.type === "create") {
      const newAdmin: AdminAccount = {
        id: `adm-${Date.now()}`, name: formName, email: formEmail, role: formRole,
        status: "active", lastLogin: "—", createdAt: new Date().toLocaleDateString("fr-TN", { month: "short", year: "numeric" }),
      };
      setAdmins(prev => [newAdmin, ...prev]);
      appendLog("admin_created", "admin_account", newAdmin.id, `Création admin "${formName}" (${formRole}) — ${motif}`);
      toast({ title: "Admin créé", description: formName });
    } else if (motifAction.type === "edit") {
      setAdmins(prev => prev.map(a => a.id === editAdmin?.id ? { ...a, name: formName, email: formEmail, role: formRole } : a));
      appendLog("admin_updated", "admin_account", editAdmin?.id || "", `Modification admin "${formName}" → ${formRole} — ${motif}`);
      toast({ title: "Admin modifié" });
    } else if (motifAction.type === "suspend") {
      setAdmins(prev => prev.map(a => a.id === motifAction.id ? { ...a, status: a.status === "active" ? "suspended" : "active" } : a));
      const target = admins.find(a => a.id === motifAction.id);
      appendLog("admin_status_changed", "admin_account", motifAction.id, `${target?.status === "active" ? "Suspension" : "Réactivation"} admin "${target?.name}" — ${motif}`);
      toast({ title: target?.status === "active" ? "Admin suspendu" : "Admin réactivé" });
    }
    setMotifAction(null);
    setEditOpen(false);
  };

  const roleInfo = (key: AdminSubRole) => SUB_ROLES.find(r => r.key === key)!;

  return (
    <DashboardLayout role="admin" title="Gestion Admin (IAM)">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 rounded-lg border bg-card p-1 w-fit">
          <button onClick={() => setTab("accounts")} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${tab === "accounts" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            <UserCog className="h-4 w-4" />Comptes admin
          </button>
          <button onClick={() => setTab("permissions")} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${tab === "permissions" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            <Shield className="h-4 w-4" />Matrice permissions
          </button>
        </div>

        {tab === "accounts" && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Comptes administrateurs</h2>
                <p className="text-sm text-muted-foreground">{admins.length} admin(s) · {admins.filter(a => a.status === "active").length} actif(s)</p>
              </div>
              <Button onClick={openCreate} className="gradient-primary text-primary-foreground shadow-primary-glow">
                <Plus className="h-4 w-4 mr-1" />Ajouter un admin
              </Button>
            </div>

            <div className="rounded-xl border bg-card shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead className="hidden md:table-cell">Statut</TableHead>
                    <TableHead className="hidden md:table-cell">Dernière connexion</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map(a => {
                    const ri = roleInfo(a.role);
                    return (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium text-foreground">{a.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{a.email}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${ri.color}`}>
                            <ShieldCheck className="h-3 w-3" />{ri.label}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className={`text-[11px] font-medium ${a.status === "active" ? "text-accent" : "text-destructive"}`}>
                            {a.status === "active" ? "Actif" : "Suspendu"}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{a.lastLogin}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailAdmin(a)}><Eye className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(a)}><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMotifAction({ type: "suspend", id: a.id })}>
                              <Trash2 className={`h-3.5 w-3.5 ${a.status === "active" ? "text-destructive" : "text-accent"}`} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {tab === "permissions" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Matrice de permissions RBAC</h2>
              <p className="text-sm text-muted-foreground">Qui peut faire quoi sur la plateforme.</p>
            </div>
            <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[180px]">Action</TableHead>
                    {SUB_ROLES.map(r => (
                      <TableHead key={r.key} className="text-center text-xs min-w-[90px]">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${r.color}`}>{r.label}</span>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PERMISSIONS.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm text-foreground font-medium">{p.action}</TableCell>
                      {SUB_ROLES.map(r => (
                        <TableCell key={r.key} className="text-center">
                          {p[r.key as keyof typeof p] ? (
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent/10"><ShieldCheck className="h-3 w-3 text-accent" /></span>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editAdmin ? "Modifier l'admin" : "Ajouter un admin"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label className="text-xs">Nom complet *</Label><Input className="mt-1" value={formName} onChange={e => setFormName(e.target.value)} /></div>
            <div><Label className="text-xs">Email *</Label><Input className="mt-1" type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} /></div>
            <div>
              <Label className="text-xs">Sous-rôle *</Label>
              <Select value={formRole} onValueChange={v => setFormRole(v as AdminSubRole)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SUB_ROLES.map(r => <SelectItem key={r.key} value={r.key}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Annuler</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={handleSave}>{editAdmin ? "Enregistrer" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail drawer */}
      <Sheet open={!!detailAdmin} onOpenChange={() => setDetailAdmin(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader><SheetTitle>Détail admin</SheetTitle></SheetHeader>
          {detailAdmin && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                  {detailAdmin.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{detailAdmin.name}</p>
                  <p className="text-xs text-muted-foreground">{detailAdmin.email}</p>
                </div>
              </div>
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rôle</span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${roleInfo(detailAdmin.role).color}`}>
                    <ShieldCheck className="h-3 w-3" />{roleInfo(detailAdmin.role).label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Statut</span>
                  <span className={`text-sm font-medium ${detailAdmin.status === "active" ? "text-accent" : "text-destructive"}`}>
                    {detailAdmin.status === "active" ? "Actif" : "Suspendu"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Dernière connexion</span>
                  <span className="text-sm text-foreground">{detailAdmin.lastLogin}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Créé</span>
                  <span className="text-sm text-foreground">{detailAdmin.createdAt}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Permissions</p>
                <div className="space-y-1.5">
                  {PERMISSIONS.filter(p => p[detailAdmin.role as keyof typeof p]).map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <ShieldCheck className="h-3.5 w-3.5 text-accent shrink-0" />
                      <span className="text-foreground">{p.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Motif dialog */}
      <MotifDialog
        open={!!motifAction}
        onClose={() => setMotifAction(null)}
        onConfirm={handleMotifConfirm}
        title={motifAction?.type === "suspend" ? "Suspendre / Réactiver l'admin" : motifAction?.type === "create" ? "Créer un admin" : "Modifier un admin"}
        description="Cette action sera journalisée dans les audit logs."
        confirmLabel="Confirmer"
        destructive={motifAction?.type === "suspend"}
      />
    </DashboardLayout>
  );
};

export default AdminIAM;
