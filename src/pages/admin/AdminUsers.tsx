/**
 * Admin Users — Full user management with motif-required sensitive actions
 * TODO BACKEND: Replace with real API calls
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, CheckCircle, XCircle, Eye, Ban, UserCheck, Mail, Phone, Calendar, Shield, ArrowUpDown, X, RotateCcw, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockAdminUsers } from "@/data/mockData";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";
import MotifDialog from "@/components/admin/MotifDialog";

type UserFilter = "all" | "doctors" | "patients" | "secretaries" | "pharmacies" | "laboratories" | "pending";

const roleLabels: Record<string, string> = { doctor: "Médecin", patient: "Patient", pharmacy: "Pharmacie", laboratory: "Laboratoire", secretary: "Secrétaire" };
const roleColors: Record<string, string> = { doctor: "bg-primary/10 text-primary", patient: "bg-accent/10 text-accent", pharmacy: "bg-warning/10 text-warning", laboratory: "bg-muted text-foreground", secretary: "bg-primary/10 text-primary" };
const statusColors: Record<string, string> = { active: "bg-accent/10 text-accent", pending: "bg-warning/10 text-warning", suspended: "bg-destructive/10 text-destructive" };
const statusLabels: Record<string, string> = { active: "Actif", pending: "En attente", suspended: "Suspendu" };

type MotifAction = { type: "suspend" | "reactivate" | "reject" | "reset_password"; userId: number; userName: string } | null;

const AdminUsers = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<UserFilter>("all");
  const [users, setUsers] = useState(mockAdminUsers);
  const [selectedUser, setSelectedUser] = useState<typeof mockAdminUsers[0] | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "joined">("joined");
  const [motifAction, setMotifAction] = useState<MotifAction>(null);

  const filtered = users
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
    .sort((a, b) => sortBy === "name" ? a.name.localeCompare(b.name) : 0);

  const handleApprove = (id: number) => {
    const u = users.find(x => x.id === id);
    if (!u) return;
    setUsers(prev => prev.map(x => x.id === id ? { ...x, status: "active", verified: true } : x));
    appendLog("user_approved", "user", String(id), `Inscription de ${u.name} approuvée`);
    toast({ title: `${u.name} approuvé(e)` });
    if (selectedUser?.id === id) setSelectedUser(null);
  };

  const handleMotifConfirm = (motif: string) => {
    if (!motifAction) return;
    const { type, userId, userName } = motifAction;

    if (type === "suspend") {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: "suspended" } : u));
      appendLog("user_suspended", "user", String(userId), `${userName} suspendu — Motif : ${motif}`);
      toast({ title: `${userName} suspendu` });
    } else if (type === "reactivate") {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: "active" } : u));
      appendLog("user_reactivated", "user", String(userId), `${userName} réactivé — Motif : ${motif}`);
      toast({ title: `${userName} réactivé` });
    } else if (type === "reject") {
      setUsers(prev => prev.filter(u => u.id !== userId));
      appendLog("user_rejected", "user", String(userId), `Inscription de ${userName} refusée — Motif : ${motif}`);
      toast({ title: `${userName} refusé(e)`, variant: "destructive" });
      if (selectedUser?.id === userId) setSelectedUser(null);
    } else if (type === "reset_password") {
      appendLog("password_reset", "user", String(userId), `Réinitialisation MDP de ${userName} — Motif : ${motif}`);
      toast({ title: `Lien de réinitialisation envoyé à ${userName}` });
    }
    setMotifAction(null);
  };

  const motifDialogConfig: Record<string, { title: string; desc: string; label: string; destructive: boolean }> = {
    suspend: { title: "Suspendre le compte", desc: "Cette action bloquera l'accès de l'utilisateur.", label: "Suspendre", destructive: true },
    reactivate: { title: "Réactiver le compte", desc: "L'utilisateur retrouvera l'accès à la plateforme.", label: "Réactiver", destructive: false },
    reject: { title: "Refuser l'inscription", desc: "L'utilisateur sera supprimé de la plateforme.", label: "Refuser", destructive: true },
    reset_password: { title: "Réinitialiser le mot de passe", desc: "Un lien de réinitialisation sera envoyé.", label: "Réinitialiser", destructive: false },
  };

  const currentMotifConfig = motifAction ? motifDialogConfig[motifAction.type] : null;

  return (
    <DashboardLayout role="admin" title="Gestion des utilisateurs">
      <div className="space-y-6">
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

        <div className="flex gap-6">
          {/* Table */}
          <div className="flex-1 rounded-xl border bg-card shadow-card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="text-sm text-muted-foreground">{filtered.length} résultat(s)</span>
              <button onClick={() => setSortBy(sortBy === "name" ? "joined" : "name")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <ArrowUpDown className="h-3 w-3" />Trier par {sortBy === "name" ? "date" : "nom"}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Utilisateur</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Rôle</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Abonnement</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Inscription</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id} className={`border-b last:border-0 hover:bg-muted/20 transition-colors cursor-pointer ${selectedUser?.id === u.id ? "bg-primary/5" : ""}`} onClick={() => setSelectedUser(u)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">{u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</div>
                          <div>
                            <p className="font-medium text-foreground flex items-center gap-1">{u.name}{u.verified && <CheckCircle className="h-3.5 w-3.5 text-accent" />}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleColors[u.role] || "bg-muted text-muted-foreground"}`}>{roleLabels[u.role] || u.role}</span></td>
                      <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[u.status]}`}>{statusLabels[u.status]}</span></td>
                      <td className="px-4 py-3 text-foreground text-xs">{u.subscription}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{u.joined}</td>
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
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Voir" onClick={() => setSelectedUser(u)}><Eye className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User detail panel */}
          {selectedUser && (
            <div className="w-80 rounded-xl border bg-card shadow-card p-5 space-y-4 shrink-0 hidden lg:block">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground text-sm">Détail utilisateur</h4>
                <button onClick={() => setSelectedUser(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 mx-auto rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
                  {selectedUser.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <h3 className="font-bold text-foreground mt-3">{selectedUser.name}</h3>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleColors[selectedUser.role] || "bg-muted text-muted-foreground"}`}>{roleLabels[selectedUser.role] || selectedUser.role}</span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /><span>{selectedUser.email}</span></div>
                <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /><span>{selectedUser.phone}</span></div>
                <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /><span>Inscrit le {selectedUser.joined}</span></div>
                <div className="flex items-center gap-2 text-muted-foreground"><Shield className="h-4 w-4" /><span>Dernière connexion : {selectedUser.lastLogin}</span></div>
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
              </div>
              <div className="pt-3 border-t space-y-2">
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
            </div>
          )}
        </div>
      </div>

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
