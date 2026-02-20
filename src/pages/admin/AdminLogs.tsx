import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Download, Filter, Clock, User, Shield, AlertTriangle,
  CheckCircle2, XCircle, LogIn, LogOut, Edit, Trash2, Eye, Settings
} from "lucide-react";

type LogLevel = "all" | "info" | "warning" | "error" | "security";

const logs = [
  { id: 1, time: "20 Fév 09:45", user: "Dr. Bouazizi", action: "Connexion", detail: "Connexion réussie depuis 196.203.xx.xx", level: "info", icon: LogIn },
  { id: 2, time: "20 Fév 09:42", user: "Admin", action: "Validation compte", detail: "Dr. Karim Bouzid — Cardiologue approuvé", level: "info", icon: CheckCircle2 },
  { id: 3, time: "20 Fév 09:38", user: "Système", action: "Alerte sécurité", detail: "3 tentatives de connexion échouées — IP 41.226.xx.xx", level: "security", icon: Shield },
  { id: 4, time: "20 Fév 09:30", user: "Dr. Gharbi", action: "Modification profil", detail: "Mise à jour des horaires d'ouverture", level: "info", icon: Edit },
  { id: 5, time: "20 Fév 09:15", user: "Admin", action: "Suspension compte", detail: "Dr. Fathi Mejri — Profil signalé pour fraude", level: "warning", icon: XCircle },
  { id: 6, time: "20 Fév 09:10", user: "Pharmacie El Amal", action: "Inscription", detail: "Nouvelle inscription — En attente de validation", level: "info", icon: User },
  { id: 7, time: "20 Fév 09:00", user: "Système", action: "Sauvegarde automatique", detail: "Base de données sauvegardée avec succès", level: "info", icon: Settings },
  { id: 8, time: "20 Fév 08:55", user: "Admin", action: "Rejet inscription", detail: "Labo XYZ — Documents non conformes", level: "warning", icon: XCircle },
  { id: 9, time: "19 Fév 22:00", user: "Système", action: "Maintenance planifiée", detail: "Nettoyage des sessions expirées", level: "info", icon: Settings },
  { id: 10, time: "19 Fév 18:30", user: "Patient inconnu", action: "Tentative d'accès", detail: "Accès refusé — Token expiré", level: "error", icon: AlertTriangle },
  { id: 11, time: "19 Fév 17:00", user: "Admin", action: "Export données", detail: "Export CSV des utilisateurs actifs", level: "info", icon: Download },
  { id: 12, time: "19 Fév 15:30", user: "Dr. Hammami", action: "Suppression RDV", detail: "Annulation du RDV #4532", level: "warning", icon: Trash2 },
];

const levelConfig: Record<string, { label: string; class: string }> = {
  info: { label: "Info", class: "bg-primary/10 text-primary" },
  warning: { label: "Warning", class: "bg-warning/10 text-warning" },
  error: { label: "Erreur", class: "bg-destructive/10 text-destructive" },
  security: { label: "Sécurité", class: "bg-accent/10 text-accent" },
};

const AdminLogs = () => {
  const [filter, setFilter] = useState<LogLevel>("all");
  const [search, setSearch] = useState("");

  const filtered = logs.filter(l => {
    if (filter !== "all" && l.level !== filter) return false;
    if (search && !l.user.toLowerCase().includes(search.toLowerCase()) && !l.action.toLowerCase().includes(search.toLowerCase()) && !l.detail.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout role="admin" title="Journal d'activité">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1 rounded-lg border bg-card p-0.5">
              {(["all", "info", "warning", "error", "security"] as LogLevel[]).map(l => (
                <button key={l} onClick={() => setFilter(l)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filter === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {l === "all" ? "Tous" : levelConfig[l]?.label || l}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 w-56 text-xs" />
            </div>
          </div>
          <Button variant="outline" size="sm" className="text-xs"><Download className="h-3.5 w-3.5 mr-1" />Exporter les logs</Button>
        </div>

        <p className="text-xs text-muted-foreground">{filtered.length} entrée(s)</p>

        <div className="rounded-xl border bg-card shadow-card divide-y">
          {filtered.map(log => {
            const config = levelConfig[log.level];
            return (
              <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${config.class}`}>
                  <log.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{log.action}</p>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${config.class}`}>{config.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{log.detail}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{log.user}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{log.time}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"><Eye className="h-3.5 w-3.5 text-muted-foreground" /></Button>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminLogs;
