/**
 * AdminActions — Central admin action center with MotifDialog for dangerous actions + execution history
 * 3 actions connected to real logic: analytics refresh, test notification, reset demo
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import {
  Zap, Users, Shield, Activity, Database, Mail, Bell, Settings,
  RefreshCw, Download, Upload, Trash2, CheckCircle2, AlertTriangle,
  Play, Pause, Clock, BarChart3, Globe, Send, History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import MotifDialog from "@/components/admin/MotifDialog";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { appendLog } from "@/services/admin/adminAuditService";
import { pushNotification } from "@/stores/notificationsStore";
import { resetDemo } from "@/stores/seedStores";

interface ActionItem {
  id: string; label: string; desc: string; icon: any; color: string; category: string; dangerous?: boolean;
  realAction?: () => void;
}

interface ExecutionEntry {
  id: string; actionId: string; actionLabel: string; timestamp: string; status: "success" | "error"; motif?: string;
}

const HISTORY_KEY = "medicare_admin_action_history";
const MAX_HISTORY = 50;

const getHistory = (): ExecutionEntry[] => { try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; } };
const saveHistory = (entries: ExecutionEntry[]) => localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY)));

const AdminActions = () => {
  const [running, setRunning] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState<ExecutionEntry[]>(getHistory());
  const [motifTarget, setMotifTarget] = useState<ActionItem | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<ActionItem | null>(null);

  const executeAction = (action: ActionItem, motif?: string) => {
    setRunning(prev => new Set([...prev, action.id]));
    setTimeout(() => {
      setRunning(prev => { const n = new Set(prev); n.delete(action.id); return n; });

      // Execute real action if available
      if (action.realAction) {
        try { action.realAction(); } catch (e) { console.error(e); }
      }

      const entry: ExecutionEntry = {
        id: `exec-${Date.now()}`, actionId: action.id, actionLabel: action.label,
        timestamp: new Date().toISOString(), status: "success", motif,
      };
      const updated = [entry, ...history].slice(0, MAX_HISTORY);
      setHistory(updated);
      saveHistory(updated);
      appendLog("action_executed", "system", action.id, `Action "${action.label}" exécutée${motif ? ` — Motif : ${motif}` : ""}`);
      toast({ title: `✅ ${action.label}`, description: "Action exécutée avec succès." });
    }, 2000);
  };

  const handleActionClick = (action: ActionItem) => {
    if (action.dangerous) setMotifTarget(action);
    else setConfirmTarget(action);
  };

  const handleMotifConfirm = (motif: string) => { if (motifTarget) executeAction(motifTarget, motif); setMotifTarget(null); };
  const handleConfirm = () => { if (confirmTarget) executeAction(confirmTarget); setConfirmTarget(null); };

  const actions: ActionItem[] = [
    { id: "sync_users", label: "Synchroniser les utilisateurs", desc: "Vérifier la cohérence des comptes et profils", icon: Users, color: "text-primary", category: "Utilisateurs" },
    { id: "bulk_notify", label: "Notification en masse", desc: "Envoyer une notification push à tous les utilisateurs actifs", icon: Bell, color: "text-warning", category: "Utilisateurs" },
    { id: "export_users", label: "Export complet utilisateurs", desc: "Générer un export CSV de tous les comptes", icon: Download, color: "text-accent", category: "Utilisateurs" },
    { id: "purge_inactive", label: "Purger comptes inactifs", desc: "Supprimer les comptes inactifs depuis > 12 mois", icon: Trash2, color: "text-destructive", category: "Utilisateurs", dangerous: true },
    { id: "clear_cache", label: "Vider le cache plateforme", desc: "Invalider tous les caches (sessions, données, requêtes)", icon: RefreshCw, color: "text-primary", category: "Plateforme" },
    { id: "maintenance_on", label: "Activer mode maintenance", desc: "Mettre la plateforme en maintenance programmée", icon: Pause, color: "text-warning", category: "Plateforme", dangerous: true },
    { id: "maintenance_off", label: "Désactiver mode maintenance", desc: "Remettre la plateforme en production", icon: Play, color: "text-accent", category: "Plateforme" },
    { id: "reindex_search", label: "Réindexer la recherche", desc: "Reconstruire l'index de recherche (médecins, médicaments)", icon: Database, color: "text-primary", category: "Plateforme" },
    { id: "rotate_keys", label: "Rotation des clés API", desc: "Regénérer toutes les clés API expirées", icon: Shield, color: "text-warning", category: "Sécurité", dangerous: true },
    { id: "force_logout_all", label: "Déconnecter tous les utilisateurs", desc: "Invalider toutes les sessions actives", icon: AlertTriangle, color: "text-destructive", category: "Sécurité", dangerous: true },
    { id: "audit_export", label: "Export audit logs", desc: "Télécharger les 90 derniers jours de logs d'audit", icon: Download, color: "text-accent", category: "Sécurité" },
    // ── 3 actions connectées à la logique réelle ──
    {
      id: "analytics_refresh", label: "Recalculer les statistiques", desc: "Forcer le re-calcul de tous les KPIs et tableaux de bord",
      icon: BarChart3, color: "text-accent", category: "Données",
      realAction: () => {
        // Force re-render by dispatching storage event
        window.dispatchEvent(new Event("storage"));
        toast({ title: "Statistiques recalculées", description: "Les KPIs ont été rafraîchis depuis le store." });
      },
    },
    {
      id: "test_notification", label: "Envoyer une notification test", desc: "Créer une notification de test dans le système",
      icon: Bell, color: "text-primary", category: "Communication",
      realAction: () => {
        pushNotification({
          type: "system",
          title: "🔔 Notification test admin",
          message: "Ceci est une notification de test envoyée depuis le centre d'actions admin.",
          targetRole: "admin",
        });
      },
    },
    {
      id: "reset_demo", label: "Réinitialiser les données démo", desc: "Supprimer toutes les données et re-seeder avec les données démo",
      icon: RefreshCw, color: "text-destructive", category: "Données", dangerous: true,
      realAction: () => {
        resetDemo();
        toast({ title: "Données réinitialisées", description: "Toutes les données ont été remises à zéro. Rechargez la page." });
        setTimeout(() => window.location.reload(), 1500);
      },
    },
    { id: "send_campaign", label: "Envoyer campagne email", desc: "Envoyer la campagne email en attente à tous les abonnés", icon: Send, color: "text-primary", category: "Communication" },
    { id: "test_email", label: "Tester la configuration email", desc: "Envoyer un email de test à l'admin", icon: Mail, color: "text-accent", category: "Communication" },
    { id: "backup_db", label: "Backup base de données", desc: "Créer un snapshot complet de la base de données", icon: Database, color: "text-accent", category: "Données" },
    { id: "import_meds", label: "Importer base médicaments", desc: "Mettre à jour la base de médicaments depuis la source officielle", icon: Upload, color: "text-primary", category: "Données" },
    { id: "sitemap_regen", label: "Regénérer sitemap", desc: "Recréer le sitemap pour les moteurs de recherche", icon: Globe, color: "text-muted-foreground", category: "Données" },
  ];

  const categories = [...new Set(actions.map(a => a.category))];
  const filteredActions = search ? actions.filter(a => a.label.toLowerCase().includes(search.toLowerCase()) || a.desc.toLowerCase().includes(search.toLowerCase())) : actions;
  const groupedActions = categories.map(c => ({ category: c, items: filteredActions.filter(a => a.category === c) })).filter(g => g.items.length > 0);

  const formatTime = (iso: string) => new Date(iso).toLocaleString("fr-TN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <DashboardLayout role="admin" title="Centre d'actions">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><Zap className="h-5 w-5 text-warning" />Centre d'actions</h2>
            <p className="text-sm text-muted-foreground">{actions.length} actions disponibles · {running.size} en cours</p>
          </div>
          <div className="relative w-64"><Activity className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Rechercher une action..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-9 text-xs" /></div>
        </div>

        {groupedActions.map(g => (
          <div key={g.category}>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Settings className="h-4 w-4 text-primary" />{g.category}</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map(a => {
                const isRunning = running.has(a.id);
                return (
                  <div key={a.id} className={`rounded-xl border bg-card p-4 shadow-card transition-all ${isRunning ? "ring-2 ring-primary/30 bg-primary/5" : "hover:shadow-md"}`}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${a.dangerous ? "bg-destructive/10" : "bg-muted"}`}><a.icon className={`h-4 w-4 ${a.color}`} /></div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-foreground">{a.label}</h4>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{a.desc}</p>
                          {a.realAction && <span className="text-[10px] text-accent font-medium">✓ Action connectée</span>}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant={a.dangerous ? "destructive" : "outline"} className="w-full text-xs h-8" disabled={isRunning} onClick={() => handleActionClick(a)}>
                      {isRunning ? <><RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />En cours...</> : <><Play className="h-3.5 w-3.5 mr-1" />Exécuter</>}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filteredActions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground"><Zap className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" /><p>Aucune action trouvée</p></div>
        )}

        {history.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><History className="h-4 w-4 text-primary" />Dernières exécutions</h3>
            <div className="rounded-xl border bg-card shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Action</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs hidden sm:table-cell">Motif</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Date</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Statut</th>
                  </tr></thead>
                  <tbody>
                    {history.slice(0, 15).map(e => (
                      <tr key={e.id} className="border-b last:border-0">
                        <td className="px-4 py-2.5 text-foreground text-xs font-medium">{e.actionLabel}</td>
                        <td className="px-4 py-2.5 text-muted-foreground text-xs hidden sm:table-cell truncate max-w-[200px]">{e.motif || "—"}</td>
                        <td className="px-4 py-2.5 text-muted-foreground text-xs">{formatTime(e.timestamp)}</td>
                        <td className="px-4 py-2.5"><span className="inline-flex items-center gap-1 text-xs text-accent"><CheckCircle2 className="h-3 w-3" />OK</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <MotifDialog open={!!motifTarget} onClose={() => setMotifTarget(null)} onConfirm={handleMotifConfirm}
        title={`Exécuter : ${motifTarget?.label}`} description={`⚠️ Action dangereuse — ${motifTarget?.desc}`} confirmLabel="Exécuter" destructive />
      <ConfirmDialog open={!!confirmTarget} onCancel={() => setConfirmTarget(null)} onConfirm={handleConfirm}
        title={`Exécuter : ${confirmTarget?.label}`} description={confirmTarget?.desc || ""} confirmLabel="Exécuter" />
    </DashboardLayout>
  );
};

export default AdminActions;
