/**
 * ActionDock — Colonne droite de la consultation généraliste
 *
 * 4 onglets sans redondance :
 *   Rx       → prescription pad complet
 *   Analyses → demandes d'examens + suggestions IA
 *   Docs     → CR, certificat, arrêt, RDV (SEUL endroit pour y accéder)
 *   Clôture  → résumé + paiement + envois + bouton fermer
 *
 * Logique métier :
 *   - Clôturer est toujours accessible dès que motif + diagnostic sont remplis
 *   - Rx et analyses sont OPTIONNELS (consultation sans Rx = normal)
 *   - Le paiement est défini dans l'onglet Clôture avant d'ouvrir la modal de confirmation
 */

import {
  Activity,
  Banknote,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  CreditCard,
  FileSignature,
  FileText,
  Pill,
  Plus,
  Printer,
  Receipt,
  Search,
  Send,
  Stethoscope,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";
import { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConsultation } from "./ConsultationContext";
import type { PaymentMode } from "./types";
import { scrollToId } from "./helpers";
import { mockMedicines } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";
import { useDoctorSubscription } from "@/stores/doctorSubscriptionStore";
import { getSpecialtyConfig } from "./specialtyConfig";
import { getSpecialtyMeds, getSpecialtyLabs, baseMeds } from "./specialtyMedDB";

// ── Medicine DB — now specialty-aware ─────────────────────────
const BASE_MED_DB = [
  ...mockMedicines.map((m) => ({ name: `${m.name} ${m.dosage}`, form: m.form })),
  ...baseMeds,
];

const POSOLOGY_PRESETS = [
  { label: "1×/j", dosage: "1 comprimé par jour" },
  { label: "2×/j", dosage: "1 comprimé matin et soir" },
  { label: "3×/j", dosage: "1 comprimé 3 fois par jour" },
  { label: "SOS", dosage: "Si besoin (max 3/j)" },
];

const DURATION_PRESETS = ["3j", "5j", "7j", "10j", "14j", "1 mois", "3 mois"];

// ── Pill button (preset selector) ─────────────────────────────
function Preset({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition-all ${
        active
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

// ── Rx item card ───────────────────────────────────────────────
function RxItemCard({ idx }: { idx: number }) {
  const ctx = useConsultation();
  const item = ctx.rxItems[idx];
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  const [sub] = useDoctorSubscription();

  // Merge specialty-specific meds with base DB
  const MED_DB = useMemo(() => {
    const specialtyMeds = getSpecialtyMeds(sub.activity, sub.specialty);
    const merged = [...specialtyMeds, ...BASE_MED_DB];
    // Deduplicate by name
    const seen = new Set<string>();
    return merged.filter(m => { if (seen.has(m.name)) return false; seen.add(m.name); return true; });
  }, [sub.activity, sub.specialty]);

  const suggestions = useMemo(() => {
    const q = (query || item.medication).toLowerCase();
    if (q.length < 2) return [];
    return MED_DB.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query, item.medication, MED_DB]);

  const selectMed = (name: string) => {
    ctx.updateRxItem(idx, "medication", name);
    setQuery("");
    setOpen(false);
  };

  const complete = item.medication.trim() && item.dosage.trim();

  return (
    <div
      className={`rounded-xl border transition-colors ${complete ? "border-primary/25 bg-primary/3" : "bg-background"}`}
    >
      {/* Card header */}
      <div
        className={`flex items-center px-3 py-2 border-b gap-2 ${complete ? "bg-primary/5" : "bg-muted/30"} rounded-t-xl`}
      >
        <div
          className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
            complete ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {idx + 1}
        </div>
        <span className="text-[11px] font-semibold text-foreground flex-1 truncate">
          {item.medication || "Nouveau médicament"}
        </span>
        <button
          onClick={() => ctx.removeRxItem(idx)}
          className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      <div className="p-3 space-y-2.5">
        {/* Medication search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
          <Input
            ref={ref}
            value={item.medication}
            onChange={(e) => {
              ctx.updateRxItem(idx, "medication", e.target.value);
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="Rechercher…"
            className="h-8 text-xs pl-8"
          />
          {open && suggestions.length > 0 && (
            <div className="absolute z-30 left-0 right-0 top-full mt-1 rounded-xl border bg-card shadow-lg max-h-36 overflow-y-auto">
              {suggestions.map((s) => (
                <button
                  key={s.name}
                  onMouseDown={() => selectMed(s.name)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-muted/50 flex items-center justify-between gap-2"
                >
                  <span className="font-medium">{s.name}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">{s.form}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Posology */}
        <div>
          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Posologie</Label>
          <div className="flex flex-wrap gap-1 mt-1">
            {POSOLOGY_PRESETS.map((p) => (
              <Preset
                key={p.label}
                label={p.label}
                active={item.dosage === p.dosage}
                onClick={() => ctx.updateRxItem(idx, "dosage", p.dosage)}
              />
            ))}
          </div>
          <Input
            value={item.dosage}
            onChange={(e) => ctx.updateRxItem(idx, "dosage", e.target.value)}
            placeholder="Ou saisie libre…"
            className="h-7 text-xs mt-1.5"
          />
        </div>

        {/* Duration */}
        <div>
          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Durée</Label>
          <div className="flex flex-wrap gap-1 mt-1">
            {DURATION_PRESETS.map((d) => (
              <Preset
                key={d}
                label={d}
                active={item.duration === d}
                onClick={() => ctx.updateRxItem(idx, "duration", d)}
              />
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div>
          <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Consignes</Label>
          <Input
            value={item.instructions}
            onChange={(e) => ctx.updateRxItem(idx, "instructions", e.target.value)}
            placeholder="Avant/après repas, à jeun, le soir…"
            className="h-7 text-xs mt-1"
          />
        </div>
      </div>
    </div>
  );
}

// ── Completion dot ─────────────────────────────────────────────
function StatusDot({ ok }: { ok: boolean }) {
  return ok ? (
    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
  ) : (
    <Circle className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
  );
}

// ── Tab bar ────────────────────────────────────────────────────
// Tab labels now dynamic in ActionDock component based on specialty

// ── Payment mode selector ──────────────────────────────────────
const PAYMENT_MODES: { key: PaymentMode; label: string; Icon: any }[] = [
  { key: "cash", label: "Espèces", Icon: Banknote },
  { key: "card", label: "Carte", Icon: CreditCard },
  { key: "insurance", label: "Assurance", Icon: Receipt },
  { key: "deferred", label: "Différé", Icon: AlertTriangle },
];

// ─────────────────────────────────────────────────────────────
export function ActionDock() {
  const ctx = useConsultation();
  const [sub] = useDoctorSubscription();
  const config = getSpecialtyConfig(sub.activity, sub.specialty);
  const dockLabels = config.dockTabs || { rx: "Rx", labs: "Analyses", docs: "Docs", close: "Clôture" };
  
  // Specialty-specific lab suggestions
  const specialtyLabSuggestions = useMemo(() => {
    const labList = getSpecialtyLabs(sub.activity, sub.specialty);
    return labList.filter(l => !ctx.analyses.includes(l));
  }, [sub.activity, sub.specialty, ctx.analyses]);

  const TABS = [
    { key: "rx" as const, icon: Pill, label: dockLabels.rx },
    { key: "labs" as const, icon: Activity, label: dockLabels.labs },
    { key: "docs" as const, icon: FileText, label: dockLabels.docs },
    { key: "close" as const, icon: CheckCircle2, label: dockLabels.close },
  ] as const;

  // Badge counts
  const rxCount = ctx.rxItems.filter((i) => i.medication.trim()).length;
  const labsCount = ctx.analyses.length;
  const docsCount = [ctx.rxSignedAt, ctx.reportSignedAt, ctx.certSignedAt, ctx.slSignedAt, ctx.rdvConfirmedAt].filter(
    Boolean,
  ).length;

  const canClose = ctx.completion.notesOk;

  const handleConfirmClose = () => {
    if (!canClose) {
      toast({
        title: "Notes incomplètes",
        description: "Motif, anamnèse, examen et diagnostic sont requis.",
        variant: "destructive",
      });
      scrollToId("notes");
      return;
    }
    ctx.setShowCloseModal(true);
  };

  return (
    <aside className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-primary" /> Prescription
        </h3>
        {ctx.completion.notesOk && (
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
            Prêt à clôturer
          </span>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="grid grid-cols-4 border-b">
        {TABS.map((tab) => {
          const count =
            tab.key === "rx" ? rxCount : tab.key === "labs" ? labsCount : tab.key === "docs" ? docsCount : null;
          const isClose = tab.key === "close";
          const active = ctx.dockTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => ctx.setDockTab(tab.key)}
              className={`relative flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition-all border-b-2 ${
                active
                  ? isClose
                    ? "text-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-500"
                    : "text-primary bg-primary/5 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30 border-transparent"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {count !== null && count > 0 && (
                <span
                  className={`absolute top-1.5 right-2 h-3.5 w-3.5 rounded-full text-[9px] font-bold flex items-center justify-center ${
                    active ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ── */}
      <div className="p-4">
        {/* ══════════════ Rx ══════════════ */}
        {ctx.dockTab === "rx" && (
          <div className="space-y-3">
            {/* Signed banner */}
            {ctx.rxSignedAt && (
              <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Ordonnance signée</p>
                  <p className="text-[10px] text-muted-foreground">
                    {ctx.rxSignedAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            )}

            {/* Header row */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-foreground">Ordonnance</p>
                <p className="text-[11px] text-muted-foreground">
                  {rxCount === 0 ? "Optionnelle" : `${rxCount} médicament${rxCount > 1 ? "s" : ""}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => ctx.doPrint("Ordonnance", ctx.rxPrintHtml)}
                  disabled={rxCount === 0}
                  title="Imprimer"
                >
                  <Printer className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-xs gradient-primary text-primary-foreground shadow-sm"
                  onClick={() => ctx.openSlide("rx", 0)}
                  disabled={rxCount === 0}
                >
                  <FileSignature className="h-3.5 w-3.5 mr-1.5" /> Finaliser
                </Button>
              </div>
            </div>

            {/* Favorites */}
            {ctx.rxFavorites.length > 0 && (
              <div className="rounded-xl bg-muted/30 border p-2.5">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                  Favoris (1 clic)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ctx.rxFavorites.map((f) => (
                    <button
                      key={f.label}
                      onClick={() => ctx.addFavToRx(f)}
                      className="px-2.5 py-1 rounded-lg border bg-card hover:bg-primary/5 hover:border-primary/40 hover:text-primary text-xs font-medium transition-all"
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Med cards */}
            <div className="space-y-2">
              {ctx.rxItems.map((_, idx) => (
                <RxItemCard key={idx} idx={idx} />
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-9 border-dashed hover:border-primary/50 hover:text-primary"
              onClick={ctx.addRxItem}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Ajouter un médicament
            </Button>
          </div>
        )}

        {/* ══════════════ Analyses ══════════════ */}
        {ctx.dockTab === "labs" && (
          <div className="space-y-3">
            {ctx.labsSignedAt && (
              <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Envoyées au laboratoire</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-foreground">Analyses</p>
                <p className="text-[11px] text-muted-foreground">
                  {labsCount === 0 ? "Optionnelles" : `${labsCount} examen${labsCount > 1 ? "s" : ""}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => ctx.doPrint("Prescription d'analyses", ctx.labsPrintHtml)}
                  disabled={labsCount === 0}
                  title="Imprimer"
                >
                  <Printer className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-xs gradient-primary text-primary-foreground shadow-sm"
                  onClick={() => ctx.openSlide("labs", 1)}
                  disabled={labsCount === 0}
                >
                  <Send className="h-3.5 w-3.5 mr-1.5" /> Envoyer
                </Button>
              </div>
            </div>

            {/* Quick add */}
            <div className="flex gap-2">
              <Input
                value={ctx.newAnalyse}
                onChange={(e) => ctx.setNewAnalyse(e.target.value)}
                placeholder="Ajouter une analyse…"
                className="h-8 text-xs"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    ctx.addAnalyse();
                  }
                }}
              />
              <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => ctx.addAnalyse()}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Smart suggestions — specialty-specific */}
            {(specialtyLabSuggestions.length > 0 || ctx.labSuggestions.length > 0) && (
              <div className="rounded-xl bg-muted/30 border p-2.5">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                  {specialtyLabSuggestions.length > 0 ? `Examens ${config.label}` : "Suggestions selon le diagnostic"}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(specialtyLabSuggestions.length > 0 ? specialtyLabSuggestions : ctx.labSuggestions).slice(0, 12).map((s) => (
                    <button
                      key={s}
                      onClick={() => ctx.addAnalyse(s)}
                      className="px-2.5 py-1 rounded-lg border bg-card hover:bg-primary/5 hover:border-primary/40 hover:text-primary text-xs transition-all"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Analysis list */}
            {labsCount > 0 ? (
              <div className="space-y-1.5">
                {ctx.analyses.map((a, i) => (
                  <div key={a} className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2 group">
                    <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-xs text-foreground flex-1">{a}</span>
                    <button
                      onClick={() => ctx.removeAnalyse(a)}
                      className="opacity-0 group-hover:opacity-100 h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-destructive transition-all"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-3">Aucune analyse — optionnel</p>
            )}
          </div>
        )}

        {/* ══════════════ Docs ══════════════ */}
        {ctx.dockTab === "docs" && (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-bold text-foreground">Documents</p>
              <p className="text-[11px] text-muted-foreground">Tous optionnels selon la consultation</p>
            </div>

            <div className="space-y-2">
              {(
                [
                  {
                    type: "report" as const,
                    label: "Compte-rendu",
                    desc: "Résumé structuré de la consultation",
                    icon: FileText,
                    color: "text-blue-500",
                    bg: "bg-blue-50 dark:bg-blue-950/30",
                    signed: ctx.reportSignedAt,
                  },
                  {
                    type: "certificate" as const,
                    label: "Certificat médical",
                    desc: "Aptitude, inaptitude, état de santé",
                    icon: FileSignature,
                    color: "text-amber-500",
                    bg: "bg-amber-50 dark:bg-amber-950/30",
                    signed: ctx.certSignedAt,
                  },
                  {
                    type: "sickleave" as const,
                    label: "Arrêt de travail",
                    desc: "Durée et consignes de repos",
                    icon: Calendar,
                    color: "text-rose-500",
                    bg: "bg-rose-50 dark:bg-rose-950/30",
                    signed: ctx.slSignedAt,
                  },
                  {
                    type: "rdv" as const,
                    label: "Prochain RDV",
                    desc: "Planifier le suivi",
                    icon: Clock,
                    color: "text-violet-500",
                    bg: "bg-violet-50 dark:bg-violet-950/30",
                    signed: ctx.rdvConfirmedAt,
                  },
                ] as const
              ).map((d) => (
                <button
                  key={d.type}
                  onClick={() => ctx.openSlide(d.type, 0)}
                  className="w-full rounded-xl border bg-background hover:bg-muted/30 px-3 py-2.5 flex items-center gap-3 text-left transition-all group"
                >
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${d.signed ? "bg-emerald-100 dark:bg-emerald-900/40" : d.bg}`}
                  >
                    <d.icon className={`h-4 w-4 ${d.signed ? "text-emerald-600" : d.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                      {d.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{d.desc}</p>
                  </div>
                  {d.signed ? (
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
                      Signé
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground shrink-0">→</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════ Clôture ══════════════ */}
        {ctx.dockTab === "close" && (
          <div className="space-y-4">
            {/* Pre-flight checklist */}
            <div>
              <p className="text-sm font-bold text-foreground mb-2">Avant de clôturer</p>
              <div className="space-y-1.5">
                {[
                  {
                    label: "Constantes saisies",
                    ok: ctx.completion.vitalsOk,
                    action: () => ctx.setVitalsOpen(true),
                    optional: false,
                  },
                  {
                    label: "Motif renseigné",
                    ok: !!ctx.motif.trim(),
                    action: () => scrollToId("notes"),
                    optional: false,
                  },
                  {
                    label: "Examen clinique",
                    ok: !!ctx.examination.trim(),
                    action: () => scrollToId("notes"),
                    optional: false,
                  },
                  {
                    label: "Diagnostic posé",
                    ok: !!ctx.diagnosis.trim(),
                    action: () => scrollToId("notes"),
                    optional: false,
                  },
                  {
                    label: `Ordonnance (${rxCount})`,
                    ok: rxCount > 0,
                    action: () => ctx.setDockTab("rx"),
                    optional: true,
                  },
                  {
                    label: `Analyses (${labsCount})`,
                    ok: labsCount > 0,
                    action: () => ctx.setDockTab("labs"),
                    optional: true,
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 ${
                      s.ok
                        ? "bg-emerald-50/60 dark:bg-emerald-950/20"
                        : s.optional
                          ? "bg-background"
                          : "bg-amber-50/60 dark:bg-amber-950/20"
                    }`}
                  >
                    <StatusDot ok={s.ok} />
                    <span className={`text-xs flex-1 ${s.ok ? "text-foreground" : "text-muted-foreground"}`}>
                      {s.label}
                      {s.optional && !s.ok && <span className="text-[10px] ml-1 opacity-60">(optionnel)</span>}
                    </span>
                    {!s.ok && !s.optional && (
                      <button onClick={s.action} className="text-[10px] text-amber-600 hover:underline font-medium">
                        Compléter
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Documents à envoyer */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Documents à envoyer à la clôture
              </p>
              <div className="space-y-1.5">
                {[
                  {
                    key: "rx" as const,
                    label: "Ordonnance",
                    dest: "Patient + Pharmacie",
                    signed: !!ctx.rxSignedAt,
                    available: rxCount > 0,
                    signAction: () => ctx.openSlide("rx", 0),
                  },
                  {
                    key: "analyses" as const,
                    label: "Demande d'analyses",
                    dest: "Patient + Laboratoire",
                    signed: !!ctx.labsSignedAt,
                    available: labsCount > 0,
                    signAction: () => ctx.openSlide("labs", 0),
                  },
                  {
                    key: "report" as const,
                    label: "Compte-rendu",
                    dest: "Patient + Dossier",
                    signed: !!ctx.reportSignedAt,
                    available: true,
                    signAction: () => ctx.openSlide("report", 0),
                  },
                ].map((doc) => (
                  <label
                    key={doc.key}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all ${
                      !doc.available
                        ? "opacity-40 cursor-not-allowed"
                        : ctx.sendDocs[doc.key]
                          ? "border-primary/30 bg-primary/5 cursor-pointer"
                          : "cursor-pointer hover:bg-muted/30"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={ctx.sendDocs[doc.key] && doc.available}
                      onChange={() => doc.available && ctx.setSendDocs((p) => ({ ...p, [doc.key]: !p[doc.key] }))}
                      disabled={!doc.available}
                      className="rounded shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{doc.label}</p>
                      <p className="text-[10px] text-muted-foreground">{doc.available ? doc.dest : "Non disponible"}</p>
                    </div>
                    {doc.available &&
                      (doc.signed ? (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded-full shrink-0">
                          ✓ Signé
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            doc.signAction();
                          }}
                          className="text-[10px] text-amber-600 hover:underline font-medium shrink-0"
                        >
                          Signer
                        </button>
                      ))}
                  </label>
                ))}
              </div>
            </div>

            {/* CTA */}
            <Button
              className={`w-full h-10 font-semibold text-sm ${
                canClose ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm" : "opacity-50 cursor-not-allowed"
              }`}
              onClick={handleConfirmClose}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Clôturer la consultation
            </Button>

            {!canClose && (
              <p className="text-[11px] text-muted-foreground text-center">Motif, examen et diagnostic sont requis.</p>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
