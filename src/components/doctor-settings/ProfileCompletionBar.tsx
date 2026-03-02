/**
 * ProfileCompletionBar — Barre de progression "Profil : X%" + checklist.
 */
import { CheckCircle2, Circle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export interface CompletionItem {
  key: string;
  label: string;
  done: boolean;
  onClick?: () => void;
}

interface Props {
  items: CompletionItem[];
}

export default function ProfileCompletionBar({ items }: Props) {
  const done = items.filter(i => i.done).length;
  const pct = Math.round((done / items.length) * 100);

  return (
    <div className="rounded-xl border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Complétion du profil</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Complétez votre profil pour améliorer votre visibilité</p>
        </div>
        <span className={`text-2xl font-bold ${pct === 100 ? "text-accent" : "text-primary"}`}>{pct}%</span>
      </div>
      <Progress value={pct} className="h-2 mb-4" />
      <div className="grid gap-1.5 sm:grid-cols-2">
        {items.map(item => (
          <button
            key={item.key}
            onClick={item.onClick}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors text-left ${
              item.done ? "text-muted-foreground" : "text-foreground hover:bg-muted/50"
            }`}
          >
            {item.done
              ? <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />
              : <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            }
            <span className={item.done ? "line-through" : "font-medium"}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
