/**
 * PatientDetailDrawers — Tous les drawers du dossier patient :
 * Detail slide, Ordonnance (Rx), Analyses (Labs), Document (Doc).
 *
 * // TODO BACKEND: Envoyer les données au serveur lors de l'envoi.
 */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CheckCircle2, Copy, Pencil, Plus, Printer, Send, X } from "lucide-react";
import { usePatientDetail } from "./PatientDetailContext";
import { cx, makeCode, nowAt, dateLabel, buildRxItemsLabel } from "./helpers";
import { toast } from "@/hooks/use-toast";

/* ── Shared Drawer shell ── */
function Drawer({ open, title, onClose, children, footer }: {
  open: boolean; title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0">
        <div className="flex h-full flex-col">
          <SheetHeader className="px-4 py-3 border-b space-y-0">
            <SheetTitle className="text-sm font-semibold">{title}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-auto p-4">{children}</div>
          {footer ? <div className="border-t bg-card px-4 py-3">{footer}</div> : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function PatientDetailDrawers() {
  return (
    <>
      <DetailSlideDrawer />
      <RxDrawer />
      <LabsDrawer />
      <DocDrawer />
    </>
  );
}

/* ═══════════════════════════ Detail Slide ═══════════════════════════ */

function DetailSlideDrawer() {
  const ctx = usePatientDetail();
  const { drawer, setDrawer, detailEvent, setDetailEvent, detailEdit, setDetailEdit, detailDraft, setDetailDraft, detailNameDraft, setConsultRecords } = ctx;

  if (drawer !== "detail") return null;

  return (
    <Drawer open title={detailEvent ? `Détail — ${detailEvent.title}` : "Détail"}
      onClose={() => { setDrawer(null); setDetailEvent(null); setDetailEdit(false); }}
      footer={
        <div className="flex items-center justify-end gap-2 flex-wrap">
          {detailEvent?.type === "consult" ? (
            detailEdit ? (
              <>
                <Button variant="outline" onClick={() => setDetailEdit(false)}>Annuler</Button>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => {
                  const id = detailEvent?.payload?._id;
                  if (!id) { setDetailEdit(false); return; }
                  setConsultRecords((prev) => prev.map((c) => (c._id === id ? { ...c, notes: detailDraft } : c)));
                  setDetailEdit(false);
                }}>Enregistrer</Button>
              </>
            ) : <Button variant="outline" onClick={() => setDetailEdit(true)}><Pencil className="mr-2 h-4 w-4" /> Modifier</Button>
          ) : null}

          {detailEvent?.type === "rx" ? (
            <Button variant="outline" onClick={() => {
              const p = detailEvent?.payload;
              if (!p) return;
              const raw = Array.isArray(p.rawItems) ? p.rawItems :
                Array.isArray(p.items) ? p.items.map((name: string) => ({ medication: name, dosage: "", duration: "", instructions: "" })) :
                [{ medication: "", dosage: "", duration: "", instructions: "" }];
              ctx.setRxItems(raw.length ? raw : [{ medication: "", dosage: "", duration: "", instructions: "" }]);
              ctx.setRxNote(p.note || ""); ctx.setRxSigned(false); ctx.setRxSendToPatient(true);
              ctx.setRxSendToPharmacy(false); ctx.setRxStep(1); setDrawer("rx");
            }}><Pencil className="mr-2 h-4 w-4" /> Modifier</Button>
          ) : null}

          {detailEvent?.type === "lab" ? (
            <Button variant="outline" onClick={() => {
              const a = detailEvent?.payload;
              if (!a) return;
              const init: Record<string, boolean> = {};
              ctx.labPanels.forEach((p) => (init[p.key] = false));
              if (Array.isArray(a.values)) {
                a.values.forEach((v: any) => {
                  const match = ctx.labPanels.find((p) => p.label.toLowerCase() === String(v.name || "").toLowerCase());
                  if (match) init[match.key] = true;
                });
              }
              ctx.setLabsSelected(init); ctx.setLabsCustom(a.custom || "");
              ctx.setLabsNote(a.note || ""); ctx.setLabsValidated(false); ctx.setLabsStep(1); setDrawer("lab");
            }}><Pencil className="mr-2 h-4 w-4" /> Modifier</Button>
          ) : null}

          {detailEvent?.type === "doc" && detailEvent.payload?.meta?.template ? (
            <Button variant="outline" onClick={() => {
              const m = detailEvent.payload.meta;
              ctx.setDocTemplate(m.template); ctx.setDocBody(m.body || "");
              ctx.setDocSigned(false); ctx.setDocStep(1); setDrawer("doc");
            }}><Pencil className="mr-2 h-4 w-4" /> Modifier</Button>
          ) : null}
        </div>
      }>
      {detailEvent ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={cx("rounded-full px-2.5 py-0.5 text-[11px] font-medium",
              detailEvent.type === "consult" ? "bg-primary/10 text-primary" :
              detailEvent.type === "rx" ? "bg-accent/10 text-accent" :
              detailEvent.type === "lab" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground")}>
              {detailEvent.type === "consult" ? "Consultation" : detailEvent.type === "rx" ? "Ordonnance" :
               detailEvent.type === "lab" ? "Analyses" : "Document"}
            </div>
            <div className="text-xs text-muted-foreground">{detailEvent.at}</div>
          </div>

          {detailEvent.type === "consult" ? (
            <div className="space-y-2">
              <div className="text-sm font-semibold text-foreground">Notes</div>
              {!detailEdit ? (
                <div className="rounded-xl border bg-background p-3 text-sm text-foreground whitespace-pre-wrap">
                  {String(detailEvent.payload?.notes || detailEvent.desc || "—")}
                </div>
              ) : (
                <textarea value={detailDraft} onChange={(e) => ctx.setDetailDraft(e.target.value)} rows={10}
                  className="w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/25" />
              )}
            </div>
          ) : null}

          {detailEvent.type === "rx" ? (
            <div className="space-y-2">
              <div className="text-sm font-semibold text-foreground">Médicaments</div>
              <div className="rounded-xl border bg-background p-3 text-sm text-foreground">
                {Array.isArray(detailEvent.payload?.items) && detailEvent.payload.items.length ? detailEvent.payload.items.join(" • ") : "—"}
              </div>
              {detailEvent.payload?.note ? <div className="text-xs text-muted-foreground">Note : {detailEvent.payload.note}</div> : null}
            </div>
          ) : null}

          {detailEvent.type === "lab" ? (
            <div className="space-y-2">
              <div className="text-sm font-semibold text-foreground">Analyses</div>
              <div className="rounded-xl border bg-background p-3 text-sm text-foreground">
                {Array.isArray(detailEvent.payload?.values) && detailEvent.payload.values.length ? (
                  <ul className="space-y-1">
                    {detailEvent.payload.values.slice(0, 12).map((v: any, i: number) => (
                      <li key={i} className="text-sm"><span className="font-medium">{v.name}</span> : {v.value}</li>
                    ))}
                  </ul>
                ) : "—"}
              </div>
            </div>
          ) : null}

          {detailEvent.type === "doc" ? (
            <div className="space-y-2">
              <div className="text-sm font-semibold text-foreground">Fichier</div>
              <div className="rounded-xl border bg-background p-3 text-sm text-foreground">
                <div className="font-medium">{String(detailEvent.payload?.name || detailEvent.desc || "—")}</div>
                <div className="text-xs text-muted-foreground">{String(detailEvent.payload?.mime || "")}</div>
              </div>
              {detailEvent.payload?.meta?.template
                ? <div className="text-xs text-muted-foreground">Document généré (modifiable)</div>
                : <div className="text-xs text-muted-foreground">Document importé</div>}
            </div>
          ) : null}
        </div>
      ) : null}
    </Drawer>
  );
}

/* ═══════════════════════════ Rx Drawer ═══════════════════════════ */

function RxDrawer() {
  const ctx = usePatientDetail();
  const { drawer, setDrawer, patient, rxStep, setRxStep, rxItems, setRxItems, rxNote, setRxNote,
    rxSigned, setRxSigned, rxSendToPatient, setRxSendToPatient, rxSendToPharmacy, setRxSendToPharmacy,
    rxSendStatus, setRxSendStatus, rxEditingAfterSend, setRxEditingAfterSend, rxPreview,
    setRxRecords } = ctx;

  if (drawer !== "rx") return null;

  const copyPreview = () => {
    try { navigator.clipboard.writeText(rxPreview); toast({ title: "Ordonnance copié", description: "Copié dans le presse‑papiers." }); }
    catch { toast({ title: "Copie impossible", description: "Navigateur a bloqué l'accès." }); }
  };

  const handleSend = () => {
    const labels = buildRxItemsLabel(rxItems);
    if (!labels.length) { toast({ title: "Ordonnance", description: "Ajoutez au moins un médicament." }); return; }
    const at = nowAt(); const base = rxSendStatus?.code || makeCode("ORD");
    const nextVersion = rxSendStatus ? (rxEditingAfterSend ? rxSendStatus.version + 1 : rxSendStatus.version) : 1;
    // TODO BACKEND: POST /api/prescriptions — envoyer l'ordonnance
    setRxRecords((prev) => prev.map((r) => (r.status === "active" ? { ...r, status: "inactive" } : r)));
    setRxRecords((prev) => [{ _id: `${base}::v${nextVersion}`, id: base, date: dateLabel(), status: "active", items: labels, rawItems: rxItems, note: rxNote, sentAt: at, to: { patient: rxSendToPatient, pharmacy: rxSendToPharmacy }, version: nextVersion }, ...prev]);
    setRxSendStatus({ code: base, version: nextVersion, sentAt: at }); setRxEditingAfterSend(false);
    toast({ title: "Ordonnance envoyée", description: `${base} · v${nextVersion} (mock)` });
  };

  return (
    <Drawer open title={`Ordonnance — ${patient?.name || "Patient"}`} onClose={() => setDrawer(null)}
      footer={
        <div className="flex items-center justify-end gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => window.alert(rxPreview)}><Printer className="mr-1 h-3.5 w-3.5" /> Aperçu</Button>
            <Button variant="outline" size="sm" className="text-xs" onClick={copyPreview}><Copy className="mr-1 h-3.5 w-3.5" /> Copier</Button>
          </div>
          {rxStep === 1 && <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setRxStep(2)}>Continuer</Button>}
          {rxStep === 2 && <>
            <Button variant="outline" onClick={() => setRxStep(1)}>Retour</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => { if (!rxSigned) { window.alert("Veuillez signer/valider l'ordonnance."); return; } setRxStep(3); }}>Continuer</Button>
          </>}
          {rxStep === 3 && <>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setRxStep(2)}>Retour</Button>
            {rxSendStatus && !rxEditingAfterSend ? (
              <Button variant="outline" size="sm" className="text-xs" onClick={() => { setRxEditingAfterSend(true); setRxSigned(false); setRxStep(1); }}>
                <Pencil className="mr-1 h-3.5 w-3.5" /> Modifier
              </Button>
            ) : (
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                disabled={!rxSigned || (!rxSendToPatient && !rxSendToPharmacy)} onClick={handleSend}>
                <Send className="mr-1 h-3.5 w-3.5" /> Envoyer
              </Button>
            )}
          </>}
          <Button variant="outline" onClick={() => setDrawer(null)}>Fermer</Button>
        </div>
      }>
      <div className="space-y-4">
        {/* Stepper */}
        <div className="flex flex-wrap gap-2">
          {([1, "Composer", 2, "Signer", 3, "Envoyer"] as const).reduce<React.ReactNode[]>((acc, v, i) => {
            if (i % 2 === 0) return acc;
            const step = Number(([1, "Composer", 2, "Signer", 3, "Envoyer"] as const)[i - 1]) as 1 | 2 | 3;
            acc.push(
              <button key={step} type="button" onClick={() => {
                if (step === 3 && !rxSigned) { window.alert("Veuillez signer avant."); return; }
                setRxStep(step);
              }} className={cx("rounded-xl px-3 py-2 text-xs font-semibold border",
                rxStep === step ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground hover:bg-muted")}>
                {step}. {v}
              </button>
            );
            return acc;
          }, [])}
        </div>

        {rxStep === 1 && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">Composez l'ordonnance (UI). Ensuite : <span className="font-medium">Signer</span> puis <span className="font-medium">Envoyer</span>.</div>
            <div className="space-y-3">
              {rxItems.map((it, idx) => (
                <div key={idx} className="rounded-xl border bg-card p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-foreground">Médicament {idx + 1}</div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Supprimer"
                      onClick={() => setRxItems((items) => items.length <= 1 ? [{ medication: "", dosage: "", duration: "", instructions: "" }] : items.filter((_, i) => i !== idx))}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-3 grid grid-cols-12 gap-2">
                    <div className="col-span-12 md:col-span-5"><Label className="text-xs">Médicament</Label>
                      <Input value={it.medication} onChange={(e) => setRxItems((items) => items.map((x, i) => (i === idx ? { ...x, medication: e.target.value } : x)))} placeholder="Ex: Metformine 850mg" /></div>
                    <div className="col-span-12 md:col-span-3"><Label className="text-xs">Dosage</Label>
                      <Input value={it.dosage} onChange={(e) => setRxItems((items) => items.map((x, i) => (i === idx ? { ...x, dosage: e.target.value } : x)))} placeholder="Ex: 1 cp matin" /></div>
                    <div className="col-span-12 md:col-span-2"><Label className="text-xs">Durée</Label>
                      <Input value={it.duration} onChange={(e) => setRxItems((items) => items.map((x, i) => (i === idx ? { ...x, duration: e.target.value } : x)))} placeholder="Ex: 30 j" /></div>
                    <div className="col-span-12 md:col-span-2"><Label className="text-xs">Instructions</Label>
                      <Input value={it.instructions} onChange={(e) => setRxItems((items) => items.map((x, i) => (i === idx ? { ...x, instructions: e.target.value } : x)))} placeholder="Ex: après repas" /></div>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setRxItems((items) => [...items, { medication: "", dosage: "", duration: "", instructions: "" }])}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Ajouter un médicament
              </Button>
            </div>
            <div className="space-y-2"><Label className="text-xs">Note / recommandations (optionnel)</Label>
              <textarea value={rxNote} onChange={(e) => setRxNote(e.target.value)} rows={3}
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="Ex: Refaire HbA1c dans 3 mois…" /></div>
            <div className="rounded-xl border bg-muted p-3"><div className="text-xs font-semibold text-muted-foreground mb-2">Aperçu</div>
              <pre className="text-xs whitespace-pre-wrap text-foreground">{rxPreview}</pre></div>
          </div>
        )}

        {rxStep === 2 && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">Vérifiez puis signez/validez.</div>
            <div className="rounded-xl border bg-muted p-3"><pre className="text-xs whitespace-pre-wrap text-foreground">{rxPreview}</pre></div>
            <div className="rounded-xl border bg-card p-3">
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1" checked={rxSigned} onChange={(e) => setRxSigned(e.target.checked)} />
                <div><div className="text-sm font-semibold text-foreground">Je valide et signe l'ordonnance</div>
                  <div className="text-xs text-muted-foreground">(Mock) À brancher sur signature électronique.</div></div>
              </label>
            </div>
          </div>
        )}

        {rxStep === 3 && (
          <div className="space-y-4">
            {rxSendStatus && !rxEditingAfterSend ? (
              <div className="rounded-xl border bg-primary/5 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><CheckCircle2 className="h-4 w-4 text-primary" /> Ordonnance envoyée — {rxSendStatus.code} · v{rxSendStatus.version}</div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{rxSendStatus.sentAt}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Cliquez sur <span className="font-medium">Modifier</span> pour préparer une nouvelle version.</div>
              </div>
            ) : null}
            <div className="text-sm text-muted-foreground">Choisissez les destinataires.</div>
            <div className="rounded-xl border bg-card p-3 space-y-3">
              <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={rxSendToPatient} onChange={(e) => setRxSendToPatient(e.target.checked)} /> Envoyer au patient</label>
              <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={rxSendToPharmacy} onChange={(e) => setRxSendToPharmacy(e.target.checked)} /> Envoyer à la pharmacie</label>
              {!rxSendToPatient && !rxSendToPharmacy ? <div className="text-xs text-destructive">Sélectionnez au moins un destinataire.</div> : null}
            </div>
            <div className="rounded-xl border bg-muted p-3"><pre className="text-xs whitespace-pre-wrap text-foreground">{rxPreview}</pre></div>
          </div>
        )}
      </div>
    </Drawer>
  );
}

/* ═══════════════════════════ Labs Drawer ═══════════════════════════ */

function LabsDrawer() {
  const ctx = usePatientDetail();
  const { drawer, setDrawer, patient, labsStep, setLabsStep, labPanels, labsSelected, setLabsSelected,
    labsCustom, setLabsCustom, labsNote, setLabsNote, labsSendToPatient, setLabsSendToPatient,
    labsSendToLab, setLabsSendToLab, labsValidated, setLabsValidated,
    labsSendStatus, setLabsSendStatus, labsEditingAfterSend, setLabsEditingAfterSend,
    labsPreview, selectedLabLabels, setLabRecords } = ctx;

  if (drawer !== "lab") return null;

  const handleSend = () => {
    const labels = selectedLabLabels();
    if (!labels.length) { toast({ title: "Analyses", description: "Sélectionnez au moins une analyse." }); return; }
    const at = nowAt(); const base = labsSendStatus?.code || makeCode("LAB");
    const nextVersion = labsSendStatus ? (labsEditingAfterSend ? labsSendStatus.version + 1 : labsSendStatus.version) : 1;
    const values = labels.map((name) => ({ name, value: "—" }));
    const type = labels.slice(0, 3).join(", ") + (labels.length > 3 ? ` +${labels.length - 3}` : "");
    // TODO BACKEND: POST /api/lab-requests — envoyer la demande
    setLabRecords((prev) => [{ _id: `${base}::v${nextVersion}`, id: base, date: dateLabel(), type: type || "Demande d'analyses", values, note: labsNote, custom: (labsCustom || "").trim(), sentAt: at, to: { patient: labsSendToPatient, lab: labsSendToLab }, version: nextVersion }, ...prev]);
    setLabsSendStatus({ code: base, version: nextVersion, sentAt: at }); setLabsEditingAfterSend(false);
    toast({ title: "Demande d'analyses envoyée", description: `${base} · v${nextVersion} (mock)` });
  };

  return (
    <Drawer open title={`Analyses — ${patient?.name || "Patient"}`} onClose={() => setDrawer(null)}
      footer={
        <div className="flex items-center justify-end gap-2 flex-wrap">
          {labsStep === 1 && <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setLabsStep(2)}>Continuer</Button>}
          {labsStep === 2 && <>
            <Button variant="outline" onClick={() => setLabsStep(1)}>Retour</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => { if (!labsValidated) { window.alert("Veuillez valider la demande."); return; } setLabsStep(3); }}>Continuer</Button>
          </>}
          {labsStep === 3 && <>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setLabsStep(2)}>Retour</Button>
            {labsSendStatus && !labsEditingAfterSend ? (
              <Button variant="outline" size="sm" className="text-xs" onClick={() => { setLabsEditingAfterSend(true); setLabsValidated(false); setLabsStep(1); }}>
                <Pencil className="mr-1 h-3.5 w-3.5" /> Modifier
              </Button>
            ) : (
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                disabled={!labsValidated || (!labsSendToPatient && !labsSendToLab)} onClick={handleSend}>
                <Send className="mr-1 h-3.5 w-3.5" /> Envoyer
              </Button>
            )}
          </>}
          <Button variant="outline" onClick={() => setDrawer(null)}>Fermer</Button>
        </div>
      }>
      <div className="space-y-4">
        {/* Stepper */}
        <div className="flex flex-wrap gap-2">
          {[{ s: 1, l: "Sélection" }, { s: 2, l: "Valider" }, { s: 3, l: "Envoyer" }].map(({ s, l }) => (
            <button key={s} type="button"
              onClick={() => { if (s === 3 && !labsValidated) { window.alert("Veuillez valider avant."); return; } setLabsStep(s as any); }}
              className={cx("rounded-xl px-3 py-2 text-xs font-semibold border",
                labsStep === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground hover:bg-muted")}>
              {s}. {l}
            </button>
          ))}
        </div>

        {labsStep === 1 && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">Sélectionnez les analyses.</div>
            <div className="grid grid-cols-12 gap-2">
              {labPanels.map((p) => (
                <label key={p.key} className="col-span-12 md:col-span-6 rounded-xl border bg-card p-3 flex items-start gap-3">
                  <input type="checkbox" className="mt-1" checked={Boolean(labsSelected[p.key])} onChange={(e) => setLabsSelected((s) => ({ ...s, [p.key]: e.target.checked }))} />
                  <div><div className="text-sm font-semibold text-foreground">{p.label}</div>
                    {p.hint ? <div className="text-xs text-muted-foreground">{p.hint}</div> : null}</div>
                </label>
              ))}
            </div>
            <div className="space-y-2"><Label className="text-xs">Autres analyses (optionnel)</Label>
              <Input value={labsCustom} onChange={(e) => setLabsCustom(e.target.value)} placeholder="Ex: Vitamine D, Ferritine…" /></div>
            <div className="space-y-2"><Label className="text-xs">Note (optionnel)</Label>
              <textarea value={labsNote} onChange={(e) => setLabsNote(e.target.value)} rows={3}
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="Ex: à jeun, urgence…" /></div>
            <div className="rounded-xl border bg-muted p-3"><div className="text-xs font-semibold text-muted-foreground mb-2">Aperçu</div>
              <pre className="text-xs whitespace-pre-wrap text-foreground">{labsPreview}</pre></div>
          </div>
        )}

        {labsStep === 2 && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">Vérifiez puis validez la demande.</div>
            <div className="rounded-xl border bg-muted p-3"><pre className="text-xs whitespace-pre-wrap text-foreground">{labsPreview}</pre></div>
            <div className="rounded-xl border bg-card p-3">
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1" checked={labsValidated} onChange={(e) => setLabsValidated(e.target.checked)} />
                <div><div className="text-sm font-semibold text-foreground">Je valide la demande d'analyses</div>
                  <div className="text-xs text-muted-foreground">(Mock) À brancher sur règles métiers.</div></div>
              </label>
            </div>
          </div>
        )}

        {labsStep === 3 && (
          <div className="space-y-4">
            {labsSendStatus && !labsEditingAfterSend ? (
              <div className="rounded-xl border bg-primary/5 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><CheckCircle2 className="h-4 w-4 text-primary" /> Demande envoyée — {labsSendStatus.code} · v{labsSendStatus.version}</div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{labsSendStatus.sentAt}</span>
                </div>
              </div>
            ) : null}
            <div className="text-sm text-muted-foreground">Choisissez les destinataires.</div>
            <div className="rounded-xl border bg-card p-3 space-y-3">
              <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={labsSendToPatient} onChange={(e) => setLabsSendToPatient(e.target.checked)} /> Envoyer au patient</label>
              <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={labsSendToLab} onChange={(e) => setLabsSendToLab(e.target.checked)} /> Envoyer au laboratoire</label>
              {!labsSendToPatient && !labsSendToLab ? <div className="text-xs text-destructive">Sélectionnez au moins un destinataire.</div> : null}
            </div>
            <div className="rounded-xl border bg-muted p-3"><pre className="text-xs whitespace-pre-wrap text-foreground">{labsPreview}</pre></div>
          </div>
        )}
      </div>
    </Drawer>
  );
}

