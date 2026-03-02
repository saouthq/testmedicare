/**
 * ProfileSection — Section éditable générique.
 * Affiche un titre, un résumé, et un bouton "Modifier".
 */
import type { LucideIcon } from "lucide-react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

interface Props {
  icon: LucideIcon;
  title: string;
  summary?: string;
  children?: ReactNode;
  onEdit: () => void;
}

export default function ProfileSection({ icon: Icon, title, summary, children, onEdit }: Props) {
  return (
    <div className="rounded-xl border bg-card shadow-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </h3>
        <Button variant="outline" size="sm" className="text-xs" onClick={onEdit}>
          <Pencil className="h-3 w-3 mr-1" />Modifier
        </Button>
      </div>
      {summary && !children && <p className="text-sm text-muted-foreground">{summary}</p>}
      {children}
    </div>
  );
}
