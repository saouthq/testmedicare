/**
 * ConsultationNotes — Zone centrale, médecin généraliste
 * 5 sections colorées + templates rapides.
 * Pas de shortcuts docs (déplacés dans ActionDock > onglet Docs).
 */
import { History, Save, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useConsultation } from "./ConsultationContext";
import { toast } from "@/hooks/use-toast";

// ── Section card ──────────────────────────────────────────────
function NoteSection({
  id,
  label,
  hint,
  accent, // Tailwind color prefix e.g. "blue", "amber", "teal", "violet", "emerald"
  value,
  onChange,
  placeholder,
  rows = 3,
  singleLine = false,
  required = false,
  filled, // override to show filled state
}: {
  id?: string;
  label: string;
  hint?: string;
  accent: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  singleLine?: boolean;
  required?: boolean;
  filled?: boolean;
}) {
  const isFilled = filled !== undefined ? filled : value.trim().length > 0;
  const accentMap: Record<string, { bar: string; bg: string; text: string; badge: string }> = {
    blue: {
      bar: "bg-blue-500",
      bg: "bg-blue-50/60 dark:bg-blue-950/30",
      text: "text-blue-600 dark:text-blue-400",
      badge: "bg-blue-100 dark:bg-blue-900/50",
    },
    amber: {
      bar: "bg-amber-400",
      bg: "bg-amber-50/60 dark:bg-amber-950/30",
      text: "text-amber-600 dark:text-amber-400",
      badge: "bg-amber-100 dark:bg-amber-900/50",
    },
    teal: {
      bar: "bg-teal-500",
      bg: "bg-teal-50/60 dark:bg-teal-950/30",
      text: "text-teal-600 dark:text-teal-400",
      badge: "bg-teal-100 dark:bg-teal-900/50",
    },
    violet: {
      bar: "bg-violet-500",
      bg: "bg-violet-50/60 dark:bg-violet-950/30",
      text: "text-violet-600 dark:text-violet-400",
      badge: "bg-violet-100 dark:bg-violet-900/50",
    },
    emerald: {
      bar: "bg-emerald-500",
      bg: "bg-emerald-50/60 dark:bg-emerald-950/30",
      text: "text-emerald-600 dark:text-emerald-400",
      badge: "bg-emerald-100 dark:bg-emerald-900/50",
    },
  };
  const c = accentMap[accent] ?? accentMap.blue;

  return (
    <div
      id={id}
      className={`rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md ${
        isFilled && required ? "ring-1 ring-emerald-300/50 dark:ring-emerald-700/40" : ""
      }`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-2.5 border-b ${c.bg}`}>
        <div className="flex items-center gap-2">
          <div className={`w-1 h-4 rounded-full ${c.bar}`} />
          <span className={`text-xs font-bold uppercase tracking-wider ${c.text}`}>{label}</span>
          {hint && <span className="text-[10px] text-muted-foreground hidden sm:block">— {hint}</span>}
        </div>
        <div className="flex items-center gap-1.5">
          {required && !isFilled && (
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">Requis</span>
          )}
          {isFilled && (
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${c.badge} ${c.text}`}>✓</span>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="px-4 py-3">
        {singleLine ? (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="border-0 bg-transparent px-0 text-sm font-medium placeholder:text-muted-foreground/40 focus-visible:ring-0 h-auto shadow-none"
          />
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            placeholder={placeholder}
            className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none leading-relaxed"
          />
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export function ConsultationNotes() {
  const ctx = useConsultation();
  const [saveOpen, setSaveOpen] = useState(false);
  const [tplName, setTplName] = useState("");

  const handleSaveTemplate = () => {
    if (!tplName.trim()) {
      toast({ title: "Nom obligatoire", variant: "destructive" });
      return;
    }
    ctx.saveAsTemplate(tplName.trim());
    toast({ title: "Template enregistré ✓", description: tplName.trim() });
    setTplName("");
    setSaveOpen(false);
  };

  return (
    <main className="space-y-3 min-w-0">
      {/* ── Templates bar ─────────────────────────────────── */}
      <div className="rounded-2xl border bg-card shadow-sm p-3">
        <div className="flex items-center gap-2 mb-2.5">
          <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-xs font-semibold text-foreground">Templates rapides</span>
          <div className="flex-1" />
          <button
            onClick={() => ctx.setHistoryOpen(true)}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted/50"
          >
            <History className="h-3 w-3" /> Historique
          </button>
          <button
            onClick={() => {
              setTplName("");
              setSaveOpen(true);
            }}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-primary/5 border border-transparent hover:border-primary/20"
          >
            <Save className="h-3 w-3" /> Sauvegarder
          </button>
        </div>

        {ctx.templates.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            Aucun template. Remplissez les notes puis cliquez « Sauvegarder ».
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {ctx.templates.map((t) => (
              <div key={t.key} className="group relative flex items-center">
                <button
                  onClick={t.apply}
                  className={`pl-3 pr-7 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    t.isCustom
                      ? "text-primary bg-primary/5 border-primary/30 hover:bg-primary/10"
                      : "text-foreground bg-background border-border hover:bg-primary/5 hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {t.isCustom && <span className="text-[9px] text-primary/60 mr-1">★</span>}
                  {t.label}
                </button>
                {/* Delete — visible on hover pour tous les templates */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    ctx.deleteTemplate(t.key);
                    toast({ title: "Template supprimé", description: t.label });
                  }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-card border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:border-destructive hover:text-white text-muted-foreground shadow-sm"
                  title="Supprimer ce template"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 1. Motif ────────────────────────────────────────── */}
      <NoteSection
        id="notes"
        label="Motif de consultation"
        accent="blue"
        value={ctx.motif}
        onChange={ctx.setMotif}
        placeholder="Ex : Suivi diabète type 2 · Douleur thoracique · Fièvre depuis 3 jours…"
        singleLine
        required
      />

      {/* ── 2. Anamnèse ─────────────────────────────────────── */}
      <NoteSection
        label="Anamnèse / Symptômes"
        hint="Histoire de la maladie"
        accent="amber"
        value={ctx.symptoms}
        onChange={ctx.setSymptoms}
        placeholder="Évolution des symptômes, intensité, facteurs déclenchants, aggravants, soulageants, traitements déjà pris…"
        rows={4}
        required
      />

      {/* ── 3. Examen clinique ──────────────────────────────── */}
      <NoteSection
        label="Examen clinique"
        hint="Findings objectifs"
        accent="teal"
        value={ctx.examination}
        onChange={ctx.setExamination}
        placeholder="État général, auscultation cardiopulmonaire, palpation abdominale, examen neurologique, cutané, ORL…"
        rows={4}
        required
      />

      {/* ── 4. Diagnostic + Plan côte à côte ─────────────── */}
      <div className="grid gap-3 lg:grid-cols-2">
        <NoteSection
          label="Diagnostic"
          accent="violet"
          value={ctx.diagnosis}
          onChange={ctx.setDiagnosis}
          placeholder="Diagnostic principal, différentiel si pertinent…"
          rows={4}
          required
        />
        <NoteSection
          label="Plan / Conduite à tenir"
          accent="emerald"
          value={ctx.conclusion}
          onChange={ctx.setConclusion}
          placeholder="Traitement, examens complémentaires, conseils hygiéno-diététiques, suivi, orientation…"
          rows={4}
        />
      </div>

      {/* ── Save template dialog ─────────────────────────── */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sauvegarder comme template</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Le motif, l'anamnèse, le diagnostic et les analyses actuels seront sauvegardés pour vos prochaines
            consultations similaires.
          </p>
          <div className="space-y-2 py-2">
            <Label className="text-xs">Nom du template *</Label>
            <Input
              value={tplName}
              onChange={(e) => setTplName(e.target.value)}
              placeholder="Ex : Suivi grossesse T2 · Bilan annuel DT2…"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveTemplate();
              }}
              autoFocus
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSaveOpen(false)}>
              Annuler
            </Button>
            <Button className="gradient-primary text-primary-foreground" onClick={handleSaveTemplate}>
              <Save className="h-3.5 w-3.5 mr-1.5" /> Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
