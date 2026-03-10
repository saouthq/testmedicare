/**
 * LaboratoryQuality — Contrôle qualité, gestion stock réactifs, prélèvements domicile.
 * // TODO BACKEND: GET/POST /api/laboratory/quality
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import {
  Shield, FlaskConical, AlertTriangle, CheckCircle2, Clock, Package,
  TrendingDown, Plus, Search, Edit, Trash2, X, Save, MapPin, Calendar,
  Phone, User, Truck, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

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

const mockControls: QualityControl[] = [
  { id: 1, name: "Contrôle interne - Biochimie", date: "20 Fév 2026", result: "pass", operator: "Technicien A", nextDue: "27 Fév 2026" },
  { id: 2, name: "Contrôle interne - Hématologie", date: "20 Fév 2026", result: "pass", operator: "Technicien B", nextDue: "27 Fév 2026" },
  { id: 3, name: "Calibration Automate #1", date: "19 Fév 2026", result: "pass", operator: "Technicien A", notes: "Calibration OK sur tous les paramètres", nextDue: "26 Fév 2026" },
  { id: 4, name: "Contrôle externe PNASQ", date: "15 Fév 2026", result: "pending", operator: "Dr. Kefi", notes: "Résultats en attente de validation nationale", nextDue: "15 Mai 2026" },
  { id: 5, name: "Vérification Températures", date: "20 Fév 2026", result: "pass", operator: "Technicien C", nextDue: "21 Fév 2026" },
  { id: 6, name: "Contrôle externe - Sérologie", date: "10 Fév 2026", result: "fail", operator: "Dr. Kefi", notes: "Écart sur anti-HCV, recalibration effectuée", nextDue: "10 Mai 2026" },
];

const mockReagents: Reagent[] = [
  { id: 1, name: "Réactif Glucose", lot: "GL-2026-A1", expiresAt: "30 Jun 2026", quantity: 450, unit: "tests", minStock: 100, status: "ok" },
  { id: 2, name: "Réactif HbA1c", lot: "HB-2025-K3", expiresAt: "28 Fév 2026", quantity: 25, unit: "tests", minStock: 50, status: "critical" },
  { id: 3, name: "Kit NFS", lot: "NFS-2026-B2", expiresAt: "15 Sep 2026", quantity: 200, unit: "tests", minStock: 80, status: "ok" },
  { id: 4, name: "Réactif CRP", lot: "CRP-2025-M1", expiresAt: "20 Fév 2026", quantity: 0, unit: "tests", minStock: 30, status: "expired" },
  { id: 5, name: "Réactif TSH", lot: "TSH-2026-C1", expiresAt: "30 Avr 2026", quantity: 45, unit: "tests", minStock: 40, status: "low" },
  { id: 6, name: "Tubes EDTA", lot: "TB-2026-D1", expiresAt: "31 Déc 2026", quantity: 500, unit: "pcs", minStock: 100, status: "ok" },
  { id: 7, name: "Tubes secs", lot: "TB-2026-D2", expiresAt: "31 Déc 2026", quantity: 350, unit: "pcs", minStock: 100, status: "ok" },
];

const mockHomeSamplings: HomeSampling[] = [
  { id: 1, patient: "Nadia Jemni", phone: "+216 98 567 890", address: "22 Rue de Manouba, 2010", date: "21 Fév 2026", time: "08:00", examens: ["Glycémie", "NFS"], status: "scheduled", collector: "Technicien A" },
  { id: 2, patient: "Amine Ben Ali", phone: "+216 71 234 567", address: "15 Av. Liberté, El Manar", date: "20 Fév 2026", time: "07:30", examens: ["Bilan complet"], status: "completed", collector: "Technicien B" },
  { id: 3, patient: "Fatma Trabelsi", phone: "+216 22 345 678", address: "32 Rue de Gaulle, Ariana", date: "22 Fév 2026", time: "09:00", examens: ["ECBU", "Urine"], status: "scheduled", collector: "Technicien A" },
];

const resultConfig = {
  pass: { label: "Conforme", cls: "bg-accent/10 text-accent", icon: CheckCircle2 },
  fail: { label: "Non conforme", cls: "bg-destructive/10 text-destructive", icon: AlertTriangle },
  pending: { label: "En attente", cls: "bg-warning/10 text-warning", icon: Clock },
};

const stockStatusConfig = {
  ok: { label: "OK", cls: "bg-accent/10 text-accent" },
  low: { label: "Stock bas", cls: "bg-warning/10 text-warning" },
  critical: { label: "Critique", cls: "bg-destructive/10 text-destructive" },
  expired: { label: "Expiré", cls: "bg-destructive/10 text-destructive" },
};

const LaboratoryQuality = () => {
  const [tab, setTab] = useState<QualityTab>("controls");
  const [reagents, setReagents] = useState(mockReagents);
  const [samplings, setSamplings] = useState(mockHomeSamplings);

  const alertCount = reagents.filter(r => r.status === "critical" || r.status === "expired").length;
  const lowCount = reagents.filter(r => r.status === "low").length;
  const scheduledSamplings = samplings.filter(s => s.status === "scheduled").length;

  return (
    <DashboardLayout role="laboratory" title="Qualité & Stock">
      <div className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border bg-card p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center"><Shield className="h-5 w-5 text-accent" /></div>
            <div><p className="text-lg font-bold text-accent">{mockControls.filter(c => c.result === "pass").length}</p><p className="text-[10px] text-muted-foreground">Conformes</p></div>
          </div>
          <div className="rounded-xl border bg-destructive/5 border-destructive/20 p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
            <div><p className="text-lg font-bold text-destructive">{alertCount}</p><p className="text-[10px] text-muted-foreground">Alertes stock</p></div>
          </div>
          <div className="rounded-xl border bg-warning/5 border-warning/20 p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center"><TrendingDown className="h-5 w-5 text-warning" /></div>
            <div><p className="text-lg font-bold text-warning">{lowCount}</p><p className="text-[10px] text-muted-foreground">Stocks bas</p></div>
          </div>
          <div className="rounded-xl border bg-primary/5 border-primary/20 p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Truck className="h-5 w-5 text-primary" /></div>
            <div><p className="text-lg font-bold text-primary">{scheduledSamplings}</p><p className="text-[10px] text-muted-foreground">Prélèvements</p></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg border bg-card p-0.5 w-fit">
          {([
            { key: "controls" as QualityTab, label: "Contrôles qualité", icon: Shield },
            { key: "stock" as QualityTab, label: "Stock réactifs", icon: Package },
            { key: "home-sampling" as QualityTab, label: "Prélèvements domicile", icon: Truck },
          ]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 ${tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <t.icon className="h-3.5 w-3.5" />{t.label}
            </button>
          ))}
        </div>

        {/* Controls tab */}
        {tab === "controls" && (
          <div className="space-y-3">
            {mockControls.map(ctrl => {
              const cfg = resultConfig[ctrl.result];
              const Icon = cfg.icon;
              return (
                <div key={ctrl.id} className={`rounded-xl border bg-card p-4 shadow-card ${ctrl.result === "fail" ? "border-l-4 border-l-destructive" : ""}`}>
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.cls}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-foreground text-sm">{ctrl.name}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cfg.cls}`}>{cfg.label}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>{ctrl.date}</span><span>·</span><span>{ctrl.operator}</span>
                        <span>·</span><span>Prochain : {ctrl.nextDue}</span>
                      </div>
                      {ctrl.notes && <p className="text-xs text-muted-foreground mt-1 bg-muted/50 rounded px-2 py-1">{ctrl.notes}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stock tab */}
        {tab === "stock" && (
          <div className="rounded-xl border bg-card shadow-card overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b text-left">
                <th className="p-3 text-[11px] font-medium text-muted-foreground">Réactif</th>
                <th className="p-3 text-[11px] font-medium text-muted-foreground hidden sm:table-cell">Lot</th>
                <th className="p-3 text-[11px] font-medium text-muted-foreground">Stock</th>
                <th className="p-3 text-[11px] font-medium text-muted-foreground hidden md:table-cell">Expiration</th>
                <th className="p-3 text-[11px] font-medium text-muted-foreground">Statut</th>
              </tr></thead>
              <tbody className="divide-y">
                {reagents.map(r => {
                  const cfg = stockStatusConfig[r.status];
                  const pct = Math.min(100, Math.round((r.quantity / (r.minStock * 3)) * 100));
                  return (
                    <tr key={r.id} className={`hover:bg-muted/30 ${r.status === "critical" || r.status === "expired" ? "bg-destructive/5" : ""}`}>
                      <td className="p-3"><p className="text-xs font-medium text-foreground">{r.name}</p></td>
                      <td className="p-3 text-xs text-muted-foreground hidden sm:table-cell">{r.lot}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">{r.quantity} {r.unit}</span>
                          <div className="h-1.5 w-16 bg-muted rounded-full hidden sm:block">
                            <div className={`h-full rounded-full ${r.status === "ok" ? "bg-accent" : r.status === "low" ? "bg-warning" : "bg-destructive"}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Min: {r.minStock}</p>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">{r.expiresAt}</td>
                      <td className="p-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cfg.cls}`}>{cfg.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Home sampling tab */}
        {tab === "home-sampling" && (
          <div className="space-y-3">
            {samplings.map(s => (
              <div key={s.id} className={`rounded-xl border bg-card p-4 shadow-card ${s.status === "cancelled" ? "opacity-50" : ""}`}>
                <div className="flex items-start gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${s.status === "completed" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"}`}>
                    {s.status === "completed" ? <CheckCircle2 className="h-5 w-5" /> : <Truck className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground text-sm">{s.patient}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${s.status === "completed" ? "bg-accent/10 text-accent" : s.status === "cancelled" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                        {s.status === "scheduled" ? "Planifié" : s.status === "completed" ? "Effectué" : "Annulé"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{s.date} à {s.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.address}</span>
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{s.phone}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {s.examens.map((e, i) => (
                        <span key={i} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{e}</span>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Préleveur : {s.collector}</p>
                  </div>
                  {s.status === "scheduled" && (
                    <div className="flex gap-1.5 shrink-0">
                      <Button size="sm" className="h-7 text-[10px] gradient-primary text-primary-foreground" onClick={() => {
                        setSamplings(prev => prev.map(ss => ss.id === s.id ? { ...ss, status: "completed" as const } : ss));
                        toast({ title: "Prélèvement effectué" });
                      }}>
                        <CheckCircle2 className="h-3 w-3 mr-1" />Fait
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
