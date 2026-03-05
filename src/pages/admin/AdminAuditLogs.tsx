import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import { Search, Clock, User, Download, Trash2, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getLogs, clearLogs, type AuditLogEntry } from "@/services/admin/adminAuditService";

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  const refresh = () => setLogs(getLogs({ search, actionType: actionFilter || undefined }));

  useEffect(() => { refresh(); }, [search, actionFilter]);

  const actionTypes = Array.from(new Set(getLogs().map(l => l.actionType)));

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("fr-TN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <DashboardLayout role="admin" title="Audit Logs">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
            {actionTypes.length > 0 && (
              <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="rounded-lg border bg-card px-3 py-2 text-sm">
                <option value="">Toutes actions</option>
                {actionTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={refresh}><RefreshCw className="h-3 w-3 mr-1" />Rafraîchir</Button>
            <Button variant="outline" size="sm" className="text-xs text-destructive" onClick={() => { clearLogs(); refresh(); }}><Trash2 className="h-3 w-3 mr-1" />Vider</Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">{logs.length} entrée(s) — persisté dans localStorage</p>

        {logs.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Aucun audit log</p>
            <p className="text-xs mt-1">Les actions admin seront enregistrées ici automatiquement.</p>
          </div>
        ) : (
          <div className="rounded-xl border bg-card shadow-card divide-y">
            {logs.map(log => (
              <div key={log.id} className="px-5 py-4 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">{log.actionType}</span>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{log.targetType}</span>
                </div>
                <p className="text-sm text-foreground">{log.summary}</p>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><User className="h-3 w-3" />{log.actorAdminName}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(log.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminAuditLogs;
