/**
 * Admin Subscriptions — Enhanced with plan change (upgrade/downgrade), motif, audit
 * TODO BACKEND: Replace with real API calls
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import {
  CreditCard, TrendingUp, Users, ArrowUpRight, Search, Eye, Gift, Calendar,
  FileText, ArrowUp, ArrowDown, RefreshCw, Ban, CheckCircle,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { mockAdminRevenue, mockAdminSubscriptions as mockPlanStats } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getDoctorSubscriptions } from "@/services/admin/adminPromotionsService";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";
import MotifDialog from "@/components/admin/MotifDialog";
import type { DoctorSubscription, DoctorSubStatus } from "@/types/promotion";

const statusConfig: Record<DoctorSubStatus, { label: string; color: string }> = {
  trial: { label: "Essai", color: "bg-warning/10 text-warning border-warning/20" },
  active: { label: "Actif", color: "bg-accent/10 text-accent border-accent/20" },
  expired: { label: "Expiré", color: "bg-destructive/10 text-destructive border-destructive/20" },
  cancelled: { label: "Annulé", color: "bg-muted text-muted-foreground border-border" },
};

const PLAN_PRICES: Record<string, number> = { "Basic": 39, "Pro": 129 };

const AdminSubscriptions = () => {
  const [subs, setSubs] = useState<DoctorSubscription[]>(getDoctorSubscriptions());
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | DoctorSubStatus>("all");
  const [filterPlan, setFilterPlan] = useState<"all" | "Basic" | "Pro">("all");
  const [detailSub, setDetailSub] = useState<DoctorSubscription | null>(null);

  // Plan change
  const [changePlanSub, setChangePlanSub] = useState<DoctorSubscription | null>(null);
  const [newPlan, setNewPlan] = useState<"Basic" | "Pro">("Pro");

  // Motif
  const [motifAction, setMotifAction] = useState<{ type: string; subId: string; data?: any } | null>(null);

  const filtered = useMemo(() => {
    let list = subs;
    if (filterStatus !== "all") list = list.filter(s => s.status === filterStatus);
    if (filterPlan !== "all") list = list.filter(s => s.plan === filterPlan);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => s.doctorName.toLowerCase().includes(q));
    }
    return list;
  }, [subs, filterStatus, filterPlan, search]);

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString("fr-TN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  const stats = useMemo(() => ({
    totalRev: subs.filter(s => s.status === "active").reduce((sum, s) => sum + s.monthlyPrice, 0),
    active: subs.filter(s => s.status === "active").length,
    trial: subs.filter(s => s.status === "trial").length,
    proCount: subs.filter(s => s.plan === "Pro" && s.status === "active").length,
    basicCount: subs.filter(s => s.plan === "Basic" && s.status === "active").length,
  }), [subs]);

  // Open plan change dialog
  const openChangePlan = (sub: DoctorSubscription) => {
    setChangePlanSub(sub);
    setNewPlan(sub.plan === "Basic" ? "Pro" : "Basic");
  };

  const handleChangePlanConfirm = () => {
    if (!changePlanSub) return;
    setMotifAction({ type: "change_plan", subId: changePlanSub.id, data: { newPlan } });
    setChangePlanSub(null);
  };

  const handleSuspend = (sub: DoctorSubscription) => {
    setMotifAction({ type: "suspend", subId: sub.id });
  };

  const handleReactivate = (sub: DoctorSubscription) => {
    setMotifAction({ type: "reactivate", subId: sub.id });
  };

  const handleMotifConfirm = (motif: string) => {
    if (!motifAction) return;
    const { type, subId, data } = motifAction;

    setSubs(prev => prev.map(s => {
      if (s.id !== subId) return s;

      if (type === "change_plan") {
        const oldPlan = s.plan;
        const np = data.newPlan as "Basic" | "Pro";
        const event = `Plan changé de ${oldPlan} (${PLAN_PRICES[oldPlan]} DT) → ${np} (${PLAN_PRICES[np]} DT) — Motif : ${motif}`;
        appendLog("subscription_plan_changed", "subscription", subId, `${s.doctorName}: ${event}`);
        toast({ title: `Plan changé → ${np}`, description: s.doctorName });
        return {
          ...s,
          plan: np,
          monthlyPrice: PLAN_PRICES[np],
          history: [...s.history, { date: new Date().toISOString().slice(0, 10), event }],
        };
      }

      if (type === "suspend") {
        appendLog("subscription_suspended", "subscription", subId, `Abonnement de ${s.doctorName} suspendu — Motif : ${motif}`);
        toast({ title: "Abonnement suspendu", description: s.doctorName });
        return {
          ...s,
          status: "cancelled" as DoctorSubStatus,
          history: [...s.history, { date: new Date().toISOString().slice(0, 10), event: `Suspendu par admin — Motif : ${motif}` }],
        };
      }

      if (type === "reactivate") {
        appendLog("subscription_reactivated", "subscription", subId, `Abonnement de ${s.doctorName} réactivé — Motif : ${motif}`);
        toast({ title: "Abonnement réactivé", description: s.doctorName });
        return {
          ...s,
          status: "active" as DoctorSubStatus,
          history: [...s.history, { date: new Date().toISOString().slice(0, 10), event: `Réactivé par admin — Motif : ${motif}` }],
        };
      }

      return s;
    }));

    // Update detail if open
    if (detailSub?.id === subId) {
      const updated = subs.find(s => s.id === subId);
      if (updated) setDetailSub({ ...updated }); // will refresh on next render
    }

    setMotifAction(null);
  };

  return (
    <DashboardLayout role="admin" title="Abonnements & Facturation">
      <div className="space-y-6">
        {/* Revenue stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <CreditCard className="h-5 w-5 text-primary" />
            <p className="mt-3 text-2xl font-bold text-foreground">{stats.totalRev.toLocaleString()} DT</p>
            <p className="text-xs text-muted-foreground">Revenus récurrents/mois</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <Users className="h-5 w-5 text-accent" />
            <p className="mt-3 text-2xl font-bold text-foreground">{stats.active}</p>
            <p className="text-xs text-muted-foreground">Abonnés actifs</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <TrendingUp className="h-5 w-5 text-accent" />
            <p className="mt-3 text-2xl font-bold text-foreground">94%</p>
            <p className="text-xs text-muted-foreground">Taux de rétention</p>
          </div>
          <div className="rounded-xl border bg-primary/5 p-5 shadow-card">
            <ArrowUp className="h-5 w-5 text-primary" />
            <p className="mt-3 text-2xl font-bold text-primary">{stats.proCount}</p>
            <p className="text-xs text-muted-foreground">Plan Pro</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <ArrowUpRight className="h-5 w-5 text-warning" />
            <p className="mt-3 text-2xl font-bold text-foreground">{stats.trial}</p>
            <p className="text-xs text-muted-foreground">En essai</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Évolution des revenus</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockAdminRevenue}>
                  <defs>
                    <linearGradient id="subRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `${v / 1000}k`} />
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString()} DT`, "Revenus"]} contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#subRevGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Répartition par plan</h3>
            <div className="space-y-4">
              {mockPlanStats.map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-foreground">{s.name}</span>
                    <span className="text-sm font-bold text-foreground">{s.revenue}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (s.count / subs.length) * 100)}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.count} abonnés</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subscriptions table */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b px-5 py-4 gap-3">
            <h3 className="font-semibold text-foreground">Abonnements partenaires</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
              </div>
              <Select value={filterPlan} onValueChange={v => setFilterPlan(v as any)}>
                <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="Basic">Basic</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={v => setFilterStatus(v as any)}>
                <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="trial">Essai</SelectItem>
                  <SelectItem value="expired">Expiré</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partenaire</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="hidden md:table-cell">Promo</TableHead>
                <TableHead className="hidden md:table-cell">Renouvellement</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Aucun abonnement trouvé</TableCell></TableRow>
              )}
              {filtered.map(s => (
                <TableRow key={s.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setDetailSub(s)}>
                  <TableCell className="font-medium text-foreground">{s.doctorName}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${s.plan === "Pro" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{s.plan}</span>
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-foreground">{s.monthlyPrice} DT</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusConfig[s.status].color}`}>{statusConfig[s.status].label}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {s.promoName ? (
                      <span className="flex items-center gap-1 text-xs text-accent"><Gift className="h-3.5 w-3.5" />{s.promoName}</span>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{formatDate(s.renewalDate)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailSub(s)} title="Détail"><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openChangePlan(s)} title="Changer de plan">
                        {s.plan === "Basic" ? <ArrowUp className="h-3.5 w-3.5 text-primary" /> : <ArrowDown className="h-3.5 w-3.5 text-warning" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Detail drawer */}
      <Sheet open={!!detailSub} onOpenChange={() => setDetailSub(null)}>
        <SheetContent className="sm:max-w-md flex flex-col p-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <SheetTitle>Détail abonnement</SheetTitle>
            <SheetDescription className="sr-only">Détails de l'abonnement partenaire</SheetDescription>
          </SheetHeader>
          {detailSub && (
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-5">
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Partenaire</p>
                    <p className="text-sm font-semibold text-foreground">{detailSub.doctorName}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Plan actuel</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${detailSub.plan === "Pro" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{detailSub.plan} — {detailSub.monthlyPrice} DT/mois</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Statut</p>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusConfig[detailSub.status].color}`}>{statusConfig[detailSub.status].label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Date début</p>
                    <p className="text-sm text-foreground flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(detailSub.startDate)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Renouvellement</p>
                    <p className="text-sm text-foreground">{formatDate(detailSub.renewalDate)}</p>
                  </div>
                </div>

                {/* Promo applied */}
                {detailSub.promoName && (
                  <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="h-4 w-4 text-accent" />
                      <p className="text-sm font-semibold text-foreground">Promotion appliquée</p>
                    </div>
                    <p className="text-sm text-foreground">{detailSub.promoName}</p>
                    <p className="text-xs text-muted-foreground mt-1">Valable jusqu'au {formatDate(detailSub.promoEndDate || "")}</p>
                  </div>
                )}

                {/* Quick actions */}
                <div className="rounded-lg border p-4 space-y-2">
                  <p className="text-xs font-semibold text-foreground mb-2">Actions rapides</p>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => { setDetailSub(null); openChangePlan(detailSub); }}>
                      {detailSub.plan === "Basic" ? <ArrowUp className="h-3.5 w-3.5 mr-1 text-primary" /> : <ArrowDown className="h-3.5 w-3.5 mr-1 text-warning" />}
                      {detailSub.plan === "Basic" ? "Upgrader → Pro" : "Downgrader → Basic"}
                    </Button>
                    {(detailSub.status === "active" || detailSub.status === "trial") && (
                      <Button size="sm" variant="outline" className="text-xs text-destructive border-destructive/30" onClick={() => { setDetailSub(null); handleSuspend(detailSub); }}>
                        <Ban className="h-3.5 w-3.5 mr-1" />Suspendre
                      </Button>
                    )}
                    {(detailSub.status === "cancelled" || detailSub.status === "expired") && (
                      <Button size="sm" variant="outline" className="text-xs text-accent border-accent/30" onClick={() => { setDetailSub(null); handleReactivate(detailSub); }}>
                        <RefreshCw className="h-3.5 w-3.5 mr-1" />Réactiver
                      </Button>
                    )}
                  </div>
                </div>

                {/* History */}
                <div>
                  <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1"><FileText className="h-4 w-4" />Historique</p>
                  <div className="space-y-2">
                    {detailSub.history.map((h, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">{formatDate(h.date)}</p>
                          <p className="text-sm text-foreground">{h.event}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>

      {/* Change plan dialog */}
      <Dialog open={!!changePlanSub} onOpenChange={() => setChangePlanSub(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Changer de plan</DialogTitle>
          </DialogHeader>
          {changePlanSub && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-sm text-muted-foreground">Partenaire : <span className="font-semibold text-foreground">{changePlanSub.doctorName}</span></p>
                <p className="text-sm text-muted-foreground">Plan actuel : <span className={`font-semibold ${changePlanSub.plan === "Pro" ? "text-primary" : "text-foreground"}`}>{changePlanSub.plan} ({changePlanSub.monthlyPrice} DT/mois)</span></p>
              </div>

              <div>
                <Label className="text-xs">Nouveau plan</Label>
                <Select value={newPlan} onValueChange={v => setNewPlan(v as "Basic" | "Pro")}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basic">Basic — 39 DT/mois</SelectItem>
                    <SelectItem value="Pro">Pro — 129 DT/mois</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newPlan !== changePlanSub.plan && (
                <div className={`rounded-lg p-3 border ${newPlan === "Pro" ? "bg-primary/5 border-primary/20" : "bg-warning/5 border-warning/20"}`}>
                  <div className="flex items-center gap-2">
                    {newPlan === "Pro" ? <ArrowUp className="h-4 w-4 text-primary" /> : <ArrowDown className="h-4 w-4 text-warning" />}
                    <p className="text-sm font-medium text-foreground">
                      {newPlan === "Pro" ? "Upgrade" : "Downgrade"} : {changePlanSub.monthlyPrice} DT → {PLAN_PRICES[newPlan]} DT/mois
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {newPlan === "Pro"
                      ? "Le partenaire aura accès aux fonctionnalités Pro (IA, téléconsultation avancée, stats détaillées)."
                      : "Le partenaire perdra l'accès aux fonctionnalités Pro."}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setChangePlanSub(null)}>Annuler</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={handleChangePlanConfirm} disabled={newPlan === changePlanSub?.plan}>
              Confirmer le changement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Motif dialog */}
      {motifAction && (
        <MotifDialog
          open={!!motifAction}
          onClose={() => setMotifAction(null)}
          onConfirm={handleMotifConfirm}
          title={
            motifAction.type === "change_plan" ? "Confirmer le changement de plan"
              : motifAction.type === "suspend" ? "Suspendre l'abonnement"
              : "Réactiver l'abonnement"
          }
          description="Cette action sera enregistrée dans les audit logs et le partenaire sera notifié."
          confirmLabel="Confirmer"
          destructive={motifAction.type === "suspend"}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminSubscriptions;
