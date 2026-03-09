import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, CreditCard, History, FileText, Download, Mail, Pill, Plus, Printer, Search, Send, X, Banknote, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConsultation } from "./ConsultationContext";
import ActionPaletteShared from "@/components/shared/ActionPalette";
import { toast } from "@/hooks/use-toast";

type PaymentMode = "cash" | "card" | "insurance" | "deferred";

export function CloseModal() {
  const ctx = useConsultation();
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");
  const [sendDocs, setSendDocs] = useState({ rx: true, analyses: true, report: false });

  if (!ctx.showCloseModal) return null;

  const paymentModes: { key: PaymentMode; label: string; icon: React.ReactNode }[] = [
    { key: "cash", label: "Espèces", icon: <Banknote className="h-4 w-4" /> },
    { key: "card", label: "Carte", icon: <CreditCard className="h-4 w-4" /> },
    { key: "insurance", label: "Assurance", icon: <Receipt className="h-4 w-4" /> },
    { key: "deferred", label: "Différé", icon: <AlertTriangle className="h-4 w-4" /> },
  ];

  const handleConfirm = () => {
    // Generate documents
    const docs: string[] = [];
    if (sendDocs.rx && ctx.rxItems.filter(p => p.medication).length > 0) docs.push("Ordonnance");
    if (sendDocs.analyses && ctx.analyses.length > 0) docs.push("Demande d'analyses");
    if (sendDocs.report) docs.push("Compte-rendu");

    ctx.handleClose();

    if (docs.length > 0) {
      toast({
        title: "Documents générés",
        description: `${docs.join(", ")} — envoi au patient simulé.`,
      });
    }
    toast({
      title: `Paiement enregistré (${paymentModes.find(p => p.key === paymentMode)?.label})`,
      description: `${ctx.consultAmount} DT · ${ctx.patient.name}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
      <div className="rounded-2xl border bg-card shadow-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-foreground mb-1">Clôturer la consultation</h3>
        <p className="text-sm text-muted-foreground mb-5">Vérifiez les informations, choisissez le mode de paiement et les documents à générer.</p>
        <div className="space-y-4">
          {/* Diagnosis */}
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground mb-1">Diagnostic</p>
            <p className="text-sm font-medium text-foreground">{ctx.diagnosis || "Non renseigné"}</p>
          </div>

          {/* Prescription */}
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground mb-2">Ordonnance</p>
            <div className="space-y-1">
              {ctx.rxItems.filter(p => p.medication).slice(0, 6).map((p, i) => (
                <p key={i} className="text-sm text-foreground flex items-center gap-1.5">
                  <Pill className="h-3 w-3 text-primary" /> {p.medication} — {p.dosage}
                </p>
              ))}
              {ctx.rxItems.filter(p => p.medication).length === 0 && <p className="text-xs text-muted-foreground">Aucun médicament prescrit</p>}
              {ctx.rxItems.filter(p => p.medication).length > 6 && <p className="text-xs text-muted-foreground">+ autres…</p>}
            </div>
          </div>

          {/* Analyses */}
          {ctx.analyses.length > 0 && (
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground mb-2">Analyses prescrites</p>
              <div className="flex flex-wrap gap-1.5">
                {ctx.analyses.slice(0, 10).map(a => (
                  <span key={a} className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">{a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Payment mode */}
          <div>
            <Label className="text-xs font-medium mb-2 block">Mode de paiement</Label>
            <div className="grid grid-cols-4 gap-2">
              {paymentModes.map(pm => (
                <button
                  key={pm.key}
                  onClick={() => setPaymentMode(pm.key)}
                  className={`rounded-lg border p-3 text-center transition-all ${
                    paymentMode === pm.key
                      ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                      : "text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  <div className="flex justify-center mb-1">{pm.icon}</div>
                  <p className="text-[11px] font-medium">{pm.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Amount + Next RDV */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Montant (DT)</Label>
              <Input value={ctx.consultAmount} onChange={e => ctx.setConsultAmount(e.target.value)} className="mt-1 h-9" type="number" />
            </div>
            <div>
              <Label className="text-xs">Prochain RDV</Label>
              <select value={ctx.nextRdv} onChange={e => ctx.setNextRdv(e.target.value)} className="mt-1 w-full h-9 rounded-md border bg-background px-3 text-sm">
                {["1 semaine", "2 semaines", "1 mois", "3 mois", "6 mois", "Non nécessaire"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Documents to generate */}
          <div>
            <Label className="text-xs font-medium mb-2 block">Documents à générer & envoyer</Label>
            <div className="space-y-2">
              {[
                { key: "rx" as const, label: "Ordonnance", desc: "Envoi au patient + pharmacie", enabled: ctx.rxItems.filter(p => p.medication).length > 0 },
                { key: "analyses" as const, label: "Demande d'analyses", desc: "Envoi au labo + patient", enabled: ctx.analyses.length > 0 },
                { key: "report" as const, label: "Compte-rendu de consultation", desc: "PDF signé pour le dossier", enabled: true },
              ].map(doc => (
                <label key={doc.key} className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                  sendDocs[doc.key] && doc.enabled ? "border-primary/30 bg-primary/5" : doc.enabled ? "hover:bg-muted/30" : "opacity-40 cursor-not-allowed"
                }`}>
                  <input
                    type="checkbox"
                    checked={sendDocs[doc.key] && doc.enabled}
                    onChange={() => doc.enabled && setSendDocs(prev => ({ ...prev, [doc.key]: !prev[doc.key] }))}
                    disabled={!doc.enabled}
                    className="rounded border-input"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{doc.label}</p>
                    <p className="text-[11px] text-muted-foreground">{doc.desc}</p>
                  </div>
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => ctx.setShowCloseModal(false)}>Annuler</Button>
          <Button className="flex-1 gradient-primary text-primary-foreground shadow-primary-glow" onClick={handleConfirm}>
            <CheckCircle2 className="h-4 w-4 mr-2" />Clôturer · {ctx.consultAmount} DT
          </Button>
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
      <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-card border-l shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">Historique</h3>
          </div>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => ctx.setHistoryOpen(false)}><X className="h-4 w-4" /></Button>
        </div>
        <div className="p-4 space-y-3 overflow-auto flex-1 min-h-0">
          {ctx.pastConsults.map((c, idx) => (
            <div key={idx} className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">{c.date}</p>
                  <p className="font-semibold text-foreground">{c.motif}</p>
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{c.prescriptions} Rx</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{c.notes}</p>
              <div className="mt-3">
                <Button variant="outline" size="sm" className="text-xs" onClick={() => {
                  ctx.setSymptoms(ctx.symptoms ? `${ctx.symptoms}\n\n[Historique ${c.date}] ${c.notes}` : `[Historique ${c.date}] ${c.notes}`);
                  ctx.setHistoryOpen(false);
                }}>
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

  const mapped = ctx.filteredPalette.map(a => ({
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
      onQueryChange={v => { ctx.setPaletteQuery(v); ctx.setPaletteIndex(0); }}
      placeholder="Rechercher une action…"
    />
  );
}

export function ClosedView() {
  const ctx = useConsultation();

  const handleSendToPatient = () => {
    toast({ title: "Documents envoyés", description: `Ordonnance et compte-rendu envoyés au patient ${ctx.patient.name} (mock).` });
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
        <p className="text-muted-foreground mt-2">La consultation avec {ctx.patient.name} a été clôturée avec succès.</p>
      </div>

      {/* Summary */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h3 className="font-semibold text-foreground mb-4">Récapitulatif</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { label: "Patient", value: ctx.patient.name },
            { label: "Diagnostic", value: ctx.diagnosis || "Non renseigné" },
            { label: "Ordonnance", value: `${ctx.rxItems.filter(p => p.medication).length} médicament(s)` },
            { label: "Analyses prescrites", value: `${ctx.analyses.length} analyse(s)` },
          ].map(item => (
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
          <FileText className="h-4 w-4 text-primary" />Documents générés
        </h3>
        <div className="space-y-2">
          {ctx.rxItems.filter(p => p.medication).length > 0 && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Pill className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Ordonnance</p>
                  <p className="text-[11px] text-muted-foreground">{ctx.rxItems.filter(p => p.medication).length} médicament(s)</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => ctx.doPrint("Ordonnance", ctx.rxPrintHtml)}>
                  <Printer className="h-3 w-3 mr-1" />Imprimer
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleSendToPharmacy}>
                  <Send className="h-3 w-3 mr-1" />Pharmacie
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
                  <Send className="h-3 w-3 mr-1" />Labo
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
                <p className="text-[11px] text-muted-foreground">PDF signé — {new Date().toLocaleDateString("fr-FR")}</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleExportPdf}>
                <Download className="h-3 w-3 mr-1" />PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 justify-center flex-wrap">
        <Button variant="outline" onClick={() => ctx.navigate("/dashboard/doctor/consultations")}>Retour</Button>
        <Button variant="outline" onClick={handleSendToPatient}>
          <Mail className="h-4 w-4 mr-2" />Envoyer au patient
        </Button>
        <Button className="gradient-primary text-primary-foreground shadow-primary-glow" onClick={() => ctx.navigate("/dashboard/doctor/consultation/new")}>
          <Plus className="h-4 w-4 mr-2" /> Nouvelle consultation
        </Button>
      </div>
    </div>
  );
}
