/**
 * AdminConfiguration — Unified feature control with tabs:
 * Feature Flags | Modules | Contrôle Actions
 * Fusionné depuis: AdminFeatureFlags, AdminModules, AdminActionGating
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useMemo } from "react";

/**
 * This page wraps the 3 feature-control pages into tabs.
 * Each sub-page still renders its own DashboardLayout — we'll strip that
 * by rendering them as direct children with a shared layout.
 * 
 * For simplicity, we redirect to the actual pages via tab navigation
 * but present them as a unified experience.
 */

// Since the sub-pages each wrap in DashboardLayout, we use a simpler approach:
// Render the Configuration page with tabs that switch between the 3 feature pages.
// We re-export the content inline to avoid double-DashboardLayout.

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import ModuleCustomization from "@/components/admin/ModuleCustomization";
import {
  useSystemFlags, toggleFeatureFlag, type SystemFeatureFlag,
} from "@/stores/entitlementStore";
import {
  useAdminModules, platformModules, toggleModule, setModuleStates,
  type ModuleStates, type PlatformModule,
} from "@/stores/adminModulesStore";
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
  Flag, CheckCircle, XCircle, Clock, Info,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// ── Role config for action gating ──
const roleConfig: Record<string, { label: string; icon: any; color: string }> = {
  patient: { label: "Patient", icon: Users, color: "text-primary" },
  doctor: { label: "Médecin", icon: Stethoscope, color: "text-primary" },
  secretary: { label: "Secrétaire", icon: UserPlus, color: "text-warning" },
  pharmacy: { label: "Pharmacie", icon: Pill, color: "text-accent" },
  laboratory: { label: "Laboratoire", icon: FlaskConical, color: "text-primary" },
  hospital: { label: "Hôpital", icon: Building2, color: "text-destructive" },
  clinic: { label: "Clinique", icon: Activity, color: "text-primary" },
  public: { label: "Public", icon: Globe, color: "text-muted-foreground" },
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

const moduleIcons: Record<string, any> = {
  appointments: Calendar, consultations: Stethoscope, teleconsultation: Video,
  prescriptions: FileText, patient_health: Heart, patient_records: Users,
  messaging: MessageSquare, notifications: Activity, laboratory: FlaskConical,
  pharmacy: Pill, secretary: Building2, billing: Banknote, ai_assistant: Bot,
  doctor_connect: Activity, doctor_stats: BarChart3, doctor_secretary_mgmt: Building2,
  public_directories: Globe, public_profiles: Users,
};

const categoryConfig: Record<string, { label: string; icon: any; color: string }> = {
  core: { label: "Noyau", icon: Activity, color: "text-primary" },
  clinical: { label: "Clinique", icon: Stethoscope, color: "text-accent" },
  communication: { label: "Communication", icon: MessageSquare, color: "text-warning" },
  professional: { label: "Professionnel", icon: Building2, color: "text-primary" },
  finance: { label: "Finance", icon: Banknote, color: "text-accent" },
  public: { label: "Public", icon: Globe, color: "text-muted-foreground" },
};

const AdminConfiguration = () => {
  // ── Feature Flags state ──
  const [flags] = useSystemFlags();
  const [toggleDialog, setToggleDialog] = useState<SystemFeatureFlag | null>(null);
  const [reason, setReason] = useState("");

  // ── Modules state ──
  const [moduleStates] = useAdminModules();
  const [modSearch, setModSearch] = useState("");
  const [modCategory, setModCategory] = useState("all");
  const [confirmToggle, setConfirmToggle] = useState<{ mod: PlatformModule; enable: boolean } | null>(null);

  // ── Action Gating state ──
  const [actionStates] = useActionGatingStore();
  const [selectedRole, setSelectedRole] = useState("patient");
  const [actionSearch, setActionSearch] = useState("");
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<{ action: ActionDef; enable: boolean } | null>(null);

  // ── Feature Flags handlers ──
  const handleFlagToggle = () => {
    if (!toggleDialog || !reason.trim()) { toast({ title: "Motif obligatoire", variant: "destructive" }); return; }
    toggleFeatureFlag(toggleDialog.featureId, !toggleDialog.enabled, reason, "Admin");
    toast({ title: toggleDialog.enabled ? "Feature désactivée" : "Feature activée", description: toggleDialog.label });
    setToggleDialog(null); setReason("");
  };

  // ── Modules handlers ──
  const modCategories = useMemo(() => [...new Set(platformModules.map(m => m.category))], []);
  const modFiltered = useMemo(() => platformModules.filter(mod => {
    if (modCategory !== "all" && mod.category !== modCategory) return false;
    if (modSearch) { const q = modSearch.toLowerCase(); return mod.label.toLowerCase().includes(q) || mod.description.toLowerCase().includes(q); }
    return true;
  }), [modSearch, modCategory]);

  const modGrouped = useMemo(() => {
    const g: Record<string, PlatformModule[]> = {};
    modFiltered.forEach(m => { if (!g[m.category]) g[m.category] = []; g[m.category].push(m); });
    return g;
  }, [modFiltered]);

  const handleModToggle = (mod: PlatformModule) => {
    const newState = moduleStates[mod.id] === false;
    if (mod.critical && !newState) { setConfirmToggle({ mod, enable: false }); return; }
    toggleModule(mod.id, newState, "Admin");
    toast({ title: newState ? `✅ ${mod.label} activé` : `⛔ ${mod.label} désactivé` });
  };

  // ── Action Gating handlers ──
  const roleActions = useMemo(() => actionCatalog.filter(a => {
    if (a.role !== selectedRole) return false;
    if (actionSearch) { const q = actionSearch.toLowerCase(); return a.label.toLowerCase().includes(q) || a.description.toLowerCase().includes(q); }
    return true;
  }), [selectedRole, actionSearch]);

  const actionGrouped = useMemo(() => {
    const g: Record<string, ActionDef[]> = {};
    roleActions.forEach(a => { if (!g[a.category]) g[a.category] = []; g[a.category].push(a); });
    return g;
  }, [roleActions]);

  const actionStats = useMemo(() => getRoleStats(selectedRole), [selectedRole, actionStates]);

  const handleActionToggle = (action: ActionDef) => {
    const newState = actionStates[action.id] === false;
    if (action.critical && !newState) { setConfirmAction({ action, enable: false }); return; }
    toggleAction(action.id, newState);
    toast({ title: newState ? `✅ ${action.label}` : `⛔ ${action.label}` });
  };

  return (
    <DashboardLayout role="admin" title="Configuration des fonctionnalités">
      <Tabs defaultValue="modules" className="space-y-6">
        <TabsList>
          <TabsTrigger value="flags">Feature Flags</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="actions">Contrôle Actions</TabsTrigger>
        </TabsList>

        {/* ════ FEATURE FLAGS ════ */}
        <TabsContent value="flags" className="space-y-6">
          <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div><p className="text-sm font-semibold text-foreground">Impact global</p><p className="text-xs text-muted-foreground mt-1">Désactiver un flag affecte TOUS les utilisateurs.</p></div>
          </div>
          <div className="rounded-xl border bg-card shadow-card overflow-hidden">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Feature</TableHead><TableHead>Statut</TableHead><TableHead>Raison</TableHead><TableHead>Modifié</TableHead><TableHead className="text-right">Action</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {flags.map(f => (
                  <TableRow key={f.id}>
                    <TableCell><p className="font-medium text-foreground text-sm">{f.label}</p><p className="text-[10px] text-muted-foreground">{f.featureId}</p></TableCell>
                    <TableCell><span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${f.enabled ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}`}>{f.enabled ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}{f.enabled ? "Actif" : "Off"}</span></TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{f.reason || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(f.updatedAt).toLocaleDateString("fr-TN", { day: "numeric", month: "short" })}</TableCell>
                    <TableCell className="text-right"><Button variant={f.enabled ? "outline" : "default"} size="sm" className={`text-xs ${f.enabled ? "text-destructive" : "gradient-primary text-primary-foreground"}`} onClick={() => { setToggleDialog(f); setReason(""); }}>{f.enabled ? "Désactiver" : "Activer"}</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ════ MODULES ════ */}
        <TabsContent value="modules" className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border bg-accent/5 p-4 flex items-center gap-4"><Power className="h-6 w-6 text-accent" /><div><p className="text-2xl font-bold text-accent">{Object.values(moduleStates).filter(Boolean).length || platformModules.length}</p><p className="text-xs text-muted-foreground">Actifs</p></div></div>
            <div className="rounded-xl border bg-destructive/5 p-4 flex items-center gap-4"><PowerOff className="h-6 w-6 text-destructive" /><div><p className="text-2xl font-bold text-destructive">{Object.values(moduleStates).filter(v => v === false).length}</p><p className="text-xs text-muted-foreground">Inactifs</p></div></div>
            <div className="rounded-xl border p-4 flex items-center gap-4"><Zap className="h-6 w-6 text-foreground" /><div><p className="text-2xl font-bold text-foreground">{platformModules.length}</p><p className="text-xs text-muted-foreground">Total</p></div></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Rechercher..." className="pl-9 h-9 w-56 text-xs" value={modSearch} onChange={e => setModSearch(e.target.value)} /></div>
              <div className="flex gap-0.5 rounded-lg border bg-card p-0.5">
                <button onClick={() => setModCategory("all")} className={`rounded-md px-3 py-1.5 text-xs font-medium ${modCategory === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Tous</button>
                {modCategories.map(cat => <button key={cat} onClick={() => setModCategory(cat)} className={`rounded-md px-3 py-1.5 text-xs font-medium ${modCategory === cat ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{categoryConfig[cat]?.label || cat}</button>)}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => { const all: ModuleStates = {}; platformModules.forEach(m => { all[m.id] = true; }); setModuleStates(all); toast({ title: "✅ Tout activé" }); }}><Power className="h-3.5 w-3.5 mr-1" />Tout activer</Button>
            </div>
          </div>
          {Object.entries(modGrouped).map(([cat, mods]) => {
            const cfg = categoryConfig[cat]; const CatIcon = cfg?.icon || Activity;
            return (
              <div key={cat} className="space-y-3">
                <div className="flex items-center gap-2"><CatIcon className={`h-4 w-4 ${cfg?.color}`} /><h3 className="text-sm font-semibold text-foreground">{cfg?.label || cat}</h3><span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{mods.length}</span></div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {mods.map(mod => {
                    const enabled = moduleStates[mod.id] !== false; const Icon = moduleIcons[mod.id] || Activity;
                    return (
                      <div key={mod.id} className={`rounded-xl border bg-card shadow-card p-4 transition-all ${enabled ? "hover:shadow-card-hover" : "opacity-60 bg-muted/30"}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${enabled ? "bg-primary/10" : "bg-muted"}`}><Icon className={`h-5 w-5 ${enabled ? "text-primary" : "text-muted-foreground"}`} /></div>
                            <div className="min-w-0"><div className="flex items-center gap-1.5"><h4 className="text-sm font-semibold text-foreground truncate">{mod.label}</h4>{mod.critical && <span className="text-[9px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-medium shrink-0">CRITIQUE</span>}</div><p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{mod.description}</p></div>
                          </div>
                          <button onClick={() => handleModToggle(mod)} className={`shrink-0 mt-1 ${enabled ? "text-accent" : "text-muted-foreground"}`}>{enabled ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7" />}</button>
                        </div>
                        {mod.affectedRoles.length > 0 && <div className="mt-3 flex items-center gap-1.5 flex-wrap"><span className="text-[10px] text-muted-foreground">Impact :</span>{mod.affectedRoles.map(r => <span key={r} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{r === "patient" ? "Patient" : r === "doctor" ? "Médecin" : r === "pharmacy" ? "Pharmacie" : r === "laboratory" ? "Labo" : r === "secretary" ? "Secrétaire" : r}</span>)}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </TabsContent>

        {/* ════ ACTION GATING ════ */}
        <TabsContent value="actions" className="space-y-6">
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div><p className="text-sm font-medium text-foreground">Contrôle granulaire</p><p className="text-xs text-muted-foreground mt-0.5">Activez/désactivez chaque bouton individuellement par rôle.</p></div>
          </div>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
            {Object.entries(roleConfig).map(([role, cfg]) => {
              const rs = getRoleStats(role); const RIcon = cfg.icon; const isSel = selectedRole === role;
              return (
                <button key={role} onClick={() => { setSelectedRole(role); setActionSearch(""); }} className={`rounded-xl border p-3 text-left transition-all ${isSel ? "border-primary bg-primary/10 shadow-sm" : "hover:border-primary/30 bg-card"}`}>
                  <RIcon className={`h-4 w-4 mb-1 ${isSel ? "text-primary" : cfg.color}`} />
                  <p className={`text-xs font-semibold ${isSel ? "text-primary" : "text-foreground"}`}>{cfg.label}</p>
                  <div className="flex items-center gap-1 mt-1"><span className="text-[10px] text-accent font-medium">{rs.enabled}</span><span className="text-[10px] text-muted-foreground">/{rs.total}</span>{rs.disabled > 0 && <span className="text-[10px] text-destructive font-medium ml-auto">-{rs.disabled}</span>}</div>
                </button>
              );
            })}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3"><div className="relative"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Rechercher..." className="pl-9 h-9 w-64 text-xs" value={actionSearch} onChange={e => setActionSearch(e.target.value)} /></div></div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => { toggleAllForRole(selectedRole, true); toast({ title: "✅ Tout activé" }); }}><Power className="h-3.5 w-3.5 mr-1" />Tout activer</Button>
              <Button variant="outline" size="sm" className="text-xs text-destructive" onClick={() => { toggleAllForRole(selectedRole, false); toast({ title: "⛔ Tout désactivé" }); }}><PowerOff className="h-3.5 w-3.5 mr-1" />Tout désactiver</Button>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => { resetActionGating(); toast({ title: "Reset" }); }}><RotateCcw className="h-3.5 w-3.5 mr-1" />Reset</Button>
            </div>
          </div>
          <div className="space-y-4">
            {Object.entries(actionGrouped).map(([cat, actions]) => {
              const collapsed = collapsedCats.has(cat); const CatIcon = categoryIcons[cat] || Activity;
              const enabledInCat = actions.filter(a => actionStates[a.id] !== false).length;
              return (
                <div key={cat} className="rounded-xl border bg-card shadow-card overflow-hidden">
                  <div className="px-4 py-3 bg-muted/30 border-b flex items-center justify-between">
                    <button onClick={() => { const n = new Set(collapsedCats); n.has(cat) ? n.delete(cat) : n.add(cat); setCollapsedCats(n); }} className="flex items-center gap-2 flex-1">
                      {collapsed ? <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                      <CatIcon className="h-4 w-4 text-primary" /><span className="text-sm font-semibold text-foreground">{cat}</span>
                      <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{enabledInCat}/{actions.length}</span>
                    </button>
                    <div className="flex gap-1">
                      <button onClick={() => { toggleCategoryForRole(selectedRole, cat, true); toast({ title: `✅ ${cat}` }); }} className="rounded-md px-2 py-1 text-[10px] text-muted-foreground hover:text-accent"><Eye className="h-3 w-3" /></button>
                      <button onClick={() => { toggleCategoryForRole(selectedRole, cat, false); toast({ title: `⛔ ${cat}` }); }} className="rounded-md px-2 py-1 text-[10px] text-muted-foreground hover:text-destructive"><EyeOff className="h-3 w-3" /></button>
                    </div>
                  </div>
                  {!collapsed && <div className="divide-y">
                    {actions.map(action => {
                      const enabled = actionStates[action.id] !== false;
                      return (
                        <div key={action.id} className={`flex items-center justify-between px-4 py-2.5 transition-colors ${enabled ? "hover:bg-muted/20" : "bg-muted/10 opacity-70"}`}>
                          <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className={`text-sm font-medium ${enabled ? "text-foreground" : "text-muted-foreground line-through"}`}>{action.label}</p>{action.critical && <span className="text-[9px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-medium shrink-0">CRITIQUE</span>}</div><p className="text-[11px] text-muted-foreground mt-0.5">{action.description}</p></div>
                          <button onClick={() => handleActionToggle(action)} className={`shrink-0 ml-3 ${enabled ? "text-accent" : "text-muted-foreground"}`}>{enabled ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}</button>
                        </div>
                      );
                    })}
                  </div>}
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Feature flag toggle dialog ── */}
      <Dialog open={!!toggleDialog} onOpenChange={() => setToggleDialog(null)}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>{toggleDialog?.enabled ? "Désactiver" : "Activer"} — {toggleDialog?.label}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            {toggleDialog?.enabled && <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3"><p className="text-xs text-destructive font-medium">⚠️ Affecte tous les utilisateurs immédiatement.</p></div>}
            <div><Label className="text-xs">Motif obligatoire *</Label><Input className="mt-1" value={reason} onChange={e => setReason(e.target.value)} placeholder="Raison..." /></div>
          </div>
          <DialogFooter className="gap-2"><Button variant="outline" onClick={() => setToggleDialog(null)}>Annuler</Button><Button className={toggleDialog?.enabled ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "gradient-primary text-primary-foreground"} onClick={handleFlagToggle} disabled={!reason.trim()}>{toggleDialog?.enabled ? "Désactiver" : "Activer"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Module confirm ── */}
      <ConfirmDialog open={!!confirmToggle} title={`Désactiver ${confirmToggle?.mod.label} ?`} description={`Module critique. Impact sur : ${confirmToggle?.mod.affectedRoles.join(", ")}.`} confirmLabel="Désactiver" variant="danger" onConfirm={() => { if (confirmToggle) { toggleModule(confirmToggle.mod.id, false, "Admin"); toast({ title: `⛔ ${confirmToggle.mod.label} désactivé` }); setConfirmToggle(null); } }} onCancel={() => setConfirmToggle(null)} />

      {/* ── Action confirm ── */}
      <ConfirmDialog open={!!confirmAction} title={`Désactiver "${confirmAction?.action.label}" ?`} description="Action critique. Peut impacter les workflows principaux." confirmLabel="Désactiver" variant="danger" onConfirm={() => { if (confirmAction) { toggleAction(confirmAction.action.id, false); toast({ title: `⛔ ${confirmAction.action.label}` }); setConfirmAction(null); } }} onCancel={() => setConfirmAction(null)} />
    </DashboardLayout>
  );
};

export default AdminConfiguration;
