import { useEffect, useCallback } from "react";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface ActionItem {
  id: string;
  label: string;
  hint?: string;
  icon?: LucideIcon;
  group?: string;
  onRun: () => void;
}

interface ActionPaletteProps {
  open: boolean;
  onClose: () => void;
  actions: ActionItem[];
  placeholder?: string;
}

/**
 * ActionPalette — Composant Cmd+K générique.
 * Affiche une palette d'actions searchable, groupée par `group`.
 */
const ActionPalette = ({ open, onClose, actions, placeholder = "Rechercher une action…" }: ActionPaletteProps) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handleKeyDown]);

  if (!open) return null;

  // Group actions
  const groups = new Map<string, ActionItem[]>();
  for (const action of actions) {
    const group = action.group || "Actions";
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(action);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative z-10 w-full max-w-lg rounded-xl border bg-popover shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Command className="rounded-xl">
          <CommandInput placeholder={placeholder} />
          <CommandList className="max-h-72">
            <CommandEmpty>Aucune action trouvée.</CommandEmpty>
            {Array.from(groups.entries()).map(([group, items]) => (
              <CommandGroup key={group} heading={group}>
                {items.map((action) => (
                  <CommandItem
                    key={action.id}
                    onSelect={() => { action.onRun(); onClose(); }}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    {action.icon && <action.icon className="h-4 w-4 text-muted-foreground" />}
                    <span className="flex-1">{action.label}</span>
                    {action.hint && (
                      <span className="text-xs text-muted-foreground">{action.hint}</span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
          <div className="border-t px-3 py-2 text-xs text-muted-foreground flex gap-4">
            <span>↑↓ Naviguer</span>
            <span>↵ Sélectionner</span>
            <span>Esc Fermer</span>
          </div>
        </Command>
      </div>
    </div>
  );
};

export default ActionPalette;
