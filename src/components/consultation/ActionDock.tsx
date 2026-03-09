import {
  Activity, Bot, Calendar, CheckCircle2, Clock, FileSignature, FileText, Pill, Plus, Printer, Search, Stethoscope, Trash2, X,
} from "lucide-react";
import { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConsultation } from "./ConsultationContext";
import { scrollToId } from "./helpers";
import { mockMedicines } from "@/data/mockData";

/**
 * Common posology presets for quick selection
 */
const POSOLOGY_PRESETS = [
  { label: "1×/j", dosage: "1 comprimé par jour" },
  { label: "2×/j", dosage: "1 comprimé matin et soir" },
  { label: "3×/j", dosage: "1 comprimé 3 fois par jour" },
  { label: "SOS", dosage: "Si besoin (max 3/j)" },
];

const DURATION_PRESETS = ["3 jours", "5 jours", "7 jours", "10 jours", "14 jours", "1 mois", "3 mois"];

/**
 * Medicine database for autocomplete — combines mock medicines + common Tunisian meds
 */
const MED_DB = [
  ...mockMedicines.map(m => ({ name: `${m.name} ${m.dosage}`, form: m.form })),
  { name: "Amoxicilline 500mg", form: "Gélule" },
  { name: "Amoxicilline 1g", form: "Comprimé" },
  { name: "Augmentin 1g/125mg", form: "Comprimé" },
  { name: "Voltarène 75mg", form: "Comprimé" },
  { name: "Ibuprofène 400mg", form: "Comprimé" },
  { name: "Oméprazole 20mg", form: "Gélule" },
  { name: "Metformine 850mg", form: "Comprimé" },
  { name: "Amlodipine 5mg", form: "Comprimé" },
  { name: "Losartan 50mg", form: "Comprimé" },
  { name: "Atorvastatine 20mg", form: "Comprimé" },
  { name: "Lévothyroxine 50µg", form: "Comprimé" },
  { name: "Prednisolone 20mg", form: "Comprimé" },
  { name: "Céfixime 200mg", form: "Comprimé" },
  { name: "Ciprofloxacine 500mg", form: "Comprimé" },
  { name: "Azithromycine 500mg", form: "Comprimé" },
  { name: "Paracétamol 500mg", form: "Comprimé" },
  { name: "Tramadol 50mg", form: "Gélule" },
  { name: "Diclofénac 50mg", form: "Comprimé" },
  { name: "Pantoprazole 40mg", form: "Comprimé" },
];

