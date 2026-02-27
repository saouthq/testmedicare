/**
 * PatientDetailActions — Palette d'actions (Ctrl+K) du dossier patient.
 * Même design que la page consultation.
 */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { usePatientDetail } from "./PatientDetailContext";

export default function PatientDetailActions() {
  const { actionsOpen, setActionsOpen, actionsQ, setActionsQ, actionsIndex, setActionsIndex, actionsInputRef, actions } = usePatientDetail();

  if (!actionsOpen) return null;

  const order = ["Consultation", "Créer", "Dossier", "Communication", "Utilitaires"] as const;
  const groups = order
    .map((g) => ({ g, items: actions.filter((a) => a.group === g) }))
    .filter((x) => x.items.length > 0);

  let cursor = 0;

  return (
    <div className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm" onClick={() => setActionsOpen(false)}>
      <div className="max-w-lg w-[92%] mx-auto mt-24 rounded-xl border bg-card shadow-elevated" onClick={(e) => e.stopPropagation()}>
        <div className="p-3 border-b flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input ref={actionsInputRef} value={actionsQ}
            onChange={(e) => { setActionsQ(e.target.value); setActionsIndex(0); }}
            placeholder="Rechercher une action… (ex: ordonnance, analyses, doc, notes)" className="h-9"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setActionsIndex((i) => Math.min(i + 1, Math.max(0, actions.length - 1))); }
              if (e.key === "ArrowUp") { e.preventDefault(); setActionsIndex((i) => Math.max(i - 1, 0)); }
              if (e.key === "Enter") { e.preventDefault(); const a = actions[actionsIndex]; if (!a) return; setActionsOpen(false); a.run(); }
              if (e.key === "Escape") { e.preventDefault(); setActionsOpen(false); }
            }} />
          <span className="text-[11px] text-muted-foreground px-2 py-1 rounded-full bg-muted">Ctrl+K</span>
        </div>

        <div className="p-2">
          {actions.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">Aucune action.</div>
          ) : (
            <div className="space-y-2">
              {groups.map((grp) => (
                <div key={grp.g} className="space-y-1">
                  <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-muted-foreground">{grp.g}</div>
                  {grp.items.map((a) => {
                    const i = cursor++;
                    return (
                      <button key={a.id} type="button"
                        className={i === actionsIndex
                          ? "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-muted"
                          : "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl hover:bg-muted/60"}
                        onMouseEnter={() => setActionsIndex(i)}
                        onClick={() => { setActionsOpen(false); a.run(); }}>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-muted-foreground">{a.icon}</span>
                          <span className="text-sm font-medium text-foreground truncate">{a.label}</span>
                        </div>
                        {a.hint ? <span className="text-xs text-muted-foreground">{a.hint}</span> : null}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t flex items-center justify-between text-xs text-muted-foreground">
          <span>↑ ↓ pour naviguer · Entrée pour lancer · Esc pour fermer</span>
          <Button variant="ghost" size="sm" className="h-8" onClick={() => setActionsOpen(false)}>Fermer</Button>
        </div>
      </div>
    </div>
  );
}