/* ═══════════════════════════ Doc Drawer ═══════════════════════════ */

function DocDrawer() {
  const ctx = usePatientDetail();
  const { drawer, setDrawer, patient, docStep, setDocStep, docTemplate, setDocTemplate,
    docBody, setDocBody, docSigned, setDocSigned, docSendToPatient, setDocSendToPatient,
    docSendStatus, setDocSendStatus, docEditingAfterSend, setDocEditingAfterSend,
    docTitle, docPreview, setFiles } = ctx;

  if (drawer !== "doc") return null;

  const copyPreview = () => {
    try { navigator.clipboard.writeText(docPreview); toast({ title: "Document copié", description: "Copié dans le presse‑papiers." }); }
    catch { toast({ title: "Copie impossible", description: "Navigateur a bloqué l'accès." }); }
  };

  const handleSend = () => {
    const at = nowAt();
    const nextVersion = docSendStatus ? (docEditingAfterSend ? docSendStatus.version + 1 : docSendStatus.version) : 1;
    const now = Date.now();
    const blob = new Blob([docPreview], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const suffix = nextVersion > 1 ? ` (v${nextVersion})` : "";
    const safeName = `${docTitle}${suffix} — ${patient?.name || "Patient"} (${new Date().toLocaleDateString()}).txt`;
    const id = `pf-${now}-${Math.random().toString(16).slice(2)}`;
    // TODO BACKEND: POST /api/documents — enregistrer le document
    const newFile = { id, at, ts: now, kind: "document" as const, name: safeName, mime: "text/plain", size: blob.size, url, meta: { template: docTemplate, body: docBody, title: docTitle, version: nextVersion } };
    ctx.setFiles((prev: any[]) => [newFile, ...prev]);
    setDocSendStatus({ fileId: id, version: nextVersion, sentAt: at }); setDocEditingAfterSend(false);
    toast({ title: "Document envoyé", description: `${docTitle} · v${nextVersion} (mock)` });
  };

  return (
    <Drawer open title={`${docTitle} — ${patient?.name || "Patient"}`} onClose={() => setDrawer(null)}
      footer={
        <div className="flex items-center justify-end gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => window.alert(docPreview)}><Printer className="mr-1 h-3.5 w-3.5" /> Aperçu</Button>
            <Button variant="outline" size="sm" className="text-xs" onClick={copyPreview}><Copy className="mr-1 h-3.5 w-3.5" /> Copier</Button>
          </div>
          {docStep === 1 && <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setDocStep(2)}>Continuer</Button>}
          {docStep === 2 && <>
            <Button variant="outline" onClick={() => setDocStep(1)}>Retour</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => { if (!docSigned) { window.alert("Veuillez signer/valider."); return; } setDocStep(3); }}>Continuer</Button>
          </>}
          {docStep === 3 && <>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setDocStep(2)}>Retour</Button>
            {docSendStatus && !docEditingAfterSend ? (
              <Button variant="outline" size="sm" className="text-xs" onClick={() => { setDocEditingAfterSend(true); setDocSigned(false); setDocStep(1); }}>
                <Pencil className="mr-1 h-3.5 w-3.5" /> Modifier
              </Button>
            ) : (
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                disabled={!docSigned || !docSendToPatient} onClick={handleSend}>
                <Send className="mr-1 h-3.5 w-3.5" /> Envoyer
              </Button>
            )}
          </>}
          <Button variant="outline" onClick={() => setDrawer(null)}>Fermer</Button>
        </div>
      }>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {[{ s: 1, l: "Rédiger" }, { s: 2, l: "Signer" }, { s: 3, l: "Envoyer" }].map(({ s, l }) => (
            <button key={s} type="button"
              onClick={() => { if (s === 3 && !docSigned) { window.alert("Veuillez signer avant."); return; } setDocStep(s as any); }}
              className={cx("rounded-xl px-3 py-2 text-xs font-semibold border",
                docStep === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground hover:bg-muted")}>
              {s}. {l}
            </button>
          ))}
        </div>

        {docStep === 1 && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">Choisissez un template puis rédigez.</div>
            <div className="flex flex-wrap gap-2">
              {([{ k: "report", label: "Compte-rendu" }, { k: "certificate", label: "Certificat" }, { k: "referral", label: "Lettre" }, { k: "sickleave", label: "Arrêt" }] as const).map((t) => (
                <button key={t.k} type="button" onClick={() => setDocTemplate(t.k)}
                  className={cx("rounded-xl px-3 py-2 text-xs font-semibold border",
                    docTemplate === t.k ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground hover:bg-muted")}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="space-y-2"><Label className="text-xs">Contenu</Label>
              <textarea value={docBody} onChange={(e) => setDocBody(e.target.value)} rows={10}
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="Rédigez le document…" /></div>
            <div className="rounded-xl border bg-muted p-3"><div className="text-xs font-semibold text-muted-foreground mb-2">Aperçu</div>
              <pre className="text-xs whitespace-pre-wrap text-foreground">{docPreview}</pre></div>
          </div>
        )}

        {docStep === 2 && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">Vérifiez puis signez/validez.</div>
            <div className="rounded-xl border bg-muted p-3"><pre className="text-xs whitespace-pre-wrap text-foreground">{docPreview}</pre></div>
            <div className="rounded-xl border bg-card p-3">
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1" checked={docSigned} onChange={(e) => setDocSigned(e.target.checked)} />
                <div><div className="text-sm font-semibold text-foreground">Je valide et signe le document</div>
                  <div className="text-xs text-muted-foreground">(Mock) À brancher sur signature électronique.</div></div>
              </label>
            </div>
          </div>
        )}

        {docStep === 3 && (
          <div className="space-y-4">
            {docSendStatus && !docEditingAfterSend ? (
              <div className="rounded-xl border bg-primary/5 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><CheckCircle2 className="h-4 w-4 text-primary" /> Document envoyé · v{docSendStatus.version}</div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{docSendStatus.sentAt}</span>
                </div>
              </div>
            ) : null}
            <div className="text-sm text-muted-foreground">Choisissez les destinataires.</div>
            <div className="rounded-xl border bg-card p-3 space-y-3">
              <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={docSendToPatient} onChange={(e) => setDocSendToPatient(e.target.checked)} /> Envoyer au patient</label>
              {!docSendToPatient ? <div className="text-xs text-destructive">Sélectionnez un destinataire.</div> : null}
            </div>
            <div className="rounded-xl border bg-muted p-3"><pre className="text-xs whitespace-pre-wrap text-foreground">{docPreview}</pre></div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
