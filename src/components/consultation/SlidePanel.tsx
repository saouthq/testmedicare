/**
 * SlidePanel — Rédaction + signature de documents médicaux
 *
 * Workflow par document :
 *   Rédiger → Signer       (ordonnance, analyses, CR, certificat, arrêt)
 *   Choisir un créneau     (RDV — pas de signature, juste confirmer le slot)
 *
 * Après signature :
 *   Le document affiche un badge "Signé" + bouton "Modifier"
 *   Modifier annule la signature et retourne à l'étape Rédiger
 */

import {
  Activity,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit2,
  FileSignature,
  FileText,
  Pen,
  Pill,
  Plus,
  Printer,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConsultation } from "./ConsultationContext";

// ── Helpers ───────────────────────────────────────────────────
const DAYS_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const MONTHS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

// Mock agenda slots — in real app comes from doctorStore/calendar
function generateSlots(date: Date): string[] {
  const day = date.getDay();
  if (day === 0 || day === 6) return []; // weekend = no slots
  // Deterministic based on date hash
  const hash = date.getDate() + date.getMonth() * 31;
  const allSlots = [
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
  ];
  const takenCount = (hash % 6) + 3;
  const takenIndices = new Set<number>();
  let seed = hash;
  while (takenIndices.size < takenCount) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    takenIndices.add(seed % allSlots.length);
  }
  return allSlots.filter((_, i) => !takenIndices.has(i));
}

