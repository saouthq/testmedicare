import { Activity, Calendar, FileSignature, FileText, Pill, Plus, Printer, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConsultation } from "./ConsultationContext";

export function SlidePanel() {
  const ctx = useConsultation();
  if (!ctx.slideOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm" onClick={ctx.closeSlide}>
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-card border-l shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">{ctx.slideTitle}</p>
            <h3 className="text-lg font-bold text-foreground">{ctx.slideSteps[ctx.slideStep]}</h3>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {ctx.slideSteps.map((s, i) => (
                <span key={s} className={i === ctx.slideStep
                  ? "text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full"
                  : "text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full"
                }>{i + 1}. {s}</span>
              ))}
              {ctx.slideFeedback && <span className="text-[11px] font-semibold text-accent">{ctx.slideFeedback}</span>}
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={ctx.closeSlide}><X className="h-4 w-4" /></Button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-auto flex-1 min-h-0">
          {/* RX */}
          {ctx.slideType === "rx" && ctx.slideStep === 0 && <RxCompose />}
          {ctx.slideType === "rx" && ctx.slideStep === 1 && <RxPreview />}
          {ctx.slideType === "rx" && ctx.slideStep === 2 && <RxSign />}
          {/* Labs */}
          {ctx.slideType === "labs" && ctx.slideStep === 0 && <LabsCompose />}
          {ctx.slideType === "labs" && ctx.slideStep === 1 && <LabsPreview />}
          {ctx.slideType === "labs" && ctx.slideStep === 2 && <LabsSign />}
          {/* Report */}
          {ctx.slideType === "report" && ctx.slideStep === 0 && <ReportCompose />}
          {ctx.slideType === "report" && ctx.slideStep === 1 && <ReportPreview />}
          {ctx.slideType === "report" && ctx.slideStep === 2 && <ReportSign />}
          {/* Certificate */}
          {ctx.slideType === "certificate" && ctx.slideStep === 0 && <CertCompose />}
          {ctx.slideType === "certificate" && ctx.slideStep === 1 && <CertPreview />}
          {ctx.slideType === "certificate" && ctx.slideStep === 2 && <CertSign />}
          {/* Sick leave */}
          {ctx.slideType === "sickleave" && ctx.slideStep === 0 && <SickCompose />}
          {ctx.slideType === "sickleave" && ctx.slideStep === 1 && <SickPreview />}
          {ctx.slideType === "sickleave" && ctx.slideStep === 2 && <SickSign />}
          {/* RDV */}
          {ctx.slideType === "rdv" && ctx.slideStep === 0 && <RdvPlan />}
          {ctx.slideType === "rdv" && ctx.slideStep === 1 && <RdvConfirm />}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex items-center justify-between gap-3">
          <Button variant="outline" onClick={ctx.handleSlideSecondary}>{ctx.slideStep > 0 ? "Retour" : "Fermer"}</Button>
          <div className="flex items-center gap-2">
            {!ctx.slideIsLastStep && (
              <Button variant="outline" onClick={() => ctx.setSlideStep(s => s + 1)}>Suivant</Button>
            )}
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" onClick={ctx.handleSlidePrimary}>
              {ctx.slideIsLastStep ? "Signer / Confirmer" : "Continuer"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components (slide steps) ────────────────────────────

function RxCompose() {
  const ctx = useConsultation();
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground flex items-center gap-2">
        <Pill className="h-4 w-4 text-primary" /> Ajuste l'ordonnance, puis passe à l'aperçu.
      </div>
      <div>
        <Label className="text-xs">Note ordonnance</Label>
        <textarea value={ctx.rxNote} onChange={e => ctx.setRxNote(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" />
      </div>
      <div className="space-y-2">
        {ctx.rxItems.map((item, idx) => (
          <div key={idx} className="rounded-xl border bg-card p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">{item.medication || `Médicament #${idx + 1}`}</p>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => ctx.removeRxItem(idx)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
            <div className="mt-2 grid gap-2">
              <Input value={item.medication} onChange={e => ctx.updateRxItem(idx, "medication", e.target.value)} placeholder="Médicament" className="h-9" />
              <div className="grid grid-cols-2 gap-2">
                <Input value={item.dosage} onChange={e => ctx.updateRxItem(idx, "dosage", e.target.value)} placeholder="Posologie" className="h-9" />
                <Input value={item.duration} onChange={e => ctx.updateRxItem(idx, "duration", e.target.value)} placeholder="Durée" className="h-9" />
              </div>
              <Input value={item.instructions} onChange={e => ctx.updateRxItem(idx, "instructions", e.target.value)} placeholder="Consignes" className="h-9" />
            </div>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" className="w-full text-xs" onClick={ctx.addRxItem}><Plus className="h-3.5 w-3.5 mr-1" /> Ajouter un médicament</Button>
    </div>
  );
}

function RxPreview() {
  const ctx = useConsultation();
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4">
        <p className="text-xs text-muted-foreground mb-2">Aperçu</p>
        <div className="text-sm text-foreground space-y-2">
          {ctx.rxItems.filter(p => p.medication.trim()).map((p, i) => (
            <div key={i} className="rounded-lg border bg-muted/20 p-3">
              <p className="font-semibold">{p.medication}</p>
              <p className="text-xs text-muted-foreground">{p.dosage} · {p.duration}</p>
              {p.instructions && <p className="text-xs text-muted-foreground">{p.instructions}</p>}
            </div>
          ))}
          <div className="text-xs text-muted-foreground"><b>Note :</b> {ctx.rxNote}</div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => ctx.doPrint("Ordonnance", ctx.rxPrintHtml)}><Printer className="h-4 w-4 mr-2" /> Imprimer</Button>
        <Button variant="outline" className="flex-1" onClick={() => ctx.setSlideStep(2)}><FileSignature className="h-4 w-4 mr-2" /> Signer</Button>
      </div>
    </div>
  );
}

function RxSign() {
  const ctx = useConsultation();
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground flex items-center gap-2">
        <FileSignature className="h-4 w-4 text-primary" /> Choisis les destinataires, puis signe.
      </div>
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ctx.rxSendToPatient} onChange={e => ctx.setRxSendToPatient(e.target.checked)} /> Envoyer au patient</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ctx.rxSendToPharmacy} onChange={e => ctx.setRxSendToPharmacy(e.target.checked)} /> Envoyer à la pharmacie</label>
      </div>
      <div className="rounded-xl border bg-card p-4">
        <p className="text-xs text-muted-foreground">Résumé</p>
        <p className="text-sm text-foreground font-semibold mt-1">{ctx.patient.name}</p>
        <p className="text-xs text-muted-foreground">{ctx.rxItems.filter(p => p.medication.trim()).length} médicament(s)</p>
      </div>
    </div>
  );
}

function LabsCompose() {
  const ctx = useConsultation();
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary" /> Compose la prescription d'analyses.
      </div>
      <div>
        <Label className="text-xs">Consignes laboratoire</Label>
        <textarea value={ctx.labsNote} onChange={e => ctx.setLabsNote(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" />
      </div>
      <div className="flex gap-2">
        <Input value={ctx.newAnalyse} onChange={e => ctx.setNewAnalyse(e.target.value)} placeholder="Ajouter une analyse…" className="h-9" onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); ctx.addAnalyse(); } }} />
        <Button variant="outline" size="sm" className="h-9" onClick={() => ctx.addAnalyse()}><Plus className="h-3.5 w-3.5" /></Button>
      </div>
      {ctx.labSuggestions.length > 0 && (
        <div className="rounded-xl border bg-muted/20 p-2">
          <p className="text-[11px] text-muted-foreground mb-2">Suggestions (1 clic)</p>
          <div className="flex flex-wrap gap-2">
            {ctx.labSuggestions.slice(0, 10).map(s => (
              <button key={s} onClick={() => ctx.addAnalyse(s)} className="px-2 py-1 rounded-lg border bg-background hover:bg-muted/60 text-xs">{s}</button>
            ))}
          </div>
        </div>
      )}
      <div className="space-y-2">
        {ctx.analyses.map(a => (
          <div key={a} className="flex items-center justify-between rounded-lg border bg-card px-3 py-2">
            <span className="text-sm text-foreground">{a}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => ctx.removeAnalyse(a)}><X className="h-4 w-4 text-muted-foreground" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function LabsPreview() {
  const ctx = useConsultation();
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4">
        <p className="text-xs text-muted-foreground mb-2">Aperçu</p>
        <div className="space-y-2">
          {ctx.analyses.map(a => <div key={a} className="rounded-lg border bg-muted/20 p-3"><p className="text-sm font-semibold text-foreground">{a}</p></div>)}
          {ctx.analyses.length === 0 && <p className="text-sm text-muted-foreground">Aucune analyse</p>}
          <div className="text-xs text-muted-foreground"><b>Consignes :</b> {ctx.labsNote}</div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => ctx.doPrint("Prescription d'analyses", ctx.labsPrintHtml)}><Printer className="h-4 w-4 mr-2" /> Imprimer</Button>
        <Button variant="outline" className="flex-1" onClick={() => ctx.setSlideStep(2)}><FileSignature className="h-4 w-4 mr-2" /> Signer</Button>
      </div>
    </div>
  );
}

function LabsSign() {
  const ctx = useConsultation();
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground flex items-center gap-2">
        <FileSignature className="h-4 w-4 text-primary" /> Choisis les destinataires, puis signe.
      </div>
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ctx.labsSendToLab} onChange={e => ctx.setLabsSendToLab(e.target.checked)} /> Envoyer au laboratoire</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ctx.labsSendToPatient} onChange={e => ctx.setLabsSendToPatient(e.target.checked)} /> Envoyer au patient</label>
      </div>
      <div className="rounded-xl border bg-card p-4">
        <p className="text-xs text-muted-foreground">Résumé</p>
        <p className="text-sm text-foreground font-semibold mt-1">{ctx.patient.name}</p>
        <p className="text-xs text-muted-foreground">{ctx.analyses.length} analyse(s)</p>
      </div>
    </div>
  );
}

