/**
 * AdminLogs — Unified journal page with tabs: Système | Audit
 * Fusionné depuis: AdminLogs, AdminAuditLogs
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";
import {
  Search, Download, Clock, User, Shield, AlertTriangle, CheckCircle2, XCircle,
  LogIn, Edit, Trash2, Eye, Settings, ChevronLeft, ChevronRight, Server, Activity, RefreshCw,
} from "lucide-react";
import { getLogs, clearLogs, type AuditLogEntry } from "@/services/admin/adminAuditService";

// ── System log types ──
interface SystemLog { id: number; time: string; user: string; userRole: string; action: string; detail: string; level: string; ip?: string; userAgent?: string; duration?: string; }

const mockSystemLogs: SystemLog[] = [
  { id: 1, time: "09 Mar 09:45", user: "Dr. Bouazizi", userRole: "doctor", action: "Connexion", detail: "Connexion réussie depuis 196.203.xx.xx", level: "info", ip: "196.203.45.12", userAgent: "Chrome 120/macOS", duration: "120ms" },
  { id: 2, time: "09 Mar 09:42", user: "Admin", userRole: "admin", action: "Validation compte", detail: "Dr. Karim Bouzid — Cardiologue approuvé", level: "info", ip: "10.0.0.1" },
  { id: 3, time: "09 Mar 09:38", user: "Système", userRole: "system", action: "Alerte sécurité", detail: "3 tentatives de connexion échouées — IP 41.226.xx.xx", level: "security", ip: "41.226.88.33" },
  { id: 4, time: "09 Mar 09:30", user: "Dr. Gharbi", userRole: "doctor", action: "Modification profil", detail: "Mise à jour des horaires d'ouverture", level: "info", ip: "196.203.12.88" },
  { id: 5, time: "09 Mar 09:15", user: "Admin", userRole: "admin", action: "Suspension compte", detail: "Dr. Fathi Mejri — Profil signalé pour fraude", level: "warning", ip: "10.0.0.1" },
  { id: 6, time: "09 Mar 09:10", user: "Pharmacie El Amal", userRole: "pharmacy", action: "Inscription", detail: "Nouvelle inscription — En attente de validation", level: "info", ip: "197.15.22.45" },
  { id: 7, time: "09 Mar 09:00", user: "Système", userRole: "system", action: "Sauvegarde automatique", detail: "Base de données sauvegardée (12.4 Go)", level: "info", duration: "45s" },
  { id: 8, time: "09 Mar 08:55", user: "Admin", userRole: "admin", action: "Rejet inscription", detail: "Labo XYZ — Documents non conformes", level: "warning", ip: "10.0.0.1" },
  { id: 9, time: "08 Mar 22:00", user: "Système", userRole: "system", action: "Maintenance", detail: "Nettoyage des sessions expirées — 1,247 sessions supprimées", level: "info", duration: "12s" },
  { id: 10, time: "08 Mar 18:30", user: "Patient inconnu", userRole: "anonymous", action: "Tentative d'accès", detail: "Accès refusé — Token expiré", level: "error", ip: "41.226.55.77" },
  { id: 11, time: "08 Mar 17:00", user: "Admin", userRole: "admin", action: "Export données", detail: "Export CSV des utilisateurs actifs (8,245 lignes)", level: "info", ip: "10.0.0.1", duration: "3.2s" },
  { id: 12, time: "08 Mar 15:30", user: "Dr. Hammami", userRole: "doctor", action: "Suppression RDV", detail: "Annulation du RDV #4532 — Patient: Sarra Mejri", level: "warning", ip: "196.203.78.90" },
  { id: 13, time: "08 Mar 11:00", user: "Système", userRole: "system", action: "Alerte performance", detail: "Temps de réponse API > 2s — Endpoint: /api/search", level: "error", duration: "2.8s" },
  { id: 14, time: "07 Mar 23:00", user: "Système", userRole: "system", action: "Certificat SSL", detail: "Renouvellement automatique — Expire: 07 Juin 2026", level: "info" },
  { id: 15, time: "07 Mar 14:20", user: "Système", userRole: "system", action: "Alerte sécurité", detail: "Brute force détecté — IP 185.220.xx.xx bloquée", level: "security", ip: "185.220.101.33" },
];

const iconMap: Record<string, any> = {
  "Connexion": LogIn, "Validation compte": CheckCircle2, "Alerte sécurité": Shield,
  "Modification profil": Edit, "Suspension compte": XCircle, "Inscription": User,
  "Sauvegarde automatique": Server, "Rejet inscription": XCircle, "Maintenance": Settings,
  "Tentative d'accès": AlertTriangle, "Export données": Download, "Suppression RDV": Trash2,
  "Alerte performance": Activity, "Certificat SSL": Shield,
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
  // System tab
  const [filter, setFilter] = useState<LogLevel>("all");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [detailLog, setDetailLog] = useState<SystemLog | null>(null);
  const [page, setPage] = useState(0);

  // Audit tab
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditSearch, setAuditSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [targetFilter, setTargetFilter] = useState("");

  const refreshAudit = () => setAuditLogs(getLogs({ search: auditSearch, actionType: actionFilter || undefined, targetType: targetFilter || undefined }));
  useEffect(() => { refreshAudit(); }, [auditSearch, actionFilter, targetFilter]);

  const actionTypes = Array.from(new Set(getLogs().map(l => l.actionType)));
  const targetTypes = Array.from(new Set(getLogs().map(l => l.targetType)));

  const sysFiltered = useMemo(() => mockSystemLogs.filter(l => {
    if (filter !== "all" && l.level !== filter) return false;
    if (roleFilter !== "all" && l.userRole !== roleFilter) return false;
    if (search) { const q = search.toLowerCase(); return l.user.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.detail.toLowerCase().includes(q); }
    return true;
  }), [filter, roleFilter, search]);

  const paged = sysFiltered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(sysFiltered.length / PAGE_SIZE);

  const levelStats = useMemo(() => ({
    info: mockSystemLogs.filter(l => l.level === "info").length,
    warning: mockSystemLogs.filter(l => l.level === "warning").length,
    error: mockSystemLogs.filter(l => l.level === "error").length,
    security: mockSystemLogs.filter(l => l.level === "security").length,
  }), []);

  const handleExportSys = () => {
    const csv = ["ID,Heure,Utilisateur,Rôle,Action,Détail,Niveau,IP"].concat(sysFiltered.map(l => `${l.id},"${l.time}","${l.user}",${l.userRole},"${l.action}","${l.detail}",${l.level},${l.ip || "—"}`)).join("\n");
    const blob = new Blob([csv], { type: "text/csv" }); const url = URL.createObjectURL(blob);
    const el = document.createElement("a"); el.href = url; el.download = `system_logs_${new Date().toISOString().split("T")[0]}.csv`; el.click(); URL.revokeObjectURL(url);
    toast({ title: "Logs exportés" });
  };

  const handleExportAudit = () => {
    const csv = ["ID,Action,Cible,Résumé,Acteur,Date"].concat(auditLogs.map(l => `${l.id},${l.actionType},${l.targetType},"${l.summary}",${l.actorAdminName},${l.createdAt}`)).join("\n");
    const blob = new Blob([csv], { type: "text/csv" }); const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `audit_logs_${new Date().toISOString().split("T")[0]}.csv`; a.click(); URL.revokeObjectURL(url);
    toast({ title: "Export CSV téléchargé" });
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleString("fr-TN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <DashboardLayout role="admin" title="Journaux">
      <Tabs defaultValue="system" className="space-y-6">
        <TabsList>
          <TabsTrigger value="system">Journal système</TabsTrigger>
          <TabsTrigger value="audit">Audit logs</TabsTrigger>
        </TabsList>

        {/* ════ SYSTEM LOGS ════ */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Info", value: levelStats.info, cls: "bg-primary/5 text-primary" },
              { label: "Warning", value: levelStats.warning, cls: "bg-warning/5 text-warning" },
              { label: "Erreurs", value: levelStats.error, cls: "bg-destructive/5 text-destructive" },
              { label: "Sécurité", value: levelStats.security, cls: "bg-accent/5 text-accent" },
            ].map(s => (
              <div key={s.label} className={`rounded-xl border ${s.cls.split(" ")[0]} p-4 shadow-card text-center`}>
                <p className={`text-2xl font-bold ${s.cls.split(" ")[1]}`}>{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex gap-1 rounded-lg border bg-card p-0.5">
                {(["all", "info", "warning", "error", "security"] as LogLevel[]).map(l => (
                  <button key={l} onClick={() => { setFilter(l); setPage(0); }} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filter === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                    {l === "all" ? "Tous" : levelConfig[l]?.label || l}
                  </button>
                ))}
              </div>
              <div className="relative"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Rechercher..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="pl-9 h-9 w-56 text-xs" /></div>
              <Select value={roleFilter} onValueChange={v => { setRoleFilter(v); setPage(0); }}>
                <SelectTrigger className="w-32 h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous rôles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem><SelectItem value="doctor">Médecin</SelectItem>
                  <SelectItem value="patient">Patient</SelectItem><SelectItem value="pharmacy">Pharmacie</SelectItem>
                  <SelectItem value="laboratory">Laboratoire</SelectItem><SelectItem value="system">Système</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" className="text-xs" onClick={handleExportSys}><Download className="h-3.5 w-3.5 mr-1" />Exporter</Button>
          </div>
          <p className="text-xs text-muted-foreground">{sysFiltered.length} entrée(s)</p>
          <div className="rounded-xl border bg-card shadow-card divide-y">
            {paged.map(log => {
              const config = levelConfig[log.level] || levelConfig.info;
              const LogIcon = iconMap[log.action] || Settings;
              return (
                <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setDetailLog(log)}>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${config.class}`}><LogIcon className="h-4 w-4" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2"><p className="text-sm font-medium text-foreground">{log.action}</p><span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${config.class}`}>{config.label}</span></div>
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
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Page {page + 1} / {totalPages}</p>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-3.5 w-3.5" /></Button>
                <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ════ AUDIT LOGS ════ */}
        <TabsContent value="audit" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex gap-3 flex-1 flex-wrap">
              <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Rechercher..." value={auditSearch} onChange={e => setAuditSearch(e.target.value)} className="pl-10" /></div>
              {actionTypes.length > 0 && (
                <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="rounded-lg border bg-card px-3 py-2 text-sm"><option value="">Toutes actions</option>{actionTypes.map(t => <option key={t} value={t}>{t}</option>)}</select>
              )}
              {targetTypes.length > 0 && (
                <select value={targetFilter} onChange={e => setTargetFilter(e.target.value)} className="rounded-lg border bg-card px-3 py-2 text-sm"><option value="">Toutes cibles</option>{targetTypes.map(t => <option key={t} value={t}>{t}</option>)}</select>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs" onClick={refreshAudit}><RefreshCw className="h-3 w-3 mr-1" />Rafraîchir</Button>
              <Button variant="outline" size="sm" className="text-xs" onClick={handleExportAudit} disabled={auditLogs.length === 0}><Download className="h-3 w-3 mr-1" />Exporter CSV</Button>
              <Button variant="outline" size="sm" className="text-xs text-destructive" onClick={() => { clearLogs(); refreshAudit(); }}><Trash2 className="h-3 w-3 mr-1" />Vider</Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{auditLogs.length} entrée(s)</p>
          {auditLogs.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground"><Clock className="h-12 w-12 mx-auto mb-3 opacity-30" /><p className="font-medium">Aucun audit log</p><p className="text-xs mt-1">Les actions admin seront enregistrées ici automatiquement.</p></div>
          ) : (
            <div className="rounded-xl border bg-card shadow-card divide-y">
              {auditLogs.map(log => (
                <div key={log.id} className="px-5 py-4 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-2 mb-1"><span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">{log.actionType}</span><span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{log.targetType}</span></div>
                  <p className="text-sm text-foreground">{log.summary}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{log.actorAdminName} ({log.actorRole})</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(log.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* System log detail drawer */}
      <Sheet open={!!detailLog} onOpenChange={() => setDetailLog(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto"><SheetHeader><SheetTitle>Détail du log</SheetTitle></SheetHeader>
          {detailLog && (() => {
            const config = levelConfig[detailLog.level] || levelConfig.info;
            const LogIcon = iconMap[detailLog.action] || Settings;
            return (
              <div className="space-y-5 mt-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${config.class}`}><LogIcon className="h-5 w-5" /></div>
                  <div><p className="font-semibold text-foreground">{detailLog.action}</p><span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${config.class}`}>{config.label}</span></div>
                </div>
                <div className="rounded-lg border p-4 space-y-3">
                  {[
                    ["Utilisateur", detailLog.user], ["Rôle", detailLog.userRole], ["Horodatage", detailLog.time],
                    ...(detailLog.ip ? [["Adresse IP", detailLog.ip]] : []),
                    ...(detailLog.userAgent ? [["Navigateur", detailLog.userAgent]] : []),
                    ...(detailLog.duration ? [["Durée", detailLog.duration]] : []),
                  ].map(([l, v]) => (
                    <div key={l} className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{l}</span><span className="text-sm text-foreground">{v}</span></div>
                  ))}
                </div>
                <div className="rounded-lg border p-4"><p className="text-xs font-semibold text-muted-foreground mb-2">Description</p><p className="text-sm text-foreground leading-relaxed">{detailLog.detail}</p></div>
              </div>
            );
          })()}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default AdminLogs;
