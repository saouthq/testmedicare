/**
 * AdminOnboarding — Suivi du funnel d'inscription partenaires avec étapes et taux de conversion
 * TODO BACKEND: Replace with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import {
  UserPlus, ArrowRight, CheckCircle, Clock, XCircle, TrendingUp,
  BarChart3, Eye, Filter, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

type FunnelStep = "started" | "profile_filled" | "docs_uploaded" | "plan_chosen" | "kyc_submitted" | "activated";

interface OnboardingRecord {
  id: string;
  name: string;
  type: "doctor" | "pharmacy" | "lab";
  email: string;
  currentStep: FunnelStep;
  startedAt: string;
  lastActivity: string;
  stuckDays: number;
}

const stepLabels: Record<FunnelStep, string> = {
  started: "Inscription démarrée",
  profile_filled: "Profil rempli",
  docs_uploaded: "Documents uploadés",
  plan_chosen: "Plan choisi",
  kyc_submitted: "KYC soumis",
  activated: "Activé",
};

const stepColors: Record<FunnelStep, string> = {
  started: "bg-muted text-muted-foreground",
  profile_filled: "bg-primary/10 text-primary",
  docs_uploaded: "bg-warning/10 text-warning",
  plan_chosen: "bg-accent/10 text-accent",
  kyc_submitted: "bg-primary/10 text-primary",
  activated: "bg-accent/10 text-accent",
};

const mockRecords: OnboardingRecord[] = [
  { id: "ob-1", name: "Dr. Salah Zouari", type: "doctor", email: "salah@email.tn", currentStep: "docs_uploaded", startedAt: "2026-03-05", lastActivity: "2026-03-07", stuckDays: 3 },
  { id: "ob-2", name: "Pharmacie Riadh", type: "pharmacy", email: "riadh@pharmacy.tn", currentStep: "plan_chosen", startedAt: "2026-03-06", lastActivity: "2026-03-08", stuckDays: 2 },
  { id: "ob-3", name: "Dr. Leila Mansouri", type: "doctor", email: "leila@email.tn", currentStep: "started", startedAt: "2026-03-08", lastActivity: "2026-03-08", stuckDays: 2 },
  { id: "ob-4", name: "Labo Pasteur", type: "lab", email: "pasteur@lab.tn", currentStep: "kyc_submitted", startedAt: "2026-03-04", lastActivity: "2026-03-09", stuckDays: 1 },
  { id: "ob-5", name: "Dr. Karim Nasri", type: "doctor", email: "karim.n@email.tn", currentStep: "profile_filled", startedAt: "2026-03-07", lastActivity: "2026-03-07", stuckDays: 3 },
  { id: "ob-6", name: "Pharmacie Ben Ali", type: "pharmacy", email: "benali@pharmacy.tn", currentStep: "activated", startedAt: "2026-03-01", lastActivity: "2026-03-03", stuckDays: 0 },
  { id: "ob-7", name: "Dr. Amira Kouki", type: "doctor", email: "amira@email.tn", currentStep: "activated", startedAt: "2026-02-28", lastActivity: "2026-03-02", stuckDays: 0 },
];

const funnelData = [
  { step: "Inscription", count: 45, fill: "hsl(var(--primary))" },
  { step: "Profil", count: 38, fill: "hsl(var(--primary))" },
  { step: "Documents", count: 28, fill: "hsl(var(--warning))" },
  { step: "Plan", count: 22, fill: "hsl(var(--accent))" },
  { step: "KYC", count: 18, fill: "hsl(var(--primary))" },
  { step: "Activé", count: 14, fill: "hsl(var(--accent))" },
];

const typeLabels: Record<string, string> = { doctor: "Médecin", pharmacy: "Pharmacie", lab: "Laboratoire" };
const typeColors: Record<string, string> = { doctor: "bg-primary/10 text-primary", pharmacy: "bg-warning/10 text-warning", lab: "bg-accent/10 text-accent" };

const AdminOnboarding = () => {
  const [records] = useState(mockRecords);
  const [search, setSearch] = useState("");
  const [filterStep, setFilterStep] = useState<string>("all");
  const [selected, setSelected] = useState<OnboardingRecord | null>(null);

  const filtered = useMemo(() => records.filter(r => {
    if (filterStep !== "all" && r.currentStep !== filterStep) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q);
    }
    return true;
  }), [records, search, filterStep]);

  const stuckCount = records.filter(r => r.stuckDays >= 3 && r.currentStep !== "activated").length;
  const conversionRate = Math.round((records.filter(r => r.currentStep === "activated").length / records.length) * 100);

  return (
    <DashboardLayout role="admin" title="Suivi Onboarding Partenaires">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <UserPlus className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{records.length}</p>
            <p className="text-xs text-muted-foreground">Inscriptions en cours</p>
          </div>
          <div className="rounded-xl border bg-accent/5 p-5 shadow-card">
            <CheckCircle className="h-5 w-5 text-accent mb-2" />
            <p className="text-2xl font-bold text-accent">{records.filter(r => r.currentStep === "activated").length}</p>
            <p className="text-xs text-muted-foreground">Activés</p>
          </div>
          <div className="rounded-xl border bg-destructive/5 p-5 shadow-card">
            <Clock className="h-5 w-5 text-destructive mb-2" />
            <p className="text-2xl font-bold text-destructive">{stuckCount}</p>
            <p className="text-xs text-muted-foreground">Bloqués (≥3 jours)</p>
          </div>
          <div className="rounded-xl border bg-primary/5 p-5 shadow-card">
            <TrendingUp className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-primary">{conversionRate}%</p>
            <p className="text-xs text-muted-foreground">Taux de conversion</p>
          </div>
        </div>

        {/* Funnel chart */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-primary" />Funnel d'inscription (30 derniers jours)
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical">
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis type="category" dataKey="step" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={80} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {funnelData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher par nom ou email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <select value={filterStep} onChange={e => setFilterStep(e.target.value)} className="rounded-lg border bg-card px-3 py-2 text-sm">
            <option value="all">Toutes les étapes</option>
            {Object.entries(stepLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Partenaire</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Étape actuelle</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Jours bloqué</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Dernière activité</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className={`border-b last:border-0 hover:bg-muted/20 ${r.stuckDays >= 3 && r.currentStep !== "activated" ? "bg-destructive/5" : ""}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[r.type]}`}>{typeLabels[r.type]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stepColors[r.currentStep]}`}>{stepLabels[r.currentStep]}</span>
                  </td>
                  <td className="px-4 py-3 text-center hidden md:table-cell">
                    {r.currentStep === "activated" ? (
                      <CheckCircle className="h-4 w-4 text-accent mx-auto" />
                    ) : (
                      <span className={`text-sm font-bold ${r.stuckDays >= 3 ? "text-destructive" : "text-foreground"}`}>{r.stuckDays}j</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{r.lastActivity}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setSelected(r)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail sheet */}
      <Sheet open={!!selected} onOpenChange={v => !v && setSelected(null)}>
        <SheetContent className="sm:max-w-md flex flex-col p-0">
          {selected && (
            <>
              <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
                <SheetTitle>{selected.name}</SheetTitle>
                <SheetDescription className="sr-only">Détail onboarding</SheetDescription>
              </SheetHeader>
              <ScrollArea className="flex-1 px-6 py-4">
                <div className="space-y-5">
                  <div className="rounded-lg border p-4 space-y-3">
                    {[
                      ["Email", selected.email],
                      ["Type", typeLabels[selected.type]],
                      ["Inscription", selected.startedAt],
                      ["Dernière activité", selected.lastActivity],
                    ].map(([l, v]) => (
                      <div key={l} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{l}</span>
                        <span className="font-medium text-foreground">{v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Progress steps */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Progression</p>
                    <div className="space-y-2">
                      {(Object.entries(stepLabels) as [FunnelStep, string][]).map(([step, label], i) => {
                        const steps = Object.keys(stepLabels) as FunnelStep[];
                        const currentIdx = steps.indexOf(selected.currentStep);
                        const stepIdx = steps.indexOf(step);
                        const isDone = stepIdx <= currentIdx;
                        const isCurrent = stepIdx === currentIdx;
                        return (
                          <div key={step} className={`flex items-center gap-3 p-2 rounded-lg ${isCurrent ? "bg-primary/10 border border-primary/20" : ""}`}>
                            {isDone ? (
                              <CheckCircle className={`h-4 w-4 shrink-0 ${isCurrent ? "text-primary" : "text-accent"}`} />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                            )}
                            <span className={`text-sm ${isDone ? "text-foreground font-medium" : "text-muted-foreground"}`}>{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {selected.currentStep !== "activated" && selected.stuckDays >= 2 && (
                    <Button className="w-full gradient-primary text-primary-foreground">
                      Envoyer une relance email
                    </Button>
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default AdminOnboarding;
