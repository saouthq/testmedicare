/**
 * Admin Feature Matrix — Control features per activity type, specialty, and plan
 * Uses shared featureMatrixStore as single source of truth
 * Changes here reflect on BecomePartner pricing cards and AdminVerifications
 * TODO BACKEND: Replace with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import {
  Layers, Save, CheckCircle, Search, RotateCcw, Copy, Filter,
  Stethoscope, FlaskConical, Pill, Building2, ChevronDown, ChevronRight,
  ToggleLeft, ToggleRight, AlertTriangle, Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";
import {
  activities,
  plansByActivity,
  featureCatalog,
  buildDefaultState,
  getFullMatrix,
  getFullOverrides,
  saveMatrix,
  saveOverrides,
  type ActivityType,
  type PlanTier,
  type FeatureState,
  type SpecialtyOverrides,
} from "@/stores/featureMatrixStore";

// Icons per activity
const activityIcons: Record<ActivityType, any> = {
  generaliste: Stethoscope, specialiste: Stethoscope, dentiste: Stethoscope,
  kine: Stethoscope, laboratory: FlaskConical, pharmacy: Pill, clinic: Building2,
};

const AdminFeatureMatrix = () => {
  const [activity, setActivity] = useState<ActivityType>("generaliste");
  const [specialty, setSpecialty] = useState<string>("");
  const [search, setSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(featureCatalog.map(f => f.category)));
  const [saved, setSaved] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Load from shared store (persisted in localStorage)
  const [statesByActivity, setStatesByActivity] = useState<Record<ActivityType, FeatureState>>(getFullMatrix);
  const [specialtyOverrides, setSpecialtyOverrides] = useState<Record<ActivityType, SpecialtyOverrides>>(getFullOverrides);

  const currentPlans = plansByActivity[activity];
  const currentActivity = activities.find(a => a.id === activity)!;
  const categories = useMemo(() => [...new Set(featureCatalog.map(f => f.category))], []);

  // Get effective state (specialty override > activity default)
  const getEffectiveState = (): FeatureState => {
    const base = statesByActivity[activity];
    if (specialty && specialty !== "__all__" && specialtyOverrides[activity][specialty]) {
      const overridesMap = specialtyOverrides[activity][specialty];
      const merged: FeatureState = {};
      Object.keys(base).forEach(fId => {
        merged[fId] = { ...base[fId], ...(overridesMap[fId] || {}) };
      });
      return merged;
    }
    return base;
  };

  const effectiveState = getEffectiveState();

  // Filter features
  const filteredFeatures = useMemo(() => {
    let list = [...featureCatalog];
    if (filterCategory !== "all") list = list.filter(f => f.category === filterCategory);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(f => f.label.toLowerCase().includes(q) || f.description.toLowerCase().includes(q));
    }
    return list;
  }, [search, filterCategory]);

  const groupedFeatures = useMemo(() => {
    const grouped: Record<string, typeof featureCatalog> = {};
    filteredFeatures.forEach(f => {
      if (!grouped[f.category]) grouped[f.category] = [];
      grouped[f.category].push(f);
    });
    return grouped;
  }, [filteredFeatures]);

  const toggleFeature = (featureId: string, plan: PlanTier) => {
    if (specialty && specialty !== "__all__") {
      setSpecialtyOverrides(prev => {
        const actOverrides = { ...prev[activity] };
        if (!actOverrides[specialty]) actOverrides[specialty] = {};
        const specOverride = { ...actOverrides[specialty] };
        if (!specOverride[featureId]) specOverride[featureId] = {};
        specOverride[featureId] = { ...specOverride[featureId], [plan]: !effectiveState[featureId]?.[plan] };
        actOverrides[specialty] = specOverride;
        return { ...prev, [activity]: actOverrides };
      });
    } else {
      setStatesByActivity(prev => {
        const actState = { ...prev[activity] };
        actState[featureId] = { ...actState[featureId], [plan]: !actState[featureId]?.[plan] };
        return { ...prev, [activity]: actState };
      });
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category); else next.add(category);
      return next;
    });
  };

  const enableAllInCategory = (category: string, plan: PlanTier) => {
    const features = featureCatalog.filter(f => f.category === category);
    if (specialty && specialty !== "__all__") {
      setSpecialtyOverrides(prev => {
        const actOverrides = { ...prev[activity] };
        if (!actOverrides[specialty]) actOverrides[specialty] = {};
        const specOverride = { ...actOverrides[specialty] };
        features.forEach(f => {
          if (!specOverride[f.id]) specOverride[f.id] = {};
          specOverride[f.id] = { ...specOverride[f.id], [plan]: true };
        });
        actOverrides[specialty] = specOverride;
        return { ...prev, [activity]: actOverrides };
      });
    } else {
      setStatesByActivity(prev => {
        const actState = { ...prev[activity] };
        features.forEach(f => {
          actState[f.id] = { ...actState[f.id], [plan]: true };
        });
        return { ...prev, [activity]: actState };
      });
    }
    toast({ title: `Toutes les fonctionnalités "${category}" activées pour ${currentPlans.find(p => p.id === plan)?.label}` });
  };

  const copyFromActivity = (source: ActivityType) => {
    setStatesByActivity(prev => ({
      ...prev,
      [activity]: { ...prev[source] },
    }));
    toast({ title: `Configuration copiée depuis "${activities.find(a => a.id === source)?.label}"` });
  };

  const resetToDefaults = () => {
    setStatesByActivity(prev => ({
      ...prev,
      [activity]: buildDefaultState(activity),
    }));
    if (specialty && specialty !== "__all__") {
      setSpecialtyOverrides(prev => {
        const actOverrides = { ...prev[activity] };
        delete actOverrides[specialty];
        return { ...prev, [activity]: actOverrides };
      });
    }
    toast({ title: "Configuration réinitialisée" });
  };

  const handleSave = () => {
    // Persist to localStorage so BecomePartner and AdminVerifications read it
    saveMatrix(statesByActivity);
    saveOverrides(specialtyOverrides);

    const label = specialty && specialty !== "__all__"
      ? `${currentActivity.label} — ${specialty}`
      : currentActivity.label;
    appendLog("feature_matrix_updated", "system", activity, `Matrice de fonctionnalités mise à jour pour ${label}`);
    setSaved(true);
    toast({ title: "Matrice sauvegardée", description: `${label} — Les changements sont visibles sur la page d'inscription` });
    setTimeout(() => setSaved(false), 2000);
  };

  // Stats
  const enabledCount = useMemo(() => {
    let count = 0;
    Object.values(effectiveState).forEach(plans => {
      Object.values(plans).forEach(v => { if (v) count++; });
    });
    return count;
  }, [effectiveState]);

  const totalSlots = featureCatalog.length * currentPlans.length;

  const Toggle = ({ enabled, onChange, size = "md" }: { enabled: boolean; onChange: () => void; size?: "sm" | "md" }) => (
    <button onClick={onChange} className="flex items-center transition-transform hover:scale-110">
      {enabled
        ? <ToggleRight className={`${size === "sm" ? "h-5 w-5" : "h-6 w-6"} text-primary`} />
        : <ToggleLeft className={`${size === "sm" ? "h-5 w-5" : "h-6 w-6"} text-muted-foreground`} />
      }
    </button>
  );

  return (
    <DashboardLayout role="admin" title="Matrice des fonctionnalités">
      <div className="space-y-6">
        {/* Header bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Contrôle des fonctionnalités par activité & plan
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Les modifications se reflètent sur la page d'inscription et le comparatif des plans.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
              {enabledCount}/{totalSlots} actifs
            </span>
            {saved && <span className="flex items-center gap-1 text-sm text-accent"><CheckCircle className="h-4 w-4" />Sauvegardé</span>}
            <Button variant="outline" size="sm" onClick={resetToDefaults}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" />Réinitialiser
            </Button>
            <Button className="gradient-primary text-primary-foreground" size="sm" onClick={handleSave}>
              <Save className="h-3.5 w-3.5 mr-1" />Enregistrer
            </Button>
          </div>
        </div>

        {/* Selectors */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Type d'activité</label>
            <Select value={activity} onValueChange={v => { setActivity(v as ActivityType); setSpecialty(""); }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {activities.map(a => {
                  const Icon = activityIcons[a.id];
                  return (
                    <SelectItem key={a.id} value={a.id}>
                      <span className="flex items-center gap-2"><Icon className="h-4 w-4" />{a.label}</span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-card">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              Spécialité {!currentActivity.specialties && <span className="text-muted-foreground/50">(N/A)</span>}
            </label>
            {currentActivity.specialties ? (
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Par défaut (toutes)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Par défaut (toutes spécialités)</SelectItem>
                  {currentActivity.specialties.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="h-10 rounded-md border bg-muted/30 flex items-center px-3 text-sm text-muted-foreground">
                Pas de sous-spécialités
              </div>
            )}
            {specialty && specialty !== "__all__" && (
              <p className="text-[10px] text-warning mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />Les modifications ici sont des surcharges spécifiques à "{specialty}"
              </p>
            )}
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-card">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Catégorie</label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-card">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Copier depuis</label>
            <Select value="__none__" onValueChange={v => v !== "__none__" && copyFromActivity(v as ActivityType)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Copier config d'un autre profil..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__" disabled>Sélectionner une source...</SelectItem>
                {activities.filter(a => a.id !== activity).map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher une fonctionnalité..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        {/* Matrix grid */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden flex flex-col" style={{ maxHeight: "calc(100vh - 22rem)" }}>
          {/* Sticky plan header */}
          <div className="grid border-b shrink-0 sticky top-0 z-10 bg-card" style={{ gridTemplateColumns: `2fr ${currentPlans.map(() => "1fr").join(" ")}` }}>
            <div className="p-4 bg-muted/30 flex items-center">
              <span className="text-sm font-semibold text-foreground">Fonctionnalité</span>
            </div>
            {currentPlans.map(plan => (
              <div key={plan.id} className={`p-4 text-center ${plan.id === "pro" ? "bg-primary/5" : "bg-muted/30"}`}>
                <p className="font-bold text-foreground text-sm">{plan.label}</p>
                <p className="text-xs text-primary font-semibold">{plan.price} DT/mois</p>
              </div>
            ))}
          </div>

          {/* Scrollable feature rows */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {Object.entries(groupedFeatures).map(([category, features]) => (
              <div key={category}>
                <div
                  className="grid border-b bg-muted/10 cursor-pointer hover:bg-muted/20 transition-colors sticky top-0 z-[5]"
                  style={{ gridTemplateColumns: `2fr ${currentPlans.map(() => "1fr").join(" ")}` }}
                  onClick={() => toggleCategory(category)}
                >
                  <div className="p-3 flex items-center gap-2">
                    {expandedCats.has(category) ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-sm font-semibold text-foreground">{category}</span>
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{features.length}</span>
                  </div>
                  {currentPlans.map(plan => (
                    <div key={plan.id} className="p-3 flex items-center justify-center" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2 text-muted-foreground hover:text-primary" onClick={() => enableAllInCategory(category, plan.id)}>
                        Tout activer
                      </Button>
                    </div>
                  ))}
                </div>

                {expandedCats.has(category) && features.map(feature => (
                  <div key={feature.id} className="grid border-b last:border-0 hover:bg-muted/5 transition-colors" style={{ gridTemplateColumns: `2fr ${currentPlans.map(() => "1fr").join(" ")}` }}>
                    <div className="p-3 pl-10 flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 cursor-default">
                              <span className="text-sm text-foreground">{feature.label}</span>
                              <Info className="h-3 w-3 text-muted-foreground/50" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            <p className="text-xs">{feature.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {specialty && specialty !== "__all__" && specialtyOverrides[activity]?.[specialty]?.[feature.id] && (
                        <span className="text-[9px] bg-warning/10 text-warning px-1 py-0.5 rounded">surcharge</span>
                      )}
                    </div>
                    {currentPlans.map(plan => (
                      <div key={plan.id} className={`p-3 flex items-center justify-center ${plan.id === "pro" ? "bg-primary/[0.02]" : ""}`}>
                        <Toggle enabled={!!effectiveState[feature.id]?.[plan.id]} onChange={() => toggleFeature(feature.id, plan.id)} size="sm" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="text-sm font-semibold text-foreground mb-3">Résumé par plan</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {currentPlans.map(plan => {
              const count = Object.values(effectiveState).filter(plans => plans[plan.id]).length;
              const pct = Math.round((count / featureCatalog.length) * 100);
              return (
                <div key={plan.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-foreground">{plan.label}</span>
                    <span className="text-xs text-primary font-bold">{count}/{featureCatalog.length}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{pct}% des fonctionnalités activées</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminFeatureMatrix;
