/**
 * Admin Subscriptions — Complete subscriber management with all statuses
 * Supports: active, trial, expired, unpaid, suspended, cancelled
 * Actions: change plan, suspend, reactivate, extend, apply promo
 * TODO BACKEND: Replace with real API calls
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import {
  CreditCard, TrendingUp, Users, ArrowUpRight, Search, Eye, Gift, Calendar,
  FileText, ArrowUp, ArrowDown, RefreshCw, Ban, CheckCircle, Clock,
  AlertTriangle, CalendarPlus, DollarSign,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";
import MotifDialog from "@/components/admin/MotifDialog";
import { useAdminSubscriptions } from "@/stores/adminStore";
import type { AdminSubscription, SubscriptionStatus } from "@/types/admin";

// Status config
const statusConfig: Record<string, { label: string; color: string }> = {
  trial: { label: "Essai", color: "bg-warning/10 text-warning border-warning/20" },
  active: { label: "Actif", color: "bg-accent/10 text-accent border-accent/20" },
  expired: { label: "Expiré", color: "bg-destructive/10 text-destructive border-destructive/20" },
  unpaid: { label: "Impayé", color: "bg-destructive/10 text-destructive border-destructive/20" },
  suspended: { label: "Suspendu", color: "bg-destructive/10 text-destructive border-destructive/20" },
  cancelled: { label: "Annulé", color: "bg-muted text-muted-foreground border-border" },
};

const PLAN_PRICES: Record<string, number> = { "Basic": 39, "Pro": 129, "Essentiel": 49, "Cabinet+": 299 };

const revenueChartData = [
  { month: "Oct", value: 28000 }, { month: "Nov", value: 31000 },
  { month: "Déc", value: 34000 }, { month: "Jan", value: 37500 },
  { month: "Fév", value: 41200 }, { month: "Mar", value: 44800 },
];

const AdminSubscriptions = () => {
  const { subscriptions: subs, setSubscriptions: setSubs } = useAdminSubscriptions();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | string>("all");
  const [filterPlan, setFilterPlan] = useState<"all" | string>("all");
  const [detailSub, setDetailSub] = useState<AdminSubscription | null>(null);

  // Plan change
  const [changePlanSub, setChangePlanSub] = useState<AdminSubscription | null>(null);
  const [newPlan, setNewPlan] = useState<string>("Pro");

  const [extendSub, setExtendSub] = useState<AdminSubscription | null>(null);
  const [extendDays, setExtendDays] = useState(30);

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
    unpaid: subs.filter(s => s.status === "unpaid").length,
    suspended: subs.filter(s => s.status === "suspended").length,
    expired: subs.filter(s => s.status === "expired").length,
  }), [subs]);

  const openChangePlan = (sub: AdminSubscription) => {
    setChangePlanSub(sub);
    setNewPlan(sub.plan === "Basic" ? "Pro" : "Basic");
  };

  const handleChangePlanConfirm = () => {
    if (!changePlanSub) return;
    setMotifAction({ type: "change_plan", subId: changePlanSub.id, data: { newPlan } });
    setChangePlanSub(null);
  };

  const handleSuspend = (sub: AdminSubscription) => setMotifAction({ type: "suspend", subId: sub.id });
  const handleReactivate = (sub: AdminSubscription) => setMotifAction({ type: "reactivate", subId: sub.id });
  const handleMarkUnpaid = (sub: AdminSubscription) => setMotifAction({ type: "mark_unpaid", subId: sub.id });

  const handleExtendConfirm = () => {
    if (!extendSub) return;
    setMotifAction({ type: "extend", subId: extendSub.id, data: { days: extendDays } });
    setExtendSub(null);
  };

  const handleMotifConfirm = (motif: string) => {
    if (!motifAction) return;
    const { type, subId, data } = motifAction;

    setSubs(prev => prev.map(s => {
      if (s.id !== subId) return s;

      if (type === "change_plan") {
        const oldPlan = s.plan;
        const np = data.newPlan as string;
        const event = `Plan changé de ${oldPlan} → ${np} — Motif : ${motif}`;
        appendLog("subscription_plan_changed", "subscription", subId, `${s.doctorName}: ${event}`);
        toast({ title: `Plan changé → ${np}`, description: s.doctorName });
        return { ...s, plan: np, monthlyPrice: PLAN_PRICES[np] || s.monthlyPrice, history: [...s.history, { date: new Date().toISOString().slice(0, 10), event }] };
      }

      if (type === "suspend") {
        appendLog("subscription_suspended", "subscription", subId, `${s.doctorName} suspendu — ${motif}`);
        toast({ title: "Abonnement suspendu", description: s.doctorName });
        return { ...s, status: "suspended" as SubscriptionStatus, history: [...s.history, { date: new Date().toISOString().slice(0, 10), event: `Suspendu — ${motif}` }] };
      }

      if (type === "reactivate") {
        appendLog("subscription_reactivated", "subscription", subId, `${s.doctorName} réactivé — ${motif}`);
        toast({ title: "Abonnement réactivé", description: s.doctorName });
        return { ...s, status: "active" as SubscriptionStatus, history: [...s.history, { date: new Date().toISOString().slice(0, 10), event: `Réactivé — ${motif}` }] };
      }

      if (type === "mark_unpaid") {
        appendLog("subscription_unpaid", "subscription", subId, `${s.doctorName} marqué impayé — ${motif}`);
        toast({ title: "Marqué comme impayé", description: s.doctorName });
        return { ...s, status: "unpaid" as SubscriptionStatus, history: [...s.history, { date: new Date().toISOString().slice(0, 10), event: `Marqué impayé — ${motif}` }] };
      }

      if (type === "extend") {
        const newDate = new Date(s.renewalDate);
        newDate.setDate(newDate.getDate() + (data.days || 30));
        appendLog("subscription_extended", "subscription", subId, `${s.doctorName} prolongé de ${data.days}j — ${motif}`);
        toast({ title: `Prolongé de ${data.days} jours`, description: s.doctorName });
        return { ...s, renewalDate: newDate.toISOString().slice(0, 10), history: [...s.history, { date: new Date().toISOString().slice(0, 10), event: `Prolongé de ${data.days} jours — ${motif}` }] };
      }

      return s;
    }));
    setMotifAction(null);
  };

  return (
    <DashboardLayout role="admin" title="Abonnements & Facturation">
      <div className="space-y-6">
        {/* Revenue stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-6">
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <CreditCard className="h-5 w-5 text-primary" />
            <p className="mt-3 text-2xl font-bold text-foreground">{stats.totalRev.toLocaleString()} DT</p>
            <p className="text-xs text-muted-foreground">MRR</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <Users className="h-5 w-5 text-accent" />
            <p className="mt-3 text-2xl font-bold text-foreground">{stats.active}</p>
            <p className="text-xs text-muted-foreground">Actifs</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <Clock className="h-5 w-5 text-warning" />
            <p className="mt-3 text-2xl font-bold text-warning">{stats.trial}</p>
            <p className="text-xs text-muted-foreground">En essai</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p className="mt-3 text-2xl font-bold text-destructive">{stats.unpaid}</p>
            <p className="text-xs text-muted-foreground">Impayés</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <Ban className="h-5 w-5 text-destructive" />
            <p className="mt-3 text-2xl font-bold text-destructive">{stats.suspended}</p>
            <p className="text-xs text-muted-foreground">Suspendus</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <TrendingUp className="h-5 w-5 text-accent" />
            <p className="mt-3 text-2xl font-bold text-foreground">94%</p>
            <p className="text-xs text-muted-foreground">Rétention</p>
          </div>
        </div>

        {/* Chart */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="font-semibold text-foreground mb-4">Évolution des revenus</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
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

        {/* Subscriptions table */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b px-5 py-4 gap-3">
            <h3 className="font-semibold text-foreground">Tous les abonnements</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
              </div>
              <Select value={filterPlan} onValueChange={v => setFilterPlan(v)}>
                <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="Basic">Basic</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={v => setFilterStatus(v)}>
                <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="trial">Essai</SelectItem>
                  <SelectItem value="expired">Expiré</SelectItem>
                  <SelectItem value="unpaid">Impayé</SelectItem>
                  <SelectItem value="suspended">Suspendu</SelectItem>
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
              {filtered.map(s => {
                const sc = statusConfig[s.status] || statusConfig.cancelled;
                return (
                  <TableRow key={s.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setDetailSub(s)}>
                    <TableCell className="font-medium text-foreground">{s.doctorName}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${s.plan === "Pro" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{s.plan}</span>
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-foreground">{s.monthlyPrice} DT</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${sc.color}`}>{sc.label}</span>
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
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openChangePlan(s)} title="Changer plan">
                          <ArrowUp className="h-3.5 w-3.5 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setExtendSub(s); setExtendDays(30); }} title="Prolonger">
                          <CalendarPlus className="h-3.5 w-3.5 text-accent" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Detail drawer */}
      <Sheet open={!!detailSub} onOpenChange={() => setDetailSub(null)}>
        <SheetContent className="sm:max-w-md flex flex-col p-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <SheetTitle>Détail abonnement</SheetTitle>
            <SheetDescription className="sr-only">Détails de l'abonnement</SheetDescription>
          </SheetHeader>
          {detailSub && (
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-5">
                <div className="rounded-lg border p-4 space-y-3">
                  {[
                    ["Partenaire", detailSub.doctorName],
                    ["Plan", `${detailSub.plan} — ${detailSub.monthlyPrice} DT/mois`],
                    ["Date début", formatDate(detailSub.startDate)],
                    ["Renouvellement", formatDate(detailSub.renewalDate)],
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">{label}</p>
                      <p className="text-sm font-semibold text-foreground">{val}</p>
                    </div>
                  ))}
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Statut</p>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${(statusConfig[detailSub.status] || statusConfig.cancelled).color}`}>
                      {(statusConfig[detailSub.status] || statusConfig.cancelled).label}
                    </span>
                  </div>
                </div>

                {detailSub.promoName && (
                  <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
                    <div className="flex items-center gap-2 mb-2"><Gift className="h-4 w-4 text-accent" /><p className="text-sm font-semibold text-foreground">Promotion</p></div>
                    <p className="text-sm text-foreground">{detailSub.promoName}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="rounded-lg border p-4 space-y-2">
                  <p className="text-xs font-semibold text-foreground mb-2">Actions</p>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => { setDetailSub(null); openChangePlan(detailSub); }}>
                      <ArrowUp className="h-3.5 w-3.5 mr-1 text-primary" />Changer plan
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => { setDetailSub(null); setExtendSub(detailSub); setExtendDays(30); }}>
                      <CalendarPlus className="h-3.5 w-3.5 mr-1 text-accent" />Prolonger
                    </Button>
                    {["active", "trial"].includes(detailSub.status) && (
                      <>
                        <Button size="sm" variant="outline" className="text-xs text-warning border-warning/30" onClick={() => { setDetailSub(null); handleMarkUnpaid(detailSub); }}>
                          <DollarSign className="h-3.5 w-3.5 mr-1" />Marquer impayé
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs text-destructive border-destructive/30" onClick={() => { setDetailSub(null); handleSuspend(detailSub); }}>
                          <Ban className="h-3.5 w-3.5 mr-1" />Suspendre
                        </Button>
                      </>
                    )}
                    {["cancelled", "expired", "suspended", "unpaid"].includes(detailSub.status) && (
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
          <DialogHeader><DialogTitle>Changer de plan</DialogTitle></DialogHeader>
          {changePlanSub && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-sm text-muted-foreground">Partenaire : <span className="font-semibold text-foreground">{changePlanSub.doctorName}</span></p>
                <p className="text-sm text-muted-foreground">Plan actuel : <span className="font-semibold text-primary">{changePlanSub.plan} ({changePlanSub.monthlyPrice} DT)</span></p>
              </div>
              <div>
                <Label className="text-xs">Nouveau plan</Label>
                <Select value={newPlan} onValueChange={setNewPlan}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basic">Basic — 39 DT/mois</SelectItem>
                    <SelectItem value="Pro">Pro — 129 DT/mois</SelectItem>
                    <SelectItem value="Cabinet+">Cabinet+ — 299 DT/mois</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setChangePlanSub(null)}>Annuler</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={handleChangePlanConfirm} disabled={newPlan === changePlanSub?.plan}>Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend dialog */}
      <Dialog open={!!extendSub} onOpenChange={() => setExtendSub(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Prolonger l'abonnement</DialogTitle></DialogHeader>
          {extendSub && (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">Partenaire : <span className="font-semibold text-foreground">{extendSub.doctorName}</span></p>
              <p className="text-sm text-muted-foreground">Renouvellement actuel : <span className="font-semibold text-foreground">{formatDate(extendSub.renewalDate)}</span></p>
              <div>
                <Label className="text-xs">Nombre de jours à ajouter</Label>
                <Input className="mt-1" type="number" min={1} max={365} value={extendDays} onChange={e => setExtendDays(Number(e.target.value))} />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setExtendSub(null)}>Annuler</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={handleExtendConfirm}>Prolonger</Button>
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
              : motifAction.type === "mark_unpaid" ? "Marquer comme impayé"
              : motifAction.type === "extend" ? "Prolonger l'abonnement"
              : "Réactiver l'abonnement"
          }
          description="Cette action est tracée dans l'audit log et le partenaire sera notifié."
          confirmLabel="Confirmer"
          destructive={motifAction.type === "suspend" || motifAction.type === "mark_unpaid"}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminSubscriptions;