function ReportCompose() {
  const ctx = useConsultation();
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" /> Pré-rempli depuis les notes. Modifiez librement.
      </div>
      <div>
        <Label className="text-xs">Compte-rendu</Label>
        <textarea value={ctx.reportText} onChange={e => { ctx.setReportText(e.target.value); ctx.setReportTouched(true); }} rows={16} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" />
      </div>
    </div>
  );
}

function ReportPreview() {
  const ctx = useConsultation();
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4">
        <p className="text-xs text-muted-foreground mb-2">Aperçu</p>
        <div className="text-sm text-foreground whitespace-pre-wrap">{ctx.reportText}</div>
      </div>
      <Button variant="outline" className="w-full" onClick={() => ctx.doPrint("Compte-rendu", ctx.reportPrintHtml)}>
        <Printer className="h-4 w-4 mr-2" /> Imprimer
      </Button>
    </div>
  );
}

function ReportSign() {
  const ctx = useConsultation();
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground flex items-center gap-2">
        <FileSignature className="h-4 w-4 text-primary" /> Signe et (option) envoie au patient.
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ctx.reportSendToPatient} onChange={e => ctx.setReportSendToPatient(e.target.checked)} /> Envoyer au patient</label>
      <div className="rounded-xl border bg-card p-4">
        <p className="text-xs text-muted-foreground">Résumé</p>
        <p className="text-sm text-foreground font-semibold mt-1">{ctx.patient.name}</p>
        <p className="text-xs text-muted-foreground">Compte-rendu prêt</p>
      </div>
    </div>
  );
}

