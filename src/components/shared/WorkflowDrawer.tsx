import type { ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface WorkflowDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  step: number;
  totalSteps: number;
  stepLabels: string[];
  footer: ReactNode;
  children: ReactNode;
}

/**
 * WorkflowDrawer — Sheet multi-étapes réutilisable.
 * Affiche un stepper + contenu scrollable + footer fixe.
 */
const WorkflowDrawer = ({
  open,
  onClose,
  title,
  step,
  totalSteps,
  stepLabels,
  footer,
  children,
}: WorkflowDrawerProps) => {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="text-base">{title}</SheetTitle>
          <SheetDescription className="sr-only">{title}</SheetDescription>
          {/* Stepper */}
          <div className="flex items-center gap-2 mt-3">
            {stepLabels.map((label, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div
                  className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium border-2 shrink-0",
                    i + 1 < step && "bg-primary text-primary-foreground border-primary",
                    i + 1 === step && "border-primary text-primary",
                    i + 1 > step && "border-muted text-muted-foreground",
                  )}
                >
                  {i + 1}
                </div>
                <span className={cn(
                  "text-xs truncate",
                  i + 1 === step ? "text-foreground font-medium" : "text-muted-foreground",
                )}>
                  {label}
                </span>
                {i < totalSteps - 1 && (
                  <div className={cn(
                    "h-px flex-1",
                    i + 1 < step ? "bg-primary" : "bg-border",
                  )} />
                )}
              </div>
            ))}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          {children}
        </ScrollArea>

        <div className="border-t px-6 py-4 flex justify-end gap-2">
          {footer}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default WorkflowDrawer;
