/**
 * LaboratoryQuality — Modern quality control, reagent stock management, and home sampling.
 * Uses local state with // TODO BACKEND markers for future API integration.
 * // TODO BACKEND: GET/POST /api/laboratory/quality, /api/laboratory/stock, /api/laboratory/samplings
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import {
  Shield, FlaskConical, AlertTriangle, CheckCircle2, Clock, Package,
  TrendingDown, Plus, Search, X, MapPin, Calendar, Phone, Truck,
  BarChart3, ArrowRight, Edit, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type QualityTab = "controls" | "stock" | "home-sampling";

interface QualityControl {
  id: number; name: string; date: string; result: "pass" | "fail" | "pending";
  operator: string; notes?: string; nextDue: string;
}

interface Reagent {
  id: number; name: string; lot: string; expiresAt: string; quantity: number;
  unit: string; minStock: number; status: "ok" | "low" | "expired" | "critical";
}

interface HomeSampling {
  id: number; patient: string; phone: string; address: string; date: string;
  time: string; examens: string[]; status: "scheduled" | "completed" | "cancelled";
  collector: string;
}

// // TODO BACKEND: Replace with API calls
const initialControls: QualityControl[] = [
  { id: 1, name: "Contrôle interne - Biochimie", date: "2026-02-20", result: "pass", operator: "Technicien A", nextDue: "2026-02-27" },
  { id: 2, name: "Contrôle interne - Hématologie", date: "2026-02-20", result: "pass", operator: "Technicien B", nextDue: "2026-02-27" },
  { id: 3, name: "Calibration Automate #1", date: "2026-02-19", result: "pass", operator: "Technicien A", notes: "Calibration OK sur tous les paramètres", nextDue: "2026-02-26" },
  { id: 4, name: "Contrôle externe PNASQ", date: "2026-02-15", result: "pending", operator: "Dr. Kefi", notes: "Résultats en attente de validation nationale", nextDue: "2026-05-15" },
  { id: 5, name: "Vérification Températures", date: "2026-02-20", result: "pass", operator: "Technicien C", nextDue: "2026-02-21" },
  { id: 6, name: "Contrôle externe - Sérologie", date: "2026-02-10", result: "fail", operator: "Dr. Kefi", notes: "Écart sur anti-HCV, recalibration effectuée", nextDue: "2026-05-10" },
];

const initialReagents: Reagent[] = [
  { id: 1, name: "Réactif Glucose", lot: "GL-2026-A1", expiresAt: "2026-06-30", quantity: 450, unit: "tests", minStock: 100, status: "ok" },
  { id: 2, name: "Réactif HbA1c", lot: "HB-2025-K3", expiresAt: "2026-02-28", quantity: 25, unit: "tests", minStock: 50, status: "critical" },
  { id: 3, name: "Kit NFS", lot: "NFS-2026-B2", expiresAt: "2026-09-15", quantity: 200, unit: "tests", minStock: 80, status: "ok" },
  { id: 4, name: "Réactif CRP", lot: "CRP-2025-M1", expiresAt: "2026-02-20", quantity: 0, unit: "tests", minStock: 30, status: "expired" },
  { id: 5, name: "Réactif TSH", lot: "TSH-2026-C1", expiresAt: "2026-04-30", quantity: 45, unit: "tests", minStock: 40, status: "low" },
  { id: 6, name: "Tubes EDTA", lot: "TB-2026-D1", expiresAt: "2026-12-31", quantity: 500, unit: "pcs", minStock: 100, status: "ok" },
  { id: 7, name: "Tubes secs", lot: "TB-2026-D2", expiresAt: "2026-12-31", quantity: 350, unit: "pcs", minStock: 100, status: "ok" },
];

const initialSamplings: HomeSampling[] = [
  { id: 1, patient: "Nadia Jemni", phone: "+216 98 567 890", address: "22 Rue de Manouba, 2010", date: "2026-02-21", time: "08:00", examens: ["Glycémie", "NFS"], status: "scheduled", collector: "Technicien A" },
  { id: 2, patient: "Amine Ben Ali", phone: "+216 71 234 567", address: "15 Av. Liberté, El Manar", date: "2026-02-20", time: "07:30", examens: ["Bilan complet"], status: "completed", collector: "Technicien B" },
  { id: 3, patient: "Fatma Trabelsi", phone: "+216 22 345 678", address: "32 Rue de Gaulle, Ariana", date: "2026-02-22", time: "09:00", examens: ["ECBU", "Urine"], status: "scheduled", collector: "Technicien A" },
];

const resultConfig = {
  pass: { label: "Conforme", cls: "bg-accent/10 text-accent border-accent/20", icon: CheckCircle2 },
  fail: { label: "Non conforme", cls: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
  pending: { label: "En attente", cls: "bg-warning/10 text-warning border-warning/20", icon: Clock },
};

const stockStatusConfig = {
  ok: { label: "OK", cls: "bg-accent/10 text-accent", color: "bg-accent" },
  low: { label: "Stock bas", cls: "bg-warning/10 text-warning", color: "bg-warning" },
  critical: { label: "Critique", cls: "bg-destructive/10 text-destructive", color: "bg-destructive" },
  expired: { label: "Expiré", cls: "bg-destructive/10 text-destructive", color: "bg-destructive" },
};

const LaboratoryQuality = () => {
  const [tab, setTab] = useState<QualityTab>("controls");
  const [controls, setControls] = useState(initialControls);
  const [reagents, setReagents] = useState(initialReagents);
  const [samplings, setSamplings] = useState(initialSamplings);
  const [stockSearch, setStockSearch] = useState("");
  const [showAddSampling, setShowAddSampling] = useState(false);

  const alertCount = reagents.filter(r => r.status === "critical" || r.status === "expired").length;
  const lowCount = reagents.filter(r => r.status === "low").length;
  const passRate = controls.length > 0 ? Math.round((controls.filter(c => c.result === "pass").length / controls.length) * 100) : 0;
  const scheduledSamplings = samplings.filter(s => s.status === "scheduled").length;

  const filteredReagents = reagents.filter(r =>
    !stockSearch || r.name.toLowerCase().includes(stockSearch.toLowerCase()) || r.lot.toLowerCase().includes(stockSearch.toLowerCase())
  );

  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }); } catch { return iso; }
  };

  return (
    <DashboardLayout role="laboratory" title="Qualité & Conformité">
      <div className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border bg-accent/5 border-accent/20 p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center"><Shield className="h-5 w-5 text-accent" /></div>
            <div><p className="text-xl font-bold text-accent">{passRate}%</p><p className="text-[10px] text-muted-foreground">Conformité</p></div>
          </div>
          <div className={`rounded-xl border p-3 flex items-center gap-3 ${alertCount > 0 ? "bg-destructive/5 border-destructive/20" : "bg-card"}`}>
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${alertCount > 0 ? "bg-destructive/10" : "bg-muted"}`}>
              <AlertTriangle className={`h-5 w-5 ${alertCount > 0 ? "text-destructive" : "text-muted-foreground"}`} />
            </div>
            <div><p className={`text-xl font-bold ${alertCount > 0 ? "text-destructive" : "text-foreground"}`}>{alertCount}</p><p className="text-[10px] text-muted-foreground">Alertes stock</p></div>
          </div>
          <div className={`rounded-xl border p-3 flex items-center gap-3 ${lowCount > 0 ? "bg-warning/5 border-warning/20" : "bg-card"}`}>
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${lowCount > 0 ? "bg-warning/10" : "bg-muted"}`}>
              <TrendingDown className={`h-5 w-5 ${lowCount > 0 ? "text-warning" : "text-muted-foreground"}`} />
            </div>
            <div><p className={`text-xl font-bold ${lowCount > 0 ? "text-warning" : "text-foreground"}`}>{lowCount}</p><p className="text-[10px] text-muted-foreground">Stocks bas</p></div>
          </div>
          <div className="rounded-xl border bg-primary/5 border-primary/20 p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Truck className="h-5 w-5 text-primary" /></div>
            <div><p className="text-xl font-bold text-primary">{scheduledSamplings}</p><p className="text-[10px] text-muted-foreground">Prélèvements</p></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 rounded-lg border bg-card p-0.5 w-fit">
          {([
            { key: "controls" as QualityTab, label: "Contrôles qualité", icon: Shield },
            { key: "stock" as QualityTab, label: "Stock réactifs", icon: Package },
            { key: "home-sampling" as QualityTab, label: "Prélèvements", icon: Truck },
          ]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 ${tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <t.icon className="h-3.5 w-3.5" />{t.label}
              {t.key === "stock" && alertCount > 0 && <span className="h-1.5 w-1.5 rounded-full bg-destructive" />}
            </button>
          ))}
        </div>

        {/* Controls tab */}
        {tab === "controls" && (
          <div className="space-y-2">
            {controls.map(ctrl => {
              const cfg = resultConfig[ctrl.result];
              const Icon = cfg.icon;
              return (
                <div key={ctrl.id} className={`rounded-xl border bg-card p-4 shadow-card transition-all hover:shadow-card-hover ${ctrl.result === "fail" ? "border-l-3 border-l-destructive" : ""}`}>
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${cfg.cls}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-foreground text-sm">{ctrl.name}</h4>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium border ${cfg.cls}`}>{cfg.label}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5 flex-wrap">
                        <span>{formatDate(ctrl.date)}</span>
                        <span>·</span>
                        <span>{ctrl.operator}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><RefreshCw className="h-2.5 w-2.5" />Prochain : {formatDate(ctrl.nextDue)}</span>
                      </div>
                      {ctrl.notes && <p className="text-[11px] text-muted-foreground mt-1.5 bg-muted/50 rounded-lg px-2.5 py-1.5">{ctrl.notes}</p>}
                    </div>
                    {ctrl.result === "fail" && (
                      <Button size="sm" variant="outline" className="text-[10px] h-7 shrink-0" onClick={() => {
                        setControls(prev => prev.map(c => c.id === ctrl.id ? { ...c, result: "pass" as const, notes: (c.notes || "") + " — Recalibré et validé" } : c));
                        toast.success("Contrôle revalidé ✓");
                      }}>
                        <CheckCircle2 className="h-3 w-3 mr-1" />Revalider
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stock tab */}
        {tab === "stock" && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Rechercher un réactif..." className="pl-8 h-8 text-xs" value={stockSearch} onChange={e => setStockSearch(e.target.value)} />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {filteredReagents.map(r => {
                const cfg = stockStatusConfig[r.status];
                const pct = Math.min(100, Math.round((r.quantity / (r.minStock * 3)) * 100));
                return (
                  <div key={r.id} className={`rounded-xl border bg-card p-4 shadow-card transition-all hover:shadow-card-hover ${
                    r.status === "critical" || r.status === "expired" ? "border-destructive/30 bg-destructive/5" : ""
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{r.name}</p>
                        <p className="text-[10px] text-muted-foreground">Lot: {r.lot}</p>
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.cls}`}>{cfg.label}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-bold text-foreground">{r.quantity}</span>
                      <span className="text-xs text-muted-foreground">{r.unit}</span>
                      <span className="text-[9px] text-muted-foreground ml-auto">min: {r.minStock}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mb-2">
                      <div className={`h-full rounded-full transition-all ${cfg.color}`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[9px] text-muted-foreground">Exp: {formatDate(r.expiresAt)}</p>
                    {(r.status === "critical" || r.status === "expired" || r.status === "low") && (
                      <Button size="sm" variant="outline" className="w-full mt-2 text-[10px] h-7" onClick={() => {
                        setReagents(prev => prev.map(rr => rr.id === r.id ? { ...rr, quantity: rr.minStock * 3, status: "ok" as const } : rr));
                        toast.success(`Commande passée pour ${r.name} (mock)`);
                      }}>
                        <Plus className="h-3 w-3 mr-1" />Commander
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Home sampling tab */}
        {tab === "home-sampling" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{samplings.length} prélèvement(s)</p>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => {
                setSamplings(prev => [...prev, {
                  id: Date.now(), patient: "Nouveau Patient", phone: "+216 00 000 000",
                  address: "Adresse à définir", date: new Date().toISOString().split("T")[0],
                  time: "08:00", examens: ["NFS"], status: "scheduled", collector: "Technicien A",
                }]);
                toast.success("Prélèvement planifié (mock)");
              }}>
                <Plus className="h-3.5 w-3.5 mr-1.5" />Planifier
              </Button>
            </div>

            {samplings.map(s => (
              <div key={s.id} className={`rounded-xl border bg-card p-4 shadow-card transition-all hover:shadow-card-hover ${s.status === "cancelled" ? "opacity-50" : ""}`}>
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                    s.status === "completed" ? "bg-accent/10 text-accent" : s.status === "cancelled" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                  }`}>
                    {s.status === "completed" ? <CheckCircle2 className="h-5 w-5" /> : <Truck className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-foreground text-sm">{s.patient}</h4>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                        s.status === "completed" ? "bg-accent/10 text-accent" : s.status === "cancelled" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                      }`}>
                        {s.status === "scheduled" ? "Planifié" : s.status === "completed" ? "Effectué" : "Annulé"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1 flex-wrap">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(s.date)} à {s.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.address}</span>
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{s.phone}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {s.examens.map((e, i) => (
                        <span key={i} className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{e}</span>
                      ))}
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1">Préleveur : {s.collector}</p>
                  </div>
                  {s.status === "scheduled" && (
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button size="sm" className="h-7 text-[9px] gradient-primary text-primary-foreground" onClick={() => {
                        setSamplings(prev => prev.map(ss => ss.id === s.id ? { ...ss, status: "completed" as const } : ss));
                        toast.success("Prélèvement effectué ✓");
                      }}>
                        <CheckCircle2 className="h-3 w-3 mr-1" />Fait
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-[9px] text-destructive" onClick={() => {
                        setSamplings(prev => prev.map(ss => ss.id === s.id ? { ...ss, status: "cancelled" as const } : ss));
                        toast.info("Prélèvement annulé");
                      }}>
                        <X className="h-3 w-3 mr-1" />Annuler
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LaboratoryQuality;
