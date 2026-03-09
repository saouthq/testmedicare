import { FileText, History, PenLine, Pill, Plus, Save, Sparkles, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useConsultation } from "./ConsultationContext";
import { toast } from "@/hooks/use-toast";

export function ConsultationNotes() {
  const ctx = useConsultation();
  const [saveOpen, setSaveOpen] = useState(false);
  const [tplName, setTplName] = useState("");

  const handleSaveTemplate = () => {
    if (!tplName.trim()) { toast({ title: "Nom obligatoire", variant: "destructive" }); return; }
    ctx.saveAsTemplate(tplName.trim());
    toast({ title: "Template enregistré", description: tplName.trim() });
    setTplName("");
    setSaveOpen(false);
  };

  const handleDeleteTemplate = (key: string, label: string) => {
    ctx.deleteTemplate(key);
    toast({ title: "Template supprimé", description: label });
  };

  return (
    <main className="space-y-4 min-w-0">
      {/* Templates */}
      <div className="rounded-xl border bg-card p-4 shadow-card">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <p className="text-xs text-muted-foreground">Raccourcis</p>
            <h2 className="font-semibold text-foreground">Templates de consultation</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => { setTplName(""); setSaveOpen(true); }}>
              <Save className="h-3.5 w-3.5 mr-1" /> Sauvegarder
            </Button>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => ctx.setHistoryOpen(true)}>
              <History className="h-3.5 w-3.5 mr-1" /> Historique
            </Button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {ctx.templates.map(t => (
            <div key={t.key} className="group relative">
              <button className="px-3 py-2 rounded-xl border bg-background hover:bg-muted/40 text-sm font-medium transition-colors" onClick={t.apply}>
                {t.label}
              </button>
              {t.isCustom && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(t.key, t.label); }}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3 text-destructive" />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 p-3 rounded-xl bg-muted/30 border text-xs text-muted-foreground flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          Cliquez un template pour pré-remplir les notes. « Sauvegarder » enregistre vos notes actuelles comme nouveau template.
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

      {/* Save template dialog */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sauvegarder comme template</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Les notes, motif, diagnostic et analyses actuels seront sauvegardés et réutilisables pour vos prochaines consultations.
          </p>
          <div className="space-y-2 py-2">
            <Label className="text-xs">Nom du template *</Label>
            <Input
              value={tplName}
              onChange={e => setTplName(e.target.value)}
              placeholder="Ex: Suivi grossesse, Bilan annuel…"
              onKeyDown={e => { if (e.key === "Enter") handleSaveTemplate(); }}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSaveOpen(false)}>Annuler</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={handleSaveTemplate}>
              <Save className="h-3.5 w-3.5 mr-1" /> Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
