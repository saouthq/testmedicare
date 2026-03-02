/**
 * ActionPalette — Composant Ctrl/Cmd+K unifié pour tout l'espace Médecin.
 * Design référence : PatientsPalette (overlay blur, sections groupées, hints, footer, bouton Fermer).
 *
 * Le parent fournit les `actions` déjà filtrées/construites.
 * Le composant gère l'index de navigation interne + le clavier.
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface ActionItem {
  id: string;
  label: string;
  hint?: string;
  icon?: ReactNode;
  group?: string;
  meta?: string;
  disabled?: boolean;
  onRun: () => void;
}

interface ActionPaletteProps {
  open: boolean;
  onClose: () => void;
  actions: ActionItem[];
  placeholder?: string;
  contextLabel?: string;
  contextAction?: () => void;
  query: string;
  onQueryChange: (v: string) => void;
}

const GROUP_ORDER_DEFAULT = [
  "Patients", "Patient", "Consultation", "Créer", "Dossier",
  "Communication", "Utilitaires", "Global", "Filtrer", "Trier",
  "Navigation", "Actions", "Ordonnances",
];

export default function ActionPalette({
  open, onClose, actions, placeholder = "Rechercher une action…",
  contextLabel, contextAction, query, onQueryChange,
}: ActionPaletteProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [idx, setIdx] = useState(0);

  // Reset index when actions or query change
  useEffect(() => { setIdx(0); }, [actions.length, query]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 30);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx(i => Math.min(i + 1, Math.max(0, actions.length - 1))); }
    if (e.key === "ArrowUp") { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)); }
    if (e.key === "Enter") {
      e.preventDefault();
      const a = actions[idx];
      if (a && !a.disabled) { onClose(); a.onRun(); }
    }
    if (e.key === "Escape") { e.preventDefault(); onClose(); }
  }, [actions, idx, onClose]);

  if (!open) return null;

  // Build grouped sections preserving order
  const groupMap = new Map<string, ActionItem[]>();
  for (const a of actions) {
    const g = a.group || "Actions";
    if (!groupMap.has(g)) groupMap.set(g, []);
    groupMap.get(g)!.push(a);
  }
  const orderedGroups = [...groupMap.keys()].sort((a, b) => {
    const ia = GROUP_ORDER_DEFAULT.indexOf(a);
    const ib = GROUP_ORDER_DEFAULT.indexOf(b);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });

  let cursor = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card rounded-xl border shadow-elevated w-full max-w-xl mx-4 animate-scale-in overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={query}
                onChange={e => onQueryChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="pl-10 h-10"
              />
            </div>
            {contextLabel && (
              <button
                className="rounded-lg border bg-muted px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground shrink-0"
                onClick={contextAction}
              >
                {contextLabel} · Changer
              </button>
            )}
            <span className="rounded-lg border bg-muted px-2 py-1 text-[11px] text-muted-foreground shrink-0">
              Ctrl+K
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[52vh] overflow-y-auto">
          {actions.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm font-medium text-foreground">Aucune action</p>
              <p className="text-xs text-muted-foreground mt-1">Essayez un autre terme de recherche.</p>
            </div>
          ) : (
            orderedGroups.map(group => {
              const items = groupMap.get(group)!;
              return (
                <div key={group} className="py-2">
                  <div className="px-4 py-1 text-[11px] font-semibold text-muted-foreground">{group}</div>
                  <div className="px-2">
                    {items.map(a => {
                      const i = cursor++;
                      const active = i === idx;
                      return (
                        <button
                          key={a.id}
                          disabled={a.disabled}
                          onMouseEnter={() => setIdx(i)}
                          onClick={() => { if (!a.disabled) { onClose(); a.onRun(); } }}
                          className={`w-full rounded-xl px-3 py-2 text-left transition-colors ${
                            a.disabled
                              ? "opacity-50 cursor-not-allowed"
                              : active
                                ? "bg-primary/10"
                                : "hover:bg-muted/60"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              {a.icon && <span className="text-muted-foreground shrink-0">{a.icon}</span>}
                              <span className="text-sm font-medium text-foreground truncate">{a.label}</span>
                            </div>
                            {a.hint && <span className="text-xs text-muted-foreground shrink-0">{a.hint}</span>}
                          </div>
                          {a.meta && <div className="text-[11px] text-muted-foreground truncate mt-0.5 pl-6">{a.meta}</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t flex items-center justify-between">
          <div className="text-xs text-muted-foreground">↑↓ naviguer · Entrée lancer · Esc fermer</div>
          <Button variant="outline" size="sm" className="text-xs" onClick={onClose}>Fermer</Button>
        </div>
      </div>
    </div>
  );
}
