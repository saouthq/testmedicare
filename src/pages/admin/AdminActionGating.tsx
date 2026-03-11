/**
 * AdminActionGating — Granular admin control over every action/button/feature per role.
 * Allows admin to enable/disable individual actions across the entire platform.
 *
 * // TODO BACKEND: Replace with GET/PUT /api/admin/action-gating
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import {
  useActionGatingStore, actionCatalog, toggleAction, toggleAllForRole,
  toggleCategoryForRole, resetActionGating, getRoleStats,
  type ActionDef,
} from "@/stores/actionGatingStore";
import {
  Search, ToggleLeft, ToggleRight, RotateCcw, Shield, Power, PowerOff,
  ChevronDown, ChevronRight, Eye, EyeOff, Filter, Zap, AlertTriangle,
  Users, Stethoscope, Building2, Pill, FlaskConical, Activity, Globe,
  Calendar, MessageSquare, FileText, Video, BarChart3, Heart, Bot,
  CreditCard, FolderOpen, UserPlus, ClipboardList, Banknote,
} from "lucide-react";

const roleConfig: Record<string, { label: string; icon: any; color: string }> = {
  patient:    { label: "Patient",     icon: Users,       color: "text-blue-500" },
  doctor:     { label: "Médecin",     icon: Stethoscope, color: "text-primary" },
  secretary:  { label: "Secrétaire",  icon: UserPlus,    color: "text-orange-500" },
  pharmacy:   { label: "Pharmacie",   icon: Pill,        color: "text-green-500" },
  laboratory: { label: "Laboratoire", icon: FlaskConical, color: "text-purple-500" },
  hospital:   { label: "Hôpital",     icon: Building2,   color: "text-red-500" },
  clinic:     { label: "Clinique",    icon: Activity,    color: "text-teal-500" },
  public:     { label: "Public",      icon: Globe,       color: "text-muted-foreground" },
};

const categoryIcons: Record<string, any> = {
  "Rendez-vous": Calendar, "Planning": Calendar, "Salle d'attente": ClipboardList,
  "Santé": Heart, "Ordonnances": FileText, "Téléconsultation": Video,
  "Communication": MessageSquare, "Profil": Users, "Consultations": Stethoscope,
  "Facturation": Banknote, "Cabinet": Building2, "IA & Outils": Bot,
  "Statistiques": BarChart3, "Patients": Users, "Documents": FolderOpen,
  "Stock": Pill, "Historique": ClipboardList, "Organisation": Building2,
  "Analyses": FlaskConical, "Qualité": Shield, "Recherche": Search,
  "Réservation": Calendar, "Annuaires": Globe,
};

const AdminActionGating = () => {
  const [states] = useActionGatingStore();
  const [selectedRole, setSelectedRole] = useState("patient");
  const [search, setSearch] = useState("");
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<{ action: ActionDef; enable: boolean } | null>(null);

  // Filter actions for selected role
  const roleActions = useMemo(() => {
    return actionCatalog.filter(a => {
      if (a.role !== selectedRole) return false;
      if (search) {
        const q = search.toLowerCase();
        return a.label.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [selectedRole, search]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, ActionDef[]> = {};
    roleActions.forEach(a => {
      if (!groups[a.category]) groups[a.category] = [];
      groups[a.category].push(a);
    });
    return groups;
  }, [roleActions]);

  const stats = useMemo(() => getRoleStats(selectedRole), [selectedRole, states]);

  const toggleCollapse = (cat: string) => {
    setCollapsedCats(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const handleToggle = (action: ActionDef) => {
    const newState = states[action.id] === false; // currently disabled → enable
    if (action.critical && !newState) {
      setConfirmAction({ action, enable: false });
      return;
    }
    toggleAction(action.id, newState);
    toast({
      title: newState ? `✅ ${action.label}` : `⛔ ${action.label}`,
      description: `${newState ? "Activée" : "Désactivée"} pour ${roleConfig[selectedRole]?.label}`,
    });
  };

  const handleConfirmDisable = () => {
    if (!confirmAction) return;
    toggleAction(confirmAction.action.id, false);
    toast({
      title: `⛔ ${confirmAction.action.label} désactivée`,
      description: "Action critique désactivée. Cela peut impacter les workflows principaux.",
    });
    setConfirmAction(null);
  };

  const handleToggleCategory = (cat: string, enable: boolean) => {
    toggleCategoryForRole(selectedRole, cat, enable);
    toast({
      title: enable ? `✅ Catégorie "${cat}" activée` : `⛔ Catégorie "${cat}" désactivée`,
      description: `Pour ${roleConfig[selectedRole]?.label}`,
    });
  };

  const handleToggleAll = (enable: boolean) => {
    toggleAllForRole(selectedRole, enable);
    toast({
      title: enable ? "✅ Toutes les actions activées" : "⛔ Toutes les actions désactivées",
      description: `Pour ${roleConfig[selectedRole]?.label}`,
    });
  };

  const handleReset = () => {
    resetActionGating();
    toast({ title: "Configuration réinitialisée", description: "Toutes les actions sont à nouveau activées." });
  };

  return (
    <DashboardLayout role="admin" title="Contrôle Granulaire des Fonctionnalités">
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Contrôle granulaire des actions</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Activez ou désactivez chaque bouton, action et fonctionnalité individuellement pour chaque rôle.
                Les changements prennent effet immédiatement sur toute la plateforme.
              </p>
            </div>
          </div>
        </div>

        {/* Role stats overview */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
          {Object.entries(roleConfig).map(([role, cfg]) => {
            const rs = getRoleStats(role);
            const RIcon = cfg.icon;
            const isSelected = selectedRole === role;
            return (
              <button
                key={role}
                onClick={() => { setSelectedRole(role); setSearch(""); }}
                className={`rounded-xl border p-3 text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "hover:border-primary/30 bg-card"
                }`}
              >
                <RIcon className={`h-4 w-4 mb-1 ${isSelected ? "text-primary" : cfg.color}`} />
                <p className={`text-xs font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>{cfg.label}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[10px] text-accent font-medium">{rs.enabled}</span>
                  <span className="text-[10px] text-muted-foreground">/</span>
                  <span className="text-[10px] text-muted-foreground">{rs.total}</span>
                  {rs.disabled > 0 && (
                    <span className="text-[10px] text-destructive font-medium ml-auto">-{rs.disabled}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher une action..."
                className="pl-9 h-9 w-64 text-xs"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {roleActions.length} action{roleActions.length > 1 ? "s" : ""} ·{" "}
              <span className="text-accent font-medium">{stats.enabled} active{stats.enabled > 1 ? "s" : ""}</span>
              {stats.disabled > 0 && (
                <> · <span className="text-destructive font-medium">{stats.disabled} désactivée{stats.disabled > 1 ? "s" : ""}</span></>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => handleToggleAll(true)}>
              <Power className="h-3.5 w-3.5 mr-1" />Tout activer
            </Button>
            <Button variant="outline" size="sm" className="text-xs text-destructive hover:text-destructive" onClick={() => handleToggleAll(false)}>
              <PowerOff className="h-3.5 w-3.5 mr-1" />Tout désactiver
            </Button>
            <Button variant="ghost" size="sm" className="text-xs" onClick={handleReset}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" />Reset global
            </Button>
          </div>
        </div>

        {/* Categories + Actions */}
        <div className="space-y-4">
          {Object.entries(grouped).map(([cat, actions]) => {
            const collapsed = collapsedCats.has(cat);
            const CatIcon = categoryIcons[cat] || Activity;
            const enabledInCat = actions.filter(a => states[a.id] !== false).length;
            const allEnabled = enabledInCat === actions.length;
            const noneEnabled = enabledInCat === 0;

            return (
              <div key={cat} className="rounded-xl border bg-card shadow-card overflow-hidden">
                {/* Category header */}
                <div className="px-4 py-3 bg-muted/30 border-b flex items-center justify-between">
                  <button
                    onClick={() => toggleCollapse(cat)}
                    className="flex items-center gap-2 text-left flex-1"
                  >
                    {collapsed
                      ? <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    }
                    <CatIcon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">{cat}</span>
                    <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                      {enabledInCat}/{actions.length}
                    </span>
                    {noneEnabled && (
                      <span className="text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-medium">
                        Tout désactivé
                      </span>
                    )}
                  </button>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleToggleCategory(cat, true)}
                      className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
                        allEnabled ? "bg-accent/10 text-accent" : "text-muted-foreground hover:text-accent hover:bg-accent/10"
                      }`}
                      title="Tout activer"
                    >
                      <Eye className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleToggleCategory(cat, false)}
                      className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
                        noneEnabled ? "bg-destructive/10 text-destructive" : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      }`}
                      title="Tout désactiver"
                    >
                      <EyeOff className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Actions list */}
                {!collapsed && (
                  <div className="divide-y">
                    {actions.map(action => {
                      const enabled = states[action.id] !== false;
                      return (
                        <div
                          key={action.id}
                          className={`flex items-center justify-between px-4 py-2.5 transition-colors ${
                            enabled ? "hover:bg-muted/20" : "bg-muted/10 opacity-70"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className={`text-sm font-medium ${enabled ? "text-foreground" : "text-muted-foreground line-through"}`}>
                                {action.label}
                              </p>
                              {action.critical && (
                                <span className="text-[9px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-medium shrink-0">
                                  CRITIQUE
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{action.description}</p>
                          </div>
                          <button
                            onClick={() => handleToggle(action)}
                            className={`shrink-0 ml-3 transition-colors ${
                              enabled ? "text-accent" : "text-muted-foreground"
                            }`}
                            title={enabled ? "Désactiver" : "Activer"}
                          >
                            {enabled
                              ? <ToggleRight className="h-6 w-6" />
                              : <ToggleLeft className="h-6 w-6" />
                            }
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {roleActions.length === 0 && (
          <div className="text-center py-12">
            <Filter className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Aucune action trouvée</p>
          </div>
        )}

        {/* Info */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Comment ça fonctionne</p>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1.5">
                <li>• Chaque action représente un <strong>bouton, une fonctionnalité ou un workflow</strong> spécifique dans l'interface.</li>
                <li>• Désactiver une action la <strong>masque ou la grise</strong> dans l'interface du rôle concerné.</li>
                <li>• Les actions marquées <strong>"CRITIQUE"</strong> nécessitent une confirmation car elles impactent les workflows principaux.</li>
                <li>• Utilisez les boutons <strong>catégorie</strong> (œil) pour activer/désactiver une catégorie entière d'un coup.</li>
                <li>• Ce contrôle est <strong>complémentaire</strong> aux modules (macro) et à la sidebar (navigation). Ici c'est le niveau <strong>micro</strong>.</li>
                <li>• Tous les changements sont <strong>tracés dans les audit logs</strong> et prennent effet immédiatement.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmAction}
        title={`Désactiver "${confirmAction?.action.label}" ?`}
        description={`Cette action est critique. La désactiver peut impacter les workflows principaux du rôle ${roleConfig[selectedRole]?.label}. Cette action est tracée dans les logs d'audit.`}
        confirmLabel="Désactiver quand même"
        variant="danger"
        onConfirm={handleConfirmDisable}
        onCancel={() => setConfirmAction(null)}
      />
    </DashboardLayout>
  );
};

export default AdminActionGating;
