/**
 * AdminModules — Full control panel for admin to toggle platform modules.
 * Each toggle instantly affects ALL roles across the entire platform.
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import ModuleCustomization from "@/components/admin/ModuleCustomization";
import {
  ShieldCheck, Search, ToggleLeft, ToggleRight, AlertTriangle, CheckCircle2,
  Calendar, Video, FileText, MessageSquare, Bell, FlaskConical, Pill,
  Building2, Banknote, Bot, Plug, BarChart3, Users, Globe, Activity,
  Heart, Stethoscope, Power, PowerOff, RefreshCw, Info, Filter, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import {
  useAdminModules, platformModules, toggleModule, setModuleStates,
  type ModuleStates, type PlatformModule,
} from "@/stores/adminModulesStore";

const categoryConfig: Record<string, { label: string; icon: any; color: string }> = {
  core:          { label: "Noyau",          icon: Activity,      color: "text-primary" },
  clinical:      { label: "Clinique",       icon: Stethoscope,   color: "text-accent" },
  communication: { label: "Communication",  icon: MessageSquare, color: "text-warning" },
  professional:  { label: "Professionnel",  icon: Building2,     color: "text-primary" },
  finance:       { label: "Finance",        icon: Banknote,      color: "text-accent" },
  public:        { label: "Public",         icon: Globe,         color: "text-muted-foreground" },
};

const moduleIcons: Record<string, any> = {
  appointments: Calendar,
  consultations: Stethoscope,
  teleconsultation: Video,
  prescriptions: FileText,
  patient_health: Heart,
  patient_records: Users,
  messaging: MessageSquare,
  notifications: Bell,
  laboratory: FlaskConical,
  pharmacy: Pill,
  secretary: Building2,
  billing: Banknote,
  ai_assistant: Bot,
  doctor_connect: Plug,
  doctor_stats: BarChart3,
  doctor_secretary_mgmt: Building2,
  public_directories: Globe,
  public_profiles: Users,
};

const AdminModules = () => {
  const [states, setStates] = useAdminModules();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [confirmToggle, setConfirmToggle] = useState<{ mod: PlatformModule; enable: boolean } | null>(null);
  const [activeTab, setActiveTab] = useState<"modules" | "customize">("modules");

  const categories = useMemo(() => [...new Set(platformModules.map(m => m.category))], []);

  const filtered = useMemo(() => {
    return platformModules.filter(mod => {
      if (filterCategory !== "all" && mod.category !== filterCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        return mod.label.toLowerCase().includes(q) || mod.description.toLowerCase().includes(q) ||
               mod.affectedRoles.some(r => r.includes(q));
      }
      return true;
    });
  }, [search, filterCategory]);

  const grouped = useMemo(() => {
    const groups: Record<string, PlatformModule[]> = {};
    filtered.forEach(mod => {
      if (!groups[mod.category]) groups[mod.category] = [];
      groups[mod.category].push(mod);
    });
    return groups;
  }, [filtered]);

  const enabledCount = Object.values(states).filter(Boolean).length;
  const disabledCount = platformModules.length - enabledCount;

  const handleToggle = (mod: PlatformModule) => {
    const newState = states[mod.id] === false;
    if (mod.critical && !newState) {
      setConfirmToggle({ mod, enable: false });
      return;
    }
    toggleModule(mod.id, newState, "Admin");
    toast({
      title: newState ? `✅ ${mod.label} activé` : `⛔ ${mod.label} désactivé`,
      description: newState
        ? `Le module est maintenant accessible pour ${mod.affectedRoles.join(", ") || "tous"}.`
        : `Le module est masqué pour ${mod.affectedRoles.join(", ") || "tous"}. Les pages afficheront un écran de maintenance.`,
    });
  };

  const handleConfirmDisable = () => {
    if (!confirmToggle) return;
    toggleModule(confirmToggle.mod.id, confirmToggle.enable, "Admin");
    toast({
      title: `⛔ ${confirmToggle.mod.label} désactivé`,
      description: `Module critique désactivé. Impact sur : ${confirmToggle.mod.affectedRoles.join(", ")}.`,
    });
    setConfirmToggle(null);
  };

  const handleEnableAll = () => {
    const allOn: ModuleStates = {};
    platformModules.forEach(m => { allOn[m.id] = true; });
    setModuleStates(allOn);
    toast({ title: "✅ Tous les modules activés" });
  };

  const handleDisableNonCritical = () => {
    const updated: ModuleStates = { ...states };
    platformModules.forEach(m => {
      if (!m.critical) updated[m.id] = false;
    });
    setModuleStates(updated);
    toast({ title: "⛔ Modules non-critiques désactivés", description: "Les modules critiques restent actifs." });
  };

  return (
    <DashboardLayout role="admin" title="Gestion des Modules">
      <div className="space-y-6">
        {/* Header stats */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border bg-accent/5 border-accent/20 p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Power className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">{enabledCount}</p>
              <p className="text-xs text-muted-foreground">Modules actifs</p>
            </div>
          </div>
          <div className="rounded-xl border bg-destructive/5 border-destructive/20 p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <PowerOff className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">{disabledCount}</p>
              <p className="text-xs text-muted-foreground">Modules inactifs</p>
            </div>
          </div>
          <div className="rounded-xl border p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
              <Zap className="h-6 w-6 text-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{platformModules.length}</p>
              <p className="text-xs text-muted-foreground">Total modules</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Rechercher un module..." className="pl-9 h-9 w-56 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-0.5 rounded-lg border bg-card p-0.5">
              <button onClick={() => setFilterCategory("all")}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filterCategory === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                Tous
              </button>
              {categories.map(cat => {
                const cfg = categoryConfig[cat];
                return (
                  <button key={cat} onClick={() => setFilterCategory(cat)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1 ${filterCategory === cat ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={handleEnableAll}>
              <Power className="h-3.5 w-3.5 mr-1" />Tout activer
            </Button>
            <Button variant="outline" size="sm" className="text-xs text-destructive hover:text-destructive" onClick={handleDisableNonCritical}>
              <PowerOff className="h-3.5 w-3.5 mr-1" />Désactiver non-critiques
            </Button>
          </div>
        </div>

        {/* Module groups */}
        {Object.entries(grouped).map(([cat, mods]) => {
          const cfg = categoryConfig[cat];
          const CatIcon = cfg?.icon || Activity;
          return (
            <div key={cat} className="space-y-3">
              <div className="flex items-center gap-2">
                <CatIcon className={`h-4 w-4 ${cfg?.color || "text-foreground"}`} />
                <h3 className="text-sm font-semibold text-foreground">{cfg?.label || cat}</h3>
                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{mods.length}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {mods.map(mod => {
                  const enabled = states[mod.id] !== false;
                  const Icon = moduleIcons[mod.id] || Activity;
                  return (
                    <div key={mod.id}
                      className={`rounded-xl border bg-card shadow-card p-4 transition-all ${
                        enabled ? "hover:shadow-card-hover" : "opacity-60 bg-muted/30"
                      }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                            enabled ? "bg-primary/10" : "bg-muted"
                          }`}>
                            <Icon className={`h-5 w-5 ${enabled ? "text-primary" : "text-muted-foreground"}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-semibold text-foreground truncate">{mod.label}</h4>
                              {mod.critical && (
                                <span className="text-[9px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-medium shrink-0">CRITIQUE</span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{mod.description}</p>
                          </div>
                        </div>
                        {/* Toggle */}
                        <button
                          onClick={() => handleToggle(mod)}
                          className={`shrink-0 mt-1 transition-colors ${
                            enabled ? "text-accent" : "text-muted-foreground"
                          }`}
                          title={enabled ? "Désactiver" : "Activer"}
                        >
                          {enabled ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7" />}
                        </button>
                      </div>

                      {/* Affected roles */}
                      {mod.affectedRoles.length > 0 && (
                        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-muted-foreground">Impact :</span>
                          {mod.affectedRoles.map(r => (
                            <span key={r} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                              enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                            }`}>
                              {r === "patient" ? "Patient" : r === "doctor" ? "Médecin" : r === "pharmacy" ? "Pharmacie" :
                               r === "laboratory" ? "Laboratoire" : r === "secretary" ? "Secrétaire" : r}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Disabled banner */}
                      {!enabled && (
                        <div className="mt-3 rounded-lg bg-destructive/5 border border-destructive/20 px-3 py-2 flex items-center gap-2">
                          <PowerOff className="h-3.5 w-3.5 text-destructive shrink-0" />
                          <p className="text-[10px] text-destructive">
                            Désactivé — {mod.sidebarUrls.length} lien(s) sidebar masqué(s), {mod.routePrefixes.length} page(s) en maintenance
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Filter className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Aucun module trouvé</p>
          </div>
        )}

        {/* Info banner */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Fonctionnement des modules</p>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1.5">
                <li>• <strong>Désactiver un module</strong> masque ses liens dans la sidebar de tous les rôles concernés.</li>
                <li>• Les pages du module affichent un <strong>écran de maintenance</strong> au lieu du contenu.</li>
                <li>• Les <strong>workflows cross-rôle</strong> sont bloqués (ex: si les ordonnances sont désactivées, le pharmacien ne peut pas recevoir d'ordonnances).</li>
                <li>• Les modules <strong>critiques</strong> nécessitent une confirmation avant désactivation.</li>
                <li>• Les changements prennent effet <strong>immédiatement</strong> sur tous les onglets.</li>
                <li>• Chaque activation/désactivation est <strong>tracée dans les audit logs</strong>.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm critical disable dialog */}
      <ConfirmDialog
        open={!!confirmToggle}
        title={`Désactiver ${confirmToggle?.mod.label} ?`}
        description={`Ce module est marqué comme critique. Sa désactivation affectera ${confirmToggle?.mod.affectedRoles.join(", ")}. Les pages associées afficheront un écran de maintenance. Cette action est tracée.`}
        confirmLabel="Désactiver quand même"
        variant="danger"
        onConfirm={handleConfirmDisable}
        onCancel={() => setConfirmToggle(null)}
      />
    </DashboardLayout>
  );
};

export default AdminModules;
