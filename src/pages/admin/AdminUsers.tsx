/**
 * Admin Users — Full user management with bulk actions, CSV export, motif-required sensitive actions
 * Connected to central admin store
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import { Search, CheckCircle, XCircle, Eye, Ban, UserCheck, Mail, Phone, Calendar, Shield, ArrowUpDown, X, RotateCcw, KeyRound, Download, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAdminUsers } from "@/stores/adminStore";
import type { AdminUser } from "@/types/admin";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";
import MotifDialog from "@/components/admin/MotifDialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

type UserFilter = "all" | "doctors" | "patients" | "secretaries" | "pharmacies" | "laboratories" | "pending";

const roleLabels: Record<string, string> = { doctor: "Médecin", patient: "Patient", pharmacy: "Pharmacie", laboratory: "Laboratoire", secretary: "Secrétaire" };
const roleColors: Record<string, string> = { doctor: "bg-primary/10 text-primary", patient: "bg-accent/10 text-accent", pharmacy: "bg-warning/10 text-warning", laboratory: "bg-muted text-foreground", secretary: "bg-primary/10 text-primary" };
const statusColors: Record<string, string> = { active: "bg-accent/10 text-accent", pending: "bg-warning/10 text-warning", suspended: "bg-destructive/10 text-destructive" };
const statusLabels: Record<string, string> = { active: "Actif", pending: "En attente", suspended: "Suspendu" };

type MotifAction = { type: "suspend" | "reactivate" | "reject" | "reset_password" | "force_disconnect" | "bulk_suspend"; userId: string; userName: string } | null;

const AdminUsers = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<UserFilter>("all");
  const { users, setUsers } = useAdminUsers();
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "joined">("joined");
  const [motifAction, setMotifAction] = useState<MotifAction>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(u => u.id)));
    }
  };

  const handleApprove = (id: string) => {
    const u = users.find(x => x.id === id);
    if (!u) return;
    setUsers(prev => prev.map(x => x.id === id ? { ...x, status: "active" as const, verified: true } : x));
    appendLog("user_approved", "user", id, `Inscription de ${u.name} approuvée`);
    toast({ title: `${u.name} approuvé(e)` });
    if (selectedUser?.id === id) setSelectedUser(null);
  };

  const handleMotifConfirm = (motif: string) => {
    if (!motifAction) return;
    const { type, userId, userName } = motifAction;

    if (type === "suspend") {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: "suspended" as const } : u));
      appendLog("user_suspended", "user", userId, `${userName} suspendu — Motif : ${motif}`);
      toast({ title: `${userName} suspendu` });
    } else if (type === "reactivate") {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: "active" as const } : u));
      appendLog("user_reactivated", "user", String(userId), `${userName} réactivé — Motif : ${motif}`);
      toast({ title: `${userName} réactivé` });
    } else if (type === "reject") {
      setUsers(prev => prev.filter(u => u.id !== userId));
      appendLog("user_rejected", "user", String(userId), `Inscription de ${userName} refusée — Motif : ${motif}`);
      toast({ title: `${userName} refusé(e)`, variant: "destructive" });
      if (selectedUser?.id === userId) { setSelectedUser(null); setDrawerOpen(false); }
    } else if (type === "reset_password") {
      appendLog("password_reset", "user", String(userId), `Réinitialisation MDP de ${userName} — Motif : ${motif}`);
      toast({ title: `Lien de réinitialisation envoyé à ${userName}` });
    } else if (type === "force_disconnect") {
      appendLog("force_disconnect", "user", String(userId), `Déconnexion forcée de ${userName} — Motif : ${motif}`);
      toast({ title: `${userName} déconnecté de force` });
    } else if (type === "bulk_suspend") {
      const ids = Array.from(selectedIds);
      setUsers(prev => prev.map(u => ids.includes(u.id) ? { ...u, status: "suspended" } : u));
      appendLog("bulk_suspend", "user", ids.join(","), `Suspension en masse de ${ids.length} utilisateurs — Motif : ${motif}`);
      toast({ title: `${ids.length} utilisateur(s) suspendu(s)` });
      setSelectedIds(new Set());
    }
    setMotifAction(null);
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

  const openUserDrawer = (u: typeof mockAdminUsers[0]) => {
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
              <Button size="sm" variant="outline" className="text-xs text-destructive border-destructive/30" onClick={() => setMotifAction({ type: "bulk_suspend", userId: 0, userName: `${selectedIds.size} utilisateurs` })}>
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
                          <>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-warning hover:text-warning" title="Suspendre" onClick={() => setMotifAction({ type: "suspend", userId: u.id, userName: u.name })}><Ban className="h-4 w-4" /></Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Reset MDP" onClick={() => setMotifAction({ type: "reset_password", userId: u.id, userName: u.name })}><KeyRound className="h-4 w-4" /></Button>
                          </>
                        )}
                        {u.status === "suspended" && <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-accent hover:text-accent" title="Réactiver" onClick={() => setMotifAction({ type: "reactivate", userId: u.id, userName: u.name })}><RotateCcw className="h-4 w-4" /></Button>}
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Voir" onClick={() => openUserDrawer(u)}><Eye className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User detail drawer (replaces side panel — works on mobile too) */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="sm:max-w-md flex flex-col p-0">
          {selectedUser && (
            <>
              <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
                <SheetTitle className="sr-only">Détail utilisateur</SheetTitle>
                <SheetDescription className="sr-only">Profil et actions</SheetDescription>
                <div className="text-center">
                  <div className="h-16 w-16 mx-auto rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
                    {selectedUser.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <h3 className="font-bold text-foreground mt-3">{selectedUser.name}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleColors[selectedUser.role] || "bg-muted text-muted-foreground"}`}>{roleLabels[selectedUser.role] || selectedUser.role}</span>
                </div>
              </SheetHeader>

              <ScrollArea className="flex-1 px-6 py-4">
                <div className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4 shrink-0" /><span className="truncate">{selectedUser.email}</span></div>
                    <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4 shrink-0" /><span>{selectedUser.phone}</span></div>
                    <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4 shrink-0" /><span>Inscrit le {selectedUser.joined}</span></div>
                    <div className="flex items-center gap-2 text-muted-foreground"><Shield className="h-4 w-4 shrink-0" /><span>Dernière connexion : {selectedUser.lastLogin}</span></div>
                  </div>

                  <div className="pt-3 border-t space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Statut</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[selectedUser.status]}`}>{statusLabels[selectedUser.status]}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Vérifié</span>
                      <span>{selectedUser.verified ? <CheckCircle className="h-4 w-4 text-accent" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Abonnement</span>
                      <span className="text-xs font-medium text-foreground">{selectedUser.subscription}</span>
                    </div>
                  </div>

                  {/* Historique non-médical (mock) */}
                  <div className="pt-3 border-t">
                    <p className="text-xs font-semibold text-foreground mb-2">Historique non-médical</p>
                    <div className="space-y-2">
                      {[
                        { event: "Inscription", date: selectedUser.joined },
                        { event: "Dernière connexion", date: selectedUser.lastLogin },
                        { event: "Email vérifié", date: selectedUser.verified ? selectedUser.joined : "—" },
                      ].map((h, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                          <div>
                            <p className="text-xs text-foreground">{h.event}</p>
                            <p className="text-[10px] text-muted-foreground">{h.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Actions */}
              <div className="border-t px-6 py-4 space-y-2 shrink-0">
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
                    <Button size="sm" variant="outline" className="w-full text-destructive" onClick={() => setMotifAction({ type: "force_disconnect", userId: selectedUser.id, userName: selectedUser.name })}>
                      <LogOut className="h-4 w-4 mr-1" />Forcer déconnexion
                    </Button>
                  </>
                )}
                {selectedUser.status === "suspended" && (
                  <Button size="sm" className="w-full gradient-primary text-primary-foreground" onClick={() => setMotifAction({ type: "reactivate", userId: selectedUser.id, userName: selectedUser.name })}>
                    <RotateCcw className="h-4 w-4 mr-1" />Réactiver le compte
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

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
