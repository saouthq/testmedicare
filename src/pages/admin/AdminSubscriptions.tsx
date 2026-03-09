/**
 * Admin Subscriptions — Enhanced with promo column & detail drawer
 * TODO BACKEND: Replace with real API calls
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import { CreditCard, TrendingUp, Users, ArrowUpRight, Search, Eye, X, Gift, Calendar, FileText } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { mockAdminRevenue, mockAdminSubscriptions as mockPlanStats } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getDoctorSubscriptions } from "@/services/admin/adminPromotionsService";
import type { DoctorSubscription, DoctorSubStatus } from "@/types/promotion";

const statusConfig: Record<DoctorSubStatus, { label: string; color: string }> = {
  trial: { label: "Essai", color: "bg-warning/10 text-warning border-warning/20" },
  active: { label: "Actif", color: "bg-accent/10 text-accent border-accent/20" },
  expired: { label: "Expiré", color: "bg-destructive/10 text-destructive border-destructive/20" },
  cancelled: { label: "Annulé", color: "bg-muted text-muted-foreground border-border" },
};

const AdminSubscriptions = () => {
  const [subs] = useState<DoctorSubscription[]>(getDoctorSubscriptions());
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | DoctorSubStatus>("all");
  const [detailSub, setDetailSub] = useState<DoctorSubscription | null>(null);

  const filtered = useMemo(() => {
    let list = subs;
    if (filterStatus !== "all") list = list.filter(s => s.status === filterStatus);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => s.doctorName.toLowerCase().includes(q));
    }
    return list;
  }, [subs, filterStatus, search]);

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString("fr-TN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <DashboardLayout role="admin" title="Abonnements & Facturation">
      <div className="space-y-6">
        {/* Revenue stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <CreditCard className="h-5 w-5 text-primary" />
            <p className="mt-3 text-2xl font-bold text-foreground">48,750 DT</p>
            <p className="text-xs text-muted-foreground">Revenus ce mois</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <Users className="h-5 w-5 text-accent" />
            <p className="mt-3 text-2xl font-bold text-foreground">{subs.length}</p>
            <p className="text-xs text-muted-foreground">Abonnés</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <TrendingUp className="h-5 w-5 text-accent" />
            <p className="mt-3 text-2xl font-bold text-foreground">94%</p>
            <p className="text-xs text-muted-foreground">Taux de rétention</p>
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <ArrowUpRight className="h-5 w-5 text-warning" />
            <p className="mt-3 text-2xl font-bold text-foreground">{subs.filter(s => s.promoId).length}</p>
            <p className="text-xs text-muted-foreground">Avec promo active</p>
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
            <h3 className="font-semibold text-foreground mb-4">Plans</h3>
            <div className="space-y-4">
              {mockPlanStats.map((s, i) => (
                <div key={i} className="flex justify-between items-center border-b pb-2 last:border-0">
                  <span>{s.name}</span>
                  <span className="font-bold">{s.revenue}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Doctor subscriptions table */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b px-5 py-4 gap-3">
            <h3 className="font-semibold text-foreground">Abonnements médecins</h3>
            <div className="flex items-center gap-2">
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
              </div>
              <Select value={filterStatus} onValueChange={v => setFilterStatus(v as any)}>
                <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="trial">Essai</SelectItem>
                  <SelectItem value="expired">Expiré</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Médecin</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="hidden md:table-cell">Avantage/Promo</TableHead>
                <TableHead className="hidden md:table-cell">Renouvellement</TableHead>
                <TableHead className="text-right">Détail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Aucun abonnement trouvé</TableCell></TableRow>
              )}
              {filtered.map(s => (
                <TableRow key={s.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setDetailSub(s)}>
                  <TableCell className="font-medium text-foreground">{s.doctorName}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${s.plan === "Pro" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{s.plan}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusConfig[s.status].color}`}>{statusConfig[s.status].label}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {s.promoName ? (
                      <span className="flex items-center gap-1 text-xs text-accent"><Gift className="h-3.5 w-3.5" />{s.promoName} <span className="text-muted-foreground">→ {formatDate(s.promoEndDate || "")}</span></span>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{formatDate(s.renewalDate)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Detail drawer */}
      <Sheet open={!!detailSub} onOpenChange={() => setDetailSub(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Détail abonnement</SheetTitle>
          </SheetHeader>
          {detailSub && (
            <div className="space-y-5 mt-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Médecin</p>
                  <p className="text-sm font-semibold text-foreground">{detailSub.doctorName}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Plan</p>
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
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default AdminSubscriptions;
