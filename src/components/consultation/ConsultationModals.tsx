import { AlertTriangle, CheckCircle2, History, Pill, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConsultation } from "./ConsultationContext";

export function CloseModal() {
  const ctx = useConsultation();
  if (!ctx.showCloseModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
      <div className="rounded-2xl border bg-card shadow-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-bold text-foreground mb-1">Clôturer la consultation</h3>
        <p className="text-sm text-muted-foreground mb-5">Vérifiez les informations avant de clôturer.</p>
        <div className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground mb-1">Diagnostic</p>
            <p className="text-sm font-medium text-foreground">{ctx.diagnosis}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground mb-2">Ordonnance</p>
            <div className="space-y-1">
              {ctx.rxItems.filter(p => p.medication).slice(0, 6).map((p, i) => (
                <p key={i} className="text-sm text-foreground flex items-center gap-1.5">
                  <Pill className="h-3 w-3 text-primary" /> {p.medication} — {p.dosage}
                </p>
              ))}
              {ctx.rxItems.filter(p => p.medication).length > 6 && <p className="text-xs text-muted-foreground">+ autres…</p>}
            </div>
          </div>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Prochain RDV</Label>
              <select value={ctx.nextRdv} onChange={e => ctx.setNextRdv(e.target.value)} className="mt-1 w-full h-9 rounded-md border bg-background px-3 text-sm">
                {["1 semaine", "2 semaines", "1 mois", "3 mois", "6 mois", "Non nécessaire"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Montant (DT)</Label>
              <Input value={ctx.consultAmount} onChange={e => ctx.setConsultAmount(e.target.value)} className="mt-1 h-9" type="number" />
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/5 border border-warning/20">
            <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
            <p className="text-xs text-muted-foreground">Astuce : signe l'ordonnance (slide) puis clôture.</p>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => ctx.setShowCloseModal(false)}>Annuler</Button>
          <Button className="flex-1 gradient-primary text-primary-foreground shadow-primary-glow" onClick={ctx.handleClose}>Confirmer</Button>
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
  if (!ctx.paletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm" onClick={() => ctx.setPaletteOpen(false)}>
      <div className="max-w-lg w-[92%] mx-auto mt-24 rounded-2xl border bg-card shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-3 border-b flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input ref={ctx.paletteInputRef} value={ctx.paletteQuery} onChange={e => { ctx.setPaletteQuery(e.target.value); ctx.setPaletteIndex(0); }} placeholder="Rechercher une action…" className="h-9" />
          <span className="text-[11px] text-muted-foreground px-2 py-1 rounded-full bg-muted">Ctrl+K</span>
        </div>
        <div className="p-2">
          {ctx.filteredPalette.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">Aucune action.</div>
          ) : (
            <div className="space-y-1">
              {ctx.filteredPalette.map((a, i) => (
                <button key={a.id}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl ${i === ctx.paletteIndex ? "bg-muted" : "hover:bg-muted/60"}`}
                  onMouseEnter={() => ctx.setPaletteIndex(i)}
                  onClick={() => { ctx.setPaletteOpen(false); a.onRun(); }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{a.icon}</span>
                    <span className="text-sm font-medium text-foreground">{a.label}</span>
                  </div>
                  {a.hint && <span className="text-xs text-muted-foreground">{a.hint}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="p-3 border-t flex items-center justify-between text-xs text-muted-foreground">
          <span>↑ ↓ pour naviguer · Entrée pour lancer · Esc pour fermer</span>
          <Button variant="ghost" size="sm" className="h-8" onClick={() => ctx.setPaletteOpen(false)}>Fermer</Button>
        </div>
      </div>
    </div>
  );
}

export function ClosedView() {
  const ctx = useConsultation();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="rounded-xl border bg-card p-8 shadow-card text-center">
        <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-accent" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Consultation clôturée</h2>
        <p className="text-muted-foreground mt-2">La consultation avec {ctx.patient.name} a été clôturée avec succès.</p>
      </div>
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h3 className="font-semibold text-foreground mb-4">Récapitulatif</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { label: "Patient", value: ctx.patient.name },
            { label: "Diagnostic", value: ctx.diagnosis },
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
      <div className="flex gap-3 justify-center flex-wrap">
        <Button variant="outline" onClick={() => ctx.navigate("/dashboard/doctor/consultations")}>Retour</Button>
        <Button variant="outline" onClick={() => ctx.doPrint("Ordonnance", ctx.rxPrintHtml)}>Imprimer ordonnance</Button>
        <Button className="gradient-primary text-primary-foreground shadow-primary-glow" onClick={() => ctx.navigate("/dashboard/doctor/consultation/new")}>
          <Plus className="h-4 w-4 mr-2" /> Nouvelle consultation
        </Button>
      </div>
    </div>
  );
}