function CertCompose() {
  const ctx = useConsultation();
  return (
    <div className="space-y-4">
      <div><Label className="text-xs">Titre</Label><Input value={ctx.certReason} onChange={e => ctx.setCertReason(e.target.value)} className="mt-1 h-9" /></div>
      <div><Label className="text-xs">Texte</Label><textarea value={ctx.certComment} onChange={e => ctx.setCertComment(e.target.value)} rows={6} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" /></div>
    </div>
  );
}

function CertPreview() {
  const ctx = useConsultation();
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4">
        <p className="text-xs text-muted-foreground mb-2">Aperçu</p>
        <p className="text-sm font-semibold text-foreground">{ctx.certReason}</p>
        <p className="text-sm text-foreground mt-2">{ctx.certComment}</p>
      </div>
      <Button variant="outline" className="w-full" onClick={() => ctx.doPrint("Certificat", ctx.certPrintHtml)}>
        <Printer className="h-4 w-4 mr-2" /> Imprimer
      </Button>
    </div>
  );
}

function CertSign() {
  const ctx = useConsultation();
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground flex items-center gap-2">
        <FileSignature className="h-4 w-4 text-primary" /> Signature du certificat.
      </div>
      <div className="rounded-xl border bg-card p-4">
        <p className="text-xs text-muted-foreground">Patient</p>
        <p className="text-sm font-semibold text-foreground">{ctx.patient.name}</p>
      </div>
    </div>
  );
}