/** Rx item with inline autocomplete */
function RxItemCard({ idx }: { idx: number }) {
  const ctx = useConsultation();
  const item = ctx.rxItems[idx];
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [medQuery, setMedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    const q = (medQuery || item.medication).toLowerCase();
    if (!q || q.length < 2) return [];
    return MED_DB.filter(m => m.name.toLowerCase().includes(q)).slice(0, 6);
  }, [medQuery, item.medication]);

  const selectMed = (name: string) => {
    ctx.updateRxItem(idx, "medication", name);
    setMedQuery("");
    setShowSuggestions(false);
  };

  return (
    <div className="rounded-xl border bg-card p-3 space-y-2 relative group">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center">
            <Pill className="h-3 w-3 text-primary" />
          </div>
          <span className="text-xs font-semibold text-foreground">#{idx + 1}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => ctx.removeRxItem(idx)}>
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>

      {/* Medication with autocomplete */}
      <div className="relative">
        <Label className="text-[11px] text-muted-foreground">Médicament</Label>
        <div className="relative mt-0.5">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={item.medication}
            onChange={e => { ctx.updateRxItem(idx, "medication", e.target.value); setMedQuery(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Rechercher un médicament…"
            className="h-8 text-xs pl-7"
          />
        </div>
        {/* Autocomplete dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-30 left-0 right-0 top-full mt-1 rounded-lg border bg-card shadow-elevated max-h-40 overflow-y-auto">
            {suggestions.map(s => (
              <button
                key={s.name}
                onMouseDown={() => selectMed(s.name)}
                className="w-full text-left px-3 py-2 text-xs hover:bg-muted/50 transition-colors flex items-center justify-between"
              >
                <span className="font-medium text-foreground">{s.name}</span>
                <span className="text-[10px] text-muted-foreground">{s.form}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Posology quick-select */}
      <div>
        <Label className="text-[11px] text-muted-foreground">Posologie</Label>
        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
          {POSOLOGY_PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => ctx.updateRxItem(idx, "dosage", p.dosage)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition-colors ${
                item.dosage === p.dosage
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/60"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <Input
          value={item.dosage}
          onChange={e => ctx.updateRxItem(idx, "dosage", e.target.value)}
          placeholder="Ou saisie libre…"
          className="h-7 text-xs mt-1"
        />
      </div>

      {/* Duration quick-select */}
      <div>
        <Label className="text-[11px] text-muted-foreground">Durée</Label>
        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
          {DURATION_PRESETS.map(d => (
            <button
              key={d}
              onClick={() => ctx.updateRxItem(idx, "duration", d)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition-colors ${
                item.duration === d
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/60"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div>
        <Label className="text-[11px] text-muted-foreground">Consignes</Label>
        <Input value={item.instructions} onChange={e => ctx.updateRxItem(idx, "instructions", e.target.value)} placeholder="Avant/après repas, à jeun…" className="h-7 text-xs mt-0.5" />
      </div>
    </div>
  );
}

export function ActionDock() {
  const ctx = useConsultation();

  return (
    <aside className="space-y-3">
      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        <div className="p-3 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" /> Action Dock
          </h3>
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
              <Button key={tab.key} variant={ctx.dockTab === tab.key ? "default" : "outline"} size="sm" className="h-8 text-xs" onClick={() => ctx.setDockTab(tab.key)}>
                <tab.icon className="h-3.5 w-3.5 mr-1" /> {tab.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="p-3">
          {/* ═══ Rx Tab — Improved ═══ */}
          {ctx.dockTab === "rx" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-foreground">Ordonnance ({ctx.rxItems.length})</p>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => ctx.openSlide("rx", 0)}>
                  <FileSignature className="h-3.5 w-3.5 mr-1" /> Finaliser
                </Button>
              </div>

              {/* Favorites quick-add */}
              <div className="rounded-lg border bg-muted/20 p-2">
                <p className="text-[10px] text-muted-foreground mb-1.5 font-medium">Favoris (1 clic)</p>
                <div className="flex flex-wrap gap-1.5">
                  {ctx.rxFavorites.map(f => (
                    <button key={f.label} onClick={() => ctx.addFavToRx(f)} className="px-2 py-1 rounded-lg border bg-background hover:bg-primary/5 hover:border-primary/30 text-xs transition-colors">{f.label}</button>
                  ))}
                </div>
              </div>

              {/* Medication cards */}
              <div className="space-y-2">
                {ctx.rxItems.map((_, idx) => (
                  <RxItemCard key={idx} idx={idx} />
                ))}
              </div>

              <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={ctx.addRxItem}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Ajouter un médicament
              </Button>

              {ctx.rxSignedAt && (
                <div className="rounded-lg border bg-accent/5 border-accent/20 p-2.5 text-xs text-muted-foreground">
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
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => ctx.openSlide("labs", 1)}>
                    <FileSignature className="h-3.5 w-3.5 mr-1" /> Envoyer
                  </Button>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => ctx.doPrint("Prescription d'analyses", ctx.labsPrintHtml)}>
                    <Printer className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Input value={ctx.newAnalyse} onChange={e => ctx.setNewAnalyse(e.target.value)} placeholder="Ajouter une analyse…" className="h-8 text-xs"
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); ctx.addAnalyse(); } }} />
                <Button variant="outline" size="sm" className="h-8" onClick={() => ctx.addAnalyse()}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              {ctx.labSuggestions.length > 0 && (
                <div className="rounded-lg border bg-muted/20 p-2">
                  <p className="text-[10px] text-muted-foreground mb-1.5">Suggestions (1 clic)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ctx.labSuggestions.slice(0, 10).map(s => (
                      <button key={s} onClick={() => ctx.addAnalyse(s)} className="px-2 py-1 rounded-lg border bg-background hover:bg-muted/60 text-xs">{s}</button>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-1.5">
                {ctx.analyses.map(a => (
                  <div key={a} className="flex items-center justify-between rounded-lg border bg-card px-3 py-1.5">
                    <span className="text-xs text-foreground">{a}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => ctx.removeAnalyse(a)}>
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Docs */}
          {ctx.dockTab === "docs" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Documents à générer</p>
              <div className="space-y-1.5">
                {([
                  { type: "report" as const, icon: FileText, label: "Compte-rendu", color: "text-primary", signed: ctx.reportSignedAt },
                  { type: "certificate" as const, icon: FileSignature, label: "Certificat", color: "text-warning", signed: ctx.certSignedAt },
                  { type: "sickleave" as const, icon: Calendar, label: "Arrêt de travail", color: "text-primary", signed: ctx.slSignedAt },
                  { type: "rdv" as const, icon: Clock, label: "Planifier RDV", color: "text-primary", signed: ctx.rdvConfirmedAt },
                ]).map(d => (
                  <Button key={d.type} variant="outline" size="sm" className="w-full justify-start text-xs h-8" onClick={() => ctx.openSlide(d.type, 0)}>
                    <d.icon className={`h-3.5 w-3.5 mr-2 ${d.color}`} /> {d.label}
                    {d.signed && <span className="ml-auto text-[11px] text-accent">{d.type === "rdv" ? "OK" : "Signé"}</span>}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          {ctx.dockTab === "tasks" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Checklist (auto)</p>
              <div className="space-y-1.5">
                {([
                  { label: "Constantes", ok: ctx.completion.vitalsOk, action: () => ctx.setLeftCollapsed(false), actionLabel: "Remplir" },
                  { label: "Notes", ok: ctx.completion.notesOk, action: () => scrollToId("notes"), actionLabel: "Compléter" },
                  { label: "Ordonnance", ok: ctx.completion.rxOk, action: () => ctx.setDockTab("rx"), actionLabel: "Ajouter" },
                  { label: "Signer / Envoyer", ok: !!(ctx.rxSignedAt || ctx.reportSignedAt), action: () => ctx.openSlide("rx", 0), actionLabel: "Ouvrir" },
                ]).map(t => (
                  <div key={t.label} className="flex items-center justify-between rounded-lg border bg-card px-3 py-2">
                    <span className="text-xs text-foreground">{t.label}</span>
                    {t.ok ? (
                      <span className="text-xs text-accent font-semibold">OK</span>
                    ) : (
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={t.action}>{t.actionLabel}</Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-xl border bg-card p-3 shadow-card">
        <p className="text-[11px] text-muted-foreground mb-2">Actions rapides</p>
        <div className="grid gap-1.5">
          <Button variant="outline" size="sm" className="w-full text-xs justify-start h-8" onClick={() => ctx.openSlide("rdv", 0)}>
            <Calendar className="h-3.5 w-3.5 mr-2 text-primary" /> Planifier prochain RDV
          </Button>
          <Button variant="outline" size="sm" className="w-full text-xs justify-start h-8" onClick={() => ctx.openSlide("certificate", 0)}>
            <FileSignature className="h-3.5 w-3.5 mr-2 text-warning" /> Certificat médical
          </Button>
          <Button variant="outline" size="sm" className="w-full text-xs justify-start h-8" onClick={() => ctx.setPaletteOpen(true)}>
            <Bot className="h-3.5 w-3.5 mr-2 text-primary" /> Palette (Ctrl+K)
          </Button>
        </div>
      </div>
    </aside>
  );
}
