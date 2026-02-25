import { FileText, History, PenLine, Pill, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConsultation } from "./ConsultationContext";

export function ConsultationNotes() {
  const ctx = useConsultation();

  return (
    <main className="space-y-4 min-w-0">
      {/* Templates */}
      <div className="rounded-xl border bg-card p-4 shadow-card">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <p className="text-xs text-muted-foreground">Raccourcis</p>
            <h2 className="font-semibold text-foreground">Templates de consultation</h2>
          </div>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => ctx.setHistoryOpen(true)}>
            <History className="h-3.5 w-3.5 mr-1" /> Voir historique
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {ctx.templates.map(t => (
            <button key={t.key} className="px-3 py-2 rounded-xl border bg-background hover:bg-muted/40 text-sm font-medium" onClick={t.apply}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="mt-3 p-3 rounded-xl bg-muted/30 border text-xs text-muted-foreground flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Astuce : clique un template → puis ouvre le slide Ordonnance/CR pour signer rapidement.
        </div>
      </div>

      {/* Notes */}
      <section id="notes" className="rounded-xl border bg-card p-4 shadow-card">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Le cœur de la consultation</p>
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <PenLine className="h-4 w-4 text-primary" /> Notes
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => ctx.openSlide("report", 0)}>
              <FileText className="h-3.5 w-3.5 mr-1" /> Générer CR
            </Button>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => ctx.openSlide("rx", 0)}>
              <Pill className="h-3.5 w-3.5 mr-1" /> Ordonnance
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-4">
          <div>
            <Label className="text-xs">Motif</Label>
            <Input value={ctx.motif} onChange={e => ctx.setMotif(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Anamnèse / Symptômes</Label>
            <textarea value={ctx.symptoms} onChange={e => ctx.setSymptoms(e.target.value)} rows={5} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <Label className="text-xs">Examen clinique</Label>
            <textarea value={ctx.examination} onChange={e => ctx.setExamination(e.target.value)} rows={5} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <Label className="text-xs">Diagnostic</Label>
              <textarea value={ctx.diagnosis} onChange={e => ctx.setDiagnosis(e.target.value)} rows={4} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Plan / Conduite à tenir</Label>
              <textarea value={ctx.conclusion} onChange={e => ctx.setConclusion(e.target.value)} rows={4} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
