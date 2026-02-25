import {
  Activity, Bot, Calendar, CheckCircle2, Clock, FileSignature, FileText, Pill, Plus, Printer, Stethoscope, Trash2, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConsultation } from "./ConsultationContext";
import { scrollToId } from "./helpers";

export function ActionDock() {
  const ctx = useConsultation();

  return (
    <aside className="space-y-4 lg:sticky lg:top-[160px] lg:self-start">
      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        <div className="p-3 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" /> Action Dock
          </h3>
          <span className="text-[11px] text-muted-foreground">Tout sans navigation</span>
        </div>

        {/* Tabs */}
        <div className="p-2 border-b bg-muted/20">
          <div className="grid grid-cols-4 gap-1">
            {([
              { key: "rx" as const, icon: Pill, label: "Rx" },
              { key: "labs" as const, icon: Activity, label: "Analyses" },
              { key: "docs" as const, icon: FileText, label: "Docs" },
              { key: "tasks" as const, icon: CheckCircle2, label: "Tâches" },
            ]).map(tab => (
              <Button key={tab.key} variant={ctx.dockTab === tab.key ? "default" : "outline"} size="sm" className="h-9 text-xs" onClick={() => ctx.setDockTab(tab.key)}>
                <tab.icon className="h-3.5 w-3.5 mr-1" /> {tab.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="p-3">
          {/* Rx */}
          {ctx.dockTab === "rx" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Ordonnance</p>
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => ctx.openSlide("rx", 0)}>
                  <FileSignature className="h-3.5 w-3.5 mr-1" /> Finaliser
                </Button>
              </div>
              <div className="rounded-xl border bg-muted/20 p-2">
                <p className="text-[11px] text-muted-foreground mb-2">Favoris (1 clic)</p>
                <div className="flex flex-wrap gap-2">
                  {ctx.rxFavorites.map(f => (
                    <button key={f.label} onClick={() => ctx.addFavToRx(f)} className="px-2 py-1 rounded-lg border bg-background hover:bg-muted/60 text-xs">{f.label}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                {ctx.rxItems.map((item, idx) => (
                  <div key={idx} className="rounded-xl border bg-card p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-foreground">#{idx + 1}</p>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => ctx.removeRxItem(idx)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="mt-2 space-y-2">
                      <div>
                        <Label className="text-[11px] text-muted-foreground">Médicament</Label>
                        <Input value={item.medication} onChange={e => ctx.updateRxItem(idx, "medication", e.target.value)} className="mt-1 h-9" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[11px] text-muted-foreground">Posologie</Label>
                          <Input value={item.dosage} onChange={e => ctx.updateRxItem(idx, "dosage", e.target.value)} className="mt-1 h-9" />
                        </div>
                        <div>
                          <Label className="text-[11px] text-muted-foreground">Durée</Label>
                          <Input value={item.duration} onChange={e => ctx.updateRxItem(idx, "duration", e.target.value)} className="mt-1 h-9" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-[11px] text-muted-foreground">Consignes</Label>
                        <Input value={item.instructions} onChange={e => ctx.updateRxItem(idx, "instructions", e.target.value)} className="mt-1 h-9" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full text-xs" onClick={ctx.addRxItem}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Ajouter un médicament
              </Button>
              {ctx.rxSignedAt && (
                <div className="rounded-xl border bg-accent/5 border-accent/20 p-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-accent">Signée</span> à {ctx.rxSignedAt.toLocaleTimeString().slice(0, 5)}
                </div>
              )}
            </div>
          )}

          {/* Labs */}
          {ctx.dockTab === "labs" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">Analyses</p>
                  {ctx.labsSignedAt && <span className="text-[11px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">Envoyées</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => ctx.openSlide("labs", 1)}>
                    <FileSignature className="h-3.5 w-3.5 mr-1" /> Envoyer
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => ctx.doPrint("Prescription d'analyses", ctx.labsPrintHtml)}>
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Input value={ctx.newAnalyse} onChange={e => ctx.setNewAnalyse(e.target.value)} placeholder="Ajouter une analyse…" className="h-9"
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); ctx.addAnalyse(); } }} />
                <Button variant="outline" size="sm" className="h-9" onClick={() => ctx.addAnalyse()}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
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
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => ctx.removeAnalyse(a)}>
                      <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border bg-muted/20 p-3 text-xs text-muted-foreground flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" /> Tu peux garder Analyses optionnel : l'objectif est d'aller vite.
              </div>
            </div>
          )}

          {/* Docs */}
          {ctx.dockTab === "docs" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Documents à générer</p>
              <div className="space-y-2">
                {([
                  { type: "report" as const, icon: FileText, label: "Compte-rendu", color: "text-primary", signed: ctx.reportSignedAt },
                  { type: "certificate" as const, icon: FileSignature, label: "Certificat", color: "text-warning", signed: ctx.certSignedAt },
                  { type: "sickleave" as const, icon: Calendar, label: "Arrêt de travail", color: "text-primary", signed: ctx.slSignedAt },
                  { type: "rdv" as const, icon: Clock, label: "Planifier RDV", color: "text-primary", signed: ctx.rdvConfirmedAt },
                ]).map(d => (
                  <Button key={d.type} variant="outline" size="sm" className="w-full justify-start text-xs" onClick={() => ctx.openSlide(d.type, 0)}>
                    <d.icon className={`h-3.5 w-3.5 mr-2 ${d.color}`} /> {d.label}
                    {d.signed && <span className="ml-auto text-[11px] text-accent">{d.type === "rdv" ? "OK" : "Signé"}</span>}
                  </Button>
                ))}
              </div>
              <div className="rounded-xl border bg-muted/20 p-3 text-xs text-muted-foreground flex items-center gap-2">
                <Printer className="h-4 w-4 text-primary" /> Les previews sont imprimables (mock).
              </div>
            </div>
          )}

          {/* Tasks */}
          {ctx.dockTab === "tasks" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Checklist (auto)</p>
              <div className="space-y-2">
                {([
                  { label: "Constantes", ok: ctx.completion.vitalsOk, action: () => ctx.setLeftCollapsed(false), actionLabel: "Remplir" },
                  { label: "Notes", ok: ctx.completion.notesOk, action: () => scrollToId("notes"), actionLabel: "Compléter" },
                  { label: "Ordonnance", ok: ctx.completion.rxOk, action: () => ctx.setDockTab("rx"), actionLabel: "Ajouter" },
                  { label: "Signer / Envoyer", ok: !!(ctx.rxSignedAt || ctx.reportSignedAt), action: () => ctx.openSlide("rx", 0), actionLabel: "Ouvrir" },
                ]).map(t => (
                  <div key={t.label} className="flex items-center justify-between rounded-xl border bg-card px-3 py-2">
                    <span className="text-sm text-foreground">{t.label}</span>
                    {t.ok ? (
                      <span className="text-xs text-accent font-semibold">OK</span>
                    ) : (
                      <Button variant="outline" size="sm" className="h-8 text-xs" onClick={t.action}>{t.actionLabel}</Button>
                    )}
                  </div>
                ))}
              </div>
              <div className="rounded-xl border bg-muted/20 p-3 text-xs text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Objectif : 2–3 actions → notes + Rx + clôture.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-xl border bg-card p-4 shadow-card">
        <p className="text-xs text-muted-foreground mb-2">Actions rapides</p>
        <div className="grid gap-2">
          <Button variant="outline" size="sm" className="w-full text-xs justify-start" onClick={() => ctx.openSlide("rdv", 0)}>
            <Calendar className="h-3.5 w-3.5 mr-2 text-primary" /> Planifier prochain RDV
          </Button>
          <Button variant="outline" size="sm" className="w-full text-xs justify-start" onClick={() => ctx.openSlide("certificate", 0)}>
            <FileSignature className="h-3.5 w-3.5 mr-2 text-warning" /> Certificat médical
          </Button>
          <Button variant="outline" size="sm" className="w-full text-xs justify-start" onClick={() => ctx.setPaletteOpen(true)}>
            <Bot className="h-3.5 w-3.5 mr-2 text-primary" /> Palette (Ctrl+K)
          </Button>
        </div>
      </div>
    </aside>
  );
}