// ── Shell ─────────────────────────────────────────────────────
export function SlidePanel() {
  const ctx = useConsultation();
  if (!ctx.slideOpen) return null;

  const isRdv = ctx.slideType === "rdv";
  const onLastStep = ctx.slideIsLastStep;

  // Per-doc signed state
  const signedAt: Date | null =
    {
      rx: ctx.rxSignedAt,
      labs: ctx.labsSignedAt,
      report: ctx.reportSignedAt,
      certificate: ctx.certSignedAt,
      sickleave: ctx.slSignedAt,
      rdv: null,
    }[ctx.slideType] ?? null;

  const resetSign = () => {
    if (ctx.slideType === "rx") ctx.setRxSignedAt(null);
    else if (ctx.slideType === "labs") ctx.setLabsSignedAt(null);
    else if (ctx.slideType === "report") ctx.setReportSignedAt(null);
    else if (ctx.slideType === "certificate") ctx.setCertSignedAt(null);
    else if (ctx.slideType === "sickleave") ctx.setSlSignedAt(null);
    ctx.setSlideStep(0);
  };

  const docIcon: Record<string, React.ElementType> = {
    rx: Pill,
    labs: Activity,
    report: FileText,
    certificate: FileSignature,
    sickleave: Calendar,
    rdv: Calendar,
  };
  const DocIcon = docIcon[ctx.slideType] ?? FileText;

  return (
    <div className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm" onClick={ctx.closeSlide}>
      <div
        className="absolute right-0 top-0 h-full w-full max-w-xl bg-card border-l shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="px-5 py-4 border-b">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                  signedAt ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-primary/10"
                }`}
              >
                {signedAt ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <DocIcon className="h-4 w-4 text-primary" />
                )}
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                  {ctx.slideTitle}
                </p>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground leading-tight">
                    {isRdv ? ctx.slideSteps[0] : ctx.slideStep === 0 ? "Rédiger" : "Signer"}
                  </h3>
                  {signedAt && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      Signé {signedAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={ctx.closeSlide}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Step indicators — only for non-RDV docs */}
          {!isRdv && (
            <div className="flex items-center gap-2 mt-3">
              {ctx.slideSteps.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  {i > 0 && <div className={`h-px w-6 ${i <= ctx.slideStep ? "bg-primary" : "bg-muted"}`} />}
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                      i === ctx.slideStep
                        ? "bg-primary/10 text-primary"
                        : i < ctx.slideStep
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i < ctx.slideStep && <CheckCircle2 className="h-3 w-3" />}
                    {i + 1}. {s}
                  </div>
                </div>
              ))}
              {ctx.slideFeedback && (
                <span className="ml-auto text-[11px] font-semibold text-emerald-600">{ctx.slideFeedback}</span>
              )}
            </div>
          )}

          {/* Modify after sign banner */}
          {signedAt && ctx.slideStep === 1 && (
            <button
              onClick={resetSign}
              className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Modifier le document — annule la signature actuelle
            </button>
          )}
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto min-h-0 p-5">
          {ctx.slideType === "rx" && ctx.slideStep === 0 && <RxWrite />}
          {ctx.slideType === "rx" && ctx.slideStep === 1 && <DocSign />}
          {ctx.slideType === "labs" && ctx.slideStep === 0 && <LabsWrite />}
          {ctx.slideType === "labs" && ctx.slideStep === 1 && <DocSign />}
          {ctx.slideType === "report" && ctx.slideStep === 0 && <ReportWrite />}
          {ctx.slideType === "report" && ctx.slideStep === 1 && <DocSign />}
          {ctx.slideType === "certificate" && ctx.slideStep === 0 && <CertWrite />}
          {ctx.slideType === "certificate" && ctx.slideStep === 1 && <DocSign />}
          {ctx.slideType === "sickleave" && ctx.slideStep === 0 && <SickWrite />}
          {ctx.slideType === "sickleave" && ctx.slideStep === 1 && <DocSign />}
          {ctx.slideType === "rdv" && <RdvSlotPicker />}
        </div>

        {/* ── Footer ── */}
        {!isRdv && (
          <div className="px-5 py-4 border-t flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={ctx.slideStep > 0 ? () => ctx.setSlideStep((s) => s - 1) : ctx.closeSlide}
            >
              {ctx.slideStep > 0 ? "← Retour" : "Fermer"}
            </Button>
            <Button
              className={`font-semibold px-6 ${
                onLastStep
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  : "gradient-primary text-primary-foreground shadow-sm"
              }`}
              onClick={ctx.handleSlidePrimary}
            >
              {onLastStep ? (
                <>
                  <FileSignature className="h-3.5 w-3.5 mr-1.5" /> Signer
                </>
              ) : (
                <>
                  <Pen className="h-3.5 w-3.5 mr-1.5" /> Continuer →
                </>
              )}
            </Button>
          </div>
        )}
        {/* RDV footer is inside RdvSlotPicker itself */}
      </div>
    </div>
  );
}

// ── Shared sign step ──────────────────────────────────────────
function DocSign() {
  const ctx = useConsultation();

  const summaryItems: { label: string; value: string }[] = [];
  if (ctx.slideType === "rx") {
    const meds = ctx.rxItems.filter((i) => i.medication.trim());
    summaryItems.push({ label: "Patient", value: ctx.patient.name });
    meds.forEach((m) => summaryItems.push({ label: "•", value: `${m.medication} — ${m.dosage} (${m.duration})` }));
    if (ctx.rxNote) summaryItems.push({ label: "Note", value: ctx.rxNote });
  } else if (ctx.slideType === "labs") {
    summaryItems.push({ label: "Patient", value: ctx.patient.name });
    ctx.analyses.slice(0, 6).forEach((a) => summaryItems.push({ label: "•", value: a }));
    if (ctx.analyses.length > 6) summaryItems.push({ label: "•", value: `… +${ctx.analyses.length - 6} autres` });
  } else if (ctx.slideType === "report") {
    summaryItems.push({ label: "Patient", value: ctx.patient.name });
    summaryItems.push({ label: "Motif", value: ctx.motif || "—" });
    summaryItems.push({ label: "Diagnostic", value: ctx.diagnosis || "—" });
  } else if (ctx.slideType === "certificate") {
    summaryItems.push({ label: "Patient", value: ctx.patient.name });
    summaryItems.push({ label: "Objet", value: ctx.certReason });
  } else if (ctx.slideType === "sickleave") {
    summaryItems.push({ label: "Patient", value: ctx.patient.name });
    summaryItems.push({ label: "Du", value: ctx.slStart });
    summaryItems.push({ label: "Au", value: ctx.slEnd });
  }

  const printFn = {
    rx: () => ctx.doPrint("Ordonnance", ctx.rxPrintHtml),
    labs: () => ctx.doPrint("Analyses", ctx.labsPrintHtml),
    report: () => ctx.doPrint("Compte-rendu", ctx.reportPrintHtml),
    certificate: () => ctx.doPrint("Certificat", ctx.certPrintHtml),
    sickleave: () => ctx.doPrint("Arrêt de travail", ctx.slPrintHtml),
    rdv: () => {},
  }[ctx.slideType];

  const signedAt: Date | null =
    {
      rx: ctx.rxSignedAt,
      labs: ctx.labsSignedAt,
      report: ctx.reportSignedAt,
      certificate: ctx.certSignedAt,
      sickleave: ctx.slSignedAt,
      rdv: null,
    }[ctx.slideType] ?? null;

  return (
    <div className="space-y-4">
      {signedAt ? (
        <div className="flex items-start gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-4 py-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Document signé</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">
              Signé le {signedAt.toLocaleDateString("fr-FR")} à{" "}
              {signedAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}. L'envoi au(x)
              destinataire(s) se configure à la clôture.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-4 py-3">
          <FileSignature className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Prêt à signer</p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
              La signature électronique rend ce document officiel. L'envoi (patient / pharmacie / labo) se choisit à la
              clôture.
            </p>
          </div>
        </div>
      )}

      {/* Document summary */}
      <div className="rounded-xl border bg-muted/20 px-4 py-3 space-y-2">
        {summaryItems.map((item, i) => (
          <div key={i} className={`flex items-start gap-2 ${item.label === "•" ? "ml-3" : ""}`}>
            {item.label !== "•" && (
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide font-semibold w-20 shrink-0 pt-0.5">
                {item.label}
              </span>
            )}
            <span className={`text-sm ${item.label === "•" ? "text-muted-foreground" : "text-foreground font-medium"}`}>
              {item.label === "•" ? `· ${item.value}` : item.value}
            </span>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" className="w-full text-xs h-9" onClick={printFn}>
        <Printer className="h-3.5 w-3.5 mr-1.5" /> Aperçu / Imprimer avant signature
      </Button>
    </div>
  );
}

// ── Ordonnance : Rédiger ──────────────────────────────────────
function RxWrite() {
  const ctx = useConsultation();
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Note de bas d'ordonnance
        </Label>
        <textarea
          value={ctx.rxNote}
          onChange={(e) => ctx.setRxNote(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm resize-none"
        />
      </div>
      <div className="space-y-3">
        {ctx.rxItems.map((item, idx) => (
          <div key={idx} className="rounded-xl border bg-background p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center">
                  {idx + 1}
                </div>
                <span className="text-sm font-semibold text-foreground truncate max-w-[200px]">
                  {item.medication || "Médicament"}
                </span>
              </div>
              <button
                onClick={() => ctx.removeRxItem(idx)}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid gap-2">
              <Input
                value={item.medication}
                onChange={(e) => ctx.updateRxItem(idx, "medication", e.target.value)}
                placeholder="Médicament"
                className="h-9 text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={item.dosage}
                  onChange={(e) => ctx.updateRxItem(idx, "dosage", e.target.value)}
                  placeholder="Posologie"
                  className="h-9 text-sm"
                />
                <Input
                  value={item.duration}
                  onChange={(e) => ctx.updateRxItem(idx, "duration", e.target.value)}
                  placeholder="Durée"
                  className="h-9 text-sm"
                />
              </div>
              <Input
                value={item.instructions}
                onChange={(e) => ctx.updateRxItem(idx, "instructions", e.target.value)}
                placeholder="Consignes (ex: après repas)"
                className="h-9 text-sm"
              />
            </div>
          </div>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full h-9 border-dashed hover:border-primary/50 hover:text-primary"
        onClick={ctx.addRxItem}
      >
        <Plus className="h-3.5 w-3.5 mr-1.5" /> Ajouter un médicament
      </Button>
    </div>
  );
}

// ── Analyses : Rédiger ────────────────────────────────────────
function LabsWrite() {
  const ctx = useConsultation();
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Consignes laboratoire
        </Label>
        <textarea
          value={ctx.labsNote}
          onChange={(e) => ctx.setLabsNote(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm resize-none"
        />
      </div>
      <div className="flex gap-2">
        <Input
          value={ctx.newAnalyse}
          onChange={(e) => ctx.setNewAnalyse(e.target.value)}
          placeholder="Ajouter une analyse…"
          className="h-9 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              ctx.addAnalyse();
            }
          }}
        />
        <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={() => ctx.addAnalyse()}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
      {ctx.labSuggestions.length > 0 && (
        <div className="rounded-xl border bg-muted/20 p-3">
          <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide mb-2">Suggestions</p>
          <div className="flex flex-wrap gap-2">
            {ctx.labSuggestions.slice(0, 10).map((s) => (
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
      <div className="space-y-2">
        {ctx.analyses.map((a, i) => (
          <div key={a} className="flex items-center gap-3 rounded-xl border bg-background px-3 py-2.5 group">
            <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
              {i + 1}
            </span>
            <span className="text-sm text-foreground flex-1">{a}</span>
            <button
              onClick={() => ctx.removeAnalyse(a)}
              className="opacity-0 group-hover:opacity-100 h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-destructive transition-all"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {ctx.analyses.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Aucune analyse ajoutée</p>
        )}
      </div>
    </div>
  );
}

// ── Compte-rendu ──────────────────────────────────────────────
function ReportWrite() {
  const ctx = useConsultation();
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 px-3 py-2.5">
        <FileText className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 dark:text-blue-400">
          Pré-rempli depuis vos notes. Modifiez librement avant de signer.
        </p>
      </div>
      <textarea
        value={ctx.reportText}
        onChange={(e) => {
          ctx.setReportText(e.target.value);
          ctx.setReportTouched(true);
        }}
        rows={18}
        className="w-full rounded-xl border bg-background px-4 py-3 text-sm font-mono leading-relaxed resize-none"
      />
    </div>
  );
}

// ── Certificat ────────────────────────────────────────────────
function CertWrite() {
  const ctx = useConsultation();
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Objet</Label>
        <Input
          value={ctx.certReason}
          onChange={(e) => ctx.setCertReason(e.target.value)}
          className="mt-1 h-10 text-sm font-medium"
        />
      </div>
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Corps du certificat
        </Label>
        <textarea
          value={ctx.certComment}
          onChange={(e) => ctx.setCertComment(e.target.value)}
          rows={8}
          className="mt-1 w-full rounded-xl border bg-background px-4 py-3 text-sm resize-none"
        />
      </div>
      <div className="rounded-xl border bg-muted/20 p-4">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-semibold mb-2">Aperçu</p>
        <p className="text-sm font-bold text-foreground">{ctx.certReason}</p>
        <p className="text-xs text-muted-foreground">
          Patient : {ctx.patient.name} — {ctx.patient.age} ans
        </p>
        <p className="text-sm text-foreground mt-1">{ctx.certComment}</p>
      </div>
    </div>
  );
}

// ── Arrêt de travail ──────────────────────────────────────────
function SickWrite() {
  const ctx = useConsultation();
  const days =
    ctx.slStart && ctx.slEnd
      ? Math.max(0, Math.round((new Date(ctx.slEnd).getTime() - new Date(ctx.slStart).getTime()) / 86400000) + 1)
      : 0;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Début</Label>
          <Input
            value={ctx.slStart}
            onChange={(e) => ctx.setSlStart(e.target.value)}
            type="date"
            className="mt-1 h-10"
          />
        </div>
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fin</Label>
          <Input value={ctx.slEnd} onChange={(e) => ctx.setSlEnd(e.target.value)} type="date" className="mt-1 h-10" />
        </div>
      </div>
      {days > 0 && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-4 py-3 text-center">
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
            {days} jour{days > 1 ? "s" : ""}
          </p>
          <p className="text-xs text-amber-600 mt-0.5">d'arrêt de travail</p>
        </div>
      )}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Commentaire</Label>
        <textarea
          value={ctx.slComment}
          onChange={(e) => ctx.setSlComment(e.target.value)}
          rows={5}
          placeholder="Repos, pas de port de charge…"
          className="mt-1 w-full rounded-xl border bg-background px-4 py-3 text-sm resize-none"
        />
      </div>
    </div>
  );
}

// ── RDV : Calendrier + créneaux disponibles ───────────────────
// Pas de signature — c'est une réservation dans l'agenda
function RdvSlotPicker() {
  const ctx = useConsultation();

  // Local calendar state
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<Date | null>(ctx.rdvDate ? new Date(ctx.rdvDate + "T00:00:00") : null);
  const [selectedSlot, setSelectedSlot] = useState(ctx.rdvTime || "");

  const slots = useMemo(() => (selected ? generateSlots(selected) : []), [selected]);

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
  ];

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((v) => v - 1);
    } else setViewMonth((v) => v - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((v) => v + 1);
    } else setViewMonth((v) => v + 1);
  };

  const isSameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

  const selectDate = (d: Date) => {
    setSelected(d);
    setSelectedSlot(""); // reset slot when date changes
    ctx.setRdvDate(d.toISOString().slice(0, 10));
  };

  const selectSlot = (slot: string) => {
    setSelectedSlot(slot);
    ctx.setRdvTime(slot);
  };

  const handleConfirm = () => {
    if (!selected || !selectedSlot) return;
    ctx.handleSlidePrimary();
  };

  const confirmed = !!ctx.rdvConfirmedAt;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-4">
        {confirmed ? (
          // Already confirmed — show summary + modify option
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-4 py-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">RDV confirmé</p>
                <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1 font-bold">
                  {selected
                    ? selected.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })
                    : ctx.rdvDate}{" "}
                  à {ctx.rdvTime}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{ctx.rdvLocation}</p>
              </div>
            </div>
            <button
              onClick={() => {
                ctx.setRdvConfirmedAt === undefined ? null : ctx.setRdvDate("");
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-3 py-2.5 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-100 transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5" /> Modifier le RDV
            </button>
          </div>
        ) : (
          <>
            {/* Calendar header */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-foreground capitalize">
                {MONTHS_FR[viewMonth]} {viewYear}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={prevMonth}
                  className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {DAYS_FR.map((d) => (
                <div key={d} className="text-[10px] font-semibold text-muted-foreground py-1">
                  {d}
                </div>
              ))}
              {cells.map((d, i) => {
                if (!d) return <div key={`e-${i}`} />;
                const isPast = d < today;
                const isToday = isSameDay(d, today);
                const isSel = selected && isSameDay(d, selected);
                const daySlots = generateSlots(d);
                const hasSlots = daySlots.length > 0;

                return (
                  <button
                    key={d.toISOString()}
                    disabled={isPast || !hasSlots}
                    onClick={() => selectDate(d)}
                    className={`aspect-square rounded-xl text-xs font-semibold transition-all relative flex items-center justify-center ${
                      isPast || !hasSlots
                        ? "opacity-30 cursor-not-allowed text-muted-foreground"
                        : isSel
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : isToday
                            ? "border-2 border-primary text-primary bg-primary/5"
                            : "hover:bg-primary/10 hover:text-primary text-foreground"
                    }`}
                  >
                    {d.getDate()}
                    {!isPast && hasSlots && !isSel && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Slots */}
            {selected && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  <Clock className="inline h-3 w-3 mr-1" />
                  Créneaux disponibles —{" "}
                  {selected.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                </p>
                {slots.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => selectSlot(slot)}
                        className={`rounded-xl border py-2 text-xs font-semibold transition-all ${
                          selectedSlot === slot
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border hover:border-primary/50 hover:bg-primary/5 hover:text-primary text-foreground"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    Aucun créneau disponible ce jour.
                  </div>
                )}
              </div>
            )}

            {/* Location */}
            {selected && selectedSlot && (
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Lieu du RDV
                </Label>
                <Input
                  value={ctx.rdvLocation}
                  onChange={(e) => ctx.setRdvLocation(e.target.value)}
                  placeholder="Cabinet · Hôpital · Téléconsultation"
                  className="mt-1 h-10"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* RDV footer */}
      {!confirmed && (
        <div className="pt-4 border-t mt-4 flex gap-3">
          <Button variant="outline" onClick={ctx.closeSlide}>
            Fermer
          </Button>
          <Button
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            disabled={!selected || !selectedSlot}
            onClick={handleConfirm}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Confirmer le RDV
            {selectedSlot && selected && (
              <span className="ml-2 text-emerald-200 font-normal text-xs">
                {selected.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} à {selectedSlot}
              </span>
            )}
          </Button>
        </div>
      )}
      {confirmed && (
        <div className="pt-4 border-t mt-4">
          <Button variant="outline" className="w-full" onClick={ctx.closeSlide}>
            Fermer
          </Button>
        </div>
      )}
    </div>
  );
}
