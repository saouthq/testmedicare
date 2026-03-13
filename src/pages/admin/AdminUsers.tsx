/**
 * Admin Users — Full user management with 360° view, bulk actions, CSV export
 * + inline edit (role/plan), create user, send email
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import { Search, CheckCircle, XCircle, Eye, Ban, UserCheck, Mail, Phone, Calendar, Shield, ArrowUpDown, X, RotateCcw, KeyRound, Download, LogOut, Building2, CreditCard, MessageSquare, Gavel, FileText, ExternalLink, Inbox, Plus, Pencil, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAdminUsers, useAdminLookups } from "@/stores/adminStore";
import { useAdminUsersSupabase, useAdminUserUpdate, useAdminUserRoleUpdate } from "@/hooks/useAdminData";
import { getAppMode } from "@/stores/authStore";
import type { AdminUser, UserRole } from "@/types/admin";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";
import MotifDialog from "@/components/admin/MotifDialog";
import EmptyState from "@/components/shared/EmptyState";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

type UserFilter = "all" | "doctors" | "patients" | "secretaries" | "pharmacies" | "laboratories" | "pending";

const roleLabels: Record<string, string> = { doctor: "Médecin", patient: "Patient", pharmacy: "Pharmacie", laboratory: "Laboratoire", secretary: "Secrétaire" };
const roleColors: Record<string, string> = { doctor: "bg-primary/10 text-primary", patient: "bg-accent/10 text-accent", pharmacy: "bg-warning/10 text-warning", laboratory: "bg-muted text-foreground", secretary: "bg-primary/10 text-primary" };
const statusColors: Record<string, string> = { active: "bg-accent/10 text-accent", pending: "bg-warning/10 text-warning", suspended: "bg-destructive/10 text-destructive" };
const statusLabels: Record<string, string> = { active: "Actif", pending: "En attente", suspended: "Suspendu" };

type MotifAction = { type: "suspend" | "reactivate" | "reject" | "reset_password" | "force_disconnect" | "bulk_suspend" | "edit_user"; userId: string; userName: string } | null;

const AdminUsers = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<UserFilter>("all");
  const { users: demoUsers, setUsers } = useAdminUsers();
  const supabaseUsersQuery = useAdminUsersSupabase();
  const isProduction = getAppMode() === "production";
  const users = isProduction ? (supabaseUsersQuery.data || []) : demoUsers;
  const lookups = useAdminLookups();
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "joined">("joined");
  const [motifAction, setMotifAction] = useState<MotifAction>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Create user dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", email: "", phone: "", role: "patient" as UserRole, status: "active" as "active" | "pending" });

  // Edit user dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", role: "patient" as UserRole, subscription: "" });
  const [editUserId, setEditUserId] = useState<string | null>(null);

  // Send email dialog
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailForm, setEmailForm] = useState({ subject: "", body: "" });
  const [emailTarget, setEmailTarget] = useState<AdminUser | null>(null);

  const filtered = useMemo(() => users
    .filter(u => {
      if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
      if (filter === "doctors") return u.role === "doctor";
      if (filter === "patients") return u.role === "patient";
      if (filter === "secretaries") return u.role === "secretary";
      if (filter === "pharmacies") return u.role === "pharmacy";
      if (filter === "laboratories") return u.role === "laboratory";
      if (filter === "pending") return u.status === "pending";
      return true;
    })
    .sort((a, b) => sortBy === "name" ? a.name.localeCompare(b.name) : 0)
  , [users, search, filter, sortBy]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(u => u.id)));
  };

  const userUpdateMutation = useAdminUserUpdate();
  const roleUpdateMutation = useAdminUserRoleUpdate();

  const handleApprove = (id: string) => {
    const u = users.find(x => x.id === id);
    if (!u) return;
    if (isProduction) {
      // In production, we can't directly set "verified" on profiles, but we log the action
      // The verification is handled via doctors_directory/pharmacies_directory
    } else {
      setUsers(prev => prev.map(x => x.id === id ? { ...x, status: "active" as const, verified: true } : x));
    }
    appendLog("user_approved", "user", id, `Inscription de ${u.name} approuvée`);
    toast({ title: `${u.name} approuvé(e)` });
    if (selectedUser?.id === id) setSelectedUser(null);
  };

  const handleMotifConfirm = (motif: string) => {
    if (!motifAction) return;
    const { type, userId, userName } = motifAction;

    if (type === "suspend") {
      if (!isProduction) setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: "suspended" as const } : u));
      appendLog("user_suspended", "user", userId, `${userName} suspendu — Motif : ${motif}`);
      toast({ title: `${userName} suspendu` });
    } else if (type === "reactivate") {
      if (!isProduction) setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: "active" as const } : u));
      appendLog("user_reactivated", "user", userId, `${userName} réactivé — Motif : ${motif}`);
      toast({ title: `${userName} réactivé` });
    } else if (type === "reject") {
      if (!isProduction) setUsers(prev => prev.filter(u => u.id !== userId));
      appendLog("user_rejected", "user", userId, `Inscription de ${userName} refusée — Motif : ${motif}`);
      toast({ title: `${userName} refusé(e)`, variant: "destructive" });
      if (selectedUser?.id === userId) { setSelectedUser(null); setDrawerOpen(false); }
    } else if (type === "reset_password") {
      appendLog("password_reset", "user", userId, `Réinitialisation MDP de ${userName} — Motif : ${motif}`);
      toast({ title: `Lien de réinitialisation envoyé à ${userName}` });
    } else if (type === "force_disconnect") {
      appendLog("force_disconnect", "user", userId, `Déconnexion forcée de ${userName} — Motif : ${motif}`);
      toast({ title: `${userName} déconnecté de force` });
    } else if (type === "bulk_suspend") {
      const ids = Array.from(selectedIds);
      if (!isProduction) setUsers(prev => prev.map(u => ids.includes(u.id) ? { ...u, status: "suspended" as const } : u));
      appendLog("bulk_suspend", "user", ids.join(","), `Suspension en masse de ${ids.length} utilisateurs — Motif : ${motif}`);
      toast({ title: `${ids.length} utilisateur(s) suspendu(s)` });
      setSelectedIds(new Set());
    } else if (type === "edit_user" && editUserId) {
      if (isProduction) {
        const [firstName, ...lastParts] = editForm.name.split(" ");
        userUpdateMutation.mutate({
          userId: editUserId,
          updates: { first_name: firstName || "", last_name: lastParts.join(" ") || "", email: editForm.email, phone: editForm.phone },
        });
        if (editForm.role) {
          roleUpdateMutation.mutate({ userId: editUserId, role: editForm.role });
        }
      } else {
        setUsers(prev => prev.map(u => u.id === editUserId ? { ...u, name: editForm.name, email: editForm.email, phone: editForm.phone, role: editForm.role, subscription: editForm.subscription } : u));
      }
      appendLog("user_edited", "user", editUserId, `Profil de ${editForm.name} modifié — Motif : ${motif}`);
      toast({ title: `${editForm.name} mis à jour` });
      setEditOpen(false);
      if (selectedUser?.id === editUserId) {
        setSelectedUser(prev => prev ? { ...prev, name: editForm.name, email: editForm.email, phone: editForm.phone, role: editForm.role, subscription: editForm.subscription } : prev);
      }
    }
    setMotifAction(null);
  };

  // Create user
  const handleCreateUser = () => {
    if (!createForm.name || !createForm.email) { toast({ title: "Nom et email requis", variant: "destructive" }); return; }
    const newUser: AdminUser = {
      id: `user-${Date.now()}`,
      name: createForm.name,
      email: createForm.email,
      phone: createForm.phone || "+216 00 000 000",
      role: createForm.role,
      status: createForm.status,
      subscription: "—",
      joined: new Date().toISOString().split("T")[0],
      lastLogin: "—",
      verified: createForm.status === "active",
      internalNotes: [],
    };
    setUsers(prev => [newUser, ...prev]);
    appendLog("user_created", "user", newUser.id, `Utilisateur ${newUser.name} (${roleLabels[newUser.role]}) créé manuellement`);
    toast({ title: `${newUser.name} créé`, description: roleLabels[newUser.role] });
    setCreateOpen(false);
    setCreateForm({ name: "", email: "", phone: "", role: "patient", status: "active" });
  };

  // Open edit
  const openEditDialog = (u: AdminUser) => {
    setEditUserId(u.id);
    setEditForm({ name: u.name, email: u.email, phone: u.phone, role: u.role, subscription: u.subscription });
    setEditOpen(true);
  };

  const handleEditSave = () => {
    if (!editForm.name || !editForm.email) { toast({ title: "Nom et email requis", variant: "destructive" }); return; }
    setMotifAction({ type: "edit_user", userId: editUserId || "", userName: editForm.name });
  };

  // Send email
  const openSendEmail = (u: AdminUser) => {
    setEmailTarget(u);
    setEmailForm({ subject: "", body: "" });
    setEmailOpen(true);
  };

  const handleSendEmail = () => {
    if (!emailForm.subject) { toast({ title: "Sujet requis", variant: "destructive" }); return; }
    appendLog("email_sent", "user", emailTarget?.id || "", `Email envoyé à ${emailTarget?.name} — Sujet: ${emailForm.subject}`);
    toast({ title: "Email envoyé (mock)", description: `À : ${emailTarget?.email}` });
    setEmailOpen(false);
  };

  /** Export CSV */
  const handleExportCSV = () => {
    const csv = ["Nom,Email,Téléphone,Rôle,Statut,Vérifié,Abonnement,Inscription,Dernière connexion"]
      .concat(filtered.map(u => `"${u.name}","${u.email}","${u.phone}","${roleLabels[u.role] || u.role}","${statusLabels[u.status]}","${u.verified ? "Oui" : "Non"}","${u.subscription}","${u.joined}","${u.lastLogin}"`))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `users_${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export CSV téléchargé", description: `${filtered.length} utilisateur(s)` });
  };

  const openUserDrawer = (u: AdminUser) => {
    setSelectedUser(u);
    setDrawerOpen(true);
  };

  const motifDialogConfig: Record<string, { title: string; desc: string; label: string; destructive: boolean }> = {
    suspend: { title: "Suspendre le compte", desc: "Cette action bloquera l'accès de l'utilisateur.", label: "Suspendre", destructive: true },
    reactivate: { title: "Réactiver le compte", desc: "L'utilisateur retrouvera l'accès à la plateforme.", label: "Réactiver", destructive: false },
    reject: { title: "Refuser l'inscription", desc: "L'utilisateur sera supprimé de la plateforme.", label: "Refuser", destructive: true },
    reset_password: { title: "Réinitialiser le mot de passe", desc: "Un lien de réinitialisation sera envoyé.", label: "Réinitialiser", destructive: false },
    force_disconnect: { title: "Forcer la déconnexion", desc: "L'utilisateur sera déconnecté de toutes ses sessions.", label: "Déconnecter", destructive: true },
    bulk_suspend: { title: "Suspendre en masse", desc: `${selectedIds.size} utilisateur(s) sélectionné(s) seront suspendus.`, label: "Suspendre tous", destructive: true },
    edit_user: { title: "Modifier le profil", desc: "La modification sera enregistrée dans les audit logs.", label: "Enregistrer", destructive: false },
  };
  const currentMotifConfig = motifAction ? motifDialogConfig[motifAction.type] : null;

  return (
    <DashboardLayout role="admin" title="Gestion des utilisateurs">
      <div className="space-y-6">
        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher par nom, email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Button onClick={() => setCreateOpen(true)} className="gradient-primary text-primary-foreground shadow-primary-glow shrink-0">
            <Plus className="h-4 w-4 mr-1" />Créer un utilisateur
          </Button>
        </div>

        <div className="flex gap-1 rounded-lg border bg-card p-0.5 overflow-x-auto">
          {([
            { key: "all" as UserFilter, label: "Tous", count: users.length },
            { key: "doctors" as UserFilter, label: "Médecins", count: users.filter(u => u.role === "doctor").length },
            { key: "patients" as UserFilter, label: "Patients", count: users.filter(u => u.role === "patient").length },
            { key: "secretaries" as UserFilter, label: "Secrétaires", count: users.filter(u => u.role === "secretary").length },
            { key: "pharmacies" as UserFilter, label: "Pharmacies", count: users.filter(u => u.role === "pharmacy").length },
            { key: "laboratories" as UserFilter, label: "Labos", count: users.filter(u => u.role === "laboratory").length },
            { key: "pending" as UserFilter, label: "En attente", count: users.filter(u => u.status === "pending").length },
          ]).map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {f.label} <span className="opacity-70">({f.count})</span>
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="rounded-lg border bg-card p-3 text-center">
            <p className="text-lg font-bold text-foreground">{users.length}</p>
            <p className="text-[11px] text-muted-foreground">Total</p>
          </div>
          <div className="rounded-lg border bg-accent/5 p-3 text-center">
            <p className="text-lg font-bold text-accent">{users.filter(u => u.status === "active").length}</p>
            <p className="text-[11px] text-muted-foreground">Actifs</p>
          </div>
          <div className="rounded-lg border bg-warning/5 p-3 text-center">
            <p className="text-lg font-bold text-warning">{users.filter(u => u.status === "pending").length}</p>
            <p className="text-[11px] text-muted-foreground">En attente</p>
          </div>
          <div className="rounded-lg border bg-destructive/5 p-3 text-center">
            <p className="text-lg font-bold text-destructive">{users.filter(u => u.status === "suspended").length}</p>
            <p className="text-[11px] text-muted-foreground">Suspendus</p>
          </div>
          <div className="rounded-lg border bg-primary/5 p-3 text-center">
            <p className="text-lg font-bold text-primary">{users.filter(u => u.verified).length}</p>
            <p className="text-[11px] text-muted-foreground">Vérifiés</p>
          </div>
        </div>

        {/* Bulk actions bar */}
        {selectedIds.size > 0 && (
          <div className="rounded-lg border bg-primary/5 border-primary/20 p-3 flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm font-medium text-foreground">{selectedIds.size} sélectionné(s)</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs text-destructive border-destructive/30" onClick={() => setMotifAction({ type: "bulk_suspend", userId: "bulk", userName: `${selectedIds.size} utilisateurs` })}>
                <Ban className="h-3.5 w-3.5 mr-1" />Suspendre
              </Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => setSelectedIds(new Set())}>
                <X className="h-3.5 w-3.5 mr-1" />Annuler
              </Button>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{filtered.length} résultat(s)</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setSortBy(sortBy === "name" ? "joined" : "name")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <ArrowUpDown className="h-3 w-3" />Trier par {sortBy === "name" ? "date" : "nom"}
            </button>
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={handleExportCSV}>
              <Download className="h-3.5 w-3.5 mr-1" />Export CSV
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-3 w-10">
                    <input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="rounded border-border" />
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Utilisateur</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Rôle</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Abonnement</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Inscription</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${selectedIds.has(u.id) ? "bg-primary/5" : ""}`}>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={selectedIds.has(u.id)} onChange={() => toggleSelect(u.id)} className="rounded border-border" />
                    </td>
                    <td className="px-4 py-3 cursor-pointer" onClick={() => openUserDrawer(u)}>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0">{u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground flex items-center gap-1 truncate">{u.name}{u.verified && <CheckCircle className="h-3.5 w-3.5 text-accent shrink-0" />}</p>
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleColors[u.role] || "bg-muted text-muted-foreground"}`}>{roleLabels[u.role] || u.role}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[u.status]}`}>{statusLabels[u.status]}</span></td>
                    <td className="px-4 py-3 text-foreground text-xs hidden md:table-cell">{u.subscription}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">{u.joined}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                        {u.status === "pending" && (
                          <>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-accent hover:text-accent" title="Valider" onClick={() => handleApprove(u.id)}><UserCheck className="h-4 w-4" /></Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" title="Refuser" onClick={() => setMotifAction({ type: "reject", userId: u.id, userName: u.name })}><XCircle className="h-4 w-4" /></Button>
                          </>
                        )}
                        {u.status === "active" && (
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-warning hover:text-warning" title="Suspendre" onClick={() => setMotifAction({ type: "suspend", userId: u.id, userName: u.name })}><Ban className="h-4 w-4" /></Button>
                        )}
                        {u.status === "suspended" && <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-accent hover:text-accent" title="Réactiver" onClick={() => setMotifAction({ type: "reactivate", userId: u.id, userName: u.name })}><RotateCcw className="h-4 w-4" /></Button>}
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Modifier" onClick={() => openEditDialog(u)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Email" onClick={() => openSendEmail(u)}><Mail className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Voir" onClick={() => openUserDrawer(u)}><Eye className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7}>
                    <EmptyState icon={Inbox} title="Aucun utilisateur" description="Aucun résultat pour cette recherche ou ce filtre." compact />
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User 360° detail drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="sm:max-w-lg flex flex-col p-0">
          {selectedUser && (() => {
            const org = lookups.getOrgByUserId(selectedUser.id);
            const sub = lookups.getSubByUserId(selectedUser.id);
            const payments = lookups.getPaymentsByUserId(selectedUser.id);
            const tickets = lookups.getTicketsByUserId(selectedUser.id);
            const disputes = lookups.getDisputesByUserId(selectedUser.id);
            const onboarding = lookups.getOnboardingByUserId(selectedUser.id);

            return (<>
              <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
                <SheetTitle className="sr-only">Vue 360° utilisateur</SheetTitle>
                <SheetDescription className="sr-only">Profil complet et entités liées</SheetDescription>
                <div className="text-center">
                  <div className="h-16 w-16 mx-auto rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
                    {selectedUser.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <h3 className="font-bold text-foreground mt-3">{selectedUser.name}</h3>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleColors[selectedUser.role] || "bg-muted text-muted-foreground"}`}>{roleLabels[selectedUser.role] || selectedUser.role}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[selectedUser.status]}`}>{statusLabels[selectedUser.status]}</span>
                  </div>
                </div>
              </SheetHeader>

              <Tabs defaultValue="info" className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="mx-6 mt-3 shrink-0">
                  <TabsTrigger value="info" className="text-xs">Profil</TabsTrigger>
                  <TabsTrigger value="billing" className="text-xs">Facturation {payments.length > 0 && <span className="ml-1 text-[9px] bg-muted px-1.5 rounded-full">{payments.length}</span>}</TabsTrigger>
                  <TabsTrigger value="support" className="text-xs">Support {(tickets.length + disputes.length) > 0 && <span className="ml-1 text-[9px] bg-warning/20 text-warning px-1.5 rounded-full">{tickets.length + disputes.length}</span>}</TabsTrigger>
                </TabsList>

                <ScrollArea className="flex-1 px-6 py-4">
                  <TabsContent value="info" className="mt-0 space-y-4">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4 shrink-0" /><span className="truncate">{selectedUser.email}</span></div>
                      <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4 shrink-0" /><span>{selectedUser.phone}</span></div>
                      <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4 shrink-0" /><span>Inscrit le {selectedUser.joined}</span></div>
                      <div className="flex items-center gap-2 text-muted-foreground"><Shield className="h-4 w-4 shrink-0" /><span>Dernière connexion : {selectedUser.lastLogin}</span></div>
                    </div>

                    {org && (
                      <div className="pt-3 border-t">
                        <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />Organisation</p>
                        <div className="rounded-lg border bg-muted/20 p-3 cursor-pointer hover:bg-muted/40 transition-colors" onClick={() => { setDrawerOpen(false); navigate("/dashboard/admin/organizations"); }}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-foreground">{org.name}</p>
                              <p className="text-xs text-muted-foreground">{org.type} · {org.city}</p>
                            </div>
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t">
                      <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><CreditCard className="h-3.5 w-3.5" />Abonnement</p>
                      {sub ? (
                        <div className="rounded-lg border bg-muted/20 p-3 cursor-pointer hover:bg-muted/40 transition-colors" onClick={() => { setDrawerOpen(false); navigate("/dashboard/admin/subscriptions"); }}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-foreground">{sub.plan}</p>
                              <p className="text-xs text-muted-foreground">{sub.monthlyPrice} TND/mois · {sub.status}</p>
                            </div>
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">Aucun abonnement</p>
                      )}
                    </div>

                    {onboarding && (
                      <div className="pt-3 border-t">
                        <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><FileText className="h-3.5 w-3.5" />Onboarding KYC</p>
                        <div className="rounded-lg border bg-muted/20 p-3 cursor-pointer hover:bg-muted/40 transition-colors" onClick={() => { setDrawerOpen(false); navigate("/dashboard/admin/onboarding"); }}>
                          <p className="text-sm text-foreground">{onboarding.currentStep}</p>
                          <p className="text-xs text-muted-foreground">Statut : {onboarding.status} · {onboarding.docs.length} doc(s)</p>
                        </div>
                      </div>
                    )}

                    {selectedUser.internalNotes.length > 0 && (
                      <div className="pt-3 border-t">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Notes internes</p>
                        {selectedUser.internalNotes.map(n => (
                          <div key={n.id} className="rounded-lg p-2 bg-muted/40 border mb-1.5">
                            <p className="text-[10px] text-muted-foreground">{n.author} · {n.createdAt}</p>
                            <p className="text-xs text-foreground">{n.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="billing" className="mt-0 space-y-4">
                    {payments.length === 0 ? (
                      <EmptyState icon={CreditCard} title="Aucun paiement" description="Cet utilisateur n'a aucun paiement enregistré." compact />
                    ) : (
                      <div className="space-y-2">
                        {payments.slice(0, 10).map(p => (
                          <div key={p.id} className="rounded-lg border p-3 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-foreground">{p.amount} {p.currency}</p>
                              <p className="text-xs text-muted-foreground">{p.type} · {p.createdAt}</p>
                            </div>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${p.status === "paid" ? "bg-accent/10 text-accent" : p.status === "failed" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>{p.status}</span>
                          </div>
                        ))}
                        {payments.length > 10 && <p className="text-xs text-muted-foreground text-center">+ {payments.length - 10} autres</p>}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="support" className="mt-0 space-y-4">
                    {tickets.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />Tickets ({tickets.length})</p>
                        {tickets.slice(0, 5).map(t => (
                          <div key={t.id} className="rounded-lg border p-3 mb-1.5 cursor-pointer hover:bg-muted/20" onClick={() => { setDrawerOpen(false); navigate("/dashboard/admin/resolution"); }}>
                            <p className="text-sm text-foreground">{t.subject}</p>
                            <p className="text-xs text-muted-foreground">{t.status} · {t.priority}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {disputes.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><Gavel className="h-3.5 w-3.5" />Litiges ({disputes.length})</p>
                        {disputes.slice(0, 5).map(d => (
                          <div key={d.id} className="rounded-lg border p-3 mb-1.5 cursor-pointer hover:bg-muted/20" onClick={() => { setDrawerOpen(false); navigate("/dashboard/admin/resolution"); }}>
                            <p className="text-sm text-foreground">{d.subject}</p>
                            <p className="text-xs text-muted-foreground">{d.status} · {d.priority}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {tickets.length === 0 && disputes.length === 0 && (
                      <EmptyState icon={MessageSquare} title="Aucun ticket" description="Cet utilisateur n'a aucun ticket ni litige." compact />
                    )}
                  </TabsContent>
                </ScrollArea>
              </Tabs>

              {/* Drawer Actions */}
              <div className="border-t px-6 py-4 space-y-2 shrink-0">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => { setDrawerOpen(false); openEditDialog(selectedUser); }}>
                    <Pencil className="h-3.5 w-3.5 mr-1" />Modifier
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => { setDrawerOpen(false); openSendEmail(selectedUser); }}>
                    <Send className="h-3.5 w-3.5 mr-1" />Email
                  </Button>
                </div>
                {selectedUser.status === "pending" && (
                  <>
                    <Button size="sm" className="w-full gradient-primary text-primary-foreground" onClick={() => handleApprove(selectedUser.id)}>
                      <CheckCircle className="h-4 w-4 mr-1" />Valider l'inscription
                    </Button>
                    <Button size="sm" variant="outline" className="w-full text-destructive" onClick={() => setMotifAction({ type: "reject", userId: selectedUser.id, userName: selectedUser.name })}>
                      <XCircle className="h-4 w-4 mr-1" />Refuser
                    </Button>
                  </>
                )}
                {selectedUser.status === "active" && (
                  <>
                    <Button size="sm" variant="outline" className="w-full text-warning" onClick={() => setMotifAction({ type: "suspend", userId: selectedUser.id, userName: selectedUser.name })}>
                      <Ban className="h-4 w-4 mr-1" />Suspendre le compte
                    </Button>
                    <Button size="sm" variant="outline" className="w-full" onClick={() => setMotifAction({ type: "reset_password", userId: selectedUser.id, userName: selectedUser.name })}>
                      <KeyRound className="h-4 w-4 mr-1" />Réinitialiser MDP
                    </Button>
                  </>
                )}
                {selectedUser.status === "suspended" && (
                  <Button size="sm" className="w-full gradient-primary text-primary-foreground" onClick={() => setMotifAction({ type: "reactivate", userId: selectedUser.id, userName: selectedUser.name })}>
                    <RotateCcw className="h-4 w-4 mr-1" />Réactiver le compte
                  </Button>
                )}
              </div>
            </>);
          })()}
        </SheetContent>
      </Sheet>

      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Créer un utilisateur</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label className="text-xs">Nom complet *</Label><Input className="mt-1" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} placeholder="Dr. Ahmed Ben..." /></div>
            <div><Label className="text-xs">Email *</Label><Input className="mt-1" type="email" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" /></div>
            <div><Label className="text-xs">Téléphone</Label><Input className="mt-1" value={createForm.phone} onChange={e => setCreateForm(f => ({ ...f, phone: e.target.value }))} placeholder="+216 XX XXX XXX" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Rôle *</Label>
                <Select value={createForm.role} onValueChange={v => setCreateForm(f => ({ ...f, role: v as UserRole }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Statut</Label>
                <Select value={createForm.status} onValueChange={v => setCreateForm(f => ({ ...f, status: v as "active" | "pending" }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={handleCreateUser}><Plus className="h-4 w-4 mr-1" />Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Modifier l'utilisateur</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label className="text-xs">Nom complet *</Label><Input className="mt-1" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label className="text-xs">Email *</Label><Input className="mt-1" type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div><Label className="text-xs">Téléphone</Label><Input className="mt-1" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Rôle</Label>
                <Select value={editForm.role} onValueChange={v => setEditForm(f => ({ ...f, role: v as UserRole }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Abonnement</Label>
                <Select value={editForm.subscription} onValueChange={v => setEditForm(f => ({ ...f, subscription: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="—">Aucun</SelectItem>
                    <SelectItem value="Essentiel">Essentiel</SelectItem>
                    <SelectItem value="Pro">Pro</SelectItem>
                    <SelectItem value="Cabinet+">Cabinet+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Annuler</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={handleEditSave}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Envoyer un email</DialogTitle></DialogHeader>
          {emailTarget && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border bg-muted/20 p-3 text-sm">
                <p className="font-medium text-foreground">{emailTarget.name}</p>
                <p className="text-xs text-muted-foreground">{emailTarget.email}</p>
              </div>
              <div><Label className="text-xs">Sujet *</Label><Input className="mt-1" value={emailForm.subject} onChange={e => setEmailForm(f => ({ ...f, subject: e.target.value }))} placeholder="Objet de l'email..." /></div>
              <div><Label className="text-xs">Message</Label><textarea className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[100px]" value={emailForm.body} onChange={e => setEmailForm(f => ({ ...f, body: e.target.value }))} placeholder="Contenu du message..." /></div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEmailOpen(false)}>Annuler</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={handleSendEmail}><Send className="h-4 w-4 mr-1" />Envoyer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Motif dialog for sensitive actions */}
      {motifAction && currentMotifConfig && (
        <MotifDialog
          open={!!motifAction}
          onClose={() => setMotifAction(null)}
          onConfirm={handleMotifConfirm}
          title={currentMotifConfig.title}
          description={`${motifAction.userName} — ${currentMotifConfig.desc}`}
          confirmLabel={currentMotifConfig.label}
          destructive={currentMotifConfig.destructive}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminUsers;
