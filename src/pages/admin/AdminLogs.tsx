/**
 * Admin System Logs — Enhanced with detail drawer, export, more entries, level stats
 * TODO BACKEND: Replace with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Download, Clock, User, Shield, AlertTriangle,
  CheckCircle2, XCircle, LogIn, LogOut, Edit, Trash2, Eye, Settings,
  ChevronLeft, ChevronRight, Server, Activity,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface SystemLog {
  id: number;
  time: string;
  user: string;
  userRole: string;
  action: string;
  detail: string;
  level: string;
  ip?: string;
  userAgent?: string;
  duration?: string;
}

const mockSystemLogs: SystemLog[] = [
  { id: 1, time: "09 Mar 09:45", user: "Dr. Bouazizi", userRole: "doctor", action: "Connexion", detail: "Connexion réussie depuis 196.203.xx.xx", level: "info", ip: "196.203.45.12", userAgent: "Chrome 120/macOS", duration: "120ms" },
  { id: 2, time: "09 Mar 09:42", user: "Admin", userRole: "admin", action: "Validation compte", detail: "Dr. Karim Bouzid — Cardiologue approuvé", level: "info", ip: "10.0.0.1" },
  { id: 3, time: "09 Mar 09:38", user: "Système", userRole: "system", action: "Alerte sécurité", detail: "3 tentatives de connexion échouées — IP 41.226.xx.xx", level: "security", ip: "41.226.88.33" },
  { id: 4, time: "09 Mar 09:30", user: "Dr. Gharbi", userRole: "doctor", action: "Modification profil", detail: "Mise à jour des horaires d'ouverture", level: "info", ip: "196.203.12.88" },
  { id: 5, time: "09 Mar 09:15", user: "Admin", userRole: "admin", action: "Suspension compte", detail: "Dr. Fathi Mejri — Profil signalé pour fraude", level: "warning", ip: "10.0.0.1" },
  { id: 6, time: "09 Mar 09:10", user: "Pharmacie El Amal", userRole: "pharmacy", action: "Inscription", detail: "Nouvelle inscription — En attente de validation", level: "info", ip: "197.15.22.45" },
  { id: 7, time: "09 Mar 09:00", user: "Système", userRole: "system", action: "Sauvegarde automatique", detail: "Base de données sauvegardée avec succès (12.4 Go)", level: "info", duration: "45s" },
  { id: 8, time: "09 Mar 08:55", user: "Admin", userRole: "admin", action: "Rejet inscription", detail: "Labo XYZ — Documents non conformes", level: "warning", ip: "10.0.0.1" },
  { id: 9, time: "08 Mar 22:00", user: "Système", userRole: "system", action: "Maintenance planifiée", detail: "Nettoyage des sessions expirées — 1,247 sessions supprimées", level: "info", duration: "12s" },
  { id: 10, time: "08 Mar 18:30", user: "Patient inconnu", userRole: "anonymous", action: "Tentative d'accès", detail: "Accès refusé — Token expiré", level: "error", ip: "41.226.55.77" },
  { id: 11, time: "08 Mar 17:00", user: "Admin", userRole: "admin", action: "Export données", detail: "Export CSV des utilisateurs actifs (8,245 lignes)", level: "info", ip: "10.0.0.1", duration: "3.2s" },
  { id: 12, time: "08 Mar 15:30", user: "Dr. Hammami", userRole: "doctor", action: "Suppression RDV", detail: "Annulation du RDV #4532 — Patient: Sarra Mejri", level: "warning", ip: "196.203.78.90" },
  { id: 13, time: "08 Mar 14:00", user: "Système", userRole: "system", action: "Backup DB", detail: "Backup quotidien terminé — Taille: 12.4 Go", level: "info", duration: "2m 15s" },
  { id: 14, time: "08 Mar 12:30", user: "Fatma Trabelsi", userRole: "patient", action: "Prise de RDV", detail: "Nouveau RDV — Dr. Bouazizi — 10 Mar 14:30", level: "info", ip: "197.15.33.44" },
  { id: 15, time: "08 Mar 11:00", user: "Système", userRole: "system", action: "Alerte performance", detail: "Temps de réponse API > 2s — Endpoint: /api/search", level: "error", duration: "2.8s" },
  { id: 16, time: "08 Mar 10:00", user: "Admin", userRole: "admin", action: "Feature flag", detail: "Messagerie patients → activé", level: "info", ip: "10.0.0.1" },
  { id: 17, time: "07 Mar 23:00", user: "Système", userRole: "system", action: "Certificat SSL", detail: "Renouvellement automatique du certificat SSL — Expire: 07 Juin 2026", level: "info" },
  { id: 18, time: "07 Mar 16:45", user: "Labo BioSanté", userRole: "laboratory", action: "Upload résultats", detail: "3 résultats PDF uploadés pour patient M. Kaabi", level: "info", ip: "197.15.11.22" },
  { id: 19, time: "07 Mar 14:20", user: "Système", userRole: "system", action: "Alerte sécurité", detail: "Brute force détecté — IP 185.220.xx.xx bloquée", level: "security", ip: "185.220.101.33" },
  { id: 20, time: "07 Mar 09:00", user: "Admin", userRole: "admin", action: "Mise à jour tarifs", detail: "Tarif téléconsultation mis à jour: 60 DT → 65 DT", level: "info", ip: "10.0.0.1" },
];

const iconMap: Record<string, any> = {
  "Connexion": LogIn, "Validation compte": CheckCircle2, "Alerte sécurité": Shield,
  "Modification profil": Edit, "Suspension compte": XCircle, "Inscription": User,
  "Sauvegarde automatique": Server, "Rejet inscription": XCircle, "Maintenance planifiée": Settings,
  "Tentative d'accès": AlertTriangle, "Export données": Download, "Suppression RDV": Trash2,
  "Backup DB": Server, "Prise de RDV": CheckCircle2, "Alerte performance": Activity,
  "Feature flag": Settings, "Certificat SSL": Shield, "Upload résultats": CheckCircle2,
  "Mise à jour tarifs": Edit,
};

const levelConfig: Record<string, { label: string; class: string }> = {
  info: { label: "Info", class: "bg-primary/10 text-primary" },
  warning: { label: "Warning", class: "bg-warning/10 text-warning" },
  error: { label: "Erreur", class: "bg-destructive/10 text-destructive" },
  security: { label: "Sécurité", class: "bg-accent/10 text-accent" },
};

type LogLevel = "all" | "info" | "warning" | "error" | "security";
const PAGE_SIZE = 10;

const AdminLogs = () => {
  const [filter, setFilter] = useState<LogLevel>("all");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [detailLog, setDetailLog] = useState<SystemLog | null>(null);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => mockSystemLogs.filter(l => {
    if (filter !== "all" && l.level !== filter) return false;
    if (roleFilter !== "all" && l.userRole !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return l.user.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.detail.toLowerCase().includes(q);
    }
    return true;
  }), [filter, roleFilter, search]);

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const levelStats = useMemo(() => ({
    info: mockSystemLogs.filter(l => l.level === "info").length,
    warning: mockSystemLogs.filter(l => l.level === "warning").length,
    error: mockSystemLogs.filter(l => l.level === "error").length,
    security: mockSystemLogs.filter(l => l.level === "security").length,
  }), []);

  const handleExport = () => {
    const csv = ["ID,Heure,Utilisateur,Rôle,Action,Détail,Niveau,IP"]
      .concat(filtered.map(l => `${l.id},"${l.time}","${l.user}",${l.userRole},"${l.action}","${l.detail}",${l.level},${l.ip || "—"}`))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a"); el.href = url; el.download = `system_logs_${new Date().toISOString().split("T")[0]}.csv`; el.click();
    URL.revokeObjectURL(url);
    toast({ title: "Logs exportés" });
  };

  return (
    <DashboardLayout role="admin" title="Journal d'activité système">
      <div className="space-y-6">
        {/* Level stats */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-primary/5 p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-primary">{levelStats.info}</p>
            <p className="text-[11px] text-muted-foreground">Info</p>
          </div>
          <div className="rounded-xl border bg-warning/5 p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-warning">{levelStats.warning}</p>
            <p className="text-[11px] text-muted-foreground">Warning</p>
          </div>
          <div className="rounded-xl border bg-destructive/5 p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-destructive">{levelStats.error}</p>
            <p className="text-[11px] text-muted-foreground">Erreurs</p>
          </div>
          <div className="rounded-xl border bg-accent/5 p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-accent">{levelStats.security}</p>
            <p className="text-[11px] text-muted-foreground">Sécurité</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1 rounded-lg border bg-card p-0.5">
              {(["all", "info", "warning", "error", "security"] as LogLevel[]).map(l => (
                <button key={l} onClick={() => { setFilter(l); setPage(0); }}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filter === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {l === "all" ? "Tous" : levelConfig[l]?.label || l}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="pl-9 h-9 w-56 text-xs" />
            </div>
            <Select value={roleFilter} onValueChange={v => { setRoleFilter(v); setPage(0); }}>
              <SelectTrigger className="w-32 h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous rôles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="doctor">Médecin</SelectItem>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="pharmacy">Pharmacie</SelectItem>
                <SelectItem value="laboratory">Laboratoire</SelectItem>
                <SelectItem value="system">Système</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" className="text-xs" onClick={handleExport}>
            <Download className="h-3.5 w-3.5 mr-1" />Exporter
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">{filtered.length} entrée(s)</p>

        {/* Log entries */}
        <div className="rounded-xl border bg-card shadow-card divide-y">
          {paged.map(log => {
            const config = levelConfig[log.level] || levelConfig.info;
            const LogIcon = iconMap[log.action] || Settings;
            return (
              <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setDetailLog(log)}>
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${config.class}`}>
                  <LogIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{log.action}</p>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${config.class}`}>{config.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{log.detail}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{log.user}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{log.time}</span>
                    {log.ip && <span className="hidden sm:inline">IP: {log.ip}</span>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"><Eye className="h-3.5 w-3.5 text-muted-foreground" /></Button>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Page {page + 1} / {totalPages}</p>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-3.5 w-3.5" /></Button>
              <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail drawer */}
      <Sheet open={!!detailLog} onOpenChange={() => setDetailLog(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Détail du log</SheetTitle>
          </SheetHeader>
          {detailLog && (() => {
            const config = levelConfig[detailLog.level] || levelConfig.info;
            const LogIcon = iconMap[detailLog.action] || Settings;
            return (
              <div className="space-y-5 mt-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${config.class}`}>
                    <LogIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{detailLog.action}</p>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${config.class}`}>{config.label}</span>
                  </div>
                </div>

                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Utilisateur</span>
                    <span className="text-sm font-medium text-foreground">{detailLog.user}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Rôle</span>
                    <span className="text-sm text-foreground capitalize">{detailLog.userRole}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Horodatage</span>
                    <span className="text-sm text-foreground">{detailLog.time}</span>
                  </div>
                  {detailLog.ip && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Adresse IP</span>
                      <span className="text-sm font-mono text-foreground">{detailLog.ip}</span>
                    </div>
                  )}
                  {detailLog.userAgent && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Navigateur</span>
                      <span className="text-sm text-foreground">{detailLog.userAgent}</span>
                    </div>
                  )}
                  {detailLog.duration && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Durée</span>
                      <span className="text-sm text-foreground">{detailLog.duration}</span>
                    </div>
                  )}
                </div>

                <div className="rounded-lg border p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Description complète</p>
                  <p className="text-sm text-foreground leading-relaxed">{detailLog.detail}</p>
                </div>
              </div>
            );
          })()}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default AdminLogs;