function SickCompose() {
  const ctx = useConsultation();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs">Début</Label><Input value={ctx.slStart} onChange={e => ctx.setSlStart(e.target.value)} className="mt-1 h-9" type="date" /></div>
        <div><Label className="text-xs">Fin</Label><Input value={ctx.slEnd} onChange={e => ctx.setSlEnd(e.target.value)} className="mt-1 h-9" type="date" /></div>
      </div>
      <div><Label className="text-xs">Commentaire</Label><textarea value={ctx.slComment} onChange={e => ctx.setSlComment(e.target.value)} rows={5} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" /></div>
    </div>
  );
}

function SickPreview() {
  const ctx = useConsultation();
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4">
        <p className="text-xs text-muted-foreground mb-2">Aperçu</p>
        <p className="text-sm text-foreground"><b>Du</b> {ctx.slStart} <b>au</b> {ctx.slEnd}</p>
        <p className="text-sm text-foreground mt-2">{ctx.slComment}</p>
      </div>
      <Button variant="outline" className="w-full" onClick={() => ctx.doPrint("Arrêt de travail", ctx.slPrintHtml)}>
        <Printer className="h-4 w-4 mr-2" /> Imprimer
      </Button>
    </div>
  );
}

function SickSign() {
  const ctx = useConsultation();
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground flex items-center gap-2">
        <FileSignature className="h-4 w-4 text-primary" /> Signature de l'arrêt.
      </div>
      <div className="rounded-xl border bg-card p-4">
        <p className="text-xs text-muted-foreground">Patient</p>
        <p className="text-sm font-semibold text-foreground">{ctx.patient.name}</p>
      </div>
    </div>
  );
}

function RdvPlan() {
  const ctx = useConsultation();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs">Date</Label><Input value={ctx.rdvDate} onChange={e => ctx.setRdvDate(e.target.value)} className="mt-1 h-9" type="date" /></div>
        <div><Label className="text-xs">Heure</Label><Input value={ctx.rdvTime} onChange={e => ctx.setRdvTime(e.target.value)} className="mt-1 h-9" type="time" /></div>
      </div>
      <div><Label className="text-xs">Lieu</Label><Input value={ctx.rdvLocation} onChange={e => ctx.setRdvLocation(e.target.value)} className="mt-1 h-9" /></div>
      <div className="rounded-xl border bg-muted/20 p-3 text-xs text-muted-foreground">RDV mock : plus tard tu brancheras ça sur l'agenda + notifications.</div>
    </div>
  );
}

function RdvConfirm() {
  const ctx = useConsultation();
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4">
        <p className="text-xs text-muted-foreground">Confirmation</p>
        <p className="text-sm font-semibold text-foreground mt-1">{ctx.patient.name}</p>
        <p className="text-sm text-foreground mt-2">{ctx.rdvDate || "(date)"} à {ctx.rdvTime || "(heure)"}</p>
        <p className="text-xs text-muted-foreground">Lieu : {ctx.rdvLocation}</p>
      </div>
    </div>
  );
}
