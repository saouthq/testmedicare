import React from "react";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Edit2,
  FileText,
  History,
  Lock,
  Mail,
  Pill,
  Plus,
  Printer,
  Send,
  Stethoscope,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConsultation } from "./ConsultationContext";
import ActionPaletteShared from "@/components/shared/ActionPalette";
import { toast } from "@/hooks/use-toast";

/**
 * CloseModal — Modal de clôture de consultation
 *
 * Logique métier :
 *   1. Résumé clinique (diagnostic, Rx, analyses)
 *   2. Statut du prochain RDV (slot réel depuis agenda)
 *   3. Honoraires (montant DT — le mode de paiement est géré à la réception)
 *   4. Envoi des documents :
 *      - Choix par document (activer/désactiver)
 *      - Choix par destinataire (Patient / Pharmacie / Laboratoire)
 *      - BLOQUANT : tout document sélectionné pour envoi doit être signé
 */
export function CloseModal() {
  const ctx = useConsultation();
  if (!ctx.showCloseModal) return null;

  const rxCount = ctx.rxItems.filter((p) => p.medication.trim()).length;
  const labsCount = ctx.analyses.length;

  // Docs config with per-recipient toggles
  type DocKey = "rx" | "analyses" | "report";
  const docsConfig: {
    key: DocKey;
    label: string;
    count: string;
    available: boolean;
    signed: boolean;
    openSlide: () => void;
    recipients: { key: string; label: string; getter: boolean; setter: (v: boolean) => void }[];
  }[] = [
    {
      key: "rx",
      label: "Ordonnance",
      count: rxCount > 0 ? `${rxCount} médicament${rxCount > 1 ? "s" : ""}` : "Vide",
      available: rxCount > 0,
      signed: !!ctx.rxSignedAt,
      openSlide: () => {
        ctx.setShowCloseModal(false);
        ctx.openSlide("rx", 0);
      },
      recipients: [
        {
          key: "patient",
          label: "Patient",
          getter: ctx.sendDocs.rx.patient,
          setter: (v) => ctx.setSendDocs((p) => ({ ...p, rx: { ...p.rx, patient: v } })),
        },
        {
          key: "pharmacy",
          label: "Pharmacie",
          getter: ctx.sendDocs.rx.pharmacy,
          setter: (v) => ctx.setSendDocs((p) => ({ ...p, rx: { ...p.rx, pharmacy: v } })),
        },
      ],
    },
    {
      key: "analyses",
      label: "Demande d'analyses",
      count: labsCount > 0 ? `${labsCount} examen${labsCount > 1 ? "s" : ""}` : "Vide",
      available: labsCount > 0,
      signed: !!ctx.labsSignedAt,
      openSlide: () => {
        ctx.setShowCloseModal(false);
        ctx.openSlide("labs", 0);
      },
      recipients: [
        {
          key: "patient",
          label: "Patient",
          getter: ctx.sendDocs.analyses.patient,
          setter: (v) => ctx.setSendDocs((p) => ({ ...p, analyses: { ...p.analyses, patient: v } })),
        },
        {
          key: "lab",
          label: "Laboratoire",
          getter: ctx.sendDocs.analyses.lab,
          setter: (v) => ctx.setSendDocs((p) => ({ ...p, analyses: { ...p.analyses, lab: v } })),
        },
      ],
    },
    {
      key: "report",
      label: "Compte-rendu",
      count: "Consultation complète",
      available: true,
      signed: !!ctx.reportSignedAt,
      openSlide: () => {
        ctx.setShowCloseModal(false);
        ctx.openSlide("report", 0);
      },
      recipients: [
        {
          key: "patient",
          label: "Patient",
          getter: ctx.sendDocs.report.patient,
          setter: (v) => ctx.setSendDocs((p) => ({ ...p, report: { ...p.report, patient: v } })),
        },
      ],
    },
  ];

  // A doc "needs action" = enabled for send but not signed
  const enabledDocs = docsConfig.filter((d) => d.available && ctx.sendDocs[d.key].enabled);
  const blockedDocs = enabledDocs.filter((d) => !d.signed);
  const canConfirm = blockedDocs.length === 0;

  const handleConfirm = () => {
    if (!canConfirm) return;
    ctx.handleClose();
    const sent = enabledDocs
      .map((d) => {
        const recips = d.recipients.filter((r) => r.getter).map((r) => r.label);
        return recips.length > 0 ? `${d.label} → ${recips.join(", ")}` : null;
      })
      .filter(Boolean);
    toast({
      title: "Consultation clôturée ✓",
      description: sent.length > 0 ? sent.join(" · ") : "Aucun document envoyé",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
      <div className="rounded-2xl border bg-card shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
              {ctx.initials}
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Clôturer la consultation</h3>
              <p className="text-xs text-muted-foreground">
                {ctx.patient.name} · {ctx.patient.age} ans
              </p>
            </div>
          </div>
          <button
            onClick={() => ctx.setShowCloseModal(false)}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* ── 1. Résumé clinique ── */}
          <div className="rounded-xl bg-muted/20 border divide-y overflow-hidden">
            <div className="px-4 py-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-1">
                <Stethoscope className="inline h-3 w-3 mr-1" />
                Diagnostic
              </p>
              <p className="text-sm font-medium text-foreground">
                {ctx.diagnosis || <span className="text-amber-600 italic">Non renseigné</span>}
              </p>
            </div>
            <div className="px-4 py-3 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Pill className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Ordonnance</p>
                  <p className="text-xs font-semibold text-foreground">
                    {rxCount > 0 ? `${rxCount} médicament${rxCount > 1 ? "s" : ""}` : "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-accent shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Analyses</p>
                  <p className="text-xs font-semibold text-foreground">
                    {labsCount > 0 ? `${labsCount} examen${labsCount > 1 ? "s" : ""}` : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── 2. RDV ── */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              <Calendar className="inline h-3 w-3 mr-1" />
              Prochain RDV
            </p>
            {ctx.rdvConfirmedAt ? (
              <div className="flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-4 py-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">RDV confirmé</p>
                  <p className="text-xs text-muted-foreground">
                    {ctx.rdvDate
                      ? new Date(ctx.rdvDate + "T00:00:00").toLocaleDateString("fr-FR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })
                      : "—"}
                    {ctx.rdvTime && ` à ${ctx.rdvTime}`}
                    {ctx.rdvLocation && ` · ${ctx.rdvLocation}`}
                  </p>
                </div>
                <button
                  onClick={() => {
                    ctx.setShowCloseModal(false);
                    ctx.openSlide("rdv", 0);
                  }}
                  className="text-[11px] text-muted-foreground hover:text-foreground hover:underline shrink-0"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl bg-muted/30 border px-4 py-3">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground flex-1">Aucun RDV planifié</p>
                <button
                  onClick={() => {
                    ctx.setShowCloseModal(false);
                    ctx.openSlide("rdv", 0);
                  }}
                  className="text-[11px] text-primary font-semibold hover:underline shrink-0"
                >
                  Planifier →
                </button>
              </div>
            )}
          </div>

          {/* ── 3. Honoraires ── */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Honoraires (DT)
            </Label>
            <p className="text-[10px] text-muted-foreground mt-0.5 mb-2">Mode de paiement géré par la réception.</p>
            <Input
              value={ctx.consultAmount}
              onChange={(e) => ctx.setConsultAmount(e.target.value)}
              type="number"
              placeholder="35"
              className="h-10 text-base font-bold w-32"
            />
          </div>

          {/* ── 4. Envoi des documents ── */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Envoi des documents
            </p>
            <p className="text-[11px] text-muted-foreground mb-3">
              Activez un document pour choisir à qui l'envoyer. Tout document activé doit être signé avant la clôture.
            </p>

            {/* Blocked warning */}
            {blockedDocs.length > 0 && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-3 py-2.5 mb-3">
                <Lock className="h-3.5 w-3.5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-red-700 dark:text-red-400">
                    Signature requise avant clôture
                  </p>
                  <p className="text-[11px] text-red-600 dark:text-red-500 mt-0.5">
                    {blockedDocs.map((d) => d.label).join(", ")} — non signé{blockedDocs.length > 1 ? "s" : ""}.{" "}
                    <button onClick={blockedDocs[0].openSlide} className="underline font-semibold">
                      Signer maintenant →
                    </button>
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {docsConfig.map((doc) => {
                const enabled = doc.available && ctx.sendDocs[doc.key].enabled;
                const needsSign = enabled && !doc.signed;

                return (
                  <div
                    key={doc.key}
                    className={`rounded-xl border transition-all overflow-hidden ${
                      !doc.available
                        ? "opacity-40"
                        : needsSign
                          ? "border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-950/10"
                          : enabled
                            ? "border-primary/30 bg-primary/3"
                            : "bg-background"
                    }`}
                  >
                    {/* Row 1 : toggle + label + sign status */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={enabled}
                        disabled={!doc.available}
                        onChange={() =>
                          ctx.setSendDocs((p) => ({ ...p, [doc.key]: { ...p[doc.key], enabled: !p[doc.key].enabled } }))
                        }
                        className="rounded shrink-0 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-foreground">{doc.label}</span>
                          {doc.available &&
                            (doc.signed ? (
                              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded-full">
                                ✓ Signé
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-1.5 py-0.5 rounded-full">
                                Non signé
                              </span>
                            ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{doc.count}</p>
                      </div>
                      {/* Sign CTA inline if needed */}
                      {needsSign && (
                        <button
                          onClick={doc.openSlide}
                          className="text-[11px] text-primary font-semibold hover:underline shrink-0"
                        >
                          Signer →
                        </button>
                      )}
                    </div>

                    {/* Row 2 : recipient toggles — only visible when enabled */}
                    {enabled && (
                      <div className="border-t px-4 py-2.5 bg-muted/10 flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mr-1">
                          <Send className="inline h-2.5 w-2.5 mr-1" />
                          Envoyer à :
                        </span>
                        {doc.recipients.map((r) => (
                          <label
                            key={r.key}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium cursor-pointer transition-all ${
                              r.getter
                                ? "border-primary/40 bg-primary/10 text-primary"
                                : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={r.getter}
                              onChange={(e) => r.setter(e.target.checked)}
                              className="sr-only"
                            />
                            {r.getter ? "✓" : "○"} {r.label}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t flex gap-3 items-center">
          <Button variant="outline" onClick={() => ctx.setShowCloseModal(false)}>
            Annuler
          </Button>
          <div className="flex-1 text-right">
            <Button
              disabled={!canConfirm}
              className={`font-semibold shadow-sm px-6 ${
                canConfirm
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "opacity-50 cursor-not-allowed bg-muted text-muted-foreground"
              }`}
              onClick={handleConfirm}
            >
              {canConfirm ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirmer la clôture
                  {ctx.consultAmount && parseFloat(ctx.consultAmount) > 0 && (
                    <span className="ml-2 opacity-70 font-normal">· {ctx.consultAmount} DT</span>
                  )}
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Signature{blockedDocs.length > 1 ? "s" : ""} requise{blockedDocs.length > 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
export function HistoryDrawer() {
  const ctx = useConsultation();
  if (!ctx.historyOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm" onClick={() => ctx.setHistoryOpen(false)}>
      <div
        className="absolute right-0 top-0 h-full w-full max-w-xl bg-card border-l shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">Historique</h3>
          </div>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => ctx.setHistoryOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4 space-y-3 overflow-auto flex-1 min-h-0">
          {ctx.pastConsults.map((c, idx) => (
            <div key={idx} className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">{c.date}</p>
                  <p className="font-semibold text-foreground">{c.motif}</p>
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {c.prescriptions} Rx
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{c.notes}</p>
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    ctx.setSymptoms(
                      ctx.symptoms
                        ? `${ctx.symptoms}\n\n[Historique ${c.date}] ${c.notes}`
                        : `[Historique ${c.date}] ${c.notes}`,
                    );
                    ctx.setHistoryOpen(false);
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Insérer dans notes
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CommandPalette() {
  const ctx = useConsultation();

  const mapped = ctx.filteredPalette.map((a) => ({
    id: a.id,
    label: a.label,
    hint: a.hint,
    icon: a.icon as React.ReactNode,
    group: "Actions",
    onRun: a.onRun,
  }));

  return (
    <ActionPaletteShared
      open={ctx.paletteOpen}
      onClose={() => ctx.setPaletteOpen(false)}
      actions={mapped}
      query={ctx.paletteQuery}
      onQueryChange={(v) => {
        ctx.setPaletteQuery(v);
        ctx.setPaletteIndex(0);
      }}
      placeholder="Rechercher une action…"
    />
  );
}

export function ClosedView() {
  const ctx = useConsultation();

  const handleSendToPatient = () => {
    toast({
      title: "Documents envoyés",
      description: `Ordonnance et compte-rendu envoyés au patient ${ctx.patient.name} (mock).`,
    });
  };

  const handleSendToPharmacy = () => {
    toast({ title: "Ordonnance envoyée", description: "Ordonnance transmise à la pharmacie du patient (mock)." });
  };

  const handleSendToLab = () => {
    toast({ title: "Demande d'analyses envoyée", description: "Demande transmise au laboratoire (mock)." });
  };

  const handleExportPdf = () => {
    toast({ title: "Export PDF", description: "Dossier de consultation exporté en PDF (mock)." });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success banner */}
      <div className="rounded-xl border bg-card p-8 shadow-card text-center">
        <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-accent" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Consultation clôturée</h2>
        <p className="text-muted-foreground mt-2">
          La consultation avec {ctx.patient.name} a été clôturée avec succès.
        </p>
      </div>

      {/* Summary */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h3 className="font-semibold text-foreground mb-4">Récapitulatif</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { label: "Patient", value: ctx.patient.name },
            { label: "Diagnostic", value: ctx.diagnosis || "Non renseigné" },
            { label: "Ordonnance", value: `${ctx.rxItems.filter((p) => p.medication).length} médicament(s)` },
            { label: "Analyses prescrites", value: `${ctx.analyses.length} analyse(s)` },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="font-medium text-foreground text-sm">{item.value}</p>
            </div>
          ))}
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
            <p className="text-xs text-primary font-medium">Prochain RDV</p>
            <p className="font-medium text-foreground">{ctx.nextRdv}</p>
          </div>
          <div className="rounded-lg bg-accent/5 border border-accent/20 p-4">
            <p className="text-xs text-accent font-medium">Montant</p>
            <p className="font-bold text-foreground">{ctx.consultAmount} DT</p>
          </div>
        </div>
      </div>

      {/* Documents generated */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Documents générés
        </h3>
        <div className="space-y-2">
          {ctx.rxItems.filter((p) => p.medication).length > 0 && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Pill className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Ordonnance</p>
                  <p className="text-[11px] text-muted-foreground">
                    {ctx.rxItems.filter((p) => p.medication).length} médicament(s)
                  </p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => ctx.doPrint("Ordonnance", ctx.rxPrintHtml)}
                >
                  <Printer className="h-3 w-3 mr-1" />
                  Imprimer
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleSendToPharmacy}>
                  <Send className="h-3 w-3 mr-1" />
                  Pharmacie
                </Button>
              </div>
            </div>
          )}
          {ctx.analyses.length > 0 && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Demande d'analyses</p>
                  <p className="text-[11px] text-muted-foreground">{ctx.analyses.length} analyse(s)</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleSendToLab}>
                  <Send className="h-3 w-3 mr-1" />
                  Labo
                </Button>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Compte-rendu de consultation</p>
                <p className="text-[11px] text-muted-foreground">
                  PDF signé — {new Date().toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleExportPdf}>
                <Download className="h-3 w-3 mr-1" />
                PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 justify-center flex-wrap">
        <Button variant="outline" onClick={() => ctx.navigate("/dashboard/doctor/consultations")}>
          Retour
        </Button>
        <Button variant="outline" onClick={handleSendToPatient}>
          <Mail className="h-4 w-4 mr-2" />
          Envoyer au patient
        </Button>
        <Button
          className="gradient-primary text-primary-foreground shadow-primary-glow"
          onClick={() => ctx.navigate("/dashboard/doctor/consultation/new")}
        >
          <Plus className="h-4 w-4 mr-2" /> Nouvelle consultation
        </Button>
      </div>
    </div>
  );
}
