import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, Filter, MoreVertical, CheckCircle, XCircle, Eye, Ban, UserCheck, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type UserFilter = "all" | "doctors" | "patients" | "pharmacies" | "laboratories" | "pending";

const users = [
  { id: 1, name: "Dr. Ahmed Bouazizi", email: "ahmed@mediconnect.tn", role: "doctor", status: "active", subscription: "Pro (129 DT)", joined: "15 Jan 2025", verified: true },
  { id: 2, name: "Dr. Sonia Gharbi", email: "sonia@email.tn", role: "doctor", status: "active", subscription: "Basic (39 DT)", joined: "20 Jan 2025", verified: true },
  { id: 3, name: "Dr. Karim Bouzid", email: "karim@email.tn", role: "doctor", status: "pending", subscription: "—", joined: "18 Fév 2026", verified: false },
  { id: 4, name: "Amine Ben Ali", email: "amine@email.tn", role: "patient", status: "active", subscription: "Gratuit", joined: "10 Déc 2024", verified: true },
  { id: 5, name: "Fatma Trabelsi", email: "fatma@email.tn", role: "patient", status: "active", subscription: "Gratuit", joined: "5 Jan 2025", verified: true },
  { id: 6, name: "Pharmacie El Amal", email: "elamal@pharmacy.tn", role: "pharmacy", status: "pending", subscription: "—", joined: "19 Fév 2026", verified: false },
  { id: 7, name: "Labo BioSanté", email: "bio@labo.tn", role: "laboratory", status: "active", subscription: "Standard (59 DT)", joined: "1 Fév 2025", verified: true },
  { id: 8, name: "Dr. Fathi Mejri", email: "fathi@email.tn", role: "doctor", status: "suspended", subscription: "Pro (129 DT)", joined: "10 Mar 2024", verified: true },
];

const roleLabels: Record<string, string> = { doctor: "Médecin", patient: "Patient", pharmacy: "Pharmacie", laboratory: "Laboratoire" };
const statusColors: Record<string, string> = { active: "bg-accent/10 text-accent", pending: "bg-warning/10 text-warning", suspended: "bg-destructive/10 text-destructive" };
const statusLabels: Record<string, string> = { active: "Actif", pending: "En attente", suspended: "Suspendu" };

const AdminUsers = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<UserFilter>("all");
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  const filtered = users.filter(u => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "doctors") return u.role === "doctor";
    if (filter === "patients") return u.role === "patient";
    if (filter === "pharmacies") return u.role === "pharmacy";
    if (filter === "laboratories") return u.role === "laboratory";
    if (filter === "pending") return u.status === "pending";
    return true;
  });

  return (
    <DashboardLayout role="admin" title="Gestion des utilisateurs">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher par nom ou email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-1 rounded-lg border bg-card p-0.5 overflow-x-auto">
            {([
              { key: "all" as UserFilter, label: "Tous" },
              { key: "doctors" as UserFilter, label: "Médecins" },
              { key: "patients" as UserFilter, label: "Patients" },
              { key: "pharmacies" as UserFilter, label: "Pharmacies" },
              { key: "laboratories" as UserFilter, label: "Labos" },
              { key: "pending" as UserFilter, label: "En attente" },
            ]).map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{f.label}</button>
            ))}
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border bg-card p-3 text-center">
            <p className="text-lg font-bold text-foreground">{users.length}</p>
            <p className="text-[11px] text-muted-foreground">Total</p>
          </div>
          <div className="rounded-lg border bg-warning/5 p-3 text-center">
            <p className="text-lg font-bold text-warning">{users.filter(u => u.status === "pending").length}</p>
            <p className="text-[11px] text-muted-foreground">En attente</p>
          </div>
          <div className="rounded-lg border bg-destructive/5 p-3 text-center">
            <p className="text-lg font-bold text-destructive">{users.filter(u => u.status === "suspended").length}</p>
            <p className="text-[11px] text-muted-foreground">Suspendus</p>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
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
                  <tr key={u.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">{u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</div>
                        <div>
                          <p className="font-medium text-foreground flex items-center gap-1">{u.name}{u.verified && <CheckCircle className="h-3.5 w-3.5 text-accent" />}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">{roleLabels[u.role]}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[u.status]}`}>{statusLabels[u.status]}</span></td>
                    <td className="px-4 py-3 text-foreground">{u.subscription}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.joined}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {u.status === "pending" && (
                          <>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-accent hover:text-accent"><UserCheck className="h-4 w-4" /></Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive"><XCircle className="h-4 w-4" /></Button>
                          </>
                        )}
                        {u.status === "active" && <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-warning hover:text-warning"><Ban className="h-4 w-4" /></Button>}
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0"><Eye className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center">{filtered.length} utilisateur(s) affiché(s)</p>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
