import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface StatsGridItem {
  label: string;
  value: string;
  icon?: LucideIcon;
  change?: string;
  color?: string;
}

interface StatsGridProps {
  items: StatsGridItem[];
  columns?: 2 | 3 | 4;
}

/**
 * StatsGrid — Grille de stats cards uniforme.
 * Utilisé dans Dashboard, Consultations, Prescriptions, etc.
 */
const StatsGrid = ({ items, columns = 4 }: StatsGridProps) => {
  return (
    <div className={cn(
      "grid gap-4",
      columns === 2 && "grid-cols-1 sm:grid-cols-2",
      columns === 3 && "grid-cols-1 sm:grid-cols-3",
      columns === 4 && "grid-cols-2 lg:grid-cols-4",
    )}>
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              {item.icon && <item.icon className="h-4 w-4 text-muted-foreground" />}
            </div>
            <p className={cn("text-2xl font-bold mt-1", item.color)}>{item.value}</p>
            {item.change && (
              <p className="text-xs text-muted-foreground mt-1">{item.change}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsGrid;
